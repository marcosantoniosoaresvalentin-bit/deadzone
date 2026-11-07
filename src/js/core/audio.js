/* Deadzone · core/audio.js
 * Sons sintetizados e indicadores de direção.
 */
let AC=null,NB=null;
function aud(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();const n=AC.sampleRate*.2|0;NB=AC.createBuffer(1,n,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1}catch(e){AC=null}}
function sfx(f,v,dur,pan){if(!AC||v<=.01)return;try{if(AC.state==='suspended')AC.resume();const s=AC.createBufferSource(),fl=AC.createBiquadFilter(),g=AC.createGain(),t=AC.currentTime;s.buffer=NB;fl.type='lowpass';fl.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(fl);fl.connect(g);if(AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan||0));g.connect(p);p.connect(AC.destination)}else g.connect(AC.destination);s.start();s.stop(t+dur+.02)}catch(e){}}
function vSnd(sy){return(mode==='ground'&&Math.abs(P.y-(sy||0))>60)?0:1}
addEventListener('pointerdown',aud);addEventListener('keydown',aud);
const indE=$('ind');let indN=0;
function pingDir(x,z,k){if(indN>8)return;if(k!=='hit'&&!vSnd(0))return;const dx=x-P.x,dz=z-P.z,fx=Math.sin(yaw),fz=Math.cos(yaw),a=dx*fx+dz*fz,b=-dx*fz+dz*fx,th=Math.atan2(b,a),d=Math.hypot(dx,dz),R_=Math.min(innerWidth,innerHeight)*(k==='hit'?.36:.3);
 if(k==='step')sfx(260,Math.max(0,1-d/38)*1.1,.14,Math.sin(th));
 const e=document.createElement('div');e.className='pg '+k;e.textContent=k==='hit'?'▲':k==='shot'?'🔊':'👣';e.style.left=innerWidth/2+Math.sin(th)*R_+'px';e.style.top=innerHeight/2-Math.cos(th)*R_+'px';e.style.transform='translate(-50%,-50%)'+(k==='hit'?' rotate('+th+'rad)':'');indE.appendChild(e);indN++;setTimeout(()=>{e.remove();indN--},k==='hit'?1450:1050)}
