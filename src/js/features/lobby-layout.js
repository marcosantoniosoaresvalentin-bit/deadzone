/* Deadzone · features/lobby-layout.js
 * Ajustes de layout do lobby.
 */
(()=>{
const $=id=>document.getElementById(id);
const lobby=$('lb'), controls=$('lbr'), friends=$('lobbyFriendsBtn'), gear=$('cfgb'), inventory=$('invb');
// Remove obsolete controls regardless of whether their older CSS overrides inline display.
$('lobbyInviteBtn')?.remove(); $('onb')?.remove();
[...document.querySelectorAll('button')].forEach(b=>{if(/equipe\s*\/\s*convites/i.test(b.textContent.trim()))b.remove();});
// Put the single compact social/mail button beside settings at the upper-right.
if(controls && friends){friends.remove(); controls.appendChild(friends); friends.textContent='✉️'; friends.setAttribute('aria-label','Convidar amigos e notificações'); friends.title='Convidar amigos e notificações';
 let glyph=friends.querySelector('.dz-mail-people'); if(!glyph){friends.innerHTML='<span class="dz-mail-icon">✉</span><span class="dz-mail-people">👥</span>';}
}
if(controls && gear){gear.textContent='⚙️'; gear.title='Configurações'; gear.setAttribute('aria-label','Configurações');}
if(inventory){inventory.textContent='🎒'; inventory.title='Inventário'; inventory.setAttribute('aria-label','Inventário');}
// Ensure the ID is below the player name, without duplicating it.
const pn=$('pn'); if(pn){pn.style.display='inline-block';pn.style.maxWidth='100%';}
})();
