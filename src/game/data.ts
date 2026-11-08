export type Point = {x:number,y:number};
export const maps = [
 {name:'Врата Зиона', subtitle:'СЕКТОР 01 / ВНЕШНИЙ ПЕРИМЕТР', waves:15, path:[[.07,.07],[.12,.105],[.72,.105],[.83,.19],[.76,.28],[.20,.28],[.14,.38],[.22,.46],[.77,.46],[.85,.53],[.78,.61],[.22,.61],[.15,.70],[.25,.75],[.50,.82]], pads:[[.22,.17],[.56,.17],[.90,.25],[.39,.35],[.11,.46],[.43,.53],[.67,.35],[.90,.49],[.51,.69],[.12,.62],[.75,.80],[.14,.79],[.87,.13],[.14,.30],[.90,.62]]},
 {name:'Энергосектор', subtitle:'СЕКТОР 02 / СИЛОВЫЕ КОЛОННЫ', waves:15, path:[[.02,.14],[.35,.14],[.44,.245],[.34,.335],[.09,.335],[.09,.45],[.66,.45],[.78,.35],[.90,.40],[.90,.57],[.35,.57],[.23,.67],[.50,.87]], pads:[[.14,.22],[.58,.147],[.61,.277],[.12,.546],[.29,.475],[.49,.354],[.74,.504],[.525,.654],[.09,.70],[.76,.705],[.32,.78],[.90,.19]]},
 {name:'Сердце города', subtitle:'СЕКТОР 03 / РЕАКТОР', waves:20, path:[[.02,.107],[.735,.107],[.86,.20],[.71,.285],[.22,.285],[.11,.37],[.22,.46],[.71,.46],[.85,.55],[.71,.64],[.22,.64],[.15,.74],[.28,.79],[.50,.85]], pads:[[.23,.194],[.54,.194],[.89,.31],[.43,.37],[.08,.48],[.44,.55],[.70,.37],[.91,.47],[.53,.73],[.10,.62],[.75,.78],[.30,.82]]}
] as const;
export const towers = [
 {name:'Штурмовой мех',short:'МЕХ',price:100,damage:12,rate:.32,range:.22,color:'#ffad55'},
 {name:'Тесла-узел',short:'ТЕСЛА',price:130,damage:24,rate:1.05,range:.23,color:'#55dfff'},
 {name:'ЭМИ-купол',short:'ЭМИ',price:150,damage:7,rate:1.35,range:.20,color:'#58ffcf'},
 {name:'Рельсотрон',short:'РЕЛЬС',price:200,damage:110,rate:2.7,range:.38,color:'#a4efff'}
] as const;
/** One source of truth for combat, upgrade cost and the tower panel. */
export const MAX_TOWER_LEVEL=5;
export function upgradeCost(type:number,currentLevel:number){return Math.round(towers[type].price*([.9,1.8,2.4,3.1][currentLevel-1]??0))}
export function towerStats(type:number,level:number){const n=Math.max(1,Math.min(MAX_TOWER_LEVEL,level))-1,t=towers[type];return {damage:t.damage*[1,1.8,2.6,3.4,4.3][n],rate:t.rate*[1,.97,.94,.91,.88][n],range:t.range*[1,1.02,1.04,1.06,1.08][n],slow:1.8+n*.2}}
export const enemyTypes = {
 scout:{name:'Разведчик',hp:65,speed:.105,armor:0,reward:14,damage:1}, swarm:{name:'Рой',hp:38,speed:.12,armor:0,reward:8,damage:1}, armored:{name:'Броневик',hp:220,speed:.058,armor:.38,reward:25,damage:3}, jammer:{name:'Глушитель',hp:150,speed:.07,armor:.1,reward:21,damage:2}, octopus:{name:'Спрут',hp:300,speed:.075,armor:.12,reward:34,damage:3}, carrier:{name:'Носитель',hp:400,speed:.055,armor:.18,reward:38,damage:4}, boss:{name:'СЕРДЦЕ МАШИН',hp:1600,speed:.035,armor:.35,reward:150,damage:12}
} as const;
export type EnemyType = keyof typeof enemyTypes;
export function waveQueue(wave:number):EnemyType[] { const q:EnemyType[]=[]; for(let i=0;i<5+wave*2;i++){let t:EnemyType=wave<2?'scout':i%7===0&&wave>=7?'carrier':i%6===0&&wave>=5?'octopus':i%5===0&&wave>=4?'jammer':i%4===0&&wave>=3?'armored':i%3===0?'swarm':'scout';q.push(t)} if(wave%5===0)q.push('boss');return q; }
