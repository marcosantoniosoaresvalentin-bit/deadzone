/* Deadzone · network/matchmaking.js
 * Pareamento, PVP, Contra Squad e Clássico online.
 */
// ===== v2: pareamento, PVP c/ bot, Contra Squad 4v4 =====
{const s=document.createElement('style');s.textContent='#qo{position:fixed;inset:0;z-index:10;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(8,12,8,.96);color:#fff;text-align:center;padding:20px}#qo button,#sqs button,#sqb{background:#f0a830;color:#1a1405;border:0;border-radius:8px;font-weight:800;padding:10px 18px;font-size:15px;margin:3px}#sqh{position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:4;color:#fff;font-weight:800;text-align:center;background:rgba(0,0,0,.55);padding:4px 16px;border-radius:10px;display:none;pointer-events:none;font-size:15px}#sqh big{font-size:22px}#sqb{position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:6;display:none}#sqs{position:fixed;inset:0;z-index:9;display:none;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.8);color:#fff;gap:6px}#sqs button:disabled{opacity:.4}#sqg{display:flex;flex-wrap:wrap;justify-content:center;max-width:520px}';document.head.appendChild(s);
 const q=document.createElement('div');q.id='qo';q.innerHTML='<div class="spin"></div><b id="qt" style="font-size:20px"></b><p id="qc"></p><button id="qx">Cancelar</button>';document.body.appendChild(q);
 const h=document.createElement('div');h.id='sqh';document.body.appendChild(h);
 const b=document.createElement('button');b.id='sqb';b.textContent='🛒 Loja';document.body.appendChild(b);
 const p=document.createElement('div');p.id='sqs';p.innerHTML='<h2 id="sqm" style="margin:0"></h2><div id="sqg"></div><button id="sqc">Fechar</button>';document.body.appendChild(p)}

// ---- fila de pareamento REAL (MQTT): acha jogadores, elege host, devolve roster
function queue(m,need,done){m=m+'_'+need;const QO=$('qo');let on=1,t0=Date.now(),sub=0,lp=0,c=0,GO=null,go2=0;const U={};QO.style.display='flex';mqConn();
 const key=TP+'q/'+m+'/'+mpId,pre=TP+'q/'+m+'/',gt_=TP+'go/'+m;
 const lis=(tp,pl_)=>{const s=pl_.toString();if(tp===gt_){try{const g=JSON.parse(s);if(g.ids&&g.ids.includes(mpId)&&!GO)GO=g}catch(e){}return}
  if(!tp.startsWith(pre))return;const id=tp.slice(pre.length),now=Date.now();if(!s){delete U[id];return}let qv;try{qv=JSON.parse(s)}catch(e){return}const q=qv.c;const u=U[id];if(!u)U[id]={c:q,t:now,k:0,name:String(qv.name||'').slice(0,22)};else{u.name=String(qv.name||u.name||'').slice(0,22);if(u.c!==q){u.c=q;u.t=now;u.k=1}}};
 if(mq)mq.on('message',lis);
 const stop=()=>{on=0;clearInterval(iv);QO.style.display='none';if(mq){mq.removeListener('message',lis);try{if(mq.connected){mq.publish(key,'',{retain:true,qos:0});mq.unsubscribe(pre+'+');mq.unsubscribe(gt_)}}catch(e){}}};
 $('qx').onclick=stop;
 const iv=setInterval(()=>{if(!on)return;const el=(Date.now()-t0)/1000,now=Date.now();
  if(mq&&mq.connected){if(!sub){sub=1;mq.subscribe(pre+'+');mq.subscribe(gt_,{qos:1})}if(now-lp>2000){lp=now;mq.publish(key,JSON.stringify({c:++c,name:(()=>{try{const u=JSON.parse(localStorage.getItem('deadzone_current_user')||'null');return String(localStorage.getItem('deadzone_player_name')||u?.name||'Jogador').slice(0,22)}catch(_){return 'Jogador'}})()}),{retain:true,qos:0})}}
  const fr=Object.keys(U).filter(id=>id!==mpId&&U[id].k&&now-U[id].t<7000).sort();const n=Math.min(1+fr.length,need);
  $('qt').textContent='Pareando jogadores... '+Math.max(0,Math.ceil(10-el))+'s';
  $('qc').innerHTML='Jogadores reais encontrados: <b>'+n+'</b> / '+need+'<br><small>Jogadores têm prioridade · '+(need-n)+' vaga(s) serão completadas por bots</small>';
  if(el<10)return;
  if(!GO&&!go2){const ids=[mpId,...fr].sort().slice(0,need);if(ids[0]===mpId||el>=17){const chosen=ids[0]===mpId?ids:[mpId];const names={};names[mpId]=(()=>{try{const u=JSON.parse(localStorage.getItem('deadzone_current_user')||'null');return String(localStorage.getItem('deadzone_player_name')||u?.name||'Jogador').slice(0,22)}catch(_){return 'Jogador'}})();for(const id of chosen)if(U[id]?.name)names[id]=U[id].name;GO={mid:Math.random().toString(36).slice(2,8),ids:chosen,seed:Math.random()*4e9>>>0,city:CITIES[Math.random()*CITIES.length|0].n,names};go2=1;
    if(GO.ids.length>1&&mq&&mq.connected){let k=0;const pv=setInterval(()=>{mq.publish(gt_,JSON.stringify(GO),{qos:1});if(++k>5)clearInterval(pv)},400)}}}
  if(GO){stop();done(GO.ids,GO.mid,GO.seed,GO.city,GO.names||{})}},500)}

