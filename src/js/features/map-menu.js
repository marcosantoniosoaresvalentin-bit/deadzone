/* Deadzone · features/map-menu.js
 * Menu de mapa/modo e pareamento automático.
 */
(()=>{
const $=id=>document.getElementById(id);const panel=$('mpn');if(!panel||$('dz31-confirm'))return;
$('dzPartyModes')?.remove();const modeTitle={'classic':'🎯 Clássico · Mapa completo','pvp':'⚔️ Gladiadores','squad':'👥 Contra Squad','room':'🏠 Criar sala'};
let selectedMode=localStorage.getItem('dzMode')||'classic';if(!['classic','pvp','squad','room'].includes(selectedMode))selectedMode='classic';
let teamMode=localStorage.getItem('deadzone_party_mode')||'squad';if(!['solo','duo','trio','squad'].includes(teamMode))teamMode='squad';
let mapChoice='Zona Morta';let roomType='gladiator';let roomSize='1v1';
const modeP=[...panel.querySelectorAll('p')].find(p=>p.textContent.trim()==='Modo de jogo');const mapP=[...panel.querySelectorAll('p')].find(p=>p.textContent.trim()==='Mapa');
const roomOpts=$('roomOpts');
// Rebuild the menu body while preserving the original IDs used by the game engine.
$('mpm').innerHTML=Object.entries(modeTitle).map(([id,label])=>`<button type="button" data-m="${id}">${label}</button>`).join('');
const teamRow=document.createElement('div');teamRow.id='dz31-team-row';teamRow.innerHTML='<button data-team="solo">👤 Solo</button><button data-team="duo">👥 Duo</button><button data-team="trio">👥 Trio</button><button data-team="squad">👥 Squad</button>';
const teamP=document.createElement('p');teamP.textContent='Selecionar equipe';$('mpm').insertAdjacentElement('afterend',teamP);teamP.insertAdjacentElement('afterend',teamRow);
$('mpc').innerHTML='<button type="button" data-map="Zona Morta">🗺️ Zona Morta</button><button type="button" data-map="Aleatório">🎲 Mapa aleatório</button>';
const room=document.createElement('div');room.id='dz31-room-config';room.innerHTML='<b>🏠 Configurar sala</b><div class="dz31-roomtypes"><button type="button" data-room="gladiator">⚔️ Sala Gladiadores</button><button type="button" data-room="counter">👥 Sala Contra Squad</button></div><p id="dz31-size-label">Tamanho da partida</p><div id="dz31-sizes" class="dz31-roomtypes"></div><label style="display:flex;align-items:center;gap:8px"><input id="dz31-autopair" type="checkbox" style="width:20px;height:20px" checked> Autopareamento para completar a equipe</label></div>';
$('mpc').insertAdjacentElement('afterend',room);
const confirm=document.createElement('button');confirm.id='dz31-confirm';confirm.type='button';confirm.textContent='✓ Confirmar seleção';room.insertAdjacentElement('afterend',confirm);
if(roomOpts)roomOpts.style.display='none';if(modeP)modeP.textContent='Selecionar modo';if(mapP)mapP.textContent='Selecionar mapa';
function renderSizes(){const sizes=$('dz31-sizes');const arr=roomType==='gladiator'?[['1v1','Solo · 1 contra 1'],['2v2','Duo · 2 contra 2']]:[['3v3','Trio · 3 contra 3'],['4v4','Squad · 4 contra 4']];if(!arr.some(x=>x[0]===roomSize))roomSize=arr[0][0];sizes.innerHTML=arr.map(([v,l])=>`<button type="button" data-size="${v}">${l}</button>`).join('');sizes.querySelectorAll('button').forEach(b=>b.classList.toggle('sel',b.dataset.size===roomSize));$('dz31-size-label').textContent=roomType==='gladiator'?'Gladiadores: escolha Solo ou Duo':'Contra Squad: escolha Trio ou Squad';}
function paint(){ $('mpm').querySelectorAll('[data-m]').forEach(b=>b.classList.toggle('sel',b.dataset.m===selectedMode));teamRow.querySelectorAll('[data-team]').forEach(b=>b.classList.toggle('sel',b.dataset.team===teamMode));$('mpc').querySelectorAll('[data-map]').forEach(b=>b.classList.toggle('sel',b.dataset.map===mapChoice));room.querySelectorAll('[data-room]').forEach(b=>b.classList.toggle('sel',b.dataset.room===roomType));room.classList.toggle('visible',selectedMode==='room');if(selectedMode==='pvp'){teamMode=teamMode==='duo'?'duo':'solo';teamRow.querySelectorAll('[data-team]').forEach(b=>{b.disabled=!['solo','duo'].includes(b.dataset.team);b.style.opacity=b.disabled?'.4':'1'});}else if(selectedMode==='squad'){teamMode=teamMode==='trio'?'trio':'squad';teamRow.querySelectorAll('[data-team]').forEach(b=>{b.disabled=!['trio','squad'].includes(b.dataset.team);b.style.opacity=b.disabled?'.4':'1'});}else{teamRow.querySelectorAll('[data-team]').forEach(b=>{b.disabled=false;b.style.opacity='1'});}if(selectedMode==='pvp'){roomType='gladiator';roomSize=teamMode==='duo'?'2v2':'1v1'}else if(selectedMode==='squad'){roomType='counter';roomSize=teamMode==='trio'?'3v3':'4v4'}renderSizes();confirm.textContent=selectedMode==='room'?'Criar sala':selectedMode==='classic'?'Confirmar':'Confirmar';}
$('mpm').addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;selectedMode=b.dataset.m;if(selectedMode==='pvp'){roomType='gladiator';teamMode=['duo'].includes(teamMode)?'duo':'solo';}if(selectedMode==='squad'){roomType='counter';teamMode=['trio'].includes(teamMode)?'trio':'squad';}paint()});
teamRow.addEventListener('click',e=>{const b=e.target.closest('[data-team]');if(!b||b.disabled)return;teamMode=b.dataset.team;paint()});
$('mpc').addEventListener('click',e=>{const b=e.target.closest('[data-map]');if(!b)return;mapChoice=b.dataset.map;paint()});
room.querySelector('.dz31-roomtypes').addEventListener('click',e=>{const b=e.target.closest('[data-room]');if(!b)return;roomType=b.dataset.room;teamMode=roomType==='gladiator'?'solo':'trio';roomSize=roomType==='gladiator'?'1v1':'3v3';paint()});
$('dz31-sizes').addEventListener('click',e=>{const b=e.target.closest('[data-size]');if(!b)return;roomSize=b.dataset.size;teamMode=roomSize==='1v1'?'solo':roomSize==='2v2'?'duo':roomSize==='3v3'?'trio':'squad';paint()});
confirm.addEventListener('click',()=>{GMODE=selectedMode;try{localStorage.setItem('dzMode',GMODE);localStorage.setItem('dzMode',GMODE);localStorage.setItem('dzMapChoice',mapChoice);localStorage.setItem('deadzone_party_mode',teamMode);localStorage.setItem('dzAutoPair',$('dz31-autopair').checked?'1':'0');localStorage.setItem('dzRoomType',selectedMode==='room'?roomType:selectedMode==='pvp'?'gladiator':selectedMode==='squad'?'counter':'normal');localStorage.setItem('dzTeamSize',({'solo':'1','duo':'2','trio':'3','squad':'4'})[teamMode]);localStorage.setItem('dzMatchSize',roomSize)}catch(e){}
if(mapChoice==='Aleatório'){GMAP=CITIES[Math.floor(Math.random()*CITIES.length)].n;}else{GMAP=CITIES[0]?.n||'Porto Real';}if(typeof saveMp==='function')saveMp();if(typeof mapLbl==='function')mapLbl();
if(selectedMode==='room'){selCity=GMAP;$('on').style.display='flex';onShow('onCreate');$('onn').value=(roomType==='gladiator'?'Gladiadores ': 'Contra Squad ')+roomSize;$('onst').textContent=(roomType==='gladiator'?'Sala Gladiadores · ':'Sala Contra Squad · ')+roomSize+' · '+GMAP;$('onct').innerHTML='<button class="sel" disabled>'+GMAP+'</button>';}
else if(selectedMode==='pvp'){ $('mpn').style.display='none'; if(typeof autoPvp==='function')autoPvp();else if(typeof startGame==='function')startGame();return;}
else if(selectedMode==='squad'){ $('mpn').style.display='none'; if(typeof queue==='function'&&typeof sqStart==='function')queue('squad',8,sqStart);else if(typeof startGame==='function')startGame();return;}
else { $('mpn').style.display='none'; if(typeof queue==='function'&&typeof clStart==='function')queue('classic',100,clStart);else if(typeof startGame==='function')startGame();return;}
});
const oldRender=typeof renderMp==='function'?renderMp:null;renderMp=function(){paint();if(typeof mapLbl==='function')mapLbl()};
// Selection screen is a configuration screen only: the actual start button stays in the lobby.
paint();
})();
