/* Deadzone · combat/shotgun.js
 * Espalhamento e dano da escopeta.
 */
// ---- escopeta estilo Free Fire: 8 projéteis, dano cai com a distância ----
{let PEL=0,PI=0;const _rc=recoil;recoil=function(){if(PEL&&PI>0)return;_rc()};
 const _hf=hitFx;hitFx=function(x,y,z,dm,head,kill){if(PEL&&Math.round(dm)<=0)return;_hf(x,y,z,dm,head,kill);if(PEL){const d=document.body.lastElementChild;if(d&&d.classList.contains('dn')){d.style.left=(parseFloat(d.style.left)+(PI-3.5)*26)+'px';d.style.top=(parseFloat(d.style.top)-(PI%2)*14)+'px'}}};
 const _ff=fire;fire=function(fx,fz){if(wp!=='shotgun'||PEL)return _ff(fx,fz);PEL=1;const q0=cam.quaternion.clone(),sp=ads?.03:.05,e=new T.Euler(),qo=new T.Quaternion();
  try{for(PI=0;PI<8;PI++){if(PI>0){const a=Math.random()*6.2832,r=Math.sqrt(Math.random())*sp;e.set(Math.sin(a)*r,Math.cos(a)*r,0,'YXZ');qo.setFromEuler(e);cam.quaternion.copy(q0).multiply(qo);cam.updateMatrixWorld(true)}_ff(fx,fz)}}
  finally{cam.quaternion.copy(q0);cam.updateMatrixWorld(true);PEL=0;PI=0}}}
// ===== v24: pacote de animações =====
{const s=document.createElement('style');s.textContent='@keyframes dzk{from{opacity:0;transform:translateX(34px)}to{opacity:1;transform:none}}#kf div{animation:dzk .22s ease-out}.bt{transition:filter .08s,box-shadow .12s}.bt:active{filter:brightness(1.4)}#sl div{transition:background .15s,border-color .15s}';document.head.appendChild(s)}
