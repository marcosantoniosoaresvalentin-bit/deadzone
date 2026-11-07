/* Deadzone · ui/lobby-scene.js
 * Cenário 3D do lobby.
 */
// ---- lobby: só o boneco, sem giro automático
const LOBH=[],stage=new T.Group();let lobOn=0,_bg=null,_fg=null;
{const p=new T.Mesh(new T.CylinderGeometry(1.2,1.35,.1,48),new T.MeshStandardMaterial({color:0x14212e,metalness:.6,roughness:.4})),r=new T.Mesh(new T.TorusGeometry(1.25,.025,8,64),new T.MeshBasicMaterial({color:0x2ee6c8})),l=new T.PointLight(0x2ee6c8,1.4,7);
 p.position.y=-.05;r.rotation.x=Math.PI/2;r.position.y=.02;l.position.set(0,.4,1.2);stage.add(p,r,l);stage.visible=false;sc.add(stage)}
// ---- lobby: cenário noturno + veículo fixo (muda com a cor escolhida no inventário)
const SCN=new T.Group();let lobCarMat=null,lobGlow=null,lobFly=null;
{const GY=-.11,BAS=(c,o)=>new T.MeshBasicMaterial(Object.assign({color:c},o||{}));
 const glowT=ctex(64,64,(g,w,h)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,w,h)},1,1);
 const glowSp=(c,s,x,y,z,op)=>{const q=new T.Sprite(new T.SpriteMaterial({map:glowT,color:c,transparent:true,opacity:op==null?1:op,blending:T.AdditiveBlending,depthWrite:false,fog:false}));q.scale.set(s,s,1);q.position.set(x,y,z);SCN.add(q);return q};
 // céu
 const skyT=ctex(16,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#040918');gr.addColorStop(.25,'#0a1736');gr.addColorStop(.42,'#14315a');gr.addColorStop(.5,'#1d4a63');gr.addColorStop(1,'#1d4a63');g.fillStyle=gr;g.fillRect(0,0,w,h)},1,1);
 const sky=new T.Mesh(new T.SphereGeometry(340,24,16),new T.MeshBasicMaterial({map:skyT,side:T.BackSide,fog:false,depthWrite:false}));sky.renderOrder=-10;SCN.add(sky);
 {const ps=[];for(let i=0;i<650;i++){const a=R(0,6.283),e=R(.06,1.35);ps.push(Math.cos(a)*Math.cos(e)*300,Math.sin(e)*300,Math.sin(a)*Math.cos(e)*300)}
  const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(ps,3));SCN.add(new T.Points(sg,new T.PointsMaterial({color:0xffffff,size:1.8,sizeAttenuation:false,fog:false,depthWrite:false})))}
 // lua
 {const m=new T.Mesh(new T.SphereGeometry(9,20,14),BAS(0xfff1d0,{fog:false}));m.position.set(60,62,-210);SCN.add(m);glowSp(0x9fd8ff,95,60,62,-209,.55);glowSp(0xcfeeff,200,60,62,-208,.18)}
 // chão
 const gT=ctex(128,128,(g,w,h)=>{g.fillStyle='#101c28';g.fillRect(0,0,w,h);for(let i=0;i<260;i++){g.fillStyle='rgba(255,255,255,'+R(.01,.045)+')';g.fillRect(R(0,w),R(0,h),2,2)}g.strokeStyle='#1f3a4d';g.lineWidth=2;g.strokeRect(1,1,w-2,h-2)},200,200);
 const gr=new T.Mesh(new T.CircleGeometry(330,40),new T.MeshStandardMaterial({map:gT,roughness:.85,metalness:.1}));gr.rotation.x=-Math.PI/2;gr.position.y=GY;SCN.add(gr);
 // rua + calçada + faixa neon
 const rdT=ctex(64,64,(g,w,h)=>{g.fillStyle='#0b121a';g.fillRect(0,0,w,h);g.fillStyle='#d9d27a';g.fillRect(8,30,30,4)},80,1);
 const rd=new T.Mesh(new T.PlaneGeometry(400,10),new T.MeshStandardMaterial({map:rdT,roughness:.9}));rd.rotation.x=-Math.PI/2;rd.position.set(0,GY+.01,-14);SCN.add(rd);
 for(const z of[-8.4,-19.6]){const cb=new T.Mesh(new T.BoxGeometry(400,.26,1.2),new T.MeshStandardMaterial({color:0x2a3a48,roughness:.9}));cb.position.set(0,GY+.12,z);SCN.add(cb)}
 {const nl=new T.Mesh(new T.BoxGeometry(400,.07,.14),BAS(0x2ee6c8));nl.position.set(0,.04,-7.7);SCN.add(nl);glowSp(0x2ee6c8,5,-4,.3,-7.6,.5);glowSp(0x2ee6c8,5,5,.3,-7.6,.5)}
 // skyline
 const wT=[0,1,2].map(()=>ctex(64,128,(g,w,h)=>{g.fillStyle='#0a111e';g.fillRect(0,0,w,h);for(let y=6;y<h-4;y+=10)for(let x=5;x<w-4;x+=12){const on=Math.random()<.42;g.fillStyle=on?(Math.random()<.2?'#7fe8ff':'#ffd98a'):'#101a2a';g.fillRect(x,y,6,6)}},1,1));
 for(let i=0;i<46;i++){const w=R(5,12),h=R(14,56),d=R(5,10),x=-92+i*4.1+R(-1.5,1.5),z=-R(38,95),t=wT[i%3].clone();t.needsUpdate=true;t.repeat.set(Math.max(1,Math.round(w/3.2)),Math.max(1,Math.round(h/4)));
  const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({map:t}));m.position.set(x,h/2+GY,z);SCN.add(m);
  if(h>40){const a=new T.Mesh(new T.SphereGeometry(.4,6,6),BAS(0xff3030));a.position.set(x,h+GY+.4,z);SCN.add(a)}}
 // montanhas ao fundo
 for(let i=0;i<9;i++){const r=R(55,95),h=R(40,75),m=new T.Mesh(new T.ConeGeometry(r,h,5),BAS(0x10243a));m.position.set(-190+i*48+R(-12,12),h/2+GY,-R(140,175));SCN.add(m)}
 // postes de luz
 for(const x of[-15,-8,8,15]){const po=new T.Mesh(new T.CylinderGeometry(.08,.1,5.6,6),new T.MeshStandardMaterial({color:0x1a2430,roughness:.7}));po.position.set(x,2.7+GY,-7);SCN.add(po);
  const ar=new T.Mesh(new T.BoxGeometry(1.1,.08,.08),new T.MeshStandardMaterial({color:0x1a2430}));ar.position.set(x,5.45+GY,-7);SCN.add(ar);
  const bu=new T.Mesh(new T.SphereGeometry(.2,8,8),BAS(0xfff0c0));bu.position.set(x+.5*(x<0?1:-1),5.38+GY,-7);SCN.add(bu);glowSp(0xffd9a0,6,x+.5*(x<0?1:-1),5.3+GY,-7,.75)}
