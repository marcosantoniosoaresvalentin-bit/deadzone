/* Deadzone · world/airplane-parachute.js
 * Avião de lançamento, paraquedas e traçante.
 */
const plane=new T.Group(),props=[];
{const PM=(c,s)=>new T.MeshPhongMaterial({color:c,shininess:s||30,side:T.DoubleSide});
const add=(g,c,x,y,z,rx,ry,rz,s)=>{const m=new T.Mesh(g,PM(c,s));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);plane.add(m);return m};
const OL=0x7d8b6f,LG=0xaab3a2,DG=0x2f372b,GL=0x16293b;
const pts=[[.01,-15.5],[.35,-15],[.7,-13.5],[1.2,-11],[1.7,-8],[2,-5],[2.1,0],[2.05,5],[1.85,7.5],[1.5,9.5],[1,11],[.55,12],[.01,12.5]].map(p=>new T.Vector2(p[0],p[1]));
const fg=new T.LatheGeometry(pts,24);fg.rotateX(Math.PI/2);add(fg,OL,0,0,0,0,0,0,25);
add(new T.BoxGeometry(1.7,.5,1.6),GL,0,1.15,9.9,0,0,0,90);
for(const s of[-1,1]){add(new T.BoxGeometry(.1,.5,.9),GL,s*1.3,.85,9.4,0,0,0,90);
 for(let i=0;i<6;i++)add(new T.BoxGeometry(.08,.35,.35),GL,s*2.08,.7,-6+i*2.2,0,0,0,90);
 add(new T.BoxGeometry(.08,2.2,1.8),DG,s*1.72,.1,-8.2);
 const sp=add(new T.SphereGeometry(1,12,8),DG,s*2.1,-1,-1);sp.scale.set(.6,.8,3.6)}
add(new T.BoxGeometry(1.6,.15,3),DG,0,-.8,-12.6,-.25,0,0);
const ws=new T.Shape();ws.moveTo(0,0);ws.lineTo(15,2.2);ws.lineTo(15,4);ws.lineTo(0,5.2);ws.closePath();
const wg=new T.ExtrudeGeometry(ws,{depth:.4,bevelEnabled:false});wg.rotateX(-Math.PI/2);
const wr=add(wg,LG,1.5,1.3,2.5,0,0,.04),wl=add(wg,LG,-1.5,1.3,2.5,0,0,-.04);wl.scale.x=-1;
const fs=new T.Shape();fs.moveTo(0,0);fs.lineTo(4.2,0);fs.lineTo(3,5.5);fs.lineTo(1.2,5.5);fs.closePath();
const fgm=new T.ExtrudeGeometry(fs,{depth:.35,bevelEnabled:false});fgm.translate(0,0,-.175);fgm.rotateY(Math.PI/2);add(fgm,OL,0,1.4,-9);
const hs=new T.Shape();hs.moveTo(0,0);hs.lineTo(5,1.5);hs.lineTo(5,2.7);hs.lineTo(0,3.2);hs.closePath();
const hg=new T.ExtrudeGeometry(hs,{depth:.25,bevelEnabled:false});hg.rotateX(-Math.PI/2);
const h1=add(hg,LG,0,6.9,-9.8),h2=add(hg,LG,0,6.9,-9.8);h2.scale.x=-1;
for(const x of[-10.5,-5.5,5.5,10.5]){const ld=2.5-(Math.abs(x)-1.5)*.147,zc=ld+.3,g=new T.CylinderGeometry(.5,.6,3.4,14);g.rotateX(Math.PI/2);
 add(g,DG,x,1,zc);const cg=new T.CylinderGeometry(0,.4,.8,10);cg.rotateX(Math.PI/2);add(cg,LG,x,1,zc+2.1);
 const pg=new T.Group();pg.position.set(x,1,zc+1.8);plane.add(pg);
 for(let k=0;k<4;k++){const b=new T.Mesh(new T.BoxGeometry(.22,2.8,.05),M(0x222222));b.rotation.z=k*Math.PI/2;b.position.set(0,0,0);pg.add(b)}
 pg.add(new T.Mesh(new T.CircleGeometry(1.45,20),new T.MeshBasicMaterial({color:0x222222,transparent:true,opacity:.12,side:T.DoubleSide})));props.push(pg)}}
plane.visible=false;sc.add(plane);
const canopy=new T.Group();
{const cl=[0xe8742d,0xf2f2f2];for(let i=0;i<8;i++){const m=new T.Mesh(new T.SphereGeometry(4,6,8,i*Math.PI/4,Math.PI/4,0,Math.PI/2),new T.MeshLambertMaterial({color:cl[i%2],side:T.DoubleSide}));m.scale.set(1,.7,1.15);m.position.y=4.2;canopy.add(m)}
const pts=[];for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8;pts.push(Math.cos(a)*4,4.2,Math.sin(a)*4.6,(i%2?.12:-.12),0,0)}
const lg=new T.BufferGeometry();lg.setAttribute('position',new T.Float32BufferAttribute(pts,3));canopy.add(new T.LineSegments(lg,new T.LineBasicMaterial({color:0xffffff})))}
canopy.visible=false;sc.add(canopy);
const trg=new T.BufferGeometry();trg.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(6),3));
const trl=new T.Line(trg,new T.LineBasicMaterial({color:0xffe27a}));trl.visible=false;trl.frustumCulled=false;sc.add(trl);
const bcg=new T.SphereGeometry(2.3,10,6,0,6.283,0,1.5708),bcm=new T.MeshLambertMaterial({color:0xe8742d,side:T.DoubleSide});
