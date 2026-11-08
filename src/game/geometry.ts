/** Geometry is shared by the rotating gun, muzzle flash, and projectile origin. */
export function railPivot(size:number){return -size*.23}
export function railBarrelReach(size:number,flash:number,level=1){return size*((level>=5?.68:.55)-.055*Math.max(0,Math.min(1,flash/.16)))}
export function railMuzzle(size:number,angle:number,flash:number,level=1,barrel=0){
 const reach=railBarrelReach(size,flash,level),offset=level===4?(barrel%2===0?-.08:.08)*size:0;
 return {x:Math.cos(angle)*reach-Math.sin(angle)*offset,y:railPivot(size)+Math.sin(angle)*reach+Math.cos(angle)*offset};
}
/** Direction whose ray from a barrel's lateral offset intersects its target. */
export function railAim(size:number,level:number,barrel:number,dx:number,dy:number){
 const offset=level===4?(barrel%2===0?-.08:.08)*size:0,dist=Math.max(1e-6,Math.hypot(dx,dy));
 return Math.atan2(dy,dx)-Math.asin(Math.max(-1,Math.min(1,offset/dist)));
}
/** Coordinates relative to a tower's ground contact point in canvas pixels. */
export function mechMuzzle(size:number,angle:number,flash:number,level:number){
 if(level<=3){const reach=.45-.035*Math.max(0,Math.min(1,flash/.16));return {x:size*(.22+reach*Math.cos(angle)),y:size*(-.45+reach*.65*Math.sin(angle))};}
 const pivot=level===4?{x:.25,y:-.51}:{x:0,y:-.35},reach=level===4?.39:.57,lateral=level===4?.12:-.13;
 const recoil=.04*Math.max(0,Math.min(1,flash/.16)),forward=reach-recoil;
 return {x:size*(pivot.x+Math.cos(angle)*forward-Math.sin(angle)*lateral),y:size*(pivot.y+Math.sin(angle)*forward+Math.cos(angle)*lateral)};
}
export function mechAim(size:number,level:number,dx:number,dy:number){
 const pivot=level<=3?{x:.22,y:-.45}:level===4?{x:.25,y:-.51}:{x:0,y:-.35};
 const vx=dx-pivot.x*size,vy=dy-pivot.y*size;
 if(level<=3)return Math.atan2(vy/.65,vx);
 const lateral=(level===4?.12:-.13)*size,dist=Math.max(1e-6,Math.hypot(vx,vy));
 return Math.atan2(vy,vx)-Math.asin(Math.max(-1,Math.min(1,lateral/dist)));
}
export function teslaEmitter(size:number,index:number){const offsets=[[-.34,-.26],[.34,-.26],[-.20,-.11],[.20,-.11]];const [x,y]=offsets[((index%4)+4)%4];return {x:x*size,y:y*size}}


/** Model bounds in normalized world coordinates, distinct from pad hit radius, range and effects.
 * Conservative across all levels, animation poses and weapon rotations. */
export function towerVisualBounds(x:number,y:number,canvasWidth:number,canvasHeight:number){
 const aspect=canvasWidth/canvasHeight;
 return {left:x-.20,right:x+.20,top:y-.24*aspect,bottom:y+.10*aspect};
}
