/* Deadzone · combat/bow.js
 * Arco e flecha.
 */
// ===== Arco e flechas (v6): puxar a corda, flecha com física, mira lateral =====
WS.bow={n:'Arco e flechas',d:70,r:.9,rg:110,mag:3,rt:1.1};HG.bow=[[0,-.05,-.2],[0,-.05,.12]];MG.bow=[0,-.08,.1];EY.bow=[-.06,0,-.26];EY.bow1=[-.06,0,-.14];
IC.bow='<svg viewBox="0 0 64 24"><path d="M20 2Q50 12 20 22" fill="none" stroke="currentColor" stroke-width="3"/><path d="M20 2V22" stroke="currentColor" stroke-width="1"/><path d="M8 12H52" stroke="currentColor" stroke-width="2"/><path d="M52 12l-6-4v8z"/></svg>';
if(typeof LN==='object')LN.bow='Arco e flechas';
WL.push('bow');ACC.bow=.25;SP.splice(4,0,['bow','Arco e flechas',900]);SP.push(['sc1','Luneta 1x',200]);
const _mkW=mkW;mkW=function(t,lv,sil,vm){if(t!=='bow')return _mkW(t,lv,sil,vm);
 const g=new T.Group(),wd=new T.MeshStandardMaterial({color:0x6b4423,roughness:.8}),dk=new T.MeshStandardMaterial({color:0x2a2a2a}),tp=new T.MeshStandardMaterial({color:0x888888}),ad=(m,x,y,z)=>{m.position.set(x,y,z);g.add(m);return m};
 const arc=new T.Mesh(new T.TorusGeometry(.32,.016,6,20,Math.PI),wd);arc.rotation.set(0,-Math.PI/2,-Math.PI/2);g.add(arc);
 const sm=new T.MeshBasicMaterial({color:0xe8e4d0}),s1=ad(new T.Mesh(new T.BoxGeometry(.004,.004,1),sm),0,.16,0),s2=ad(new T.Mesh(new T.BoxGeometry(.004,.004,1),sm),0,-.16,0);s1.rotation.x=s2.rotation.x=Math.PI/2;s1.scale.z=s2.scale.z=.32;
 ad(new T.Mesh(new T.BoxGeometry(vm?.014:.04,vm?.1:.12,vm?.02:.05),dk),0,0,.32);
 ad(new T.Mesh(new T.BoxGeometry(lv===1?.03:.033,.016,.016),dk),lv===1?-.015:-.0165,lv===1?-.04:0,.32);
 if(lv===1){const B_=(w,h,d,x,y)=>ad(new T.Mesh(new T.BoxGeometry(w,h,d),dk),-.06+x,y,.32);B_(.07,.02,.08,0,-.04);B_(.012,.07,.08,-.04,0);B_(.012,.07,.08,.04,0);B_(.092,.012,.08,0,.041)}
 else{ad(new T.Mesh(new T.TorusGeometry(.027,.0028,6,18),dk),-.06,0,.32)}
 const ar=new T.Group(),sh=new T.Mesh(new T.CylinderGeometry(.006,.006,.7,6),wd);sh.rotation.x=Math.PI/2;sh.position.z=.3;ar.add(sh);
 const hd=new T.Mesh(new T.ConeGeometry(.018,.07,6),tp);hd.rotation.x=Math.PI/2;hd.position.z=.67;ar.add(hd);
 const fl=new T.Mesh(new T.BoxGeometry(.05,.004,.08),new T.MeshBasicMaterial({color:0xc03030,side:T.DoubleSide}));fl.position.z=-.03;ar.add(fl);g.add(ar);let hand=null;if(vm){hand=new T.Mesh(new T.BoxGeometry(.05,.045,.09),new T.MeshStandardMaterial({color:0xd9a37a}));hand.position.set(0,-.01,-.06);g.add(hand)}
 g.position.z=-.2;const o=new T.Group();o.add(g);o.ud={t:'bow',ar,s1,s2,hand};return o};
