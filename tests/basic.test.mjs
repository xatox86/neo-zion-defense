import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('campaign has configured maps and boss wave generation',async()=>{const data=await readFile(new URL('../src/game/campaign.ts',import.meta.url),'utf8')+await readFile(new URL('../src/game/data.ts',import.meta.url),'utf8');assert.match(data,/Врата Зиона/);assert.match(data,/Энергосектор/);assert.match(data,/Сердце города/);assert.match(data,/wave%5===0/)});
test('static entry and Telegram integration exist',async()=>{const source=await readFile(new URL('../src/main.ts',import.meta.url),'utf8');assert.match(source,/viewportStableHeight/);assert.match(source,/visibilitychange/);assert.match(source,/localStorage/)});
