import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { importBatch, validateBatch, compileEdition, recordReview, sealBatch, questionHash } from '../content/factory.mjs';
import { verifyEdition } from '../src/content-contract.mjs';
import { promptText } from '../public/i18n.mjs';
import { matchAnswer, normalize, TIERS } from '../public/rules.mjs';
import worker from '../src/worker.mjs';
import { service, installEdition } from './helpers.mjs';
import { approveFixture, englishFixture } from './content-fixtures.mjs';

const readJSON=async path=>JSON.parse(await readFile(new URL('../'+path,import.meta.url),'utf8'));
const raw=await readJSON('content/incoming/pilot-nl.json');
const reviewed=await readJSON('content/reviewed/pilot-nl-v1.json');
const edition=await readJSON('content/editions/pilot-nl-v1.json');

test('pilot import discards self-approvals; schema validity is not factual completeness',async()=>{
  const {batch,report}=await importBatch(reviewed);
  assert.equal(report.ok,true);assert.equal(report.questions,21);assert.equal(report.answers,284);
  assert.ok(report.warnings.some(w=>w.code==='fact-review'));
  assert.ok(report.warnings.some(w=>w.code==='open-coverage'));
  assert.equal(batch.questions[0].reviews.content,undefined);
  assert.ok(batch.questions.every(q=>!q.reviews?.content?.human));
  await assert.rejects(()=>compileEdition(batch),/Insufficient/);
});

test('invalid fixtures block collisions, missing data, unknown rules, unsafe text and stale approvals',async()=>{
  for(const value of [null,[],{}, {...raw,questions:[null]}, {...raw,questions:'not-an-array'}])assert.equal((await importBatch(value)).report.ok,false,'malformed input returns a report, not an unhandled exception');
  for(const fixture of await readJSON('tests/fixtures/content-invalid.json')) {
    let b=structuredClone(reviewed),q=b.questions[0];
    if(fixture.change==='alias-collision')q.answers[1].aliases=[q.answers[0].answer.toUpperCase()];
    if(fixture.change==='implicit-alias'){q.answers[0].answer='Mashed potatoes';q.answers[1].answer='mash';}
    if(fixture.change==='tier')q.answers[0].tier='mythic';
    if(fixture.change==='answers')q.answers=[];
    if(fixture.change==='constraint')q.constraints={type:'ends-with',letter:'e'};
    if(fixture.change==='unsafe')q.text='<img src=x onerror=alert(1)>';
    if(fixture.change==='concept')q.answers[1].conceptId=q.answers[0].conceptId;
    if(fixture.change==='review')q.reviews.content.ai.contentHash='0'.repeat(64);
    else b=await sealBatch(b);
    const report=await validateBatch(b);
    assert.equal(report.ok,false,fixture.name);
    assert.ok(report.errors.some(e=>e.code===fixture.expected),fixture.name);
  }
  const b=structuredClone(raw);b.questions[1].text=b.questions[0].text;
  assert.equal((await importBatch(b)).report.ok,false);
  assert.equal((await importBatch(raw,[{...reviewed.questions[0],questionId:'other-id'}])).report.ok,false);
  const variant=structuredClone(raw);variant.questions[1]={...structuredClone(variant.questions[0]),questionId:'nl-instrument-variant',text:'Welk muziekinstrument ken je?'};
  assert.ok((await importBatch(variant)).report.warnings.some(w=>w.code==='possible-variant'));
});

test('length policy counts ij as two, removes accents/separators, forbids digits and wrong aliases',async()=>{
  assert.equal(normalize('ĳ'),'ij');assert.equal(normalize('é-é'),'ee');
  const answers=[{answer:'hond',tier:'plankton',aliases:[]}],validation={type:'canonical-length',length:4};
  assert.equal(matchAnswer('hondd',answers,validation,'nl'),null,'existing early input-length rejection');
  assert.equal(matchAnswer('h nod',answers,validation,'nl').correction,true,'existing normalization/fuzzy behavior retained');
  for(const alias of ['kat','hond1']) {
    const b=structuredClone(raw);b.questions.at(-1).answers[0].aliases=[alias];
    assert.ok((await importBatch(b)).report.errors.some(e=>e.code==='length'));
  }
  const b=structuredClone(raw);b.questions.at(-1).constraints.letterPolicy='ij-counts-as-one';
  assert.ok((await importBatch(b)).report.errors.some(e=>e.code==='constraint'));
});