const _animW=animW;animW=function(w,kv,rv,fc){const u=w&&w.ud;if(u&&u.t==='bow')return;_animW(w,kv,rv,fc)};
// disparo normal do jogo vira "nada" para o arco (o tiro real é ao soltar a corda)
let BD=0,BC=0,BM=0,SPH=0,SNC=0,BDs=0;const _fire2=fire;fire=function(fx,fz){if(wp==='bow'||wp==='sniper'){const q=slots[cur];if(q)q.mag++;BM=1;kk=0;return}_fire2(fx,fz)};
const _sfx=sfx;sfx=function(f,v,d,p){if(BM){BM=0;return}_sfx(f,v,d,p)};
{const d=document.createElement('div');d.id='bdw';d.style.cssText='position:fixed;left:50%;top:58%;transform:translateX(-50%);width:90px;height:7px;background:rgba(0,0,0,.55);border-radius:4px;z-index:4;display:none';d.innerHTML='<i style="display:block;height:100%;width:0;background:#f0a830;border-radius:4px"></i>';document.body.appendChild(d)}
const ARW=[],arM=new T.MeshStandardMaterial({color:0x8a6a3a}),arT=new T.MeshStandardMaterial({color:0x999999}),arG=new T.CylinderGeometry(.012,.012,.9,5),arH=new T.ConeGeometry(.03,.1,5);
function shootArrow(p){const o=cam.position,dr=new T.Vector3();cam.getWorldDirection(dr);const sp=35+50*p;if(!ads){dr.x+=R(-.02,.02);dr.y+=R(-.015,.015);dr.normalize()}
 const m=new T.Group(),a=new T.Mesh(arG,arM),h=new T.Mesh(arH,arT);a.rotation.x=h.rotation.x=Math.PI/2;h.position.z=.5;m.add(a,h);sc.add(m);
 ARW.push({m,ox:o.x,oz:o.z,x:o.x+dr.x*.8,y:o.y+dr.y*.8-.08,z:o.z+dr.z*.8,vx:dr.x*sp,vy:dr.y*sp,vz:dr.z*sp,st:0,t:0});
 }
function arrowTargets(){const L=[];if(!MP&&!SQ)for(const b of bots)if(!b.dead&&!b.air)L.push({x:b.x,z:b.z,py:0,k:'b',b});
 if(MP&&RB&&RB.state==='live'&&OP&&!OP.dead&&!SQ)L.push({x:OP.x,z:OP.z,py:0,k:'o'});for(const e of enemies())L.push({x:e.x,z:e.z,py:e.py||0,k:'e',e});return L}
