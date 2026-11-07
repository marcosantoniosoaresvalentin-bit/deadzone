/* Deadzone · features/outfit-slots.js
 * Peças de roupa por parte do corpo.
 */
(()=>{try{
const q=i=>document.getElementById(i),inv=q('inv');if(!inv||typeof T==='undefined')return;
const MAT={helm:'hl',vest:'vs',back:'bg',shirt:'ol',pants:'pt',boots:'bt'},DEF={helm:0x3b4430,vest:0x2f3828,back:0x4d5a3a,shirt:0x55663f,pants:0x4f5640,boots:0x1c1c1c};
const SLOTS=['helm','vest','back','shirt','pants','boots'],NM={helm:'Capacete',vest:'Colete',back:'Mochila',shirt:'Camisa',pants:'Calça',boots:'Sapatos'};
const SV={helm:'<path d="M8 36c0-14 8-24 24-24s24 10 24 24v6H8z"/><rect x="4" y="40" width="56" height="7" rx="2"/>',vest:'<path d="M16 8l10 4h12l10-4 6 10-6 8v30H16V26l-6-8z"/>',back:'<rect x="14" y="8" width="36" height="48" rx="9"/><rect x="20" y="34" width="24" height="14" rx="3" fill="#0006"/><rect x="20" y="4" width="24" height="7" rx="3"/>',shirt:'<path d="M20 8l12 5 12-5 14 10-8 10-6-4v28H20V24l-6 4-8-10z"/>',pants:'<path d="M16 6h32l4 52H36l-4-30-4 30H12z"/>',boots:'<path d="M12 8h18v28l22 8v12H12z"/>'};
const ico=(s,c)=>'<svg viewBox="0 0 64 64" fill="'+hxc(c)+'">'+SV[s]+'</svg>';
const mk=(p,s,a)=>a.map((x,i)=>({id:p+i,n:x[0],c:i?x[1]:DEF[s],cost:i?x[2]:0,sh:x[3]}));
const KIT={
helm:mk('hm','helm',[['Capacete Padrão'],['Capacete Preto',0x1c1c20,100],['Capacete Deserto',0x9a8458,100],['Capacete com Visor',0x2f3828,200,'visor'],['Capacete Ártico',0xd6dde4,250,'ears'],['Boné Tático',0x3a4a2a,150,'brim']]),
vest:mk('vs','vest',[['Colete Padrão'],['Colete Preto',0x1e2024,100],['Colete Deserto',0x8a7448,100],['Colete Azul',0x1f3d73,150],['Colete Blindado',0x3a3d42,250,'plate']]),
back:mk('bk','back',[['Mochila Padrão'],['Mochila Camuflada',0x3b4a33,100],['Mochila Areia',0xa8895a,120,'big'],['Mochila Vermelha',0xa02a2a,150,'tac'],['Mochila Azul',0x2a62c8,150,'big'],['Mochila Roxa',0x7a35c8,200],['Mochila Laranja',0xe0801a,200,'tac']]),
shirt:mk('sh','shirt',[['Camisa Padrão'],['Camisa Cinza',0x5a5f66,80],['Camisa Areia',0xb59a6a,80],['Camisa Branca',0xd6dde4,120],['Camisa Vermelha',0xa02a2a,150],['Camisa Azul',0x2a62c8,150]]),
pants:mk('pt','pants',[['Calça Padrão'],['Calça Preta',0x24262a,80],['Calça Deserto',0x9a8458,80],['Calça Cinza',0x4a4f55,100],['Calça Jeans',0x2c4a7a,120]]),
boots:mk('bo','boots',[['Sapato Padrão'],['Bota Marrom',0x5a3a1e,80],['Tênis Branco',0xe8e8e8,120],['Bota Vermelha',0x8a1e1e,150],['Bota Azul',0x1f3d8a,150]])};
const OF={helm:'hl',vest:'dk',shirt:'ol',pants:'pt'};
for(const s in OF)OUT.forEach((o,i)=>{if(i)KIT[s].push({id:'d_'+s+'_'+o.id,n:NM[s]+' '+o.n,c:o[OF[s]],cost:Math.max(40,Math.round((o.cost||120)/30)*10),lg:'o:'+o.id})});
let K={};
const load=()=>{let m={};try{m=JSON.parse(localStorage.getItem('dzK2')||'null')||{}}catch(e){}
 if(!localStorage.getItem('dzK2')&&selO>0){const o=OUT[selO];for(const s in OF)m[s]='d_'+s+'_'+o.id}
 for(const s of SLOTS){let i=KIT[s].findIndex(x=>x.id===m[s]);if(i<0||!owned('k',KIT[s][i]))i=0;K[s]=i}};
const commit=()=>{selO=0;try{localStorage.setItem('dzO',0);localStorage.setItem('dzP',selP);localStorage.setItem('dzC',selC);const m={};for(const s of SLOTS)m[s]=KIT[s][K[s]].id;localStorage.setItem('dzK2',JSON.stringify(m))}catch(e){}};
const revert=()=>{try{selP=+localStorage.getItem('dzP')||0;selC=+localStorage.getItem('dzC')||0}catch(e){}load();applySkins()};
load();selO=0;
// peças extras 3D
const EXs=[],B=(a,b,c)=>new T.BoxGeometry(a,b,c),vm=new T.MeshBasicMaterial({color:0x52e8ff});
const add=(sl,sh,par,g,m,x,y,z,rz)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);if(rz)o.rotation.z=rz;o.visible=false;o.castShadow=true;par.add(o);EXs.push([sl,sh,o])};
add('helm','visor',head,B(.3,.07,.05),vm,0,0,.15);add('helm','ears',head,B(.05,.1,.1),PM.hl,.16,0,0);add('helm','ears',head,B(.05,.1,.1),PM.hl,-.16,0,0);add('helm','brim',head,B(.28,.02,.16),PM.hl,0,.07,.2);
add('vest','plate',tor,B(.3,.22,.05),PM.vs,0,.36,.19);
add('back','big',tor,B(.5,.3,.2),PM.bg,0,-.06,-.3);add('back','big',tor,B(.52,.08,.26),PM.bg,0,.64,-.27);
add('back','tac',tor,B(.14,.2,.16),PM.bg,.34,.2,-.27);add('back','tac',tor,B(.14,.2,.16),PM.bg,-.34,.2,-.27);add('back','tac',tor,new T.CylinderGeometry(.07,.07,.46,8),PM.kh,0,-.02,-.4,Math.PI/2);
function applyKit(){for(const s of SLOTS)PM[MAT[s]].color.copy(lin(KIT[s][K[s]].c));for(const[s,sh,o]of EXs)o.visible=KIT[s][K[s]].sh===sh}
const _as=applySkins;applySkins=function(){_as();applyKit()};commit();applySkins();
// interface
let SLOT='helm',MODE='inv';
window.dzOpenInv=m=>{MODE=m;revert();q('invb').click()};
const sw=document.createElement('div');sw.id='dz46s';inv.appendChild(sw);
sw.onclick=e=>{const b=e.target.closest('button');if(!b)return;SLOT=b.dataset.s;renderInv()};
const cb=document.createElement('div');cb.id='dz46c';inv.appendChild(cb);
const rot=document.createElement('div');rot.id='dz46rot';inv.insertBefore(rot,inv.firstChild);
let dr=0,dx=0;rot.addEventListener('pointerdown',e=>{dr=1;dx=e.clientX;try{rot.setPointerCapture(e.pointerId)}catch(x){}});
rot.addEventListener('pointermove',e=>{if(dr){lobRot+=(e.clientX-dx)*.012;dx=e.clientX}});
const up=()=>{dr=0};rot.addEventListener('pointerup',up);rot.addEventListener('pointercancel',up);
const ctx=()=>invT==='p'?{t:'p',L:PAR,get:()=>selP,set:i=>selP=i,sv:'dzP'}:invT==='c'?{t:'c',L:CARC,get:()=>selC,set:i=>selC=i,sv:'dzC'}:{t:'k',L:KIT[SLOT],get:()=>K[SLOT],set:i=>K[SLOT]=i};
const svIdx=c=>{try{if(c.t!=='k')return +localStorage.getItem(c.sv)||0;const m=JSON.parse(localStorage.getItem('dzK2')||'{}'),i=c.L.findIndex(x=>x.id===m[SLOT]);return i<0?0:i}catch(e){return 0}};
q('invx').addEventListener('click',revert);
const prev=(c,it)=>c.t==='k'?'<b style="background:#0a1a2e;display:flex;align-items:center;justify-content:center"><span style="width:60%;height:90%;display:block">'+ico(SLOT,it.c)+'</span></b>':skinPrev(c.t,it);
renderInv=function(){const c=ctx(),L=c.L,sel=c.get(),sv=svIdx(c),g=q('ig'),eq=q('dz45q'),st=MODE==='store';g.innerHTML='';
 inv.querySelector('.ih b').textContent=st?'Loja':'Inventário';
 q('tO').className=invT==='o'?'on':'';q('tP').className=invT==='p'?'on':'';q('tC').className=invT==='c'?'on':'';
 sw.style.display=invT==='o'?'flex':'none';sw.innerHTML=SLOTS.map(s=>'<button data-s="'+s+'" title="'+NM[s]+'" class="'+(s===SLOT?'on':'')+'">'+ico(s,KIT[s][K[s]].c)+'</button>').join('');cb.textContent='🪙 '+(PR.coins||0);
 let n=0;L.forEach((it,i)=>{const ow=owned(c.t,it);if(st?ow:!ow)return;n++;const d=document.createElement('div');d.className='ic'+(i===sel?' on':'');
  d.innerHTML='<i>'+prev(c,it)+'</i>'+it.n+'<small>'+(st?'💰 '+it.cost:i===sv?'✔ Equipado':'&nbsp;')+'</small>';
  d.onclick=()=>{c.set(i);applySkins();renderInv()};g.appendChild(d)});
 if(!n)g.innerHTML='<p style="grid-column:1/-1;text-align:center;opacity:.8;font-size:max(11px,2.6vh)">'+(st?'Você já tem tudo desta categoria!':'Nada comprado aqui ainda. Compre na Loja!')+'</p>';
 const it=L[sel],ow=it&&owned(c.t,it);q('dz45n').textContent=it?it.n:'';q('dz45d').textContent=invT==='o'?NM[SLOT]:invT==='p'?'Paraquedas':'Veículo';q('dz45e').innerHTML=invT==='o'?'<span style="display:block;width:calc(60*var(--u));height:calc(60*var(--u))">'+ico(SLOT,it.c)+'</span>':invT==='p'?'🪂':'🚗';
 eq.textContent=st?(it&&!ow?'🔒 Comprar 💰 '+it.cost:'Toque num item'):(ow?(sel===sv?'✔ Equipado':'Equipar'):'—')};
q('dz45q').onclick=()=>{const c=ctx(),it=c.L[c.get()],eq=q('dz45q');if(!it)return;
 if(MODE==='store'){if(owned(c.t,it))return;if((PR.coins||0)<it.cost){eq.textContent='Faltam '+(it.cost-PR.coins)+' 💰';return}PR.coins-=it.cost;PR.unl.push(skinKey(c.t,it));savePR();updPn();revert();renderInv();return}
 if(!owned(c.t,it))return;commit();applySkins();renderInv()};
}catch(e){console.warn('dz46',e)}})();
