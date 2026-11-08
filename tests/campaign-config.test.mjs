import test from 'node:test';
import assert from 'node:assert/strict';
import {campaignMissions,survivalMode} from '../src/game/campaign.ts';

test('campaign IDs, legacy map indices, wave counts and technology caps are stable',()=>{
 assert.equal(campaignMissions.length,10);
 assert.deepEqual(campaignMissions.map(m=>m.legacyIndex),[0,1,2,3,4,5,6,7,8,9]);
 assert.deepEqual(campaignMissions.slice(0,3).map(m=>m.id),['gates','energy','heart']);
 assert.equal(new Set(campaignMissions.map(m=>m.id)).size,10);
 assert.deepEqual(campaignMissions.map(m=>m.waves),[15,17,20,22,24,26,28,30,32,35]);
 assert.deepEqual(campaignMissions.map(m=>m.maxTowerLevel),[3,3,3,3,3,3,4,4,5,5]);
 assert.equal(survivalMode.maxTowerLevel,5);
 assert.equal(survivalMode.bossInterval,10);
 assert.ok(!campaignMissions.some(m=>m.id===survivalMode.id));
});
