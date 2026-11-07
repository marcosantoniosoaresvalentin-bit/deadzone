/* Deadzone · bots/bots.js
 * Criação, animação e comportamento de saque dos bots.
 */
function mkBot(){const R_=buildChar(1),g=R_.pl;g.rig=R_;g.tr=R_.tor;g.aR=R_.aR;g.aL=R_.aL;g.l1=R_.lg1.th;g.l2=R_.lg2.th;
 const cn=new T.Mesh(bcg,bcm);cn.position.y=3.6;cn.scale.y=.7;cn.visible=false;g.add(cn);g.cn=cn;return g}
function armBot(b,t,sl){b.w=t;b.sil=sl||((t!=='shotgun'&&Math.random()<.2)?1:0);const w=mkW(t,0,b.sil);b.g.tr.add(w);b.wg=w;b.dw=0}
const _a=new T.Vector3();
function animBot(b,dt,mv,dp){const r=b.g.rig,k=Math.min(1,dt*8);b.am+=((mv?1:0)-b.am)*k;b.ph+=dt*9*mv;const s_=Math.sin(b.ph),c=Math.cos(b.ph),w=b.am;
 const fight=(b.w&&mode==='ground'&&dp<55&&!mv)?1:0;b.cr+=(fight-b.cr)*Math.min(1,dt*5);const cr=b.cr;r.loco={w:1-cr,sp:w*2.8,arm:!!b.w,fw:1};
 r.lg1.th.rotation.x=-s_*.85*w-1.1*cr;r.lg1.kn.rotation.x=Math.max(0,c)*1.1*w+1.9*cr;r.lg2.th.rotation.x=s_*.85*w-1.1*cr;r.lg2.kn.rotation.x=Math.max(0,-c)*1.1*w+1.9*cr;
 r.hips.position.y=.95-.33*cr+Math.abs(s_)*.03*w;r.tor.rotation.x=.1*w+.3*cr;
 if(b.w){const wg=b.wg;if(b.dw<1){b.dw=Math.min(1,b.dw+dt/.7);const e=b.dw*b.dw*(3-2*b.dw);wg.position.set(.1*e,.32+(.27-.32)*e,-.36+.58*e);wg.rotation.set(-1.35*(1-e),0,.3*(1-e))}else{b.kk=Math.max(0,(b.kk||0)-dt*6);wg.position.set(.1,.27,.22-.04*b.kk);wg.rotation.set(-.06*b.kk,0,0);animW(wg,b.kk,0,1)}
  if(b.dw<1||dp<90){wg.updateMatrix();const h=HG[b.w];_a.set(h[0][0],h[0][1],h[0][2]).applyMatrix4(wg.matrix);ik(r.aR,1,_a.x,_a.y,_a.z);_a.set(h[1][0],h[1][1],h[1][2]).applyMatrix4(wg.matrix);ik(r.aL,-1,_a.x,_a.y,_a.z)}}
 else{r.aR.sh.rotation.set(-s_*.7*w,0,.06);r.aL.sh.rotation.set(s_*.7*w,0,-.06);r.aR.el.rotation.x=r.aL.el.rotation.x=-.25-.4*w}}
const bn=b=>b;
function botLoot(b,dt){b.lt-=dt;b.sd+=dt;
 if(b.tgt&&loot.indexOf(b.tgt)<0)b.tgt=null;
 if(b.tgt&&b.sd>12){b.skip=b.tgt;b.tgt=null;b.lt=2}
 if(!b.tgt&&b.lt<=0){b.lt=1.1;let bd=190;for(const o of loot){if(!WS[o.t]||o===b.skip)continue;const d=Math.hypot(o.x-b.x,o.z-b.z);if(d<bd){bd=d;b.tgt=o;b.sd=0}}}
 if(b.tgt){const o=b.tgt,d=Math.hypot(o.x-b.x,o.z-b.z),q=FP.find(v=>botInside(v,o.x,o.z));
  const same=q&&botInside(q,b.x,b.z);
  if(d<1.45&&(!q||same)){sc.remove(o.top);loot.splice(loot.indexOf(o),1);lkey='';armBot(b,o.t,o.sil);b.tgt=null;return 0}
  botNavigate(b,o.x,o.z,3.15,dt);return 1
 }
 b.wt-=dt;if(b.wt<=0||Math.hypot(b.tx-b.x,b.tz-b.z)<1.8){const C=nearestCity(b.x,b.z);b.tx=C.x+R(-95,95);b.tz=C.z+R(-95,95);b.wt=R(8,13)}
 botNavigate(b,b.tx,b.tz,2.8,dt);return 1
}
function spawnBot(q){const g=mkBot(),x0=pS.x+pD.x*55*gt,z0=pS.z+pD.z*55*gt;g.position.set(x0,450,z0);sc.add(g);
 const b={g,x:x0,z:z0,y:450,vy:-2,air:1,ch:0,op:R(110,180),cn:g.cn,hp:100,tx:q.x,tz:q.z,wt:0,cd:R(1,2),dead:0,dt:0,w:null,sil:0,tgt:null,lt:R(0,1),st:0,sd:0,skip:null,tb:null,tg:null,ft:R(0,.65),am:0,ph:R(0,6),cr:0,dw:1,wg:null,team:0};
 // Bots caem desarmados e procuram armas no chão (botLoot), como os jogadores.
 bots.push(b);return b}
