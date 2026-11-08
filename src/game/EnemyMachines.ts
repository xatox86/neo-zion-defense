import type {EnemyPose} from './RiggedActors';

const kinds=['scout','swarm','armored','jammer','octopus','carrier','boss'] as const;

/** Directional machine artwork and separately animated mechanical components. */
export class EnemyMachines {
 bodies=kinds.map(()=>new Image()); parts=kinds.map(()=>new Image());
 constructor(){this.setQuality(true)}
 setQuality(high:boolean){kinds.forEach((name,i)=>{const suffix=high?'':'-low';this.bodies[i].src=import.meta.env.BASE_URL+`assets/enemy2-${name}${suffix}.webp`;this.parts[i].src=import.meta.env.BASE_URL+`assets/enemy2-${name}-parts${suffix}.webp`})}
 ready(type:string){const i=kinds.indexOf(type as typeof kinds[number]);return i>=0&&this.bodies[i].naturalWidth>0&&this.parts[i].naturalWidth>0}
 private tile(c:CanvasRenderingContext2D,img:HTMLImageElement,index:number,x:number,y:number,w:number,h:number,angle=0,flip=false){if(!img.naturalWidth)return;c.save();c.translate(x,y);c.rotate(angle);if(flip)c.scale(-1,1);const sw=img.naturalWidth/2,sh=img.naturalHeight/2;c.drawImage(img,(index%2)*sw,Math.floor(index/2)*sh,sw,sh,-w/2,-h/2,w,h);c.restore()}
 draw(c:CanvasRenderingContext2D,x:number,y:number,w:number,e:EnemyPose,time:number,quality:boolean,death=0){
  const id=kinds.indexOf(e.type as typeof kinds[number]);if(id<0||!this.ready(e.type))return false;
  const boss=id===6,oct=id===4,size=w*(boss?.18:id===5?.15:oct?.115:id===1?.085:.105),body=this.bodies[id],parts=this.parts[id];
  const heading=e.heading??0;const sector=(Math.round(heading/(Math.PI/4))+8)%8;
  const view=[3,0,0,1,1,2,2,3][sector],flip=[false,false,true,false,true,false,true,true][sector];
  const phase=Math.max(0,Math.min(1,e.hp/e.max)),t=e.stun>0?e.progress*30:time*(id===2?5:8)+e.progress*30;
  c.save();c.fillStyle='#0009';c.beginPath();c.ellipse(x,y+2,size*.39,size*.105,0,0,Math.PI*2);c.fill();c.translate(x,y-size*.28+(id===2?Math.sin(t)*size*.012:Math.sin(t*.4)*size*.025));
  const deathAlpha=death?Math.max(0,1-Math.max(0,death-.55)*2.2):1;c.globalAlpha=deathAlpha;
  // Small detached limbs and mechanisms animate independently of the directional hull.
  if(id===2||oct){for(let i=0;i<6;i++){const side=i<3?-1:1,rank=i%3,walk=Math.sin(t+rank*2.1+(side>0?Math.PI:0));this.tile(c,parts,0,side*size*(.27+rank*.025),size*(.03+rank*.035)-Math.max(0,walk)*size*.035,size*.30,size*.34,side*(.12+walk*.22),side<0)}}
  this.tile(c,body,view,0,0,size,size,0,flip);
  if(id===0){for(const side of [-1,1])this.tile(c,parts,0,side*size*.32,-size*.04,size*.29,size*.25,side*(Math.sin(t)*.16),side<0)}
  if(id===1){for(let i=0;i<3;i++){const a=time*2.4+i*Math.PI*2/3;this.tile(c,parts,0,Math.cos(a)*size*.19,Math.sin(a)*size*.07-size*.05,size*.24,size*.17,a*.16,i===1)}}
  if(id===3){for(let i=0;i<4;i++){const a=time*1.8+i*Math.PI/2;this.tile(c,parts,0,Math.cos(a)*size*.26,Math.sin(a)*size*.08-size*.10,size*.16,size*.23,Math.sin(a)*.15)}c.save();c.strokeStyle='#ff5455';c.globalAlpha=.25+.12*Math.sin(time*4);c.lineWidth=1;c.beginPath();c.ellipse(0,size*.05,size*.48,size*.16,0,0,Math.PI*2);c.stroke();c.restore()}
  if(id===5){const opening=.08+.18*(.5+.5*Math.sin(time*2));for(let i=-1;i<=1;i++)this.tile(c,parts,0,i*size*.18,size*.10,size*.23,size*.19,opening)}
  if(boss){const opening=phase>2/3?.02:phase>1/3?.12:.24;for(let i=0;i<6;i++){const a=i*Math.PI/3;const spread=opening+(death?Math.max(0,death-.1)*.35:0);this.tile(c,parts,0,Math.cos(a)*size*(.25+spread),Math.sin(a)*size*(.15+spread*.65),size*.24,size*.22,a*.16,Math.cos(a)<0)}c.save();c.globalCompositeOperation='screen';c.fillStyle=phase>1/3?'#ff5942':'#fff0c4';c.shadowColor='#fa3838';c.shadowBlur=quality?size*.20:0;c.globalAlpha=(phase>2/3?.25:phase>1/3?.45:.75)*(.8+.2*Math.sin(time*7));c.beginPath();c.arc(0,-size*.03,size*(phase>2/3?.035:phase>1/3?.055:.075),0,Math.PI*2);c.fill();c.restore()}
  if(e.hit>0){c.save();c.globalCompositeOperation='screen';c.globalAlpha=Math.min(.6,e.hit*3);c.fillStyle='#ffe2ba';c.beginPath();c.ellipse(0,0,size*.23,size*.12,0,0,Math.PI*2);c.fill();c.restore()}
  if(death){c.save();c.globalCompositeOperation='screen';c.globalAlpha=Math.sin(Math.PI*death);c.fillStyle=boss&&death<.55?'#ff6a35':'#ffe0a3';for(let i=0;i<(quality?5:2);i++){const a=i*2.4+time*3,r=size*(.08+death*.45);c.fillRect(Math.cos(a)*r,Math.sin(a)*r*.55,Math.max(1,size*.025),Math.max(1,size*.02))}if(boss&&death>.58){c.globalAlpha=Math.sin(Math.PI*(death-.58)/.42);c.fillStyle='#fff5bb';c.shadowColor='#ff3925';c.shadowBlur=quality?size*.3:0;c.beginPath();c.arc(0,0,size*(death-.58)*.32,0,Math.PI*2);c.fill()}else if(id===3){c.strokeStyle='#ff5555';c.beginPath();c.ellipse(0,0,size*death*.55,size*death*.18,0,0,Math.PI*2);c.stroke()}else if(id===5){for(const side of [-1,1]){c.fillStyle='#ff8a32';c.beginPath();c.arc(side*size*.22,0,size*death*.08,0,Math.PI*2);c.fill()}}c.restore()}
  c.restore();if(!death){c.fillStyle='#07100f';c.fillRect(x-size*.30,y-size*.78,size*.6,3);c.fillStyle='#f0775f';c.fillRect(x-size*.30,y-size*.78,size*.6*phase,3)}return true;
 }
}
