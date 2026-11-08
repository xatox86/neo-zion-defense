/** Geometry is shared by the rotating gun, muzzle flash, and projectile origin. */
export function railPivot(size:number){return -size*.23}
export function railBarrelReach(size:number,flash:number){return size*(.55-.055*Math.max(0,Math.min(1,flash/.16)))}
export function railMuzzle(size:number,angle:number,flash:number){const reach=railBarrelReach(size,flash);return {x:Math.cos(angle)*reach,y:railPivot(size)+Math.sin(angle)*reach}}

/** Model bounds in normalized world coordinates, distinct from pad hit radius, range and effects.
 * Conservative across all levels, animation poses and weapon rotations. */
export function towerVisualBounds(x:number,y:number,canvasWidth:number,canvasHeight:number){
 const aspect=canvasWidth/canvasHeight;
 return {left:x-.17,right:x+.17,top:y-.20*aspect,bottom:y+.09*aspect};
}
