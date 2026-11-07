/* Deadzone · features/party-queue.js
 * Fila de pareamento do grupo.
 */
(()=>{const q=window.queue;if(typeof q!=='function')return;window.queue=function(m,need,done){const G=window.dzPartyGO;
 if(m==='classic'&&G&&G.at&&Date.now()-G.at<25000){window.dzPartyGO=null;window.dzAllies=new Set((G.allies||[]).filter(x=>x!==mpId));window.dzRealAllies=window.dzAllies.size;
  const QO=document.getElementById('qo');if(QO)QO.style.display='none';
  setTimeout(()=>{done(G.ids,G.mid,G.seed,G.city,G.names||{});setTimeout(()=>{try{for(const id of window.dzAllies){const e=CL[id];if(e)e.g.children.forEach(ch=>{if(ch.geometry&&ch.geometry.type==='SphereGeometry'&&ch.position.y>2)ch.material.color.set(0x3a82ff)})}}catch(_){}},500)},300);return}
 return q.apply(this,arguments)}})();
