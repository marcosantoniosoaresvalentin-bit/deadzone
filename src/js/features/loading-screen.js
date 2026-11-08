/* Deadzone · features/loading-screen.js
 * Tela de carregamento.
 */
(()=>{
 const $=id=>document.getElementById(id);
 try{['dzMapChoice','dzMap'].forEach(k=>{if(localStorage.getItem(k)==='Zona Morte')localStorage.setItem(k,'Zona Morta')})}catch(e){}
 const IMG="assets/images/loading-screen.jpg";
 const root=document.createElement('div');root.id='dzls';
 root.innerHTML='<img class="bgb" alt="" src="'+IMG+'"><div id="dzls-stage"><img id="dzls-img" alt="Zona Morta" src="'+IMG+'"><div id="dzls-sub"></div><div id="dzls-fill"></div><div id="dzls-pct">0%</div></div>';
 document.body.appendChild(root);
 const stage=$('dzls-stage'),fill=$('dzls-fill'),pct=$('dzls-pct'),sub=$('dzls-sub');
 const TRACK=1156;
 function fit(){const u=Math.min(innerWidth/1870,innerHeight/841),w=1870*u,h=841*u;stage.style.width=w+'px';stage.style.height=h+'px';stage.style.setProperty('--u',u+'px');stage.style.transform='translate(-50%,-50%) scale('+(innerWidth/w)+','+(innerHeight/h)+')'}
 addEventListener('resize',fit);addEventListener('orientationchange',fit);fit();
 function teamLabel(){
  let t='';try{t=localStorage.getItem('deadzone_party_mode')||''}catch(e){}
  const map={solo:'SOLO',duo:'DUO',trio:'TRIO',squad:'SQUAD','1':'SOLO','2':'DUO','3':'TRIO','4':'SQUAD'};
  if(!map[t]){try{t=localStorage.getItem('dzTeamSize')||''}catch(e){}}
  return map[t]||'SQUAD';
 }
 function setP(p){p=Math.max(0,Math.min(100,p));fill.style.width='calc(var(--u)*'+(TRACK*p/100).toFixed(1)+')';pct.textContent=Math.floor(p)+'%'}
 let timer=0,t0=0;
 function show(){
  sub.textContent=teamLabel();setP(0);fit();root.classList.add('on');t0=Date.now();clearInterval(timer);
  timer=setInterval(()=>{
   const qo=$('qo');const done=!qo||qo.style.display==='none';
   if(done){clearInterval(timer);setP(100);setTimeout(hide,450);return}
   const el=(Date.now()-t0)/1000;setP(Math.min(99,el/11*100));
  },80);
 }
 function hide(){clearInterval(timer);root.classList.remove('on')}
 // tela curta ao entrar em qualquer partida (Arena, Confronto, salas): cobre a montagem do mapa
 function brief(ms){if(root.classList.contains('on'))return;sub.textContent=teamLabel();setP(0);fit();root.classList.add('on');t0=Date.now();clearInterval(timer);
  timer=setInterval(()=>{const k=(Date.now()-t0)/ms;setP(Math.min(100,k*100));if(k>=1){clearInterval(timer);setTimeout(hide,250)}},60)}
 window.dzLoad=brief;
 for(const fn of ['startMatch','sqStart']){const o=window[fn];if(typeof o==='function')window[fn]=function(){brief(1600);return o.apply(this,arguments)}}
 // Somente a partida no modo Clássico (mapa Zona Morta) usa esta tela; não há como cancelar durante o carregamento
 const orig=window.queue;
 if(typeof orig==='function'){
  window.queue=function(m){
   const r=orig.apply(this,arguments);
   if(m==='classic')show();
   return r;
  };
 }
})();
