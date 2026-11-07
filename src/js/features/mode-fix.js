/* Deadzone · features/mode-fix.js
 * Correções de modo de jogo.
 */
(()=>{
 const $=id=>document.getElementById(id);
 let roomFallbackTimer=0;
 const launchConfiguredRoom=()=>{
   const type=localStorage.getItem('dzRoomType')||'gladiator';
   const size=localStorage.getItem('dzMatchSize')||'1v1';
   const city=localStorage.getItem('dzMapChoice')||'Zona Morta';
   try{if(typeof CITIES!=='undefined'&&Array.isArray(CITIES)){const c=CITIES.find(x=>x.n===city);if(c)GMAP=c.n;else if(city==='Aleatório')GMAP=CITIES[Math.floor(Math.random()*CITIES.length)].n;}}catch(e){}
   try{if(typeof cancelRoom==='function')cancelRoom();}catch(e){}
   if($('on'))$('on').style.display='none';
   if(type==='counter'){
     const need=size==='3v3'?6:8;
     if(typeof queue==='function'&&typeof sqStart==='function')queue('squad',need,sqStart);
     else if(typeof startGame==='function')startGame();
   }else{
     const need=size==='2v2'?4:2;
     if(typeof queue==='function'&&typeof sqStart==='function')queue('squad',need,sqStart);
     else if(typeof autoPvp==='function')autoPvp();
   }
 };
 const create=$('oncr');
 if(create)create.addEventListener('click',()=>{
   clearTimeout(roomFallbackTimer);
   roomFallbackTimer=setTimeout(()=>{
     if(!$('on')||$('on').style.display!=='flex'||!$('onWait')||$('onWait').style.display!=='flex')return;
     if(typeof MP!=='undefined'&&MP)return;
     launchConfiguredRoom();
   },12000);
 });
 const wx=$('onwx'),ox=$('onx');
 [wx,ox].forEach(b=>b&&b.addEventListener('click',()=>clearTimeout(roomFallbackTimer)));
})();
