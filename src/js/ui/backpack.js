/* Deadzone · ui/backpack.js
 * Inventário completo e acessórios das armas.
 */
const W={band:1,med:2,fuel:3,gren:1,knife:1,ammo:1,sc1:2,sc2:3,sc3:4,sil:2},CAPS=[8,20,34,50],BN={band:'Bandagem',med:'Kit médico',fuel:'Galão',gren:'Granada',knife:'Faca',ammo:'Munição',sc1:'Luneta 1x',sc2:'Luneta 2x',sc3:'Luneta 8x',sil:'Silenciador'},ICK={band:'bandage',med:'med',fuel:'fuel',gren:'gren',knife:'knife',ammo:'ammo',sc1:'scope1',sc2:'scope2',sc3:'scope8',sil:'sil'};let bagLv=0;
const bagUsed=()=>Object.keys(W).reduce((a,k)=>a+W[k]*(bag[k]||0),0);
function addBag(k,n,m){if(bagUsed()+W[k]*n>CAPS[bagLv]){say('Mochila cheia'+(bagLv<3?' · ache uma maior':''),2.2);return 0}bag[k]+=n;drawBag();say(m,2);return 1}
const ATT=['sc1','sc2','sc3','sil'];
function attOK(k,q){const lv=k==='sc1'?1:k==='sc2'?2:k==='sc3'?3:0;return !!q&&(k==='sil'?q.t!=='shotgun':lv===3?q.t==='sniper':(q.t==='rifle'||q.t==='sniper'||(q.t==='bow'&&lv===1)))}
function autoAtt(k){const ord=[cur,0,1,2].filter((v,i,a)=>v>=0&&a.indexOf(v)===i);for(const i of ord){const q=slots[i];if(!attOK(k,q))continue;if(k==='sil'?q.sil:q.sc)continue;if(k==='sil')q.sil=1;else q.sc=+k[2];drawSlots();if($('pk').style.display==='flex')renderPk();say('Equipado automaticamente: '+BN[k],2);return 1}return 0}
function equipTo(k,i){const q=slots[i];if(!q){say('Slot vazio',1.5);return}if(!attOK(k,q)){say(k==='sc3'?'Luneta 8x só serve na Sniper':k==='sil'?'Não serve nesta arma':'Esta luneta não serve nesta arma',2);return}if(!bag[k])return;bag[k]--;if(k==='sil'){if(q.sil)bag.sil++;q.sil=1}else{if(q.sc)bag['sc'+q.sc]++;q.sc=+k[2]}say('Equipado: '+BN[k],1.5);drawBag();drawSlots();renderPk()}
function equipAtt(k){const lv=k==='sc1'?1:k==='sc2'?2:k==='sc3'?3:0,ok=q=>q&&(k==='sil'?q.t!=='shotgun':lv===3?q.t==='sniper':(q.t==='rifle'||q.t==='sniper'||(q.t==='bow'&&lv===1)));
 const i=(cur>=0&&ok(slots[cur]))?cur:[0,1,2].find(j=>ok(slots[j]));if(i===undefined){say(lv===3?'Luneta 8x só serve na Sniper':'Sem arma compatível',2);return}
 const q=slots[i];bag[k]--;if(k==='sil'){if(q.sil)bag.sil++;q.sil=1}else{if(q.sc)bag['sc'+q.sc]++;q.sc=lv}say('Equipado: '+BN[k],1.5)}
