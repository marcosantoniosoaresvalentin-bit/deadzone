/* Deadzone · vehicles/helicopters.js
 * Helicópteros: modelo, heliportos e física de voo.
 */
// ---------- helicópteros ----------
const HGC={},HMC={};
const hbx=(a,b,c)=>{const k=a+'_'+b+'_'+c;return HGC[k]||(HGC[k]=new T.BoxGeometry(a,b,c))};
const hmat=(c,r,m)=>{const k=c+'_'+r+'_'+m;return HMC[k]||(HMC[k]=new T.MeshStandardMaterial({color:lin(c),roughness:r,metalness:m}))};
const HGLASS=new T.MeshStandardMaterial({color:lin(0x14354d),roughness:.12,metalness:.7,transparent:true,opacity:.62});
const HPAL=[
 {body:0x4a5a3a,accent:0xe0b020,dark:0x1d2229,mil:1},
 {body:0xe9eaec,accent:0xd42a2a,dark:0x2a2f36,mil:0},
 {body:0x203a63,accent:0xeceef2,dark:0x14181e,mil:1},
 {body:0xa89868,accent:0x4a3a28,dark:0x24201a,mil:1},
 {body:0x2a2d33,accent:0x9a2222,dark:0x101214,mil:1}];
function mkHeli(o){if(window.DZHeli)try{return DZHeli(o)}catch(e){console.warn('heli',e)}
 o=o||{};const bc=o.body!=null?o.body:0x4a5a3a,ac=o.accent!=null?o.accent:0xe0b020,dk=o.dark!=null?o.dark:0x1d2229,mil=o.mil==null?1:o.mil;
 const BODY=hmat(bc,.55,.25),DARK=hmat(dk,.6,.35),ACC=hmat(ac,.5,.2),SEAT=hmat(0x30353c,.9,.1),METAL=hmat(0x8c939a,.4,.7),TIP=hmat(ac,.5,.1);
 const g=new T.Group();g.rotation.order='YXZ';
 const it=[],A=(a,b,c,m,x,y,z,rx,ry,rz)=>it.push([hbx(a,b,c),m,x,y,z,rx||0,ry||0,rz||0]);
 // esquis
 for(const sx of[-1,1]){A(.14,.14,5.4,DARK,sx*1.15,.12,.3);A(.14,.14,.8,DARK,sx*1.15,.34,3.15,-.5);
  A(.1,1.05,.1,DARK,sx*1.02,.66,1.3,0,0,sx*.17);A(.1,1.05,.1,DARK,sx*1.02,.66,-.9,0,0,sx*.17)}
 A(2.2,.1,.1,DARK,0,.95,1.3);A(2.2,.1,.1,DARK,0,.95,-.9);
 // cabine traseira + piso
 A(2.1,1.65,2.3,BODY,0,1.82,-.95);A(2.1,.32,2.3,BODY,0,1.18,1.15);A(1.9,.28,3.9,DARK,0,.98,.2);
 // nariz inferior e pilares
 A(1.9,.75,1.2,BODY,0,1.35,2.2);
 for(const sx of[-1,1]){A(.14,1.25,.14,BODY,sx*1.0,2.0,2.05);A(.14,1.25,.14,BODY,sx*1.0,2.0,.25)}
 // teto da cabine + interior escuro
 A(2.1,.14,2.4,BODY,0,2.7,1.1);A(1.8,1.15,1.7,DARK,0,2.0,1.2);
 // bancos
 for(const sx of[-1,1]){A(.62,.28,.62,SEAT,sx*.5,1.5,1.0);A(.62,.85,.16,SEAT,sx*.5,1.95,.62);A(.34,.34,.34,hmat(0xd9a679,.8,0),sx*.5,2.5,.7);A(.38,.2,.38,hmat(0x20262c,.5,.2),sx*.5,2.66,.7)}
 // motor, entradas e escapamentos
 A(1.55,.85,2.2,DARK,0,3.05,-1.0);A(1.1,.3,.1,METAL,0,3.2,.08);
 for(const sx of[-1,1])A(.26,.26,.6,METAL,sx*.42,3.1,-2.2);
 // mastro e cubo do rotor
 A(.24,.8,.24,DARK,0,3.8,-.95);A(.55,.22,.55,DARK,0,4.2,-.95);
 // cauda
 A(.78,.85,2.1,BODY,0,2.55,-3.1);A(.58,.62,2.4,BODY,0,2.72,-5.2);A(.42,.46,1.5,BODY,0,2.88,-6.8);
 A(.8,.2,1.2,ACC,0,2.98,-3.1);
 A(.15,1.75,1.05,BODY,0,3.55,-7.05,-.42);A(.14,.85,.7,DARK,0,2.4,-7.2,.32);
 A(2.1,.09,.58,BODY,0,2.98,-6.45);for(const sx of[-1,1])A(.09,.55,.55,ACC,sx*1.05,3.0,-6.45);
 // faixa lateral da cabine
 A(2.14,.2,2.3,ACC,0,1.45,-.95);
 // armamento (versões militares) ou macas (resgate)
 if(mil){
  for(const sx of[-1,1]){A(1.35,.1,.7,DARK,sx*1.75,1.65,-.35);A(.5,.5,1.7,DARK,sx*2.3,1.5,-.15);A(.38,.38,.12,METAL,sx*2.3,1.5,.76);A(.4,.4,.1,ACC,sx*2.3,1.5,-1.05)}
  A(.55,.42,.7,DARK,0,.82,2.35);A(.09,.09,1.0,METAL,0,.8,3.0);
 }else{
  for(const sx of[-1,1])A(.2,.5,1.6,hmat(0xc7ccd1,.5,.3),sx*1.2,.78,-.1);
  A(1.5,.14,.14,ACC,0,3.45,1.2);
 }
 // luz de pouso
 A(.3,.2,.12,hmat(0xfff6d6,.3,0),0,.78,2.9);
 const stat=new T.Group();bake(stat,it,true);g.add(stat);
 // vidros (sem sombra)
 const gl=new T.Group();
 const GI=[[1.95,1.35,.07,HGLASS,0,2.0,2.2,-.34]];
 for(const sx of[-1,1]){GI.push([.07,1.15,1.75,HGLASS,sx*1.06,2.0,1.2,0]);GI.push([.07,.8,1.05,HGLASS,sx*1.07,2.1,-1.0,0])}
 GI.push([1.7,.7,.07,HGLASS,0,2.2,-.15,0]);
 bake(gl,GI.map(q=>[hbx(q[0],q[1],q[2]),q[3],q[4],q[5],q[6],q[7]]),false);g.add(gl);
 // rotor principal
 const rot=new T.Group();rot.position.set(0,4.38,-.95);
 const bl=new T.Mesh(hbx(9.4,.05,.36),DARK),bl2=bl.clone();bl2.rotation.y=Math.PI/2;rot.add(bl,bl2);
 for(const sx of[-1,1]){const t=new T.Mesh(hbx(.9,.055,.37),TIP);t.position.x=sx*4.25;rot.add(t);const t2=t.clone();t2.position.set(0,0,sx*4.25);t2.rotation.y=Math.PI/2;rot.add(t2)}
 g.add(rot);
 const disc=new T.Mesh(new T.CircleGeometry(4.75,36),new T.MeshBasicMaterial({color:0x0c1014,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}));
 disc.rotation.x=-Math.PI/2;disc.position.set(0,4.4,-.95);disc.userData.disc=1;g.add(disc);
 // rotor de cauda
 const trot=new T.Group();trot.position.set(.3,3.55,-7.35);
 const tb=new T.Mesh(hbx(.05,1.5,.17),DARK),tb2=new T.Mesh(hbx(.05,.17,1.5),DARK);trot.add(tb,tb2,new T.Mesh(hbx(.14,.2,.2),METAL));g.add(trot);
 const tdisc=new T.Mesh(new T.CircleGeometry(.78,18),new T.MeshBasicMaterial({color:0x0c1014,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}));
 tdisc.rotation.y=Math.PI/2;tdisc.position.set(.3,3.55,-7.35);tdisc.userData.disc=1;g.add(tdisc);
 // luzes de navegação
 const LM=c=>new T.MeshBasicMaterial({color:c}),lb=hbx(.2,.2,.2),mkL=(c,x,y,z)=>{const m=new T.Mesh(lb,LM(c));m.position.set(x,y,z);m.userData.light=1;g.add(m);return m};
 const red=mkL(0xff2a2a,1.1,1.75,-.1),green=mkL(0x2aff5a,-1.1,1.75,-.1),strobe=mkL(0xffffff,0,4.45,-7.6),beacon=mkL(0xff3030,0,.78,-.7);
 // chamas (dano)
 const fl=new T.Group();fl.position.set(0,3.4,-1.0);fl.visible=false;
 for(let i=0;i<3;i++){const f=new T.Mesh(new T.ConeGeometry(.55-i*.12,1.7,6),new T.MeshBasicMaterial({color:i?0xffd040:0xff5a10,transparent:true,opacity:.85}));f.position.set((i-1)*.55,.8,0);f.userData.light=1;fl.add(f)}
 g.add(fl);
 // cone do holofote (só no lobby)
 if(o.lobby){const cn=new T.Mesh(new T.CylinderGeometry(.12,2.4,7,20,1,true),new T.MeshBasicMaterial({color:0xcfeaff,transparent:true,opacity:.075,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false}));
  cn.rotation.x=-.2;cn.position.set(0,.8-3.4,2.9+.7);cn.userData.light=1;g.add(cn)}
 g.userData={rot,trot,disc,tdisc,red,green,strobe,beacon,fl,stat,gl};
 return g}
