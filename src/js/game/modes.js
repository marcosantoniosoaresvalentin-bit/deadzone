/* Deadzone · game/modes.js
 * Mapa único, cidade aleatória, spawns e MVP.
 */
// ===== v13: mapa único, cidade aleatória, spawns longe, gelo, MVP =====
let RGX=0;const MAPNAME='Zona Morta',rndCity=()=>CITIES[Math.random()*CITIES.length|0].n;GMAP=MAPNAME;
mapLbl=function(){$('mapb').textContent='🗺 '+MAPNAME+' · '+(GMODE==='classic'?'Clássico':GMODE==='pvp'?'PVP':'Confronto 4v4')};
renderMp=function(){GMAP=MAPNAME;$('mpm').innerHTML=MODES.map(m=>'<button data-m="'+m[0]+'"'+(m[0]===GMODE?' class="sel"':'')+'>'+m[1]+'</button>').join('');$('mpc').innerHTML='<button data-c="'+MAPNAME+'" class="sel">'+MAPNAME+'</button>';mapLbl()};
renderMp();
function iceOnLine(x1,z1,x2,z2){for(let i=0;i<=16;i++){const u=i/16,x=x1+(x2-x1)*u,z=z1+(z2-z1)*u;for(const b of near(x,z))if(b.ice&&!b.off&&x>b.x0-.2&&x<b.x1+.2&&z>b.z0-.2&&z<b.z1+.2){const w=ICE.find(q=>q.b===b);if(w)return w}}return null}
function iceDmg(w,d){if(w.b.off)return;w.hp-=d;if(w.hp<=0)breakIce(w);snd({t:'ice',i:w.id,hp:w.hp},1)}
function sqFree(x,z,m){for(const b of near(x,z))if(!b.off&&x>b.x0-m&&x<b.x1+m&&z>b.z0-m&&z<b.z1+m)return false;return true}
function sqPads(cx,cz,rnd){const C=[];for(let i=0;i<1200&&C.length<40;i++){const x=cx+(rnd()*2-1)*95,z=cz+(rnd()*2-1)*95;let ok=1;for(let a=-6;a<=6&&ok;a+=3)for(let c=-4;c<=4;c+=4)if(!sqFree(x+a,z+c,1.2)){ok=0;break}if(ok)C.push([x,z])}
 let best=null,bd=0;for(const a of C)for(const b of C){const d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(d<110)continue;const sc_=d+(blocked(a[0],1.5,a[1],b[0],1.5,b[1])?1000:0);if(sc_>bd){bd=sc_;best=[a,b]}}
 return best||[[cx,cz-60],[cx,cz+60]]}
function sqSpawn(){const S=SQ,xs=[-4.5,-1.5,1.5,4.5];for(const t of[0,1]){const pd=S.pad[t],od=S.pad[1-t],yy=Math.atan2(od[0]-pd[0],od[1]-pd[1]),hum=S.ids.filter(id=>S.tm[id]===t);let k=0;
 const put=(e,x)=>{e.x=e.tx=x;e.z=e.tz=pd[1];e.y=e.ty=yy;e.hp=100;e.dead=0;e.dt=0;e.cd=1;e.mv=0;reviveEnt(e)};
 for(const id of hum){const x=pd[0]+xs[k++];if(id===mpId){P.x=x;P.z=pd[1];yaw=yy;pl.rotation.y=yy}else put(S.H[id],x)}
 for(const e of S.K)if(e.team===t)put(e,pd[0]+xs[k++])}}
function sqRound(){const S=SQ;RB.r=S.r;
 for(let i=ICE.length-1;i>=0;i--){const w=ICE[i];if(w.rd<RB.r){for(const q of w.S.bs)q.off=1;sc.remove(w.m);ICE.splice(i,1)}}GM=GM.filter(g=>g.rd>=RB.r);for(const g of GRN)sc.remove(g.m);GRN.length=0;
 sqSpawn();P.y=0;P.vy=0;pit=.25;hp=100;st=0;ui();rlOn=0;rl=0;cast=null;firing=0;ads=0;TS=0;GA=null;
 if(S.meDead||!slots.some(q=>q)){slots[0]=slots[1]=null;slots[2]={t:'pistol',mag:12,res:48,sc:0,sil:0};cur=2;dw=0;drawSlots()}
 const m_=S.pad[S.mt],o_=S.pad[1-S.mt];PD[0].position.set(m_[0],0,m_[1]);PD[1].position.set(o_[0],0,o_[1]);PD[0].visible=PD[1].visible=true;
 S.meDead=0;S.lk=null;S.st='buy';RB.state='pick';$('sqb').style.display='block';say('Fase de compras: use a loja 🛒',4)}
