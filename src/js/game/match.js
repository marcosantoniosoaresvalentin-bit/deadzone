/* Deadzone · game/match.js
 * Início da partida e rótulos dos botões.
 */
function setLabel(){const g=mode==='ground';bj.textContent=mode==='plane'?'Saltar':mode==='sky'?'Abrir':'Pular';bf.style.display=bc.style.display=bp.style.display=bam.style.display=sl.style.display=bg_.style.display=bre.style.display=$('bi').style.display=g?'flex':'none';bj.style.display=(mode==='lobby'||mode==='dead'||mode==='drive')?'none':'flex'}
// BOTS_ON: bots na partida clássica. Completam a partida quando não há jogadores reais suficientes.
// Quantidade: Configurações > Bots na partida (Poucos 15 · Normal 30 · Muitos 50).
const BOTS_ON=true;
const botCount=()=>[15,30,50][Math.max(0,Math.min(2,(typeof CFG!=='undefined'&&CFG.bots!=null)?CFG.bots:1))];
// ponto de pouso em TERRA perto do caminho do avião (nunca no mar entre as ilhas)
function botLand(px,pz){const L=(window.DZLS||LS);let best=null,bd=1e9;for(let k=0;k<12;k++){const s=L[Math.floor(Math.random()*L.length)];if(!s)break;const d=Math.hypot(s.x-px,s.z-pz)+Math.random()*80;if(d<bd){bd=d;best=s}}
 if(best)return{x:best.x+R(-6,6),z:best.z+R(-6,6)};for(let k=0;k<30;k++){const x=px+R(-120,120),z=pz+R(-120,120);if(TERH(x,z)>1)return{x,z}}return{x:MCX,z:MCZ}}
function startGame(){zonePlan();const NB=BOTS_ON?botCount():0;alive=1+NB;
 /* começa do zero: sem bots agendados de outra chamada (senão juntava 100 bots) */sched.length=0;si=0;for(let i=bots.length-1;i>=0;i--){if(bots[i].team===1)continue;sc.remove(bots[i].g);bots.splice(i,1)}
 const ang=R(0,Math.PI*2);pD={x:Math.sin(ang),z:Math.cos(ang)};const off=R(-MAPR*.4,MAPR*.4);
 pS={x:MCX-pD.x*(MAPR+60)-pD.z*off,z:MCZ-pD.z*(MAPR+60)+pD.x*off};
 plane.visible=true;plane.rotation.y=ang;pl.visible=false;
 for(let i=0;i<NB;i++){const tj=R(2,PLT-2),q=botLand(pS.x+pD.x*PLV*tj,pS.z+pD.z*PLV*tj);
  sched.push({lt:tj,x:q.x,z:q.z})}
 sched.sort((a,b)=>a.lt-b.lt);
 lb.style.display='none';$('h').style.display='none';mode='plane';gt=0;setLabel();oy=ang+Math.PI;op=.25;say('Arraste a tela para girar o avião · toque em Saltar para pular',7)}
