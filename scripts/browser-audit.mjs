import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base=process.argv[2]||'http://localhost:3051';
const output=process.argv[3]||'output/playwright/audit';
const locale=process.argv[4]||'en';
assert.ok(['en','nl'].includes(locale),`unsupported interface locale: ${locale}`);
// This audit covers interface localization; keep its deterministic English
// answer fixtures paired with the English bank in either UI locale.
const pageUrl=()=>`${base}/?test=1&lang=${locale}&answers=en`;
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
const errors=[],report=[];
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text()+' '+m.location().url)});page.on('response',r=>{if(r.status()>=500)console.log('HTTP failure',r.status(),r.url())});
  const ssrResponse=await fetch(pageUrl());assert.equal(ssrResponse.status,200);const ssrHtml=await ssrResponse.text();
  assert.match(ssrHtml,new RegExp(`<html[^>]*lang="${locale}"`));
  assert.ok(ssrHtml.includes(locale==='nl'?'▼ DUIK NAAR BENEDEN ▼':'▼ BEGIN DESCENT ▼'),'server-rendered CTA matches selected locale');
  await page.goto(pageUrl());await page.waitForFunction(()=>window.render_game_to_text);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(400);
  assert.equal(await page.locator('html').getAttribute('lang'),locale);
  assert.ok((await page.locator('#start-btn').innerText()).includes(locale==='nl'?'DUIK NAAR BENEDEN':'BEGIN DESCENT'));
  await page.screenshot({path:output+'/desktop-home.png'});
  assert.equal(await page.locator('#guide').getAttribute('open'),null);
  await page.locator('#guide-link').click();assert.ok(await page.locator('.guide-sheet').isVisible());
  const links=await page.locator('.ai-links a').evaluateAll(as=>as.map(a=>({href:a.href,target:a.target,rel:a.rel})));assert.equal(links.length,5);assert.equal(new Set(links.map(a=>new URL(a.href).searchParams.get('q'))).size,1);assert.ok(links.every(a=>a.target==='_blank'&&a.rel.includes('nofollow')));
  // Intercept external destinations; no AI question is actually submitted.
  await context.route(/https:\/\/(chatgpt\.com|claude\.ai|www\.perplexity\.ai|www\.google\.com|grok\.com)\//,r=>r.fulfill({status:200,contentType:'text/plain',body:'External AI request intercepted for audit'}));
  const popupPromise=page.waitForEvent('popup');await page.locator('.ai-links a').first().click();const popup=await popupPromise;await popup.waitForLoadState();assert.equal(new URL(popup.url()).hostname,'chatgpt.com');await popup.close();
  await page.screenshot({path:output+'/desktop-guide.png'});await page.locator('#close-guide').click();
  await page.locator('#menu-btn').click();assert.ok(await page.locator('#menu-dialog').isVisible());await page.locator('#menu-dialog [data-close]').click();
  const local=base.includes('localhost');
  await page.locator('#practice-btn').click({force:true});await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).phase==='preview');
  if(local)await page.evaluate(()=>window.advanceTime(3100));else await page.waitForTimeout(3200);
  await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).phase==='answering');
  await page.waitForTimeout(450);await page.screenshot({path:output+'/desktop-answer.png'});
  await page.locator('#answer').fill('zzzzzzzzzz');await page.locator('#answer').press('Enter');await page.waitForFunction(lang=>document.getElementById('answer-status').textContent.includes(lang==='nl'?'Geen match':'No match'),locale);
  await page.locator('#answer').fill('mashed');await page.locator('#answer').press('Enter');await page.waitForFunction(lang=>document.getElementById('answer-status').textContent.includes(lang==='nl'?'Bedoelde je':'Did you mean'),locale);assert.equal(await page.locator('#answer').inputValue(),'Mashed potatoes');
  await page.locator('#answer').press('Enter');await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).phase==='landed',{timeout:15000});
  await page.waitForTimeout(1000);await page.screenshot({path:output+'/desktop-landing.png'});
  const answers=['Mara','Bob Pettit','Yttrium','Ghost station','France','Great Lakes Avengers'];
  for(let i=0;i<answers.length;i++){
    await advanceRound(page,i+1);
    console.log(`${locale}: entered round ${i+2}`);
    if(local)await page.evaluate(()=>window.advanceTime(3100));else await page.waitForTimeout(3200);
    await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).phase==='answering');
    const answerResponse=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/answer',{timeout:10000}).catch(async error=>{const state=await page.evaluate(()=>JSON.parse(window.render_game_to_text()));throw new Error(`No answer request in round ${i+2} (phase=${state.phase}, paused=${state.paused}, draft=${JSON.stringify(state.draft)}, seconds=${state.seconds}): ${error.message}`)});
    if(i===5&&local){await page.locator('#answer').fill('');await page.evaluate(()=>window.advanceTime(30000));}else{await page.locator('#answer').fill(answers[i]);await page.locator('#submit-btn').click();}
    const scored=await answerResponse;assert.equal(scored.status(),200,`round ${i+2} answer request failed with HTTP ${scored.status()}`);
    await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).phase==='landed',{timeout:20000});
    console.log(`${locale}: landed round ${i+2}`);
  }
  await finishResults(page);console.log(`${locale}: results screen open`);await page.waitForFunction(lang=>!document.getElementById('distribution').textContent.includes(lang==='nl'?'De diepte':'Sounding'),locale);
  const state=await page.evaluate(()=>JSON.parse(window.render_game_to_text()));assert.equal(state.results.length,7);assert.ok(state.score>=300);assert.equal(state.results[6].score,local?0:100);assert.equal(state.sound.state,'running');
  await page.screenshot({path:output+'/desktop-results.png'});await page.locator('[data-review="3"]').click();assert.ok(await page.locator('.review-expanded').nth(3).isVisible());
  await page.locator('#copy-result').click();assert.ok((await page.evaluate(()=>navigator.clipboard.readText())).includes('OPENKRILLION'));
  await page.reload();await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).phase==='done');assert.equal(JSON.parse(await page.evaluate(()=>window.render_game_to_text())).score,state.score);report.push({desktop:'pass',game:state});
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,colorScheme:'light'});const mp=await mobile.newPage();mp.on('pageerror',e=>errors.push(e.message));
  await mp.goto(pageUrl());await mp.waitForFunction(()=>window.render_game_to_text);await mp.evaluate(()=>document.fonts.ready);await mp.waitForFunction(lang=>document.documentElement.lang===lang,locale);await mp.screenshot({path:output+'/mobile-home.png'});
  assert.equal(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await mp.locator('#guide-link').click();assert.ok(await mp.locator('.guide-sheet').isVisible());await mp.screenshot({path:output+'/mobile-guide.png'});await mp.locator('#close-guide').click();
  await mp.locator('#practice-btn').click({force:true});await mp.waitForFunction(()=>JSON.parse(window.render_game_to_text()).phase==='preview');if(local)await mp.evaluate(()=>window.advanceTime(3100));else await mp.waitForTimeout(3200);await mp.waitForFunction(()=>JSON.parse(window.render_game_to_text()).phase==='answering');await mp.waitForTimeout(700);await mp.screenshot({path:output+'/mobile-answer.png'});
  await mp.setViewportSize({width:390,height:480});await mp.waitForTimeout(450);await mp.screenshot({path:output+'/mobile-keyboard-height.png'});const dock=await mp.locator('#answer-form').boundingBox();assert.ok(dock.y+dock.height<=480);assert.ok(dock.y>=0);const prompt=await mp.locator('#prompt-card').boundingBox();const hud=await mp.locator('.hud').boundingBox();assert.ok(prompt.y>=hud.y+hud.height+15,'short viewport keeps prompt below the HUD');assert.ok(prompt.y+prompt.height<dock.y-15,'short viewport keeps prompt above input');
  report.push({mobile:'pass',locale,keyboardHeight:'pass'});
  await writeFile(output+'/report.json',JSON.stringify({report,errors},null,2));assert.deepEqual(errors,[]);console.log(JSON.stringify({ok:true,output,checks:report.map(r=>Object.keys(r)),errors}));
}finally{await browser.close();}

