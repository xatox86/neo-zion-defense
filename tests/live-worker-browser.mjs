import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {resolve,sep} from 'node:path';

// Serve the built client inside an ephemeral browser context at the authorized
// production origin. This does not write to the published site or its saves.
const root=resolve('dist'),origin='https://xatox86.github.io',base='/neo-zion-defense/';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/telegram-web-app.js',route=>route.fulfill({status:200,body:''}));
await page.route(origin+base+'**',route=>{
 const url=new URL(route.request().url()),relative=url.pathname.slice(base.length)||'index.html';
 const path=resolve(root,relative);
 if(path!==root&&!path.startsWith(root+sep))return route.abort();
 return route.fulfill({path}).catch(()=>route.abort());
});
await page.addInitScript(()=>{window.Telegram={WebApp:{initData:'auth_date=1&user=%7B%22id%22%3A1%7D&hash=fake',ready(){},expand(){},onEvent(){},BackButton:{hide(){},show(){},onClick(){}}}}});
await page.goto(origin+base);const request=page.waitForResponse(r=>r.url().includes('zion-survival-leaderboard.creator-of-everything777.workers.dev/v1/leaderboard'));
await page.locator('#ranking').tap();const response=await request;
assert.equal(response.status(),401);assert.equal(response.headers()['access-control-allow-origin'],origin);
await page.waitForFunction(()=>document.querySelector('.leaderboard-status')?.textContent?.includes('Авторизация Telegram'));
assert.deepEqual(errors,[]);console.log('Browser at authorized origin reached the real Worker; unsigned synthetic initData rejected with 401 and valid CORS.');
await browser.close();