test('question edits revoke every approval; versions and reviewer identity are enforced',async()=>{
  for(const mutate of [q=>q.text+=' Nu.',q=>q.answers[0].tier='rare',q=>q.answers[0].aliases.push('alternatief'),q=>q.constraints={type:'canonical-length',length:4,letterPolicy:'normalized-latin-letters-v1'}]){
    const b=structuredClone(reviewed);mutate(b.questions[0]);
    assert.equal((await validateBatch(b)).ok,false);
    const sealed=await sealBatch(b);assert.deepEqual(sealed.questions[0].reviews,{});
    assert.ok((await validateBatch(sealed,reviewed.questions)).errors.some(e=>e.code==='version-reuse'));
  }
  await assert.rejects(()=>recordReview(reviewed,{stage:'content',kind:'human',reviewer:'Codex',questions:[]}),/Models/);
  await assert.rejects(()=>recordReview(reviewed,{stage:'content',kind:'ai',reviewer:'test',questions:[{questionId:raw.questions[0].questionId,contentHash:'0'.repeat(64),status:'pass',issues:[]}]}),/stale/);
});

test('compiler deterministic, diversity-aware, refuses repetition and low maximum; frozen export is compact',async()=>{
  assert.deepEqual(await compileEdition(reviewed),edition);
  const reordered=structuredClone(reviewed);reordered.questions.reverse();
  assert.deepEqual(await compileEdition(reordered),edition);
  assert.equal(edition.maximumScore,700);assert.equal(edition.prompts.length,7);
  await verifyEdition(edition);
  const changed=structuredClone(edition);changed.prompts[0].answers[0].tier='rare';
  await assert.rejects(()=>verifyEdition(changed),/hash mismatch/);
  await assert.rejects(()=>compileEdition(reviewed,{recent:edition.prompts.map(p=>p.id)}),/Insufficient/);
  assert.ok(!JSON.stringify(edition).includes('reviewer'));
  assert.ok(!JSON.stringify(edition).includes('raritySource'));
  for(const p of edition.prompts)assert.ok(p.answers.every(a=>TIERS[a.tier]));
});

test('independent NL/EN editions coexist on the same date and all four interface combinations keep their answer bank',async()=>{
  const en=await englishFixture(),s=service();
  await installEdition(s.env.DB,edition);await installEdition(s.env.DB,en);
  assert.equal(edition.date,en.date);
  for(const interfaceLanguage of ['nl','en'])for(const e of [edition,en]) {
    const start=await s.call('/api/start',{practice:true,editionId:e.editionId,answerLanguage:e.answerLanguage,interfaceLanguage});
    assert.equal(start.status,200);assert.equal(start.body.editionId,e.editionId);
    assert.equal(start.body.answerLanguage,e.answerLanguage);
    assert.equal(start.body.interfaceLanguage,interfaceLanguage);
    for(const prompt of start.body.prompts) {
      const display=promptText(prompt,interfaceLanguage,e.answerLanguage);
      assert.ok(display.startsWith(interfaceLanguage==='nl'?'Noem':'Name'));
      if(interfaceLanguage!==e.answerLanguage)assert.match(display,interfaceLanguage==='nl'?/antwoord in het Engels/:/answer in Dutch/);
      assert.equal(prompt.answers,undefined);assert.equal(prompt.reviews,undefined);
    }
    const first=e.prompts[0].answers[0];
    const result=await s.call('/api/answer',{runId:start.body.runId,round:0,answer:first.answer,confirm:true});
    assert.equal(result.body.result.score,TIERS[first.tier].score);
  }
  const html=await (await worker.fetch(new Request('http://localhost:3051/?lang=en&answers=nl'),s.env,{})).text();
  assert.match(html,/"answerLanguage":"nl"/);
  s.env.DB.close();
});