// ---- PVP: pareia com jogador; sem ninguém em ~12s entra um bot
let BB=null;const WL=['rifle','shotgun','pistol','sniper'],ACC={rifle:.14,shotgun:.3,pistol:.22,sniper:.3};
const _snd=snd;snd=function(m,q){if(opId==='BOT'){if(BB){if(m.t==='hit')BB.hp-=m.d;else if(m.t==='down')BB.dead=1}return}if(SQ&&N&&(m.t==='gel'||m.t==='gs'||m.t==='gr'||m.t==='ice')){gp(m,q);return}_snd(m,q)};
let bnn=0;const brx=m=>{m.from='BOT';m.n=++bnn;mpMsg(m)};
setInterval(()=>{if(opId!=='BOT'||!RB||!OP||MPDONE||!BB)return;const dt=.07,A=AR;
 if(BB.r!==RB.r){BB.r=RB.r;BB.hp=100;BB.dead=0;BB.x=A.cx;BB.z=A.cz+22;BB.cd=1}
 if(RB.state==='pick'&&(RB.r===3||RB.r===5)&&!BB.ch[RB.r]){BB.ch[RB.r]=1;brx({t:'w',r:RB.r,k:RB.r<5?'ab':'b',w:WL[Math.random()*4|0]})}
 let mv=0,y=BB.y;
 if(RB.state==='live'&&!BB.dead){const dx=P.x-BB.x,dz=P.z-BB.z,d=Math.hypot(dx,dz)||1,w=OP.w||'rifle',want=Math.min(14,WS[w].rg*.5);y=Math.atan2(dx,dz);
  BB.sw-=dt;if(BB.sw<=0){BB.sw=R(.8,2);BB.sd=Math.random()<.5?-1:1}
  const f=d>want+2?1:d<want-4?-1:0,vx=(dx/d*f-dz/d*BB.sd*.8)*3.2*dt,vz=(dz/d*f+dx/d*BB.sd*.8)*3.2*dt;mv=1;
  BB.x=Math.max(A.x0+1,Math.min(A.x1-1,BB.x+vx));BB.z=Math.max(A.z0+1,Math.min(A.z1-1,BB.z+vz));
  BB.cd-=dt;if(BB.cd<=0&&d<WS[w].rg&&!smokeB(BB.x,BB.z,P.x,P.z)){BB.cd=WS[w].r*1.5+R(0,.2);brx({t:'f'});if(Math.random()<ACC[w])brx({t:'hit',d:w==='shotgun'?sgD(d):WS[w].d})}
  if(BB.hp<=0){BB.dead=1;brx({t:'down'})}}
 BB.y=y;brx({t:'s',x:+BB.x.toFixed(2),z:+BB.z.toFixed(2),y:+y.toFixed(2),mv,h:Math.max(0,BB.hp)|0,r:BB.r})},70);