async function advanceRound(page,expectedRound){
  const started=Date.now();
  const responsePromise=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/next',{timeout:8000});
  let response=null;
  while(Date.now()-started<8000&&!response){
    const state=await page.evaluate(()=>JSON.parse(window.render_game_to_text()));
    assert.equal(state.phase,'landed',`expected landing before next round, got ${state.phase} at round ${state.round}`);
    await page.locator('#next-btn').evaluate(button=>button.click());
    response=await Promise.race([responsePromise,new Promise(resolve=>setTimeout(()=>resolve(null),100))]);
  }
  if(!response){const state=await page.evaluate(()=>JSON.parse(window.render_game_to_text()));throw new Error(`Next-round request was never sent (round=${state.round}, phase=${state.phase}, button=${await page.locator('#next-btn').innerText()})`);}
  assert.equal(response.status(),200,`/api/next failed with HTTP ${response.status()}`);
  await page.waitForFunction(round=>{const state=JSON.parse(window.render_game_to_text());return state.phase==='preview'&&state.round===round;},expectedRound,{timeout:8000});
}

async function finishResults(page){
  const started=Date.now();
  while(Date.now()-started<8000){
    const state=await page.evaluate(()=>JSON.parse(window.render_game_to_text()));
    console.log(`results transition: phase=${state.phase}, round=${state.round}, results=${state.results.length}`);
    if(state.phase==='done')return;
    assert.equal(state.phase,'landed',`expected final landing before results, got ${state.phase}`);
    await page.locator('#next-btn').evaluate(button=>button.click());
    try{await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).phase==='done',{timeout:150});return;}catch{}
  }
  const state=await page.evaluate(()=>JSON.parse(window.render_game_to_text()));
  throw new Error(`Results transition did not complete (round=${state.round}, phase=${state.phase})`);
}
