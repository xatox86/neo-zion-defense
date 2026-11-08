import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await p.goto('http://localhost:5178/neo-zion-defense/');await p.locator('#play').tap();
const result=await p.evaluate(async()=>{
 const g=window.__zion,r=g.rigs.enemyMachines;await Promise.all([...r.bodies,...r.parts].map(i=>i.decode()));
 const c=document.createElement('canvas');c.width=320;c.height=320;const x=c.getContext('2d');
 function render(type,time,heading=0,hp=100,hit=0,death=0){x.clearRect(0,0,320,320);r.draw(x,160,190,1100,{type,progress:.4,hp,max:100,hit,stun:0,heading},time,true,death);return x.getImageData(0,0,320,320).data}
 function diff(a,b){let n=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])+Math.abs(a[i+3]-b[i+3])>35)n++;return n}
 const rows=[];for(const type of ['scout','swarm','armored','jammer','octopus','carrier','boss']){const a=render(type,0);rows.push({type,motion:diff(a,render(type,1)),turn:diff(a,render(type,0,Math.PI)),hit:diff(a,render(type,0,0,100,.16)),death:diff(a,render(type,0,0,100,0,.6))})}
 const first=render('boss',0,0,100),second=render('boss',0,0,60),third=render('boss',0,0,20);
 return {rows,bossPhase12:diff(first,second),bossPhase23:diff(second,third)};
});
for(const row of result.rows)for(const key of ['motion','turn','hit','death'])assert.ok(row[key]>20,JSON.stringify(row));assert.ok(result.bossPhase12>20&&result.bossPhase23>20);
await writeFile('artifacts/enemy-machines/visual-test.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));await b.close();