let _at=performance.now();
setInterval(()=>{const now=performance.now(),dt=Math.min(.05,(now-_at)/1000);_at=now;
 const q=cur>=0?slots[cur]:null,isB=q&&q.t==='bow'&&mode==='ground',ok=isB&&dw>=1&&mpOk()&&!rlOn&&!cast;BC=Math.max(0,BC-dt);
 if(ok){if((firing||keys.f)&&q.mag>0&&BC<=0)BD=Math.min(1,BD+dt/.9);else{if(BD>.2&&q.mag>0){shootArrow(BD);q.mag--;BC=.45;drawSlots()}BD=0}}else BD=0;
 {const isS=q&&q.t==='sniper'&&mode==='ground',hd=!!(firing||keys.f);if(isS&&dw>=1&&mpOk()&&!rlOn&&!cast){if(SPH&&!hd&&q.mag>0&&SNC<=0){q.mag--;SNC=WS.sniper.r;fcd=WS.sniper.r;kk=1;_fire2(Math.sin(pl.rotation.y),Math.cos(pl.rotation.y));_sfx(q.sil?700:1800,q.sil?.12:.5,q.sil?.1:.18,0);drawSlots()}SPH=hd?1:0}else SPH=0;SNC=Math.max(0,SNC-dt)}
 HG.bow[0][2]=-.2-.32*BD-(BC>0?.12*BC/.45:0);if(BD>0&&!BDs){BDs=1;bowSnd(1)}if(BD===0)BDs=0;{const bc=$('bdc');bc.style.display=(q&&q.t==='bow'&&ads&&!q.sc&&adk>.85&&mode==='ground')?'block':'none'}
 for(const w of[rf.children[0],vmH.children[0]]){const u=w&&w.ud;if(u&&u.t==='bow'){bowPose(u)}}
 const bw=$('bdw');bw.style.display=BD>0?'block':'none';bw.firstChild.style.width=(BD*100)+'%';
 if(isB&&q.mag<=0&&!rlOn&&!cast&&(q.res>0||bag.ammo>0))startReload();
 if(ARW.length){const L=arrowTargets();for(let i=ARW.length-1;i>=0;i--){const a=ARW[i];
  if(a.st){a.st-=dt;if(a.st<=0){sc.remove(a.m);ARW.splice(i,1)}continue}
  a.t+=dt;const k=Math.exp(-.35*dt);a.vx*=k;a.vy=a.vy*k-9*dt;a.vz*=k;const sp=Math.hypot(a.vx,a.vy,a.vz),nx=a.x+a.vx*dt,ny=a.y+a.vy*dt,nz=a.z+a.vz*dt;
  let hit=null;for(const t of L){for(let s=1;s<=3;s++){const u=s/3,px=a.x+(nx-a.x)*u,py=a.y+(ny-a.y)*u,pz=a.z+(nz-a.z)*u;const hx=Math.hypot(px-t.x,pz-t.z);if(hx<.7&&py>t.py&&py<t.py+1.9){hit=t;hit.hy=py-t.py;hit.hx=hx;break}}if(hit)break}
  if(hit){const hd=hit.hy>1.5&&hit.hx<.45,ds=Math.hypot(nx-a.ox,nz-a.oz),fa=ds<=20?1:Math.max(.2,1-(ds-20)/90*.8),dm=hd?(ds<70?999:Math.round(90*fa+30)):Math.max(5,Math.round(46*fa));
   hitFx(nx,ny,nz,Math.min(dm,100),hd,hit.k==='b'&&hit.b.hp<=dm);if(hit.k==='b'){dmgDone+=Math.min(dm,hit.b.hp);hit.b.hp-=dm;if(hit.b.hp<=0&&!hit.b.dead)killBot(hit.b,true)}else if(hit.k==='o')snd({t:'hit',d:dm},1);else sqDmg(hit.e,dm);
   bowSnd(2,.7);say(hd?'💀 TIRO NA CABEÇA! Morte instantânea':'Acertou! -'+dm+(dm<30?' (flecha fraca pela distância)':''),1.2);a.st=.01;continue}
  if(ny<=.05||blocked(a.x,a.y,a.z,nx,ny,nz)){{const iw=iceOnLine(a.x,a.z,nx,nz);if(iw)iceDmg(iw,Math.round(WS.bow.d*Math.min(1,sp/85)))}bowSnd(2,Math.max(.1,1-Math.hypot(a.x-P.x,a.z-P.z)/60));a.st=4;a.m.position.set(a.x,Math.max(.05,a.y),a.z);continue}
  a.x=nx;a.y=ny;a.z=nz;a.m.position.set(nx,ny,nz);a.m.lookAt(nx+a.vx,ny+a.vy,nz+a.vz);if(a.t>6){a.st=.01}}}},16);
const _sqBuy=sqBuy;sqBuy=function(i){const it=SP[i];if(it[0]!=='sc1')return _sqBuy(i);const S=SQ;if(!S||S.st!=='buy')return;const q=cur>=0?slots[cur]:null;
 if(!q||!(q.t==='bow'||q.t==='rifle'||q.t==='sniper')){say('Empunhe arco, rifle ou sniper',1.8);return}if(q.sc){say('Já tem luneta',1.5);return}if(S.m<it[2]){say('Dinheiro insuficiente',1.5);return}
 S.m-=it[2];q.sc=1;drawSlots();say('Luneta 1x equipada',1.5);sqShop()};

