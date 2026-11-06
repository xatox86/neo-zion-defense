export type Point = {x:number,y:number};
export const maps = [
 {name:'Врата Зиона', subtitle:'СЕКТОР 01 / ВНЕШНИЙ ПЕРИМЕТР', waves:15, path:[[.07,.07],[.12,.105],[.72,.105],[.83,.19],[.76,.28],[.20,.28],[.14,.38],[.22,.46],[.77,.46],[.85,.53],[.78,.61],[.22,.61],[.15,.70],[.25,.75],[.50,.82]], pads:[[.22,.17],[.56,.17],[.90,.25],[.39,.35],[.11,.46],[.43,.53],[.67,.35],[.90,.49],[.51,.69],[.12,.62],[.75,.80],[.14,.79]]},
 {name:'Энергосектор', subtitle:'СЕКТОР 02 / СИЛОВЫЕ КОЛОННЫ', waves:15, path:[[.02,.17],[.35,.17],[.44,.27],[.32,.37],[.10,.37],[.10,.49],[.65,.49],[.79,.37],[.90,.43],[.90,.62],[.38,.62],[.26,.74],[.50,.91]], pads:[[.15,.25],[.59,.17],[.63,.31],[.12,.61],[.31,.52],[.51,.40],[.76,.56],[.54,.71],[.09,.76],[.78,.78],[.33,.84],[.92,.22]]},
 {name:'Сердце города', subtitle:'СЕКТОР 03 / РЕАКТОР', waves:20, path:[[.02,.10],[.76,.10],[.89,.20],[.70,.30],[.22,.30],[.10,.40],[.25,.49],[.70,.49],[.87,.60],[.70,.70],[.20,.70],[.14,.80],[.50,.91]], pads:[[.22,.20],[.52,.20],[.90,.32],[.43,.40],[.06,.54],[.45,.59],[.71,.39],[.93,.52],[.54,.79],[.08,.68],[.75,.85],[.31,.88]]}
] as const;
export const towers = [
 {name:'Штурмовой мех',short:'МЕХ',price:100,damage:12,rate:.32,range:.22,color:'#ffad55'},
 {name:'Тесла-узел',short:'ТЕСЛА',price:130,damage:24,rate:1.05,range:.23,color:'#55dfff'},
 {name:'ЭМИ-купол',short:'ЭМИ',price:150,damage:9,rate:1.35,range:.20,color:'#58ffcf'},
 {name:'Рельсотрон',short:'РЕЛЬС',price:200,damage:95,rate:2.7,range:.38,color:'#a4efff'}
] as const;
export const enemyTypes = {
 scout:{name:'Разведчик',hp:65,speed:.105,armor:0,reward:18,damage:1}, swarm:{name:'Рой',hp:38,speed:.12,armor:0,reward:11,damage:1}, armored:{name:'Броневик',hp:220,speed:.058,armor:.3,reward:32,damage:3}, jammer:{name:'Глушитель',hp:150,speed:.07,armor:.1,reward:28,damage:2}, octopus:{name:'Спрут',hp:300,speed:.075,armor:.12,reward:45,damage:3}, carrier:{name:'Носитель',hp:400,speed:.055,armor:.18,reward:50,damage:4}, boss:{name:'СЕРДЦЕ МАШИН',hp:1600,speed:.035,armor:.2,reward:200,damage:12}
} as const;
export type EnemyType = keyof typeof enemyTypes;
export function waveQueue(wave:number):EnemyType[] { const q:EnemyType[]=[]; for(let i=0;i<5+wave*2;i++){let t:EnemyType=wave<2?'scout':i%7===0&&wave>=7?'carrier':i%6===0&&wave>=5?'octopus':i%5===0&&wave>=4?'jammer':i%4===0&&wave>=3?'armored':i%3===0?'swarm':'scout';q.push(t)} if(wave%5===0)q.push('boss');return q; }
