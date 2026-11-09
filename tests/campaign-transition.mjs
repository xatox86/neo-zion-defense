import {chromium} from '@playwright/test';import assert from 'node:assert/strict';
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await p.addInitScript(()=>{if(!sessionStorage.seed){sessionStorage.seed='1';localStorage.setItem('zion-settings',JSON.stringify({unlocked:0,quality:true,sound:false,vibration:false}));localStorage.setItem('zion-checkpoint',JSON.stringify({map:0,wave:4,energy:250,health:80,built:[{slot:0,type:0,level:5,invested:800}]}))}});await p.goto('http://localhost:5183/neo-zion-defense/');await p.locator('#play').tap();await p.locator('#map').waitFor();assert.equal(await p.evaluate(()=>window.__zion.built[0].level),2);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('zion-checkpoint-pre-tech-cap')).built[0].level),5);
for(let mission=0;mission<5;mission++){
 assert.equal(await p.evaluate(()=>window.__zion.map),mission);
 // Exercise the end-of-wave transition separately from the full balance simulations.
 await p.evaluate(()=>{const g=window.__zion;g.wave=g.config.waves;g.active=true;g.queue=[];g.enemies=[];g.update(.01);g.update(1.5)});
 assert.equal(await p.locator('.result').count(),1);
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('zion-settings')).unlocked),Math.min(4,mission+1));
 if(mission<4)await p.locator('#next').tap();else assert.equal(await p.locator('#retry').count(),1);
}
await b.close();console.log('Legacy save backed up; all five victory transitions and unlocks passed');
