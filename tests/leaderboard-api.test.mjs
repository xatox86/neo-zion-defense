import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {createHmac} from 'node:crypto';
import worker, {validateInitData} from '../workers/leaderboard/src/index.mjs';

const BOT_TOKEN='123456:test-secret-only-for-unit-tests';
const season='season-1',balanceVersion='survival-v1';
function auth(id=1,first_name='Игрок',date=Math.floor(Date.now()/1000)) {
  const p=new URLSearchParams({auth_date:String(date),query_id:'test',user:JSON.stringify({id,first_name})});
  const data=[...p.entries()].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>`${k}=${v}`).join('\n');
  const secret=createHmac('sha256','WebAppData').update(BOT_TOKEN).digest();
  p.set('hash',createHmac('sha256',secret).update(data).digest('hex'));
  return p.toString();
}
class D1 {
  constructor(){this.lock=Promise.resolve();this.db=new DatabaseSync(':memory:');this.db.exec(readFileSync(new URL('../workers/leaderboard/migrations/0001_leaderboard.sql',import.meta.url),'utf8'))}
  prepare(sql){const db=this.db;return {bind(...values){const stmt=db.prepare(sql);return {first:async()=>stmt.get(...values)||null,all:async()=>({results:stmt.all(...values)}),run:async()=>({meta:{changes:stmt.run(...values).changes}})}}}}
  async batch(statements){const run=async()=>{this.db.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());this.db.exec('COMMIT');return result}catch(e){this.db.exec('ROLLBACK');throw e}};const pending=this.lock.then(run);this.lock=pending.catch(()=>{});return pending}
}
function fixture(){const db=new D1();return {db,env:{DB:db,BOT_TOKEN,SEASON:season,BALANCE_VERSION:balanceVersion,ALLOW_ORIGIN:'https://xatox86.github.io'}}}
async function api(env,path,{id=1,method='GET',body,authData=auth(id),origin='https://xatox86.github.io'}={}){
  const req=new Request('https://worker.test'+path,{method,headers:{authorization:'tma '+authData,'content-type':'application/json',...(origin?{origin}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const response=await worker.fetch(req,env), text=await response.text();return {status:response.status,data:text?JSON.parse(text):null,headers:response.headers};
}
async function start(f,id=1,requestId=crypto.randomUUID()){return api(f.env,'/v1/sessions',{id,method:'POST',body:{season,balanceVersion,requestId}})}
function backdate(f,id,seconds=10000){f.db.db.prepare('UPDATE sessions SET created_at = ? WHERE id = ?').run(Math.floor(Date.now()/1000)-seconds,id)}
async function wave(f,id,n,user=1){return api(f.env,`/v1/sessions/${id}/waves`,{id:user,method:'POST',body:{wave:n}})}
async function finish(f,id,cleared,user=1){return api(f.env,`/v1/sessions/${id}/finish`,{id:user,method:'POST',body:{cleared,reached:cleared+1}})}

test('Telegram signature, identity and expiry are verified server-side',async()=>{
  const signed=auth(42,'<b>Имя</b>');assert.equal((await validateInitData(signed,BOT_TOKEN)).id,'42');
  assert.equal(await validateInitData(signed.replace('%3Cb%3E','bad'),BOT_TOKEN),null);
  assert.equal(await validateInitData(signed,BOT_TOKEN+'wrong'),null);
  assert.equal(await validateInitData(auth(42,'A',Math.floor(Date.now()/1000)-86401),BOT_TOKEN),null);
  assert.equal(await validateInitData(signed+'&auth_date=12',BOT_TOKEN),null);
  const f=fixture();assert.equal((await api(f.env,'/v1/leaderboard',{authData:'user=%7B%22id%22%3A42%7D'})).status,401);
  assert.equal((await api(f.env,'/v1/leaderboard',{origin:'https://evil.test'})).status,403);
});

test('session progression is ordered, scoped to Telegram identity, resumable and idempotent',async()=>{
  const f=fixture(),created=await start(f);assert.equal(created.status,201);const id=created.data.sessionId;
  assert.equal((await wave(f,id,2)).status,409);backdate(f,id);
  assert.equal((await wave(f,id,1,2)).status,404);
  assert.equal((await wave(f,id,1)).data.cleared,1);
  assert.equal((await wave(f,id,1)).data.cleared,1);
  assert.equal((await api(f.env,`/v1/sessions/${id}`)).data.cleared,1);
  assert.equal((await finish(f,id,2)).status,409);
  assert.equal((await wave(f,id,2)).status,200);
  assert.equal((await finish(f,id,2)).data.cleared,2);
  assert.equal((await finish(f,id,2)).status,200);
  assert.equal((await finish(f,id,3)).status,409);
  assert.equal(f.db.db.prepare('SELECT COUNT(*) AS n FROM results').get().n,1);
  assert.equal((await wave(f,id,3)).status,409);
});

test('enforces lower bound, season and balance without expiring paused sessions',async()=>{
  const f=fixture(),s=await start(f),id=s.data.sessionId;
  f.db.db.prepare('UPDATE sessions SET created_at = ? WHERE id = ?').run(Math.floor(Date.now()/1000)+30,id);
  assert.equal((await wave(f,id,1)).status,429);
  backdate(f,id,5*365*86400);assert.equal((await wave(f,id,1)).status,200);
  assert.equal((await api({...f.env,SEASON:'season-2'},`/v1/sessions/${id}`)).status,409);
  assert.equal((await api({...f.env,BALANCE_VERSION:'v2'},`/v1/sessions/${id}/waves`,{method:'POST',body:{wave:2}})).status,409);
  assert.equal((await api(f.env,'/v1/sessions',{method:'POST',body:{season:'old',balanceVersion,requestId:crypto.randomUUID()}})).status,409);
});

test('session creation is idempotent per authenticated user and rejects old season or balance',async()=>{
  const f=fixture(),requestId=crypto.randomUUID();
  const [first,concurrent]=await Promise.all([start(f,1,requestId),start(f,1,requestId)]);
  assert.deepEqual([first.status,concurrent.status].sort(),[200,201]);
  assert.equal(first.data.sessionId,concurrent.data.sessionId);
  assert.equal(first.data.requestId,requestId);
  const replay=await start(f,1,requestId);assert.equal(replay.status,200);assert.equal(replay.data.sessionId,first.data.sessionId);
  const other=await start(f,2,requestId);assert.equal(other.status,201);assert.notEqual(other.data.sessionId,first.data.sessionId);
  assert.equal((await api(f.env,`/v1/sessions/${first.data.sessionId}`,{id:2})).status,404);
  assert.equal((await api({...f.env,SEASON:'season-2'},'/v1/sessions',{method:'POST',body:{season:'season-2',balanceVersion,requestId}})).status,409);
  assert.equal((await api({...f.env,BALANCE_VERSION:'v2'},'/v1/sessions',{method:'POST',body:{season,balanceVersion:'v2',requestId}})).status,409);
  assert.equal((await api(f.env,'/v1/sessions',{method:'POST',body:{season,balanceVersion,requestId:'not-a-uuid'}})).status,400);
  assert.equal(f.db.db.prepare('SELECT COUNT(*) AS n FROM sessions').get().n,2);
});

test('rejects oversized streaming request bodies without buffering the remainder',async()=>{
  const f=fixture();let cancelled=false,reads=0;
  const stream=new ReadableStream({pull(controller){reads++;controller.enqueue(new Uint8Array(3000));if(reads>4)controller.close()},cancel(){cancelled=true}});
  const request=new Request('https://worker.test/v1/sessions',{method:'POST',headers:{authorization:'tma '+auth()},body:stream,duplex:'half'});
  assert.equal((await worker.fetch(request,f.env)).status,400);assert.equal(cancelled,true);assert.ok(reads<=3);
});

test('only best fully cleared result per player is retained in each leaderboard',async()=>{
  const f=fixture();
  for(const cleared of [2,1,3]) {
    const s=await start(f);backdate(f,s.data.sessionId);
    for(let waveNumber=1;waveNumber<=cleared;waveNumber++)assert.equal((await wave(f,s.data.sessionId,waveNumber)).status,200);
    assert.equal((await finish(f,s.data.sessionId,cleared)).status,200);
  }
  const result=await api(f.env,'/v1/leaderboard');
  assert.equal(result.data.entries.length,1);assert.equal(result.data.me.cleared,3);
  assert.equal(f.db.db.prepare('SELECT COUNT(*) AS n FROM results').get().n,3);
});

test('ranks top 100 by cleared and chooses each player best within each rolling period',async()=>{
  const f=fixture(),now=Math.floor(Date.now()/1000),insertPlayer=f.db.db.prepare('INSERT INTO players VALUES(?, ?)'),insert=f.db.db.prepare('INSERT INTO results(session_id,telegram_id,season,balance_version,cleared,reached,finished_at) VALUES(?,?,?,?,?,?,?)');
  // Bypass gameplay to create many deterministic historical results for ranking tests.
  f.db.db.exec('PRAGMA foreign_keys=OFF');
  for(let i=1;i<=102;i++){insertPlayer.run(String(i),'Игрок '+i);insert.run('s'+i,String(i),season,balanceVersion,103-i,104-i,now-100)}
  insert.run('old-best','102',season,balanceVersion,500,501,now-20*86400);
  insert.run('other-season','1','other',balanceVersion,999,1000,now);
  const week=await api(f.env,'/v1/leaderboard?period=week',{id:102});
  assert.equal(week.status,200);assert.equal(week.data.entries.length,100);assert.equal(week.data.entries[0].cleared,102);assert.equal(week.data.me.rank,102);assert.equal(week.data.me.cleared,1);
  const month=await api(f.env,'/v1/leaderboard?period=month',{id:102});assert.equal(month.data.me.rank,1);assert.equal(month.data.me.cleared,500);
  const all=await api(f.env,'/v1/leaderboard?period=all',{id:102});assert.equal(all.data.entries[0].cleared,500);
  assert.equal((await api(f.env,'/v1/leaderboard?period=bad')).status,400);
});
