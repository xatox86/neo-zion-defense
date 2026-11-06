import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
await mkdir('screenshots',{recursive:true});
for(const [width,height] of [[360,740],[390,844],[430,932]]){
 const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173/neo-zion-defense/',{waitUntil:'networkidle'});await page.locator('#play').waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 if(width===390)await page.screenshot({path:'screenshots/menu.png'});
 await page.locator('#play').tap();await page.waitForTimeout(1000);
 const canvas=page.locator('#map'); const box=await canvas.boundingBox();
 const pad=async(i)=>{const pos=await page.evaluate(i=>window.__zion.config.pads[i],i);await page.touchscreen.tap(box.x+box.width*pos[0],box.y+box.height*pos[1])};
 await pad(0);await page.locator('[data-tower="0"]').tap();assert.equal(await page.evaluate(()=>window.__zion.built.length),1);
 await page.locator('#start').tap();await page.waitForTimeout(2000);assert.ok(await page.evaluate(()=>window.__zion.enemies.length>0));
 if(width===390)await page.screenshot({path:'screenshots/battle.png'});
 await page.locator('#pause').tap();assert.equal(await page.evaluate(()=>window.__zion.paused),true);await page.locator('#resume').tap();assert.equal(await page.evaluate(()=>window.__zion.paused),false);
 assert.deepEqual(errors,[]);console.log(`mobile ${width}x${height}: build, wave, enemy, pause, layout OK`);await page.close();
}
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await page.goto('http://localhost:5173/neo-zion-defense/');await page.locator('#play').tap();await page.waitForTimeout(400);
await page.evaluate(()=>{window.__zion.energy=5000});
const box=await page.locator('#map').boundingBox();
for(let i=0;i<4;i++){const pos=await page.evaluate(i=>window.__zion.config.pads[i],i);await page.touchscreen.tap(box.x+box.width*pos[0],box.y+box.height*pos[1]);await page.locator(`[data-tower="${i}"]`).tap();await page.locator('#upgrade').tap();await page.locator('#upgrade').tap();assert.equal(await page.evaluate(i=>window.__zion.built.find(t=>t.slot===i).level,i),3)}
await page.locator('#sell').tap();assert.equal(await page.evaluate(()=>window.__zion.built.length),3);await page.locator('[data-ability="0"]').tap();assert.ok(await page.evaluate(()=>window.__zion.cooldown[0]>0));console.log('UI: all four towers built, upgraded twice, sold, EMP activated');
await page.reload();await page.locator('#play').tap();await page.waitForTimeout(500);
const result=await page.evaluate(()=>{const g=window.__zion;g.paused=true;g.energy=10000;for(let i=0;i<4;i++){g.selected=i;g.buy(i);g.upgrade();g.upgrade()}const types=g.built.map(t=>[t.type,t.level]);g.selected=0;let before=g.energy;g.sell();let sold=g.energy>before;g.buy(0);g.upgrade();g.upgrade();g.paused=false;let waves=[];for(let wave=1;wave<=10;wave++){g.startWave();let n=0;while(g.active&&g.health>0&&n++<10000)g.update(.05);waves.push({wave:g.wave,active:g.active,health:g.health,steps:n});if(g.health<=0||g.active)break;}return {types,sold,waves,health:g.health}});
console.log('Simulation:',JSON.stringify(result));assert.deepEqual(result.types,[[0,3],[1,3],[2,3],[3,3]]);assert.equal(result.sold,true);assert.equal(result.waves.length,10);assert.ok(result.waves.every(w=>!w.active));await page.close();await browser.close();
