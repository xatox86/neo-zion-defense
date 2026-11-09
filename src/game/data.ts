import {campaignMissions} from './campaign';
export type Point = {x:number,y:number};
export const maps = [
 {name:campaignMissions[0].name, subtitle:'СЕКТОР 01 / ВНЕШНИЙ ПЕРИМЕТР', waves:campaignMissions[0].waves, path:[[.07,.07],[.12,.105],[.72,.105],[.83,.19],[.76,.28],[.20,.28],[.14,.38],[.22,.46],[.77,.46],[.85,.53],[.78,.61],[.22,.61],[.15,.70],[.25,.75],[.50,.82]], pads:[[.22,.17],[.56,.17],[.90,.25],[.39,.35],[.11,.46],[.43,.53],[.67,.35],[.90,.49],[.51,.69],[.12,.62],[.75,.80],[.14,.79],[.87,.13],[.14,.30],[.90,.62]]},
 {name:campaignMissions[1].name, subtitle:'СЕКТОР 02 / СИЛОВЫЕ КОЛОННЫ', waves:campaignMissions[1].waves, path:[[.02,.14],[.35,.14],[.44,.245],[.34,.335],[.09,.335],[.09,.45],[.66,.45],[.78,.35],[.90,.40],[.90,.57],[.35,.57],[.23,.67],[.50,.87]], pads:[[.14,.22],[.58,.147],[.61,.277],[.12,.546],[.29,.475],[.49,.354],[.74,.504],[.525,.654],[.09,.70],[.76,.705],[.32,.78],[.90,.19]]},
 {name:campaignMissions[2].name, subtitle:'СЕКТОР 03 / РЕАКТОР', waves:campaignMissions[2].waves, path:[[.02,.107],[.735,.107],[.86,.20],[.71,.285],[.22,.285],[.11,.37],[.22,.46],[.71,.46],[.85,.55],[.71,.64],[.22,.64],[.15,.74],[.28,.79],[.50,.85]], pads:[[.23,.194],[.54,.194],[.89,.31],[.43,.37],[.08,.48],[.44,.55],[.70,.37],[.91,.47],[.53,.73],[.10,.62],[.75,.78],[.30,.82]]},
 {name:campaignMissions[3].name, subtitle:'СЕКТОР 04 / ШАХТА ОМЕГА',waves:campaignMissions[3].waves,path:[[.04,.10],[.66,.10],[.80,.17],[.73,.24],[.32,.24],[.14,.32],[.18,.40],[.70,.40],[.85,.47],[.80,.55],[.31,.55],[.14,.63],[.22,.71],[.68,.71],[.77,.79],[.50,.88]],pads:[[.23,.17],[.54,.17],[.85,.25],[.38,.33],[.08,.40],[.44,.47],[.73,.33],[.91,.55],[.49,.63],[.10,.57],[.69,.80],[.16,.80]]},
 {name:campaignMissions[4].name,subtitle:'СЕКТОР 05 / ДОКИ',waves:campaignMissions[4].waves,path:[[.94,.08],[.35,.08],[.18,.15],[.23,.23],[.75,.23],[.86,.31],[.76,.39],[.28,.39],[.13,.47],[.25,.55],[.72,.55],[.86,.63],[.76,.71],[.34,.71],[.22,.78],[.50,.88]],pads:[[.60,.15],[.23,.16],[.86,.18],[.42,.30],[.09,.32],[.57,.46],[.89,.41],[.12,.57],[.54,.63],[.90,.71],[.32,.81],[.70,.79]]},
 {name:'Бастион Зиона',subtitle:'ВЫЖИВАНИЕ / БАСТИОН',waves:0,path:[[.05,.08],[.71,.08],[.85,.16],[.75,.24],[.25,.24],[.12,.32],[.25,.40],[.72,.40],[.86,.48],[.72,.56],[.27,.56],[.14,.64],[.29,.72],[.68,.72],[.78,.80],[.50,.89]],pads:[[.22,.16],[.55,.16],[.89,.23],[.43,.32],[.08,.40],[.50,.48],[.76,.33],[.91,.56],[.50,.64],[.09,.60],[.75,.80],[.20,.80],[.91,.12]]}
] as const;
export const towers = [
 {name:'Штурмовой мех',short:'МЕХ',price:100,damage:12,rate:.32,range:.22,color:'#ffad55'},
 {name:'Тесла-узел',short:'ТЕСЛА',price:130,damage:24,rate:1.05,range:.23,color:'#55dfff'},
 {name:'ЭМИ-купол',short:'ЭМИ',price:150,damage:7,rate:1.35,range:.20,color:'#58ffcf'},
 {name:'Рельсотрон',short:'РЕЛЬС',price:200,damage:110,rate:2.7,range:.38,color:'#a4efff'}
] as const;
/** One source of truth for combat, upgrade cost and the tower panel. */
export const MAX_TOWER_LEVEL=5;
export function upgradeCost(type:number,currentLevel:number){const factors=type===1?[.9,1.8,2.5,3.35]:[.9,1.8,2.4,3.1];return Math.round(towers[type].price*(factors[currentLevel-1]??0))}
export function towerStats(type:number,level:number){const n=Math.max(1,Math.min(MAX_TOWER_LEVEL,level))-1,t=towers[type];const damage=type===1?[1,1.8,2.6,3.2,4.0]:[1,1.8,2.6,3.4,4.3],rate=type===1?[1,.97,.94,.96,.90]:[1,.97,.94,.91,.88];return {damage:t.damage*damage[n],rate:t.rate*rate[n],range:t.range*[1,1.02,1.04,1.06,1.08][n],slow:1.8+n*.2}}
export function teslaTargets(level:number){return [3,5,7,7,9][Math.max(1,Math.min(5,level))-1]}
export const enemyTypes = {
 scout:{name:'Разведчик',hp:65,speed:.105,armor:0,reward:14,damage:1}, swarm:{name:'Рой',hp:38,speed:.12,armor:0,reward:8,damage:1}, armored:{name:'Броневик',hp:220,speed:.058,armor:.38,reward:25,damage:3}, jammer:{name:'Глушитель',hp:150,speed:.07,armor:.1,reward:21,damage:2}, octopus:{name:'Спрут',hp:300,speed:.075,armor:.12,reward:34,damage:3}, carrier:{name:'Носитель',hp:400,speed:.055,armor:.18,reward:38,damage:4}, boss:{name:'СЕРДЦЕ МАШИН',hp:1600,speed:.035,armor:.35,reward:150,damage:12}
} as const;
export type EnemyType = keyof typeof enemyTypes;
export function waveQueue(wave:number):EnemyType[] { const q:EnemyType[]=[]; for(let i=0;i<5+wave*2;i++){let t:EnemyType=wave<2?'scout':i%7===0&&wave>=7?'carrier':i%6===0&&wave>=5?'octopus':i%5===0&&wave>=4?'jammer':i%4===0&&wave>=3?'armored':i%3===0?'swarm':'scout';q.push(t)} if(wave%5===0)q.push('boss');return q; }

/** Mission-specific machine formations. The first operation keeps its original roster. */
export function campaignWave(wave:number,mission:number):EnemyType[]{
 const queue=waveQueue(wave);
 if(mission>0&&wave>=4){for(let i=0;i<queue.length;i++){
  if(queue[i]==='boss')continue;
  if(mission===1&&i%9===2)queue[i]='jammer';
  if(mission===2&&wave>=6&&i%10===3)queue[i]='octopus';
  if(mission===3&&wave>=8&&i%15===3)queue[i]='armored';
  if(mission===4&&wave>=12&&i%16===4)queue[i]='carrier';
 }}
 if(mission>0&&wave===maps[mission].waves&&!queue.includes('boss'))queue.push('boss');
 return queue;
}
