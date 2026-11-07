/** Geometry is shared by the rotating gun, muzzle flash, and projectile origin. */
export function railBarrelReach(size:number,flash:number){return size*(.55-.055*Math.max(0,Math.min(1,flash/.16)))}
export function railMuzzle(size:number,angle:number,flash:number){const reach=railBarrelReach(size,flash);return {x:Math.cos(angle)*reach,y:-size*.35+Math.sin(angle)*reach}}
