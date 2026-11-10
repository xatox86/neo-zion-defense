import {chromium,webkit} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

await mkdir('artifacts/carousel-review',{recursive:true});
const base='http://localhost:5183/neo-zion-defense/';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});

// CDP touch gestures go through Chrome's native touch and scrolling pipeline.
async function swipe(page,dx){
 const box=await page.locator('.map-select').boundingBox();
 const x=box.x+box.width*(dx<0?.8:.2),y=box.y+box.height*.5;
 const client=await page.context().newCDPSession(page);
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 for(let i=1;i<=10;i++){
  await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/10,y}]});
  await page.waitForTimeout(20);
 }
 await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await client.detach();await page.waitForTimeout(900);
}
for(const [width,height] of [[360,740],[390,844],[430,932]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('zion-settings',JSON.stringify({unlocked:4,sound:false,vibration:false,quality:true})));
 await page.goto(base);await page.waitForTimeout(800);
 const initial=await page.evaluate(()=>{const l=document.querySelector('.map-select'),c=l.querySelector('.map-card');return {scroll:l.scrollLeft,scrollWidth:l.scrollWidth,clientWidth:l.clientWidth,cardWidth:c.getBoundingClientRect().width,docWidth:document.documentElement.scrollWidth,viewport:innerWidth,bar:getComputedStyle(l,'::-webkit-scrollbar').display,barWidth:getComputedStyle(l).scrollbarWidth}});
 assert.ok(initial.scrollWidth>initial.clientWidth);assert.ok(initial.cardWidth>=110);assert.ok(initial.docWidth<=width);assert.ok(initial.bar==='none'||initial.barWidth==='none');
 assert.equal(await page.locator('[data-map="0"]').getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('.map-select-wrap').evaluate(e=>getComputedStyle(e,'::after').opacity),'1');
 await swipe(page,-180);const scrolled=await page.locator('.map-select').evaluate(e=>e.scrollLeft);
 assert.ok(scrolled>10,`touch did not scroll at ${width}: ${scrolled}`);
 const snap=await page.locator('.map-select').evaluate(e=>({atEnd:e.scrollLeft+e.clientWidth>=e.scrollWidth-2,nearest:Math.min(...[...e.querySelectorAll('.map-card')].map(c=>Math.abs(c.getBoundingClientRect().left-e.getBoundingClientRect().left)))}));
 assert.ok(snap.atEnd||snap.nearest<4,`scroll did not settle on a card: ${JSON.stringify(snap)}`);
 assert.equal(await page.locator('[data-map="0"]').getAttribute('aria-pressed'),'true','swipe must not select a card');
 assert.equal(await page.locator('#map').count(),0,'swipe must not start battle');
 const position=await page.evaluate(()=>({x:scrollX,y:scrollY,doc:document.documentElement.scrollWidth,view:innerWidth}));
 assert.equal(position.x,0);assert.equal(position.y,0);assert.ok(position.doc<=position.view);
 assert.equal(await page.locator('.map-select-wrap').evaluate(e=>getComputedStyle(e,'::before').opacity),'1');
 await swipe(page,180);const reversed=await page.locator('.map-select').evaluate(e=>e.scrollLeft);
 assert.ok(reversed<scrolled-10,`swipe right moves towards first card: ${scrolled} → ${reversed}`);
 await page.locator('.map-select').evaluate(e=>e.scrollTo({left:0}));await page.waitForTimeout(400);
 await page.screenshot({path:`artifacts/carousel-review/menu-${width}x${height}.png`,animations:'disabled'});
 // The fifth card remains readable, can be selected and starts its own mission.
 await page.locator('[data-map="4"]').tap();assert.equal(await page.locator('[data-map="4"]').getAttribute('aria-pressed'),'true');await page.waitForTimeout(350);
 assert.equal(await page.locator('.map-select-wrap').evaluate(e=>getComputedStyle(e,'::after').opacity),'0');
 await page.locator('#play').tap();await page.locator('#map').waitFor();assert.match(await page.locator('.map-caption').innerText(),/СЕКТОР 05/);
 assert.deepEqual(errors,[]);console.log(`${width}x${height}: native touch, selection, edge indicators, overflow OK`);await context.close();
}
const locked=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await locked.goto(base);assert.equal(await locked.locator('[data-map="4"]').isDisabled(),true);
await locked.locator('[data-map="4"]').evaluate(el=>el.click());assert.equal(await locked.locator('[data-map="0"]').getAttribute('aria-pressed'),'true');
await locked.locator('#play').tap();await locked.locator('#map').waitFor();assert.match(await locked.locator('.map-caption').innerText(),/СЕКТОР 01/);
console.log('Locked mission cannot be selected or started');await locked.close();
const telegram=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await telegram.route('**/telegram-web-app.js',route=>route.fulfill({status:200,body:''}));
await telegram.addInitScript(()=>{localStorage.setItem('zion-settings',JSON.stringify({unlocked:4,quality:true}));window.Telegram={WebApp:{viewportHeight:480,viewportStableHeight:480,safeAreaInset:{top:8,bottom:8},contentSafeAreaInset:{top:0,bottom:0},ready(){},expand(){},onEvent(){},BackButton:{hide(){},onClick(){}}}}});
await telegram.goto(base);await telegram.waitForTimeout(800);await swipe(telegram,-180);
assert.ok(await telegram.locator('.map-select').evaluate(e=>e.scrollLeft)>10);assert.equal(await telegram.locator('[data-map="0"]').getAttribute('aria-pressed'),'true');assert.equal(await telegram.locator('#map').count(),0);assert.equal(await telegram.evaluate(()=>scrollY),0);
await telegram.screenshot({path:'artifacts/carousel-review/telegram-480.png',animations:'disabled'});await telegram.close();await browser.close();console.log('Telegram viewport simulation: native touch and no accidental launch OK');

try {
 const wk=await webkit.launch({headless:true});
 for(const [width,height] of [[360,740],[390,844],[430,932]]){
  const p=await wk.newPage({viewport:{width,height},hasTouch:true});await p.goto(base);
  const state=await p.evaluate(()=>{const e=document.querySelector('.map-select');return {overflow:getComputedStyle(e).overflowX,bar:getComputedStyle(e,'::-webkit-scrollbar').display,snap:getComputedStyle(e).scrollSnapType}});
  assert.equal(state.overflow,'auto');assert.equal(state.bar,'none');assert.match(state.snap,/mandatory/);
  await p.locator('.map-select').evaluate(e=>e.scrollTo({left:155,behavior:'smooth'}));await p.waitForTimeout(800);
  const result=await p.evaluate(()=>{const e=document.querySelector('.map-select');return {left:e.scrollLeft,max:e.scrollWidth-e.clientWidth,nearest:Math.min(...[...e.querySelectorAll('.map-card')].map(c=>Math.abs(c.getBoundingClientRect().left-e.getBoundingClientRect().left))),doc:document.documentElement.scrollWidth,viewport:innerWidth}});
  assert.ok(result.left>0);assert.ok(result.nearest<4||result.left>=result.max-2);assert.ok(result.doc<=result.viewport);await p.screenshot({path:`artifacts/carousel-review/webkit-${width}x${height}.png`,animations:'disabled'});await p.close();
  console.log(`WebKit ${width}x${height}: scrollbar, snap, and overflow checks OK`);
 }
 await wk.close();
} catch(e){if(/executable|browser.*install|not found/i.test(String(e)))console.log('WebKit executable unavailable; Safari device verification remains necessary');else throw e}
