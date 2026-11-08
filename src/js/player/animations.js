/* Deadzone · player/animations.js
 * Animações extras (arremesso, cura, itens na mão).
 */
// itens na mão do jogador
const HLD=new T.Group();HLD.position.set(0,-.36,.05);aR.el.add(HLD);
const hGr=new T.Mesh(new T.SphereGeometry(.085,10,8),M(0x2f3a2a)),hIc=new T.Mesh(new T.OctahedronGeometry(.11),new T.MeshStandardMaterial({color:0xcfeeff,emissive:0x4a90c0,roughness:.2})),hMd=new T.Mesh(new T.BoxGeometry(.17,.1,.11),M(0xf2f2f2)),hBd=new T.Mesh(new T.CylinderGeometry(.045,.045,.1,10),M(0xf4f4f4)),hSm=new T.Mesh(new T.SphereGeometry(.085,10,8),M(0xb8bcc0)),HM={gren:hGr,gel:hIc,med:hMd,band:hBd,smoke:hSm};
{const lv=new T.Mesh(FXG,WK.sl);lv.scale.set(.03,.02,.12);lv.position.set(0,.09,0);hGr.add(lv);const cr=new T.Mesh(FXG,WK.red);cr.scale.set(.06,.11,.04);cr.position.z=.06;hMd.add(cr);hBd.rotation.z=Math.PI/2}
for(const k in HM){HM[k].visible=false;HLD.add(HM[k])}
function setHold(k){for(const q in HM)HM[q].visible=q===k}
function P2(a,sx,sz,ex,lx,lz,le){aR.sh.rotation.set(lp(aR.sh.rotation.x,sx,a),0,lp(aR.sh.rotation.z,sz,a));aR.el.rotation.x=lp(aR.el.rotation.x,ex,a);aL.sh.rotation.set(lp(aL.sh.rotation.x,lx,a),0,lp(aL.sh.rotation.z,lz,a));aL.el.rotation.x=lp(aL.el.rotation.x,le,a)}
function crouchB(b){hips.position.y-=.12*b;lg1.th.rotation.x-=.45*b;lg2.th.rotation.x-=.45*b;lg1.kn.rotation.x+=.9*b;lg2.kn.rotation.x+=.9*b}
let TH=null,HO=0,pml=0,mlC=0,pcast=null,lhp=100,HF=0,lvy=0,lY=0,pmode='',LD=0,pGA=null,pGRN=0,pICE=0;const pbag={gren:0,gel:0,smoke:0};
function animExtra(dt){const g_=mode==='ground';
 if(g_){let thr=null;for(const k of['gren','gel','smoke'])if((bag[k]||0)<pbag[k]&&((pGA&&(pGA===k||(k==='gel'&&pGA!=='gren'&&pGA!=='smoke')))||(k==='gel'?ICE.length>pICE:GRN.length>pGRN)))thr=k;
  if(thr){TH={t:.3*.55,k:thr};shake(.08)}
  const aim=GA?(GA.k==='gren'||GA.k==='smoke'?1:2):0;HO+=((aim?1:0)-HO)*Math.min(1,dt*12);
  let hold=null;if(TH&&TH.t<.3*.55+.03)hold=TH.k;else if(!TH&&aim)hold=aim===2?'gel':GA.k;else if(cast)hold=cast.k==='band'?'band':'med';setHold(hold);
  const bs=(cast?1:0)||HO>.5||TH;if(bs)rf.visible=false;
  if(TH){TH.t+=dt;const u=TH.t/.55;if(u>=1)TH=null;else{const w=sat(u/.3),s=sat((u-.3)/.22),f=sat((u-.52)/.48),bp=Math.sin(u*Math.PI);
    if(TH.k==='gel'){P2(1,lp(lp(.6,-1.25,s),-.2,f),.15,lp(lp(-.5,-.3,s),-.2,f),lp(-.7,-.2,f),-.25,-.9);tor.rotation.x+=.35*bp;crouchB(bp);body.position.z+=.08*s}
    else{P2(1,lp(lp(-2.6,-1.1,s),.2,f),.1,lp(lp(-1.9,-.15,s),-.3,f),lp(-1,-.3,f),-.3,-.5);tor.rotation.y=lp(lp(.5,-.5,s),-.2,f);tor.rotation.x+=.25*s-.1*(1-s);body.position.z+=.1*s;lg1.th.rotation.x-=.35*s;lg2.th.rotation.x+=.2*s}}}
  else if(cast){const T_=cast.k==='band'?3:6,pr_=1-cast.t/T_,wob=Math.sin(tt*9);
   // bandagem: antebraço esquerdo na frente do peito e a mão direita dando voltas em volta dele (enrolando)
   if(cast.k==='band'){const w_=tt*7,e_=Math.min(1,(T_-cast.t)*4);ik(aL,-1,lp(-.29,-.04,e_),lp(-.05,.2,e_),lp(.05,.3,e_));ik(aR,1,lp(.29,-.02+.03*Math.sin(w_*.5),e_),lp(-.05,.21+.075*Math.sin(w_),e_),lp(.05,.31+.075*Math.cos(w_),e_));head.rotation.x+=.38;tor.rotation.x+=.06}
   // kit médico: ajoelhado, as duas mãos baixas na frente abrindo o kit e aplicando
   else{const e_=Math.min(1,(T_-cast.t)*3),k_=Math.sin(tt*4);ik(aL,-1,lp(-.29,-.1,e_),lp(-.05,.05+.02*k_,e_),lp(.05,.36,e_));ik(aR,1,lp(.29,.09,e_),lp(-.05,.07-.02*k_,e_),lp(.05,.34+.03*Math.sin(tt*6),e_));head.rotation.x+=.45;crouchB(.6)}
   tor.rotation.x+=.12;if(Math.random()<dt*5)fxP(P.x+R(-.5,.5),.3,P.z+R(-.5,.5),0,R(1,2),0,.07,.9,0x6aef7a,-1,.2)}
  else if(HO>.02){const tr=GA&&GA.k!=='gel'&&GA.t>FUSE*.6?Math.sin(tt*45)*.04:0;
   if(aim===1){P2(HO,-2.6+tr,.1,-1.9,-1,-.3,-.5);tor.rotation.y+=.5*HO;tor.rotation.x-=.12*HO;head.rotation.x-=.1*HO}
   else{P2(HO,-.9,.2,-.7,-.6,-.2,-.7);tor.rotation.x+=.1*HO;hIc.rotation.y+=dt*3;hIc.scale.setScalar(1+.08*Math.sin(tt*6))}}
  if(!TH&&!cast&&HO<.1&&amt<.2){const br=Math.sin(tt*1.8);tor.rotation.x+=br*.012;hips.position.y+=br*.004}
  if(ml>pml)mlC^=1;if(ml>0&&!mlK&&mlC){const q_=1-ml/.35,s_=Math.sin(Math.min(1,q_)*Math.PI);aL.sh.rotation.set(-1.3-.9*s_,0,-.1);aL.el.rotation.x=-.25-(1-s_)*.7;aR.sh.rotation.set(-.9,0,.25);aR.el.rotation.x=-1.4;tor.rotation.y=.45*s_}
  if(ml>0){const s_=Math.sin(Math.min(1,1-ml/.35)*Math.PI);body.position.z+=.18*s_;crouchB(.25*s_)}pml=ml;
  const gnd=P.y<=GY(P.x,P.z,P.y)+.02;if(gnd&&((lY>.05&&lvy<-5)||pmode==='chute'||pmode==='sky')){LD=Math.max(LD,(pmode==='chute'||pmode==='sky')?.9:Math.min(1,-lvy/16+.2));fxDust(P.x,P.z,Math.round(4+LD*8));shake(LD*.35)}
  if(LD>0){LD=Math.max(0,LD-dt*3.2);crouchB(LD*1.3);tor.rotation.x+=.25*LD;aR.sh.rotation.z+=.3*LD;aL.sh.rotation.z-=.3*LD}
  if(pcast&&!cast&&hp>lhp+1){for(let i=0;i<22;i++)fxP(P.x+R(-.6,.6),R(.2,1.6),P.z+R(-.6,.6),R(-.4,.4),R(1.5,3),R(-.4,.4),R(.06,.12),R(.8,1.3),i%2?0x6aef7a:0xffffff,-1,.3);ringFx(P.x,.1,P.z,1.6,0x6aef7a)}
  if(hp<lhp-.3){HF=Math.min(1,.5+(lhp-hp)/25);shake(.18+HF*.12)}
  if(HF>0){tor.rotation.x-=.35*HF;head.rotation.x-=.3*HF;aR.sh.rotation.z+=.25*HF;aL.sh.rotation.z-=.25*HF;HF=Math.max(0,HF-dt*5)}
 }else{setHold(null);TH=null}
 lhp=hp;pcast=cast;pGA=GA?GA.k:null;pGRN=GRN.length;pICE=ICE.length;for(const k in pbag)pbag[k]=bag[k]||0;lvy=P.vy;lY=P.y;pmode=mode;
 // efeitos gerais
 for(let i=FXP.length-1;i>=0;i--){const p=FXP[i];p.t-=dt;if(p.t<=0){sc.remove(p.m);FXP.splice(i,1);continue}p.vy-=p.g*dt;const k=Math.max(0,1-p.d*dt),m=p.m;p.vx*=k;p.vz*=k;m.position.x+=p.vx*dt;m.position.y+=p.vy*dt;m.position.z+=p.vz*dt;if(m.position.y<.03&&p.g>0){m.position.y=.03;p.vy*=-.35;p.vx*=.6;p.vz*=.6}m.rotation.x+=p.r[0]*dt;m.rotation.y+=p.r[1]*dt;m.scale.setScalar(p.s*Math.min(1,p.t/p.l*2.2))}
 for(let i=WAVE.length-1;i>=0;i--){const w=WAVE[i],m=w.m;w.t+=dt;if(w.sc){const k=w.t/w.life;m.material.opacity=.45*Math.max(0,1-k);if(k>=1){sc.remove(m);WAVE.splice(i,1)}}else{const k=w.t/.45;m.scale.setScalar(Math.max(.1,w.r*1.4*Math.min(1,k)));m.material.opacity=.8*Math.max(0,1-k);if(k>=1){sc.remove(m);WAVE.splice(i,1)}}}
 for(let i=GROW.length-1;i>=0;i--){const g=GROW[i];g.t+=dt/.45;const k=Math.min(1,g.t),e=1+2.7*Math.pow(k-1,3)+1.7*Math.pow(k-1,2);g.m.scale.y=Math.max(.02,e);if(k>=1){g.m.scale.y=1;GROW.splice(i,1)}}
 for(let i=FLY.length-1;i>=0;i--){const f=FLY[i];f.t+=dt/.28;const k=Math.min(1,f.t),e=k*k;f.m.position.set(lp(f.x,P.x,e),lp(f.y,P.y+1.1,e),lp(f.z,P.z,e));f.m.scale.setScalar(Math.max(.05,1-k*.85));f.m.rotation.y+=dt*12;if(k>=1){sc.remove(f.m);FLY.splice(i,1)}}
 for(const g of GRN){const m=g.m,sp=Math.min(1,Math.hypot(g.vx,g.vy,g.vz)/5);if(g.sp){m.rotation.x+=g.sp[0]*dt*sp;m.rotation.z+=g.sp[1]*dt*sp}if(!g.sm&&g.t<1.5)m.scale.setScalar(1+.2*Math.max(0,Math.sin(tt*(12+(1.5-g.t)*22))));g.tr=(g.tr||0)-dt;if(g.tr<=0&&sp>.2){g.tr=g.sm?.05:.07;fxP(g.x,g.y,g.z,R(-.3,.3),R(0,.4),R(-.3,.3),g.sm?.28:.1,g.sm?.9:.35,g.sm?0xd8dce0:0x777777,g.sm?-.4:0,1.5)}if(g.pvy<-2&&g.vy>0)fxDust(g.x,g.z,4);g.pvy=g.vy}
 for(const w of ICE){const S=w.S;if(!S||S.fs===tt)continue;S.fs=tt;if(S.lh==null)S.lh=S.hp;const m=w.m;if(S.hp<S.lh&&!w.b.off){S.jt=.18;for(let i=0;i<5;i++)fxP(m.position.x+R(-2,2),R(.3,2.4),m.position.z+R(-2,2),R(-2,2),R(1,3),R(-2,2),R(.06,.12),R(.4,.8),0xdff4ff,14,.5)}S.lh=S.hp;if(S.jt>0&&m.userData.bx!=null){S.jt=Math.max(0,S.jt-dt);const j=S.jt*.25;m.position.set(m.userData.bx+R(-1,1)*j,0,m.userData.bz+R(-1,1)*j)}}
 SHK=Math.max(0,SHK-dt*2.2)}
{const _r=ren.render.bind(ren);ren.render=function(s,c){if(SHK>.01&&c===cam){const o=cam.position.clone(),k=SHK*.12;cam.position.x+=R(-1,1)*k;cam.position.y+=R(-1,1)*k;cam.position.z+=R(-1,1)*k;_r(s,c);cam.position.copy(o)}else _r(s,c)}}
try{window.DZR&&DZR.post()}catch(e){console.warn(e)}
