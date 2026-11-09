/* Deadzone · features/loading-screen.js
 * TELA DE CARREGAMENTO no estilo dos battle royales: imagem do próprio jogo em tela cheia, logo,
 * modo de jogo, dica e uma barra fina com a porcentagem. Usada ao entrar em qualquer partida.
 */
(()=>{
 const $=id=>document.getElementById(id);
 try{['dzMapChoice','dzMap'].forEach(k=>{if(localStorage.getItem(k)==='Zona Morte')localStorage.setItem(k,'Zona Morta')})}catch(e){}
 const IMGS=['assets/images/load1.jpg','assets/images/load2.jpg','assets/images/load3.jpg'];
 const TIPS=['Abaixe atrás de muros e carros para recarregar com segurança.','A zona azul machuca cada vez mais: fique de olho no mapa e no relógio da zona.','Colete e capacete reduzem muito o dano. Troque por um de nível maior quando achar.','Use a granada de fumaça para atravessar ruas abertas.','A Ilha Zênite tem o melhor equipamento, mas é a mais disputada.','No avião, toque em Seguir para pular junto com o parceiro.','Cada arma usa a sua munição: confira o calibre na mochila.','O planador precisa de uns 50 km/h para decolar.','Pule janelas e muretas com o botão de pulo.'];
 const st=document.createElement('style');st.textContent=`
#dzls{position:fixed;inset:0;z-index:99999;display:none;background:#05070a;overflow:hidden;user-select:none;-webkit-user-select:none;touch-action:none;font-family:system-ui,sans-serif}
#dzls.on{display:block}
#dzls .bg{position:absolute;inset:0;background:center/cover no-repeat;animation:dzlsz 9s ease-out forwards}
@keyframes dzlsz{from{transform:scale(1.08)}to{transform:scale(1)}}
#dzls .sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35) 0,rgba(0,0,0,0) 30%,rgba(0,0,0,0) 55%,rgba(0,0,0,.85) 100%)}
#dzls .lg{position:absolute;left:calc(env(safe-area-inset-left,0px) + 4%);top:7%}
#dzls .lg b{display:block;font:900 clamp(30px,6vw,58px)/1 system-ui;letter-spacing:.14em;color:#fff;text-shadow:0 4px 18px rgba(0,0,0,.6)}
#dzls .lg b i{font-style:normal;color:#f3c35a}
#dzls .lg small{display:block;margin-top:6px;font:800 12px system-ui;letter-spacing:.35em;color:#e8eef2;text-shadow:0 1px 4px #000}
#dzls .ft{position:absolute;left:4%;right:4%;bottom:calc(env(safe-area-inset-bottom,0px) + 5%)}
#dzls .tp{color:#e9eef2;font:600 13px system-ui;margin-bottom:10px;text-shadow:0 1px 3px #000;max-width:70%}
#dzls .tp b{color:#f3c35a;font-weight:800;margin-right:6px}
#dzls .br{height:4px;background:rgba(255,255,255,.18);border-radius:2px;overflow:hidden}
#dzls .br u{display:block;height:100%;width:0;background:linear-gradient(90deg,#e0a52c,#f6cf6a);box-shadow:0 0 10px rgba(243,195,90,.7);transition:width .25s}
#dzls .pc{position:absolute;right:0;bottom:12px;font:800 14px system-ui;color:#fff;text-shadow:0 1px 3px #000}`;
 document.head.appendChild(st);
 const root=document.createElement('div');root.id='dzls';
 root.innerHTML='<div class="bg"></div><div class="sh"></div><div class="lg"><b>DEAD<i>ZONE</i></b><small id="dzls-sub"></small></div><div class="ft"><div class="tp" id="dzls-tip"></div><div class="pc" id="dzls-pct">0%</div><div class="br"><u id="dzls-fill"></u></div></div>';
 document.body.appendChild(root);
 const fill=$('dzls-fill'),pct=$('dzls-pct'),sub=$('dzls-sub'),tip=$('dzls-tip'),bg=root.querySelector('.bg');
 let ii=Math.floor(Math.random()*IMGS.length);
 function teamLabel(){
  let t='';try{t=localStorage.getItem('deadzone_party_mode')||''}catch(e){}
  const map={solo:'SOLO',duo:'DUPLA',trio:'TRIO',squad:'ESQUADRÃO','1':'SOLO','2':'DUPLA','3':'TRIO','4':'ESQUADRÃO'};
  if(!map[t]){try{t=localStorage.getItem('dzTeamSize')||''}catch(e){}}
  let m='';try{m=(window.GMODE)||localStorage.getItem('dzMode')||'classic'}catch(e){}
  const mn=m==='pvp'?'DUELO':m==='squad'?'MATA-MATA EM EQUIPE':'CLÁSSICO';
  return mn+(m==='classic'?' · '+(map[t]||'ESQUADRÃO'):'');
 }
 function prep(){ii=(ii+1)%IMGS.length;bg.style.backgroundImage='url('+IMGS[ii]+')';bg.style.animation='none';void bg.offsetWidth;bg.style.animation='';sub.textContent=teamLabel();tip.innerHTML='<b>DICA</b>'+TIPS[Math.floor(Math.random()*TIPS.length)]}
 function setP(p){p=Math.max(0,Math.min(100,p));fill.style.width=p+'%';pct.textContent=Math.floor(p)+'%'}
 let timer=0,t0=0;
 function show(){
  prep();setP(0);root.classList.add('on');t0=Date.now();clearInterval(timer);
  timer=setInterval(()=>{
   const qo=$('qo');const done=!qo||qo.style.display==='none';
   if(done){clearInterval(timer);setP(100);setTimeout(hide,450);return}
   const el=(Date.now()-t0)/1000;setP(Math.min(99,el/11*100));
  },80);
 }
 function hide(){clearInterval(timer);root.classList.remove('on')}
 // tela curta ao entrar em qualquer partida (modos de equipe, salas): cobre a montagem do mapa
 function brief(ms){if(root.classList.contains('on'))return;prep();setP(0);root.classList.add('on');t0=Date.now();clearInterval(timer);
  timer=setInterval(()=>{const k=(Date.now()-t0)/ms;setP(Math.min(100,k*100));if(k>=1){clearInterval(timer);setTimeout(hide,250)}},60)}
 window.dzLoad=brief;
 for(const fn of ['startMatch','sqStart']){const o=window[fn];if(typeof o==='function')window[fn]=function(){brief(1600);return o.apply(this,arguments)}}
 const orig=window.queue;
 if(typeof orig==='function'){
  window.queue=function(m){
   const r=orig.apply(this,arguments);
   if(m==='classic')show();
   return r;
  };
 }
})();
