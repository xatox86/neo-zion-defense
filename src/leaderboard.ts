/** A leaderboard is optional: gameplay and its existing checkpoints remain local. */
export const SEASON='season-1', BALANCE_VERSION='survival-v1';
const api=String(import.meta.env.VITE_LEADERBOARD_API_URL||'').replace(/\/+$/,'');
const KEY='zion-ranking-journal-v1';
export type Entry={rank:number;name:string;cleared:number};
export type Board={period:string;season:string;balanceVersion:string;entries:Entry[];me:Entry|null};
type Run={key:string;owner:string;season:string;balanceVersion:string;sessionId:string|null;pendingCreate:boolean;waves:number[];acked:number;finish:{reached:number;cleared:number}|null;done:boolean;error?:string};
const auth=()=>String((window as any).Telegram?.WebApp?.initData||'');
// This local value only prevents sending a saved journal under another Telegram account;
// identity and authorization are always verified by the server from signed initData.
const owner=()=>{try{return String(JSON.parse(new URLSearchParams(auth()).get('user')||'null')?.id||'')}catch{return ''}};
class RequestError extends Error{constructor(message:string,public status:number){super(message)}}
const load=():Run[]=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}};
const storageErrors=new Map<string,string>();
const save=(runs:Run[])=>{try{localStorage.setItem(KEY,JSON.stringify(runs));return true}catch{return false}};
const update=(key:string,f:(r:Run)=>void)=>{const runs=load(),r=runs.find(x=>x.key===key);if(r){f(r);if(!save(runs)){storageErrors.set(key,'Не удалось сохранить очередь рейтинга на устройстве');return undefined}}return r};
async function request<T>(path:string,body?:unknown):Promise<T>{
 if(!api)throw new Error('Рейтинг пока не настроен');
 if(!auth())throw new Error('Откройте игру через Telegram для доступа к рейтингу');
 const c=new AbortController(),timer=setTimeout(()=>c.abort(),10000);
 try{const response=await fetch(api+path,{method:body?'POST':'GET',headers:{Authorization:'tma '+auth(),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:c.signal});if(!response.ok)throw new RequestError(response.status===409?'Сезон или версия баланса изменились':response.status===401?'Авторизация Telegram устарела. Откройте игру заново.':'Рейтинг временно недоступен',response.status);return await response.json() as T}catch(e){if(e instanceof RequestError)throw e;throw new Error('Нет связи с рейтингом. Локальное выживание доступно.')}finally{clearTimeout(timer)}
}
export const leaderboard=(period:'all'|'week'|'month')=>request<Board>('/v1/leaderboard?period='+period);
export const rankingAvailable=()=>!!api&&!!auth();
const syncing=new Map<string,Promise<void>>(),dirty=new Set<string>(),attempts=new Map<string,number>(),timers=new Map<string,ReturnType<typeof setTimeout>>();
function scheduleRetry(key:string){const n=attempts.get(key)||0;if(n>=5||timers.has(key))return;attempts.set(key,n+1);timers.set(key,setTimeout(()=>{timers.delete(key);void syncRun(key)},Math.min(60000,5000*2**n)))}
/** Flush in order. Keep failed submissions, including a finish, for a later retry. */
export function syncRun(key:string):Promise<void>{
 const existing=syncing.get(key);if(existing){dirty.add(key);return existing}if(!rankingAvailable())return Promise.resolve();
 const task=(async()=>{await Promise.resolve();let failed=false;try{
  let r=load().find(x=>x.key===key);if(!r||r.done)return;if(r.owner!==owner())throw new RequestError('Откройте игру под прежним аккаунтом Telegram',403);if(r.season!==SEASON||r.balanceVersion!==BALANCE_VERSION)throw new RequestError('Сезон или версия баланса изменились',409);
  if(!r.sessionId&&r.pendingCreate){const board=await leaderboard('all');if(board.season!==r.season||board.balanceVersion!==r.balanceVersion)throw new RequestError('Сезон или версия баланса изменились',409);const result=await request<{sessionId:string;requestId:string}>('/v1/sessions',{season:r.season,balanceVersion:r.balanceVersion,requestId:r.key});if(result.requestId!==r.key)throw new Error('Неверный ответ рейтинга');if(!update(key,x=>{x.sessionId=result.sessionId;x.pendingCreate=false;delete x.error}))throw new Error('Не удалось сохранить очередь рейтинга на устройстве');r=load().find(x=>x.key===key)!}
  if(!r.sessionId)return;const sessionId=r.sessionId;
  while(r.waves.length){const wave=r.waves[0];await request('/v1/sessions/'+encodeURIComponent(sessionId)+'/waves',{wave});if(!update(key,x=>{if(x.waves[0]===wave)x.waves.shift();x.acked=Math.max(x.acked,wave);delete x.error}))throw new Error('Не удалось сохранить очередь рейтинга на устройстве');r=load().find(x=>x.key===key)!;}
  if(r.finish){await request('/v1/sessions/'+encodeURIComponent(sessionId)+'/finish',r.finish);if(!update(key,x=>{x.done=true;delete x.error}))throw new Error('Не удалось сохранить очередь рейтинга на устройстве')}attempts.delete(key);
 }catch(e){failed=true;update(key,x=>{x.error=e instanceof Error?e.message:'Рейтинг временно недоступен'});if(!(e instanceof RequestError)||![401,403,409].includes(e.status))scheduleRetry(key)}finally{syncing.delete(key);if(dirty.delete(key)&&!failed)void syncRun(key)}})();syncing.set(key,task);return task;
}
export function syncPending(){for(const r of load())if(!r.done&&(r.sessionId||r.pendingCreate)){attempts.delete(r.key);void syncRun(r.key)}}
export function runStatus(key:string|null){if(!key)return null;const run=load().find(x=>x.key===key);return run?{...run,error:storageErrors.get(key)||run.error}:null}
/** A new ranked run is created only at wave zero, never from a legacy checkpoint. */
export function startRankedRun():string|null{
 if(!rankingAvailable()||!navigator.onLine||!owner())return null;
 let key:string;try{key=crypto.randomUUID()}catch{return null}const runs=load().filter(r=>!r.done);runs.push({key,owner:owner(),season:SEASON,balanceVersion:BALANCE_VERSION,sessionId:null,pendingCreate:true,waves:[],acked:0,finish:null,done:false});save(runs);if(!load().some(r=>r.key===key))return null;void syncRun(key);
 return key;
}
export function recordWave(key:string|null,wave:number){if(!key)return;const r=update(key,x=>{if(wave>x.acked&&!x.waves.includes(wave))x.waves.push(wave)});if(r&&(r.sessionId||r.pendingCreate))void syncRun(key)}
export function finishRun(key:string|null,reached:number,cleared:number){if(!key)return;const r=update(key,x=>{x.finish={reached,cleared}});if(r&&(r.sessionId||r.pendingCreate))void syncRun(key)}
window.addEventListener('online',syncPending);