function bowPose(u){const d=.32*BD+(BC>0?Math.sin(BC*70)*.025*(BC/.45):0),L=Math.hypot(.32,d);
 u.ar.position.z=-.32*BD;u.ar.visible=BC<=0&&!rlOn;
 u.s1.scale.z=u.s2.scale.z=L;u.s1.position.set(0,.16,-d/2);u.s2.position.set(0,-.16,-d/2);u.s1.rotation.x=Math.atan2(.32,-d);u.s2.rotation.x=Math.atan2(-.32,-d);
 if(u.hand){u.hand.position.z=-.32*BD-.06-(BC>0?.12*BC/.45:0);u.hand.visible=!rlOn}}
let KB=null;
function bowSnd(k,vol){if(!AC)return;vol=vol==null?1:vol;try{if(AC.state==='suspended')AC.resume();const t=AC.currentTime,out=AC.destination,sr=AC.sampleRate;
 const nz=(fq,q,ty,g0,t0,du,f2)=>{const n=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();n.buffer=NB;n.loop=true;f.type=ty;f.Q.value=q;f.frequency.setValueAtTime(fq,t+t0);if(f2)f.frequency.exponentialRampToValueAtTime(f2,t+t0+du);g.gain.setValueAtTime(g0*vol,t+t0);g.gain.exponentialRampToValueAtTime(.001,t+t0+du);n.connect(f);f.connect(g);g.connect(out);n.start(t+t0);n.stop(t+t0+du+.02)};
 const sn=(f1,f2,g0,du)=>{const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+du);g.gain.setValueAtTime(g0*vol,t);g.gain.exponentialRampToValueAtTime(.001,t+du);o.connect(g);g.connect(out);o.start(t);o.stop(t+du+.02)};
 if(k===0){if(!KB){const f=210,N=Math.round(sr/f),L=Math.round(sr*.16),b=AC.createBuffer(1,L,sr),d=b.getChannelData(0);for(let i=0;i<L;i++)d[i]=i<N?(Math.random()*2-1):(d[i-N]+(i>N?d[i-N-1]:d[i-N]))*.5*.97;KB=b}
  const p=AC.createBufferSource(),lf=AC.createBiquadFilter(),g=AC.createGain();p.buffer=KB;lf.type='lowpass';lf.frequency.value=2200;g.gain.value=.55*vol;p.connect(lf);lf.connect(g);g.connect(out);p.start(t);
  nz(2600,3,'bandpass',.6,0,.035);sn(90,50,.28,.07);nz(4200,1.5,'bandpass',.28,.015,.28,1100)} else if(k===1){const n=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),lf=AC.createOscillator(),lg=AC.createGain();n.buffer=NB;n.loop=true;f.type='bandpass';f.Q.value=5;f.frequency.setValueAtTime(380,t);f.frequency.linearRampToValueAtTime(620,t+.85);
  g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(.07,t+.2);g.gain.linearRampToValueAtTime(.001,t+.9);lf.frequency.value=13;lg.gain.value=.03;lf.connect(lg);lg.connect(g.gain);n.connect(f);f.connect(g);g.connect(out);n.start(t);n.stop(t+.92);lf.start(t);lf.stop(t+.92)}
 else{sn(160,60,.4,.09);nz(900,.8,'lowpass',.3,0,.07)}}catch(e){}}
{const d=document.createElement('div');d.id='bdc';d.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:3;display:none;pointer-events:none';d.innerHTML='<svg width="44" height="44"><circle cx="22" cy="22" r="2.6" fill="#ff3a2a"/><path d="M22 4v9M22 31v9M4 22h9M31 22h9" stroke="#fff" stroke-opacity=".85" stroke-width="1.6"/></svg>';document.body.appendChild(d)}
function bowElev(sp,phi,ZR){const c=Math.cos(phi),s_=Math.sin(phi),k=Math.exp(-.35*.02);let x=0,y=0,vx=sp*c,vy=sp*s_;for(let i=0;i<400;i++){vx*=k;vy=vy*k-9*.02;x+=vx*.02;y+=vy*.02;if(x*c+y*s_>=ZR)return Math.atan(Math.max(0,x*s_-y*c)/ZR)}return 0}
