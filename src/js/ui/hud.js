/* Deadzone · ui/hud.js
 * HUD: slots de arma, mochila rápida, recarga e coleta de itens.
 */
function say(t,s){msg.textContent=t;mt=s}
const BIG=t=>t==='rifle'||t==='shotgun'||t==='sniper',lpd=$('lpd'),bg_=$('bag'),bre=$('br'),sce=$('sc');
const IC={
rifle:'<svg viewBox="0 0 64 24"><rect x="1" y="8" width="13" height="7" rx="1"/><rect x="14" y="7" width="20" height="7"/><rect x="16" y="3" width="14" height="3"/><rect x="34" y="8" width="16" height="5"/><rect x="50" y="9" width="12" height="2"/><path d="M22 14h5l-1 9h-5z"/><path d="M15 14h4l-1 7h-4z"/></svg>',
shotgun:'<svg viewBox="0 0 64 24"><rect x="1" y="9" width="14" height="7" rx="1"/><rect x="15" y="9" width="16" height="5"/><rect x="31" y="8" width="32" height="3"/><rect x="31" y="12" width="20" height="4" rx="1"/></svg>',
pistol:'<svg viewBox="0 0 64 24"><rect x="14" y="5" width="34" height="7" rx="1"/><path d="M16 12h12l-3 11h-8z"/><rect x="48" y="7" width="6" height="3"/></svg>',
bandage:'<svg viewBox="0 0 64 24"><circle cx="32" cy="12" r="10"/><circle cx="32" cy="12" r="4" fill="#000" fill-opacity=".45"/></svg>',
med:'<svg viewBox="0 0 64 24"><rect x="14" y="3" width="36" height="19" rx="3"/><path d="M30 6h4v5h5v4h-5v5h-4v-5h-5v-4h5z" fill="#d9382c"/></svg>',
scope1:'<svg viewBox="0 0 64 24"><rect x="18" y="7" width="28" height="12" rx="2"/><circle cx="32" cy="12" r="3" fill="#ff2a2a"/></svg>',
scope2:'<svg viewBox="0 0 64 24"><rect x="6" y="8" width="52" height="8" rx="3"/><rect x="2" y="6" width="8" height="12" rx="2"/><rect x="54" y="6" width="8" height="12" rx="2"/></svg>',
sil:'<svg viewBox="0 0 64 24"><rect x="8" y="8" width="48" height="9" rx="3"/><rect x="2" y="10" width="8" height="5"/></svg>',
ammo:'<svg viewBox="0 0 64 24"><rect x="14" y="6" width="8" height="16" rx="2"/><rect x="28" y="6" width="8" height="16" rx="2"/><rect x="42" y="6" width="8" height="16" rx="2"/></svg>'};
IC.sniper='<svg viewBox="0 0 64 24"><rect x="1" y="9" width="14" height="6"/><rect x="15" y="9" width="22" height="5"/><rect x="37" y="10" width="26" height="2"/><rect x="20" y="4" width="16" height="4" rx="1"/></svg>';
IC.knife='<svg viewBox="0 0 64 24"><path d="M10 14l30-6 12 4-12 4z"/><rect x="2" y="10" width="10" height="6" rx="2"/></svg>';
IC.gren='<svg viewBox="0 0 64 24"><circle cx="32" cy="14" r="8"/><rect x="29" y="2" width="6" height="6"/></svg>';
IC.fuel='<svg viewBox="0 0 64 24"><rect x="22" y="3" width="20" height="19" rx="2"/><rect x="36" y="1" width="6" height="4" fill="#000" fill-opacity=".4"/></svg>';IC.scope8=IC.scope2;IC.bp1=IC.bp2=IC.bp3='<svg viewBox="0 0 64 24"><rect x="22" y="2" width="20" height="20" rx="5"/><rect x="26" y="12" width="12" height="6" fill="#000" fill-opacity=".4"/></svg>';
const LN={bp1:'Mochila Nv.1',bp2:'Mochila Nv.2',bp3:'Mochila Nv.3',sniper:'Sniper',knife:'Faca',gren:'Granada',fuel:'Galão de gasolina',scope8:'Luneta 8x',rifle:'M4A1',shotgun:'Escopeta',pistol:'Pistola',med:'Kit médico',bandage:'Bandagem',ammo:'Munição',scope1:'Luneta 1x',scope2:'Luneta 2x',sil:'Silenciador'},LC={bp1:'#7aa84a',bp2:'#4a8ad9',bp3:'#d94a4a',sniper:'#d0d070',knife:'#cfd3d8',gren:'#7a9a4a',fuel:'#e04a3a',scope8:'#d98ad9',rifle:'#e0a050',shotgun:'#c97b4a',pistol:'#8fb4d9',med:'#e86a5f',bandage:'#f2f2f2',ammo:'#9bc86a',scope1:'#d96a6a',scope2:'#b58ad9',sil:'#7fd6d0'};
function drawSlots(){const nm=['Arma 1','Arma 2','Pistola'];let h='';for(let i=0;i<3;i++){const s=slots[i];h+='<div data-i="'+i+'" class="'+(i===cur?'on':'')+'">'+(s?IC[s.t]+'<small>'+s.mag+'/'+s.res+(s.sc?' · '+(s.sc===3?8:s.sc)+'x':'')+(s.sil?' · S':'')+'</small>':'<small style="opacity:.55">'+nm[i]+'</small>')+'</div>'}if(h!==sltxt){sltxt=h;sl.innerHTML=h}}
function drawBag(){const h=[['band','bandage'],['med','med'],['ammo','ammo']].filter(p=>bag[p[0]]>0).map(p=>'<div data-k="'+p[0]+'">'+IC[p[1]]+'<small>x'+bag[p[0]]+'</small></div>').join('');bg_.innerHTML=h}
function selSlot(i){TS=0;GA=null;rlOn=0;rl=0;if(i===cur)cur=-1;else if(slots[i]){cur=i;dw=0}drawSlots()}
sl.onpointerdown=e=>{const d=e.target.closest('div[data-i]');if(d){e.preventDefault();selSlot(+d.dataset.i)}};
bg_.onpointerdown=e=>{const d=e.target.closest('div[data-k]');if(d){e.preventDefault();useItem(d.dataset.k)}};
function startReload(){const s=cur>=0?slots[cur]:null;if(!s||rlOn||cast||mode!=='ground')return;if(s.res<=0&&bag.ammo>0){bag.ammo--;s.res+=WS[s.t].mag*2;drawBag()}if(s.res<=0){say('Sem munição reserva',1.5);return}if(s.mag>=WS[s.t].mag){say('Carregador cheio',1.5);return}rlOn=1;rlT=0;say('Recarregando...',1)}
function useItem(k){if(k==='ammo'){startReload();return}if(k==='fuel'){refuel();return}if(k==='smoke'||k==='gren'||k==='knife')return;if(cast||mode!=='ground'||!bag[k])return;if(hp>=100){say('Vida cheia',1.5);return}rlOn=0;rl=0;cast={k,t:k==='band'?3:6}}
bre.onpointerdown=e=>{e.preventDefault();startReload()};
$('lpx').onpointerdown=e=>{e.preventDefault();lhid=1;lkey=''};lpd.onpointerdown=e=>{e.preventDefault();lhid=0;lkey=''};
function refreshLoot(){const near=mode==='ground'&&!MP?loot.filter(o=>Math.hypot(o.x-P.x,o.z-P.z)<2.4&&Math.abs((o.y||0)-P.y)<3):[];
 const key=(lhid?'h':'')+near.map(o=>o.id).join(',');if(key===lkey)return;lkey=key;
 if(!near.length){lpn.style.display='none';lpd.style.display='none';return}
 if(lhid){lpn.style.display='none';lpd.style.display='block';return}
 lpd.style.display='none';lpn.style.display='block';lpg.innerHTML='';
 for(const o of near.slice(0,60)){const b=document.createElement('button');b.innerHTML=IC[o.t]+LN[o.t];b.style.borderColor=LC[o.t];b.onclick=()=>take(o);lpg.appendChild(b)}}