function autoPvp(){selCity=GMAP;$('on').style.display='flex';onShow('onWait');$('onwt').textContent='Procurando jogador...';mqConn();const t0=Date.now(),BAD={},W=()=>$('on').style.display==='flex'&&$('onWait').style.display==='flex';
 const join=r=>{cancelRoom();mpCity=r.city;mpWho='b';opId=r.id;mq.publish(TP+'p/'+r.id,JSON.stringify({t:'join',from:mpId}),{qos:1});$('onwt').textContent='Entrando na partida...';setTimeout(()=>{if(!MP){BAD[r.id]=1;opId=''}},5000)};
 const iv=setInterval(()=>{if(MP||!W()){clearInterval(iv);return}const el=(Date.now()-t0)/1000;
  if(el>20){clearInterval(iv);cancelRoom();mpWho='a';mpCity=GMAP;opId='BOT';BB={hp:100,x:0,z:0,r:0,dead:0,cd:1,sw:1,sd:1,y:Math.PI,ch:{}};startMatch();return}
  if(mq&&mq.connected&&(!opId||myRoom)){const l=Object.values(ROOMS).filter(r=>r.s==='wait'&&r.id!==mpId&&r.city===GMAP&&String(r.name).startsWith('Auto ')&&!BAD[r.id]&&(!myRoom||r.id<mpId)).sort((p,q)=>p.id<q.id?-1:1);
   if(l.length&&!(opId&&!myRoom))join(l[0]);
   else if(!myRoom&&!opId&&el>2+Math.random()*2){mpWho='a';mpCity=GMAP;myRoom={s:'wait',name:'Auto '+mpId};$('onwt').textContent='Aguardando rival... ('+mpCity+')';pubRoom()}}},500)}

// ---- rede de partida (squad/clássico): jogadores reais via MQTT
let N=null;const CL={};
const gp=(m,q)=>{if(N&&mq&&mq.connected){m.f=mpId;mq.publish(TP+'g/'+N.mid,JSON.stringify(m),{qos:q||0})}};
function netOpen(mid,ids,mode){N={mid,ids,mode,host:ids[0]===mpId,G:{}};if(mq){mq.subscribe(TP+'g/'+mid,{qos:1});mq.on('message',(tp,p)=>{if(!N||tp!==TP+'g/'+N.mid)return;let m;try{m=JSON.parse(p.toString())}catch(e){return}if(m.f===mpId)return;N.G[m.f]=Date.now();if(N.mode==='squad')sqRx(m);else clRx(m)})}}
function mkEnt(team){const g=mkBot();g.cn.visible=false;const mk=new T.Mesh(new T.SphereGeometry(.13,8,6),new T.MeshBasicMaterial({color:team===1?0x3a82ff:team===0?0xff3030:0xffd040}));mk.position.y=2.25;g.add(mk);sc.add(g);return{g,team,x:0,z:0,tx:0,tz:0,y:0,ty:0,py:0,hp:100,dead:0,dt:0,am:0,ph:0,cr:0,dw:0,kk:0,cd:1,sw:1,sd:1,stk:0,wd:0,wdt:0,mv:0,px:0,pz:0,w:null,wg:null,rem:0}}
function ghArm(e,w){if(e.w===w)return;if(e.wg){e.g.tr.remove(e.wg);e.wg=null}e.w=w;if(w)armBot(e,w,0)}
function entDraw(e,dt,pd){if(e.dead){e.dt+=dt;deadPose(e,dt);e.g.position.set(e.x,e.py,e.z);return}
 if(e.g.rotation.x||e.g.rotation.z)reviveEnt(e);
 if(e.rem){const k=Math.min(1,dt*12);e.x+=(e.tx-e.x)*k;e.z+=(e.tz-e.z)*k;e.y+=(((e.ty-e.y+Math.PI*3)%(Math.PI*2))-Math.PI)*k}
 e.g.position.set(e.x,e.py,e.z);e.g.rotation.y=e.y;animBot(e,dt,e.mv,pd)}
