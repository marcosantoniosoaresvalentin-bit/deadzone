/* Deadzone · ui/mode-select.js
 * Seleção de modo e mapa.
 */
// ===== seleção de modo/mapa + pareamento automático =====
let GMODE='classic',GMAP='Porto Real';try{GMODE=localStorage.getItem('dzMode')||'classic';GMAP=localStorage.getItem('dzMap')||'Porto Real'}catch(e){}
const MODES=[['classic','Clássico · 100 jogadores'],['pvp','Gladiadores'],['squad','Contra Squad'],['room','Criar sala']];
function mapLbl(){$('mapb').textContent='🗺 Mapa · '+(GMODE==='classic'?'Clássico':GMODE==='pvp'?'Gladiadores':GMODE==='squad'?'Contra Squad':'Criar sala')}
function renderMp(){$('mpm').innerHTML=MODES.map(m=>'<button data-m="'+m[0]+'"'+(m[0]===GMODE?' class="sel"':'')+'>'+m[1]+'</button>').join('');
 $('mpc').innerHTML='<button data-c="Zona Morta" class="sel">Zona Morta</button><button data-c="Aleatório">Aleatório</button>';mapLbl();updateRoomOptions()}
function updateRoomOptions(){const t=$('roomType').value;$('teamSizeWrap').style.display=t==='gladiator'||t==='counter'?'none':'flex';$('matchSizeWrap').style.display=t==='gladiator'||t==='counter'?'flex':'none';$('createRoomFromMap').textContent=t==='room'?'Criar sala':t==='gladiator'?'Jogar Gladiadores':t==='counter'?'Jogar Contra Squad':'Confirmar modo';}
const saveMp=()=>{try{localStorage.setItem('dzMode',GMODE);localStorage.setItem('dzMap',GMAP)}catch(e){}};
$('mapb').onclick=()=>{$('mpn').style.display='flex';renderMp()};$('mpx').onclick=()=>{$('mpn').style.display='none'};
$('mpm').onclick=e=>{const b=e.target.closest('button');if(!b||b.disabled)return;GMODE=b.dataset.m; if(GMODE==='room')$('roomType').value='room';else if(GMODE==='pvp')$('roomType').value='gladiator';else if(GMODE==='squad')$('roomType').value='counter';else $('roomType').value='normal';saveMp();renderMp()};
$('mpc').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.c==='Aleatório'||b.dataset.c==='Zona Morta')GMAP=CITIES[Math.floor(Math.random()*CITIES.length)].n;else GMAP=b.dataset.c;saveMp();renderMp()};
mapLbl();
$('roomType').onchange=()=>{const t=$('roomType').value;GMODE=t==='gladiator'?'pvp':t==='counter'?'squad':t==='room'?'room':'classic';updateRoomOptions();renderMp();};$('createRoomFromMap').onclick=()=>{const t=$('roomType').value;const sz=$('matchSize').value;const team=$('teamSize').value;const auto=$('autoPair').checked;try{localStorage.setItem('dzAutoPair',auto?'1':'0');localStorage.setItem('dzRoomType',t);localStorage.setItem('dzTeamSize',team);localStorage.setItem('dzMatchSize',sz)}catch(e){};if(GMAP==='Aleatório')GMAP=CITIES[Math.floor(Math.random()*CITIES.length)].n;saveMp();$('mpn').style.display='none';if(t==='gladiator'||t==='counter'||t==='room'){selCity=GMAP;$('on').style.display='flex';onShow('onCreate');$('onn').value=t==='gladiator'?'Gladiadores '+sz:t==='counter'?'Contra Squad '+sz:'Sala '+team+' jogadores';$('onst').textContent=t==='gladiator'?'Gladiadores · '+sz:t==='counter'?'Contra Squad · '+sz:'Sala personalizada · '+team+' jogadores';$('onct').innerHTML='<button class="sel" disabled>'+GMAP+'</button>'; }else if(GMODE==='pvp')autoPvp();else startGame();};
function autoPvp(){selCity=GMAP;$('on').style.display='flex';onShow('onWait');$('onwt').textContent='Procurando rival...';mqConn();let tries=0;
 const create=()=>{if(MP||$('on').style.display!=='flex')return;mpWho='a';mpCity=GMAP;opId='';myRoom={s:'wait',name:'Auto '+mpId};$('onwt').textContent='Aguardando rival... ('+mpCity+')';pubRoom()};
 const tick=()=>{if($('on').style.display!=='flex'||MP)return;if(!mq||!mq.connected){if(++tries<30)return setTimeout(tick,400);$('onwt').textContent='Sem conexão com o servidor';return}
  setTimeout(()=>{if(MP||$('on').style.display!=='flex')return;const l=Object.values(ROOMS).filter(r=>r.s==='wait'&&r.id!==mpId&&r.city===GMAP);
   if(l.length){const r=l[0];mpCity=r.city;mpWho='b';opId=r.id;mq.publish(TP+'p/'+r.id,JSON.stringify({t:'join',from:mpId}),{qos:1});setTimeout(()=>{if(!MP){opId='';create()}},5000)}else create()},2500)};
 tick()}
go.onclick=()=>{if(GMODE==='pvp')autoPvp();else if(GMODE==='classic')startGame()};
