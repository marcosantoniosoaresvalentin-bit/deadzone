/* Deadzone · vehicles/cars.js
 * Modelos e posicionamento dos carros.
 */
// ---------- carros ----------
const CARS=[],CGM=new T.BoxGeometry(2.1,.7,4.4),CCG=new T.BoxGeometry(1.8,.65,2.2),CWG=new T.CylinderGeometry(.38,.38,.3,12),CLG=new T.BoxGeometry(.4,.2,.1),
 GLS=new T.MeshStandardMaterial({color:lin(0x1c2a38),metalness:.6,roughness:.2}),TIRE=M(0x111111),LGT=new T.MeshBasicMaterial({color:0xfff2b0}),BURN=M(0x151515),CCOL=[0xb03030,0x2a5a9a,0xd8d8d8,0x2a2a2a,0x3a7a3a,0xd9a820].map(c=>M(c));
// ---------- carro realista ----------
const CHG={},cbx=(a,b,c)=>CHG[a+'_'+b+'_'+c]||(CHG[a+'_'+b+'_'+c]=new T.BoxGeometry(a,b,c));
let CARX=null;
function mkCar(bodyMat,o){o=o||{};if(window.DZCar)try{return DZCar(bodyMat,o)}catch(e){console.warn('carro',e)}
 if(!CARX){const st=(c,r,m)=>new T.MeshStandardMaterial({color:lin(c),roughness:r,metalness:m});
  CARX={dark:st(0x15181c,.6,.4),metal:st(0xc2c9d0,.3,.85),plate:st(0xeeeeee,.7,0),tail:new T.MeshBasicMaterial({color:0xd01818}),amber:new T.MeshBasicMaterial({color:0xffa020}),
   rim:new T.CylinderGeometry(.25,.25,.32,12),hub:new T.CylinderGeometry(.09,.09,.34,8),cab:cbx(1.56,.72,1.5)}}
 const X=CARX,g=new T.Group(),P=[],D=[],pa=(a,b,c,x,y,z,rx,ry,rz)=>P.push([cbx(a,b,c),bodyMat,x,y,z,rx||0,ry||0,rz||0]),
  da=(a,b,c,m,x,y,z,rx,ry,rz)=>D.push([cbx(a,b,c),m,x,y,z,rx||0,ry||0,rz||0]);
 // lataria
 pa(2,.55,4.3,0,.62,0);pa(1.9,.2,1.4,0,.97,1.42,.07);pa(1.9,.2,1,0,.99,-1.62,-.05);pa(1.96,.16,2.2,0,.97,-.1);
 pa(1.64,.1,1.6,0,1.8,-.1);
 for(const sx of[-1,1]){pa(.1,.86,.1,sx*.8,1.415,.925,-.55);pa(.1,.83,.1,sx*.8,1.415,-1.0,.5);pa(.1,.72,.14,sx*.8,1.4,-.1);
  for(const sz of[-1,1])pa(.16,.34,1.1,sx*1.0,.85,sz*1.4);pa(.1,.1,.22,sx*1.05,1.1,.62)}
 if(o.sport){pa(1.7,.06,.4,0,1.14,-2.05)}
 // peças escuras, vidros, luzes
 const GL=GLS;
 da(1.56,.86,.05,GL,0,1.415,.925,-.55);da(1.56,.83,.05,GL,0,1.415,-1.0,.5);
 da(1.8,.2,4,X.dark,0,.3,0);da(2.04,.34,.3,X.dark,0,.42,2.2);da(2.04,.34,.3,X.dark,0,.42,-2.2);da(1.1,.22,.06,X.dark,0,.72,2.16);da(1.0,.1,.05,X.dark,0,.5,2.34);
 for(const sx of[-1,1]){da(.05,.14,2.2,X.dark,sx*1.01,.4,-.1);da(.12,.12,.2,X.dark,sx*1.1,1.12,.62);da(.02,.5,.02,X.dark,sx*1.01,.72,.55);da(.02,.5,.02,X.dark,sx*1.01,.72,-.6);
  da(.03,.06,.25,X.metal,sx*1.012,.95,.05);da(.03,.06,.25,X.metal,sx*1.012,.95,-.75);
  da(.5,.2,.1,LGT,sx*.68,.76,2.17);da(.16,.1,.08,X.tail,sx*.9,.58,2.2);da(.5,.2,.08,X.tail,sx*.7,.84,-2.17);da(.16,.1,.08,X.tail,sx*.92,.6,-2.2);
  da(.14,.14,.3,X.metal,sx*.6,.3,-2.3);if(o.sport)da(.06,.2,.08,X.dark,sx*.6,1.02,-2.0)}
 da(.52,.17,.04,X.metal,0,.6,-2.36);da(.52,.17,.04,X.metal,0,.5,2.36);
 // rodas
 for(const a of[-1,1])for(const b of[-1,1]){const x=a*1.05,z=b*1.4;D.push([CWG,X.dark,x,.38,z,0,0,Math.PI/2]);D.push([X.rim,X.metal,a*1.06,.38,z,0,0,Math.PI/2]);D.push([X.hub,X.dark,a*1.08,.38,z,0,0,Math.PI/2])}
 const pt=new T.Group();bake(pt,P,true);const body=pt.children[0];g.add(body);
 const sg=new T.Group();bake(sg,D,true);const ex=sg.children.slice();g.add(sg);
 const cab=new T.Mesh(X.cab,GL);cab.position.set(0,1.4,-.1);g.add(cab);
 g.body=body;g.cab=cab;g.userData.ex=ex;return g}
function addCar(x,z,yaw){if(CARS.some(c=>Math.hypot(c.x-x,c.z-z)<7)||inFP(x,z,3))return;
 const g=mkCar(CCOL[Math.floor(R(0,6))],{sport:Math.random()<.3}),body=g.body,cab=g.cab;
 const fl=new T.Group();fl.position.set(0,1.1,1.4);fl.visible=false;for(let i=0;i<3;i++){const f=new T.Mesh(new T.ConeGeometry(.5-i*.1,1.6,6),new T.MeshBasicMaterial({color:i?0xffd040:0xff5a10,transparent:true,opacity:.85}));f.position.set((i-1)*.5,.7,0);fl.add(f)}g.add(fl);
 g.body=body;g.cab=cab;g.position.set(x,TERH(x,z),z);g.rotation.y=yaw;sc.add(g);CARS.push({g,fl,x,z,yaw,spd:0,hp:100,fuel:R(25,85),fire:0,dead:0})}
for(const C of CITIES){let n=0;for(let t=0;t<80&&n<7;t++){const k=[-2,-1,1,2][Math.floor(R(0,4))],ln=(Math.random()<.5?-1:1)*2.8,vt=Math.random()<.5,a=R(-80,80),b=k*BP+ln,m=CARS.length;
 addCar(C.x+(vt?b:a),C.z+(vt?a:b),vt?(ln>0?0:Math.PI):(ln>0?Math.PI/2:-Math.PI/2));if(CARS.length>m)n++}}
for(const x of CX)for(const z of[-540,-355,-170,170,365,560])if(Math.random()<.6)addCar(x+(Math.random()<.5?-2.8:2.8),z+R(-25,25),Math.random()<.5?0:Math.PI);
for(const z of CZ)for(const x of[-560,-375,-190,190,375,560])if(Math.random()<.6)addCar(x+R(-25,25),z+(Math.random()<.5?-2.8:2.8),Math.random()<.5?Math.PI/2:-Math.PI/2);
