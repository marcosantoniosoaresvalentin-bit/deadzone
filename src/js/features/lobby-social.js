/* Deadzone · features/lobby-social.js
 * Amigos e convites no lobby.
 */
(()=>{
const $=id=>document.getElementById(id); const safe=(v)=>String(v||'').replace(/[<>]/g,'');
const lobby=$('lb'),pn=$('pn'),mpn=$('mpn'); if(!lobby||!pn||!mpn)return;
// Move the party-size choice to the existing map/mode screen.
const modeRow=document.createElement('div');modeRow.id='dzPartyModes';
modeRow.innerHTML='<button data-mode="solo">SOLO · 1 jogador</button><button data-mode="duo">DUO · 2 jogadores</button><button data-mode="trio">TRIO · 3 jogadores</button><button data-mode="squad">SQUAD · 4 jogadores</button>';
const mapLabel=[...mpn.querySelectorAll('p')].find(x=>x.textContent.trim()==='Mapa');
const modeLabel=[...mpn.querySelectorAll('p')].find(x=>x.textContent.trim()==='Modo de jogo');
if(modeLabel)modeLabel.insertAdjacentElement('afterend',modeRow);else mpn.insertBefore(modeRow,mpn.querySelector('#mpm'));
const getMode=()=>localStorage.getItem('deadzone_party_mode')||'squad';
function paintMode(){modeRow.querySelectorAll('button').forEach(b=>b.classList.toggle('sel',b.dataset.mode===getMode()));}
modeRow.addEventListener('click',e=>{const b=e.target.closest('button[data-mode]');if(!b)return;localStorage.setItem('deadzone_party_mode',b.dataset.mode);paintMode();const tm=$('teamModes');if(tm){const tb=tm.querySelector('[data-mode="'+b.dataset.mode+'"]');if(tb)tb.click();} });paintMode();
// Invite button directly under the player name on the left.
if(!$('lobbyInviteBtn')){const b=document.createElement('button');b.id='lobbyInviteBtn';b.textContent='＋ Convidar amigos';pn.insertAdjacentElement('afterend',b);b.onclick=()=>{const p=$('teamPanel');if(p){p.style.display='flex';const st=$('teamStatus');if(st)st.textContent='Escolha um amigo na lista à direita ou convide pelo nome/ID.';}}}
// Friends card in the upper-right corner of the lobby.
if(!$('lobbyFriendsBtn')){const b=document.createElement('button');b.id='lobbyFriendsBtn';b.textContent='👥 Amigos ＋';lobby.appendChild(b);b.onclick=()=>{const p=$('lobbyFriendPanel');p.style.display=p.style.display==='block'?'none':'block';renderFriends();};}
if(!$('lobbyFriendPanel')){const p=document.createElement('div');p.id='lobbyFriendPanel';p.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><h3>Amigos</h3><button id="dzFriendClose">✕</button></div><p style="font-size:12px;color:#b9d0d4">Adicione amigos por nome ou ID e convide-os para sua equipe.</p><input id="dzFriendName" maxlength="40" placeholder="Nome do jogador ou ID"><button id="dzFriendAdd">＋ Adicionar amigo</button><div id="dzFriendList"></div><p style="font-size:10px;color:#9eb8bd">Lista local de demonstração. Status online e convites entre aparelhos exigem servidor.</p>';document.body.appendChild(p);$('dzFriendClose').onclick=()=>p.style.display='none';}
function readFriends(){try{return JSON.parse(localStorage.getItem('deadzone_friends')||'[]')}catch(e){return []}}
function renderFriends(){const list=$('dzFriendList');if(!list)return;const arr=readFriends();list.innerHTML='';if(!arr.length){list.innerHTML='<p style="font-size:12px;color:#b9d0d4">Você ainda não adicionou amigos.</p>';return;}arr.forEach((f,i)=>{const r=document.createElement('div');r.className='friendrow';const left=document.createElement('span');left.innerHTML='<b>'+safe(f.name)+'</b><small>'+safe(f.id||'Sem ID')+' · <span class="'+(f.online?'online':'offline')+'">'+(f.online?'Online (simulado)':'Offline')+'</span></small>';const actions=document.createElement('span');const inv=document.createElement('button');inv.textContent='＋ Convidar';inv.onclick=()=>{const input=$('inviteTarget');if(input)input.value=f.name;const send=$('sendInvite');if(send)send.click();const tp=$('teamPanel');if(tp)tp.style.display='flex';};const del=document.createElement('button');del.textContent='×';del.title='Remover amigo';del.onclick=()=>{arr.splice(i,1);localStorage.setItem('deadzone_friends',JSON.stringify(arr));renderFriends()};actions.append(inv,del);r.append(left,actions);list.appendChild(r)});}
$('dzFriendAdd').onclick=()=>{const val=$('dzFriendName').value.trim();if(!val)return;const arr=readFriends();if(arr.some(f=>f.name.toLowerCase()===val.toLowerCase()||f.id.toLowerCase()===val.toLowerCase())){alert('Esse amigo já está na lista.');return;}arr.push({name:val,id:/^DZ-/i.test(val)?val:'',online:false});localStorage.setItem('deadzone_friends',JSON.stringify(arr));$('dzFriendName').value='';renderFriends();};
// Opening the existing map screen always reflects the selected team size.
const mapBtn=$('mapb');if(mapBtn)mapBtn.addEventListener('click',()=>setTimeout(paintMode,0));
})();
