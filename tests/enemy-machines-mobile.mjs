import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';

await mkdir('artifacts/enemy-machines',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,recordVideo:{dir:'artifacts/enemy-machines',size:{width:390,height:844}}});
const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&r.url().includes('/assets/'))errors.push(`${r.status()} ${r.url()}`)});
await p.addInitScript(()=>{localStorage.setItem('zion-settings',JSON.stringify({unlocked:2,quality:true,sound:false,vibration:false}));localStorage.setItem('zion-checkpoint',JSON.stringify({map:0,wave:9,health:100,energy:400,built:[{slot:0,type:0,level:4,invested:500},{slot:3,type:1,level:4,invested:700},{slot:6,type:2,level:4,invested:800},{slot:9,type:3,level:4,invested:900}]}))});
await p.goto('http://localhost:5178/neo-zion-defense/');await p.locator('#play').tap();
await p.evaluate(async()=>{const g=window.__zion;await Promise.all([...g.rigs.enemyMachines.bodies,...g.rigs.enemyMachines.parts].map(i=>i.decode()));g.active=true;g.queue=[];g.wave=10;g.enemies=['scout','swarm','armored','jammer','octopus','carrier','boss'].map((type,i)=>{const e=g.makeEnemy(type,.08+i*.09);Object.assign(e,g.point(e.progress));return e})});
await p.waitForTimeout(200);await p.screenshot({path:'artifacts/enemy-machines/mobile-seven.png'});
const initial=await p.evaluate(()=>window.__zion.enemies.map(e=>({type:e.type,heading:e.heading,hp:e.hp})));
await p.waitForTimeout(11000);
const state=await p.evaluate(()=>{const g=window.__zion;return {wave:g.wave,remaining:g.enemies.map(e=>e.type),deaths:g.dead.length,health:g.health,frameAverage:g.frameAverage}});
await p.screenshot({path:'artifacts/enemy-machines/mobile-battle.png'});assert.equal(initial.length,7);assert.equal(state.wave,10);assert.deepEqual(errors,[]);
const video=p.video();await p.close();await ctx.close();await video.saveAs('artifacts/enemy-machines/mobile-battle.webm');await browser.close();console.log(JSON.stringify({initial,state,errors}));
