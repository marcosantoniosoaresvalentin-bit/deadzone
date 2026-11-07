/* Deadzone · features/autopair.js
 * Opção de autopareamento.
 */
(()=>{try{const m=document.getElementById('mpn'),o=document.getElementById('dz31-autopair');if(!m||!o||document.getElementById('dz44-auto'))return;
const l=document.createElement('label');l.id='dz44-auto';l.innerHTML='<input type="checkbox"> Autopareamento para completar a equipe';const c=l.querySelector('input');c.checked=o.checked;
c.onchange=()=>{o.checked=c.checked};o.addEventListener('change',()=>{c.checked=o.checked});m.appendChild(l)}catch(e){console.warn('dz44',e)}})();
