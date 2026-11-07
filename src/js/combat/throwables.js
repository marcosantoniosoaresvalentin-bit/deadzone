/* Deadzone · combat/throwables.js
 * Granada (cozinhar) e gel de gelo.
 */
// ===== ARREMESSÁVEIS: granada (cozinhar) e gel =====
const FUSE=4,GMAX=30,GMIN=5,PZR=32;let GA=null,TS=0,gcn=0,GM=[];
const GELM=new T.MeshStandardMaterial({color:0xf4faff,emissive:0x35485a,roughness:.28,metalness:0,side:T.DoubleSide}),
AIML=new T.Line(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(new Float32Array(25*3),3)),new T.LineBasicMaterial({color:0xffe27a})),
AIMR=new T.Mesh(new T.RingGeometry(.6,.85,24),new T.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:.8,side:T.DoubleSide,depthTest:false})),
GHM=new T.MeshBasicMaterial({color:0x9fd8ff,transparent:true,opacity:.28,depthWrite:false,side:T.DoubleSide}),GELG=mkGelGeo(),GPV=new T.Mesh(GELG,GHM);
AIMR.rotation.x=-Math.PI/2;for(const o of[AIML,AIMR,GPV]){o.visible=false;o.frustumCulled=false;sc.add(o)}
const SQM=new T.MeshBasicMaterial({color:0xff2020,transparent:true,opacity:.28,depthWrite:false,side:T.DoubleSide}),
mkPad=()=>{const g=new T.Group(),pl_=new T.Mesh(new T.PlaneGeometry(12,3),SQM);pl_.rotation.x=-Math.PI/2;pl_.position.y=.05;g.add(pl_);
 g.add(new T.LineLoop(new T.BufferGeometry().setFromPoints([[-6,-1.5],[6,-1.5],[6,1.5],[-6,1.5]].map(a=>new T.Vector3(a[0],.08,a[1]))),new T.LineBasicMaterial({color:0xff4040})));
 const n=70,pos=new Float32Array(n*3),sp=[];for(let i=0;i<n;i++){pos[i*3]=R(-6,6);pos[i*3+1]=R(0,3);pos[i*3+2]=R(-1.5,1.5);sp.push(R(1.2,2.8))}
 const pts=new T.Points(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(pos,3)),new T.PointsMaterial({color:0xff6a2a,size:.22,transparent:true,opacity:.9,depthWrite:false,blending:T.AdditiveBlending}));pts.frustumCulled=false;pts.userData.sp=sp;g.add(pts);g.visible=false;sc.add(g);return g},PD=[mkPad(),mkPad()];
function padTick(dt){for(const g of PD){if(!g.visible)continue;const a=g.children[2].geometry.attributes.position,sp=g.children[2].userData.sp;for(let i=0;i<sp.length;i++){let y=a.getY(i)+sp[i]*dt;if(y>3){y=0;a.setX(i,R(-6,6));a.setZ(i,R(-1.5,1.5))}a.setY(i,y)}a.needsUpdate=true}SQM.opacity=.2+.1*Math.sin(tt*6)}
const gRange=k=>GMIN+(GMAX-GMIN)*k;
function gVel(r){const x0=P.x+Math.sin(yaw)*.5,z0=P.z+Math.cos(yaw)*.5,y0=1.5,ft=.7+r/30*.55,vh=r/ft;return{x0,y0,z0,ft,vx:Math.sin(yaw)*vh,vz:Math.cos(yaw)*vh,vy:(.13-y0+9*ft*ft)/ft}}
function launchGren(x,y,z,vx,vy,vz,fuse,net){const g={m:new T.Mesh(new T.SphereGeometry(.13,8,6),M(0x2f3a2a)),x,y,z,vx,vy,vz,t:fuse};sc.add(g.m);GRN.push(g);if(net&&MP&&opId)snd({t:'gr',x:+x.toFixed(2),y:+y.toFixed(2),z:+z.toFixed(2),vx:+vx.toFixed(2),vy:+vy.toFixed(2),vz:+vz.toFixed(2),f:+fuse.toFixed(2)},1)}
function gelPos(k){const d=3+13*k;let x=P.x+Math.sin(yaw)*d,z=P.z+Math.cos(yaw)*d;if(AR&&!SQ){const dx=x-AR.cx,dz=z-AR.cz,m=Math.hypot(dx,dz);if(m>PZR-3){x=AR.cx+dx/m*(PZR-3);z=AR.cz+dz/m*(PZR-3)}}return{x,z,a:yaw+Math.PI}}
function mkGelGeo(){const R_=2.4,TH=1.13,Ro=R_+.3,Ri=R_-.3,n=24,pts=[];for(let i=0;i<=n;i++){const f=-TH+2*TH*i/n;pts.push(new T.Vector2(Ro*Math.sin(f),Ro*Math.cos(f)-R_))}for(let i=n;i>=0;i--){const f=-TH+2*TH*i/n;pts.push(new T.Vector2(Ri*Math.sin(f),Ri*Math.cos(f)-R_))}
 const g=new T.ExtrudeGeometry(new T.Shape(pts),{depth:2.8,bevelEnabled:false,curveSegments:1});g.rotateX(-Math.PI/2);return g}
