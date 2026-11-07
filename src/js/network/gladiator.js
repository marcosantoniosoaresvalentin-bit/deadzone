/* Deadzone · network/gladiator.js
 * Modo Gladiador 1v1 online.
 */
function mpMsg(m){
 if(m.t==='join'){if(myRoom&&myRoom.s==='wait'&&!opId){opId=m.from;myRoom.s='play';pubRoom();snd({t:'ok'},1);startMatch()}else if(mq)mq.publish(TP+'p/'+m.from,JSON.stringify({t:'full',from:mpId}),{qos:1});return}
 if(m.from!==opId)return;if(OP)OP.last=Date.now();if(m.t!=='s'&&m.n){const k_=m.from+m.n;if(SEEN.has(k_))return;SEEN.add(k_)}
 if(m.t==='ok')startMatch();else if(m.t==='full'){opId='';$('onst').textContent='Sala cheia'}
 else if(!RB)return;
 else if(m.t==='s'){if(m.n<=OP.sn)return;OP.sn=m.n;OP.buf.push({t:performance.now(),x:m.x,z:m.z,y:m.y,mv:m.mv});if(OP.buf.length>30)OP.buf.shift();OP.hp=m.h;OP.gy=m.gy||0;if(m.r>RB.r){if(RB.state==='live'&&!RB.gotDown){RB.gotDown=1;OP.dead=1;RB[myKey()]++;RB.state='down'}if(RB.state==='down')nextRound(RB.r)}}
 else if(m.t==='gel')placeGel(m.x,m.z,m.a,0,m.id,m.rd);else if(m.t==='gs'){for(const g of m.g)placeGel(g.x,g.z,g.a,0,g.id,g.rd)}else if(m.t==='gr')launchGren(m.x,m.y,m.z,m.vx,m.vy,m.vz,m.f,0)
 else if(m.t==='f'){OP.kk=1;const d=Math.hypot(OP.x-P.x,OP.z-P.z);sfx(1500,.4*Math.max(0,1-d/70)*vSnd(OP.gy),.15,0)}
 else if(m.t==='hit'){if(RB.state==='live'&&!blocked(OP.x,TERH(OP.x,OP.z)+1.3,OP.z,P.x,P.y+1.2,P.z)){hp-=m.d;pingDir(OP.x,OP.z,'hit')}}
 else if(m.t==='ice'){const w=ICE.find(q=>q.id===m.i);if(w&&!w.b.off){w.hp=m.hp;if(w.hp<=0)breakIce(w)}}
 else if(m.t==='w')applyW(m.r,m.k,m.w);
 else if(m.t==='down'){if(!RB.gotDown&&(RB.state==='live'||RB.state==='down')){RB.gotDown=1;OP.dead=1;OP.dt=0;RB[mpWho==='a'?'sa':'sb']++;if(RB.state==='live'){RB.state='down';say('Você derrubou o rival!',2);feedKill('Você',nmOf(OP),wp&&WS[wp]?WS[wp].n:'');afterRound()}}}}
function breakIce(w){for(const q of(w.S?w.S.bs:[w.b]))q.off=1;w.m.visible=false;sfx(900,.4,.2,0)}
function rayIce(o,d,mx){let bt=null;for(const w of ICE){if(w.b.off)continue;const B=w.b,mn=[B.x0,0,B.z0],xx=[B.x1,2.8,B.z1],oo=[o.x,o.y,o.z],dd=[d.x,d.y,d.z];let t0=0,t1=mx,ok=1;
 for(let i=0;i<3;i++){if(Math.abs(dd[i])<1e-6){if(oo[i]<mn[i]||oo[i]>xx[i]){ok=0;break}}else{let a=(mn[i]-oo[i])/dd[i],b=(xx[i]-oo[i])/dd[i];if(a>b){const q=a;a=b;b=q}t0=Math.max(t0,a);t1=Math.min(t1,b);if(t0>t1){ok=0;break}}}
 if(ok&&(!bt||t0<bt.t))bt={t:t0,w}}return bt}
const myKey=()=>mpWho==='a'?'sa':'sb',opKey=()=>mpWho==='a'?'sb':'sa';
function startMatch(){if(MP)return;MP=1;bag.gren=2;bag.gel=3;bag.smoke=1;TS=0;GA=null;drawBag();const C=CITIES.find(c=>c.n===mpCity)||CITIES[0],cx=C.x+BP,cz=C.z;AR={cx,cz,x0:cx-7,x1:cx+7,z0:cz-28,z1:cz+28};
 $('on').style.display='none';lb.style.display='none';$('h').style.display='none';$('hud').style.display='none';zw.visible=true;zw.position.set(cx,120,cz);zw.scale.set(PZR,1,PZR);$('zn').textContent='';
 const g=mkBot();sc.add(g);OP={g,buf:[],sn:0,ry:0,x:cx,z:cz,tx:cx,tz:cz,ty:0,w:null,wg:null,sil:0,am:0,ph:0,cr:0,dw:1,kk:0,hp:100,dead:0,dt:0,mv:0,last:Date.now()};
 RB={r:1,sa:0,sb:0,state:'pick',W:{},gotDown:0,mine:0,picked:0,pt:12,tm:0};mode='ground';pl.visible=true;setLabel();prepRound()}
