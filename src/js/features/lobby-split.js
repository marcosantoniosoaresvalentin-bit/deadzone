/* Deadzone · features/lobby-split.js
 * Divisão do painel social.
 */
(()=>{try{const $=id=>document.getElementById(id),soc=$('dzSocial'),lf=$('lobbyFriendsBtn');if(!soc||!lf)return;
const st=document.createElement('style');st.textContent='#dzSocial[data-view=friends] #dzSocialNav [data-tab=notices],#dzSocial[data-view=mail] #dzSocialNav [data-tab=invite]{display:none!important}';document.head.appendChild(st);
const f=$('d43f'),e=$('d43e');
if(f)f.onclick=()=>{soc.dataset.view='friends';lf.click()};
if(e)e.onclick=()=>{soc.dataset.view='mail';lf.click();setTimeout(()=>{const t=document.querySelector('#dzSocialNav [data-tab=notices]');t&&t.click();const h=soc.querySelector('#dzSocialHead h2');if(h)h.textContent='✉️ Notificações'},60)};
document.addEventListener('click',ev=>{if(ev.target.closest&&ev.target.closest('#dzLobbyNotice'))soc.dataset.view='mail'},true);
}catch(err){console.warn('dz51',err)}})();