function placeGel(x,z,a,net,id,rd){rd=rd==null?RB.r:rd;if(RB&&rd<RB.r)return;if(id&&ICE.some(w=>w.id===id))return;id=id||mpId+'g'+(++gcn);
 const co=Math.cos(a),si=Math.sin(a),W=(lx,lz)=>[x+lx*co+lz*si,z-lx*si+lz*co],R_=2.4,TH=1.13,N=6,S={hp:200,id,bs:[],m:null,rd},m=new T.Mesh(GELG,GELM);m.position.set(x,0,z);m.rotation.y=a;m.castShadow=true;sc.add(m);S.m=m;
 for(let i=0;i<N;i++){const f0=-TH+2*TH*i/N,f1=-TH+2*TH*(i+1)/N,Q=[];for(const f of[f0,f1])for(const r of[R_-.3,R_+.3])Q.push(W(r*Math.sin(f),R_-r*Math.cos(f)));
  const b=addBox({x0:Math.min(...Q.map(q=>q[0])),x1:Math.max(...Q.map(q=>q[0])),z0:Math.min(...Q.map(q=>q[1])),z1:Math.max(...Q.map(q=>q[1])),w:1,ice:1});S.bs.push(b);ICE.push({b,S,m,id,rd,get hp(){return S.hp},set hp(v){S.hp=v}})}
 sfx(700,.4,.2,0);if(net){GM.push({id,x,z,a,rd,S});snd({t:'gel',x:+x.toFixed(2),z:+z.toFixed(2),a:+a.toFixed(3),id,rd},1)}}
function selThrow(k){if(mode!=='ground')return;TS=TS===k?0:k;if(TS){cur=-1;rlOn=0;rl=0;ads=0;say(k==='gren'?'Granada selecionada · segure LANÇAR para cozinhar e mirar':'Gel selecionado · segure LANÇAR e arraste para posicionar',2.4)}drawSlots()}
function releaseAim(){const g=GA;GA=null;if(!g||mode!=='ground')return;
 if(g.k==='gren'){if(!bag.gren)return;const v=gVel(gRange(g.rng));launchGren(v.x0,v.y0,v.z0,v.vx,v.vy,v.vz,Math.max(.25,FUSE-g.t),1);bag.gren--;say('Granada!',.8);if(!bag.gren)TS=0}
 else{if(!bag.gel)return;const q=gelPos(g.rng);placeGel(q.x,q.z,q.a,1);bag.gel--;if(!bag.gel)TS=0}drawBag()}
function updAim(dt){if(GA&&(mode!=='ground'||!mpOk()))GA=null;
 if(!GA){AIML.visible=AIMR.visible=GPV.visible=false;$('bg').style.background=TS==='gren'?'rgba(240,168,48,.75)':'';$('bgl').style.background=TS==='gel'?'rgba(240,168,48,.75)':'';return}
 if(GA.k==='gren'){GA.t+=dt;const rem=FUSE-GA.t;say('💣 '+Math.max(0,rem).toFixed(1)+'s',.25);$('bg').style.background='rgb(230,'+Math.round(170*Math.max(0,rem)/FUSE)+',40)';
  if(rem<=0){launchGren(P.x,1.2,P.z,0,0,0,.02,1);bag.gren--;GA=null;TS=0;drawBag();say('A granada explodiu na sua mão!',1.5);return}
  const v=gVel(gRange(GA.rng)),a=AIML.geometry.attributes.position;for(let i=0;i<=24;i++){const t=v.ft*i/24;a.setXYZ(i,v.x0+v.vx*t,v.y0+v.vy*t-9*t*t,v.z0+v.vz*t)}a.needsUpdate=true;AIML.visible=true;AIMR.visible=true;AIMR.position.set(v.x0+v.vx*v.ft,.2,v.z0+v.vz*v.ft);GPV.visible=false}
 else{const q=gelPos(GA.rng);GPV.position.set(q.x,0,q.z);GPV.rotation.y=q.a;GPV.visible=true;AIML.visible=AIMR.visible=false}}