let lastHit=null;
function sqDmg(e,d){if(SQ)SQ.my.d+=Math.min(d,e.hp>0?e.hp:d);if(e.id)gp({t:'hit',to:e.id,d,x:P.x,z:P.z},1);else if(e.bi!=null)gp({t:'bh',i:e.bi,d},1);else if(SQ&&SQ.host){e.hp-=d;if(e.hp<=0)sqKill(e,mpId)}else gp({t:'bh',i:SQ.K.indexOf(e),d},1)}
const enemies=()=>SQ?(SQ.st==='live'?SQ.B.filter(b=>b.team!==SQ.mt&&!b.dead):[]):(N&&N.mode==='classic'?Object.values(CL).concat(Object.values(CB)).filter(e=>!e.dead&&e.vis&&e.py<3&&!(window.dzAllies&&window.dzAllies.has(e.id))):[]);
const _fire=fire;fire=function(fx,fz){_fire(fx,fz);if(!wp)return;const L=enemies();if(N)gp({t:'f'});if(!L.length)return;const o=cam.position,dr=new T.Vector3();cam.getWorldDirection(dr);const W=WS[wp];let bt=1e9,hb=null,hbH=0;
 const t0=Math.max(0,(P.x-o.x)*dr.x+(P.y+1.4-o.y)*dr.y+(P.z-o.z)*dr.z);
 for(const b of L){const t=capT(o,dr,b.x,b.py||0,b.z,b.cr,W.rg,wp==='sniper'?300:0);
  if(t<bt&&t>=t0&&!blocked(o.x+dr.x*t0,o.y+dr.y*t0,o.z+dr.z*t0,o.x+dr.x*t,o.y+dr.y*t,o.z+dr.z*t)){bt=t;hb=b;hbH=capHead}}
 if(hb){const dm_=wDmg(W.d,bt,hbH),h0_=hb.hp>0?hb.hp:100;sqDmg(hb,dm_);hitFx(o.x+dr.x*bt,o.y+dr.y*bt,o.z+dr.z*bt,dm_,hbH,h0_<=dm_)}};
const _ex=expl;expl=function(x,y,z,r,dm,own){_ex(x,y,z,r,dm,own);if(!own||RGX)return;for(const b of enemies()){const d=Math.hypot(b.x-x,b.z-z);if(d<r){const q_=dm*(1-d/r)*1.3,h0_=b.hp>0?b.hp:100;sqDmg(b,q_);hitFx(b.x,(b.py||0)+1.3,b.z,q_,0,h0_<=q_)}}};

// ---- Clássico online: mesma rota de voo (seed) e jogadores reais visíveis/atacáveis
function clStart(ids,mid,seed){if(ids.length>1){netOpen(mid,ids,'classic');for(const id of ids)if(id!==mpId){const e=mkEnt(-1);e.id=id;e.rem=1;e.vis=0;e.g.visible=false;CL[id]=e}}
 const _r=Math.random;let s=seed;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};try{startGame();if(ids.length>1)regenLoot()}finally{Math.random=_r}
 sched.length=N&&!N.host?0:Math.min(sched.length,Math.max(0,100-ids.length));if(N&&N.host)setInterval(clBots,125);
 if(N)setInterval(()=>{const ok=mode==='ground'||mode==='sky'||mode==='chute';gp({t:'s',x:+P.x.toFixed(2),y:+(ok&&mode!=='ground'?P.y:0).toFixed(1),z:+P.z.toFixed(2),r:+pl.rotation.y.toFixed(2),mv:amt>.15?1:0,h:hp,w:wp,v:ok?1:0,d:mode==='dead'?1:0,gy:+(mode==='ground'?P.y:0).toFixed(0)})},100);
 if(N)setInterval(()=>{for(const id in CL){const e=CL[id];e.g.visible=!!e.vis;entDraw(e,.033,Math.hypot(e.x-P.x,e.z-P.z))}for(const id in CB){const e=CB[id];if(!e.dead&&e.vx!=null&&Date.now()-e.lt<260){e.tx+=e.vx*.033;e.tz+=e.vz*.033}e.vis=Date.now()-e.lt<1500;e.g.visible=e.dead?e.dt<5:e.vis;entDraw(e,.033,Math.hypot(e.x-P.x,e.z-P.z))}},33)}
function clRx(m){if(clRx2(m))return;const e=CL[m.f];if(m.t==='hit'){if(m.to===mpId&&mode!=='plane'&&mode!=='dead'&&mode!=='lobby'){hp-=m.d;lastHit=m.f;pingDir(m.x,m.z,'hit')}return}
 if(m.t==='kl'){feedKill(m.k?nmId(m.k):'',nmHash(m.f),m.k===mpId&&wp&&WS[wp]?WS[wp].n:'');if(m.k===mpId){kills++;say('Abate!',1.5)}return}
 if(!e)return;if(m.t==='f'){e.kk=1;sfx(1500,.35*Math.max(0,1-Math.hypot(e.x-P.x,e.z-P.z)/70)*vSnd(e.gy),.15,0);return}
 if(m.t==='s'){if(!e.vis&&m.v){e.x=m.x;e.z=m.z}e.tx=m.x;e.tz=m.z;e.ty=m.r;e.py=m.y;e.gy=m.gy||0;e.mv=m.mv;e.vis=m.v&&!m.d;ghArm(e,m.w);if(m.d&&!e.dead){e.dead=1;e.dt=0;alive--;e.vis=m.v}}}
