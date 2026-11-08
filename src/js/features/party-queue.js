/* Deadzone · features/party-queue.js
 * Fila de pareamento do grupo.
 */
// nome do parceiro de equipe em cima da cabeça (azul), visível de longe
function allyTags(G){const nm=G.names||{};for(const id of (window.dzAllies||[])){const e=CL[id];if(!e||e.g.userData.tag)continue;
 const cv=document.createElement('canvas');cv.width=256;cv.height=64;const x=cv.getContext('2d');x.font='bold 30px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';
 const t=String(nm[id]||'Parceiro').slice(0,16);x.fillStyle='rgba(10,40,90,.75)';const w=Math.min(250,x.measureText(t).width+28);x.fillRect(128-w/2,10,w,44);x.fillStyle='#7fc0ff';x.fillRect(128-w/2,50,w,4);x.fillStyle='#fff';x.fillText(t,128,32);
 const sp=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(cv),depthTest:false,transparent:true}));sp.scale.set(1.6,.4,1);sp.position.y=2.35;sp.renderOrder=20;e.g.add(sp);e.g.userData.tag=sp;e.ally=1}}
window.allyTags=allyTags;
(()=>{const q=window.queue;if(typeof q!=='function')return;window.queue=function(m,need,done){const G=window.dzPartyGO;
 if(m==='classic'&&G&&G.at&&Date.now()-G.at<25000){window.dzPartyGO=null;window.dzAllies=new Set((G.allies||[]).filter(x=>x!==mpId));window.dzRealAllies=window.dzAllies.size;
  const QO=document.getElementById('qo');if(QO)QO.style.display='none';
  setTimeout(()=>{done(G.ids,G.mid,G.seed,G.city,G.names||{});try{allyTags(G)}catch(_){}setTimeout(()=>{try{for(const id of window.dzAllies){const e=CL[id];if(e)e.g.children.forEach(ch=>{if(ch.geometry&&ch.geometry.type==='SphereGeometry'&&ch.position.y>2)ch.material.color.set(0x3a82ff)})}}catch(_){}},500)},300);return}
 return q.apply(this,arguments)}})();
