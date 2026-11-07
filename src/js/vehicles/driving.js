/* Deadzone · vehicles/driving.js
 * Direção, entrada/saída e colisão de veículos.
 */
function carTxt(){const c=drv;if(c.heli)return '🚁 '+Math.round(Math.abs(c.spd)*3.6)+' km/h · ↑ '+Math.round(c.y)+' m · ⛽ '+Math.round(c.fuel)+'% · 🔧 '+Math.max(0,Math.round(c.hp))+'%'+(c.fire?' · 🔥 FOGO!':'')+(c.fuel<=0?' · SEM COMBUSTÍVEL':'');return '🚗 '+Math.round(Math.abs(c.spd)*3.6)+' km/h · ⛽ '+Math.round(c.fuel)+'% · 🔧 '+Math.max(0,Math.round(c.hp))+'%'+(c.fire?' · 🔥 FOGO!':'')+(c.fuel<=0?' · SEM GASOLINA':'')}
function enterCar(c){if(c.dead){say(c.heli?'Helicóptero destruído':'Carro destruído',1.5);return}if(c.heli&&c.y-(c.fb||0)>1.5)return;drv=c;if(!c.heli)try{if(selC>0&&CARC[selC]&&c.g.body.material!==BURN)c.g.body.material=carMatFor(selC)}catch(e){}mode='drive';st=0;ui();ads=0;firing=0;rlOn=0;rl=0;cast=null;P.x=c.x;P.z=c.z;P.y=0;pl.visible=false;setLabel();say(c.heli?'🚁 Segure ▲ para subir · ▼ para descer · analógico: frente/ré e girar · Sair para descer':'Analógico: acelera, ré e vira · Sair para descer',c.heli?6:4)}
function exitCar(){const c=drv;if(c.heli){if(c.y-(c.fb||0)<=2.5&&Math.abs(c.spd)<5){P.x=c.x+Math.cos(c.yaw)*3.6;P.z=c.z-Math.sin(c.yaw)*3.6;P.y=Math.max(GY(P.x,P.z,c.y+1.3),c.y);P.vy=0;drv=null;mode='ground';mvp(0,0);pl.visible=true;yaw=c.yaw;setLabel();HK.u=HK.d=0;return}
  if(c.y-(c.fb||0)>=15||(c.crash&&c.y-(c.fb||0)>=6)){P.x=c.x;P.z=c.z;P.y=c.y;P.vy=-6;drv=null;pl.visible=true;yaw=c.yaw;HK.u=HK.d=0;openChute();say('🪂 Você saltou do helicóptero!',3);return}
  say('Pouse para sair · ou suba acima de 15 m para saltar de paraquedas',2.5);return}
 if(Math.abs(c.spd)>5){say('Reduza a velocidade para sair',1.5);return}P.x=c.x+Math.cos(c.yaw)*2.6;P.z=c.z-Math.sin(c.yaw)*2.6;P.y=TERH(P.x,P.z);P.vy=0;drv=null;mode='ground';mvp(0,0);pl.visible=true;yaw=c.yaw;setLabel()}
