/* Deadzone · ui/settings.js
 * Configurações e editor de posição dos botões.
 */
let CFG={auto:0,autoDoor:0,sens:1,lay:{}};try{Object.assign(CFG,JSON.parse(localStorage.getItem('dzCfg')||'{}'))}catch(e){}
const saveCfg=()=>{try{localStorage.setItem('dzCfg',JSON.stringify(CFG))}catch(e){}};
const bf2=$('bf2'),BTN=[['bj','Pular'],['bc','Agachar'],['bp','Deitar'],['bf','Atirar'],['bf2','Atirar 2'],['bm','Mirar'],['br','Recarregar'],['bo','Porta'],['bi','Mochila'],['bg','Granada'],['bgl','Gel'],['bv','Carro'],['bu','Abastecer']];
function applyLay(){for(const [id] of BTN){const e=$(id),a=CFG.lay[id];if(a){e.style.right=e.style.bottom='auto';e.style.left=a.x+'vw';e.style.top=a.y+'vh';e.style.transform='scale('+a.s+') translate(-50%,-50%)';e.style.transformOrigin='0 0'}else{e.style.right=e.style.bottom=e.style.left=e.style.top=e.style.transform='';e.style.transformOrigin=''}}}
function defRect(id){const e=$(id),d=e.style.display,v=e.style.visibility;e.style.display='flex';e.style.visibility='hidden';const r=e.getBoundingClientRect();e.style.display=d;e.style.visibility=v;return{x:+((r.left+r.width/2)/innerWidth*100).toFixed(1),y:+((r.top+r.height/2)/innerHeight*100).toFixed(1),s:1}}
let EL={},selB=null,edDrag=null;
function edSel(id){selB=id;for(const k in EL)EL[k].d.classList.toggle('on',k===id);$('edn').textContent=BTN.find(b=>b[0]===id)[1];$('edS').value=EL[id].a.s*100}
function edPos(k){const o=EL[k];o.d.style.left=o.a.x+'vw';o.d.style.top=o.a.y+'vh';o.d.style.transform='translate(-50%,-50%) scale('+o.a.s+')'}
$('cEdit').onclick=()=>{$('cfg').style.display='none';$('edt').style.display='block';const c=$('edc');c.innerHTML='';EL={};
 for(const [id,nm] of BTN){const a=Object.assign({},CFG.lay[id]||defRect(id)),d=document.createElement('div');d.className='bt cb';d.textContent=nm;EL[id]={a,d};c.appendChild(d);edPos(id);
  d.addEventListener('pointerdown',e=>{e.preventDefault();edSel(id);edDrag=id;try{d.setPointerCapture(e.pointerId)}catch(_){}});
  d.addEventListener('pointermove',e=>{if(edDrag!==id)return;EL[id].a.x=+(e.clientX/innerWidth*100).toFixed(1);EL[id].a.y=+(e.clientY/innerHeight*100).toFixed(1);edPos(id)});
  d.addEventListener('pointerup',()=>{edDrag=null})}edSel('bf')};
$('edS').oninput=e=>{if(selB){EL[selB].a.s=e.target.value/100;edPos(selB)}};
$('edV').onclick=()=>{CFG.lay={};for(const k in EL)CFG.lay[k]=EL[k].a;saveCfg();applyLay();$('edt').style.display='none';$('cfg').style.display='flex'};
$('edR').onclick=()=>{CFG.lay={};saveCfg();applyLay();$('edt').style.display='none';$('cfg').style.display='flex'};
$('edX').onclick=()=>{$('edt').style.display='none';$('cfg').style.display='flex'};
$('cfgb').onclick=()=>{$('cfg').style.display='flex';$('cAuto').textContent=CFG.auto?'Ligado':'Desligado';$('cDoor').textContent=CFG.autoDoor?'Ligado':'Desligado';$('cQ').textContent=['Baixa','Média','Alta'][CFG.q==null?DZ_DEFQ:CFG.q];$('cSens').value=CFG.sens*100};
$('cfgx').onclick=()=>{$('cfg').style.display='none'};
$('cAuto').onclick=()=>{CFG.auto^=1;$('cAuto').textContent=CFG.auto?'Ligado':'Desligado';saveCfg()};
$('cDoor').onclick=()=>{CFG.autoDoor^=1;$('cDoor').textContent=CFG.autoDoor?'Ligado':'Desligado';saveCfg()};
$('cSens').oninput=e=>{CFG.sens=e.target.value/100;saveCfg()};
setTimeout(applyLay,0);
let adsPrev=0,autoed=0;
function holdFire(el,auto){let lx=0,ly=0,pid=null;
 el.addEventListener('pointerdown',e=>{e.preventDefault();pid=e.pointerId;try{el.setPointerCapture(pid)}catch(_){}lx=e.clientX;ly=e.clientY;if(TS&&mode==='ground'&&mpOk()&&(TS==='gren'?bag.gren>0:bag.gel>0)){GA={k:TS,t:0,sy:e.clientY,rng:.5,pid};return}firing=1;if(auto&&CFG.auto&&mode==='ground'&&wp){adsPrev=ads;ads=1;autoed=1}});
 el.addEventListener('pointermove',e=>{if(e.pointerId!==pid)return;if(GA&&GA.pid===pid){GA.rng=Math.max(0,Math.min(1,.5+(GA.sy-e.clientY)/160));look(e.clientX-lx,0)}else look(e.clientX-lx,e.clientY-ly);lx=e.clientX;ly=e.clientY});
 const up=e=>{if(e.pointerId!==pid)return;if(GA&&GA.pid===pid)releaseAim();pid=null;firing=0;if(autoed){ads=adsPrev;autoed=0}};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)}
