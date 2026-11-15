import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHmac} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {chromium} from '@playwright/test';
import worker from '../workers/leaderboard/src/index.mjs';

// Synthetic credentials only. No external Worker, Telegram user or database is used.
const token='123456:synthetic-test-token';
const params=new URLSearchParams({auth_date:String(Math.floor(Date.now()/1000)),query_id:'test',user:JSON.stringify({id:42,first_name:'Тестовый защитник'})});
const check=[...params.entries()].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>`${k}=${v}`).join('\n');
const secret=createHmac('sha256','WebAppData').update(token).digest();
params.set('hash',createHmac('sha256',secret).update(check).digest('hex'));
const initData=params.toString();

// A local SQLite adapter implements the D1 calls the actual Worker uses.
class D1 {
 constructor(){this.lock=Promise.resolve();this.db=new DatabaseSync(':memory:');this.db.exec(readFileSync(new URL('../workers/leaderboard/migrations/0001_leaderboard.sql',import.meta.url),'utf8'))}
 prepare(sql){const db=this.db;return {bind(...values){const stmt=db.prepare(sql);return {first:async()=>stmt.get(...values)||null,all:async()=>({results:stmt.all(...values)}),run:async()=>({meta:{changes:stmt.run(...values).changes}})}}}}
 async batch(statements){const run=async()=>{this.db.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());this.db.exec('COMMIT');return result}catch(e){this.db.exec('ROLLBACK');throw e}};const pending=this.lock.then(run);this.lock=pending.catch(()=>{});return pending}
}
const db=new D1(),env={DB:db,BOT_TOKEN:token,SEASON:'season-1',BALANCE_VERSION:'survival-v1',ALLOW_ORIGIN:'http://localhost:5188'};
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),calls=[];
await page.route('**/telegram-web-app.js',r=>r.fulfill({status:200,body:''}));
await page.route('https://leaderboard.test/**',async route=>{
 const incoming=route.request(),method=incoming.method(),raw=await incoming.allHeaders();
 const req=new Request(incoming.url(),{method,headers:raw,...(!['GET','HEAD'].includes(method)&&incoming.postDataBuffer()?{body:incoming.postDataBuffer()}:{} )});
 const response=await worker.fetch(req,env);calls.push({method,url:new URL(incoming.url()).pathname,status:response.status});
 await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});
});
await page.addInitScript(data=>{localStorage.setItem('zion-settings',JSON.stringify({unlocked:4,sound:false,vibration:false,quality:true}));window.Telegram={WebApp:{initData:data,ready(){},expand(){},onEvent(){},BackButton:{hide(){},show(){},onClick(){}}}}},initData);
await page.goto('http://localhost:5188/neo-zion-defense/');
await page.locator('#survival').tap();await page.locator('#play').tap();await page.locator('#map').waitFor();
await page.waitForFunction(()=>JSON.parse(localStorage.getItem('zion-ranking-journal-v1')||'[]')[0]?.sessionId);
// Let the Worker's server-side elapsed-time guard pass before simulating the wave.
await page.waitForTimeout(1200);
const wave=await page.evaluate(()=>{
 const g=window.__zion;g.selected=0;g.buy(0);g.selected=3;g.buy(1);g.startWave();
 let steps=0;while(g.active&&g.health>0&&steps++<12000)g.update(.05);
 return {completed:!g.active,health:g.health,wave:g.wave,steps};
});
assert.equal(wave.wave,1);assert.equal(wave.completed,true);assert.ok(wave.health>0);
await page.waitForFunction(()=>JSON.parse(localStorage.getItem('zion-ranking-journal-v1')||'[]')[0]?.acked===1);
const defeat=await page.evaluate(()=>{
 // Test setup accelerates the scenario by reducing remaining health to one.
 const g=window.__zion;g.built=[];g.health=1;g.startWave();let steps=0;
 while(g.health>0&&steps++<12000)g.update(.05);
 return {wave:g.wave,health:g.health,steps};
});
assert.equal(defeat.wave,2);assert.equal(defeat.health,0);
await page.waitForFunction(()=>document.querySelector('#result-ranking')?.textContent?.includes('место в мире: 1'),null,{timeout:15000});
assert.match(await page.locator('#result-ranking').innerText(),/Личный рекорд: 1/);
await page.locator('#result-board').tap();await page.getByText('Тестовый защитник').waitFor();
assert.match(await page.locator('.leaderboard-me').innerText(),/ВАШЕ МЕСТО: 1/);
const session=db.db.prepare('SELECT id,cleared,reached,status FROM sessions').get();
assert.deepEqual({...session,cleared:Number(session.cleared),reached:Number(session.reached)},{id:session.id,cleared:1,reached:2,status:'finished'});
assert.equal(db.db.prepare('SELECT COUNT(*) AS n FROM results').get().n,1);
const repeat=await worker.fetch(new Request('https://leaderboard.test/v1/sessions/'+session.id+'/finish',{method:'POST',headers:{authorization:'tma '+initData,'content-type':'application/json',origin:'http://localhost:5188'},body:JSON.stringify({cleared:1,reached:2})}),env);
assert.equal(repeat.status,200);assert.equal(db.db.prepare('SELECT COUNT(*) AS n FROM results').get().n,1);
assert.ok(calls.some(c=>c.url.endsWith('/waves')&&c.status===200));assert.ok(calls.some(c=>c.url.endsWith('/finish')&&c.status===200));
console.log('End-to-end: signed Telegram data → real Worker → SQLite, cleared=1/reached=2, rank=1, duplicate finish remains one record');
await browser.close();db.db.close();
