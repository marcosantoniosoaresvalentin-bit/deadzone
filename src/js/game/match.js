/* Deadzone · game/match.js
 * Início da partida e rótulos dos botões.
 */
function setLabel(){const g=mode==='ground';bj.textContent=mode==='plane'?'Saltar':mode==='sky'?'Abrir':'Pular';bf.style.display=bc.style.display=bp.style.display=bam.style.display=sl.style.display=bg_.style.display=bre.style.display=$('bi').style.display=g?'flex':'none';bj.style.display=(mode==='lobby'||mode==='dead'||mode==='drive')?'none':'flex'}
// BOTS_ON: liga/desliga os bots na partida clássica. Desativados por enquanto (o código continua aqui).
const BOTS_ON=false;
function startGame(){zonePlan();if(!BOTS_ON)alive=1;
 const ang=R(0,Math.PI*2);pD={x:Math.sin(ang),z:Math.cos(ang)};const off=R(-MAPR*.4,MAPR*.4);
 pS={x:MCX-pD.x*(MAPR+60)-pD.z*off,z:MCZ-pD.z*(MAPR+60)+pD.x*off};
 plane.visible=true;plane.rotation.y=ang;pl.visible=false;
 for(let i=0;i<(BOTS_ON?99:0);i++){const tj=R(2,PLT-2),a=R(0,6.28),d=R(0,MAPR*.3);
  sched.push({lt:tj,x:MCLX(pS.x+pD.x*PLV*tj+Math.cos(a)*d,20),z:MCLZ(pS.z+pD.z*PLV*tj+Math.sin(a)*d,20)})}
 sched.sort((a,b)=>a.lt-b.lt);
 lb.style.display='none';$('h').style.display='none';mode='plane';gt=0;setLabel();oy=ang+Math.PI;op=.25;say('Arraste a tela para girar o avião · toque em Saltar para pular',7)}
