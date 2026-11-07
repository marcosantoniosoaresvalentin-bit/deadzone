/* Deadzone · ui/minimap.js
 * Minimapa, luzes internas e portas.
 */
const mm=$('mm'),mx=mm.getContext('2d');let mmT=0;
function drawMM(dt){mmT-=dt;if(mmT>0)return;mmT=.12;const S=240,R_=150,k=S/2/R_,pl_=mode==='plane',c=pl_?plane.position:P,hx=pl_?pD.x:Math.sin(yaw),hz=pl_?pD.z:Math.cos(yaw);
 mx.setTransform(1,0,0,1,0,0);mx.clearRect(0,0,S,S);mx.translate(S/2,S/2);mx.rotate(-Math.PI/2-Math.atan2(hz,hx));
 const X=x=>(x-c.x)*k,Z=z=>(z-c.z)*k;
 mx.fillStyle='#1e5f8e';mx.fillRect(-S,-S,S*2,S*2);mx.drawImage(TERMAP,X(-TERMAP.E),Z(-TERMAP.E),2*TERMAP.E*k,2*TERMAP.E*k);
 mx.fillStyle='#6b6e72';for(const r of RDS)if(r[2]>c.x-200&&r[0]<c.x+200&&r[3]>c.z-200&&r[1]<c.z+200)mx.fillRect(X(r[0]),Z(r[1]),(r[2]-r[0])*k,(r[3]-r[1])*k);
 mx.fillStyle='#3a6ea5';for(const l of LK){mx.beginPath();mx.arc(X(l.x),Z(l.z),l.r*k,0,7);mx.fill()}mx.fillStyle='#e6d9b4';const L_=R_*1.5;for(const b of FP){if(b.x1<c.x-L_||b.x0>c.x+L_||b.z1<c.z-L_||b.z0>c.z+L_)continue;mx.fillRect(X(b.x0),Z(b.z0),(b.x1-b.x0)*k,(b.z1-b.z0)*k)}
 mx.strokeStyle='#ff4040';mx.lineWidth=2;mx.beginPath();mx.arc(X(zX),Z(zZ),zR*k,0,7);mx.stroke();const ra_=Math.PI/2+Math.atan2(hz,hx);for(const h of HPADS)if(Math.abs(h.x-c.x)<R_*1.4&&Math.abs(h.z-c.z)<R_*1.4){mx.save();mx.translate(X(h.x),Z(h.z));mx.rotate(ra_);mx.fillStyle='#1d6fd0';mx.strokeStyle='#fff';mx.lineWidth=1.5;mx.beginPath();mx.arc(0,0,8,0,7);mx.fill();mx.stroke();mx.fillStyle='#fff';mx.font='bold 11px sans-serif';mx.textAlign='center';mx.textBaseline='middle';mx.fillText('H',0,1);mx.restore()}
 for(const q of CARS)if(!q.dead&&Math.abs(q.x-c.x)<R_*1.3&&Math.abs(q.z-c.z)<R_*1.3){if(q.heli){mx.fillStyle='#38d8ff';mx.fillRect(X(q.x)-4,Z(q.z)-4,8,8)}else{mx.fillStyle='#ff7a3a';mx.fillRect(X(q.x)-2.5,Z(q.z)-2.5,5,5)}}
 for(const m of MK){let dx=X(m.x),dz=Z(m.z);const d=Math.hypot(dx,dz),lim=S/2-10;if(d>lim){dx*=lim/d;dz*=lim/d}mx.fillStyle='#ffd400';mx.strokeStyle='#000';mx.lineWidth=1.5;mx.beginPath();mx.moveTo(dx,dz-10);mx.lineTo(dx+7,dz);mx.lineTo(dx,dz+10);mx.lineTo(dx-7,dz);mx.closePath();mx.fill();mx.stroke()}
 mx.setTransform(1,0,0,1,0,0);mx.fillStyle='#fff';mx.strokeStyle='#000';mx.lineWidth=2;mx.beginPath();mx.moveTo(S/2,S/2-16);mx.lineTo(S/2+10,S/2+10);mx.lineTo(S/2,S/2+4);mx.lineTo(S/2-10,S/2+10);mx.closePath();mx.stroke();mx.fill()}
const bo=$('bo'),PLs=[0,1].map(()=>{const l=new T.PointLight(0xffd7a0,0,14,2);sc.add(l);return l});let lgT=0;
function updLights(dt){lgT-=dt;if(lgT>0)return;lgT=.25;const a=LAMPS.filter(l=>Math.abs(l.x-P.x)<45&&Math.abs(l.z-P.z)<45).sort((p,q)=>(p.x-P.x)**2+(p.z-P.z)**2-(q.x-P.x)**2-(q.z-P.z)**2);PLs.forEach((l,i)=>{const q=a[i];if(q){l.position.set(q.x,q.y,q.z);l.intensity=1.5}else l.intensity=0})}
function toggleDoor(){if(mode==='ground'&&nearDoor){nearDoor.open^=1;nearDoor.mc=performance.now();sfx(220,.3,.18,0)}}
bo.onpointerdown=e=>{e.preventDefault();toggleDoor()};addEventListener('keydown',e=>{if(e.key==='g')toggleDoor()});
bam.onpointerdown=e=>{e.preventDefault();if(mode==='ground'&&wp)ads=ads?0:1};
