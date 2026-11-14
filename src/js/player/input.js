/* Deadzone · player/input.js
 * Movimento, colisão, joystick, toque, teclado e estado global da partida.
 */
let ISL_=1;function GY(x,z,y){return TERH(x,z)}
function mvp(dx,dz){for(const ax of[0,1]){if(ax)P.z+=dz;else P.x+=dx;
 for(const b of near(P.x,P.z)){if(b.off||(b.yt!==undefined&&(P.y>=b.yt-.05||P.y+(b.lint?.9:1.9)<=b.yb)))continue;/* lint: parte de cima de janela/porta (dá para passar pulando pela janela) */const cx=Math.max(b.x0,Math.min(P.x,b.x1)),cz=Math.max(b.z0,Math.min(P.z,b.z1)),ex=P.x-cx,ez=P.z-cz,d=Math.hypot(ex,ez);
  if(d<.45){if(d>0){P.x+=ex/d*(.45-d);P.z+=ez/d*(.45-d)}else P.x=b.x0-.45}}}
 for(const c of CARS){if(c.heli||MP||Math.abs(c.x-P.x)>4.5||Math.abs(c.z-P.z)>4.5)continue;const sx=Math.sin(c.yaw),cz=Math.cos(c.yaw);for(const o of[-1.4,0,1.4]){const ex=P.x-(c.x+sx*o),ez=P.z-(c.z+cz*o),d=Math.hypot(ex,ez);if(d<1.55&&d>0){P.x+=ex/d*(1.55-d);P.z+=ez/d*(1.55-d)}}}
 if(MP&&AR){P.x=Math.max(AR.x0,Math.min(AR.x1,P.x));P.z=Math.max(AR.z0,Math.min(AR.z1,P.z))}
 P.x=MCLX(P.x,5);P.z=MCLZ(P.z,5)}
let yaw=0,pit=.25,ph=0,amt=0,jx=0,jy=0,keys={},tm=null,tl=null,jo={x:0,y:0},lx=0,ly=0,drag=0;
const jb=document.getElementById('jb'),jk=document.getElementById('jk');
function look(dx,dy){if(mode==='plane'){oy-=dx*.008;op=Math.max(-1.3,Math.min(1.4,op+dy*.006));return}const s=(1-(scp===3?.62:.4)*adk)*CFG.sens;yaw-=dx*.006*s;pit=Math.max(-.25,Math.min(.85,pit+dy*.004*s))}
cv.addEventListener('touchstart',e=>{e.preventDefault();for(const t of e.changedTouches){
 if(mode!=='plane'&&t.clientX<innerWidth/2&&tm===null){tm=t.identifier;jo={x:t.clientX,y:t.clientY};for(const el of[jb,jk]){el.style.display='block';el.style.left=jo.x+'px';el.style.top=jo.y+'px'}}
 else if(tl===null){tl=t.identifier;lx=t.clientX;ly=t.clientY}}},{passive:false});
cv.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches){
 if(t.identifier===tm){let x=(t.clientX-jo.x)/50,y=(t.clientY-jo.y)/50;const l=Math.hypot(x,y);if(l>1){x/=l;y/=l}jx=x;jy=y;jk.style.left=jo.x+x*50+'px';jk.style.top=jo.y+y*50+'px'}
 else if(t.identifier===tl){look(t.clientX-lx,t.clientY-ly);lx=t.clientX;ly=t.clientY}}},{passive:false});
const te=e=>{for(const t of e.changedTouches){if(t.identifier===tm){tm=null;jx=jy=0;jb.style.display=jk.style.display='none'}if(t.identifier===tl)tl=null}};
cv.addEventListener('touchend',te);cv.addEventListener('touchcancel',te);
// o dedo pode terminar fora do canvas (ex.: sobre um botão do loot): solta do mesmo jeito
addEventListener('touchend',te,true);addEventListener('touchcancel',te,true);
addEventListener('blur',()=>{tm=tl=null;jx=jy=0;jb.style.display=jk.style.display='none';firing=0});
document.addEventListener('visibilitychange',()=>{if(document.hidden){tm=tl=null;jx=jy=0;firing=0}});
cv.addEventListener('mousedown',e=>{drag=1;lx=e.clientX;ly=e.clientY});addEventListener('mouseup',()=>drag=0);
addEventListener('mousemove',e=>{if(drag){look(e.clientX-lx,e.clientY-ly);lx=e.clientX;ly=e.clientY}});
addEventListener('keydown',e=>keys[e.key.toLowerCase()]=1);addEventListener('keyup',e=>keys[e.key.toLowerCase()]=0);
const $=id=>document.getElementById(id);
const bam=$('bm'),sl=$('sl'),lpn=$('lp'),lpg=$('lpg');const bj=$('bj'),bc=$('bc'),bp=$('bp'),bf=$('bf'),lb=$('lb'),go=$('go'),msg=$('msg'),cross=$('cross');
const lp=(a,b,t)=>a+(b-a)*t,sat=v=>Math.max(0,Math.min(1,v));
let mode='lobby',gt=0,pc=0,kills=0,alive=100,hp=100,wp=null,ammo=0,fcd=0,firing=0,cw=0,tt=0,mt=0,si=0,pS=null,pD=null,sched=[],trt=0;
const bots=[],loot=[];
const ARM={vest:0,helm:0};let capHead=0,lastHS=0,dmgDone=0,rcA=0,lastHitBy=null,spec=null,ended=0,lastPing=0;
let wasAir=null,insB=null,insK=0,kk=0,dw=1,curCity=null,nearDoor=null,slk='',silP=0,vmk='',ads=0,adk=0,oy=0,op=.25,lid=0,lkey='',lhid=0,sltxt='',cur=-1,rl=0,rlT=0,rlOn=0,cast=null,sd=0,fw=0,bk=0,rfk='',scp=0;const slots=[null,null,null],bag={smoke:0,band:0,med:0,knife:0,gren:0,gel:0,fuel:0,ammo:0,sc1:0,sc2:0,sc3:0,sil:0};