function prepRound(){RB.state='pick';RB.gotDown=0;RB.dn=0;TS=0;GA=null;bag.gren=2;bag.gel=3;bag.smoke=1;drawBag();hp=100;rlOn=0;rl=0;cast=null;firing=0;ads=0;cur=-1;slots[0]=slots[1]=slots[2]=null;drawSlots();
 const A=mpWho==='a';P.x=AR.cx;P.z=AR.cz+(A?-22:22);P.y=0;P.vy=0;yaw=A?0:Math.PI;pl.rotation.y=yaw;pit=.25;st=0;ui();
 OP.dead=0;OP.buf.length=0;OP.hp=100;reviveEnt(OP);OP.x=OP.tx=AR.cx;OP.z=OP.tz=AR.cz+(A?22:-22);OP.ty=OP.ry=A?Math.PI:0;PD[0].position.set(P.x,0,P.z);PD[1].position.set(OP.x,0,OP.z);PD[0].visible=PD[1].visible=true;RB.sp={x:P.x,z:P.z};OP.g.rotation.y=OP.ty;
 for(let i=ICE.length-1;i>=0;i--){const w=ICE[i];if(w.rd<RB.r){for(const q of w.S.bs)q.off=1;sc.remove(w.m);ICE.splice(i,1)}}GM=GM.filter(g=>g.rd>=RB.r);for(const g of GRN)sc.remove(g.m);GRN.length=0;
 const r=RB.r;if(r%2===0||r>6){const q=RB.W[r-1]||{};RB.W[r]={a:q.a,b:q.b};RB.mine=0;RB.picked=1;RB.pt=0;$('wsel').style.display='none';say('Mesma arma da rodada anterior',2);checkStart();return}
 const ch=r===1?'a':r===3?'b':'*';RB.mine=(ch==='*'||ch===mpWho);RB.picked=0;RB.pt=10;$('wsel').style.display='flex';
 if(RB.mine){$('wst').textContent='Rodada '+r+': '+(r<5?'você escolhe a arma (vale para os dois por 2 rodadas)':'escolha a SUA arma');$('wsb').innerHTML=['rifle','shotgun','pistol','sniper','bow'].map(w=>'<button data-w="'+w+'">'+WS[w].n+'</button>').join('')}
 else{$('wst').textContent='Rodada '+r+': aguardando o rival escolher a arma...';$('wsb').innerHTML=''}
 RB.base=$('wst').textContent;if(!RB.mine)$('wsel').style.display='none';checkStart()}
$('wsb').onclick=e=>{const b=e.target.closest('button');if(b)choose(b.dataset.w)};
function choose(w){if(!RB||RB.picked||RB.state!=='pick')return;RB.picked=1;const r=RB.r,k=r<5?'ab':mpWho;snd({t:'w',r,k,w},1);RB.mp={r,k,w,n:0,t:0};applyW(r,k,w);$('wsb').innerHTML='';$('wst').textContent='Aguardando...'}
function applyW(r,k,w){const o=RB.W[r]||(RB.W[r]={a:null,b:null});if(k==='ab')o.a=o.b=w;else o[k]=w;if(r===RB.r)checkStart()}
function checkStart(){const o=RB.W[RB.r];if(RB.state!=='pick'||!o||!o.a||!o.b)return;const me=o[mpWho],th=o[mpWho==='a'?'b':'a'],big=BIG(me),idx=big?0:2;
 slots[0]=slots[1]=slots[2]=null;slots[idx]={t:me,mag:WS[me].mag,res:WS[me].mag*4,sc:0,sil:0};cur=idx;dw=0;drawSlots();
 if(OP.wg)OP.g.tr.remove(OP.wg);OP.w=th;OP.sil=0;OP.wg=mkW(th,0,0);OP.g.tr.add(OP.wg);OP.dw=0;
 TS=0;RB.state='count';RB.tm=5;$('wsel').style.display='none'}
