// Telegram Mini Apps validation: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
// D1 batches are transactional: https://developers.cloudflare.com/d1/worker-api/d1-database/#batch
const encoder = new TextEncoder();
const jsonHeaders = {'content-type':'application/json; charset=utf-8', 'cache-control':'no-store', 'vary':'Origin'};
const DAY = 86400;
const SESSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function error(status, code) { return {status, body:{error:code}}; }
function hex(bytes) { return [...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,'0')).join(''); }
async function hmac(key, value) {
  const cryptoKey = await crypto.subtle.importKey('raw', key, {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
  return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(value));
}
function equalHex(a,b) {
  if(!/^[a-f0-9]{64}$/.test(a) || !/^[a-f0-9]{64}$/.test(b)) return false;
  let different=0; for(let i=0;i<a.length;i++) different |= a.charCodeAt(i)^b.charCodeAt(i);
  return different===0;
}

export async function validateInitData(initData, token, now=Math.floor(Date.now()/1000)) {
  if(typeof initData!=='string' || !initData || initData.length>8192 || typeof token!=='string' || !token) return null;
  const params=new URLSearchParams(initData), seen=new Set();
  for(const [key] of params) { if(seen.has(key))return null; seen.add(key); }
  const given=params.get('hash')||'', auth=params.get('auth_date');
  if(!auth || !/^\d{1,12}$/.test(auth))return null;
  const authDate=Number(auth);if(!Number.isSafeInteger(authDate) || now-authDate>DAY || authDate>now+300)return null;
  const pairs=[...params.entries()].filter(([key])=>key!=='hash').sort(([a],[b])=>a<b?-1:a>b?1:0);
  const secret=await hmac(encoder.encode('WebAppData'),token);
  const expected=hex(await hmac(secret,pairs.map(([k,v])=>`${k}=${v}`).join('\n')));
  if(!equalHex(expected,given))return null;
  let user;try{user=JSON.parse(params.get('user')||'null')}catch{return null}
  if(!user || !Number.isSafeInteger(user.id) || user.id<=0 || typeof user.first_name!=='string')return null;
  // Keep a plain text name; clients must insert it with textContent, never innerHTML.
  const name=[user.first_name,typeof user.last_name==='string'?user.last_name:''].join(' ').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g,'').trim().slice(0,64);
  return {id:String(user.id), name:name||'Игрок'};
}

async function getSession(db,id,userId) {
  return db.prepare('SELECT id, request_id, season, balance_version, cleared, status, reached, created_at FROM sessions WHERE id = ? AND telegram_id = ?').bind(id,userId).first();
}
async function getSessionByRequest(db,requestId,userId) {
  return db.prepare('SELECT id, request_id, season, balance_version, cleared, status, reached, created_at FROM sessions WHERE request_id = ? AND telegram_id = ?').bind(requestId,userId).first();
}
function sessionResult(s) { return {sessionId:s.id,requestId:s.request_id,season:s.season,balanceVersion:s.balance_version,cleared:s.cleared,status:s.status,reached:s.reached}; }
function compatible(s,env) { return s.season===env.SEASON && s.balance_version===env.BALANCE_VERSION; }
async function readBody(request) {
  if((Number(request.headers.get('content-length'))||0)>4096)return null;
  if(!request.body)return null;
  const reader=request.body.getReader(),chunks=[];let size=0;
  try {
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>4096){await reader.cancel();return null}chunks.push(value)}
    const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}
    const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
    return value&&typeof value==='object'&&!Array.isArray(value)?value:null;
  }catch{return null}finally{reader.releaseLock()}
}

const rankingCte=`WITH player_best AS (
 SELECT r.telegram_id, r.cleared, r.finished_at,
 ROW_NUMBER() OVER (PARTITION BY r.telegram_id ORDER BY r.cleared DESC, r.finished_at ASC, r.session_id ASC) AS best
 FROM results r WHERE r.season = ? AND r.balance_version = ? AND r.finished_at >= ?
), ranking AS (
 SELECT p.telegram_id, p.display_name AS name, b.cleared,
 ROW_NUMBER() OVER (ORDER BY b.cleared DESC, b.finished_at ASC, b.telegram_id ASC) AS rank
 FROM player_best b JOIN players p ON p.telegram_id=b.telegram_id WHERE b.best=1
)`;

