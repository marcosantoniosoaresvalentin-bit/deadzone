/* Deadzone · core/main-loop.js
 * Laço principal do jogo (atualização e câmera a cada quadro).
 */
let last=0;
// Proteção: um erro em um quadro não pode congelar a tela.
function loop(t){requestAnimationFrame(loop);try{loopBody(t)}catch(e){dzErr(e);try{ren.render(sc,cam)}catch(_){}}}
// CÂMERA LIVRE 360° nos veículos: arrastar a tela gira a câmera em volta do carro/helicóptero.
// Sem tocar por 2,5 s e andando, ela volta devagar para trás do veículo.
let dcY=0,dcLast=null,dcT=0,dcCar=null;
function dcam(c,dt){if(dcCar!==c){dcCar=c;dcY=0;dcLast=null}
 if(dcLast!=null){const d=((yaw-dcLast+Math.PI*3)%(Math.PI*2))-Math.PI;if(Math.abs(d)>1e-4){dcY+=d;dcT=tt}}
 dcY=((dcY+Math.PI*3)%(Math.PI*2))-Math.PI;
 if(tt-dcT>2.5&&Math.abs(c.spd)>4)dcY*=Math.exp(-dt*1.4);
 const a=c.yaw+dcY;yaw=a;dcLast=a;return a}
// RESOLUÇÃO AUTOMÁTICA: mede o tempo médio dos quadros e ajusta a resolução para não travar
const DYN={acc:0,n:0,k:1,base:0};
function dynRes(dt){if(mode==='lobby'||!(dt>0))return;DYN.acc+=dt;DYN.n++;if(DYN.acc<2)return;const ms=DYN.acc/DYN.n*1000;DYN.acc=0;DYN.n=0;
 const base=DYN.base||(DYN.base=ren.getPixelRatio());let k=DYN.k;if(ms>33&&k>.75)k=Math.max(.75,k-.08);else if(ms<22&&k<1)k=Math.min(1,k+.05);
 if(k!==DYN.k){DYN.k=k;ren.setPixelRatio(base*k);rs()}}