function nextRound(rr){if(MPDONE||RB.r!==rr)return;if(RB.r>=6&&RB.sa!==RB.sb)endMatch('');else{RB.r++;prepRound()}}
function afterRound(){RB.dn=0}
function endMatch(why){if(MPDONE)return;MPDONE=1;PD[0].visible=PD[1].visible=false;RB.state='over';const win=why?1:RB[myKey()]>RB[opKey()];$('mres').style.display='flex';$('mres').innerHTML='<h1>'+(win?'🏆 VITÓRIA':'DERROTA')+'</h1><p>'+(why||'')+'Placar final: você '+RB[myKey()]+' x '+RB[opKey()]+' rival</p><button onclick="location.reload()">Voltar ao lobby</button>'}
function mpTick(dt){if(!RB||!OP||MPDONE)return;mpT-=dt;
 {RB.gt=(RB.gt||0)-dt;if(RB.gt<=0){RB.gt=1.5;const l=GM.filter(g=>g.rd>=RB.r&&g.S.hp>0).map(g=>({id:g.id,x:g.x,z:g.z,a:g.a,rd:g.rd}));if(l.length)snd({t:'gs',g:l})}}
 {const q=RB.mp;if(q&&q.r===RB.r&&q.n<8&&(q.t-=dt)<=0){q.t=1;q.n++;snd({t:'w',r:q.r,k:q.k,w:q.w},1)}}
 {const dx=P.x-AR.cx,dz=P.z-AR.cz,d=Math.hypot(dx,dz),lim=PZR-1.2;if(d>lim){P.x=AR.cx+dx/d*lim;P.z=AR.cz+dz/d*lim}}
 if(RB.state==='down'){RB.dn=(RB.dn||0)+dt;if(RB.dn>=3.2){RB.dn=0;nextRound(RB.r)}}padTick(dt);if(RB.sp&&(RB.state==='pick'||RB.state==='count')){const q=RB.sp;P.x=Math.max(q.x-5.7,Math.min(q.x+5.7,P.x));P.z=Math.max(q.z-1.3,Math.min(q.z+1.3,P.z))}
 if(mpT<=0){mpT=.07;{const sx=+P.x.toFixed(2),sz=+P.z.toFixed(2),sy=+pl.rotation.y.toFixed(2),mv=amt>.15?1:0,sh=Math.max(0,Math.round(hp)),key=sx+','+sz+','+sy+','+mv+','+sh+','+RB.r;RB.lt=(RB.lt||0)+.07;if(key!==RB.ls||RB.lt>.4){RB.ls=key;RB.lt=0;snd({t:'s',x:sx,z:sz,y:sy,mv,h:sh,r:RB.r})}}}
 {const b=OP.buf,now=performance.now()-120;while(b.length>2&&b[1].t<=now)b.shift();
  if(b.length){const a=b[0],c=b[1]||a,u=c.t>a.t?Math.max(0,Math.min(1.25,(now-a.t)/(c.t-a.t))):1,tx=a.x+(c.x-a.x)*u,tz=a.z+(c.z-a.z)*u;if(Math.hypot(tx-OP.x,tz-OP.z)>5){OP.x=tx;OP.z=tz}else{const k=Math.min(1,dt*25);OP.x+=(tx-OP.x)*k;OP.z+=(tz-OP.z)*k}OP.ty=c.y;OP.mv=c.mv}
  const dr=((OP.ty-OP.ry+Math.PI*3)%(Math.PI*2))-Math.PI;OP.ry+=dr*Math.min(1,dt*14);OP.g.position.set(OP.x,TERH(OP.x,OP.z),OP.z)}
 if(OP.dead){OP.dt+=dt;deadPose(OP,dt)}else{OP.g.rotation.y=OP.ry;animBot(OP,dt,OP.mv,Math.hypot(OP.x-P.x,OP.z-P.z))}
 if(Date.now()-OP.last>15000){endMatch('O rival saiu da partida. ');return}
 if(RB.state==='pick'){RB.pt-=dt;const n_=Math.max(0,Math.ceil(RB.pt));if(RB.mine&&!RB.picked){$('wst').textContent=RB.base+' · '+n_+'s (senão será aleatória)';if(RB.pt<=0)choose(['rifle','shotgun','pistol','sniper','bow'][Math.floor(Math.random()*5)])}else if(!RB.mine)say(RB.base+' · '+n_+'s',.3)}
 if(RB.state==='count'){RB.tm-=dt;say('Começa em '+Math.ceil(Math.max(0,RB.tm)),.3);if(RB.tm<=0){RB.state='live';PD[0].visible=PD[1].visible=false;say('LUTE!',1.5)}}
 if(RB.state==='live'&&hp<=0){RB.state='down';hp=0;RB[opKey()]++;snd({t:'down'},1);feedKill(nmOf(OP),'Você','');say('Você caiu!',2);afterRound()}
 $('zn').textContent='Rodada '+RB.r+' · Você '+RB[myKey()]+' x '+RB[opKey()]+' Rival · Rival '+Math.max(0,OP.hp)+' HP · 6 rodadas'}
