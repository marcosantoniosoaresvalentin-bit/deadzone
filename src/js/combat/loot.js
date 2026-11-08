/* Deadzone · combat/loot.js
 * Itens no chão (armas, kits, munição, equipamentos).
 */
// junta as peças de um modelo (arma/item) em 1 malha por material: muito menos desenhos por item no chão
function mergeModel(root){root.updateMatrixWorld(true);const inv=new T.Matrix4().copy(root.matrixWorld).invert(),by=new Map();
 root.traverse(o=>{if(!o.isMesh||!o.geometry||!o.visible||Array.isArray(o.material))return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));
  for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&k!=='uv')g.deleteAttribute(k);if(!g.attributes.normal)g.computeVertexNormals();if(!by.has(o.material))by.set(o.material,[]);by.get(o.material).push(g)});
 const out=new T.Group();for(const [m,L] of by){let n=0,uv=L.every(g=>g.attributes.uv);for(const g of L)n+=g.attributes.position.count;const P=new Float32Array(n*3),N=new Float32Array(n*3),U=uv?new Float32Array(n*2):null;let o=0;
  for(const g of L){P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);if(U)U.set(g.attributes.uv.array,o*2);o+=g.attributes.position.count}
  const ge=new T.BufferGeometry();ge.setAttribute('position',new T.BufferAttribute(P,3));ge.setAttribute('normal',new T.BufferAttribute(N,3));if(U)ge.setAttribute('uv',new T.BufferAttribute(U,2));ge.computeBoundingSphere();const me=new T.Mesh(ge,m);me.castShadow=true;out.add(me)}
 return out}
const LMC={};
function mkLoot(t,x,z,am,lv,sil){const top=new T.Group(),g=new T.Group();
 if(!WS[t]&&window.DZItem&&DZItem.has(t)){const m=DZItem(t);if(m)g.add(m)}
 else if(WS[t]){const ck=t+':'+(lv||0)+':'+(sil||0);if(!LMC[ck]){const w0=WC[ck]||(WC[ck]=mkW(t,lv,sil)),h=new T.Group();h.add(w0.clone(true));LMC[ck]=mergeModel(h)}const w=LMC[ck].clone(true);w.scale.setScalar(1.5);w.position.y=.7;g.add(w)}
 else if(t==='bandage'){const m=new T.Mesh(new T.CylinderGeometry(.2,.2,.14,12),M(0xf2f2f2));m.position.y=.5;g.add(m);const r=new T.Mesh(new T.CylinderGeometry(.21,.21,.05,12),M(0xd9382c));r.position.y=.5;g.add(r)}
 else if(t==='bp1'||t==='bp2'||t==='bp3'){const m=new T.Mesh(new T.BoxGeometry(.5,.6,.3),M(t==='bp1'?0x5a7a3a:t==='bp2'?0x2a5a9a:0x8a2a2a));m.position.y=.5;g.add(m);const p=new T.Mesh(new T.BoxGeometry(.4,.25,.1),M(0x222222));p.position.set(0,.4,.2);g.add(p)}
 else if(t==='knife'){const m=new T.Mesh(new T.BoxGeometry(.06,.03,.4),WK.sl);m.position.y=.5;g.add(m);const h=new T.Mesh(new T.BoxGeometry(.07,.04,.14),WK.wd2);h.position.set(0,.5,-.25);g.add(h)}
 else if(t==='gren'){const m=new T.Mesh(new T.SphereGeometry(.17,10,8),M(0x3a4a2a));m.position.y=.5;g.add(m);const c=new T.Mesh(new T.CylinderGeometry(.05,.05,.1,8),M(0x999999));c.position.y=.7;g.add(c)}
 else if(t==='fuel'){const m=new T.Mesh(new T.BoxGeometry(.4,.5,.2),M(0xc02a2a));m.position.y=.5;g.add(m);const c=new T.Mesh(new T.BoxGeometry(.12,.1,.1),M(0x222222));c.position.set(.1,.82,0);g.add(c)}
 else if(t==='vest'){const m=new T.Mesh(new T.BoxGeometry(.6,.62,.2),M(0x3a4a5a));m.position.y=.5;g.add(m);const p_=new T.Mesh(new T.BoxGeometry(.4,.25,.05),M(0x222c36));p_.position.set(0,.5,.12);g.add(p_)}
 else if(t==='helm'){const m=new T.Mesh(new T.SphereGeometry(.27,12,8,0,Math.PI*2,0,Math.PI/2),M(0x4a5a3a));m.position.y=.5;g.add(m);const b_=new T.Mesh(new T.CylinderGeometry(.28,.28,.04,12),M(0x2a3320));b_.position.y=.5;g.add(b_)}
 else if(t==='smoke'){const m=new T.Mesh(new T.CylinderGeometry(.08,.08,.26,10),M(0x9aa0a6));m.position.y=.5;g.add(m);const c=new T.Mesh(new T.CylinderGeometry(.05,.05,.06,8),M(0x333333));c.position.y=.66;g.add(c)}
 else if(t==='sil'){const m=new T.Mesh(new T.CylinderGeometry(.05,.05,.3,10),M(0x222222));m.rotation.z=Math.PI/2;m.position.y=.5;g.add(m)}
 else if(t==='scope1'||t==='scope2'||t==='scope8'){const m=new T.Mesh(new T.CylinderGeometry(.09,.09,t==='scope8'?.65:t==='scope2'?.5:.3,10),M(0x1a1a1a));m.rotation.z=Math.PI/2;m.position.y=.5;g.add(m)}
 else{const m=new T.Mesh(new T.BoxGeometry(.5,.35,.4),M(t==='med'?0xf2f2f2:0x6b7a3a));m.position.y=.5;g.add(m);
  if(t==='med'){for(const [w,d] of[[.3,.1],[.1,.3]]){const c=new T.Mesh(new T.BoxGeometry(w,.06,d),M(0xd9382c));c.position.y=.69;g.add(c)}}}
 const r=new T.Mesh(new T.RingGeometry(.55,.65,20),new T.MeshBasicMaterial({color:0xffd34d,transparent:true,opacity:.35,side:T.DoubleSide}));r.rotation.x=-Math.PI/2;r.position.y=.08;
 g.rotation.y=Math.random()*6.283;if(WS[t])g.rotation.z=(Math.random()<.5?1:-1)*Math.PI/2;else if(t==='vest')g.rotation.x=Math.PI/2;
 top.add(g);top.updateMatrixWorld(true);{const bb=new T.Box3();g.traverse(o_=>{if(o_.isMesh&&o_.visible)bb.expandByObject(o_)});if(bb.min.y<1e8)g.position.y-=bb.min.y-.02}
 top.add(r);top.position.set(x,GY(x,z,mkLoot.y!==undefined?mkLoot.y:P.y),z);sc.add(top);loot.push({y:top.position.y,top,g,t,x,z,am,sc:lv,sil,id:++lid})}
