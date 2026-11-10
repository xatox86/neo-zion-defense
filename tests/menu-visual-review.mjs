import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
await mkdir('artifacts/menu-review',{recursive:true});
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for(const [w,h] of [[390,608],[390,844],[360,740],[430,932]]){
 const p=await b.newPage({viewport:{width:w,height:h},isMobile:true,hasTouch:true});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://localhost:5183/neo-zion-defense/');await p.waitForTimeout(1400);
 const layout=await p.evaluate(()=>{const app=document.querySelector('#app').getBoundingClientRect();const out={};for(const s of ['.menu-top','.hero h1','.map-select','#survival','#play','.footnote']){let r=document.querySelector(s).getBoundingClientRect();out[s]={top:r.top,bottom:r.bottom,left:r.left,right:r.right}}return {app:{top:app.top,bottom:app.bottom},out}});
 if(errors.length)throw new Error(errors.join(','));for(const r of Object.values(layout.out))if(r.top<layout.app.top-1||r.bottom>layout.app.bottom+1||r.left<0||r.right>w)throw new Error(JSON.stringify({w,h,layout}));
 await p.screenshot({path:`artifacts/menu-review/menu-${w}x${h}.png`,animations:'disabled',timeout:60000});console.log(w,h,'ok');await p.close();
}
const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await p.route('**/telegram-web-app.js',route=>route.fulfill({status:200,body:''}));
await p.addInitScript(()=>{localStorage.setItem('zion-settings',JSON.stringify({unlocked:4,quality:true}));window.Telegram={WebApp:{viewportHeight:480,viewportStableHeight:480,safeAreaInset:{top:8,bottom:8},contentSafeAreaInset:{top:0,bottom:0},ready(){},expand(){},onEvent(){},BackButton:{hide(){},onClick(){}}}}});
await p.goto('http://localhost:5183/neo-zion-defense/');await p.locator('[data-map="4"]').tap();if(await p.locator('[data-map="4"]').getAttribute('aria-pressed')!=='true')throw Error('Fifth mission selection failed');
await p.locator('#survival').tap();if(await p.locator('#survival').getAttribute('aria-pressed')!=='true')throw Error('Survival selection failed');
await p.locator('[data-map="0"]').tap();if(await p.locator('#survival').getAttribute('aria-pressed')!=='false')throw Error('Survival remains selected after switching to campaign');await p.locator('#survival').tap();
const bounds=await p.locator('#play').boundingBox();await p.locator('#app').screenshot({path:'artifacts/menu-review/menu-telegram-480.png',animations:'disabled',timeout:60000});if(bounds.y<0||bounds.y+bounds.height>480)throw Error('Play button outside Telegram viewport: '+JSON.stringify(bounds));
console.log('Telegram compact selection ok');await p.close();
await b.close();