function hBurn(c){c.g.traverse(o=>{if(!o.isMesh)return;if(o.userData.disc||o.userData.light){o.visible=false;return}o.material=BURN})}
// heliportos
const HPADS=[],HELIS=[];
const hpT=ctex(256,256,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#3a3e44';g.beginPath();g.arc(128,128,124,0,7);g.fill();g.fillStyle='#2f3338';for(let i=0;i<420;i++){g.fillRect(R(10,246),R(10,246),R(1,3),R(1,3))}
 g.strokeStyle='#e8b81c';g.lineWidth=9;g.beginPath();g.arc(128,128,108,0,7);g.stroke();g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=3;g.beginPath();g.arc(128,128,122,0,7);g.stroke();
 g.fillStyle='#f4f4f0';g.fillRect(78,68,22,120);g.fillRect(156,68,22,120);g.fillRect(78,115,100,26)},1,1);
{const pm=new T.MeshStandardMaterial({map:hpT,alphaTest:.5,roughness:.95,depthTest:false,depthWrite:false}),pg=new T.PlaneGeometry(15,15),
 poleM=hmat(0xd8d8d8,.6,.2),flagM=hmat(0xff6a1a,.7,0),lampM=new T.MeshBasicMaterial({color:0xffd24a});
 const spots=[['Heliponto Norte',MAPH*.45,-MAPH*.5],['Heliponto Sul',-MAPH*.45,MAPH*.5]];
 const hitB=(x,z)=>{for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(const b of near(x+i*32,z+j*32))if(b.x1>x-13&&b.x0<x+13&&b.z1>z-13&&b.z0<z+13)return 1;return 0};
 const free=(x,z)=>!onRoad(x,z)&&!inFP(x,z,16)&&!LK.some(l=>Math.hypot(x-l.x,z-l.z)<l.r+16)&&!CARS.some(c=>Math.hypot(c.x-x,c.z-z)<16)&&!HPADS.some(h=>Math.hypot(h.x-x,h.z-z)<60)&&!hitB(x,z);
 for(const[n,sx,sz]of spots){let x=sx,z=sz,ok=0;for(let t=0;t<120&&!ok;t++){x=sx+(t?R(-1,1)*Math.min(70,6+t*1.2):0);z=sz+(t?R(-1,1)*Math.min(70,6+t*1.2):0);x=Math.max(-(MAPH-20),Math.min(MAPH-20,x));z=Math.max(-(MAPH-20),Math.min(MAPH-20,z));ok=free(x,z)}
  if(!ok)continue;
  const m=new T.Mesh(pg,pm);m.rotation.x=-Math.PI/2;m.position.set(x,.075,z);m.renderOrder=-.2;sc.add(m);
  const pg2=new T.Group();pg2.position.set(x,0,z);
  for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4,l=new T.Mesh(hbx(.35,.22,.35),lampM);l.position.set(Math.cos(a)*7.3,.12,Math.sin(a)*7.3);pg2.add(l)}
  const pole=new T.Mesh(new T.CylinderGeometry(.07,.09,5,6),poleM);pole.position.set(9.4,2.5,-3);pole.castShadow=true;pg2.add(pole);
  const fg=new T.Mesh(hbx(.2,.45,1.6),flagM);fg.position.set(9.4,4.7,-3.8);pg2.add(fg);
  sc.add(pg2);addBox({x0:x+9.2,x1:x+9.6,z0:z-3.2,z1:z-2.8});
  HPADS.push({n,x,z});
  const pal=HPAL[Math.floor(R(0,HPAL.length))],h=mkHeli(pal);h.position.set(x,0,z);h.rotation.y=R(0,6.28);sc.add(h);
  const c={g:h,fl:h.userData.fl,x,z,y:0,yaw:h.rotation.y,spd:0,vy:0,rs:0,pit:0,roll:0,hp:100,fuel:R(45,95),fire:0,dead:0,heli:1,crash:0,ph:R(0,6),sn:0,ds:0,pad:{x,z,n}};
  h.body=h.userData.stat.children[0];h.cab=h.userData.stat.children[0];
  CARS.push(c);HELIS.push(c)}}
