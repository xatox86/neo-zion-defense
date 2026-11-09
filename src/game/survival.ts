import type {EnemyType} from './data';

/** Bounds keep generated queues and stats finite even for very late waves. */
export function survivalWave(wave:number):{queue:EnemyType[];healthScale:number;speedScale:number}{
 const n=Number.isSafeInteger(wave)&&wave>0?wave:1;
 const types:EnemyType[]=n<4?['scout','swarm']:n<11?['scout','swarm','armored']:n<21?['scout','swarm','armored','jammer','octopus']:['scout','swarm','armored','jammer','octopus','carrier'];
 const count=Math.min(50,6+Math.floor(Math.sqrt(n)*4));
 const queue=Array.from({length:count},(_,i)=>types[(i*7+Math.floor(i/3)+n)%types.length]);
 if(n%10===0)queue.push('boss');
 return {queue,healthScale:Math.min(100,1+Math.log2(n+1)*.08+Math.max(0,n-1)*.04+Math.max(0,n-15)*.15+Math.pow(Math.max(0,n-30),1.35)*.05),speedScale:Math.min(1.5,1+Math.log2(n+1)*.025)};
}

export type SurvivalCheckpoint={version:1;wave:number;energy:number;health:number;built:{slot:number;type:number;level:number;invested:number}[];kills:number;bosses:number;elapsed:number};
export type SurvivalRecord={reached:number;cleared:number;kills:number;bosses:number;elapsed:number;date:string};
/** A record reports the reached wave separately from the last fully cleared wave. */
export function updateSurvivalRecord(previous:SurvivalRecord|null,current:SurvivalRecord):SurvivalRecord {
 if(!previous||current.reached>previous.reached||(current.reached===previous.reached&&current.cleared>previous.cleared))return current;
 return previous;
}
export function validSurvivalCheckpoint(value:unknown,padCount:number):value is SurvivalCheckpoint{
 if(!value||typeof value!=='object')return false;
 const v=value as SurvivalCheckpoint;
 // Selling a tower can legitimately take energy above the normal 900 reward cap.
 if(v.version!==1||!Number.isSafeInteger(v.wave)||v.wave<0||!Number.isFinite(v.energy)||v.energy<0||!Number.isFinite(v.health)||v.health<=0||v.health>100||!Array.isArray(v.built)||v.built.length>padCount||![v.kills,v.bosses,v.elapsed].every(n=>Number.isFinite(n)&&n>=0))return false;
 const seen=new Set<number>();
 return v.built.every(t=>{if(!t||!Number.isInteger(t.slot)||t.slot<0||t.slot>=padCount||seen.has(t.slot)||!Number.isInteger(t.type)||t.type<0||t.type>3||!Number.isInteger(t.level)||t.level<1||t.level>5||!Number.isFinite(t.invested)||t.invested<0)return false;seen.add(t.slot);return true});
}
