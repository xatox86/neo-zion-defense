import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const pads=[[.22,.17],[.14,.22],[.23,.194],[.23,.17],[.60,.15],[.22,.16]];
for(let mission=0;mission<6;mission++){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&r.url().includes('/assets/'))errors.push(`${r.status()} ${r.url()}`)});
 await page.addInitScript(()=>localStorage.setItem('zion-settings',JSON.stringify({unlocked:4,sound:false,vibration:false,quality:true})));
 await page.goto('http://127.0.0.1:4183/neo-zion-defense/');
 if(mission===5)await page.locator('#survival').tap();else if(mission)await page.locator(`[data-map="${mission}"]`).tap();
 await page.locator('#play').tap();await page.locator('#map').waitFor();
 const box=await page.locator('#map').boundingBox();
 await page.touchscreen.tap(box.x+box.width*pads[mission][0],box.y+box.height*pads[mission][1]);
 await page.locator('[data-tower="0"]').tap();
 assert.equal(await page.locator('#context #upgrade').count(),1);
 await page.locator('#start').tap();
 assert.match(await page.locator('#wave').innerText(),/^01/);
 assert.deepEqual(errors,[]);
 console.log(`Production mode ${mission+1}: loaded, built and started wave`);
 await context.close();
}
await browser.close();