const HK={u:0,d:0},HC={vmax:34,vback:11,ymax:500};
const hAl=()=>(mode==='drive'&&drv&&drv.heli)?drv.y:0;
function collideHeli(c){let hit=0;const rr=2.7;
 for(const b of near(c.x,c.z)){if(b.off||b.h)continue;if(b.yt!==undefined?(c.y>=b.yt-1.2||c.y<b.yb-3):c.y>(b.top||(b.w?14:7)))continue;
  const qx=Math.max(b.x0,Math.min(c.x,b.x1)),qz=Math.max(b.z0,Math.min(c.z,b.z1)),ex=c.x-qx,ez=c.z-qz,d=Math.hypot(ex,ez);
  if(d<rr){if(d>0){c.x+=ex/d*(rr-d);c.z+=ez/d*(rr-d)}else c.x+=b.x0-c.x-rr;hit=1}}
 if(hit){const sp=Math.abs(c.spd);if(sp>8){hitCar(c,(sp-8)*1.6);if(drv===c&&sp>11)hp-=(sp-11)*1.1}c.spd*=-.3;sfx(400,Math.min(.6,sp/25),.15,0)}
 c.x=Math.max(-(MAPH-5),Math.min(MAPH-5,c.x));c.z=Math.max(-(MAPH-5),Math.min(MAPH-5,c.z))}
