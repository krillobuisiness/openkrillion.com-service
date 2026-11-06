import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { englishFixture } from '../tests/content-fixtures.mjs';
import { promptText } from '../public/i18n.mjs';

const base=process.argv[2] || 'http://localhost:3051',output='output/content/browser';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw new Error('This audit installs local preview fixtures; use localhost only');
await mkdir(output,{recursive:true});
const nl=JSON.parse(await readFile('content/editions/pilot-nl-v1.json','utf8'));
const en=await englishFixture();
await writeFile('output/content/en-fixture.json',JSON.stringify(en,null,2));
for(const file of ['content/editions/pilot-nl-v1.json','output/content/en-fixture.json'])execFileSync(process.execPath,['scripts/content.mjs','preview','--file',file],{stdio:'pipe'});
const browser=await chromium.launch({headless:true,channel:'chrome'}),errors=[],report=[];
async function snapshot(page){return page.evaluate(()=>JSON.parse(window.render_game_to_text()));}
async function next(page,target) {
  const deadline=Date.now()+10000;
  while(Date.now()<deadline){
    if((await snapshot(page)).phase===target)return;
    await page.locator('#next-btn').evaluate(button=>button.click());
    try{await page.waitForFunction(phase=>JSON.parse(window.render_game_to_text()).phase===phase,target,{timeout:200});return;}catch{}
  }
  throw new Error(`Next transition stalled: ${JSON.stringify(await snapshot(page))}`);
}
try {
  for(const locale of ['nl','en'])for(const edition of [nl,en]) {
    const label=`${locale}-${edition.answerLanguage}`,mobile=locale==='en';
    const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile});
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push({label,error:error.message}));
    page.on('console',m=>{if(m.type()==='error')errors.push({label,error:m.text()});});
    page.on('response',response=>{if(response.status()>=400)errors.push({label,status:response.status(),url:response.url()});});
    const url=`${base}/?test=1&lang=${locale}&answers=${edition.answerLanguage}&edition=${edition.editionId}`;
    const boot=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/today');
    await page.goto(url);const today=await (await boot).json();assert.equal(today.editionId,edition.editionId);
    assert.ok(today.prompts.every(p=>!p.answers && !p.reviews));
    await page.waitForFunction(()=>window.render_game_to_text);
    await page.screenshot({path:`${output}/${label}-home.png`});
    // The existing intro gently moves every frame. Click its real hit-tested
    // centre instead of waiting for Playwright's two-frame geometry stability.
    const point=await page.locator('#start-btn').evaluate(button=>{const r=button.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,hit:button.contains(document.elementFromPoint(x,y)),disabled:button.disabled};});
    assert.ok(point.hit&&!point.disabled,'visible start button receives the pointer');
    const [started]=await Promise.all([page.waitForResponse(r=>new URL(r.url()).pathname==='/api/start'),mobile?page.touchscreen.tap(point.x,point.y):page.mouse.click(point.x,point.y)]);
    const start=await started.json();
    assert.equal(start.mode,'practice');assert.equal(start.editionId,edition.editionId);
    assert.equal(start.interfaceLanguage,locale);assert.equal(start.answerLanguage,edition.answerLanguage);
    for(let round=0;round<7;round++) {
      await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).phase==='preview');
      assert.equal(await page.locator('#prompt-text').innerText(),promptText(edition.prompts[round],locale,edition.answerLanguage));
      await page.evaluate(()=>window.advanceTime(3100));
      await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).phase==='answering');
      if(round===0) {
        await page.screenshot({path:`${output}/${label}-answer.png`});
        const rejected=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/answer');
        await page.locator('#answer').fill('zzzzzzzzzz');await page.locator('#submit-btn').click();
        assert.equal((await (await rejected).json()).rejected,true);
        await page.waitForFunction(()=>!document.getElementById('submit-btn').disabled);
      }
      const chosen=edition.prompts[round].answers.find(a=>a.tier==='krillion');
      await page.locator('#answer').fill(chosen.answer);
      const scored=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/answer');
      await page.locator('#submit-btn').click();const response=await (await scored).json();
      assert.equal(response.result.score,100);assert.equal(response.state.editionId,edition.editionId);
      await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).phase==='landed');
      console.log(`${label}: round ${round+1}/7 scored`);
      await next(page,round===6?'done':'preview');
    }
    await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).score===700);
    await page.waitForFunction(()=>document.querySelectorAll('.review-question').length===7);
    const state=await snapshot(page);assert.equal(state.results.length,7);assert.equal(state.targetScore,700);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.locator('[data-review="0"]').click();
    await page.waitForFunction(()=>document.querySelector('.review-expanded .review-list'));
    assert.ok((await page.locator('.review-list').innerText()).includes(edition.prompts[0].answers.find(a=>a.tier==='krillion').answer));
    await page.screenshot({path:`${output}/${label}-results.png`});
    await page.reload();await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).phase==='done');
    assert.equal((await snapshot(page)).score,700);
    report.push({interfaceLanguage:locale,answerLanguage:edition.answerLanguage,editionId:edition.editionId,viewport:page.viewportSize(),rounds:7,score:700,reload:true,review:true,errors:0});
    await context.close();
  }
  assert.deepEqual(errors,[]);
  await writeFile(output+'/report.json',JSON.stringify({report,errors},null,2));
  console.log(JSON.stringify({ok:true,output,combinations:report.length}));
} finally {await browser.close();}
