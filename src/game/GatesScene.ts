type P=readonly [number,number];
function poly(c:CanvasRenderingContext2D,pts:number[][],fill:string,stroke?:string){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke()}}
function nearest(point:P,path:readonly P[],w:number,h:number){let best={x:0,y:0,d:Infinity};for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=(b[0]-a[0])*w,dy=(b[1]-a[1])*h,px=(point[0]-a[0])*w,py=(point[1]-a[1])*h,t=Math.max(0,Math.min(1,(px*dx+py*dy)/(dx*dx+dy*dy)));const x=a[0]*w+dx*t,y=a[1]*h+dy*t,d=Math.hypot(point[0]*w-x,point[1]*h-y);if(d<best.d)best={x,y,d}}return best}
/** Industrial bridge geometry drawn in the same coordinate plane as combat. */
export function drawGates(c:CanvasRenderingContext2D,path:readonly P[],pads:readonly P[],w:number,h:number,selected:number,built:ReadonlySet<number>,time:number,quality:boolean){
 const half=w*.048;
 // Structural beams tie each build platform directly to the bridge.
 for(const p of pads){const x=p[0]*w,y=p[1]*h,n=nearest(p,path,w,h);c.strokeStyle='#050e10';c.lineWidth=w*.055;c.lineCap='butt';c.beginPath();c.moveTo(x,y+10);c.lineTo(n.x,n.y+10);c.stroke();c.strokeStyle='#50615c';c.lineWidth=w*.052;c.beginPath();c.moveTo(x,y);c.lineTo(n.x,n.y);c.stroke();c.strokeStyle='#233534';c.lineWidth=w*.039;c.stroke()}
 for(let i=1;i<path.length;i++){const a=[path[i-1][0]*w,path[i-1][1]*h],b=[path[i][0]*w,path[i][1]*h],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;const at=(p:number[],s:number,z=0):[number,number]=>[p[0]+nx*s,p[1]+ny*s+z];
 // Extruded underside, top deck, seams, rails and amber guidance lights.
 poly(c,[at(a,-half,10),at(b,-half,10),at(b,half,10),at(a,half,10)],'#050c0e');poly(c,[at(a,half),at(b,half),at(b,half,10),at(a,half,10)],'#263333','#667774');poly(c,[at(a,-half),at(b,-half),at(b,half),at(a,half)],'#263638','#778b80');poly(c,[at(a,-half*.78),at(b,-half*.78),at(b,half*.78),at(a,half*.78)],'#1a2b2c');
 for(let d=13;d<len;d+=17){const x=a[0]+dx*d/len,y=a[1]+dy*d/len;c.strokeStyle='#7c958655';c.lineWidth=1;c.beginPath();c.moveTo(x-nx*half*.75,y-ny*half*.75);c.lineTo(x+nx*half*.75,y+ny*half*.75);c.stroke();c.fillStyle=Math.floor(d/17)%3?'#7e5c3c':'#f4ba63';c.fillRect(x-1,y-1,2,2)}
 for(const sign of [-1,1]){c.strokeStyle='#0b1718';c.lineWidth=3;c.beginPath();c.moveTo(...at(a,sign*half));c.lineTo(...at(b,sign*half));c.stroke();c.strokeStyle='#83988a';c.lineWidth=.8;c.stroke()}
 }
 // Welded octagonal junction plates make changes of direction continuous.
 for(let i=1;i<path.length-1;i++){const x=path[i][0]*w,y=path[i][1]*h,r=half;const plate=(z:number,k:number)=>[[-.70,-1],[.70,-1],[1,-.70],[1,.70],[.70,1],[-.70,1],[-1,.70],[-1,-.70]].map(([a,b])=>[x+a*r*k,y+b*r*k+z]);poly(c,plate(8,1),'#0a1516');poly(c,plate(0,1),'#344746','#6d8179');poly(c,plate(0,.80),'#1b2d2c');c.fillStyle='#b28a57';c.fillRect(x-1,y-1,2,2)}
 for(let i=0;i<pads.length;i++){const x=pads[i][0]*w,y=pads[i][1]*h,r=w*.053;const shape=(z:number)=>[[-.8,-.48],[.8,-.48],[1,0],[.8,.48],[-.8,.48],[-1,0]].map(([dx,dy])=>[x+dx*r,y+dy*r+z]);poly(c,shape(9),'#060d0e','#47615c');poly(c,shape(0),'#263f3b',i===selected?'#65ffc1':'#709b8e');poly(c,shape(-2),'#142b2a');c.strokeStyle=i===selected?'#9bffcf':'#468578';c.lineWidth=1;c.beginPath();c.moveTo(x-r*.6,y);c.lineTo(x+r*.6,y);c.stroke();if(!built.has(i)){c.fillStyle='#90f5ce';c.font='bold 15px sans-serif';c.textAlign='center';c.fillText('+',x,y+4)}else{c.fillStyle='#df9c59';c.fillRect(x-r*.55,y+3,3,2);c.fillRect(x+r*.4,y+3,3,2)}}
 // Small ambient steam and synchronized warning beacons, deliberately bounded.
 if(quality){c.save();for(let i=0;i<4;i++){const x=w*(.06+i*.27),y=h*(.24+(i%2)*.32),phase=(time*.17+i*.23)%1;c.globalAlpha=(1-phase)*.15;c.fillStyle='#a3d6c7';c.beginPath();c.ellipse(x+Math.sin(time+i)*4,y-phase*30,3+phase*8,5+phase*12,0,0,7);c.fill()}c.restore()}
}