// personagem SENTADO no banco do motorista, com as mãos no volante (IK) girando para os lados
const _seatV=new T.Vector3(),SEAT0={car:new T.Vector3(.38,.6,-.2),heli:new T.Vector3(0,1.5,1.25)};let steerA=0;
function seatPose(dt_,ix_){const c=drv;if(!c||!c.g)return;const g=c.g,s=(g.userData&&g.userData.seat)||(c.heli?SEAT0.heli:SEAT0.car);g.updateMatrixWorld();_seatV.copy(s).applyMatrix4(g.matrixWorld);
 pl.visible=true;pl.quaternion.copy(g.quaternion);pl.position.set(_seatV.x,_seatV.y-.62,_seatV.z);
 const inp=Math.max(-1,Math.min(1,ix_||0));steerA+=(inp-steerA)*Math.min(1,(dt_||.016)*7);
 // corpo: quadril no assento, costas um pouco para trás, coxas para frente, joelhos dobrados
 hips.position.y=.62;hips.rotation.set(0,0,0);body.position.y=0;
 tor.rotation.set(.1,0,-steerA*.06*(c.heli?0:1));head.rotation.set(-.08,steerA*.25,0);
 lg1.th.rotation.set(-1.42,0,.1);lg2.th.rotation.set(-1.42,0,-.1);lg1.kn.rotation.x=1.25;lg2.kn.rotation.x=1.25;
 if(c.heli){ // helicóptero: mão direita no manche, esquerda no coletivo
  const k=Math.sin(tt*1.3)*.015;ik(aR,1,.12+steerA*.05,.12+k,.36);ik(aL,-1,-.24,.06,.2);
 }else{ // mãos em "10 e 2" NO ARO DO VOLANTE de verdade; o volante gira e as mãos vão junto
  const w=g.userData.wheelObj,rot=-steerA*1.6;
  if(w){w.rotation.z=rot;w.updateMatrixWorld(true);pl.updateMatrixWorld(true);const R=(g.userData.cab&&g.userData.cab.userData.wheelR)||.17;
   // os dois pontos do aro ("10 e 2"), levados para o espaço do tronco; cada braço pega o ponto do SEU lado
   const pA=new T.Vector3(R*.87,R*.5,0),pB=new T.Vector3(-R*.87,R*.5,0);w.localToWorld(pA);w.localToWorld(pB);tor.worldToLocal(pA);tor.worldToLocal(pB);
   const pp=pA.x>pB.x?[pA,pB]:[pB,pA];ik(aR,1,pp[0].x,pp[0].y,pp[0].z);ik(aL,-1,pp[1].x,pp[1].y,pp[1].z)}
  else{const R=.19,cy=.3,cz=.4,tl=.45;const hand=(th,side)=>{const sx_=Math.sin(th)*R,uy=Math.cos(th)*R;ik(side>0?aR:aL,side,sx_,cy+uy*Math.cos(tl),cz-uy*Math.sin(tl))};hand(Math.PI/3+rot,1);hand(-Math.PI/3+rot,-1)}}
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
// FÍSICA DO CARRO (corpo rígido): 4 rodas com suspensão (mola + amortecedor) e 8 quinas da
// carroceria que batem no chão. Gravidade, inércia de arfagem/rolagem e força da curva.
// Nada "puxa" o carro de volta para ficar em pé: se passar do ponto de equilíbrio, ele tomba.
// Estado: c.cy (altura do centro de massa), c.vy, c.p (arfagem), c.r (rolagem), c.pv, c.rv.
const CPH={g:24,cm:.62,ix:2.8,iz:1.15,
 wheels:[[.86,.02,1.38],[-.86,.02,1.38],[.86,.02,-1.38],[-.86,.02,-1.38]],
 body:[[.95,.32,2.2],[-.95,.32,2.2],[.95,.32,-2.2],[-.95,.32,-2.2],[.92,1.5,1.1],[-.92,1.5,1.1],[.92,1.5,-1.2],[-.92,1.5,-1.2]],
 kw:150,dw:18,kb:700,db:45,fw:70,fb:260};
const wrapA=a=>((a+Math.PI*3)%(Math.PI*2))-Math.PI;
const _cE=new T.Euler(),_cQ=new T.Quaternion(),_cV=new T.Vector3(),_cO=new T.Vector3(),_cU=new T.Vector3();
function carInit(c){const sx=Math.sin(c.yaw),cz=Math.cos(c.yaw),hf=TERH(c.x+sx*1.4,c.z+cz*1.4),hb=TERH(c.x-sx*1.4,c.z-cz*1.4),hl=TERH(c.x+cz*.86,c.z-sx*.86),hr=TERH(c.x-cz*.86,c.z+sx*.86);
 // nasce apoiado no relevo (inclinado igual ao chão) e já com a suspensão assentada: nada de pulo ao entrar
 c.p=-Math.atan2(hf-hb,2.76);c.r=Math.atan2(hl-hr,1.72);c.cy=(hf+hb+hl+hr)/4+CPH.cm-.03;c.vy=0;c.pv=0;c.rv=0;c.air=0;c.ok=true;c.flipT=0;c.lyaw=c.yaw;c.prev=null;c.wn=4;c.sleep=0}
function carAir(c,dt){
 if(c.cy==null||!isFinite(c.cy)||!isFinite(c.p)||!isFinite(c.r))carInit(c);
 const N=Math.max(2,Math.min(10,Math.ceil(dt/.006))),h=dt/N,G=CPH.g;
 const yr=wrapA(c.yaw-(c.lyaw==null?c.yaw:c.lyaw))/Math.max(dt,1e-3);c.lyaw=c.yaw;
 const lat=Math.max(-40,Math.min(40,c.spd*yr));let wn=0,maxImp=0,bodyHit=0,bImp=0;
 for(let k=0;k<N;k++){
  _cQ.setFromEuler(_cE.set(c.p,c.yaw,c.r,'YXZ'));
  // origem do modelo (chão do carro) = centro de massa - R*(0,cm,0)
  _cO.set(0,CPH.cm,0).applyQuaternion(_cQ);const ox=c.x-_cO.x,oy=c.cy-_cO.y,oz=c.z-_cO.z;
  let Fy=0,tx=0,tz=0;wn=0;
  const cyw=Math.cos(-c.yaw),syw=Math.sin(-c.yaw),hvx=Math.sin(c.yaw)*c.spd,hvz=Math.cos(c.yaw)*c.spd;
  const contact=(q,K,D,isW)=>{_cV.set(q[0],q[1],q[2]).applyQuaternion(_cQ);const wx=ox+_cV.x,wy=oy+_cV.y,wz=oz+_cV.z,g=TERH(wx,wz),pen=g-wy;
   if(pen<=0)return;
   // quanto o chão sobe/desce sob o ponto com o carro andando (o amortecedor usa a velocidade RELATIVA ao chão)
   const gr=(TERH(wx+hvx*.08,wz+hvz*.08)-g)/.08;
   // velocidade vertical do ponto = vy + (w x r).y ; w em coordenadas "sem yaw"
   // braço a partir do CENTRO DE MASSA, girado para o referencial do carro sem a direção (yaw)
   const rx=_cV.x-_cO.x,rz=_cV.z-_cO.z,ax=rx*cyw+rz*syw,az=-rx*syw+rz*cyw;
   const vp=c.vy+c.rv*ax-c.pv*az-gr;
   // força limitada (fim de curso da suspensão / deformação do pneu): sem "coice" que joga o carro longe
   let f=K*Math.min(pen,.5)-D*vp;if(f<0)f=0;if(f>(isW?CPH.fw:CPH.fb))f=isW?CPH.fw:CPH.fb;if(-vp>maxImp)maxImp=-vp;if(!isW&&-vp>bImp){bImp=-vp;bodyHit=1}
   Fy+=f;tx+=-az*f;tz+=ax*f;if(isW)wn++};
  for(const q of CPH.wheels)contact(q,CPH.kw,CPH.dw,1);
  for(const q of CPH.body)contact(q,CPH.kb,CPH.db,0);
  // força da curva (centrífuga) aplicada no centro de massa: inclina a carroceria e pode capotar
  if(wn>=2)tz+=lat*.3*CPH.cm*Math.cos(c.r);
  c.vy+=(Fy-G)*h;c.cy+=c.vy*h;
  c.pv+=tx/CPH.ix*h;c.rv+=tz/CPH.iz*h;
  const ad=Math.exp(-(wn?1.6:.9)*h);c.pv*=ad;c.rv*=ad;
  // no ar: o bico acompanha a direção do voo e a rolagem estabiliza devagar (efeito do ar/peso), sem travar
  if(wn===0){const tp_=Math.max(-.45,Math.min(.45,-Math.atan2(c.vy,Math.abs(c.spd)+4)*.8));c.pv+=((tp_-c.p)*3.2-c.pv*1.6)*h;if(Math.abs(c.r)<1.3)c.rv+=(-c.r*2.2-c.rv*1.2)*h}
  c.p=wrapA(c.p+c.pv*h);c.r=wrapA(c.r+c.rv*h);
  if(c.cy<TERH(c.x,c.z)-.5){c.cy=TERH(c.x,c.z)+CPH.cm;c.vy=0}}
 c.wn=wn;c.air=wn===0&&!bodyHit;c.bImp=bImp;
 _cU.set(0,1,0).applyQuaternion(_cQ);const up=_cU.y;c.ok=up>.55&&wn>=2;
 // pancadas: rodas aguentam muito (pouso em pé não machuca); carroceria batendo forte machuca
 // dano só quando a CARROCERIA bate forte (pouso nas rodas nunca machuca)
 if(bodyHit&&bImp>18){hitCar(c,(bImp-18)*2);if(drv===c)hp-=(bImp-18)*.5;sfx(120,Math.min(.6,bImp/25),.2,0)}
 if(maxImp>5)sfx(150,Math.min(.4,maxImp/30),.12,0);
 // capotado e quase parado por 3 s: desvira devagar (como se alguém empurrasse)
 if(up<.55&&Math.abs(c.spd)<2&&Math.abs(c.rv)+Math.abs(c.pv)<1.2){c.flipT=(c.flipT||0)+dt;if(c.flipT>3){c.r-=c.r*Math.min(1,dt*1.6);c.p-=c.p*Math.min(1,dt*1.6);c.vy=Math.max(c.vy,1.2);c.rv*=.5;c.pv*=.5}}else if(up>.9)c.flipT=0;
 if(!c.ok)c.spd-=Math.sign(c.spd)*Math.min(Math.abs(c.spd),(wn?6:1.2)*dt);
 // dorme quando assentado (economiza no celular)
 c.sleep=(wn===4&&Math.abs(c.vy)<.05&&Math.abs(c.pv)+Math.abs(c.rv)<.03&&Math.abs(c.spd)<.05)?(c.sleep||0)+dt:0;
 _cO.set(0,CPH.cm,0).applyQuaternion(_cQ.setFromEuler(_cE.set(c.p,c.yaw,c.r,'YXZ')));
 c.y=c.cy-_cO.y;c.g.rotation.order='YXZ';c.g.position.set(c.x-_cO.x,c.y,c.z-_cO.z);c.g.rotation.set(c.p,c.yaw,c.r)}
function updCars(dt,ix,iy){nearCar=null;let nd=4.2;
 for(const c of CARS){const dv=drv===c&&mode==='drive',d=Math.hypot(c.x-P.x,c.z-P.z);c.g.visible=d<(c.heli?520:400)&&!MP;
  if(c.heli){if(MP)continue;updHeli(c,dt,dv,ix,iy,d);if(mode==='ground'&&!c.dead&&c.y-(c.fb||0)<1.5&&d-2<nd){nd=d-2;nearCar=c}continue}
  if(c.fire&&!c.dead){c.hp-=dt*4;c.fl.visible=true;for(const f of c.fl.children)f.scale.y=.7+Math.random()*.8;if(dv)hp-=3*dt;if(c.hp<=0)boom(c)}
  if(c.dead)continue;
  c.steer=dv?Math.max(-1,Math.min(1,ix)):0;   // direção das rodas da frente (só visual)
  if(dv||Math.abs(c.spd)>.05||c.cy==null||!(c.sleep>.5)){
   // pedais: acelerar = frente; ré = freia até quase parar e então anda para trás (a física já faz isso); freio = para
   if(dv){const cb_=window.DZPED||{},th=cb_.g?1:cb_.r?-1:cb_.b?0:-iy;let a=0;if(c.fuel>0&&c.ok!==false&&c.wn>=2)a=th*(th>0?15:9)*((th>0&&c.spd<-.3)||(th<0&&c.spd>.3)?2:1);c.spd+=a*dt;if(Math.abs(th)<.05||c.fuel<=0)c.spd-=Math.sign(c.spd)*Math.min(Math.abs(c.spd),4*dt);
    c.yaw-=ix*dt*1.9*Math.max(-1,Math.min(1,c.spd/7))*(c.wn>=2&&c.ok!==false?1:0);if(c.fuel>0)c.fuel=Math.max(0,c.fuel-dt*(.08+.35*Math.abs(th)+.008*Math.abs(c.spd)));
    for(const b of bots){if(b.dead||b.air||b.team===1||Math.abs(c.spd)<6)continue;if(Math.hypot(b.x-c.x,b.z-c.z)<2.2&&tt-(b.ro||0)>.4){b.ro=tt;b.hp-=Math.abs(c.spd)*6;if(b.hp<=0&&!b.dead)killBot(b,1)}}}
   else if(c.wn>=2)c.spd-=Math.sign(c.spd)*Math.min(Math.abs(c.spd),5*dt);
   if(dv&&window.DZPED&&DZPED.b&&c.wn>=2)c.spd-=Math.sign(c.spd)*Math.min(Math.abs(c.spd),26*dt);
   c.spd=Math.max(-8,Math.min(28,c.spd));c.x+=Math.sin(c.yaw)*c.spd*dt;c.z+=Math.cos(c.yaw)*c.spd*dt;collideCar(c);
   carAir(c,dt);if(dv){P.x=c.x;P.z=c.z;P.y=c.g.position.y}}
  if(mode==='ground'&&d<nd&&!c.dead){nd=d;nearCar=c}}}
$('bi').onpointerdown=e=>{e.preventDefault();renderPk();$('pk').style.display='flex'};$('bv').onpointerdown=e=>{e.preventDefault();carBtn()};$('bu').onpointerdown=e=>{e.preventDefault();refuel()};
addEventListener('keydown',e=>{if(e.key==='v')carBtn();if(e.key==='n')refuel();if(e.key==='i'&&mode==='ground'){renderPk();$('pk').style.display='flex'}});
