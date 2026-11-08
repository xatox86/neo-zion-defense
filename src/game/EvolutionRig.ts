import type {TowerPose} from './RiggedActors';
import {towerStats} from './data';
import {railPivot,railBarrelReach,teslaEmitter} from './geometry';

/** Separate sprite layers for the approved IV/V silhouettes. All coordinates are local to
 * the existing build-pad anchor. Temporary attack effects are rendered independently. */
export class EvolutionRig {
 private sheets=Array.from({length:8},()=>new Image());
 constructor(){this.setQuality(true)}
 setQuality(high:boolean){const names=['mech-iv','mech-v','tesla-iv','tesla-v','emp-iv','emp-v','rail-iv','rail-v'];this.sheets.forEach((im,i)=>{im.src=import.meta.env.BASE_URL+'assets/evolution-'+names[i]+(high?'':'-low')+'.webp'})}
 ready(type:number,level:number){const im=this.sheets[type*2+level-4];return !!im&&im.complete&&im.naturalWidth>0}
 private part(c:CanvasRenderingContext2D,im:HTMLImageElement,index:number,x:number,y:number,w:number,h:number,angle=0,flip=false){
  if(!im.naturalWidth)return;c.save();c.translate(x,y);c.rotate(angle);if(flip)c.scale(-1,1);const sw=im.naturalWidth/2,sh=im.naturalHeight/2;c.drawImage(im,(index%2)*sw,Math.floor(index/2)*sh,sw,sh,-w/2,-h/2,w,h);c.restore();
 }
 private ring(c:CanvasRenderingContext2D,im:HTMLImageElement,index:number,x:number,y:number,w:number,h:number,angle:number){c.save();c.translate(x,y);c.scale(1,.40);c.rotate(angle);c.scale(1,2.5);this.part(c,im,index,0,0,w,h);c.restore()}
 draw(c:CanvasRenderingContext2D,size:number,t:TowerPose,time:number,quality:boolean){
  const im=this.sheets[t.type*2+t.level-4];if(!im?.naturalWidth){c.save();c.fillStyle='#20383b';c.beginPath();c.ellipse(0,0,size*.42,size*.16,0,0,Math.PI*2);c.fill();c.restore();return}
  const rate=towerStats(t.type,t.level).rate,charge=t.cool>0?Math.max(0,Math.min(1,1-t.cool/(rate*.38))):0,fire=Math.max(0,Math.min(1,t.flash/.16)),attack=Math.max(0,Math.min(1,t.attackAnim/.5)),motion=Math.sin(time*2);
  const part=(i:number,x:number,y:number,w:number,h:number,a=0,flip=false)=>this.part(c,im,i,x*size,y*size,w*size,h*size,a,flip);
  if(t.type===0&&t.level===4){
   // TITAN: independent bipedal legs, chest and both weapon arms.
   part(1,-.19,-.10,.34,.65,-.025*motion,true);part(1,.19,-.10,.34,.65,.025*motion);
   part(0,0,-.53,.72,.72,.018*motion);part(3,-.32,-.57,.23,.25,-.06*motion,true);part(3,.32,-.57,.23,.25,.06*motion);
   c.save();c.translate(-size*.26,-size*.51);c.rotate(-.12+.04*motion);part(2,-.13,0,.48,.34,0,true);c.restore();
   c.save();c.translate(size*.25,-size*.51);c.rotate(t.angle);part(2,.15-fire*.04,0,.56,.36);if(fire){c.fillStyle='#ffce83';c.beginPath();c.arc(size*(.39-.04*fire),size*.12,size*.035,0,7);c.fill()}c.restore();
  }else if(t.type===0){
   // COLOSSUS is a new stationary fort: no inherited torso or legs.
   part(0,0,-.08,1.00,.64);const reactorRing=this.sheets[3];if(reactorRing.naturalWidth)this.ring(c,reactorRing,1,0,-size*.32,size*.62,size*.18,time*(.55+charge));for(const side of [-1,1])part(3,side*.37,-.12,.28,.25,side*(.07+.30*attack),side<0);
   for(const side of [-1,1]){c.save();c.translate(side*size*.33,-size*.29);c.rotate(t.angle*.65);part(2,side*.04,0,.32,.22);c.restore()}
   c.save();c.translate(0,-size*.35);c.rotate(t.angle);part(1,.12-fire*.04,0,.98,.49);if(fire){c.fillStyle='#e2ffff';c.beginPath();c.arc(size*(.57-fire*.04),-size*.13,size*.04,0,7);c.fill()}c.restore();
  }else if(t.type===1){
   // Distinct tall Storm Reactor IV and low Storm Crown V assemblies.
   part(0,0,-.24,1.05,t.level===4?.92:.69);
   if(t.level===5){for(const side of [-1,1])part(2,side*.38,-.12,.28,.25,side*(.08+.30*attack),side<0)}
   const emitters=t.level===5&&this.sheets[2].naturalWidth?this.sheets[2]:im;for(let i=0;i<4;i++){const v=teslaEmitter(size,i),a=(t.targetAngles?.[i]??t.angle);c.save();c.translate(v.x,v.y);c.rotate(Math.max(-.25,Math.min(.25,Math.sin(a)*.25))*attack);this.part(c,emitters,2,0,size*.13,size*.20,size*.28);c.restore()}
   const top=t.level===4?-.71:-.55;this.ring(c,im,1,0,size*top,size*(t.level===4?.77:1.02),size*.30,time*(1+charge*3+fire*3));
   if(t.level===4)this.ring(c,im,1,0,-size*.42,size*.66,size*.24,-time*(.8+charge*2));
   c.save();c.translate(0,size*(top-.10));c.scale(1-fire*.20,1+fire*.10);part(3,0,0,.24,.24);c.restore();
  }else if(t.type===2){
   // Six separately hinged phase emitters/stabilizers, without an EMP dome.
   part(0,0,-.10,1.0,.55);for(let i=0;i<6;i++){const a=i*Math.PI/3,px=Math.cos(a)*.34,py=Math.sin(a)*.16-.15,open=.08+.24*charge+.24*attack;
    if(t.level===4)part(2,px,py,.27,.31,Math.cos(a)*open,Math.cos(a)<0);
    else {part(1,px,py,.30,.30,Math.cos(a)*(open+.04*Math.sin(time*2+i)),Math.cos(a)<0);part(2,px*.80,py+.08,.24,.18,Math.cos(a)*open,Math.cos(a)<0)}
   }c.save();c.translate(0,-size*(t.level===5?.36:.24)+Math.sin(time*2)*size*.018);c.scale(1-.16*fire,1+.12*fire);part(3,0,0,.25,.25);c.restore();
  }else{
   // Shared aim pivot and muzzle geometry with the combat simulation.
   part(0,0,-.04,.98,.57);c.save();c.translate(0,railPivot(size));c.rotate(t.angle);part(1,-.12,0,.62,.48);
   if(t.level===4){for(let i=0;i<2;i++){const kick=fire*.055*(i===0?1:.55);c.save();c.rotate((t.targetAngles?.[i]??t.angle)-t.angle);part(2,.20-kick,(i?1:-1)*.08,.70,.23);if(fire){c.fillStyle='#dfffff';c.beginPath();c.arc(railBarrelReach(size,t.flash,4),(i?1:-1)*size*.08,size*.025,0,7);c.fill()}c.restore()}part(3,-.23,-.16,.30,.22,-.05*motion-.14*attack-.10*charge);if(charge>0){c.save();c.globalAlpha=.35+.55*charge;c.fillStyle='#90f8ff';for(let j=0;j<3;j++)c.fillRect(size*(-.18+j*.12),-size*.04,size*.045,size*.025);c.restore()}}
   else {for(const side of [-1,1])part(2,.22-fire*.055,side*.10,.83,.22,0,side<0);part(3,-.28,0,.31,.36,.04*motion+.10*attack);if(charge>0||fire){c.strokeStyle='#55dfff';c.lineWidth=Math.max(1,size*.012);c.globalAlpha=.4+.5*charge;c.beginPath();c.moveTo(-size*.16,-size*.09);for(let i=0;i<5;i++){const x=-.12+i*.12;c.lineTo(size*x,size*((i%2?1:-1)*(.025+.015*Math.sin(time*17+i))))}c.lineTo(size*.48,size*.09);c.stroke();for(let i=0;i<3;i++){c.fillStyle=charge>(i/3)?'#baffff':'#31555d';c.fillRect(size*(-.12+i*.18),-size*.13,size*.045,size*.018)}c.globalAlpha=1;c.fillStyle='#b8ffff';c.globalAlpha=.35+.55*Math.max(charge,fire);c.beginPath();c.arc(size*(-.12+.54*charge),0,size*(.025+.02*charge),0,7);c.fill();c.globalAlpha=1}if(fire){c.fillStyle='#ecffff';c.beginPath();c.arc(railBarrelReach(size,t.flash,5),0,size*.05,0,7);c.fill()}}
   c.restore();
  }
  void quality;
 }
}