function take(o){if(o.tk||loot.indexOf(o)<0)return;o.tk=1;take_(o);if(loot.indexOf(o)>=0)o.tk=0}
const TK={med:['med','Kit médico'],bandage:['band','Bandagem'],knife:['knife','Faca'],gren:['gren','Granada',2],fuel:['fuel','Galão de gasolina'],ammo:['ammo','Munição'],scope1:['sc1','Luneta 1x'],scope2:['sc2','Luneta 2x'],scope8:['sc3','Luneta 8x'],sil:['sil','Silenciador']};
function take_(o){const t=o.t,k=TK[t];
 if(k){if(ATT.includes(k[0])&&autoAtt(k[0])){}else{if(t==='knife'&&bag.knife){say('Você já tem uma faca',2);return}if(!addBag(k[0],k[2]||1,'Guardou na mochila: '+k[1]))return}}
 else if(t==='vest'||t==='helm'){const nd=o.am&&o.am.d?o.am.d:100;if(ARM[t]>=nd){say('Você já tem '+(t==='vest'?'um colete':'um capacete')+' igual ou melhor',2);return}if(ARM[t]>5)mkLoot(t,P.x+R(-.8,.8),P.z+R(-.8,.8),{d:ARM[t]});ARM[t]=nd;say('Equipou: '+LN[t],2);updArm()}
 else if(t==='bp1'||t==='bp2'||t==='bp3'){const lv=+t[2];if(lv<=bagLv){say('Você já tem mochila igual ou melhor',2);return}if(bagLv>0)mkLoot('bp'+bagLv,P.x+R(-.8,.8),P.z+R(-.8,.8));bagLv=lv;drawBag();say('Mochila nível '+lv+' equipada',2)}
 else{const big=BIG(o.t),idx=big?[0,1].find(i=>!slots[i]):(!slots[2]?2:undefined),nw={t:o.t,mag:o.am?o.am.mag:WS[o.t].mag,res:o.am?o.am.res:WS[o.t].mag*2,sc:o.sc||0,sil:o.sil||0};
  if(idx!==undefined){slots[idx]=nw;if(cur<0){cur=idx;dw=0}say('Pegou: '+LN[o.t],2)}
  else{const ok=cur>=0&&(big?cur<2:cur===2);
   if(!ok){say(big?'Segure uma arma grande para trocar':'Segure a pistola para trocar',2.5);return}
   const old=slots[cur];mkLoot(old.t,P.x+R(-.8,.8),P.z+R(-.8,.8),{mag:old.mag,res:old.res},old.sc,old.sil);
   slots[cur]=nw;rlOn=0;rl=0;say('Trocou por '+LN[o.t],2)}}
 sc.remove(o.top);loot.splice(loot.indexOf(o),1);lkey='';drawSlots()}
