type Coord=readonly [number,number];
/** Draw physical support bridges beneath every build pad, attached to the nearest road segment. */
export function drawSupports(c:CanvasRenderingContext2D,path:readonly Coord[],pads:readonly Coord[],w:number,h:number){
 for(const pad of pads){let best={x:pad[0],y:pad[1],d:Infinity};for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=(b[0]-a[0])*w,dy=(b[1]-a[1])*h,px=(pad[0]-a[0])*w,py=(pad[1]-a[1])*h;const t=Math.max(0,Math.min(1,(px*dx+py*dy)/(dx*dx+dy*dy)));const x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,d=Math.hypot((pad[0]-x)*w,(pad[1]-y)*h);if(d<best.d)best={x,y,d}}
 const x=pad[0]*w,y=pad[1]*h,bx=best.x*w,by=best.y*h;
 c.lineCap='round';c.beginPath();c.moveTo(x,y+9);c.lineTo(bx,by+9);c.lineWidth=w*.095;c.strokeStyle='#030a0c';c.stroke();
 c.beginPath();c.moveTo(x,y);c.lineTo(bx,by);c.lineWidth=w*.085;c.strokeStyle='#51615d';c.stroke();
 c.beginPath();c.moveTo(x,y);c.lineTo(bx,by);c.lineWidth=w*.065;c.strokeStyle='#1d3031';c.stroke();
 c.beginPath();c.moveTo(x,y);c.lineTo(bx,by);c.lineWidth=1;c.strokeStyle='#d2965888';c.setLineDash([3,7]);c.stroke();c.setLineDash([]);
 }
}
export function drawRoad(c:CanvasRenderingContext2D,path:readonly Coord[],w:number,h:number){
 const trace=(offset=0)=>{c.beginPath();path.forEach((p,i)=>i?c.lineTo(p[0]*w,p[1]*h+offset):c.moveTo(p[0]*w,p[1]*h+offset))};
 c.lineCap='round';c.lineJoin='round';trace(10);c.strokeStyle='#020808';c.lineWidth=w*.13;c.stroke();trace(5);c.strokeStyle='#384846';c.lineWidth=w*.12;c.stroke();trace();c.strokeStyle='#74908a';c.lineWidth=w*.112;c.stroke();trace();c.strokeStyle='#17292a';c.lineWidth=w*.09;c.stroke();
 // Crosswise expansion seams make the route read as metal decking.
 for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=(b[0]-a[0])*w,dy=(b[1]-a[1])*h,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;for(let d=12;d<len-10;d+=18){const x=a[0]*w+dx*d/len,y=a[1]*h+dy*d/len;c.beginPath();c.moveTo(x-nx*w*.035,y-ny*w*.035);c.lineTo(x+nx*w*.035,y+ny*w*.035);c.strokeStyle='#748d8733';c.lineWidth=1;c.stroke()}}
 trace();c.setLineDash([4,10]);c.strokeStyle='#edac62';c.shadowColor='#ff9c3b';c.shadowBlur=5;c.lineWidth=2;c.stroke();c.shadowBlur=0;c.setLineDash([]);
}
