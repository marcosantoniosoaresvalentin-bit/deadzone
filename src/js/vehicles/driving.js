/* Deadzone · vehicles/driving.js
 * Direção, entrada/saída e colisão de veículos.
 */
function carTxt(){const c=drv;if(c.heli)return '🚁 '+Math.round(Math.abs(c.spd)*3.6)+' km/h · ↑ '+Math.round(c.y)+' m · ⛽ '+Math.round(c.fuel)+'% · 🔧 '+Math.max(0,Math.round(c.hp))+'%'+(c.fire?' · 🔥 FOGO!':'')+(c.fuel<=0?' · SEM COMBUSTÍVEL':'');return '🚗 '+Math.round(Math.abs(c.spd)*3.6)+' km/h · ⛽ '+Math.round(c.fuel)+'% · 🔧 '+Math.max(0,Math.round(c.hp))+'%'+(c.fire?' · 🔥 FOGO!':'')+(c.fuel<=0?' · SEM GASOLINA':'')}
function enterCar(c){if(c.dead){say(c.heli?'Helicóptero destruído':'Carro destruído',1.5);return}if(c.heli&&c.y-(c.fb||0)>1.5)return;drv=c;if(!c.heli)try{if(selC>0&&CARC[selC]&&c.g.body.material!==BURN)c.g.body.material=carMatFor(selC)}catch(e){}mode='drive';st=0;ui();ads=0;firing=0;rlOn=0;rl=0;cast=null;P.x=c.x;P.z=c.z;P.y=0;pl.visible=false;setLabel();say(c.heli?'🚁 Segure ▲ para subir · ▼ para descer · analógico: frente/ré e girar · Sair para descer':'Analógico: acelera, ré e vira · Sair para descer',c.heli?6:4)}
function exitCar(){const c=drv;if(c.heli){if(c.y-(c.fb||0)<=2.5&&Math.abs(c.spd)<5){P.x=c.x+Math.cos(c.yaw)*3.6;P.z=c.z-Math.sin(c.yaw)*3.6;P.y=Math.max(GY(P.x,P.z,c.y+1.3),c.y);P.vy=0;drv=null;mode='ground';mvp(0,0);pl.visible=true;yaw=c.yaw;setLabel();HK.u=HK.d=0;return}
  if(c.y-(c.fb||0)>=15||(c.crash&&c.y-(c.fb||0)>=6)){P.x=c.x;P.z=c.z;P.y=c.y;P.vy=-6;drv=null;pl.visible=true;yaw=c.yaw;HK.u=HK.d=0;openChute();say('🪂 Você saltou do helicóptero!',3);return}
  say('Pouse para sair · ou suba acima de 15 m para saltar de paraquedas',2.5);return}
 if(Math.abs(c.spd)>5){say('Reduza a velocidade para sair',1.5);return}P.x=c.x+Math.cos(c.yaw)*2.6;P.z=c.z-Math.sin(c.yaw)*2.6;P.y=TERH(P.x,P.z);P.vy=0;drv=null;mode='ground';mvp(0,0);pl.visible=true;yaw=c.yaw;setLabel()}
// personagem SENTADO no banco do motorista (carro ou helicóptero)
const _seatV=new T.Vector3(),SEAT0={car:new T.Vector3(.38,.62,-.2),heli:new T.Vector3(0,1.35,2.2)};
function seatPose(){const c=drv;if(!c||!c.g)return;const g=c.g,s=(g.userData&&g.userData.seat)||(c.heli?SEAT0.heli:SEAT0.car);g.updateMatrixWorld();_seatV.copy(s).applyMatrix4(g.matrixWorld);
 pl.visible=true;pl.quaternion.copy(g.quaternion);pl.position.set(_seatV.x,_seatV.y-.9,_seatV.z);
 hips.position.y=.95;hips.rotation.set(0,0,0);tor.rotation.set(-.08,0,0);head.rotation.set(.05,0,0);body.position.y=0;
 lg1.th.rotation.set(-1.5,0,.08);lg2.th.rotation.set(-1.5,0,-.08);lg1.kn.rotation.x=1.4;lg2.kn.rotation.x=1.4;
 const st=c.heli?0:Math.max(-1,Math.min(1,(typeof ix!=='undefined'?ix:0)))*.25;
 aR.sh.rotation.set(-1.05,0,.18-st);aL.sh.rotation.set(-1.05,0,-.18-st);aR.el.rotation.x=aL.el.rotation.x=-.75;
 try{rf.visible=false}catch(e){}}
function carBtn(){if(mode==='drive')exitCar();else if(mode==='ground'&&nearCar)enterCar(nearCar)}
function refuel(){const c=mode==='drive'?drv:nearCar;if(!c||c.dead)return;if(!bag.fuel){say('Sem galão de gasolina',1.5);return}if(c.fuel>=100){say('Tanque cheio',1.5);return}if(mode==='drive'&&Math.abs(c.spd)>1.5){say(c.heli?'Pare o helicóptero para abastecer':'Pare o carro para abastecer',1.5);return}bag.fuel--;drawBag();c.fuel=Math.min(100,c.fuel+50);say('⛽ Abastecido',2)}
function carVsCars(c){if(c.dead&&!c.heli)return;const hh=!!c.heli;if(hh&&c.y-(c.fb||0)>2.4)return;let hit=0;
 const pts=q=>{if(q.heli)return[[q.x,q.z,2.4]];const sx=Math.sin(q.yaw),cz=Math.cos(q.yaw);return[[q.x+sx*1.4,q.z+cz*1.4,1.15],[q.x-sx*1.4,q.z-cz*1.4,1.15]]};
 for(const o of CARS){if(o===c||MP)continue;if(o.heli&&o.y-(o.fb||0)>2.4)continue;if(Math.abs(o.x-c.x)>8||Math.abs(o.z-c.z)>8)continue;
  for(let it=0;it<2;it++)for(const a of pts(c))for(const b of pts(o)){const ex=a[0]-b[0],ez=a[1]-b[1],d=Math.hypot(ex,ez),m=a[2]+b[2];if(d<m){const nx=d>1e-4?ex/d:1,nz=d>1e-4?ez/d:0,pu=m-d;c.x+=nx*pu;c.z+=nz*pu;a[0]+=nx*pu;a[1]+=nz*pu;hit=1}}}
 if(hit){const sp=Math.abs(c.spd);if(!hh&&sp>6)hitCar(c,(sp-6)*1.6);if(drv===c&&sp>12)hp-=(sp-12)*.8;c.spd*=-.25;sfx(400,Math.min(.6,sp/30),.15,0)}}