function updHeli(c,dt,dv,ix,iy,d){
 const u=c.g.userData;c.fb=GY(c.x,c.z,c.y+.5);
 if(c.dead){if(c.g.visible){c.g.position.set(c.x,TERH(c.x,c.z),c.z)}return}
 if(c.fire){c.hp-=dt*((c.y-c.fb)>3?2.5:4);c.fl.visible=true;for(const f of c.fl.children)f.scale.y=.7+Math.random()*.8;if(dv)hp-=2*dt}
 if(c.hp<=0&&!c.crash){if((c.y-c.fb)<=2.5){boom(c);return}c.crash=1;c.fire=1;if(dv)say('⚠ Helicóptero em queda! Saia para saltar de paraquedas',4)}
 const crash=c.crash,lift=c.rs>.82&&c.fuel>0&&!crash;
 c.rs+=((((dv||(c.y-c.fb)>.3)&&c.fuel>0&&!crash)?1:0)-c.rs)*Math.min(1,dt*(((dv||(c.y-c.fb)>.3)&&c.fuel>0&&!crash)?.75:.3));
 if(dv&&c.rs<.82&&!crash&&c.fuel>0&&(c.y-c.fb)<.3)say('Ligando o motor...',.4);
 // entradas
 let hu=0,hd=0,th=0,tn=0;
 if(dv){hu=(HK.u||keys[' ']||keys.e)?1:0;hd=(HK.d||keys.shift||keys.x)?1:0;th=-iy;tn=ix}
 // vertical
 let tv=0;
 if(crash)tv=-17;else if(!lift)tv=(c.y-c.fb)>.05?-6:0;else if(dv){if(hu&&hd){hu=hd=0}c.hold=(hu||hd)?Math.min(4,(c.hold||0)+dt):0;tv=hu?9+c.hold*2.5:hd?-(9+c.hold*2)*Math.max(.2,Math.min(1,(c.y-c.fb)/12)):0}else tv=(c.y-c.fb)>.05?-4:0;
 c.vy+=(tv-c.vy)*Math.min(1,dt*(crash?.9:2));
 const vy0=c.vy,oy=c.y;c.y+=c.vy*dt;if(c.y>HC.ymax){c.y=HC.ymax;c.vy=Math.min(c.vy,0)}
 const fl_=GY(c.x,c.z,oy+.5);c.fb=fl_;if(c.y<=fl_){c.y=fl_;c.vy=0;if(oy>fl_+.02){const im=-vy0;
   if(crash){boom(c)}else if(im>13){const dm=(im-13)*10;c.hp-=dm;if(dv)hp-=dm*.3;sfx(300,.7,.3,0);shake&&shake(.5);if(c.hp<=0){c.crash=1;boom(c)}}
   else if(im>2.5){fxDust(c.x,c.z,10);sfx(260,.3,.2,0)}}}
 if(c.dead)return;
 // horizontal
 const air=Math.min(1,(c.y-c.fb)/5);let ts=0;
 if(crash)ts=c.spd*.6;else if(lift&&dv)ts=(th>0?th*HC.vmax:th*HC.vback)*air;
 c.spd+=(ts-c.spd)*Math.min(1,dt*(ts===0?1.2:.85));if(c.y<=c.fb+.05&&!crash)c.spd=0;
 if(crash)c.yaw+=dt*3.2;else if(lift&&dv)c.yaw-=tn*dt*1.1;
 c.x+=Math.sin(c.yaw)*c.spd*dt;c.z+=Math.cos(c.yaw)*c.spd*dt;collideHeli(c);carVsCars(c);
 // combustível
 if(c.rs>.5&&c.fuel>0&&(dv||(c.y-c.fb)>.3))c.fuel=Math.max(0,c.fuel-dt*(.1+.16*Math.abs(c.spd)/HC.vmax+(hu?.04:0)));
 if(dv&&c.fuel<=0&&(c.y-c.fb)>.3)say('⛽ Sem combustível! Pouse ou salte',1);
 if(dv){P.x=c.x;P.z=c.z;P.y=c.y}
 // animação
 if(c.g.visible){
  const pt=crash?.45:c.spd/HC.vmax*.3+(air>.3?Math.sin(tt*1.6+c.ph)*.012:0);c.pit+=(pt-c.pit)*Math.min(1,dt*3);
  const rt=crash?Math.sin(tt*5)*.35:(dv&&lift?tn*.32*(.3+.7*Math.min(1,Math.abs(c.spd)/10)):0)+(air>.3?Math.sin(tt*1.3+c.ph)*.015:0);c.roll+=(rt-c.roll)*Math.min(1,dt*3);
  c.g.position.set(c.x,c.y,c.z);c.g.rotation.set(c.pit,c.yaw,c.roll);
  u.rot.rotation.y+=dt*c.rs*30;u.trot.rotation.x+=dt*c.rs*48;
  u.disc.material.opacity=.16*Math.min(1,c.rs*1.3);u.tdisc.material.opacity=.14*Math.min(1,c.rs*1.3);
  const bt=tt%1.15;u.strobe.visible=bt<.1;u.beacon.visible=bt>.55&&bt<.68;
  if(c.rs>.55&&d<90){c.sn-=dt;if(c.sn<=0){c.sn=.13;sfx(170+80*c.rs,Math.min(.22,.22*(1-d/90))*(dv?1:.8)*vSnd(c.heli?c.y:0),.1,0)}}
  if(c.rs>.55&&(c.y-c.fb)<9){c.ds-=dt;if(c.ds<=0){c.ds=.12;const a=R(0,6.28),r=R(2,5);fxDust(c.x+Math.cos(a)*r,c.z+Math.sin(a)*r,2)}}
 }}
// controles dos botões de voo
{const PID={u:null,d:null},hb=(id,k)=>{const e=document.getElementById(id);e.addEventListener('pointerdown',ev=>{ev.preventDefault();HK[k]=1;PID[k]=ev.pointerId;try{e.setPointerCapture(ev.pointerId)}catch(_){}});
 e.addEventListener('lostpointercapture',()=>{HK[k]=0;PID[k]=null})};hb('bhu','u');hb('bhd','d');
 const rl=ev=>{for(const k of['u','d'])if(PID[k]===ev.pointerId){HK[k]=0;PID[k]=null}},rs_=()=>{HK.u=HK.d=0;PID.u=PID.d=null};
 addEventListener('pointerup',rl);addEventListener('pointercancel',rl);addEventListener('blur',rs_);document.addEventListener('visibilitychange',rs_);addEventListener('touchend',e=>{if(!e.touches.length)rs_()})}
