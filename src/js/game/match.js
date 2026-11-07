/* Deadzone · game/match.js
 * Início da partida e rótulos dos botões.
 */
function setLabel(){const g=mode==='ground';bj.textContent=mode==='plane'?'Saltar':mode==='sky'?'Abrir':'Pular';bf.style.display=bc.style.display=bp.style.display=bam.style.display=sl.style.display=bg_.style.display=bre.style.display=$('bi').style.display=g?'flex':'none';bj.style.display=(mode==='lobby'||mode==='dead'||mode==='drive')?'none':'flex'}
function startGame(){zonePlan();
 const ang=R(0,Math.PI*2);pD={x:Math.sin(ang),z:Math.cos(ang)};const off=R(-450,450);
 pS={x:-pD.x*1250-pD.z*off,z:-pD.z*1250+pD.x*off};
 plane.visible=true;plane.rotation.y=ang;pl.visible=false;
 for(let i=0;i<99;i++){const tj=R(3,42),a=R(0,6.28),d=R(0,260);
  sched.push({lt:tj,x:Math.max(-1170,Math.min(1170,pS.x+pD.x*55*tj+Math.cos(a)*d)),z:Math.max(-1170,Math.min(1170,pS.z+pD.z*55*tj+Math.sin(a)*d))})}
 sched.sort((a,b)=>a.lt-b.lt);
 lb.style.display='none';$('h').style.display='none';mode='plane';gt=0;setLabel();oy=ang+Math.PI;op=.25;say('Arraste a tela para girar o avião · toque em Saltar para pular',7)}