function loopBody(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;tt+=dt;try{dynRes(dt)}catch(e){}smokeTick(dt);if(spec)specTick();
 
 if(mode!=='lobby'&&mode!=='dead'){gt+=dt;while(si<sched.length&&sched[si].lt<=gt)spawnBot(sched[si++])}
 if(mt>0){mt-=dt;if(mt<=0)msg.textContent=''}
 {const s_=cur>=0?slots[cur]:null;wp=s_?s_.t:null;scp=(s_&&(s_.t==='rifle'||s_.t==='sniper'||s_.t==='bow'))?s_.sc:0;silP=(s_&&s_.sil)?1:0;const k_=wp+':'+scp+':'+silP;
  if(k_!==rfk){rfk=k_;while(rf.children.length)rf.remove(rf.children[0]);if(wp)rf.add(mkW(wp,scp,silP))}
  const slk_=slots.map(q=>q?q.t+q.sc+q.sil:'-').join(',')+cur;if(slk_!==slk){slk=slk_;while(sling.children.length)sling.remove(sling.children[0]);while(hipG.children.length)hipG.remove(hipG.children[0]);slots.forEach((q,i)=>{if(!q||i===cur)return;const w=mkW(q.t,q.sc,q.sil);if(i===2){w.position.set(.27,-.1,.04);hipG.add(w)}else{w.position.set(i?.11:-.11,.3,-.5);w.rotation.set(-1.45,0,i?-.3:.3);sling.add(w)}})}
  {const vw=vmH.children[0];if(vw){animW(vw,kk,rl,fcd>0&&wp?1-fcd/WS[wp].r:1);const rk=scp===2?.2:1;vw.position.set(Math.sin(tt*1.7)*.0015,Math.sin(tt*2.3)*.0012,-.035*kk*rk);vw.rotation.x=-.05*kk*rk}}
  const vk=(ads&&wp)?k_:'';if(vk!==vmk){vmk=vk;while(vmH.children.length)vmH.remove(vmH.children[0]);if(vk){vmH.add(mkW(wp,scp,silP,1));const e=EY[(wp==='rifle'||wp==='bow'&&scp)?wp+scp:wp];vmH.position.set(e[0],-e[1],e[2])}}
  if(mode!=='ground'){rlOn=0;rl=0;cast=null}
  if(rlOn){if(!s_){rlOn=0;rl=0}else{rlT+=dt;rl=Math.min(.999,rlT/WS[s_.t].rt);if(rlT>=WS[s_.t].rt){const n=Math.min(WS[s_.t].mag-s_.mag,s_.res);s_.mag+=n;s_.res-=n;rlOn=0;rl=0;say('Recarregado',1)}}}
  if(cast){cast.t-=dt;say('Curando... '+Math.ceil(cast.t)+'s',.2);if(cast.t<=0){hp=Math.min(100,hp+(cast.k==='band'?15:100));bag[cast.k]--;cast=null;drawBag();say('Curado!',1.5)}}}
 dw=Math.min(1,dw+dt/.65);kk=Math.max(0,kk-dt*(wp==='pistol'?8:6));if(!wp||mode!=='ground'||dw<1)ads=0;adk+=(ads-adk)*Math.min(1,dt*10);bam.style.background=ads?'rgba(240,168,48,.75)':'';
 let ix=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),iy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 if(jx||jy){ix=jx;iy=jy}
 let l=Math.hypot(ix,iy);if(l>1){ix/=l;iy/=l;l=1}
 const fx=Math.sin(yaw),fz=Math.cos(yaw),dx=fx*-iy-fz*ix,dz=fz*-iy+fx*ix,k=Math.min(1,dt*10);
 if(mode==='ground'){
  if(VLT)vaultTick(dt);else{const spd=(6-cr*3-pr*4.8)*(1-.4*adk)*(cast?.5:1)*(mpMove()?1:0);mvp(dx*spd*l*dt,dz*spd*l*dt);
  P.vy-=20*dt;P.y+=P.vy*dt;{const gy_=GY(P.x,P.z,P.y+.01);if(P.y<=gy_||(P.vy<=0&&P.y-gy_<.4&&P.y-gy_>0&&(Math.abs(gy_-TERH(P.x,P.z))<.01||P.y-gy_<.25))){P.y=gy_;P.vy=0}else if(P.vy<-22&&P.y-gy_>6)openChute()}}
  air+=((P.y>GY(P.x,P.z,P.y)+.02?1:0)-air)*Math.min(1,dt*12);if(window.DZW&&DZW.touch&&(l>.05||P.vy))DZW.touch(P.x,P.y,P.z,dx,dz);{/* caindo de lugar alto (prédio): o botão de pulo vira "Abrir" paraquedas */const hi_=P.vy<-1&&P.y-GY(P.x,P.z,P.y)>3;if(hi_!==!!window.__hiF){window.__hiF=hi_;bj.textContent=hi_?'Abrir':'Pular';if(hi_)say('Toque em Abrir para usar o paraquedas',2)}}cr+=((st===1?1:0)-cr)*k;pr+=((st===2?1:0)-pr)*Math.min(1,dt*3);
  if(firing||keys.f||ads){pl.rotation.y+=(((yaw-pl.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI)*Math.min(1,dt*14)}
  else if(l>.05){const g=Math.atan2(dx,dz),d=((g-pl.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;pl.rotation.y+=d*Math.min(1,dt*12)}
  ph+=dt*l*(11-cr*4);cw+=dt*l*4.5;amt+=(l-amt)*k;
  drawSlots();
  fcd-=dt;if(rcA>0&&!firing&&!keys.f){const r_=Math.min(rcA,dt*.1);rcA-=r_;pit=Math.min(.85,pit+r_)}{const s_=cur>=0?slots[cur]:null;if(s_&&(firing||keys.f)&&fcd<=0&&!rlOn&&!cast&&dw>=1&&mpOk()){if(s_.mag>0){fcd=WS[wp].r;kk=1;s_.mag--;fire(fx,fz);if(!s_.sil)try{DZFX.flash(P.x+fx*.9,P.y+1.45-.45*cr-pr,P.z+fz*.9,1)}catch(e){}sfx(s_.sil?700:1800,s_.sil?.12:.5,s_.sil?.1:.18,0)}else if(mt<=0)say(s_.res>0?'Recarregue a arma':'Sem munição',1.2)}else if(!s_&&(firing||keys.f))melee()}
 }else if(mode==='sky'||mode==='chute'){
  const ch_=mode==='chute',f_=-iy;fw+=((f_>0?f_:0)-fw)*k;bk+=((f_<0?-f_:0)-bk)*k;sd+=(ix-sd)*k;
  const fc=fw+.6*bk,sp=(ch_?12:26)*(1+.5*fw);
  {const ox_=P.x,oz_=P.z;P.x=Math.max(-(MAPH-5),Math.min(MAPH-5,P.x+(fx*fc-fz*sd)*sp*dt));P.z=Math.max(-(MAPH-5),Math.min(MAPH-5,P.z+(fz*fc+fx*sd)*sp*dt));
   // não entra no mar fundo (só na água rasa da beira)
   const nh_=TERH(P.x,P.z);if(nh_<-.9&&nh_<TERH(ox_,oz_)){P.x=ox_;P.z=oz_}}
  const tv=ch_?-(5+9*fw-2.2*bk):-(40+25*fw-10*bk);P.vy+=(tv-P.vy)*Math.min(1,dt*(ch_?2.5:3));
  P.y+=P.vy*dt;if(ch_)mvp(0,0);if(mode==='sky'&&P.y<GY(P.x,P.z,1e9)+130)openChute();if(P.y<=GY(P.x,P.z,P.y))land();
  pl.rotation.y=yaw;amt+=(0-amt)*k;
 }
 updCars(dt,ix,iy);updAim(dt);updGren(dt);updExpl(dt);if(mode!=='lobby'&&mode!=='dead'&&!MP)zoneUpd(dt);if(MP)mpTick(dt);
 sk+=((mode==='sky'?1:0)-sk)*k;ch+=((mode==='chute'?1:0)-ch)*k;
 {const p1=sat(pr/.4),p2=sat((pr-.4)/.6),kn=Math.max(cr,p1*(1-p2)),ar=(wp&&mode==='ground')?1:0;
  const w=amt*(1-cr*.5)*(1-pr*.9)*(1-air),sA=Math.sin(ph),cA=Math.cos(ph),tb=-1.1*kn-.7*air,kb=1.9*kn+1*air;
  const cs=Math.sin(cw),cm=p2*sat(l*3),hd=p1*(1-p2),sw=sA*.7*w,gm=sat(rl*4)*(1-sat((rl-.5)*4)),rR=(cs+1)/2,rL=(1-cs)/2,cR=Math.max(0,cs)*cm,cL=Math.max(0,-cs)*cm,g2=gm*(1-p2);
  const pRz=lp(lp(.25,lp(.38,.28,rR),cm),-.25+.06*cs*cm,ar),pLz=lp(lp(-.25,-lp(.38,.28,rL),cm),.35-.06*cs*cm,ar);
  const aRx=lp(lp(lp(-sw,-.6,ar),-.5,hd),Math.PI-.55+.2*cs*cm,p2),aRz=lp(lp(lp(.06,-.25,ar),-.15,hd),pRz,p2),aRe=lp(lp(lp(-.2-.3*Math.abs(sA)*w,-1.4,ar),-.3,hd),-1-.35*cL,p2);
  const aLx=lp(lp(lp(lp(sw,-.8,ar),-.5,hd),Math.PI-.55-.2*cs*cm,p2),.1,g2),aLz=lp(lp(lp(lp(-.06,.6,ar),.15,hd),pLz,p2),.2,g2),aLe=lp(lp(lp(lp(-.2-.3*Math.abs(sA)*w,-1.2,ar),-.3,hd),-1-.35*cR,p2),-1.3,g2);
  const G=[tb-sA*.85*w+.1*cR,kb+Math.max(0,cA)*w+.32*cR,tb+sA*.85*w+.1*cL,kb+Math.max(0,-cA)*w+.32*cL,aRx,aRz,aRe,aLx,aLz,aLe,.1*amt+.35*kn,sA*.12*w+.14*cs*cm,-p2*1.2-.3*kn,.95-.33*kn,p2*Math.PI/2,p2*.2,-p2*.85];
  const pR=Math.max(0,sd),pL=Math.max(0,-sd),sw2=Math.sin(tt*1.5)*.08;
  const S=[.3+.2*bk,.6,.3+.2*bk,.6,-.2,1.3,-.3,-.2,-1.3,-.3,-.25,0,-1,.95,1.35+.35*fw-.25*bk,.5,-.85];
  const C=[-.25+sw2-1.25*bk,.4-.25*bk,-.25-sw2-1.25*bk,.4-.25*bk,Math.PI*1.08+1.45*pR,.3+.25*pR,-.25-1.75*pR,Math.PI*1.08+1.45*pL,-.3-.25*pL,-.25-1.75*pL,-.05-.15*bk,0,-.2,.95,.18*fw-.3*bk,0,0];
  const F=G.map((v,i)=>v*(1-sk-ch)+S[i]*sk+C[i]*ch);
  lg1.th.rotation.x=F[0];lg1.kn.rotation.x=F[1];lg2.th.rotation.x=F[2];lg2.kn.rotation.x=F[3];
  aR.sh.rotation.set(F[4],0,F[5]);aR.el.rotation.x=F[6];aL.sh.rotation.set(F[7],0,F[8]);aL.el.rotation.x=F[9];
  tor.rotation.x=F[10]+(pit-.25)*.3*(1-p2)*ar;tor.rotation.y=F[11];head.rotation.x=F[12];hips.position.y=F[13];body.rotation.x=F[14];body.position.set(0,F[15],F[16]);body.rotation.z=.06*cs*cm;hips.rotation.y=.1*cs*cm;tor.rotation.z=-.05*cs*cm-.2*sd*ch;lg1.th.rotation.z=-.12*p2-.06*cL;lg2.th.rotation.z=.12*p2+.06*cR;
  rf.visible=!!ar;rf.rotation.x=-p2*Math.PI/2-.3*g2+(pit-.25)*.4*(1-p2);rf.position.set(.1,.27+.5*p2,.22*(1-p2));rf.rotation.z=0;if(dw<1){const e=dw*dw*(3-2*dw);rf.position.x=lp(0,rf.position.x,e);rf.position.y=lp(.32,rf.position.y,e);rf.position.z=lp(-.4,rf.position.z,e);rf.rotation.x=lp(-1.35,rf.rotation.x,e);rf.rotation.z=.3*(1-e)}rf.position.z-=.05*kk;rf.rotation.x-=.09*kk;if(wp==='bow'){const bq=BC>0?BC/.45:0;rf.position.z+=.14*BD-.07*bq;rf.position.y+=.04*BD;rf.rotation.x+=.06*BD}rf.position.y+=Math.abs(Math.sin(cw))*.012*w;
  if(ar){rf.updateMatrix();const hh=HG[wp],hv=q=>new T.Vector3(q[0],q[1],q[2]).applyMatrix4(rf.matrix),r_=hv(hh[0]),l_=hv(hh[1]);
   if(gm>.01)l_.lerp(hv(MG[wp]),gm*(1-p2));
   ik(aR,1,r_.x,r_.y,r_.z);ik(aL,-1,l_.x,l_.y,l_.z);animW(rf.children[0],kk,rl,fcd>0?1-fcd/WS[wp].r:1)}}
 if(pr>.05){const pp=sat((pr-.4)/.6),mv_=sat(l*3),c_=Math.sin(cw),k_=pp*mv_;
  head.rotation.x-=.55*pp;tor.rotation.x-=.18*pp*(1+.5*Math.abs(c_)*mv_);hips.rotation.y+=.18*c_*k_;hips.position.y+=.02*Math.abs(c_)*k_;
  lg1.kn.rotation.x+=.28*Math.max(0,c_)*k_;lg2.kn.rotation.x+=.28*Math.max(0,-c_)*k_;lg1.th.rotation.x-=.08*Math.max(0,c_)*k_;lg2.th.rotation.x-=.08*Math.max(0,-c_)*k_;lg1.th.rotation.z-=.18*Math.max(0,c_)*k_;lg2.th.rotation.z+=.18*Math.max(0,-c_)*k_;body.position.y-=.03*pp}
 if(ml>0){ml=Math.max(0,ml-dt);const q_=1-ml/.35,s_=Math.sin(Math.min(1,q_)*Math.PI);if(mode==='ground'){aR.sh.rotation.set(mlK?-1.2-.6*s_:-1.3-.9*s_,mlK?-.5*s_:0,mlK?-.4+.9*s_:.1);aR.el.rotation.x=-.25-(1-s_)*.7;tor.rotation.y=-.45*s_;tor.rotation.x+=.1*s_}}
 knf.visible=ml>0&&!!mlK&&mode==='ground';
 animExtra(dt);try{const g_=mode==='ground'&&ml<=0;CH.loco={w:mode==='lobby'?1:g_?(1-cr)*(1-Math.min(1,pr*3))*(1-air):0,sp:g_?amt*(6-cr*3)*(1-.4*adk)*(cast?.5:1):0,arm:!!(rf.visible||cast||GA||TH||ml>0),fw:l>.05?(dx*Math.sin(pl.rotation.y)+dz*Math.cos(pl.rotation.y))/l:1}}catch(e){}pl.position.set(P.x,P.y,P.z);if(mode==='drive'&&drv)seatPose(dt,typeof ix!=='undefined'?ix:0);else if(VLT&&mode==='ground')vaultPose();else if(pl.rotation.x||pl.rotation.z){pl.rotation.x=0;pl.rotation.z=0}shd.visible=mode==='ground'||mode==='lobby';shd.position.x=P.x;shd.position.z=P.z;{const g_=GY(P.x,P.z,P.y);shd.position.y=g_+.03;shd.scale.setScalar(Math.max(.4,1-(P.y-g_)*.2))};
 if(window.DZChute&&DZChute.ready)DZChute.update(dt,fw,bk,sd);else{canopy.position.set(P.x,P.y+1.6,P.z);canopy.rotation.set(.55*fw-.3*bk,yaw,sd*.3,'YXZ')}
 for(const o of loot){const vv=Math.abs(o.x-P.x)+Math.abs(o.z-P.z)<110&&!MP;o.top.visible=vv;}
 for(const b of bots){
  if(b.air){
   if(b.waitForPlayer){
    if(mode==='plane'){
     b.x=pS.x+pD.x*PLV*gt+(b.waitOffsetX||0);b.z=pS.z+pD.z*PLV*gt+(b.waitOffsetZ||0);b.y=450;
     b.g.position.set(b.x,b.y,b.z);b.g.visible=true;continue;
    }
    b.waitForPlayer=false;b.tx=P.x+(b.waitOffsetX||0)*2;b.tz=P.z+(b.waitOffsetZ||0)*2;
   }
   if(!b.ch&&b.y<b.op){b.ch=1;b.cn.visible=true}
   b.vy+=((b.ch?-5.5:-48)-b.vy)*Math.min(1,dt*(b.ch?2.5:4));b.y+=b.vy*dt;
   const ddx=b.tx-b.x,ddz=b.tz-b.z,dd=Math.hypot(ddx,ddz),tl=Math.max(.6,b.y/Math.max(3,-b.vy)),spb=Math.min(b.ch?14:30,dd/tl);
   if(dd>.5){b.x+=ddx/dd*spb*dt;b.z+=ddz/dd*spb*dt;b.g.rotation.y=Math.atan2(ddx,ddz)}
   b.g.position.set(b.x,Math.max(b.y,TERH(b.x,b.z)),b.z);b.g.visible=Math.hypot(P.x-b.x,P.z-b.z)<600;
   if(b.y<=TERH(b.x,b.z)){b.air=0;b.cn.visible=false;mvE(b,0,0)}continue}
  if(b.dead){b.dt+=dt;deadPose(b,dt);if(b.dt>5)b.g.visible=false;continue}
  if(Math.hypot(b.x-zX,b.z-zZ)>zR){b.hp-=dt*(1.5+zI*1.2);if(b.hp<=0){killBot(b,0);continue}b.tgt=null;b.tx=zX+(b.zx??(b.zx=R(-40,40)));b.tz=zZ+(b.zz??(b.zz=R(-40,40)));b.wt=3}
  const ex=P.x-b.x,ez=P.z-b.z,dp=Math.hypot(ex,ez);let mv=0;b.g.visible=dp<150;
  let tg=null;if(b.w){b.ft-=dt;if(b.ft<=0){b.ft=.65;b.tg=null;let best2=5625;if(!b.team&&(mode==='ground'||mode==='drive')&&vSnd(0)&&dp*dp+hAl()*hAl()<best2){best2=dp*dp;b.tg='P'}for(const o of bots){if(o===b||o.dead||o.air||(o.team||0)===(b.team||0))continue;const dx_=o.x-b.x,dz_=o.z-b.z,d2=dx_*dx_+dz_*dz_;if(d2<best2){best2=d2;b.tg=o}}ghTg(b,Math.sqrt(best2))}tg=b.tg;if(tg&&tg!=='P'&&(tg.dead||tg.air))tg=b.tg=null;if(tg==='P'&&(mode!=='ground'&&mode!=='drive'||!vSnd(0)))tg=b.tg=null}
  if(b.w&&tg){const tp=tg==='P'?P:tg,tx=tp.x-b.x,tz=tp.z-b.z,td=Math.hypot(tx,tz)||1;b.g.rotation.y=Math.atan2(tx,tz);b.cd-=dt;
   if(td>14){botNavigate(b,tp.x,tp.z,2.2,dt);mv=1}
   if(b.cd<=0){b.cd=R(1,1.8);b.kk=1;botShot(b,dp);
    if(tg==='P'){if(Math.random()<.5&&!blocked(b.x,TERH(b.x,b.z)+1.3,b.z,P.x,P.y+1.2,P.z)&&!smokeB(b.x,b.z,P.x,P.z)){hurtP(b.w==='shotgun'?(dp<20?14:3):b.w==='rifle'?7:5,b);if(!b.sil)pingDir(b.x,b.z,'hit')}}
    else if(Math.random()<.4&&!blocked(b.x,TERH(b.x,b.z)+1.3,b.z,tg.x,TERH(tg.x,tg.z)+1.2,tg.z)&&!smokeB(b.x,b.z,tg.x,tg.z))hurtB2(tg,b,b.w==='shotgun'?(td<20?18:5):b.w==='rifle'?9:7)}}
  else if(!b.w){mv=botLoot(b,dt)}
  else if(b.isCompanion){const followD=Math.hypot(P.x-b.x,P.z-b.z);if(followD>8){botNavigate(b,P.x,P.z,2.7,dt);mv=1}else{mv=0;b.tgt=null}}
  else{b.wt-=dt;if(b.wt<=0||Math.hypot(b.tx-b.x,b.tz-b.z)<1.5){b.tx=b.x+R(-40,40);b.tz=b.z+R(-40,40);b.wt=R(5,10)}
   botNavigate(b,b.tx,b.tz,2.5,dt);mv=1}
  if(mv&&mode==='ground'&&dp<32&&b.team!==1&&vSnd(0)){b.st-=dt;if(b.st<=0){b.st=.5;pingDir(b.x,b.z,'step')}}
  b.g.position.set(b.x,TERH(b.x,b.z),b.z);{const t_=b.g.rotation.y;if(b.sy==null)b.sy=t_;b.sy+=(((t_-b.sy+Math.PI*3)%(Math.PI*2))-Math.PI)*Math.min(1,dt*9);b.g.rotation.y=b.sy}if(b.g.visible)animBot(b,dt,mv,dp)}
 if(hp<=0&&mode!=='dead'&&!MP)die();
 if(trt>0){trt-=dt;if(trt<=0)trl.visible=false}
 if(plane.visible){for(const p of props)p.rotation.z+=dt*45;plane.position.set(pS.x+pD.x*PLV*gt,450,pS.z+pD.z*PLV*gt);if(gt>=PLT&&mode==='plane')jumpOut();if(gt>PLT+8)plane.visible=false}
 $('hpi').style.width=Math.max(0,hp)+'%';updArm();$('wpt').textContent=mode==='drive'?carTxt():wp?WS[wp].n+(scp?' · '+(scp===3?8:scp)+'x':'')+(silP?' · SIL':'')+' · '+slots[cur].mag+'/'+slots[cur].res+(rlOn?' · recarregando':''):(mode==='ground'?'Sem arma':'');$('alive').textContent='Vivos: '+alive;$('kl').textContent='Abates: '+kills;
 cross.style.display=(mode==='ground'&&wp&&adk<.3)?'block':'none';refreshLoot();
 insB=null;if(mode==='ground')for(const b of FP)if(P.x>b.x0&&P.x<b.x1&&P.z>b.z0&&P.z<b.z1){insB=b;break}insK+=((insB?1:0)-insK)*Math.min(1,dt*4);
 if(mode==='lobby'){pl.rotation.y=lobRot;pl.visible=true;cam.position.set(P.x,1.25,P.z+3.5+(window.dzLobBack||0));cam.lookAt(P.x,1.0,P.z)}
 else if(mode==='plane'){const cp=Math.cos(op),D=58;cam.position.set(plane.position.x+Math.sin(oy)*cp*D,plane.position.y+Math.sin(op)*D,plane.position.z+Math.cos(oy)*cp*D);cam.lookAt(plane.position)}
 else if(mode==='ground'){const gyc=GY(P.x,P.z,P.y),ty=gyc+(P.y-gyc)*.6+1.6-.45*cr-pr-.3*insK,cd=lp(3.1,2.1,insK),so=lp(.62,.42,insK),c2=Math.cos(pit),rx=-fz,rz=fx,lk=pit-.12,cl=Math.cos(lk);
  const ax=P.x-fx*cd*c2+rx*so,az=P.z-fz*cd*c2+rz*so,ay=Math.max(gyc+.35,ty+.2+Math.sin(pit)*cd),atx=ax+fx*30*cl,aty=ay-Math.sin(lk)*30,atz=az+fz*30*cl;
  const eh=P.y+Math.max(.35,1.55-.5*cr-1.2*pr),bx=P.x+fx*.3,bz=P.z+fz*.3,l2=pit-.25,c3=Math.cos(l2),btx=bx+fx*30*c3,bty=eh-Math.sin(l2)*30,btz=bz+fz*30*c3;
  let cx_=lp(ax,bx,adk),cy_=lp(ay,eh,adk),cz_=lp(az,bz,adk);if(insB){cx_=Math.max(insB.x0+.4,Math.min(insB.x1-.4,cx_));cz_=Math.max(insB.z0+.4,Math.min(insB.z1-.4,cz_));cy_=Math.min(cy_,gyc+2.6);if(insB.S){/* prédio: a câmera não atravessa lajes (não vê o andar de cima) nem entra nos degraus */const CE=window.DZCEIL||[],cel=(x,z)=>{let c=1e9;for(const q of CE)if(x>q.x0-.3&&x<q.x1+.3&&z>q.z0-.3&&z<q.z1+.3&&q.y>P.y+1.2&&q.y<c)c=q.y;return c-.3};cx_=Math.max(insB.x0+.5,Math.min(insB.x1-.5,cx_));cz_=Math.max(insB.z0+.5,Math.min(insB.z1-.5,cz_));const hp_=Math.min(cel(P.x,P.z),P.y+2.2);let ty_=Math.min(cy_,cel(cx_,cz_));for(let it=0;it<7&&(GY(cx_,cz_,ty_)+.5>ty_||ty_<Math.min(hp_,P.y+1.2));it++){cx_+=(P.x-cx_)*.3;cz_+=(P.z-cz_)*.3;ty_=Math.min(Math.max(ty_,GY(cx_,cz_,ty_)+.5,Math.min(hp_,P.y+1.2)),cel(cx_,cz_))}cy_=ty_}}{/* câmera não atravessa paredes: puxa para perto do personagem */const hx=P.x+rx*.25,hy=gyc+1.55-.4*cr-.8*pr,hz=P.z+rz*.25;let px=hx,py=hy,pz=hz,k=1;for(let i=1;i<=8;i++){const u=i/8,nx=hx+(cx_-hx)*u,ny=hy+(cy_-hy)*u,nz=hz+(cz_-hz)*u;if(blocked(px,py,pz,nx,ny,nz)){k=Math.max(.12,u-.18);break}px=nx;py=ny;pz=nz}if(k<1){cx_=hx+(cx_-hx)*k;cy_=hy+(cy_-hy)*k;cz_=hz+(cz_-hz)*k}}cam.position.set(cx_,cy_,cz_);cam.lookAt(lp(atx,btx,adk),lp(aty,bty,adk),lp(atz,btz,adk))}
 else if(mode==='drive'&&drv.heli){const c=drv,d_=15+Math.abs(c.spd)*.14+Math.min(10,c.y*.04),cy=dcam(c,dt);cam.position.set(c.x-Math.sin(cy)*d_*Math.cos(pit*.6),Math.max(1.5,c.y+4.6+Math.sin(pit)*9),c.z-Math.cos(cy)*d_*Math.cos(pit*.6));cam.lookAt(c.x+Math.sin(cy)*6,c.y+2,c.z+Math.cos(cy)*6)}
 else if(mode==='drive'){const c=drv,d_=8.5+Math.abs(c.spd)*.08,cy=c.g.position.y||0,ya=dcam(c,dt);const cx_=c.x-Math.sin(ya)*d_*Math.cos(pit*.5),cz_=c.z-Math.cos(ya)*d_*Math.cos(pit*.5);cam.position.set(cx_,Math.max(cy+3.4+Math.sin(pit)*5,TERH(cx_,cz_)+1.2),cz_);cam.lookAt(c.x+Math.sin(ya)*4,cy+1.2,c.z+Math.cos(ya)*4)}
 else{/* com o paraquedas aberto a câmera se afasta e mira entre o jogador e o velame, para ver o paraquedas inteiro */const ty=(mode==='ground'?P.y*.6+1.6-.45*cr-pr:P.y+1+3*ch),cd=mode==='ground'?6.5:8+6*ch;
  cam.position.set(P.x-fx*cd*Math.cos(pit),ty+.2+Math.sin(pit)*cd,P.z-fz*cd*Math.cos(pit));cam.lookAt(P.x,ty,P.z)}
 {const air=mode==='plane'||mode==='sky'||mode==='chute'||(mode==='drive'&&drv&&drv.heli&&drv.y>14);if(air!==wasAir){wasAir=air;cam.far=air?2400:380;sc.fog.near=air?500:70;sc.fog.far=air?2200:340;sky.scale.setScalar(air?3.9:.62);cam.updateProjectionMatrix()}
  // no ar a neblina fica sempre longe (sair do lobby voltava a neblina do chão e escondia a ilha)
  if(air&&(sc.fog.near!==500||sc.fog.far!==2200)){sc.fog.near=500;sc.fog.far=2200}}
 if(mode==='ground')pl.visible=adk<.85;{const sv=mode==='ground'&&adk>.85&&scp>0;sce.style.display=sv?'block':'none';if(sv)sce.className='s'+scp}
 {const fv=lp(lp(65,58,insK),scp===3?9:wp==='pistol'?44:52,adk);if(Math.abs(cam.fov-fv)>.05){cam.fov=fv;cam.updateProjectionMatrix()}}
 {let nd=null,bd=2.6;if(mode==='ground')for(const d of doors){if(d.y!=null&&Math.abs(d.y-P.y)>1.6)continue;/* só portas do andar do personagem */const q=Math.hypot(d.x-P.x,d.z-P.z);if(q<bd){bd=q;nd=d}}bf2.style.display=mode==='ground'?'flex':'none';{const cn_=mode==='drive'||(mode==='ground'&&nearCar);$('bv').style.display=cn_?'flex':'none';$('bv').textContent=mode==='drive'?'Sair':'Entrar';{const hv=(mode==='drive'&&drv&&drv.heli)?'flex':'none';if(hv==='none')HK.u=HK.d=0;$('bhu').style.display=$('bhd').style.display=hv}$('bu').style.display=(cn_&&bag.fuel>0)?'flex':'none';$('bg').style.display=(mode==='ground'&&bag.gren>0)?'flex':'none';$('bg').textContent='💣x'+bag.gren;$('bgl').style.display=(mode==='ground'&&bag.gel>0)?'flex':'none';$('bgl').textContent='🧊x'+bag.gel;bf.textContent=TS?'Lançar':wp?'Atirar':'Atacar'}nearDoor=nd;if(CFG.autoDoor&&nd&&!nd.open&&bd<1.9&&performance.now()-(nd.mc||0)>4000){nd.open=1;sfx(220,.3,.18,0)}bo.style.display=nd?'flex':'none';if(nd)bo.textContent=nd.open?'Fechar':'Abrir';
  for(const d of doors){const tg=d.open?1.7:0;if(Math.abs(d.a-tg)>.003){d.a+=(tg-d.a)*Math.min(1,dt*6);d.piv.rotation.y=d.a;d.bx.off=d.a>.5?1:0}}
  updLights(dt);if(mode==='ground'){const cc=nearestCity(P.x,P.z),cn=cc&&cc.t==='city'?cc.n:null;if(cn!==curCity){curCity=cn;if(cn)say('📍 '+cn,3)}}}
 sky.position.copy(cam.position);sky.scale.setScalar(cam.far*.92/540);sky.material.uniforms.uT.value+=dt;{const sy_=(mode==='ground'||mode==='chute'||mode==='sky')?GY(P.x,P.z,P.y):0;sun.position.set(P.x+55,90+sy_,P.z+30);sun.target.position.set(P.x,sy_,P.z)};
 mm.style.display=(mode==='lobby'||mode==='dead')?'none':'block';if(mm.style.display==='block')drawMM(dt);if(bmap.style.display==='flex'&&(bmT-=dt)<=0){bmT=.2;drawBig()}
 {const mk=$('mkd');if(MK.length&&mode!=='lobby'&&mode!=='dead'){const c=mode==='plane'?plane.position:P;mk.textContent='📍 '+Math.round(Math.min(...MK.map(m=>Math.hypot(m.x-c.x,m.z-c.z))))+' m'}else mk.textContent=''}
 {const vmOn=mode==='ground'&&adk>.85&&!!wp&&scp!==3;vmH.visible=vmOn;
  if(vmOn&&scp===2){vmH.visible=false;cam2.position.copy(cam.position);cam2.quaternion.copy(cam.quaternion);ren.setRenderTarget(rt);ren.render(sc,cam2);ren.setRenderTarget(null);vmH.visible=true}}
 ren.render(sc,cam)}
setLabel();
// o laço só começa depois que todos os arquivos do jogo foram carregados
if(document.readyState==="loading")addEventListener("DOMContentLoaded",()=>requestAnimationFrame(loop));else requestAnimationFrame(loop);
