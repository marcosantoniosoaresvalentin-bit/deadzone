/* Deadzone · features/inventory-info.js
 * Detalhes dos itens do inventário.
 */
(()=>{try{
const q=i=>document.getElementById(i),inv=q('inv');if(!inv)return;
const info=document.createElement('div');info.id='dz45i';info.innerHTML='<div class="ico" id="dz45e">👕</div><div><b id="dz45n"></b><small id="dz45d"></small></div>';inv.appendChild(info);
const eq=document.createElement('div');eq.id='dz45q';eq.textContent='✔ Equipado';inv.appendChild(eq);
renderInv=function(){const L=invT==='o'?OUT:invT==='p'?PAR:CARC,sel=invT==='o'?selO:invT==='p'?selP:selC,g=q('ig');g.innerHTML='';
 q('tO').className=invT==='o'?'on':'';q('tP').className=invT==='p'?'on':'';q('tC').className=invT==='c'?'on':'';
 L.forEach((it,i)=>{if(!owned(invT,it))return;const d=document.createElement('div');d.className='ic'+(i===sel?' on':'');d.innerHTML='<i>'+skinPrev(invT,it)+'</i>'+it.n;
  d.onclick=()=>{if(invT==='o')selO=i;else if(invT==='p')selP=i;else selC=i;try{localStorage.setItem('dzO',selO);localStorage.setItem('dzP',selP);localStorage.setItem('dzC',selC)}catch(e){}applySkins();renderInv()};g.appendChild(d)});
 const it=L[sel];q('dz45n').textContent=it?it.n:'';q('dz45d').textContent=invT==='o'?'Roupa equipada':invT==='p'?'Paraquedas equipado':'Veículo equipado';q('dz45e').textContent=invT==='o'?'👕':invT==='p'?'🪂':'🚗'};
setInterval(()=>document.body.classList.toggle('dzinv',getComputedStyle(inv).display!=='none'),120);
let vo=0;const _r=ren.render.bind(ren);ren.render=function(s,c){if(c===cam){if(document.body.classList.contains('dzinv')){c.position.set(P.x,1.15,P.z+2.5);c.lookAt(P.x,.95,P.z);c.setViewOffset(innerWidth,innerHeight,Math.round(innerWidth*.3),0,innerWidth,innerHeight);vo=1}else if(vo){c.clearViewOffset();vo=0}}_r(s,c)};
}catch(e){console.warn('dz45',e)}})();
