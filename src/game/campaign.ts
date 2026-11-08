/** Stable campaign identifiers preserve the map indexes used by existing saves. */
export type MissionId = 'gates'|'energy'|'heart'|'omega'|'docks';
export type CampaignMission = Readonly<{id:MissionId;legacyIndex:number;name:string;waves:number;maxTowerLevel:3|4|5}>;

/** Campaign rules only; playable map geometry and encounters must be supplied separately. */
export const campaignMissions:readonly CampaignMission[] = [
 {id:'gates',legacyIndex:0,name:'Врата Зиона',waves:15,maxTowerLevel:3},
 {id:'energy',legacyIndex:1,name:'Энергосектор',waves:17,maxTowerLevel:3},
 {id:'heart',legacyIndex:2,name:'Сердце города',waves:20,maxTowerLevel:3},
 {id:'omega',legacyIndex:3,name:'Шахта Омега',waves:22,maxTowerLevel:3},
 {id:'docks',legacyIndex:4,name:'Заброшенные доки',waves:24,maxTowerLevel:3},
];

/** Survival is a separate mode, never a numbered campaign mission. */
export const survivalMode = {id:'survival',name:'Бастион Зиона',maxTowerLevel:5,bossInterval:10} as const;