test('seven-round local run stays pinned across edition B, new worker instance and altered active selection',async()=>{
  const s=service();await installEdition(s.env.DB,edition);
  const started=await s.call('/api/start',{practice:true,interfaceLanguage:'nl',answerLanguage:'nl',editionId:edition.editionId});
  assert.equal(started.status,200);const runId=started.body.runId;
  assert.equal((await s.call('/api/review?run='+runId)).status,403);
  const stranger=service({DB:s.env.DB});
  assert.equal((await stranger.call('/api/state?run='+runId)).status,404);
  const changed=structuredClone(raw);changed.batchId='pilot-v2';
  // Different scores and a removed canonical answer must not affect run A.
  for(const q of changed.questions){q.version++;if(q.answers[0].tier!=='krillion')q.answers[0].tier='rare';}
  changed.questions.find(q=>q.questionId===edition.prompts[0].id).answers.shift();
  const second=await importBatch(changed,reviewed.questions);assert.equal(second.report.ok,true);
  const editionB=await compileEdition(await approveFixture(second.batch));
  await installEdition(s.env.DB,editionB);
  assert.notEqual(editionB.editionId,edition.editionId);
  await assert.rejects(async()=>s.env.DB.prepare('UPDATE content_editions SET content=? WHERE id=?').bind('{}',edition.editionId).run(),/immutable/);
  const rebooted=(await import('../src/worker.mjs?restart=pinning')).default;
  const response=await rebooted.fetch(new Request('http://localhost:3051/api/state?run='+runId,{headers:{Cookie:s.cookie()}}),s.env,{});
  assert.equal((await response.json()).editionId,edition.editionId);
  let score=0;
  for(let i=0;i<7;i++) {
    const a=edition.prompts[i].answers[0];score+=TIERS[a.tier].score;
    const result=await s.call('/api/answer',{runId,round:i,answer:a.answer,confirm:true,editionId:editionB.editionId,score:9000});
    assert.equal(result.status,200);assert.equal(result.body.result.score,TIERS[a.tier].score);
    assert.equal(result.body.state.editionId,edition.editionId);
    const duplicate=await s.call('/api/answer',{runId,round:i,answer:a.answer});assert.equal(duplicate.body.alreadyScored,true);
    if(i<6)await s.call('/api/next',{runId});
  }
  const state=await s.call('/api/state?run='+runId);assert.equal(state.body.score,score);assert.equal(state.body.completed,true);
  const review=await s.call('/api/review?run='+runId);assert.equal(review.status,200);
  assert.equal(review.body.population,0);
  for(let i=0;i<7;i++)assert.deepEqual(review.body.prompts[i].answers.map(a=>a.answer).sort(),edition.prompts[i].answers.map(a=>a.answer).sort());
  assert.equal((await stranger.call('/api/review?run='+runId)).status,403);
  const publicToday=await s.call('/api/today?answerLanguage=nl&edition='+edition.editionId);
  assert.ok(publicToday.body.prompts.every(p=>!p.answers && !p.validation && !p.contentHash));
  s.env.DB.close();
});

test('production refuses previews; invalid, missing or corrupt pinned editions never fall back',async()=>{
  const s=service();await installEdition(s.env.DB,edition);
  assert.equal((await s.call('/api/start',{editionId:edition.editionId,answerLanguage:'nl'})).status,400);
  assert.equal((await s.call('/api/start',{practice:true,editionId:edition.editionId,answerLanguage:'en'})).status,409);
  assert.equal((await s.call('/api/start',{practice:true,editionId:'../../secret',answerLanguage:'nl'})).status,409);
  const g=await s.call('/api/start',{practice:true,editionId:edition.editionId,answerLanguage:'nl'});
  s.env.LOCAL_DEVELOPMENT='false';
  assert.equal((await s.call('/api/start',{practice:true,editionId:edition.editionId,answerLanguage:'nl'})).status,403);
  assert.equal((await s.call('/api/today?answerLanguage=nl&edition='+edition.editionId)).status,403);
  s.env.DB.exec('DROP TRIGGER content_editions_immutable_update');
  await s.env.DB.prepare('UPDATE content_editions SET content=? WHERE id=?').bind('{}',edition.editionId).run();
  const broken=await s.call('/api/state?run='+g.body.runId+'&lang=nl');
  assert.equal(broken.status,409);assert.match(broken.body.error,/inhoudsversie/);
  s.env.DB.exec('DROP TRIGGER content_editions_immutable_delete');
  await assert.rejects(async()=>s.env.DB.prepare('DELETE FROM content_editions WHERE id=?').bind(edition.editionId).run(),/FOREIGN KEY/);
  // Simulate an out-of-band damaged restore, not a supported deletion operation.
  s.env.DB.exec('PRAGMA foreign_keys=OFF');
  await s.env.DB.prepare('DELETE FROM content_editions WHERE id=?').bind(edition.editionId).run();
  assert.equal((await s.call('/api/state?run='+g.body.runId)).status,409);
  s.env.DB.close();
});

test('legacy English and Dutch answer files remain byte-identical to audited commit',async()=>{
  const baselineHashes={'src/demo.mjs':'f452777a4f6547511aaa334c88cd53a0f3d376681c00301691e0e3de519bbfdc','src/dutch.mjs':'f1ddbc18711887fbec6b0747a0d04be335b55c156e93e455950b199d8aa4cd16'};
  for(const path of ['src/demo.mjs','src/dutch.mjs']) {
    const current=await readFile(new URL('../'+path,import.meta.url));
    const hash=b=>createHash('sha256').update(b).digest('hex');
    assert.equal(hash(current),baselineHashes[path],path);
  }
});