export async function handle(request,env) {
  const origin=request.headers.get('origin');
  const allowed=(env.ALLOW_ORIGIN||'https://xatox86.github.io').split(',').map(s=>s.trim()).filter(Boolean);
  if(origin && !allowed.includes(origin))return new Response(null,{status:403,headers:{vary:'Origin'}});
  const cors=origin?{'access-control-allow-origin':origin,'access-control-allow-methods':'GET, POST, OPTIONS','access-control-allow-headers':'authorization, content-type','access-control-max-age':'600'}:{};
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,vary:'Origin'}});
  const respond=result=>new Response(JSON.stringify(result.body),{status:result.status,headers:{...jsonHeaders,...cors}});
  if(!env.DB || !env.BOT_TOKEN || !env.SEASON || !env.BALANCE_VERSION)return respond(error(503,'not_configured'));
  const authorization=request.headers.get('authorization')||'';
  if(!authorization.startsWith('tma '))return respond(error(401,'telegram_auth_required'));
  const user=await validateInitData(authorization.slice(4),env.BOT_TOKEN);
  if(!user)return respond(error(401,'invalid_or_expired_telegram_auth'));
  const url=new URL(request.url),now=Math.floor(Date.now()/1000);
  try {
    if(request.method==='GET' && url.pathname==='/v1/leaderboard') {
      const period=url.searchParams.get('period')||'all';
      if(!['all','week','month'].includes(period))return respond(error(400,'invalid_period'));
      const since=period==='week'?now-7*DAY:period==='month'?now-30*DAY:0;
      const stmt=rankingCte+' SELECT telegram_id, name, cleared, rank FROM ranking WHERE rank <= 100 OR telegram_id = ? ORDER BY rank';
      const query=await env.DB.prepare(stmt).bind(env.SEASON,env.BALANCE_VERSION,since,user.id).all();
      const rows=query.results||[], entries=rows.filter(r=>r.rank<=100).map(({rank,name,cleared})=>({rank,name,cleared}));
      const own=rows.find(r=>r.telegram_id===user.id),me=own?{rank:own.rank,name:own.name,cleared:own.cleared}:null;
      return respond({status:200,body:{period,season:env.SEASON,balanceVersion:env.BALANCE_VERSION,entries,me}});
    }
    if(request.method==='POST' && url.pathname==='/v1/sessions') {
      const body=await readBody(request);
      if(!body||typeof body.requestId!=='string'||!SESSION_ID.test(body.requestId))return respond(error(400,'invalid_request_id'));
      if(body.season!==env.SEASON || body.balanceVersion!==env.BALANCE_VERSION)return respond(error(409,'incompatible_season_or_balance'));
      const requestId=body.requestId.toLowerCase();
      let existing=await getSessionByRequest(env.DB,requestId,user.id);
      if(existing)return respond(compatible(existing,env)?{status:200,body:sessionResult(existing)}:error(409,'incompatible_season_or_balance'));
      const recent=await env.DB.prepare('SELECT COUNT(*) AS count FROM sessions WHERE telegram_id = ? AND created_at >= ?').bind(user.id,now-600).first();
      if(recent.count>=10)return respond(error(429,'session_rate_limited'));
      const id=crypto.randomUUID();
      const writes=await env.DB.batch([
        env.DB.prepare('INSERT INTO players(telegram_id, display_name) VALUES(?, ?) ON CONFLICT(telegram_id) DO UPDATE SET display_name=excluded.display_name').bind(user.id,user.name),
        env.DB.prepare('INSERT INTO sessions(id, telegram_id, request_id, season, balance_version, created_at) VALUES(?, ?, ?, ?, ?, ?) ON CONFLICT(telegram_id, request_id) DO NOTHING').bind(id,user.id,requestId,env.SEASON,env.BALANCE_VERSION,now)
      ]);
      existing=await getSessionByRequest(env.DB,requestId,user.id);
      if(!existing||!compatible(existing,env))return respond(error(409,'incompatible_season_or_balance'));
      return respond({status:writes[1]?.meta?.changes?201:200,body:sessionResult(existing)});
    }
    const match=/^\/v1\/sessions\/([^/]+)(?:\/(waves|finish))?$/.exec(url.pathname);
    if(match && SESSION_ID.test(match[1])) {
      const [,id,action]=match;let session=await getSession(env.DB,id,user.id);
      if(!session)return respond(error(404,'session_not_found'));
      if(!compatible(session,env))return respond(error(409,'incompatible_season_or_balance'));
      if(request.method==='GET' && !action)return respond({status:200,body:sessionResult(session)});
      if(request.method==='POST' && action==='waves') {
        const body=await readBody(request),wave=body?.wave;
        if(!Number.isSafeInteger(wave)||wave<1||wave>5000)return respond(error(400,'invalid_wave'));
        if(wave===session.cleared)return respond({status:200,body:sessionResult(session)});
        if(session.status!=='active'||wave!==session.cleared+1)return respond(error(409,'invalid_wave_sequence'));
        // Conservative lower bound based on server wall clock; pauses and delayed/offline retries remain valid.
        if(now-session.created_at<wave)return respond(error(429,'wave_too_fast'));
        await env.DB.prepare("UPDATE sessions SET cleared = ? WHERE id = ? AND telegram_id = ? AND status = 'active' AND cleared = ?").bind(wave,id,user.id,wave-1).run();
        session=await getSession(env.DB,id,user.id);
        if(session.cleared!==wave)return respond(error(409,'invalid_wave_sequence'));
        return respond({status:200,body:sessionResult(session)});
      }
      if(request.method==='POST' && action==='finish') {
        const body=await readBody(request),cleared=body?.cleared,reached=body?.reached;
        if(!Number.isSafeInteger(cleared)||cleared<0||!Number.isSafeInteger(reached)||reached!==cleared+1||reached>5001)return respond(error(400,'invalid_result'));
        if(session.status==='finished')return respond(session.cleared===cleared&&session.reached===reached?{status:200,body:sessionResult(session)}:error(409,'session_already_finished'));
        if(session.cleared!==cleared)return respond(error(409,'invalid_wave_sequence'));
        // UPDATE and INSERT run in one D1 transaction; the session id is the idempotency key.
        await env.DB.batch([
          env.DB.prepare("UPDATE sessions SET status = 'finished', reached = ?, finished_at = ? WHERE id = ? AND telegram_id = ? AND status = 'active' AND cleared = ?").bind(reached,now,id,user.id,cleared),
          env.DB.prepare("INSERT OR IGNORE INTO results(session_id, telegram_id, season, balance_version, cleared, reached, finished_at) SELECT id, telegram_id, season, balance_version, cleared, reached, finished_at FROM sessions WHERE id = ? AND telegram_id = ? AND status = 'finished' AND cleared = ? AND reached = ?").bind(id,user.id,cleared,reached)
        ]);
        session=await getSession(env.DB,id,user.id);
        if(session.status!=='finished'||session.cleared!==cleared||session.reached!==reached)return respond(error(409,'session_already_finished'));
        return respond({status:200,body:sessionResult(session)});
      }
    }
    return respond(error(404,'not_found'));
  } catch { return respond(error(500,'database_error')); }
}

export default {fetch:handle};