setInterval(()=>{if(mode==='dead'&&N&&N.mode==='classic'&&!N.sd){N.sd=1;feedKill(lastHit?nmId(lastHit):'','Você','');gp({t:'kl',k:lastHit},1)}},300);

// ---- Contra Squad 4v4 (host simula bots; todos veem jogadores reais)
let SQ=null;const ME={get x(){return P.x},get z(){return P.z},py:0,me:1};
const SP=[['pistol','Pistola',200],['shotgun','Escopeta',1100],['rifle','M4A1',1800],['sniper','Sniper',2500],['gren','Granada',300],['gel','Gel',250],['med','Kit médico',300]];
const sqAl=t=>SQ.B.filter(b=>b.team===t&&!b.dead).length+(SQ.mt===t&&!SQ.meDead?1:0);
function sqSpawn(){const S=SQ,xs=[-4.5,-1.5,1.5,4.5];for(const t of[0,1]){const hum=S.ids.filter(id=>S.tm[id]===t);let k=0;const z=S.cz+(t?-26:26),yy=t?0:Math.PI;
 const put=(e,x)=>{e.x=e.tx=x;e.z=e.tz=z;e.y=e.ty=yy;e.hp=100;e.dead=0;e.dt=0;e.cd=1;e.mv=0;reviveEnt(e)};
 for(const id of hum){const x=S.cx+xs[k++];if(id===mpId){P.x=x;P.z=z;yaw=yy;pl.rotation.y=yy}else put(S.H[id],x)}
 for(const e of S.K)if(e.team===t)put(e,S.cx+xs[k++])}}
function sqRound(){const S=SQ;sqSpawn();P.y=0;P.vy=0;pit=.25;hp=100;st=0;ui();rlOn=0;rl=0;cast=null;firing=0;ads=0;TS=0;GA=null;
 if(S.meDead||!slots.some(q=>q)){slots[0]=slots[1]=null;slots[2]={t:'pistol',mag:12,res:48,sc:0,sil:0};cur=2;dw=0;drawSlots()}
 S.meDead=0;S.lk=null;S.st='buy';RB.state='pick';$('sqb').style.display='block';say('Fase de compras: use a loja 🛒',4)}
function sqStart(ids,mid){const C=CITIES.find(c=>c.n===GMAP)||CITIES[0],cx=C.x+BP,cz=C.z;
 if(ids.length>1)netOpen(mid,ids,'squad');MP=1;mpWho='a';opId='';AR={cx,cz,x0:cx-105,x1:cx+105,z0:cz-105,z1:cz+105};RB={r:1,state:'pick',sp:null};
 const tm={};ids.forEach((id,i)=>tm[id]=(i+1)%2);
 SQ={cx,cz,rs:0,bs:0,t:20,st:'wait',m:800,meDead:0,r:1,mt:tm[mpId],K:[],H:{},B:[],host:!N||N.host,ids,tm,ver:0,lm:null,ls:Date.now(),n:0};
 for(const t of[0,1]){const hum=ids.filter(id=>tm[id]===t);for(const id of hum)if(id!==mpId){const e=mkEnt(t);e.id=id;e.rem=1;SQ.H[id]=e;SQ.B.push(e)}
  for(let k=hum.length;k<4;k++){const e=mkEnt(t);e.rem=!SQ.host?1:0;SQ.K.push(e);SQ.B.push(e)}}
 bag.gren=bag.gel=0;bag.smoke=1;slots[0]=slots[1]=slots[2]=null;drawBag();
 lb.style.display='none';$('h').style.display='none';$('hud').style.display='none';$('zn').textContent='';$('sqh').style.display='block';
 mode='ground';pl.visible=true;setLabel();sqSpawn();if(SQ.host)sqSet('buy')}
function sqSet(st,w){const S=SQ;if(st==='buy')S.K.forEach(e=>ghArm(e,WL[Math.random()*4|0]));S.ver++;
 const m={t:'st',ver:S.ver,st,r:S.r,rs:S.rs,bs:S.bs,w,bw:S.K.map(b=>b.w),tt:st==='buy'?20:st==='end'?4:0};S.lm=m;gp(m,1);sqApply(m,1)}