function sqStart(ids,mid,seed,city){const C=CITIES.find(c=>c.n===city)||CITIES[Math.random()*CITIES.length|0],cx=C.x,cz=C.z;
 const matchSize=localStorage.getItem('dzMatchSize')||'4v4';const teamCap=matchSize==='1v1'?1:matchSize==='2v2'?2:matchSize==='3v3'?3:4;
 if(ids.length>1)netOpen(mid,ids,'squad');MP=1;mpWho='a';opId='';AR={cx,cz,x0:cx-110,x1:cx+110,z0:cz-110,z1:cz+110};RB={r:1,state:'pick',sp:null};
 let sd=seed>>>0;const rnd=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296},pb=sqPads(cx,cz,rnd),tm={};ids.forEach((id,i)=>tm[id]=(i+1)%2);
 SQ={zs:seed>>>0,cx,cz,teamCap,matchSize,rs:0,bs:0,t:20,st:'wait',m:800,meDead:0,r:1,mt:tm[mpId],K:[],H:{},B:[],host:!N||N.host,ids,tm,ver:0,lm:null,ls:Date.now(),n:0,pad:[pb[1],pb[0]],my:{k:0,d:0},stats:{}};
 for(const t of[0,1]){const hum=ids.filter(id=>tm[id]===t);for(const id of hum)if(id!==mpId){const e=mkEnt(t);e.id=id;e.rem=1;SQ.H[id]=e;SQ.B.push(e)}
  for(let k=hum.length;k<teamCap;k++){const e=mkEnt(t);e.rem=!SQ.host?1:0;SQ.K.push(e);SQ.B.push(e)}}
 bag.gren=bag.gel=0;bag.smoke=1;slots[0]=slots[1]=slots[2]=null;drawBag();PD[0].scale.set(1,1,3);PD[1].scale.set(1,1,3);
 lb.style.display='none';$('h').style.display='none';$('hud').style.display='none';$('zn').textContent='';$('sqh').style.display='block';
 mode='ground';pl.visible=true;setLabel();sqSpawn();say('Modo '+matchSize+' · Cidade: '+C.n,3);if(SQ.host)sqSet('buy')}
function sqOver(w){const S=SQ;MPDONE=1;zw.visible=false;dzZoneHud('');PD[0].visible=PD[1].visible=false;$('sqb').style.display=$('sqs').style.display='none';
 S.stats[mpId]={t:S.mt,k:S.my.k,d:S.my.d|0};gp({t:'stat',t2:S.mt,k:S.my.k,d:S.my.d|0},1);
 if(S.host){S.K.forEach((b,i)=>S.stats['B'+i]={t:b.team,k:b.sk||0,d:b.sd|0});gp({t:'bst',a:S.K.map(b=>[b.team,b.sk||0,b.sd|0])},1)}
 setTimeout(()=>sqShowEnd(w),1800)}
function sqShowEnd(w){const S=SQ;let bn=null,bs=-1;for(const id in S.stats){const x=S.stats[id];if(x.t!==S.mt)continue;const sc_=x.k*150+x.d;if(sc_>bs){bs=sc_;bn=id}}
 const x=bn?S.stats[bn]:{k:0,d:0},nm=bn===mpId?'Você':bn&&bn[0]==='B'&&bn.length<4?'Bot '+(+bn.slice(1)+1):'Jogador '+bn;
 $('mres').style.display='flex';$('mres').innerHTML='<h1>'+(w===S.mt?'🏆 VITÓRIA':'DERROTA')+'</h1><p>Placar final: Azul '+S.bs+' x '+S.rs+' Vermelho</p><p style="font-size:18px">⭐ Melhor do seu time:<br><b>'+nm+'</b><br>'+x.k+' abate(s) · '+(x.d|0)+' de dano</p><button onclick="location.reload()">Voltar ao lobby</button>'}
function autoPvp(){$('on').style.display='flex';onShow('onWait');$('onwt').textContent='Procurando jogador...';mqConn();const t0=Date.now(),BAD={},W=()=>$('on').style.display==='flex'&&$('onWait').style.display==='flex';
 const join=r=>{cancelRoom();mpCity=r.city;mpWho='b';opId=r.id;mq.publish(TP+'p/'+r.id,JSON.stringify({t:'join',from:mpId}),{qos:1});$('onwt').textContent='Entrando na partida...';setTimeout(()=>{if(!MP){BAD[r.id]=1;opId=''}},5000)};
 const iv=setInterval(()=>{if(MP||!W()){clearInterval(iv);return}const el=(Date.now()-t0)/1000;
  if(el>20){clearInterval(iv);cancelRoom();mpWho='a';mpCity=rndCity();opId='BOT';BB={hp:100,x:0,z:0,r:0,dead:0,cd:1,sw:1,sd:1,y:Math.PI,ch:{}};startMatch();return}
  if(mq&&mq.connected&&(!opId||myRoom)){const l=Object.values(ROOMS).filter(r=>r.s==='wait'&&r.id!==mpId&&String(r.name).startsWith('Auto ')&&!BAD[r.id]&&(!myRoom||r.id<mpId)).sort((p,q)=>p.id<q.id?-1:1);
   if(l.length&&!(opId&&!myRoom))join(l[0]);
   else if(!myRoom&&!opId&&el>2+Math.random()*2){mpWho='a';mpCity=rndCity();myRoom={s:'wait',name:'Auto '+mpId};$('onwt').textContent='Aguardando rival...';pubRoom()}}},500)}