const lt=['rifle','rifle','rifle','rifle','rifle','rifle','rifle','rifle','shotgun','shotgun','shotgun','shotgun','shotgun','pistol','pistol','pistol','pistol','pistol','sniper','sniper','sniper','bow','bow','med','med','med','med','bandage','bandage','bandage','bandage','bandage','bandage','ammo','ammo','ammo','ammo','ammo','scope1','scope1','scope2','scope2','scope2','scope8','sil','sil','knife','gren','gren','gren','gren','smoke','smoke','smoke','fuel','fuel','bp1','bp1','bp1','bp2','bp2','bp3','vest','vest','vest','vest','helm','helm','helm','helm'];
// cada ponto de loot gera 1 a 3 itens; arma sempre vem com munição perto
const LOOT_ATT=['scope1','scope2','scope2','sil','scope8'];
// loot FORTE (Ilha Zênite / arranha-céu): mais armas boas, colete, capacete, mochila grande e mira
const ltRich=['rifle','rifle','rifle','sniper','sniper','shotgun','rifle','sniper','vest','vest','helm','helm','bp3','bp2','scope8','scope2','scope2','med','med','gren','gren','ammo','ammo','sil'];
function spawnSpot(sp){const T_=sp.rich?ltRich:lt,pick=()=>T_[Math.floor(R(0,T_.length))],at=(t,dx,dz)=>mkLoot(t,sp.x+dx,sp.z+dz,null,sp.rich&&WS[t]?1:0);mkLoot.y=sp.y!=null?sp.y+.6:undefined;const t=pick();at(t,0,0);
 if(WS[t]){at('ammo',R(-.7,.7),R(.4,.8));if(Math.random()<.55)at('ammo',R(-.7,.7),R(-.8,-.4));if(Math.random()<.3)at(LOOT_ATT[Math.floor(R(0,LOOT_ATT.length))],R(.5,.9),R(-.5,.5))}
 if(Math.random()<(sp.rich?.8:.45)){const u=pick();at(u,R(-1,-.5),R(-.6,.6));if(WS[u])at('ammo',R(-1.2,-.8),R(.5,.9))}mkLoot.y=undefined;
 // itens parados: não recalcula a posição a cada quadro
 for(const o of loot)if(o.top.matrixAutoUpdate){o.top.updateMatrixWorld(true);o.top.traverse(q=>{q.updateMatrix();q.matrixAutoUpdate=false})}}
for(const sp of LS)spawnSpot(sp);
for(const c of CARS)if(Math.random()<.35)mkLoot('fuel',c.x+3.2,c.z+1);
