import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';

const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await page.goto('http://localhost:5183/neo-zion-defense/');
await page.locator('#survival').tap();await page.locator('#play').tap();await page.locator('#map').waitFor();
const result=await page.evaluate(async()=>{
 const g=window.__zion;g.wave=40;g.active=true;g.queue=[];g.health=10000;g.energy=9000;
 for(let slot=0;slot<10;slot++){g.selected=slot;g.buy(slot%4);for(let n=0;n<4;n++)g.upgrade()}
 const types=['scout','swarm','armored','jammer','octopus','carrier','boss'];
 g.enemies=Array.from({length:50},(_,i)=>g.makeEnemy(types[i%types.length],.08+(i%25)*.02));
 let frames=0,draws=0;const original=g.draw.bind(g);g.draw=()=>{draws++;original()};
 const start=performance.now();await new Promise(resolve=>{const tick=()=>{frames++;if(performance.now()-start<5000)requestAnimationFrame(tick);else resolve()};requestAnimationFrame(tick)});
 return {seconds:+((performance.now()-start)/1000).toFixed(2),animationFrames:frames,draws,remainingEnemies:g.enemies.length,adaptive30:g.adaptive30,towers:g.built.length};
});
await page.screenshot({path:'artifacts/campaign/survival-performance.png'});
await writeFile('artifacts/campaign/performance.json',JSON.stringify(result,null,2));
console.log(result);await browser.close();