// (árvores antigas do lobby removidas)
 // vaga-lumes
 {const n=80,b=[];for(let i=0;i<n;i++)b.push(R(-14,10),R(.4,4.2),R(-14,2));const fg=new T.BufferGeometry();fg.setAttribute('position',new T.Float32BufferAttribute(b.slice(),3));
  lobFly=new T.Points(fg,new T.PointsMaterial({color:0x7fffe6,size:3,sizeAttenuation:false,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false,fog:false}));lobFly.userData.b=b;SCN.add(lobFly)}
 // ---- veículo (fixo no chão do cenário, lado esquerdo do personagem)
 {lobCarMat=M(0xb03030);lobCarMat.roughness=.35;lobCarMat.metalness=.45;
  const lcg=mkCar(lobCarMat,{sport:1});
  const RIM=BAS(0xb8c0c8);
  for(const a of[-1,1]){const bm=new T.Mesh(new T.CylinderGeometry(.9,.2,5.5,12,1,true),BAS(0xfff2b0,{transparent:true,opacity:.09,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));bm.rotation.x=Math.PI/2+.05;bm.position.set(a*.7,.7,2.2+2.75);lcg.add(bm)}
  lcg.position.set(-3.3,GY,-2);lcg.rotation.y=.7;SCN.add(lcg);
  lobGlow=glowSp(0xb03030,9,-3.3,GY+.06,-2,.55);
  const gp_=new T.Mesh(new T.CircleGeometry(3.2,28),BAS(0xb03030,{transparent:true,opacity:.22,blending:T.AdditiveBlending,depthWrite:false}));gp_.rotation.x=-Math.PI/2;gp_.position.set(-3.3,GY+.02,-2);SCN.add(gp_);lobGlow.userData.gp=gp_;
  const cl=new T.PointLight(0xffd9a0,1.1,12);cl.position.set(-2.2,3.2,-.5);SCN.add(cl)}
}
stage.add(SCN);
function lobCarSet(){if(!lobCarMat)return;const it=CARC[selC],has=it&&it.c!=null,c=has?it.c:0xb03030;if(has){const m=carMatFor(selC);lobCarMat.map=m.map||null;lobCarMat.color.copy(lin(0xffffff))}else{lobCarMat.map=null;lobCarMat.color.copy(lin(c))}lobCarMat.needsUpdate=true;const gc=has&&it.tx?it.tx.f:c;if(lobGlow){lobGlow.material.color.set(gc);const g_=lobGlow.userData.gp;if(g_)g_.material.color.set(gc)}}
function lobAnim(){const n=performance.now()/1000;if(lobFly){const a=lobFly.geometry.attributes.position,b=lobFly.userData.b;for(let i=0;i<a.count;i++)a.setXYZ(i,b[i*3]+Math.sin(n*.4+i)*.8,b[i*3+1]+Math.sin(n*.7+i*1.7)*.35,b[i*3+2]+Math.cos(n*.35+i*.6)*.8);a.needsUpdate=true;lobFly.material.opacity=.7+.3*Math.sin(n*2)}}
lobCarSet();

function lobSw(on){if(on){for(const c of sc.children)if(c!==pl&&c!==stage&&c!==shd&&!c.isLight&&c!==sun.target&&c.visible){c.visible=false;LOBH.push(c)}_bg=sc.background;sc.background=new T.Color(0x0a1420);_fg=sc.fog;sc.fog=new T.Fog(lin(0x1d4a63),40,190);stage.visible=true;try{lobCarSet()}catch(e){}}else{for(const c of LOBH)c.visible=true;LOBH.length=0;if(_bg)sc.background=_bg;if(_fg){sc.fog=_fg;_fg=null}stage.visible=false}}
{const _rr=ren.render.bind(ren);ren.render=function(s,c){const lob=mode==='lobby';if(lob!==lobOn){lobOn=lob;lobSw(lob)}if(lob){stage.position.set(P.x,P.y,P.z);pl.visible=true;shd.visible=true;lobAnim()}else if(specOn()){pl.visible=false;shd.visible=false}_rr(s,c)}}
