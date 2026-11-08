import type {TowerPose} from './RiggedActors';
import {towerStats} from './data';

/** Stage-specific components for the approved mech and Tesla I–III silhouettes. */
export class EarlyTowerRig {
 sheets=Array.from({length:6},()=>new Image());
 constructor(){this.setQuality(true)}
 setQuality(high:boolean){for(let type=0;type<2;type++)for(let level=1;level<=3;level++)this.sheets[type*3+level-1].src=import.meta.env.BASE_URL+`assets/early-${type===0?'mech':'tesla'}-${level}${high?'':'-low'}.webp`}
 ready(type:number,level:number){const im=this.sheets[type*3+level-1];return !!im?.naturalWidth}
 private part(c:CanvasRenderingContext2D,im:HTMLImageElement,index:number,x:number,y:number,w:number,h:number,angle=0,flip=false){if(!im.naturalWidth)return;c.save();c.translate(x,y);c.rotate(angle);if(flip)c.scale(-1,1);const sw=im.naturalWidth/2,sh=im.naturalHeight/2;c.drawImage(im,index%2*sw,Math.floor(index/2)*sh,sw,sh,-w/2,-h/2,w,h);c.restore()}
 draw(c:CanvasRenderingContext2D,size:number,t:TowerPose,time:number,quality:boolean){
  const im=this.sheets[t.type*3+t.level-1];if(!im?.naturalWidth)return;
  const fire=Math.max(0,Math.min(1,t.flash/.16)),rate=towerStats(t.type,t.level).rate,charge=t.cool>0?Math.max(0,Math.min(1,1-t.cool/(rate*.38))):0,motion=Math.sin(time*2.3);
  const part=(i:number,x:number,y:number,w:number,h:number,a=0,flip=false)=>this.part(c,im,i,x*size,y*size,w*size,h*size,a,flip);
  if(t.type===0){
   // Fixed torso and independently articulated legs and traversing gun arm.
   for(const side of [-1,1])part(1,side*.18,-.11,.33,.51,side*(.025*motion+.045*fire),side<0);
   part(0,-.01-fire*.014,-.45,.65,.57,.008*motion);
   part(3,-.25,-.48,.23,.21,-.035*motion,true);
   c.save();c.translate(size*.22,-size*.45);c.scale(1,.65);c.rotate(t.angle);c.scale(1,1/.65);part(2,.15-fire*.035,0,.60,.35);if(fire){c.fillStyle='#fff1ba';c.shadowColor='#ffa443';c.shadowBlur=quality?size*.12:0;c.beginPath();c.arc(size*(.45-fire*.035),0,size*.032,0,Math.PI*2);c.fill()}c.restore();
  }else{
   // Coils are separate components, never scaled miniature complete towers.
   if(t.level===1){part(0,0,-.10,.76,.46);part(2,0,-.38,.27,.45);part(3,0,-.55+motion*.008,.13,.13)}
   else if(t.level===2){part(0,0,-.15,.88,.55);for(const side of [-1,1])part(2,side*.22,-.39,.22,.42,side*.008*motion)}
   else {part(0,0,-.34,.88,.82);for(let i=0;i<2;i++){c.save();c.translate(0,-size*(.43+i*.19));c.scale(1,.42);c.rotate((i?1:-1)*time*(.6+charge));c.scale(1,1/.42);part(1,0,0,.55,.20);c.restore()}part(3,0,-.65,.14,.14)}
   if(fire){c.save();c.globalCompositeOperation='screen';c.globalAlpha=.45*fire;c.fillStyle='#d8ffff';c.shadowColor='#39dfff';c.shadowBlur=quality?size*.15:0;c.beginPath();c.arc((t.level===2?-.22:0)*size,-size*(t.level===1?.55:t.level===2?.56:.65),size*.035,0,Math.PI*2);c.fill();c.restore()}
  }
 }
}