function renderPk(){const nm=['Arma principal 1','Arma principal 2','Pistola'];let w='';
 for(let i=0;i<3;i++){const q=slots[i];w+='<div data-w="'+i+'" class="pw'+(q?'':' em')+(i===cur?' on':'')+'"><small>'+nm[i]+'</small>'+(q?IC[q.t]+'<b>'+(window.wNm?wNm(q):WS[q.t].n)+'</b><span>'+q.mag+' / '+q.res+'</span><div>'+(q.sc?'<button data-u="sc'+q.sc+'" data-i="'+i+'">🔭 '+(q.sc===3?8:q.sc)+'x ✕</button>':'')+(q.sil?'<button data-u="sil" data-i="'+i+'">🔇 ✕</button>':'')+'<button data-x="'+i+'">Soltar</button></div>':'<em>vazio</em>')+'</div>'}
 w+='<div class="pw"><small>Armadura</small><b>🛡 '+Math.round(ARM.vest)+' · ⛑ '+Math.round(ARM.helm)+'</b><div>'+(ARM.vest>0?'<button data-r="vest">Soltar colete</button>':'')+(ARM.helm>0?'<button data-r="helm">Soltar capacete</button>':'')+'</div></div>';
 if(MP)w+='<div class="pw"><small>Arremessáveis</small><b>💣 x'+bag.gren+' · 🧊 x'+bag.gel+'</b></div>';
 $('pkw').innerHTML=w;let g='';const L={band:'Usar',med:'Usar',fuel:'Abastecer',gren:0,smoke:0,ammo:'Recarregar',sc1:0,sc2:0,sc3:0,sil:0};
 for(const k in W)if(bag[k]>0)g+='<div data-a="'+(ATT.includes(k)?k:'')+'" class="pc'+(ATT.includes(k)?' dg':'')+'" style="border-color:'+(LC[ICK[k]]||'#3a4a35')+'"><i>x'+bag[k]+'</i>'+IC[ICK[k]]+'<b>'+BN[k]+'</b><small>'+W[k]*bag[k]+' kg</small>'+(ATT.includes(k)?'<small>segure e arraste até a arma</small>':'')+(L[k]?'<button data-e="'+k+'">'+L[k]+'</button>':'')+'<button data-d="'+k+'">Soltar</button></div>';
 $('pki').innerHTML=g||'<small>Mochila vazia</small>';$('pkc').textContent=bagUsed()+'/'+CAPS[bagLv]+' · Nv.'+bagLv;$('pkbi').style.width=Math.min(100,bagUsed()/CAPS[bagLv]*100)+'%'}
$('pk').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='pkx'){$('pk').style.display='none';return}
 if(b.dataset.x!=null)dropW(+b.dataset.x);else if(b.dataset.d)dropItem(b.dataset.d);else if(b.dataset.r)dropArm(b.dataset.r);else if(b.dataset.u){const q=slots[+b.dataset.i],k=b.dataset.u;if(bagUsed()+W[k]>CAPS[bagLv])say('Mochila cheia',2);else{bag[k]++;if(k==='sil')q.sil=0;else q.sc=0}}
 else if(b.dataset.e){const k=b.dataset.e;if(k[0]==='s')equipAtt(k);else if(k==='band'||k==='med')useItem(k);else if(k==='fuel')refuel();else if(k==='ammo')startReload()}
 drawBag();drawSlots();renderPk()};
{let D=null,gh=null,hl=null;const clr=()=>{if(hl){hl.classList.remove('dt');hl=null}};
 const tgt=(x,y)=>{if(gh)gh.style.display='none';const e=document.elementFromPoint(x,y);if(gh)gh.style.display='block';return e?e.closest('.pw[data-w]'):null};
 $('pk').addEventListener('pointerdown',e=>{const c=e.target.closest('.pc.dg');if(!c||!c.dataset.a)return;e.preventDefault();D={k:c.dataset.a,id:e.pointerId,x:e.clientX,y:e.clientY,on:0};try{c.setPointerCapture(e.pointerId)}catch(_){}});
 $('pk').addEventListener('pointermove',e=>{if(!D||e.pointerId!==D.id)return;if(!D.on){if(Math.hypot(e.clientX-D.x,e.clientY-D.y)<8)return;D.on=1;gh=document.createElement('div');gh.id='dgh';gh.innerHTML=IC[ICK[D.k]]+'<b>'+BN[D.k]+'</b>';document.body.appendChild(gh)}
  gh.style.left=e.clientX+'px';gh.style.top=e.clientY+'px';const t=tgt(e.clientX,e.clientY);if(t!==hl){clr();if(t){t.classList.add('dt');hl=t}}});
 const end=e=>{if(!D||e.pointerId!==D.id)return;const d=D;D=null;if(!d.on)return;const t=e.type==='pointerup'?tgt(e.clientX,e.clientY):null;clr();if(gh){gh.remove();gh=null}if(t)equipTo(d.k,+t.dataset.w)};
 $('pk').addEventListener('pointerup',end);$('pk').addEventListener('pointercancel',end)}
