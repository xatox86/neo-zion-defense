import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

await mkdir('artifacts/leaderboard-review',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const p=await ctx.newPage(),events=[],periods=[];let failNetwork=false,finished=false,dropCreateOnce=false,emptyBoard=false,safeNames=false;
const headers={'access-control-allow-origin':'*','access-control-allow-methods':'GET, POST, OPTIONS','access-control-allow-headers':'authorization, content-type','content-type':'application/json'};
await ctx.route('**/telegram-web-app.js',r=>r.fulfill({status:200,body:''}));
await ctx.route('https://leaderboard.test/**',async route=>{
 const request=route.request(),url=new URL(request.url());
 if(failNetwork)return route.abort('internetdisconnected');
 if(request.method()==='OPTIONS')return route.fulfill({status:204,headers});
 const payload=request.postDataJSON?.()||{};let body={};
 if(url.pathname==='/v1/leaderboard'){
  periods.push(url.searchParams.get('period'));body={season:'season-1',balanceVersion:'survival-v1',period:url.searchParams.get('period'),entries:emptyBoard?[]:[{rank:1,name:safeNames?'Тестовый пилот 1':'<img src=x onerror="window.__xss=1">',cleared:7},{rank:2,name:'Тестовый пилот 2',cleared:4},{rank:3,name:'Тестовый пилот 3',cleared:3},{rank:4,name:'Тестовый пилот 4',cleared:2}],me:finished?{rank:2,name:'Игрок',cleared:2}:null};
 }else if(url.pathname==='/v1/sessions'){
  events.push({type:'create',requestId:payload.requestId});if(dropCreateOnce){dropCreateOnce=false;return route.abort('internetdisconnected')}body={sessionId:'11111111-1111-4111-8111-111111111111',requestId:payload.requestId};
 }else if(url.pathname.endsWith('/waves')){events.push({type:'wave',wave:payload.wave});body={cleared:payload.wave}}
 else if(url.pathname.endsWith('/finish')){events.push({type:'finish',...payload});finished=true;body={status:'finished',...payload}}
 else return route.fulfill({status:404,headers,body:'{}'});
 return route.fulfill({status:200,headers,body:JSON.stringify(body)});
});
await p.addInitScript(()=>{localStorage.setItem('zion-settings',JSON.stringify({unlocked:4,sound:false,vibration:false,quality:true}));window.Telegram={WebApp:{initData:'user='+encodeURIComponent(JSON.stringify({id:42,first_name:'Tester'}))+'&auth_date=1&hash=fake',ready(){},expand(){},onEvent(){},BackButton:{hide(){},show(){},onClick(){}}}}});
await p.goto('http://localhost:5188/neo-zion-defense/');
await p.locator('#ranking').tap();await p.getByRole('tab',{name:'За всё время'}).waitFor();
await p.waitForSelector('.leaderboard-podium-card');
assert.match(await p.locator('.leaderboard-podium-card').first().innerText(),/<img/);assert.equal(await p.locator('.leaderboard-podium-card img').count(),0);assert.equal(await p.evaluate(()=>window.__xss),undefined);
safeNames=true;await p.locator('.leaderboard-retry').tap();await p.getByText('Тестовый пилот 1').waitFor();await p.screenshot({path:'artifacts/leaderboard-review/board-populated.png'});
emptyBoard=true;await p.locator('.leaderboard-retry').tap();await p.getByText('Пока нет результатов. Станьте первым защитником Зиона.').waitFor();await p.screenshot({path:'artifacts/leaderboard-review/board-empty.png'});
emptyBoard=false;failNetwork=true;await p.locator('.leaderboard-retry').tap();await p.getByText(/Нет связи с рейтингом/).waitFor();await p.screenshot({path:'artifacts/leaderboard-review/board-offline.png'});failNetwork=false;
await p.getByRole('tab',{name:'За неделю'}).tap();await p.waitForTimeout(150);
await p.getByRole('tab',{name:'За месяц'}).tap();await p.waitForTimeout(150);
assert.ok(['all','week','month'].every(t=>periods.includes(t)));
await p.locator('.leaderboard-close').tap();
await p.locator('#survival').tap();await p.locator('#play').tap();await p.locator('#map').waitFor();
await p.waitForFunction(()=>JSON.parse(localStorage.getItem('zion-ranking-journal-v1')||'[]')[0]?.sessionId);
const finishWave=wave=>p.evaluate(wave=>{const g=window.__zion;g.wave=wave;g.active=true;g.queue=[];g.enemies=[];g.update(.01)},wave);
await finishWave(1);await p.waitForFunction(()=>JSON.parse(localStorage.getItem('zion-ranking-journal-v1')||'[]')[0]?.acked===1);
await p.evaluate(()=>{const g=window.__zion;g.energy=500;g.selected=0;g.buy(0);g.upgrade()});await p.waitForTimeout(100);
assert.equal(events.filter(e=>e.type==='wave'&&e.wave===1).length,1,'intermission building must not resend an acknowledged wave');
failNetwork=true;await finishWave(2);await p.waitForTimeout(200);
assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('zion-ranking-journal-v1'))[0].waves),[2]);
await p.reload();await p.locator('#survival').tap();await p.locator('#play').tap();await p.locator('#map').waitFor();
assert.equal(await p.evaluate(()=>window.__zion.wave),2);failNetwork=false;await p.evaluate(()=>window.dispatchEvent(new Event('online')));
await p.waitForFunction(()=>JSON.parse(localStorage.getItem('zion-ranking-journal-v1'))[0].acked===2);
await p.evaluate(()=>{const g=window.__zion;g.startWave();g.health=0;g.update(.01)});
await p.locator('#result-ranking').waitFor();await p.waitForFunction(()=>document.querySelector('#result-ranking')?.textContent?.includes('место в мире: 2'),null,{timeout:15000});
assert.match(await p.locator('#result-ranking').innerText(),/Личный рекорд: 2/);
await p.screenshot({path:'artifacts/leaderboard-review/result.png'});
assert.deepEqual(events.filter(e=>e.type!=='create').map(e=>e.type==='wave'?e.wave:'finish'),[1,2,'finish']);
await p.locator('#result-board').tap();await p.waitForSelector('.leaderboard-podium-card');await p.locator('.leaderboard-close').tap();
await p.locator('#menu').tap();
// A pre-existing checkpoint never creates a ranked session and remains playable.
await p.evaluate(()=>{localStorage.setItem('zion-survival-checkpoint',JSON.stringify({version:1,map:5,wave:4,energy:200,health:80,built:[],kills:8,bosses:0,elapsed:30}));localStorage.removeItem('zion-ranking-journal-v1')});
const creates=events.filter(e=>e.type==='create').length;await p.locator('#ranking').tap();assert.match(await p.locator('.leaderboard-play').innerText(),/ПРОДОЛЖИТЬ ВЫЖИВАНИЕ/);await p.locator('.leaderboard-play').tap();await p.locator('#map').waitFor();
assert.equal(await p.evaluate(()=>window.__zion.wave),4);await p.waitForTimeout(500);assert.equal(events.filter(e=>e.type==='create').length,creates);
// A dropped creation response must not lose completed waves or create a new request identity.
await p.evaluate(()=>localStorage.removeItem('zion-survival-checkpoint'));await p.reload();dropCreateOnce=true;
await p.locator('#survival').tap();await p.locator('#play').tap();await p.locator('#map').waitFor();
await p.waitForFunction(()=>JSON.parse(localStorage.getItem('zion-ranking-journal-v1')||'[]')[0]?.error);
await finishWave(1);const original=await p.evaluate(()=>JSON.parse(localStorage.getItem('zion-ranking-journal-v1'))[0]);
assert.equal(original.pendingCreate,true);assert.deepEqual(original.waves,[1]);
await p.reload();await p.locator('#survival').tap();await p.locator('#play').tap();await p.locator('#map').waitFor();
await p.waitForFunction(()=>JSON.parse(localStorage.getItem('zion-ranking-journal-v1'))[0]?.acked===1);
const matching=events.filter(e=>e.type==='create'&&e.requestId===original.key);assert.equal(matching.length,2);
// Telegram's compact WebView height must not clip essential leaderboard controls.
const compact=await ctx.newPage();await compact.addInitScript(()=>{window.Telegram={WebApp:{initData:'user='+encodeURIComponent(JSON.stringify({id:42,first_name:'Tester'}))+'&auth_date=1&hash=fake',viewportHeight:480,viewportStableHeight:480,ready(){},expand(){},onEvent(){},BackButton:{hide(){},show(){},onClick(){}}}}});
await compact.goto('http://localhost:5188/neo-zion-defense/');await compact.locator('#ranking').tap();await compact.getByText('Тестовый пилот 1').waitFor();
const fits=await compact.evaluate(()=>{const app=document.querySelector('#app').getBoundingClientRect(),close=document.querySelector('.leaderboard-close').getBoundingClientRect(),retry=document.querySelector('.leaderboard-retry').getBoundingClientRect(),play=document.querySelector('.leaderboard-play').getBoundingClientRect();return close.top>=app.top&&retry.bottom<=app.bottom&&play.bottom<=app.bottom&&document.documentElement.scrollWidth<=innerWidth});assert.ok(fits,'leaderboard controls must remain visible within Telegram viewport');
await compact.screenshot({path:'artifacts/leaderboard-review/telegram-480.png'});await compact.close();
console.log('Leaderboard browser: tabs, escaped names, offline resume, ordered events, result, legacy checkpoint and dropped session creation OK');
await browser.close();
