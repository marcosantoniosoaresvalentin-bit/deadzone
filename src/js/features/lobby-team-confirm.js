/* Deadzone · features/lobby-team-confirm.js
 * Confirmação de equipe no lobby.
 */
(()=>{
 const $=id=>document.getElementById(id); const panel=$('mpn'),confirm=$('dz31-confirm'),go=$('go');
 if(!panel||!confirm||!go)return;
 // Confirming the map/mode only saves the selection and returns to the lobby.
 confirm.addEventListener('click',e=>{
   e.preventDefault();e.stopImmediatePropagation();
   const selected=panel.querySelector('#mpm [data-m].sel')?.dataset.m||'classic';
   const team=panel.querySelector('#dz31-team-row [data-team].sel')?.dataset.team||'squad';
   const size=panel.querySelector('#dz31-sizes [data-size].sel')?.dataset.size||({'solo':'1v1','duo':'2v2','trio':'3v3','squad':'4v4'}[team]||'4v4');
   const roomType=panel.querySelector('#dz31-room-config [data-room].sel')?.dataset.room||(selected==='pvp'?'gladiator':selected==='squad'?'counter':'normal');
   const auto=!!$('dz33-autopair')?.checked;
   try{localStorage.setItem('dzMode',selected);localStorage.setItem('dzSelectedMode',selected);localStorage.setItem('deadzone_party_mode',team);localStorage.setItem('dzMatchSize',size);localStorage.setItem('dzTeamSize',({'solo':'1','duo':'2','trio':'3','squad':'4'})[team]||'4');localStorage.setItem('dzRoomType',roomType);localStorage.setItem('dzAutoPair',auto?'1':'0');localStorage.setItem('dzMapChoice',panel.querySelector('#mpc [data-map].sel')?.dataset.map||'Zona Morta');}catch(_){ }
   window.GMODE=selected;
   panel.style.display='none';
   const label=$('mapb'); if(label){const names={classic:'Clássico',pvp:'Gladiadores',squad:'Contra Squad',room:'Criar sala'};label.textContent='🗺 '+(names[selected]||'Mapa')+' · '+(localStorage.getItem('dzMapChoice')||'Zona Morta')+' · '+team.toUpperCase();}
   const status=$('msg');if(status)status.textContent='Seleção salva. Toque em INICIAR no lobby para começar.';
 },true);
 // Starting from the lobby launches the saved configuration, never from the confirm screen.
 go.onclick=e=>{
   e.preventDefault();e.stopImmediatePropagation();
   const m=localStorage.getItem('dzSelectedMode')||localStorage.getItem('dzMode')||'classic';
   const size=localStorage.getItem('dzMatchSize')||'4v4';
   const type=localStorage.getItem('dzRoomType')||'normal';
   const auto=localStorage.getItem('dzAutoPair')!=='0';
   let map=localStorage.getItem('dzMapChoice')||'Zona Morta';
   try{if(typeof CITIES!=='undefined'&&Array.isArray(CITIES)){if(map==='Aleatório')GMAP=CITIES[Math.floor(Math.random()*CITIES.length)].n;else GMAP=CITIES.find(c=>c.n===map)?.n||CITIES[0].n;}}catch(_){ }
   if(m==='room'){
     selCity=GMAP;$('on').style.display='flex';if(typeof onShow==='function')onShow('onCreate');
     const roomName=(type==='gladiator'?'Gladiadores ':type==='counter'?'Contra Squad ':'Sala ')+size;
     if($('onn'))$('onn').value=roomName;if($('onst'))$('onst').textContent=roomName+' · '+GMAP;
     if($('onct'))$('onct').innerHTML='<button class="sel" disabled>'+GMAP+'</button>';return;
   }
   if(m==='pvp'){
     if(size==='2v2'){
       if(typeof queue==='function'&&typeof sqStart==='function')queue('squad',4,sqStart);else if(typeof autoPvp==='function')autoPvp();
     }else if(typeof autoPvp==='function')autoPvp();
     return;
   }
   if(m==='squad'){
     const need=size==='3v3'?6:8;
     if(typeof queue==='function'&&typeof sqStart==='function')queue('squad',need,sqStart);else if(typeof startGame==='function')startGame();return;
   }
   // Clássico: mapa completo com o jogador e três aliados locais.
   if(typeof queue==='function'&&typeof clStart==='function')queue('classic',100,clStart);
   else if(typeof startGame==='function')startGame();
  };

  let companions=[],teamHud=null,followTimer=null,teamCreated=false;
  const teamTags=[];
  function level(){try{if(typeof PR!=='undefined'&&PR&&typeof lvOf==='function')return lvOf(PR.xp||0)}catch(_){ }return 1}
  function cleanCompanions(){
   for(const c of companions){try{if(c.label&&c.label.parentNode)c.label.remove()}catch(_){}}
   for(const t of teamTags){try{if(t.label&&t.label.parentNode)t.label.remove()}catch(_){}}
   teamTags.length=0;companions=[];teamCreated=false;
   if(followTimer){clearInterval(followTimer);followTimer=null}
   if(teamHud){teamHud.remove();teamHud=null}
  }
  const botNames=['Raven','Ghost','Viper','Falcão','Sombra','Hunter','Ninja','Trovão','Wolf','Spectro','Blade','Venom','Drako','Phoenix','Titan','Zero','Raptor','Sniper','Cobra','Lobo','Aço','Fênix','Kratos','Maverick','Shadow','Onyx','Reaper','Storm','Atlas','Dante'];
  function randomBotName(used){
   let pool=botNames.filter(n=>!used.has(n));if(!pool.length)pool=botNames;
   const n=pool[Math.floor(Math.random()*pool.length)];used.add(n);return n;
  }
  function createCompanions(){
   if(teamCreated||!pS||!pD)return;
   if(typeof BOTS_ON!=='undefined'&&!BOTS_ON)return; // bots desativados (ver game/match.js)
   cleanCompanions();
   for(let i=bots.length-1;i>=0;i--){const b=bots[i];if(b.team===1){sc.remove(b.g);bots.splice(i,1)}}
   const team=localStorage.getItem('deadzone_party_mode')||localStorage.getItem('dzTeamSize')||'squad';
   const cap=({'solo':1,'duo':2,'trio':3,'squad':4,'1':1,'2':2,'3':3,'4':4})[team]||4;
   // companheiros bots só com AUTOPAREAMENTO marcado; na partida em grupo só o dono da sala cria (e envia para os outros)
   const autoOn=(()=>{try{const c=document.getElementById('dz33-autopair')||document.getElementById('dz31-autopair');return c?c.checked:localStorage.getItem('dzAutoPair')!=='0'}catch(e){return true}})();
   if(typeof N!=='undefined'&&N&&!N.host){teamCreated=true;return}
   const count=autoOn?Math.max(0,cap-1-(window.dzRealAllies||0)):0,meLv=level(),used=new Set(),roster=[];
   for(let i=0;i<count;i++)roster.push({name:randomBotName(used),lv:Math.max(1,meLv-i-1)});
   const baseX=pS.x+pD.x*PLV*(gt+12),baseZ=pS.z+pD.z*PLV*(gt+12);
   roster.forEach((r,i)=>{
    const ang=(i/Math.max(1,count))*Math.PI*2+Math.PI/4;
    const tx=MCLX(baseX+Math.cos(ang)*18,20);
    const tz=MCLZ(baseZ+Math.sin(ang)*18,20);
    const b=spawnBot({x:tx,z:tz});
    b.team=1;b.nm=r.name;b.lv=r.lv;b.squadSlot=i+2;b.hp=100;b.isCompanion=true;
    b.waitForPlayer=true;b.waitOffsetX=Math.cos(ang)*5;b.waitOffsetZ=Math.sin(ang)*5;
    const label=document.createElement('div');label.textContent=r.name;
    label.style.cssText='position:fixed;z-index:24;color:#fff;background:transparent;border:0;border-radius:0;padding:0;font:600 9px/1.1 system-ui;letter-spacing:.15px;pointer-events:none;white-space:nowrap;text-shadow:0 1px 2px #000,0 0 4px #000';
    document.body.appendChild(label);teamTags.push({bot:b,label});companions.push({g:b.g,label,roster:r,bot:b});
   });
   teamCreated=true;
  }
  function updateTeamTags(){
   for(const item of teamTags){
    const b=item.bot,l=item.label;
    if(!l||!b||b.dead||!b.g.visible||mode==='lobby'||mode==='dead'){if(l)l.style.display='none';continue}
    const v=new T.Vector3(b.x,b.y+(b.air?2.7:2.25),b.z).project(cam);
    const visible=v.z>-1&&v.z<1&&Math.abs(v.x)<1.15&&Math.abs(v.y)<1.15;
    l.style.display=visible?'block':'none';
    if(visible){l.style.left=((v.x+1)*.5*innerWidth)+'px';l.style.top=((1-v.y)*.5*innerHeight)+'px';l.style.transform='translate(-50%,-35%)'}
   }
  }
  setInterval(updateTeamTags,50);
  const oldStartGame=window.startGame;
  if(typeof oldStartGame==='function')window.startGame=function(){
   cleanCompanions();const result=oldStartGame.apply(this,arguments);
   setTimeout(()=>{if(mode!=='lobby'&&mode!=='dead'&&pS&&pD)createCompanions()},80);return result;
  };
  const oldClStart=window.clStart;
  if(typeof oldClStart==='function')window.clStart=function(){
   cleanCompanions();const result=oldClStart.apply(this,arguments);
   setTimeout(()=>{if(mode!=='lobby'&&mode!=='dead'&&pS&&pD)createCompanions()},120);return result;
  };
  document.addEventListener('click',e=>{
   const b=e.target.closest('#go');if(!b)return;
   setTimeout(()=>{
    const selected=localStorage.getItem('dzSelectedMode')||localStorage.getItem('dzMode')||'classic';
    if(selected==='classic'&&mode!=='lobby'&&mode!=='dead'&&pS&&pD&&!teamCreated)createCompanions();
   },900);
  },true);
  setInterval(()=>{
   const selected=localStorage.getItem('dzSelectedMode')||localStorage.getItem('dzMode')||'classic';
   if(selected==='classic'&&mode!=='lobby'&&mode!=='dead'&&pS&&pD&&!teamCreated)createCompanions();
  },350);
})();
