/* Deadzone · ui/world-map.js
 * Mapa grande com marcadores.
 */
// mapa grande com marcadores
const MK=[],bmap=$('bmap'),bmc=$('bmc'),bmg=bmc.getContext('2d');let bmS=null,bmT=0,BG=null;
// mapa em TELA CHEIA: a ilha ocupa toda a altura (ou largura) da tela; o resto é mar
function bmGeo(){const W=bmc.width,H=bmc.height,E=MAPR+14,k=Math.min(W,H)/(2*E),d=bmc.width/Math.max(1,bmc.clientWidth);return{W,H,k,d,X:x=>W/2+(x-MCX)*k,Y:z=>H/2+(z-MCZ)*k}}
function buildBig(){const G=bmGeo(),{W,H,k,d,X,Y}=G;BG=G;bmS=document.createElement('canvas');bmS.width=W;bmS.height=H;const g=bmS.getContext('2d');
 g.fillStyle='#1e4e82';g.fillRect(0,0,W,H);g.imageSmoothingEnabled=true;g.drawImage(TERMAP,X(TERMAP.x0),Y(TERMAP.z0),2*TERMAP.E*k,2*TERMAP.E*k);
 g.fillStyle='#3a6ea5';for(const l of LK){g.beginPath();g.arc(X(l.x),Y(l.z),l.r*k,0,7);g.fill()}
 g.fillStyle='#8a8d92';for(const r of RDS)g.fillRect(X(r[0]),Y(r[1]),Math.max(1.5,(r[2]-r[0])*k),Math.max(1.5,(r[3]-r[1])*k));g.fillStyle='#e6d9b4';for(const b of FP)g.fillRect(X(b.x0),Y(b.z0),Math.max(1.5,(b.x1-b.x0)*k),Math.max(1.5,(b.z1-b.z0)*k));
 // grade de referência (100 m)
 g.strokeStyle='rgba(255,255,255,.10)';g.lineWidth=d;for(let v=Math.ceil(MAPB.x0/100)*100;v<=MAPB.x1;v+=100){g.beginPath();g.moveTo(X(v),Y(MAPB.z0));g.lineTo(X(v),Y(MAPB.z1));g.stroke()}for(let v=Math.ceil(MAPB.z0/100)*100;v<=MAPB.z1;v+=100){g.beginPath();g.moveTo(X(MAPB.x0),Y(v));g.lineTo(X(MAPB.x1),Y(v));g.stroke()}
 g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=3*d;g.font='bold '+Math.round(14*d)+'px sans-serif';g.textAlign='center';for(const c of CITIES){if(c.blank)continue;g.strokeText(c.n,X(c.x),Y(c.z)-12*d);g.fillText(c.n,X(c.x),Y(c.z)-12*d)}
 for(const c of (typeof MAPNAMES!=='undefined'?MAPNAMES:[])){g.strokeText(c.n,X(c.x),Y(c.z));g.fillText(c.n,X(c.x),Y(c.z))}
 /* sem marca do helicóptero no mapa */try{window.dzWMExtra&&dzWMExtra(g,X,Y,d)}catch(e){}g.textBaseline='alphabetic'}
function drawBig(){if(bmap.style.display!=='flex'||!BG)return;const {k,d,X,Y}=BG;bmg.drawImage(bmS,0,0);
 bmg.strokeStyle='rgba(120,190,255,.95)';bmg.lineWidth=3*d;bmg.beginPath();bmg.arc(X(zX),Y(zZ),zR*k,0,7);bmg.stroke();
 MK.forEach((m,i)=>{const x=X(m.x),y=Y(m.z),s=d*1.3;bmg.fillStyle='#ffd400';bmg.strokeStyle='#000';bmg.lineWidth=2*d;bmg.beginPath();bmg.arc(x,y-10*s,8*s,0,7);bmg.fill();bmg.stroke();bmg.beginPath();bmg.moveTo(x-5*s,y-5*s);bmg.lineTo(x,y+2*s);bmg.lineTo(x+5*s,y-5*s);bmg.fill();bmg.fillStyle='#000';bmg.font='bold '+Math.round(10*s)+'px sans-serif';bmg.textAlign='center';bmg.fillText(i+1,x,y-7*s)});
 const pl_=mode==='plane',c=pl_?plane.position:P,hx=pl_?pD.x:Math.sin(yaw),hz=pl_?pD.z:Math.cos(yaw),s=d*1.4;bmg.save();bmg.translate(X(c.x),Y(c.z));bmg.rotate(Math.atan2(hz,hx)+Math.PI/2);bmg.fillStyle='#fff';bmg.strokeStyle='#000';bmg.lineWidth=2*d;bmg.beginPath();bmg.moveTo(0,-11*s);bmg.lineTo(8*s,9*s);bmg.lineTo(0,4*s);bmg.lineTo(-8*s,9*s);bmg.closePath();bmg.stroke();bmg.fill();bmg.restore()}
function openMap(){if(mode==='lobby'||mode==='dead')return;bmap.style.display='flex';const dpr=Math.min(2,devicePixelRatio||1),W=innerWidth,H=innerHeight;
 bmc.style.width=W+'px';bmc.style.height=H+'px';bmc.width=Math.round(W*dpr);bmc.height=Math.round(H*dpr);buildBig();drawBig()}
addEventListener('resize',()=>{if(bmap.style.display==='flex')openMap()});
$('mm').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();openMap()});$('bmx').onclick=()=>{bmap.style.display='none'};
bmc.addEventListener('pointerdown',e=>{e.preventDefault();if(!BG)return;const r=bmc.getBoundingClientRect(),px=(e.clientX-r.left)*BG.d,py=(e.clientY-r.top)*BG.d,x=(px-BG.W/2)/BG.k+MCX,z=(py-BG.H/2)/BG.k+MCZ;
 if(x<MAPB.x0-14||x>MAPB.x1+14||z<MAPB.z0-14||z>MAPB.z1+14)return;const i=MK.findIndex(m=>Math.hypot(m.x-x,m.z-z)<18*BG.d/BG.k);if(i>=0)MK.splice(i,1);else{if(MK.length>=6)MK.shift();MK.push({x,z})}drawBig()});
