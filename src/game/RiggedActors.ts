/** Articulated 2.5D actors for the Gates of Zion visual study.
 * Positions are canvas-space. Torso, weapon, appendages and coil rings are separate transforms. */
export type TowerPose={type:number;level:number;angle:number;flash:number;cool:number;transition:number;attackAnim:number};
export type EnemyPose={type:string;progress:number;hit:number;hp:number;max:number;stun:number};
export class RiggedActors {
 parts=new Image(); george=new Image();
 constructor(){this.setQuality(true)}
 setQuality(high:boolean){this.parts.src=import.meta.env.BASE_URL+'assets/'+(high?'rig-parts.png':'rig-parts-low.webp');this.george.src=import.meta.env.BASE_URL+'assets/'+(high?'quaternius-george-atlas.png':'quaternius-george-atlas-low.webp')}
 private part(c:CanvasRenderingContext2D,col:number,row:number,x:number,y:number,w:number,h:number,angle=0,flip=false){if(!this.parts.naturalWidth)return;c.save();c.translate(x,y);c.rotate(angle);if(flip)c.scale(-1,1);const sw=this.parts.naturalWidth/4,sh=this.parts.naturalHeight/2;c.drawImage(this.parts,col*sw,row*sh,sw,sh,-w/2,-h/2,w,h);c.restore()}
 private shadow(c:CanvasRenderingContext2D,x:number,y:number,r:number){c.save();c.fillStyle='#000b';c.beginPath();c.ellipse(x,y,r,r*.30,0,0,7);c.fill();c.restore()}
 tower(c:CanvasRenderingContext2D,x:number,y:number,w:number,t:TowerPose,time:number,quality:boolean){const size=w*.17;this.shadow(c,x,y+3,size*.44);c.save();c.translate(x,y);
 if(t.type===0&&this.george.naturalWidth){
  // Real skinning frames baked from the CC0 model's Idle/Shoot actions.
  const firing=t.attackAnim>0,row=firing?1:0,phase=firing?(1-t.attackAnim/.5):((time%3.333)/3.333),frame=Math.min(7,Math.floor(phase*8)),dim=w*.255;
  c.save();if(Math.cos(t.angle)<-.2)c.scale(-1,1);const cell=this.george.naturalWidth/8;c.drawImage(this.george,frame*cell,row*cell,cell,cell,-dim*.5,-dim*.73,dim,dim);c.restore();
  // An independently aimed weapon attachment adds visible traverse and recoil.
  const kick=firing?Math.sin(phase*Math.PI)*size*.06:0;c.save();c.translate(size*.12,-size*.43);c.scale(1,.72);c.rotate(t.angle*.55);c.scale(1,1/.72);this.part(c,2,0,size*.11-kick,0,size*.34,size*.21);c.restore();
  if(t.level>1){c.strokeStyle='#faab5f';c.lineWidth=2;for(let i=1;i<t.level;i++){c.beginPath();c.moveTo(-size*.24+i*3,-size*.62);c.lineTo(-size*.19+i*3,-size*.58);c.stroke()}}
  if(t.flash>0){const mx=Math.cos(t.angle)*size*.30,my=-size*.45+Math.sin(t.angle)*size*.15;c.fillStyle='#fff1ab';c.shadowColor='#ff9e3b';c.shadowBlur=quality?15:3;c.beginPath();c.arc(mx,my,2+t.flash*12,0,7);c.fill();for(let i=0;i<(quality?3:1);i++){c.fillStyle='#efaa5c';c.fillRect(-size*.02-i*3,-size*.15+i*4,3,2)}}
 }else if(t.type===0){
  // Independent hip rotations, torso recoil and weapon traverse.
  const recoil=t.flash/.16,breath=Math.sin(time*2.2)*.018;
  for(const side of [-1,1]){const swing=side*(breath+recoil*.12);this.part(c,1,0,side*size*.20,-size*.14,size*.36,size*.53,swing,side<0)}
  this.part(c,0,0,-Math.cos(t.angle)*recoil*size*.035,-size*.48,size*.67,size*.60,breath*.3);
  c.save();c.translate(size*.22,-size*.45);c.scale(1,.65);c.rotate(t.angle*.55);c.scale(1,1/.65);this.part(c,2,0,size*.18-recoil*size*.07,0,size*.57,size*.34,0);if(t.flash>0){c.fillStyle='#fff4b0';c.shadowColor='#ff9e3b';c.shadowBlur=quality?16:4;c.beginPath();c.moveTo(size*.45,0);c.lineTo(size*.65,-size*.07);c.lineTo(size*.58,0);c.lineTo(size*.65,size*.07);c.closePath();c.fill();for(let i=0;i<(quality?3:1);i++){c.fillStyle='#ffc165';c.fillRect(-size*.04-i*4,size*.08+i*3,3,2)}}c.restore();
  if(t.level>1){c.strokeStyle='#f6ad5e';c.lineWidth=2;for(let i=0;i<t.level;i++){c.beginPath();c.moveTo(-size*.32+i*4,-size*.58);c.lineTo(-size*.29+i*4,-size*.53);c.stroke()}}
 }else{
  this.part(c,3,0,0,-size*.36,size*.60,size*.81);c.save();c.globalCompositeOperation='screen';c.strokeStyle='#83f8ff';c.shadowColor='#25bfff';c.shadowBlur=quality?12:2;c.lineWidth=1.5;for(let i=0;i<2+t.level;i++){const phase=time*2+i*1.3, yy=-size*(.18+i*.12)+Math.sin(phase)*size*.025;c.globalAlpha=.45+.35*Math.sin(phase);c.beginPath();c.ellipse(0,yy,size*(.17+i*.02),size*.045,Math.sin(phase)*.1,0,7);c.stroke()}c.fillStyle='#d8ffff';c.globalAlpha=.65+.3*Math.sin(time*6);c.beginPath();c.arc(0,-size*.70,size*.04,0,7);c.fill();c.restore();
 }
 c.restore()}
 private limb(c:CanvasRenderingContext2D,points:[number,number][],color:string,width:number){c.lineCap='round';c.lineJoin='round';for(const [line,stroke] of [[width*1.8,'#03090b'],[width,'#4d5a5b'],[Math.max(1,width*.23),color]] as [number,string][]){c.lineWidth=line;c.strokeStyle=stroke;c.beginPath();c.moveTo(points[0][0],points[0][1]);for(const p of points.slice(1))c.lineTo(p[0],p[1]);c.stroke()}for(const p of points.slice(1,-1)){c.fillStyle='#9aa7a2';c.beginPath();c.arc(p[0],p[1],width*.35,0,7);c.fill();c.fillStyle=color;c.beginPath();c.arc(p[0],p[1],width*.12,0,7);c.fill()}}
 enemy(c:CanvasRenderingContext2D,x:number,y:number,w:number,e:EnemyPose,time:number,quality:boolean,death=0){const oct=e.type==='octopus',size=w*(oct?.115:.085);this.shadow(c,x,y+4,size*(oct?.43:.5));c.save();c.translate(x,y-(oct?size*.17:0));if(death){c.globalAlpha=Math.max(0,1-death);c.translate(0,death*size*.18);c.rotate(death*.18)}const walk=e.stun>0?0:time*(oct?3.2:10)+e.progress*30;
 if(oct){for(let i=0;i<7;i++){const a=(i-3)*.28,phase=walk+i*.8,side=i-3;const points:[[number,number],[number,number],[number,number],[number,number]]=[[side*size*.035,-size*.07],[side*size*.10+Math.sin(phase)*size*.035,size*.11],[side*size*.17+Math.sin(phase+1)*size*.07,size*.28],[side*size*.23+Math.sin(phase+2)*size*.085,size*.40]];this.limb(c,points,'#ad443e',size*.025);void a}this.part(c,2,1,0,-size*.22+Math.sin(time*3)*size*.03,size*.75,size*.70)}
 else{for(const side of [-1,1])for(let i=0;i<3;i++){const phase=walk+i*1.6+(side>0?Math.PI:0),lift=Math.max(0,Math.sin(phase))*size*.10;const p:[[number,number],[number,number],[number,number]]=[[side*size*.19,-size*.16+i*size*.08],[side*(size*.30+Math.cos(phase)*size*.035),-size*.08+i*size*.09-lift],[side*(size*.46+Math.cos(phase)*size*.06),size*.14+i*size*.045-lift]];this.limb(c,p,'#f26450',size*.025)}this.part(c,0,1,0,-size*.18,size*.70,size*.62)}
 if(e.hit>0){c.globalCompositeOperation='screen';c.globalAlpha=Math.min(.7,e.hit*4);c.fillStyle='#ffe4ba';c.beginPath();c.ellipse(0,-size*.20,size*.25,size*.13,0,0,7);c.fill()}c.restore();if(!death){c.fillStyle='#07100f';c.fillRect(x-size*.30,y-size*.60,size*.6,3);c.fillStyle='#f0775f';c.fillRect(x-size*.30,y-size*.60,size*.6*Math.max(0,e.hp/e.max),3)}}
}