function sqApply(m,fc){const S=SQ;S.ls=Date.now();S.t=m.tt;if(!fc&&m.ver<=S.ver)return;S.ver=m.ver;S.rs=m.rs;S.bs=m.bs;S.r=m.r;
 if(m.st==='buy'){m.bw.forEach((w,i)=>ghArm(S.K[i],w));sqRound()}
 else if(m.st==='live'){PD[0].visible=PD[1].visible=false;S.st='live';S.zt0=Date.now();RB.state=S.meDead?'down':'live';$('sqb').style.display=$('sqs').style.display='none';say('LUTE!',1.5)}
 else if(m.st==='end'){S.st='end';RB.state='down';S.m+=m.w===S.mt?1000:500;say(m.w===S.mt?'Rodada vencida! +1000 💰':'Rodada perdida · +500 💰',3.5)}
 else if(m.st==='over')sqOver(m.w)}
function sqKill(e,k){if(e.dead)return;e.dead=1;e.dt=0;gp({t:'kl',k},1);if(k===mpId){SQ.m+=300;say('Abate! +300 💰',1.5)}}
function sqRx(m){const S=SQ;if(!S)return;
 if(m.t==='st'){if(!S.host)sqApply(m);return}
 if(m.t==='hit'){if(m.to===mpId&&S.st==='live'&&!S.meDead){hp-=m.d;S.lk=m.f;pingDir(m.x,m.z,'hit')}return}
 if(m.t==='bh'){if(S.host){const e=S.K[m.i];if(e&&!e.dead){e.hp-=m.d;if(e.hp<=0)sqKill(e,m.f)}}return}
 if(m.t==='kl'){if(m.k===mpId&&m.f!==mpId&&S.H[m.f]){S.m+=300;S.my.k++;say('Abate! +300 💰',1.5)}return}
 if(m.t==='gel'){placeGel(m.x,m.z,m.a,0,m.id,m.rd);return}
 if(m.t==='ice'){const w=ICE.find(q=>q.id===m.i);if(w&&!w.b.off){w.hp=m.hp;if(w.hp<=0)breakIce(w)}return}
 if(m.t==='gr'){launchGren(m.x,m.y,m.z,m.vx,m.vy,m.vz,m.f,0);GRN[GRN.length-1].rem=1;return}
 if(m.t==='stat'){S.stats[m.f]={t:m.t2,k:m.k,d:m.d};return}
 if(m.t==='bst'){m.a.forEach((x,i)=>S.stats['B'+i]={t:x[0],k:x[1],d:x[2]});return}
 if(m.t==='b'){if(S.host)return;S.ls=Date.now();m.a.forEach((a,i)=>{const e=S.K[i];if(!e)return;e.tx=a[0];e.tz=a[1];e.ty=a[2];e.mv=a[3];e.hp=a[4];if(a[5]&&!e.dead){e.dead=1;e.dt=0}});return}
 const e=S.H[m.f];if(!e)return;
 if(m.t==='f'){e.kk=1;sfx(1500,.35*Math.max(0,1-Math.hypot(e.x-P.x,e.z-P.z)/70)*vSnd(e.gy),.15,0)}
 else if(m.t==='s'){e.tx=m.x;e.tz=m.z;e.ty=m.r;e.gy=m.gy||0;e.mv=m.mv;e.hp=m.h;ghArm(e,m.w);if(m.d&&!e.dead){e.dead=1;e.dt=0}}}
function sqZone(S){const e=S.zt0?(Date.now()-S.zt0)/1000:0;let q=((S.zs||1)+S.r*7919)>>>0;const rd=()=>{q=(q*1664525+1013904223)>>>0;return q/4294967296};
 const a=rd()*6.2832,d=Math.sqrt(rd())*70,fx=S.cx+Math.cos(a)*d,fz=S.cz+Math.sin(a)*d,R0=125,HOLD=20,SH=75,RF=9,k=e<HOLD?0:Math.min(1,(e-HOLD)/SH);
 return{x:S.cx+(fx-S.cx)*k,z:S.cz+(fz-S.cz)*k,r:R0+(RF-R0)*k,dps:7+13*k,txt:e<HOLD?'Zona fecha em '+Math.ceil(HOLD-e)+'s':k<1?'Zona fechando...':'Zona final'}}
