/** Stable campaign identifiers preserve the map indexes used by existing saves. */
export type MissionId = 'gates'|'energy'|'heart'|'omega'|'docks'|'port'|'titan'|'rift'|'reactor'|'last-stand';
export type CampaignMission = Readonly<{id:MissionId;legacyIndex:number;name:string;waves:number;maxTowerLevel:3|4|5}>;

/** Campaign rules only; playable map geometry and encounters must be supplied separately. */
export const campaignMissions:readonly CampaignMission[] = [
 {id:'gates',legacyIndex:0,name:'Врата Зиона',waves:15,maxTowerLevel:3},
 {id:'energy',legacyIndex:1,name:'Энергосектор',waves:17,maxTowerLevel:3},
 {id:'heart',legacyIndex:2,name:'Сердце города',waves:20,maxTowerLevel:3},
 {id:'omega',legacyIndex:3,name:'Шахта Омега',waves:22,maxTowerLevel:3},
 {id:'docks',legacyIndex:4,name:'Заброшенные доки',waves:24,maxTowerLevel:3},
 {id:'port',legacyIndex:5,name:'Подземный порт',waves:26,maxTowerLevel:3},
 {id:'titan',legacyIndex:6,name:'Титановый рубеж',waves:28,maxTowerLevel:4},
 {id:'rift',legacyIndex:7,name:'Машинный разлом',waves:30,maxTowerLevel:4},
 {id:'reactor',legacyIndex:8,name:'Реакторный контур',waves:32,maxTowerLevel:5},
 {id:'last-stand',legacyIndex:9,name:'Последний рубеж',waves:35,maxTowerLevel:5},
];

/** Survival is a separate mode, never a numbered campaign mission. */
export const survivalMode = {id:'survival',name:'Бастион Зиона',maxTowerLevel:5,bossInterval:10} as const;
