/* Deadzone · combat/weapons.js
 * Modelos 3D das armas, atributos e IK das mãos.
 */
const WMt=(c,me,ro)=>new T.MeshStandardMaterial({color:lin(c),metalness:me,roughness:ro}),
WK={blk:WMt(0x24272b,.5,.42),dg:WMt(0x15171a,.5,.5),gm:WMt(0x3a3e44,.65,.35),pl:WMt(0x2b2d30,.1,.7),wd:WMt(0x75502d,.05,.7),wd2:WMt(0x4a3220,.05,.65),rub:WMt(0x0b0b0c,0,.95),pst:WMt(0x2c2f33,.4,.5),sl:WMt(0x9a9da2,.8,.3),red:WMt(0xb02020,.1,.6)},
FLM_=new T.MeshBasicMaterial({color:0xffcf70,transparent:true,opacity:.9,depthWrite:false});
function mkW(t,lv,sil,vm){const g=new T.Group(),K=WK,it=[],u=g.ud={t};
 const B=(w,h,d,m,x,y,z,rx)=>it.push([new T.BoxGeometry(w,h,d),m,x,y,z,rx||0]),Cz=(r,l,m,x,y,z)=>it.push([new T.CylinderGeometry(r,r,l,10),m,x,y,z,Math.PI/2]),
 sub=(x,y,z)=>{const q=new T.Group();q.position.set(x,y,z);g.add(q);return q},BM=c=>new T.MeshBasicMaterial({color:c,side:T.DoubleSide}),
 bx=(w,h,d)=>new T.BoxGeometry(w,h,d),flash=(z,r)=>{if(vm)return;const f=new T.Mesh(new T.ConeGeometry(r,r*3,6),FLM_);f.rotation.x=-Math.PI/2;f.position.set(0,t==='pistol'?.08:.01,z);f.visible=false;g.add(f);u.fl=f};
 if(t==='rifle'||t==='sniper'){
  B(.058,.075,.34,K.blk,0,.02,.02);B(.056,.062,.26,K.dg,0,-.035,.05);B(.04,.02,.5,K.dg,0,.07,.12);for(let k=0;k<9;k++)B(.044,.007,.014,K.dg,0,.082,-.1+k*.055);
  B(.064,.08,.34,K.blk,0,0,.4);for(const sx of[-1,1])for(let k=0;k<4;k++)B(.004,.022,.05,K.rub,sx*.033,.005,.3+k*.08);B(.032,.012,.3,K.dg,0,-.045,.4);
  Cz(.012,.2,K.gm,0,.01,.64);Cz(.019,.07,K.dg,0,.01,.715);B(.03,.03,.04,K.gm,0,.03,.6);
  Cz(.022,.22,K.blk,0,.03,-.2);B(.05,.12,.2,K.pl,0,-.02,-.3);B(.048,.03,.2,K.rub,0,.05,-.3);B(.04,.11,.05,K.pl,0,-.1,-.03,-.3);
  B(.01,.02,.075,K.dg,0,-.07,.05);B(.008,.03,.01,K.sl,0,-.05,.04);B(.004,.03,.07,K.rub,.03,.025,.04);
  const mg=sub(0,-.06,.12);bake(mg,[[bx(.036,.15,.052),K.dg,0,-.075,0,-.12],[bx(.04,.015,.056),K.dg,0,-.155,.012,-.12]]);u.mag=mg;u.my=-.06;
  const bo=sub(0,.075,-.1);bake(bo,[[bx(.03,.022,.05),K.sl,0,0,0],[bx(.04,.01,.012),K.sl,0,.012,-.02]]);u.bolt=bo;u.bz=-.1;flash(.82,.045);
  if(t==='sniper'){Cz(.013,.4,K.gm,0,.01,.92);Cz(.02,.08,K.dg,0,.01,1.14);B(.03,.1,.03,K.dg,-.03,-.09,.9);B(.03,.1,.03,K.dg,.03,-.09,.9);if(lv===3){Cz(.04,.42,K.dg,0,.13,.1);Cz(.05,.06,K.dg,0,.13,.32);Cz(.05,.06,K.dg,0,.13,-.1);B(.02,.05,.03,K.dg,0,.09,.04);B(.02,.05,.03,K.dg,0,.09,.2)}}
  if(lv===1){B(.07,.02,.08,K.dg,0,.09,.12);B(.012,.07,.08,K.dg,-.04,.13,.12);B(.012,.07,.08,K.dg,.04,.13,.12);B(.092,.012,.08,K.dg,0,.171,.12)}
  else if(lv===2){B(.04,.04,.1,K.dg,0,.1,.12);const tb=new T.Mesh(new T.CylinderGeometry(.042,.042,.2,14,1,true),BM(0x151515));tb.rotation.x=Math.PI/2;tb.position.set(0,.13,.12);g.add(tb);
   for(const z of[.02,.22]){const rg=new T.Mesh(new T.RingGeometry(.03,.046,20),BM(0x0a0a0a));rg.position.set(0,.13,z);g.add(rg)}
   const ln=new T.Mesh(new T.CircleGeometry(.03,20),vm?new T.MeshBasicMaterial({map:rt.texture,fog:false}):BM(0x335577));ln.rotation.y=Math.PI;ln.position.set(0,.13,.021);g.add(ln);
   const ob=new T.Mesh(new T.CircleGeometry(.03,20),BM(0x2a4a6a));ob.position.set(0,.13,.221);g.add(ob)}
  else if(!(t==='sniper'&&lv===3)){B(.008,.03,.015,K.dg,-.014,.095,0);B(.008,.03,.015,K.dg,.014,.095,0);B(.01,.1,.012,K.dg,0,.07,.62)}}
 else if(t==='shotgun'){
  B(.066,.098,.3,K.blk,0,0,0);B(.06,.012,.3,K.dg,0,.055,0);B(.004,.03,.09,K.rub,.034,.01,.02);Cz(.017,.5,K.gm,0,.05,.4);Cz(.015,.42,K.gm,0,0,.36);Cz(.019,.03,K.sl,0,.05,.66);
  B(.06,.13,.3,K.wd,0,-.02,-.3);B(.064,.12,.04,K.rub,0,-.02,-.46);B(.04,.11,.05,K.wd,0,-.09,-.17,-.3);B(.01,.02,.08,K.dg,0,-.065,0);B(.012,.07,.012,K.sl,0,.075,.64);
  const pm=sub(0,-.005,.36);bake(pm,[[bx(.072,.06,.2),K.wd2,0,0,0],[bx(.074,.062,.012),K.rub,0,0,-.06],[bx(.074,.062,.012),K.rub,0,0,-.02],[bx(.074,.062,.012),K.rub,0,0,.02],[bx(.074,.062,.012),K.rub,0,0,.06]]);u.pump=pm;u.pz=.36;
  const sh=new T.Mesh(new T.CylinderGeometry(.01,.01,.05,8),K.red);sh.rotation.x=Math.PI/2;sh.position.set(0,-.07,.05);sh.visible=false;g.add(sh);u.shell=sh;flash(.72,.05)}
 else{
  B(.046,.1,.21,K.pst,0,.005,0);B(.04,.12,.05,K.pst,0,-.1,-.05,.1);B(.044,.014,.056,K.dg,0,-.162,-.04);B(.01,.018,.07,K.pst,0,-.065,.04);B(.008,.025,.01,K.sl,0,-.05,.035);B(.036,.015,.05,K.dg,0,-.06,.08);
  const WH=WMt(0xf4f4f4,0,.5),sl=sub(0,.08,.04);bake(sl,[[bx(.05,.05,.2),K.gm,0,0,0],[bx(.052,.04,.004),K.dg,0,0,-.07],[bx(.052,.04,.004),K.dg,0,0,-.05],[bx(.052,.04,.004),K.dg,0,0,-.03],[new T.CylinderGeometry(.009,.009,.03,8),K.dg,0,-.005,.115,Math.PI/2],
   [bx(.04,.008,.018),K.dg,0,.029,-.086],[bx(.013,.021,.018),K.dg,-.0135,.0375,-.086],[bx(.013,.021,.018),K.dg,.0135,.0375,-.086],[bx(.006,.006,.002),WH,-.0135,.042,-.0955],[bx(.006,.006,.002),WH,.0135,.042,-.0955],[bx(.014,.008,.022),K.dg,0,.029,.088],[bx(.008,.021,.012),K.dg,0,.0375,.094],[bx(.005,.005,.002),WH,0,.043,.0875]]);u.slide=sl;u.sz=.04;
  const mg=sub(0,-.06,-.05);bake(mg,[[bx(.032,.11,.04),K.dg,0,-.055,0]]);u.mag=mg;u.my=-.06;flash(.2,.03)}
 if(sil&&t!=='shotgun'){const rf_=t!=='pistol';it.push([new T.CylinderGeometry(.03,.03,.2,12),K.dg,0,rf_?.012:.075,(rf_?.74:.14)+.1,Math.PI/2]);if(u.fl)u.fl=null}
 if(vm){const h=HG[t];for(let k=0;k<2;k++){const p=h[k];B(.07,.08,.1,K.rub,p[0],p[1],p[2]);B(.075,.075,.5,WMt(0x55663f,0,.9),p[0]+(k?-.02:.02),p[1]-.06,p[2]-.3,-.25)}}
 bake(g,it);return g}
