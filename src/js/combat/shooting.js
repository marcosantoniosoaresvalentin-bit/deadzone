/* Deadzone · combat/shooting.js
 * Dano, tiros, explosões, granadas e ataque corpo a corpo.
 */
function hurtBot(t,d,by){t.hp-=d;if(t.hp<=0&&!t.dead){t.by=by||null;killBot(t,0)}}
function killBot(b,me){b.dead=1;b.dt=0;alive--;if(me)kills++;feedK(b,me);if(b.w)mkLoot(b.w,b.x,b.z,b.v?{v:b.v}:null,0,b.sil)}
function capT(o,dr,x,y,z,cr,mx,v){const hs=cr?[.3,.75,1]:[.45,1.05,1.35],hh=cr?1.3:1.65;
 const tt_=(h,r0,k)=>{const vx=x-o.x,vz=z-o.z;let vy=y+h-o.y;const t=vx*dr.x+vy*dr.y+vz*dr.z;if(t<0||t>mx)return 1e9;if(v)vy+=4.9*(t/v)*(t/v);const px=vx-dr.x*t,py=vy-dr.y*t,pz=vz-dr.z*t,r=r0+t*k;return px*px+py*py+pz*pz<r*r?t:1e9};
 const th=tt_(hh,.27,.002);if(th<1e9){capHead=1;return th}capHead=0;let bt=1e9;for(let i=0;i<3;i++){const t=tt_(hs[i],i===2?.42:.5,.003);if(t<bt)bt=t}return bt}
function fire(fx,fz){const o=cam.position,dr=new T.Vector3();cam.getWorldDirection(dr);if(!ads){dr.x+=R(-.012,.012);dr.y+=R(-.009,.009);dr.z+=R(-.012,.012);dr.normalize()}const W_=WS[wp];let best=null,bt=1e9,bhd=0;recoil();
 for(const b of bots){if(b.dead||b.air||b.team===1)continue;const t=capT(o,dr,b.x,TERH(b.x,b.z),b.z,b.cr,W_.rg+8,wp==='sniper'?300:0);if(t<bt){bt=t;best=b;bhd=capHead}}
 let end=W_.rg;
 const t0=Math.max(0,(P.x-o.x)*dr.x+(P.y+1.4-o.y)*dr.y+(P.z-o.z)*dr.z);
 if(best&&bt>=t0&&!blocked(o.x+dr.x*t0,o.y+dr.y*t0,o.z+dr.z*t0,o.x+dr.x*bt,o.y+dr.y*bt,o.z+dr.z*bt)){end=bt;const dm=wDmg(W_.d,bt,bhd);dmgDone+=Math.min(dm,best.hp);best.hp-=dm;best.fl=1;best.fs=Math.random()<.5?-1:1;hitFx(o.x+dr.x*bt,o.y+dr.y*bt,o.z+dr.z*bt,dm,bhd,best.hp<=0);if(best.hp<=0){lastHS=bhd;killBot(best,true)}}
 {let cb=null,ct=1e9;for(const c of CARS){if(c.dead)continue;const vx=c.x-o.x,vy=(c.heli?c.y+1.9:1)-o.y,vz=c.z-o.z,t=vx*dr.x+vy*dr.y+vz*dr.z;if(t<0||t>W_.rg)continue;const px=vx-dr.x*t,py=vy-dr.y*t,pz=vz-dr.z*t;if(px*px+py*py+pz*pz<(c.heli?8:2.6)&&t<ct){ct=t;cb=c}}if(cb&&ct<end){end=ct;hitCar(cb,W_.d*.5)}}
 if(MP&&RB&&RB.state==='live'){snd({t:'f'});const ih=rayIce(o,dr,W_.rg),ie=ih?ih.t:1e9;
  if(OP&&!OP.dead){const vx=OP.x-o.x,vy=1.2-o.y,vz=OP.z-o.z,t=vx*dr.x+vy*dr.y+vz*dr.z;if(t>0&&t<W_.rg&&t<ie){const px=vx-dr.x*t,py=vy-dr.y*t,pz=vz-dr.z*t;if(px*px+py*py+pz*pz<.55&&!blocked(o.x,o.y,o.z,o.x+dr.x*t,o.y+dr.y*t,o.z+dr.z*t)){end=Math.min(end,t);{const dq_=wp==='shotgun'?wDmg(W_.d,t,0):W_.d;snd({t:'hit',d:dq_},1);say('Acertou!',.4);hitFx(o.x+dr.x*t,o.y+dr.y*t,o.z+dr.z*t,dq_,0,0)}}}}
  if(ih&&ih.t<end){end=ih.t;const w=ih.w;w.hp-=W_.d;if(w.hp<=0)breakIce(w);snd({t:'ice',i:w.id,hp:w.hp},1)}}
 try{window.DZW&&DZW.shoot(o,dr,end)}catch(e){}try{DZFX.impact(o,dr,end,best&&end===bt?best:null,W_.rg)}catch(e){}const a=trg.attributes.position;a.setXYZ(0,P.x+fx*.6,P.y+1.4-.4*cr-pr,P.z+fz*.6);a.setXYZ(1,o.x+dr.x*end,o.y+dr.y*end,o.z+dr.z*end);a.needsUpdate=true;trl.visible=true;trt=.07}