function dzZoneHud(t,out){let e=document.getElementById('dzzone');if(!e){e=document.createElement('div');e.id='dzzone';e.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 78px);font:700 13px system-ui,sans-serif;text-shadow:0 1px 3px #000;pointer-events:none;z-index:6;text-align:center';document.body.appendChild(e)}e.textContent=t;e.style.color=out?'#ff6a6a':'#fff';e.style.display=t?'block':'none'}
function sqShop(){const S=SQ;$('sqm').textContent='💰 '+S.m;$('sqg').innerHTML=SP.map((s,i)=>'<button data-i="'+i+'"'+(S.m<s[2]?' disabled':'')+'>'+s[1]+'<br>$'+s[2]+'</button>').join('')}
function sqBuy(i){const S=SQ;if(!S||S.st!=='buy')return;const[k,n,pr]=SP[i];if(S.m<pr){say('Dinheiro insuficiente',1.5);return}
 if(WS[k]){const ix=BIG(k)?0:2;slots[ix]={t:k,mag:WS[k].mag,res:WS[k].mag*4,sc:0,sil:0};cur=ix;dw=0;drawSlots()}else{bag[k]=(bag[k]||0)+1;drawBag()}
 S.m-=pr;say('Comprou '+n,1.2);sqShop()}
$('sqb').onclick=()=>{sqShop();$('sqs').style.display='flex'};$('sqc').onclick=()=>$('sqs').style.display='none';
$('sqg').onclick=e=>{const b=e.target.closest('button');if(b&&!b.disabled)sqBuy(+b.dataset.i)};
setInterval(()=>{const S=SQ;if(!S||MPDONE)return;const dt=.05,A=AR;S.n2=(S.n2||0)+1;
 if(S.st==='wait'){if(!S.host&&Date.now()-S.ls>15000){MPDONE=1;$('mres').style.display='flex';$('mres').innerHTML='<h1>Partida encerrada</h1><p>O anfitrião saiu.</p><button onclick="location.reload()">Voltar ao lobby</button>'}return}
 if(S.t>0)S.t-=dt;
 if(S.st==='buy'){zw.visible=false;dzZoneHud('');{const pd=S.pad[S.mt];P.x=Math.max(pd[0]-5.5,Math.min(pd[0]+5.5,P.x));P.z=Math.max(pd[1]-3.8,Math.min(pd[1]+3.8,P.z))};if(S.host&&S.t<=0)sqSet('live')}
 else if(S.st==='live'){
  const Z=sqZone(S),zOut=Math.hypot(P.x-Z.x,P.z-Z.z)>Z.r;zw.visible=true;zw.position.set(Z.x,120,Z.z);zw.scale.set(Z.r,1,Z.r);dzZoneHud(Z.txt+' · raio '+Math.round(Z.r)+'m'+(zOut?' · FORA DA ZONA':''),zOut);if(zOut&&!S.meDead)hp-=Z.dps*dt;
  if(hp<=0&&!S.meDead){S.meDead=1;hp=0;RB.state='down';slots[0]=slots[1]=slots[2]=null;cur=-1;drawSlots();gp({t:'kl',k:S.lk},1);feedKill(S.lk?nmId(S.lk):(zOut?'☠️ Zona':'Bot'),'Você','');gp({t:'kf',k:S.lk,vn:nmHash(mpId)},1);say('Você caiu! Torça pelo seu time',3)}
  if(S.host){for(const b of S.K){if(b.dead)continue;if(Math.hypot(b.x-Z.x,b.z-Z.z)>Z.r){b.hp-=Z.dps*dt;if(b.hp<=0){sqKill(b,null);continue}}const l=S.B.filter(q=>q.team!==b.team&&!q.dead);if(S.mt!==b.team&&!S.meDead)l.push(ME);let t=null,td=1e9;for(const q of l){const d=Math.hypot(q.x-b.x,q.z-b.z);if(d<td){td=d;t=q}}if(!t)continue;
   const dx=t.x-b.x,dz=t.z-b.z,d=td||1,w=b.w||'rifle',rg=WS[w].rg,want=Math.min(16,rg*.5);b.y=Math.atan2(dx,dz);
   b.sw-=dt;if(b.sw<=0){b.sw=R(.8,2);b.sd=Math.random()<.5?-1:1}
   let vx,vz;if(b.wdt>0){b.wdt-=dt;vx=Math.sin(b.wd)*3;vz=Math.cos(b.wd)*3}else{const f=d>want+2?1:d<want-4?-1:0;vx=(dx/d*f-dz/d*b.sd*.6)*3.2;vz=(dz/d*f+dx/d*b.sd*.6)*3.2}
   {const zd=Math.hypot(Z.x-b.x,Z.z-b.z);if(zd>Z.r-4){vx=(Z.x-b.x)/(zd||1)*3.6;vz=(Z.z-b.z)/(zd||1)*3.6}}
   mvE(b,vx*dt,vz*dt);b.x=Math.max(A.x0+1,Math.min(A.x1-1,b.x));b.z=Math.max(A.z0+1,Math.min(A.z1-1,b.z));
   b.stk=Math.hypot(b.x-b.px,b.z-b.pz)<.03?b.stk+dt:0;b.px=b.x;b.pz=b.z;if(b.stk>.6){b.wd=R(0,6.28);b.wdt=1.4;b.stk=0}b.mv=1;
   b.cd-=dt;if(b.cd<=0&&d<rg&&blocked(b.x,1.3,b.z,t.x,1.2,t.z)){const iw=iceOnLine(b.x,b.z,t.x,t.z);if(iw){b.cd=WS[w].r*1.6+R(0,.3);b.kk=1;if(Math.random()<ACC[w]+.2)iceDmg(iw,WS[w].d)}}if(b.cd<=0&&d<rg&&!smokeB(b.x,b.z,t.x,t.z)&&!blocked(b.x,1.3,b.z,t.x,1.2,t.z)){b.cd=WS[w].r*1.6+R(0,.3);b.kk=1;sfx(1500,.3*Math.max(0,1-d/70)*vSnd(0),.15,0);
    if(Math.random()<ACC[w]){const dm=w==='shotgun'?sgD(d):WS[w].d;b.sd=(b.sd||0)+dm;if(t.me){hp-=dm;S.lk=null;pingDir(b.x,b.z,'hit');if(hp<=0&&!S.meDead)b.sk=(b.sk||0)+1}else if(t.id)gp({t:'hit',to:t.id,d:dm,x:b.x,z:b.z},1);else{t.hp-=dm;if(t.hp<=0){sqKill(t,null);b.sk=(b.sk||0)+1}}}}}
   const a0=sqAl(0),a1=sqAl(1);if(!a0||!a1){const w=!a0?1:0;if(w)S.bs++;else S.rs++;S.t=4;sqSet('end',w)}}}
 else if(S.st==='end'&&S.host&&S.t<=0){if(S.rs>=5||S.bs>=5)sqSet('over',S.bs>S.rs?1:0);else{S.r++;sqSet('buy')}}
 if(S.host&&N&&S.n2%2===0)gp({t:'b',a:S.K.map(b=>[+b.x.toFixed(1),+b.z.toFixed(1),+b.y.toFixed(2),b.mv,b.hp|0,b.dead?1:0])});
 if(S.host&&S.lm&&S.n2%10===0){S.lm.tt=Math.max(0,Math.round(S.t));gp(S.lm,1)}
 if(N&&S.n2%2===1)gp({t:'s',x:+P.x.toFixed(2),z:+P.z.toFixed(2),r:+pl.rotation.y.toFixed(2),mv:amt>.15?1:0,h:Math.max(0,hp|0),w:wp,d:S.meDead?1:0});
 for(const id in S.H){if(Date.now()-(N.G[id]||S.ls)>10000&&!S.H[id].dead){S.H[id].dead=1;S.H[id].dt=0}}
 for(const b of S.B)entDraw(b,dt,Math.hypot(b.x-P.x,b.z-P.z));
 $('sqh').innerHTML='<big style="color:#ff5050">'+S.rs+'</big> &nbsp; 4v4 &nbsp; <big style="color:#58a6ff">'+S.bs+'</big><br><small>🔴 '+sqAl(0)+' · 🔵 '+sqAl(1)+' · 💰 '+S.m+(S.st==='buy'?' · compras '+Math.ceil(S.t)+'s':'')+'</small>'},50);

// ---- lobby: modos e botão iniciar
MODES[2]=['squad','Contra Squad 4v4'];
renderMp=function(){$('mpm').innerHTML=MODES.map(m=>'<button data-m="'+m[0]+'"'+(m[0]===GMODE?' class="sel"':'')+'>'+m[1]+'</button>').join('');$('mpc').innerHTML=CITIES.map(c=>'<button data-c="'+c.n+'"'+(c.n===GMAP?' class="sel"':'')+'>'+c.n+'</button>').join('');mapLbl()};
go.onclick=()=>{if(GMODE==='pvp')autoPvp();else if(GMODE==='squad')queue('squad',8,sqStart);else queue('classic',100,clStart)};
