/** View transform in normalized screen coordinates. The entire scene, including hit testing,
 * uses this same transform. At scale 1 the full battlefield is visible. */
export class Camera {
 scale=1; x=0; y=0;
 private pointers=new Map<number,{x:number,y:number}>();
 private anchor:{x:number,y:number}|null=null;
 private pinch:{distance:number,scale:number,worldX:number,worldY:number}|null=null;
 private moved=false;
 constructor(private canvas:HTMLCanvasElement,private tap:(x:number,y:number)=>void){
  canvas.addEventListener('pointerdown',this.down);canvas.addEventListener('pointermove',this.move);
  canvas.addEventListener('pointerup',this.up);canvas.addEventListener('pointercancel',this.cancel);
 }
 destroy(){this.canvas.removeEventListener('pointerdown',this.down);this.canvas.removeEventListener('pointermove',this.move);this.canvas.removeEventListener('pointerup',this.up);this.canvas.removeEventListener('pointercancel',this.cancel)}
 reset(){this.scale=1;this.x=0;this.y=0}
 focus(x:number,y:number){this.scale=1.4;this.x=(.5-x)*this.scale;this.y=(.5-y)*this.scale;this.clamp()}
 private coords(e:PointerEvent){const r=this.canvas.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height}}
 world(p:{x:number,y:number}){return {x:(p.x-.5-this.x)/this.scale+.5,y:(p.y-.5-this.y)/this.scale+.5}}
 private clamp(){const max=(this.scale-1)/2;this.x=Math.max(-max,Math.min(max,this.x));this.y=Math.max(-max,Math.min(max,this.y))}
 private down=(e:PointerEvent)=>{e.preventDefault();this.canvas.setPointerCapture(e.pointerId);const p=this.coords(e);this.pointers.set(e.pointerId,p);if(this.pointers.size===1){this.anchor=p;this.moved=false}else if(this.pointers.size===2){const [a,b]=[...this.pointers.values()];const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2},world=this.world(mid);this.pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),scale:this.scale,worldX:world.x,worldY:world.y};this.moved=true}};
 private move=(e:PointerEvent)=>{if(!this.pointers.has(e.pointerId))return;const p=this.coords(e),previous=this.pointers.get(e.pointerId)!;this.pointers.set(e.pointerId,p);if(this.pointers.size>=2&&this.pinch){const [a,b]=[...this.pointers.values()];const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};const d=Math.hypot(a.x-b.x,a.y-b.y);this.scale=Math.max(1,Math.min(2.5,this.pinch.scale*d/Math.max(.01,this.pinch.distance)));this.x=mid.x-.5-(this.pinch.worldX-.5)*this.scale;this.y=mid.y-.5-(this.pinch.worldY-.5)*this.scale;this.clamp();this.moved=true}else if(this.anchor){if(Math.hypot(p.x-this.anchor.x,p.y-this.anchor.y)>.015)this.moved=true;if(this.moved){this.x+=p.x-previous.x;this.y+=p.y-previous.y;this.clamp()}}};
 private up=(e:PointerEvent)=>{if(!this.pointers.has(e.pointerId))return;const p=this.coords(e),shouldTap=this.pointers.size===1&&!this.moved;this.pointers.delete(e.pointerId);this.pinch=null;if(this.pointers.size){this.anchor=[...this.pointers.values()][0];this.moved=true}else this.anchor=null;if(shouldTap){const world=this.world(p);this.tap(world.x,world.y)}};
 private cancel=(e:PointerEvent)=>{this.pointers.delete(e.pointerId);this.anchor=null;this.pinch=null;this.moved=true};
 apply(c:CanvasRenderingContext2D,w:number,h:number){c.translate(w*(.5+this.x),h*(.5+this.y));c.scale(this.scale,this.scale);c.translate(-w*.5,-h*.5)}
}