// ===== v14: Clássico online com bots do anfitrião =====
const WLL=['rifle','shotgun','pistol','sniper','bow'],CB={};let KK=null;
function regenLoot(){for(const o of loot)sc.remove(o.top);loot.length=0;for(const sp of LS)spawnSpot(sp);for(const c of CARS)if(Math.random()<.35)mkLoot('fuel',c.x+3.2,c.z+1);lkey=''}
function ghTg(b,best){if(!(N&&N.host&&N.mode==='classic'))return;for(const id in CL){const o=CL[id];if(o.dead||!o.vis||o.py>2)continue;const d=Math.hypot(o.x-b.x,o.z-b.z);if(d<best){best=d;b.tg=o}}}
function hurtB2(tg,b,d){if(tg.id)gp({t:'hit',to:tg.id,d,x:b.x,z:b.z},1);else hurtBot(tg,d,b)}
{const _kb=killBot;killBot=function(b,me){_kb(b,me);if(N&&N.mode==='classic'&&N.host)gp({t:'bk',i:bots.indexOf(b),k:KK||(me?mpId:null),x:b.x,z:b.z,w:WLL.indexOf(b.w),s:b.sil},1)}}
function clBots(){if(!N||!N.host||mode==='lobby')return;const hs=[[P.x,P.z]];for(const id in CL){const e=CL[id];if(e.vis&&!e.dead)hs.push([e.x,e.z])}
 const a=[];bots.forEach((b,i)=>{if(b.dead)return;if(!hs.some(h=>Math.hypot(h[0]-b.x,h[1]-b.z)<(b.air?450:230)))return;const mv=Math.hypot(b.x-(b.lx||0),b.z-(b.lz||0))>.03;b.lx=b.x;b.lz=b.z;
  a.push([i,+b.x.toFixed(1),+b.z.toFixed(1),b.air?+b.y.toFixed(1):0,+b.g.rotation.y.toFixed(2),(b.air?1:0)|(b.air&&b.ch?2:0)|(mv?4:0),WLL.indexOf(b.w),b.team===1?1:0])});
 gp({t:'B',a})}
function clRx2(m){
 if(m.t==='B'){if(N.host)return 1;const now=Date.now();for(const a of m.a){let e=CB[a[0]];if(!e){e=CB[a[0]]=mkEnt(-1);e.g.children[e.g.children.length-1].visible=false;e.bi=a[0];e.rem=1;e.x=a[1];e.z=a[2]}
  {const dtm=(now-(e.lt||0))/1000;if(!e.lt||dtm>.7||Math.hypot(a[1]-e.x,a[2]-e.z)>15){e.x=a[1];e.z=a[2];e.vx=e.vz=0}else if(dtm>.03&&e.tx!=null){let vx=(a[1]-e.tx)/dtm,vz=(a[2]-e.tz)/dtm;const vm=Math.hypot(vx,vz);if(vm>40){vx*=40/vm;vz*=40/vm}e.vx=vx;e.vz=vz}}
  if(a[7]===1&&!e.ally){e.ally=1;const mk_=e.g.children[e.g.children.length-1];mk_.visible=true;mk_.material.color.set(0x3a82ff)}/* bot companheiro da equipe: aliado também para os outros jogadores */e.tx=a[1];e.tz=a[2];e.ty=a[4];e.py=a[3]>.05?a[3]:0;e.mv=a[5]&4?1:0;e.lt=now;e.g.cn.visible=!!(a[5]&2);ghArm(e,a[6]>=0?WLL[a[6]]:null)}return 1}
 if(m.t==='bh'){if(N.host){const b=bots[m.i];if(b&&!b.dead&&!b.air){b.hp-=m.d;if(b.hp<=0){KK=m.f;killBot(b,0);KK=null}}}return 1}
 if(m.t==='bk'){if(!N.host){const e=CB[m.i];if(e&&!e.dead){e.dead=1;e.dt=0;e.g.cn.visible=false}alive--;feedKill(m.k?nmId(m.k):'',e?nmOf(e):'Bot',m.k===mpId&&wp&&WS[wp]?WS[wp].n:'');if(m.k===mpId){kills++;say('Abate!',1.5)}if(m.w>=0)mkLoot(WLL[m.w],m.x,m.z,null,0,m.s)}return 1}
 return 0}