// morrer dentro de um veículo: o corpo sai para o lado do carro antes da animação de morte
function ejectDriver(){if(!drv)return;const c=drv;P.x=c.x+Math.cos(c.yaw)*2.6;P.z=c.z-Math.sin(c.yaw)*2.6;P.y=TERH(P.x,P.z);P.vy=0;drv=null;pl.quaternion.identity();pl.rotation.set(0,c.yaw,0)}
function die(){ejectDriver();mode='dead';setLabel();lb.style.display='flex';lb.innerHTML='<h1>ELIMINADO</h1><p>Você ficou em #'+alive+'. Abates: '+kills+'.</p>';const rb=document.createElement('button');rb.textContent='Jogar de novo';rb.onclick=()=>location.reload();lb.appendChild(rb)}
let drv=null,nearCar=null,ml=0,mlK=0;const GRN=[],EX=[],EXG=new T.SphereGeometry(1,12,8),knf=new T.Mesh(new T.BoxGeometry(.025,.05,.3),WK.sl);knf.position.set(0,-.34,.14);knf.visible=false;aR.el.add(knf);
function expl(x,y,z,r,dm,own){try{window.DZW&&DZW.blast(x,y,z,r*.8)}catch(e){}const m=new T.Mesh(EXG,new T.MeshBasicMaterial({color:0xffa030,transparent:true,opacity:.9,depthWrite:false}));m.position.set(x,y,z);sc.add(m);EX.push({m,t:0,r});sfx(200,.9,.7,0);
 if(mode==='ground'||mode==='drive'){const d=Math.hypot(P.x-x,P.z-z);if(d<r){hp-=dm*(1-d/r);pingDir(x,z,'hit')}}
 for(const b of bots){if(b.dead||b.air||b.team===1)continue;const d=Math.hypot(b.x-x,b.z-z);if(d<r){const q_=dm*(1-d/r)*1.3;b.hp-=q_;if(own)hitFx(b.x,1.3,b.z,q_,0,b.hp<=0);if(b.hp<=0&&!b.dead)killBot(b,own)}}
 for(const c of CARS){if(c.dead)continue;if(c.heli&&Math.abs(c.y+1.5-y)>10)continue;const d=Math.hypot(c.x-x,c.z-z);if(d<r&&d>.1)hitCar(c,dm*(1-d/r)*.8)}}
