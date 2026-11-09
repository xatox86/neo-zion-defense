/** Stable campaign identifiers preserve the map indexes used by existing saves. */
export type MissionId = 'gates'|'energy'|'heart'|'omega'|'docks';
export type CampaignMission = Readonly<{id:MissionId;legacyIndex:number;name:string;waves:number;healthGrowth:number;maxTowerLevel:2|4|5}>;

/** Campaign rules only; playable map geometry and encounters must be supplied separately. */
export const campaignMissions:readonly CampaignMission[] = [
 {id:'gates',legacyIndex:0,name:'Врата Зиона',waves:15,healthGrowth:.085,maxTowerLevel:2},
 {id:'energy',legacyIndex:1,name:'Энергосектор',waves:17,healthGrowth:.075,maxTowerLevel:2},
 {id:'heart',legacyIndex:2,name:'Сердце города',waves:20,healthGrowth:.045,maxTowerLevel:2},
 {id:'omega',legacyIndex:3,name:'Шахта Омега',waves:22,healthGrowth:.07,maxTowerLevel:4},
 {id:'docks',legacyIndex:4,name:'Заброшенные доки',waves:24,healthGrowth:.085,maxTowerLevel:5},
];

/** Survival is a separate mode, never a numbered campaign mission. */
export const survivalMode = {id:'survival',name:'Бастион Зиона',maxTowerLevel:5,bossInterval:10} as const;