const ss_=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
function animW(w,kv,rv,fc){const u=w&&w.ud;if(!u||!u.t)return;if(u.fl)u.fl.visible=kv>.72;
 if(u.t==='rifle'||u.t==='sniper')u.bolt.position.z=u.bz-.07*kv-(rv>.82?.07*Math.sin((rv-.82)/.18*Math.PI):0);
 else if(u.t==='pistol')u.slide.position.z=u.sz-.06*kv-(rv>.8?.06*Math.sin((rv-.8)/.2*Math.PI):0);
 else{const p=fc>=0&&fc<1?fc:1,o=(p>.2&&p<.8)?Math.sin((p-.2)/.6*Math.PI):0;u.pump.position.z=u.pz-.13*o-(rv>0?.07*Math.abs(Math.sin(rv*Math.PI*7)):0);u.shell.visible=rv>0&&rv<1}
 if(u.mag){let o=0;if(rv>0){if(rv<.22)o=ss_(rv/.22);else if(rv<.5)o=1;else if(rv<.8)o=1-ss_((rv-.5)/.3)}u.mag.position.y=u.my-.22*o;u.mag.rotation.x=.35*o}}
const WC={};
const WS={rifle:{n:'M4A1',d:22,r:.12,rg:150,mag:30,rt:2.2},shotgun:{n:'Escopeta',d:70,r:.9,rg:20,mag:6,rt:2.6},pistol:{n:'Pistola',d:18,r:.3,rg:70,mag:12,rt:1.7},sniper:{n:'Sniper',d:95,r:1.4,rg:400,mag:5,rt:3.2}};
const HG={rifle:[[0,-.09,-.02],[0,-.045,.3]],shotgun:[[0,-.05,-.2],[0,-.03,.3]],pistol:[[0,-.08,-.06],[-.03,-.085,-.03]],sniper:[[0,-.09,-.02],[0,-.045,.3]]},MG={rifle:[0,-.14,.12],shotgun:[0,-.05,0],pistol:[0,-.1,-.02],sniper:[0,-.14,.12]},
EY={rifle0:[0,.125,-.2],rifle1:[0,.13,-.14],rifle2:[0,.13,-.11],shotgun:[0,.11,-.1],pistol:[0,.128,-.2],sniper:[0,.125,-.2]};
const _v=new T.Vector3(),_u=new T.Vector3(),_p=new T.Vector3(),_z=new T.Vector3(),_x=new T.Vector3(),_y=new T.Vector3(),_m=new T.Matrix4();
function ik(a,s,tx,ty,tz){const L1=.3,L2=.31;_v.set(tx-s*.29,ty-.5,tz);let d=_v.length();d=Math.min(Math.max(d,.12),(L1+L2)*.995);_v.normalize();
 const al=Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));
 _p.set(s*.6,-1,-.2);_p.addScaledVector(_v,-_p.dot(_v)).normalize();
 _u.copy(_v).multiplyScalar(Math.cos(al)).addScaledVector(_p,Math.sin(al));
 _z.copy(_v).multiplyScalar(d).addScaledVector(_u,-L1);_z.addScaledVector(_u,-_z.dot(_u)).normalize();
 _y.copy(_u).negate();_x.crossVectors(_y,_z);_m.makeBasis(_x,_y,_z);a.sh.quaternion.setFromRotationMatrix(_m);
 a.el.rotation.x=-(Math.PI-Math.acos(Math.max(-1,Math.min(1,(L1*L1+L2*L2-d*d)/(2*L1*L2)))))}
