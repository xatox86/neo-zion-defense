import {chromium} from '@playwright/test';import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';
await mkdir('artifacts/campaign',{recursive:true});const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for(let map=0;map<6;map++){
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&r.url().includes('/assets/'))errors.push(`${r.status()} ${r.url()}`)});
 await p.addInitScript(()=>{if(!sessionStorage.getItem('seed')){sessionStorage.setItem('seed','1');localStorage.setItem('zion-settings',JSON.stringify({unlocked:4,sound:false,vibration:false,quality:true}));localStorage.removeItem('zion-checkpoint');localStorage.removeItem('zion-survival-checkpoint');localStorage.removeItem('zion-survival-record')}});
 await p.goto('http://localhost:5183/neo-zion-defense/');if(map===5)await p.locator('#survival').tap();else if(map)await p.locator(`[data-map="${map}"]`).tap();await p.locator('#play').tap();await p.locator('#map').waitFor();await p.waitForTimeout(500);
 const actual=await p.evaluate(()=>({map:window.__zion.map,cap:window.__zion.maxLevel,survival:window.__zion.survival}));assert.equal(actual.map,map);assert.equal(actual.cap,[3,3,3,4,5,5][map]);
 const box=await p.locator('#map').boundingBox(),pad=await p.evaluate(()=>window.__zion.config.pads[0]);await p.touchscreen.tap(box.x+box.width*pad[0],box.y+box.height*pad[1]);await p.locator('[data-tower="0"]').tap();assert.equal(await p.evaluate(()=>window.__zion.built.length),1);
 await p.evaluate(()=>{const g=window.__zion;g.energy=9000;for(let i=0;i<6;i++)g.upgrade()});assert.equal(await p.evaluate(()=>window.__zion.built[0].level),actual.cap);
 assert.equal(await p.locator('#upgrade').isDisabled(),true);
 assert.match(await p.locator('#upgrade').innerText(),map<3?/ОТКРОЕТСЯ В МИССИИ 4/:map===3?/ОТКРОЕТСЯ В МИССИИ 5/:/МАКС/);
 await p.locator('#start').tap();assert.equal(await p.evaluate(()=>window.__zion.wave),1);await p.screenshot({path:`artifacts/campaign/map-${map+1}.png`});
 await p.evaluate(()=>{const g=window.__zion;g.queue=[];g.enemies=[];g.energy=200;g.update(.01)});assert.equal(await p.evaluate(()=>window.__zion.active),false);
 const checkpoint=await p.evaluate((map)=>JSON.parse(localStorage.getItem(map===5?'zion-survival-checkpoint':'zion-checkpoint')),map);assert.equal(checkpoint.wave,1);
 await p.reload();if(map===5)await p.locator('#survival').tap();else if(map)await p.locator(`[data-map="${map}"]`).tap();await p.locator('#play').tap();await p.locator('#map').waitFor();assert.equal(await p.evaluate(()=>window.__zion.wave),1);assert.equal(await p.evaluate(()=>window.__zion.built[0].level),actual.cap);
 if(map===5){
  // A sale may exceed the reward cap; the resulting intermission must still resume.
  await p.evaluate(()=>{const g=window.__zion;g.energy=900;g.selected=g.built[0].slot;g.sell()});
  assert.ok(await p.evaluate(()=>JSON.parse(localStorage.getItem('zion-survival-checkpoint')).energy)>900);
  await p.reload();await p.locator('#survival').tap();await p.locator('#play').tap();await p.locator('#map').waitFor();
  assert.equal(await p.evaluate(()=>window.__zion.wave),1);assert.ok(await p.evaluate(()=>window.__zion.energy)>900);assert.equal(await p.evaluate(()=>window.__zion.built.length),0);
  await p.evaluate(()=>{const g=window.__zion;g.startWave();g.health=0;g.update(.01)});assert.equal(await p.locator('.result').count(),1);assert.equal(await p.evaluate(()=>localStorage.getItem('zion-survival-checkpoint')),null);assert.ok(await p.evaluate(()=>JSON.parse(localStorage.getItem('zion-survival-record')).reached)>=2)
 }
 assert.deepEqual(errors,[]);console.log(`map ${map+1}: build, tech cap, wave and checkpoint OK`);await ctx.close();
}
await browser.close();
