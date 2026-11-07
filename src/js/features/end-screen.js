/* Deadzone · features/end-screen.js
 * Tela de fim de partida.
 */
(()=>{
window.goLobby=function(){if(window.__dzLeaving)return;window.__dzLeaving=1;try{location.reload()}catch(e){location.href=location.href}};
window.egFit=function(){const e=document.getElementById('eg');if(e)e.style.setProperty('--e',Math.min(innerWidth/2022,innerHeight/778)+'px')};
addEventListener('resize',egFit);addEventListener('orientationchange',()=>setTimeout(egFit,150));
['click','pointerup','touchend'].forEach(t=>document.addEventListener(t,ev=>{const b=ev.target&&ev.target.closest&&ev.target.closest('#mres button, #egr');if(b){ev.preventDefault();ev.stopPropagation();goLobby()}},true));
})();