function hitCar(c,d){if(c.dead)return;c.hp-=d;if(c.hp<=0)boom(c);else if(c.hp<35)c.fire=1}
function boom(c){if(c.dead)return;if(c.heli&&c.y>2.5){c.crash=1;c.fire=1;return}c.dead=1;c.fire=0;c.fl.visible=false;if(c.heli){hBurn(c);c.y=TERH(c.x,c.z);c.g.position.set(c.x,c.y,c.z);c.g.rotation.set(0,c.yaw,0);c.rs=0}else{c.g.body.material=BURN;c.g.cab.material=BURN;for(const m of c.g.userData.ex||[])m.material=BURN}c.spd=0;c.vy=0;if(drv===c&&!c.heli&&mode==='drive'){P.x=c.x+Math.cos(c.yaw)*2.6;P.z=c.z-Math.sin(c.yaw)*2.6;P.y=TERH(P.x,P.z);P.vy=0;drv=null;mode='ground';pl.rotation.set(0,c.yaw,0);setLabel()}expl(c.x,1,c.z,c.heli?15:13,115,0)}
function updExpl(dt){for(let i=EX.length-1;i>=0;i--){const e=EX[i];e.t+=dt*1.6;e.m.scale.setScalar(Math.max(.1,e.r*.55*Math.min(1,e.t*2.2)));e.m.material.opacity=Math.max(0,.9-e.t*.9);if(e.t>=1){sc.remove(e.m);e.m.material.dispose();EX.splice(i,1)}}}
function throwGren(){if(mode!=='ground'||!bag.gren||cast)return;const v=gVel(16);launchGren(v.x0,v.y0,v.z0,v.vx,v.vy,v.vz,3,1);bag.gren--;drawBag();say('Granada!',.8)}
function updGren(dt){for(let i=GRN.length-1;i>=0;i--){const g=GRN[i];g.t-=dt;g.vy-=18*dt;
 const nx=g.x+g.vx*dt,nz=g.z+g.vz*dt,ny=g.y+g.vy*dt;let hx=0,hz=0,top=0;
 for(const b of near(nx,nz)){if(b.off)continue;const hi=b.ice?2.95:6;
  if(b.ice&&g.y>=hi&&ny<hi&&g.vy<0&&nx>b.x0&&nx<b.x1&&nz>b.z0&&nz<b.z1)top=hi;
  if(g.y>=hi)continue;
  if(nx>b.x0-.15&&nx<b.x1+.15&&g.z>b.z0-.15&&g.z<b.z1+.15)hx=1;if(g.x>b.x0-.15&&g.x<b.x1+.15&&nz>b.z0-.15&&nz<b.z1+.15)hz=1}
 if(hx)g.vx*=-.4;else g.x=nx;if(hz)g.vz*=-.4;else g.z=nz;
 if(top){g.y=top;g.vy=Math.abs(g.vy)>2?-g.vy*.35:0;g.vx*=.7;g.vz*=.7}else{g.y+=g.vy*dt;if(g.y<GY(g.x,g.z,g.y)+.13){g.y=GY(g.x,g.z,g.y)+.13;g.vy=Math.abs(g.vy)>2?-g.vy*.35:0;g.vx*=.7;g.vz*=.7}}
 g.m.position.set(g.x,g.y,g.z);if(g.t<=0){sc.remove(g.m);GRN.splice(i,1);if(g.sm)spawnSmoke(g.x,g.z);else{RGX=g.rem?1:0;expl(g.x,g.y,g.z,11,120,1);RGX=0}}}}
function melee(){if(mode!=='ground'||ml>0||cast)return;const k=bag.knife>0;ml=.35;mlK=k?1:0;rlOn=0;rl=0;const a=pl.rotation.y,fx_=Math.sin(a),fz_=Math.cos(a),rg=k?2.3:1.9,dm=k?55:18;let hit=0;
 for(const b of bots){if(b.dead||b.air||b.team===1)continue;const dx=b.x-P.x,dz=b.z-P.z,d=Math.hypot(dx,dz);if(d<rg&&(dx*fx_+dz*fz_)/(d||1)>.35){b.hp-=dm;hit=1;hitFx(b.x,1.3,b.z,dm,0,b.hp<=0);if(b.hp<=0&&!b.dead)killBot(b,1)}}
 sfx(k?900:300,.25,.1,0);if(hit)say(k?'Facada!':'Soco!',.6)}
