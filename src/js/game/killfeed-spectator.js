/* Deadzone · game/killfeed-spectator.js
 * Abates em todos os modos, fumaça sincronizada e espectador.
 */
// ===== v18: dano/killfeed em todos os modos + granada de fumaça em PVP/Squad/Gladiadores =====
function nmHash(id){let h=0;const q=String(id||'');for(let i=0;i<q.length;i++)h=(h*31+q.charCodeAt(i))>>>0;return NMS[h%NMS.length]+(10+h%89)}
function nmId(id){return id===mpId?'Você':nmHash(id)}
function nmOf(e){return e&&e.id?nmId(e.id):bnm(e)}
function feedKill(k,v,w,hs){if(!v)return;if(!k){feed('<b>'+v+'</b> foi eliminado');return}feed('<b>'+k+'</b> ▸ '+(w||'💥')+(hs?' 🎯':'')+' ▸ '+v)}
// squad: feed de abates (bots e jogadores)
{const _k=sqKill;sqKill=function(e,k){if(e.dead)return;_k(e,k);const kw=k===mpId&&wp&&WS[wp]?WS[wp].n:'';feedKill(k?nmId(k):'',nmOf(e),kw);gp({t:'kf',k,vn:nmOf(e),kw},1)}}
{const _r=sqRx;sqRx=function(m){if(m.t==='kf'){feedKill(m.k?nmId(m.k):'',m.vn,m.kw);return}if(m.t==='smk'){spawnSmoke(m.x,m.z,1);return}_r(m)}}
{const _r=clRx;clRx=function(m){if(m.t==='smk'){spawnSmoke(m.x,m.z,1);return}_r(m)}}
{const _r=mpMsg;mpMsg=function(m){if(m.t==='smk'&&m.from===opId){spawnSmoke(m.x,m.z,1);return}_r(m);if(m.t==='gr'&&m.from===opId&&GRN.length)GRN[GRN.length-1].rem=1}}
// PVP: dano de granada no rival
{const _e=expl;expl=function(x,y,z,r,dm,own){_e(x,y,z,r,dm,own);if(own&&!RGX&&MP&&!SQ&&RB&&RB.state==='live'&&OP&&!OP.dead){const d=Math.hypot(OP.x-x,OP.z-z);if(d<r)hitFx(OP.x,1.4,OP.z,dm*(1-d/r),0,0)}}}
// fumaça: sincroniza com os outros jogadores quando cai
function clearSmk(){for(const c of SMK)sc.remove(c.g);SMK.length=0}
{const _s=spawnSmoke;spawnSmoke=function(x,z,rem){_s(x,z);if(!rem){const m={t:'smk',x:+x.toFixed(2),z:+z.toFixed(2)};if(N)gp(m,1);else if(MP&&opId&&opId!=='BOT')snd(m,1)}}}
{const _p=prepRound;prepRound=function(){clearSmk();return _p.apply(this,arguments)}}
{const _q=sqRound;sqRound=function(){clearSmk();return _q.apply(this,arguments)}}
{const _t=throwSmoke;throwSmoke=function(){if(MP&&!mpOk())return;return _t()}}
BTN.push(['bgs','Fumaça']);

setInterval(()=>{const b=$('bgs');if(!b)return;b.style.display=(mode==='ground'&&bag.smoke>0)?'flex':'none';b.textContent='💨x'+bag.smoke},200);
SP.push(['smoke','Fumaça',150]);

// ===== v19 =====
function sgD(t){return t<=4?56:t>=18?0:56*(1-(t-4)/14)}
function pelD(t){return t<=4?7:t>=18?0:7*(1-(t-4)/14)}
function wDmg(d,t,h){if(wp==='shotgun')return Math.round(pelD(t)*(h?2.2:1));if(wp==='sniper'){const f=t<=100?1:Math.max(.3,1-(t-100)/300*.7);return h?Math.round(150*Math.max(f,.8)):Math.round(68*f)}return d*(h?2:1)}
// mensagens de tutorial / aviso removidas
{const _s=say;say=function(t,s){if(/Queda livre|Paraquedas:|Analógico:|Pousou!|segure LANÇAR|Recarreg|Acertou|TIRO NA CABEÇA|Fase de compras|Procure armas/.test(t||''))return;_s(t,s)}}
// ---- espectador (clássico solo/online e squad)
function specList(){if(SQ){let L=SQ.B.filter(e=>!e.dead&&e.team===SQ.mt);if(!L.length)L=SQ.B.filter(e=>!e.dead);return L}
 if(N&&N.mode==='classic')return Object.values(CL).concat(Object.values(CB)).filter(e=>!e.dead&&e.vis);return bots.filter(b=>!b.dead&&!b.air)}
