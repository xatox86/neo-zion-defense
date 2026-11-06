import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
for(const plan of [[0,0,1,3,2,1,0,3],[1,0,0,2,3,1,3,0],[0,1,2,3,1,0,3,2]]){
 const page=await browser.newPage();await page.goto((process.env.ZION_URL || 'http://localhost:5173/neo-zion-defense/'));await page.locator('#play').click();
 const result=await page.evaluate(plan=>{const g=window.__zion;g.paused=true;let log=[];const order=[0,3,6,1,5,7,9,8];
 function spend(){for(let j=0;j<order.length;j++){const slot=order[j],t=g.built.find(t=>t.slot===slot);if(!t){g.selected=slot;const old=g.built.length;g.buy(plan[j]);if(g.built.length===old)break}else if(t.level<2){g.selected=slot;let old=t.level;g.upgrade();if(t.level===old)break}}}
 spend();g.paused=false;for(let wave=1;wave<=10;wave++){g.startWave();let ticks=0;while(g.active&&g.health>0&&ticks++<8000){if(g.enemies.length>=5&&g.cooldown[0]<=0)g.ability(0);if(g.enemies.some(e=>e.progress>.83)&&g.cooldown[1]<=0)g.ability(1);g.update(.05)}log.push({wave,health:+g.health.toFixed(1),energy:g.energy,towers:g.built.map(t=>`${t.type}:${t.level}`)});if(g.health<=0||g.active)break;spend()}return log},plan);console.log(JSON.stringify({plan,result}));assert.equal(result.length,10);assert.ok(result.at(-1).health>0);await page.close();
}await browser.close();
