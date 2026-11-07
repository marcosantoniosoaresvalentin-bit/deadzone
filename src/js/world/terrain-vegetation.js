/* Deadzone · world/terrain-vegetation.js
 * Relevo do terreno, árvores, pinheiros, pedras, arbustos e grama.
 */
// relevo (morros/montanhas) antes da vegetação
try{window.DZR&&DZR.terrain([[118,-122],[-640,-612],[648,-600],[-640,632],[640,642],[-380,-262],[1010,10],[-1010,70],[70,-1010],[-90,1020]])}catch(e){console.warn(e)}
// vegetação instanciada
{const dm=new T.Object3D(),bad=(x,z)=>onRoad(x,z)||inFP(x,z,3)||LK.some(l=>Math.hypot(x-l.x,z-l.z)<l.r+9),far=(x,z)=>CITIES.every(c=>Math.hypot(c.x-x,c.z-z)>120);
 const IM=(ge,mat,N)=>{const m=new T.InstancedMesh(ge,mat,N);m.instanceColor=new T.InstancedBufferAttribute(new Float32Array(N*3).fill(1),3);m.frustumCulled=false;m.count=0;m.castShadow=false;m.receiveShadow=true;sc.add(m);return m};
 const put=(m,x,y,z,sx,sy,sz,ry,c)=>{dm.position.set(x,y+TERH(x,z),z);dm.scale.set(sx,sy,sz);dm.rotation.set(0,ry,0);dm.updateMatrix();m.setMatrixAt(m.count,dm.matrix);if(c&&m.setColorAt)m.setColorAt(m.count,c);m.count++};
 const wh=new T.MeshStandardMaterial({color:0xffffff,roughness:.9});
 const hsl=(h,s_,l)=>new T.Color().setHSL(h,s_,l).convertSRGBToLinear();
 const TCH=[];{const _rc=ren.render.bind(ren);ren.render=function(s_,c_){try{if(c_===cam&&mode!=='lobby')for(const q of TCH)q[0].visible=Math.hypot(q[1]-P.x,q[2]-P.z)<q[3]+430}catch(e){}return _rc(s_,c_)}}
 // ===== árvores voxel (blocos) — substituem as árvores antigas =====
 const VXR=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296},
  VXC=h=>new T.Color(h).convertSRGBToLinear(),
  BRN=[0xb8651f,0xc9742a,0x9c5219,0xd98a3d,0x8a4616].map(VXC),
  LEAF=[0x7bd01a,0x69bd12,0x8ee02b,0x58a80f,0x9be83a,0x4f9a0d].map(VXC),
  GRS=[0x86d62a,0x74c61c,0x98e236,0x62b414].map(VXC),
  FC=[[1,0,0,[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]],.9],[-1,0,0,[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],.82],[0,1,0,[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]],1.14],[0,-1,0,[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]],.6],[0,0,1,[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],.98],[0,0,-1,[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]],.86]],
  NB=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
 function mkTree(seed){
  const rn=VXR(seed),P=[],N=[],C=[],pk=a=>a[Math.floor(rn()*a.length)],key=(i,j,k)=>i+','+j+','+k;
  const cube=(x,y,z,hx,hy,hz,col,skip)=>{for(let f=0;f<6;f++){if(skip&&skip(f))continue;const F=FC[f],sh=F[4]*(.93+rn()*.14);for(const q of[0,1,2,0,2,3]){const v=F[3][q];P.push(x+v[0]*hx,y+v[1]*hy,z+v[2]*hz);N.push(F[0],F[1],F[2]);C.push(col.r*sh,col.g*sh,col.b*sh)}}};
  // tronco grosso com raízes abertas na base
  const s=.62,tc=new Set(),tl=[];
  for(let j=0;j<6;j++)for(let i=-2;i<=2;i++)for(let k=-2;k<=2;k++){const a=Math.abs(i),b=Math.abs(k),core=a<=1&&b<=1;let on=false;
   if(j===0)on=core||(!(a===2&&b===2)&&rn()<.72);else if(j===1)on=core||((a===2&&b===0||a===0&&b===2)&&rn()<.5);else if(j<4)on=core;else if(j===4)on=core&&!(a===1&&b===1&&rn()<.35);else on=a+b<=1||(core&&rn()<.3);
   if(on){tc.add(key(i,j,k));tl.push([i,j,k])}}
  for(const[i,j,k]of tl)cube(i*s+(rn()-.5)*.06,j*s+s/2,k*s+(rn()-.5)*.06,s/2*(1.02+rn()*.08),s/2*(1.02+rn()*.06),s/2*(1.02+rn()*.08),pk(BRN),f=>tc.has(key(i+NB[f][0],j+NB[f][1],k+NB[f][2]))||(j===0&&f===3));
  // galhos grossos saindo do topo do tronco
  const nb=3+(rn()<.5?1:0),a0=rn()*6.283;
  for(let b=0;b<nb;b++){const a=a0+b*6.283/nb+(rn()-.5)*.5,ca=Math.cos(a),sa=Math.sin(a);for(let m=0;m<4;m++){const d=.35+m*.62,h=.4-m*.06;cube(ca*d,3.25+m*.34,sa*d,h,h,h,pk(BRN))}}
  // copa: vários blocos de verde claro, em volume de "nuvem"
  const cs=.85,CY=5.8,lobes=[[0,0,0,3.2,2.4,3.2]];
  for(let i=0;i<6;i++){const a=rn()*6.283,d=1.7+rn()*1.5;lobes.push([Math.cos(a)*d,(rn()-.45)*1.6,Math.sin(a)*d,1.6+rn()*.8,1.3+rn()*.7,1.6+rn()*.8])}
  const cc=new Map();
  for(let i=-7;i<=7;i++)for(let j=-5;j<=5;j++)for(let k=-7;k<=7;k++){const x=i*cs,y=j*cs,z=k*cs;let ins=false;
   for(const L of lobes){const dx=(x-L[0])/L[3],dy=(y-L[1])/L[4],dz=(z-L[2])/L[5];if(dx*dx+dy*dy+dz*dz<1+(rn()-.5)*.35){ins=true;break}}
   if(ins)cc.set(key(i,j,k),[i,j,k])}
  const ex=[];
  for(const[i,j,k]of cc.values()){const x=i*cs+(rn()-.5)*.14,y=CY+j*cs+(rn()-.5)*.14,z=k*cs+(rn()-.5)*.14,h=cs/2*(1.1+rn()*.2),col=pk(LEAF);
   cube(x,y,z,h,h,h,col,f=>{const hid=cc.has(key(i+NB[f][0],j+NB[f][1],k+NB[f][2]));if(!hid)ex.push([x,y,z,f]);return hid})}
  for(let q=0;q<40&&ex.length;q++){const e=ex[Math.floor(rn()*ex.length)],n=FC[e[3]],hh=.2+rn()*.14,o=.5+hh*.5;cube(e[0]+n[0]*o,e[1]+n[1]*o,e[2]+n[2]*o,hh,hh,hh,pk(LEAF))}
  // área de grama em blocos ao redor da base + tufos (sem pedras)
  for(let q=0;q<18;q++){const a=rn()*6.283,d=1.5+rn()*2.4;cube(Math.cos(a)*d,.07,Math.sin(a)*d,.5+rn()*.4,.07,.5+rn()*.4,pk(GRS),f=>f===3)}
  for(let q=0;q<16;q++){const a=rn()*6.283,d=1.6+rn()*2.6,bx=Math.cos(a)*d,bz=Math.sin(a)*d;for(let b=0;b<3;b++){const hy=.25+rn()*.35;cube(bx+(rn()-.5)*.4,hy,bz+(rn()-.5)*.4,.07,hy,.07,pk(LEAF),f=>f===3)}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(N,3));g.setAttribute('color',new T.Float32BufferAttribute(C,3));return g}
 const TV=[11,23,37,51].map(window.DZR?DZR.tree:mkTree),TL=TV.map(()=>new Map()),CSZ=480,
  TM=new T.MeshStandardMaterial({vertexColors:true,roughness:.92,metalness:0,side:T.DoubleSide});
 for(let t=0,n=0;t<6000&&n<200;t++){let x,z;if(t%3===0){const C=CITIES[Math.floor(R(0,5))];x=C.x+R(-140,140);z=C.z+R(-140,140);if(Math.abs(x-C.x)<95&&Math.abs(z-C.z)<95)continue}else{x=R(-1180,1180);z=R(-1180,1180);if(!far(x,z))continue}if(bad(x,z))continue;n++;
  const v=Math.floor(R(0,TV.length)),k=R(.82,1.08),ck=Math.floor((x+1200)/CSZ)+','+Math.floor((z+1200)/CSZ);let a=TL[v].get(ck);if(!a)TL[v].set(ck,a=[]);a.push([x,z,k,R(0,6.283)]);
  const hb=.95*k;addBox({x0:x-hb,x1:x+hb,z0:z-hb,z1:z+hb})}
 {const _m=new T.Matrix4(),_q=new T.Quaternion(),_p=new T.Vector3(),_s=new T.Vector3(),UP=new T.Vector3(0,1,0);
  TL.forEach((mp,v)=>mp.forEach((arr,ck)=>{const cr=ck.split(',').map(Number),cx=(cr[0]+.5)*CSZ-1200,cz=(cr[1]+.5)*CSZ-1200,ge=new T.BufferGeometry();
   const parts=Array.isArray(TV[v])?TV[v]:[[TV[v],TM]],cols=arr.map(()=>{const b=R(.88,1.08);return new T.Color(b,b*R(.97,1.03),b*R(.94,1.02))});
   for(const [pg,pm_] of parts){const ge=new T.BufferGeometry();for(const nm in pg.attributes)ge.setAttribute(nm,pg.attributes[nm]);ge.boundingSphere=new T.Sphere(new T.Vector3(cx,5,cz),CSZ*.72+12);
   const m=new T.InstancedMesh(ge,pm_,arr.length);
   arr.forEach((o,i)=>{_q.setFromAxisAngle(UP,o[3]);_p.set(o[0],TERH(o[0],o[1])-.15,o[1]);_s.set(o[2],o[2],o[2]);_m.compose(_p,_q,_s);m.setMatrixAt(i,_m);m.setColorAt(i,cols[i])});
   m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.castShadow=false;m.receiveShadow=true;sc.add(m);TCH.push([m,cx,cz,CSZ*.72+12])}}))}
 // ===== pinheiros voxel (camadas de cubos) — vários tamanhos =====
 function mkPine(seed,nT,rB){
  const rn=VXR(seed),P=[],N=[],C=[],pk=a=>a[Math.floor(rn()*a.length)],key=(i,j,k)=>i+','+j+','+k,PG=[0x4fae14,0x3f9a10,0x62c11c,0x34880d,0x78d02a,0x2f8010].map(VXC);
  const cube=(x,y,z,hx,hy,hz,col,skip)=>{for(let f=0;f<6;f++){if(skip&&skip(f))continue;const F=FC[f],sh=F[4]*(.93+rn()*.14);for(const q of[0,1,2,0,2,3]){const v=F[3][q];P.push(x+v[0]*hx,y+v[1]*hy,z+v[2]*hz);N.push(F[0],F[1],F[2]);C.push(col.r*sh,col.g*sh,col.b*sh)}}};
  const cs=.62,B0=3,NL=B0+nT*3+3,tc=new Set(),tl=[];
  for(let j=0;j<NL+1;j++)for(let i=-2;i<=2;i++)for(let k=-2;k<=2;k++){const a=Math.abs(i),b=Math.abs(k),core=a<=1&&b<=1;let on=false;
   if(j===0)on=core||(!(a===2&&b===2)&&rn()<.8);else if(j<NL*.5)on=core;else if(j<NL*.8)on=a+b<=1;else on=a+b===0;
   if(on){tc.add(key(i,j,k));tl.push([i,j,k])}}
  for(const[i,j,k]of tl)cube(i*cs+(rn()-.5)*.05,j*cs+cs/2,k*cs+(rn()-.5)*.05,cs/2*(1.02+rn()*.08),cs/2*1.03,cs/2*(1.02+rn()*.08),pk(BRN),f=>tc.has(key(i+NB[f][0],j+NB[f][1],k+NB[f][2]))||(j===0&&f===3));
  const fc=new Map(),lay=(j,r,drop)=>{for(let i=-r;i<=r;i++)for(let k=-r;k<=r;k++){const a=Math.abs(i),b=Math.abs(k);if(a+b>r*1.55+.5)continue;if(Math.max(a,b)===r&&r>1&&rn()<drop)continue;fc.set(key(i,j,k),[i,j,k])}};
  for(let t=0;t<nT;t++){const r=Math.max(2,Math.round(rB*(1-t/(nT+.6)))),j0=B0+t*3;lay(j0,r,.2);lay(j0+1,r-1,.12)}
  lay(B0+nT*3,1,0);lay(B0+nT*3+1,1,0);fc.set(key(0,B0+nT*3+2,0),[0,B0+nT*3+2,0]);
  const ex=[];
  for(const[i,j,k]of fc.values()){const x=i*cs+(rn()-.5)*.1,y=j*cs+cs/2+(rn()-.5)*.08,z=k*cs+(rn()-.5)*.1,h=cs/2*(1.1+rn()*.25),col=pk(PG);
   cube(x,y,z,h,h,h,col,f=>{const hid=fc.has(key(i+NB[f][0],j+NB[f][1],k+NB[f][2]));if(!hid)ex.push([x,y,z,f]);return hid})}
  for(let q=0;q<10+nT*4&&ex.length;q++){const e=ex[Math.floor(rn()*ex.length)],n=FC[e[3]],hh=.16+rn()*.12,o=.38+hh*.5;cube(e[0]+n[0]*o,e[1]+n[1]*o,e[2]+n[2]*o,hh,hh,hh,pk(PG))}
  for(let q=0;q<14;q++){const a=rn()*6.283,d=1.4+rn()*2.2;cube(Math.cos(a)*d,.07,Math.sin(a)*d,.45+rn()*.4,.07,.45+rn()*.4,pk(GRS),f=>f===3)}
  for(let q=0;q<14;q++){const a=rn()*6.283,d=1.4+rn()*2.4,bx=Math.cos(a)*d,bz=Math.sin(a)*d;for(let b=0;b<3;b++){const hy=.25+rn()*.4;cube(bx+(rn()-.5)*.4,hy,bz+(rn()-.5)*.4,.07,hy,.07,pk(PG),f=>f===3)}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(N,3));g.setAttribute('color',new T.Float32BufferAttribute(C,3));return g}
 const PV=[[61,3,4],[62,4,4],[63,5,5],[64,6,5],[65,7,6],[66,8,6],[67,10,7]].map(a=>(window.DZR?DZR.pine:mkPine)(a[0],a[1],a[2])),PL=PV.map(()=>new Map()),PCS=300,PH=[[3.5,2.4],[4.5,2.4],[5.5,2.4]],
  GRV=[];for(let i=0;i<46;i++)GRV.push([R(-1100,1100),R(-1100,1100)]);
 for(let t=0,n=0;t<9000&&n<520;t++){let x,z;if(t%2===0){const G=GRV[Math.floor(R(0,GRV.length))];x=G[0]+R(-60,60);z=G[1]+R(-60,60);if(Math.abs(x)>1190||Math.abs(z)>1190||!far(x,z))continue}else if(t%3===1){const C=CITIES[Math.floor(R(0,5))];x=C.x+R(-150,150);z=C.z+R(-150,150);if(Math.abs(x-C.x)<95&&Math.abs(z-C.z)<95)continue}else{x=R(-1180,1180);z=R(-1180,1180);if(!far(x,z))continue}if(bad(x,z))continue;n++;
  const v=Math.min(PV.length-1,Math.floor(Math.pow(Math.random(),1.25)*PV.length)),k=R(.9,1.12),ck=Math.floor((x+1200)/PCS)+','+Math.floor((z+1200)/PCS);let a=PL[v].get(ck);if(!a)PL[v].set(ck,a=[]);a.push([x,z,k,R(0,6.283)]);
  const hb=.8*k;addBox({x0:x-hb,x1:x+hb,z0:z-hb,z1:z+hb})}
 {const _m=new T.Matrix4(),_q=new T.Quaternion(),_p=new T.Vector3(),_s=new T.Vector3(),UP=new T.Vector3(0,1,0);
  PL.forEach((mp,v)=>mp.forEach((arr,ck)=>{const cr=ck.split(',').map(Number),cx=(cr[0]+.5)*PCS-1200,cz=(cr[1]+.5)*PCS-1200,ge=new T.BufferGeometry();
   const parts=Array.isArray(PV[v])?PV[v]:[[PV[v],TM]],cols=arr.map(()=>{const b=R(.86,1.08);return new T.Color(b,b*R(.97,1.03),b*R(.94,1.02))});
   for(const [pg,pm_] of parts){const ge=new T.BufferGeometry();for(const nm in pg.attributes)ge.setAttribute(nm,pg.attributes[nm]);ge.boundingSphere=new T.Sphere(new T.Vector3(cx,10,cz),PCS*.72+25);
   const m=new T.InstancedMesh(ge,pm_,arr.length);
   arr.forEach((o,i)=>{_q.setFromAxisAngle(UP,o[3]);_p.set(o[0],TERH(o[0],o[1])-.15,o[1]);_s.set(o[2],o[2],o[2]);_m.compose(_p,_q,_s);m.setMatrixAt(i,_m);m.setColorAt(i,cols[i])});
   m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.castShadow=false;m.receiveShadow=true;sc.add(m);TCH.push([m,cx,cz,PCS*.72+25])}}))}
 const scat=(ge,mat,N,fn,cast)=>{const m=IM(ge,mat,N);for(let t=0;t<N*3&&m.count<N;t++){const x=R(-1190,1190),z=R(-1190,1190);if(bad(x,z))continue;fn(m,x,z)}m.castShadow=false;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true};
 scat(window.DZR?DZR.rockGeo():new T.IcosahedronGeometry(1,0),window.DZR?DZR.mats().rock:new T.MeshStandardMaterial({color:lin(0x7a766f),roughness:1,flatShading:true}),350,(m,x,z)=>{const sx=R(.4,1.3),sy=R(.3,.8),sz=R(.4,1.3);put(m,x,.25,z,sx,sy,sz,R(0,6));if(sy>.45){const hx=sx*.7,hz=sz*.7;addBox({x0:x-hx,x1:x+hx,z0:z-hz,z1:z+hz,yb:0,yt:.25+sy*.8})}},1);
 scat(window.DZR?DZR.bushGeo():new T.IcosahedronGeometry(1,1),window.DZR?DZR.mats().leaf:wh,280,(m,x,z)=>put(m,x,.5,z,R(.7,1.3),R(.5,.9),R(.7,1.3),R(0,6),window.DZR?new T.Color(R(.7,.95),R(.8,1),R(.6,.85)):hsl(R(.22,.3),R(.45,.6),R(.2,.3))),1);
 scat(window.DZR?DZR.grassGeo():new T.ConeGeometry(.12,.7,3),window.DZR?DZR.mats().grass:new T.MeshStandardMaterial({color:0xffffff,roughness:1,side:T.DoubleSide}),window.DZR?9000:5000,(m,x,z)=>put(m,x,window.DZR?0:.3,z,R(.8,1.4),R(.6,1.4),R(.8,1.4),R(0,6),window.DZR?new T.Color(R(.75,1),R(.8,1),R(.55,.8)):hsl(R(.22,.32),R(.4,.6),R(.2,.4))),0)}