const sqDead=()=>!!(SQ&&SQ.meDead&&SQ.st==='live'),specOn=()=>sqDead()||(mode==='dead'&&$('spc').style.display!=='none');
specNext=function(d){const L=specList();if(!L.length){spec=null;$('spn').textContent='';if(mode==='dead'&&!SQ){$('spc').style.display='none';$('eg').style.display='flex'}return}let i=L.indexOf(spec);i=i<0?0:(i+d+L.length)%L.length;spec=L[i];$('spn').textContent=nmOf(spec)};
specTick=function(){if(!specOn())return;if(!spec||spec.dead||spec.air)specNext(1);if(!spec)return;P.x=spec.x;P.z=spec.z;P.y=spec.py||0;pl.visible=false};
setInterval(()=>{const s=sqDead();document.body.classList.toggle('spec',s);document.body.classList.toggle('sqs',!!SQ);if(s){$('spc').style.display='flex';firing=0;ads=0;if(!spec)specNext(1)}else if(SQ&&$('spc').style.display==='flex'&&mode!=='dead'){$('spc').style.display='none';spec=null}},120);
{const _g=gEnd;gEnd=function(w){_g(w);const e=$('eg'),st=e.querySelector('.st');if(st&&!e.querySelector('.mvp'))st.insertAdjacentHTML('afterend','<div class="mvp">⭐ MVP da partida<br><b>Você</b> · '+kills+' abate(s) · '+Math.round(dmgDone)+' de dano</div>');
 if(false){e.lastElementChild.insertAdjacentHTML('afterbegin','<button id="egs">👁 Assistir</button>');$('egs').onclick=()=>{e.style.display='none';$('spc').style.display='flex';specNext(1)}}}}
{const _e=endMatch;endMatch=function(w){_e(w);const r=$('mres');if(r&&!r.dataset.m){r.dataset.m=1;const win=w?1:RB[myKey()]>RB[opKey()];r.innerHTML=r.innerHTML.replace('<button','<p class="mvp">⭐ MVP: <b>'+(win?'Você':'Rival')+'</b></p><button')}}}
// ---- menu de arremessáveis (gelo, granada, fumaça, faca)
let THR=null,twOpen=0;
{const tw=document.createElement('div');tw.id='tw';tw.innerHTML='<div id="twm"></div><div id="twc"><span id="twi"></span><b id="twa">▲</b></div>';document.body.appendChild(tw);
 const TI=[['gel','🧊','Gelo'],['gren','💣','Granada'],['smoke','💨','Fumaça'],['knife','🔪','Faca']];
 function selT(k){if(mode!=='ground')return;if(THR===k){THR=null;TS=0}else{THR=k;TS=k==='knife'?0:k;cur=-1;rlOn=0;rl=0;ads=0;GA=null}drawSlots()}
 const _ss=selSlot;selSlot=function(i){THR=null;TS=0;_ss(i)};
 $('twa').onpointerdown=e=>{e.preventDefault();e.stopPropagation();twOpen^=1};
 $('twm').onpointerdown=e=>{e.preventDefault();e.stopPropagation();const d=e.target.closest('[data-k]');if(d){selT(d.dataset.k);twOpen=0}};
 setInterval(()=>{const on=mode==='ground'&&!document.body.classList.contains('spec');tw.style.display=on?'flex':'none';if(!on)return;
  if(cur>=0&&THR){THR=null;TS=0}if(THR&&!(bag[THR]>0)){THR=null;TS=0}
  const r=$('sl').getBoundingClientRect();tw.style.left=(r.width?r.right+8:innerWidth*.7)+'px';tw.style.bottom=(r.width?innerHeight-r.bottom:26)+'px';
  const s=TI.find(t=>t[0]===THR);$('twi').innerHTML=s?s[1]+'<small>x'+bag[s[0]]+'</small>':'<small>Itens</small>';
  $('twm').style.display=twOpen?'flex':'none';$('twa').textContent=twOpen?'▼':'▲';
  $('twm').innerHTML=TI.filter(t=>bag[t[0]]>0).map(t=>'<div data-k="'+t[0]+'"'+(t[0]===THR?' class="on"':'')+'>'+t[1]+'<small>'+t[2]+' x'+bag[t[0]]+'</small></div>').join('')},150)}
// fumaça com a mesma mira da granada
for(const el of[bf,bf2]){let pid=null,lx=0;
 el.addEventListener('pointerdown',e=>{if(TS==='smoke'&&mode==='ground'&&bag.smoke>0&&mpOk()&&!cast){e.stopImmediatePropagation();e.preventDefault();pid=e.pointerId;try{el.setPointerCapture(pid)}catch(_){}lx=e.clientX;GA={k:'smoke',t:0,sy:e.clientY,rng:.5,pid}}},true);
 el.addEventListener('pointermove',e=>{if(e.pointerId!==pid||!GA||GA.k!=='smoke')return;GA.rng=Math.max(0,Math.min(1,.5+(GA.sy-e.clientY)/160));look(e.clientX-lx,0);lx=e.clientX},true);
 const up=e=>{if(e.pointerId!==pid)return;pid=null;const g=GA;if(!g||g.k!=='smoke')return;GA=null;if(mode!=='ground'||!(bag.smoke>0))return;const v=gVel(gRange(g.rng));launchGren(v.x0,v.y0,v.z0,v.vx,v.vy,v.vz,2.2,0);const q=GRN[GRN.length-1];q.sm=1;q.m.material=M(0xb8bcc0);bag.smoke--;drawBag();if(bag.smoke<=0){TS=0;THR=null}};
 el.addEventListener('pointerup',up,true);el.addEventListener('pointercancel',up,true)}
{const _ua=updAim;updAim=function(dt){if(GA&&GA.k==='smoke'){if(mode!=='ground'||!mpOk()||TS!=='smoke')GA=null;else{const v=gVel(gRange(GA.rng)),a=AIML.geometry.attributes.position;for(let i=0;i<=24;i++){const t=v.ft*i/24;a.setXYZ(i,v.x0+v.vx*t,v.y0+v.vy*t-9*t*t,v.z0+v.vz*t)}a.needsUpdate=true;AIML.visible=AIMR.visible=true;AIMR.position.set(v.x0+v.vx*v.ft,.2,v.z0+v.vz*v.ft);GPV.visible=false;return}}_ua(dt)}}