function collideCar(c){const sx=Math.sin(c.yaw),cz=Math.cos(c.yaw);let hit=0;
 for(const o of[-1.4,1.4]){const px=c.x+sx*o,pz=c.z+cz*o;let ax=0,az=0;
  for(const b of near(px,pz)){if(b.off)continue;const qx=Math.max(b.x0,Math.min(px,b.x1)),qz=Math.max(b.z0,Math.min(pz,b.z1)),ex=px-qx,ez=pz-qz,d=Math.hypot(ex,ez);if(d<1.15){if(d>0){ax+=ex/d*(1.15-d);az+=ez/d*(1.15-d)}else ax+=b.x0-px-1.15;hit=1}}
  c.x+=ax;c.z+=az}
 if(hit){const s=Math.abs(c.spd);if(s>5)hitCar(c,(s-5)*2.4);if(drv===c&&s>12)hp-=(s-12)*1.2;c.spd*=-.25;sfx(400,Math.min(.6,s/30),.15,0)}
 carVsCars(c);c.x=Math.max(-(MAPH-5),Math.min(MAPH-5,c.x));c.z=Math.max(-(MAPH-5),Math.min(MAPH-5,c.z))}
function updCars(dt,ix,iy){nearCar=null;let nd=4.2;
 for(const c of CARS){const dv=drv===c&&mode==='drive',d=Math.hypot(c.x-P.x,c.z-P.z);c.g.visible=d<(c.heli?520:400)&&!MP;
  if(c.heli){if(MP)continue;updHeli(c,dt,dv,ix,iy,d);if(mode==='ground'&&!c.dead&&c.y-(c.fb||0)<1.5&&d-2<nd){nd=d-2;nearCar=c}continue}
  if(c.fire&&!c.dead){c.hp-=dt*4;c.fl.visible=true;for(const f of c.fl.children)f.scale.y=.7+Math.random()*.8;if(dv)hp-=3*dt;if(c.hp<=0)boom(c)}
  if(c.dead)continue;
  if(dv||Math.abs(c.spd)>.05){
   if(dv){const th=-iy;let a=0;if(c.fuel>0)a=th*(th>0?15:9)*((th>0&&c.spd<-.3)||(th<0&&c.spd>.3)?2:1);c.spd+=a*dt;if(Math.abs(th)<.05||c.fuel<=0)c.spd-=Math.sign(c.spd)*Math.min(Math.abs(c.spd),4*dt);
    c.yaw-=ix*dt*1.9*Math.max(-1,Math.min(1,c.spd/7));if(c.fuel>0)c.fuel=Math.max(0,c.fuel-dt*(.08+.35*Math.abs(th)+.008*Math.abs(c.spd)));
    for(const b of bots){if(b.dead||b.air||b.team===1||Math.abs(c.spd)<6)continue;if(Math.hypot(b.x-c.x,b.z-c.z)<2.2&&tt-(b.ro||0)>.4){b.ro=tt;b.hp-=Math.abs(c.spd)*6;if(b.hp<=0&&!b.dead)killBot(b,1)}}}
   else c.spd-=Math.sign(c.spd)*Math.min(Math.abs(c.spd),5*dt);
   c.spd=Math.max(-8,Math.min(28,c.spd));c.x+=Math.sin(c.yaw)*c.spd*dt;c.z+=Math.cos(c.yaw)*c.spd*dt;collideCar(c);
   {const sx=Math.sin(c.yaw),cz=Math.cos(c.yaw),hf=TERH(c.x+sx*1.5,c.z+cz*1.5),hb=TERH(c.x-sx*1.5,c.z-cz*1.5),hl=TERH(c.x+cz*.9,c.z-sx*.9),hr=TERH(c.x-cz*.9,c.z+sx*.9);c.g.rotation.order='YXZ';c.g.position.set(c.x,(hf+hb+hl+hr)/4,c.z);c.g.rotation.set(-Math.atan2(hf-hb,3),c.yaw,Math.atan2(hl-hr,1.8))}if(dv){P.x=c.x;P.z=c.z;P.y=c.g.position.y}}
  if(mode==='ground'&&d<nd&&!c.dead){nd=d;nearCar=c}}}
$('bi').onpointerdown=e=>{e.preventDefault();renderPk();$('pk').style.display='flex'};$('bv').onpointerdown=e=>{e.preventDefault();carBtn()};$('bu').onpointerdown=e=>{e.preventDefault();refuel()};
addEventListener('keydown',e=>{if(e.key==='v')carBtn();if(e.key==='n')refuel();if(e.key==='i'&&mode==='ground'){renderPk();$('pk').style.display='flex'}});
