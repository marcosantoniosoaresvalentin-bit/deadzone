/* Deadzone · player/actions.js
 * Salto do avião, paraquedas, pouso, pulo, agachar e deitar.
 */
function jumpOut(){mode='sky';P.x=pS.x+pD.x*55*gt;P.z=pS.z+pD.z*55*gt;P.y=445;P.vy=0;pl.visible=true;setLabel();say('Queda livre: empurre o analógico p/ frente para mergulhar · toque em Abrir',6)}
function openChute(){mode='chute';canopy.visible=true;setLabel();say('Paraquedas: frente = mergulho · trás = planar · lados = puxar corda',5)}
function land(){mode='ground';canopy.visible=false;P.y=GY(P.x,P.z,P.y);P.vy=0;mvp(0,0);setLabel();say('Pousou! Procure armas perto das casas',5)}
function act(){if(mode==='plane'&&gt>3)jumpOut();else if(mode==='sky')openChute();else if(mode==='ground'&&P.y<=GY(P.x,P.z,P.y)+.02&&st!==2)P.vy=7}
function ui(){bc.style.background=st===1?'rgba(240,168,48,.75)':'';bp.style.background=st===2?'rgba(240,168,48,.75)':''}
function tgl(n){if(mode!=='ground')return;st=st===n?0:n;ui()}
bj.onpointerdown=e=>{e.preventDefault();act()};bc.onpointerdown=e=>{e.preventDefault();tgl(1)};bp.onpointerdown=e=>{e.preventDefault();tgl(2)};
holdFire(bf,1);holdFire(bf2,0);
addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();act()}if(e.key==='c')tgl(1);if(e.key==='z')tgl(2);if(e.key==='r')startReload();if(e.key==='q'&&mode==='ground'&&wp)ads=ads?0:1;if('123'.includes(e.key)&&mode==='ground')selSlot(+e.key-1);if(e.key==='e'&&mode==='ground'&&!MP){const n=loot.find(o=>Math.hypot(o.x-P.x,o.z-P.z)<2.4&&Math.abs((o.y||0)-P.y)<3);if(n)take(n)}});
addEventListener('touchstart',()=>{try{const d=document.documentElement;(d.requestFullscreen?d.requestFullscreen():Promise.resolve()).then(()=>screen.orientation.lock('landscape')).catch(()=>{})}catch(e){}},{once:true});
