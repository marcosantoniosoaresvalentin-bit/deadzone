/* Deadzone · features/victory-screen.js
 * Tela de vitória.
 */
(()=>{
 const WIMG="assets/images/victory-screen.jpg";
 const css=document.createElement('style');css.id='dz-win-css';
 css.textContent='#eg.win{--egimg:url("'+WIMG+'")}'
 +'#eg.win .eg-stage{width:calc(1870*var(--e));height:calc(841*var(--e))}'
 +'#eg .wv{position:absolute;white-space:nowrap;line-height:1;pointer-events:none;transform:translate(-50%,-50%);font-family:var(--egh);font-weight:900;color:#ffd60a;text-shadow:0 calc(3*var(--e)) 0 #6b3d00,0 0 calc(10*var(--e)) rgba(255,190,0,.55),0 0 calc(2*var(--e)) #000}'
 +'#eg .wv.w1{left:calc(824*var(--e));top:calc(347*var(--e));font-size:calc(60*var(--e))}'
 +'#eg .wv.w2{left:calc(1252*var(--e));top:calc(347*var(--e));font-size:calc(60*var(--e))}'
 +'#eg .wv.w3{left:calc(838*var(--e));top:calc(478*var(--e));font-size:calc(60*var(--e))}'
 +'#eg .wv.w4{left:calc(1269*var(--e));top:calc(478*var(--e));font-size:calc(46*var(--e))}'
 +'#eg .wv.w5{left:calc(1226*var(--e));top:calc(524*var(--e));font-family:var(--egf);font-weight:800;font-size:calc(30*var(--e));color:#fff;text-shadow:0 calc(2*var(--e)) calc(3*var(--e)) #000}'
 +'#eg .wv.w6{left:calc(994*var(--e));top:calc(656*var(--e));font-family:var(--egf);font-weight:700;font-size:calc(33*var(--e));color:#fff;text-shadow:0 calc(2*var(--e)) calc(4*var(--e)) #000}'
 +'#eg.win #egr{left:calc(675*var(--e));top:calc(718*var(--e));width:calc(620*var(--e));height:calc(100*var(--e))}';
 document.head.appendChild(css);
 window.egFit=function(){const e=document.getElementById('eg');if(!e)return;const w=e.classList.contains('win');e.style.setProperty('--e',Math.min(innerWidth/(w?1870:2022),innerHeight/(w?841:778))+'px')};
 addEventListener('resize',()=>window.egFit());
 const _g=gEnd;
 gEnd=function(w){
  _g.apply(this,arguments);
  const e=document.getElementById('eg');if(!e)return;
  if(!w){e.classList.remove('win');return}
  if(e.classList.contains('win'))return;
  const t=c=>{const n=e.querySelector(c);return n?n.textContent:''};
  const k=t('.v1'),d=t('.v2'),tm=t('.v3'),xp=t('.v4'),co=t('.eg-s');
  e.classList.add('win');
  e.innerHTML='<div class="eg-stage"><div class="eg-scene"></div>'
   +'<div class="wv w1">'+k+'</div><div class="wv w2">'+d+'</div><div class="wv w3">'+tm+'</div><div class="wv w4">'+xp+'</div><div class="wv w5">'+co+'</div>'
   +'<div class="wv w6">Você: '+k+' abate(s) · '+d+' de dano</div>'
   +'<button id="egr" type="button" aria-label="Voltar ao lobby"></button></div>';
  window.egFit();
 };
})();
