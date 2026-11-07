import * as THREE from 'three';
const asset = new URL('./vendor/', import.meta.url).href + '/';
const status = document.querySelector('#status');
const preview = document.querySelector('#preview');
const renderer = new THREE.WebGLRenderer({ alpha:true, preserveDrawingBuffer:true, antialias:true });
renderer.setSize(128,128); renderer.setClearColor(0x000000,0);
const camera = new THREE.PerspectiveCamera(30,1,1,1000); camera.position.set(20,20,20); camera.lookAt(0,0,0); camera.updateMatrixWorld();
const scene = new THREE.Scene();
const runtime = await new Promise((ok,fail)=>window.effekseer.initRuntime(asset+'effekseer.wasm',ok,fail));
const context = window.effekseer.createContext(); context.init(renderer.getContext());
const names=['Laser01','Laser02','Simple_Ring_Shape1'];
const effects = {};
await Promise.all(names.map(name=>new Promise((ok,fail)=>{effects[name]=context.loadEffect(asset+'Resources/'+name+'.efk',1,ok,(message,url)=>fail(new Error(message+' '+url)))})));
function draw(){renderer.render(scene,camera);context.setProjectionMatrix(camera.projectionMatrix.elements);context.setCameraMatrix(camera.matrixWorldInverse.elements);context.draw();renderer.resetState()}
window.captureEffekseer=async function(){
 const results={};
 for(const name of names){context.stopAll();const atlas=document.createElement('canvas');atlas.width=512;atlas.height=512;const out=atlas.getContext('2d');context.play(effects[name],0,0,0);for(let f=0;f<16;f++){context.update(2);draw();out.drawImage(renderer.domElement,(f%4)*128,Math.floor(f/4)*128);await new Promise(requestAnimationFrame)}results[name]=atlas.toDataURL('image/webp',.85);preview.getContext('2d').drawImage(atlas,0,0,384,384)}
 status.textContent='Готово: три спрайтовых атласа, 16 кадров по 128×128';return results;
};
document.querySelector('#record').onclick=()=>window.captureEffekseer();status.textContent='Официальный WebGL runtime загружен';
