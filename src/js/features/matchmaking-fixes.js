/* Deadzone · features/matchmaking-fixes.js
 * Correções do pareamento.
 */
(()=>{
 const $=id=>document.getElementById(id);const panel=$('mpn');if(!panel||$('dz33-autopair-top'))return;
 // The autopair option belongs in the main mode/map selector, not inside room creation.
 const auto=document.createElement('label');auto.id='dz33-autopair-top';auto.style.cssText='display:flex;align-items:center;gap:9px;padding:10px 12px;border:1px solid #426fa4;border-radius:10px;background:#0c2037;color:#fff;font-weight:700;margin:4px 0';
 auto.innerHTML='<input id="dz33-autopair" type="checkbox" style="width:20px;height:20px;accent-color:#f5b52f"> Autopareamento para completar a equipe';
 const confirm=$('dz31-confirm');if(confirm)confirm.insertAdjacentElement('beforebegin',auto);else panel.appendChild(auto);
 const savedAuto=localStorage.getItem('dzAutoPair');$('dz33-autopair').checked=savedAuto!=='0';
 $('dz33-autopair').addEventListener('change',()=>{try{localStorage.setItem('dzAutoPair',$('dz33-autopair').checked?'1':'0');if($('dz31-autopair'))$('dz31-autopair').checked=$('dz33-autopair').checked}catch(e){}});
 // Remove the duplicate checkbox from the room-only card.
 const oldAuto=$('dz31-autopair');if(oldAuto){const lab=oldAuto.closest('label');if(lab)lab.style.display='none';}
 const origConfirm=confirm;
 if(origConfirm){origConfirm.addEventListener('click',()=>{try{localStorage.setItem('dzAutoPair',$('dz33-autopair').checked?'1':'0')}catch(e){}},true);}
 // Ensure the selected team size controls the correct matchmaking roster.
 const launch=()=>{
   const m=localStorage.getItem('dzMode')||'classic';const size=localStorage.getItem('dzMatchSize')||'4v4';
   if(m==='pvp'||m==='squad'){
     const count=({'1v1':2,'2v2':4,'3v3':6,'4v4':8})[size]|| (m==='pvp'?2:8);
     try{if(typeof queue==='function'&&typeof sqStart==='function'){queue('squad',count,sqStart);return true;}}catch(e){}
   }
   return false;
 };
 // Use capture so the legacy click handler cannot redirect Duo/Trio to the wrong mode.
 if(origConfirm)origConfirm.addEventListener('click',e=>{
   const selected=$('mpm')?.querySelector('[data-m].sel');const m=selected?.dataset.m||localStorage.getItem('dzMode')||'classic';
   try{localStorage.setItem('dzMode',m);localStorage.setItem('dzAutoPair',$('dz33-autopair').checked?'1':'0');if($('dz31-autopair'))$('dz31-autopair').checked=$('dz33-autopair').checked;const team=$('dz31-team-row')?.querySelector('[data-team].sel')?.dataset.team;if(team)localStorage.setItem('deadzone_party_mode',team);const sz=$('dz31-sizes')?.querySelector('[data-size].sel')?.dataset.size;if(sz)localStorage.setItem('dzMatchSize',sz);localStorage.setItem('dzRoomType',m==='pvp'?'gladiator':m==='squad'?'counter':m==='room'?(document.querySelector('#dz31-room-config [data-room].sel')?.dataset.room||'gladiator'):'normal');}catch(_){}
   if(m!=='pvp'&&m!=='squad')return;
   e.stopImmediatePropagation();e.preventDefault();
   if($('mpn'))$('mpn').style.display='none';
   if(m==='pvp'&&!['1v1','2v2'].includes(localStorage.getItem('dzMatchSize')||''))localStorage.setItem('dzMatchSize','1v1');
   if(m==='squad'&&!['3v3','4v4'].includes(localStorage.getItem('dzMatchSize')||''))localStorage.setItem('dzMatchSize','4v4');
   launch();
 },true);
 // Show the actual selected team count in the match HUD instead of hard-coded 4v4.
 const hud=$('sqh');if(hud){const update=()=>{if(typeof SQ!=='undefined'&&SQ){const n=SQ.teamCap||4;hud.innerHTML='<big style="color:#ff5050">'+(SQ.rs||0)+'</big> &nbsp; '+n+'v'+n+' &nbsp; <big style="color:#58a6ff">'+(SQ.bs||0)+'</big><br><small>🔴 '+(typeof sqAl==='function'?sqAl(0):0)+' · 🔵 '+(typeof sqAl==='function'?sqAl(1):0)+'</small>';}};setInterval(update,500);}
})();
