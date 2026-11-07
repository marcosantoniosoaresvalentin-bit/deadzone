/* Deadzone · game/progression.js
 * Progressão, armadura, kill feed, fumaça, espectador e qualidade gráfica.
 */
// ===== v17: armadura, feedback, fumaça, soltar itens, morte/espectador, progressão, qualidade =====
IC.vest='<svg viewBox="0 0 64 24"><path d="M18 3h8l6 4 6-4h8l2 6-3 13H19L16 9z"/></svg>';
IC.helm='<svg viewBox="0 0 64 24"><path d="M14 17c0-9 8-14 18-14s18 5 18 14z"/><rect x="12" y="17" width="40" height="3" rx="1"/></svg>';
IC.smoke='<svg viewBox="0 0 64 24"><rect x="25" y="6" width="14" height="16" rx="3"/><rect x="28" y="2" width="8" height="5"/></svg>';
Object.assign(LN,{vest:'Colete',helm:'Capacete',smoke:'Granada de fumaça'});Object.assign(LC,{vest:'#7a9ac0',helm:'#a0b070',smoke:'#b8bcc0'});
TK.smoke=['smoke','Granada de fumaça',1];W.smoke=2;BN.smoke='Fumaça';ICK.smoke='smoke';

// --- progressão ---
let PR={xp:0,coins:0,unl:[]};try{Object.assign(PR,JSON.parse(localStorage.getItem('dzProg')||'{}'))}catch(e){}
const savePR=()=>{try{localStorage.setItem('dzProg',JSON.stringify(PR))}catch(e){}};
const lvOf=x=>1+Math.floor(Math.sqrt(x/120)),lvStart=l=>120*(l-1)*(l-1);
function updPn(){const l=lvOf(PR.xp);$('pn').textContent='Jogador · Nv. '+l+' · '+(PR.xp-lvStart(l))+'/'+(lvStart(l+1)-lvStart(l))+' XP · 💰 '+PR.coins}
updPn();
const skinKey=(t,it)=>t+':'+it.id,owned=(t,it)=>!it.cost||PR.unl.indexOf(skinKey(t,it))>=0||(it.lg&&PR.unl.indexOf(it.lg)>=0);let armedK=null;
function skinPrev(t,it){if(t==='o')return['ol','pt','hl'].map(k=>'<b style="background:'+hxc(it[k])+'"></b>').join('');
 if(t==='p'){let h='';for(let q=0;q<8;q++)h+='<b style="background:'+hxc(q%2?it.c2:it.c)+(it.tx?';color:'+it.tx.f+';font:900 11px system-ui;display:flex;align-items:center;justify-content:center':'')+'">'+(it.tx?'DEADZONE'[q]:'')+'</b>';return h}
 if(it.c==null)return'<b style="background:linear-gradient(#9aa0a8,#6a7078);display:flex;align-items:center;justify-content:center;font-size:20px">🚗</b>';
 return'<b style="background:linear-gradient('+hxc(it.c)+' 0 38%,'+hxc(it.c2)+' 38% 48%,'+hxc(it.c)+' 48% 62%,'+hxc(it.c2)+' 62% 68%,'+hxc(it.c)+' 68%);display:flex;align-items:center;justify-content:center;font:900 10px system-ui;color:'+(it.tx?it.tx.f:'transparent')+'">'+(it.tx?'DEADZONE':'')+'</b>'}
renderInv=function(){const L=invT==='o'?OUT:invT==='p'?PAR:CARC,sel=invT==='o'?selO:invT==='p'?selP:selC,g=$('ig');g.innerHTML='';$('tO').className=invT==='o'?'on':'';$('tP').className=invT==='p'?'on':'';$('tC').className=invT==='c'?'on':'';
 L.forEach((it,i)=>{const key=skinKey(invT,it),lk=!owned(invT,it),d=document.createElement('div');d.className='ic'+(i===sel?' on':'')+(lk?' lk':'');
  d.innerHTML='<i>'+skinPrev(invT,it)+'</i>'+it.n+(i===sel?' ✔':'')+(lk?'<br><small>'+(armedK===key?'Toque de novo para comprar · ':'🔒 ')+'💰 '+it.cost+'</small>':'');
  d.onclick=()=>{if(lk){if(PR.coins<it.cost){armedK=null;d.querySelector('small').textContent='Faltam '+(it.cost-PR.coins)+' 💰';return}if(armedK!==key){armedK=key;renderInv();return}PR.coins-=it.cost;PR.unl.push(key);savePR();updPn();armedK=null}
   if(invT==='o')selO=i;else if(invT==='p')selP=i;else selC=i;try{localStorage.setItem('dzO',selO);localStorage.setItem('dzP',selP);localStorage.setItem('dzC',selC)}catch(e){}applySkins();renderInv()};g.appendChild(d)});
 const t=document.createElement('p');t.className='sm';t.style.gridColumn='1/-1';t.textContent='Só a primeira skin de cada aba é grátis · Moedas: '+PR.coins+' · jogue partidas para ganhar XP e moedas';g.appendChild(t)};
(function(){const bad=(t,L,i)=>!L[i]||!owned(t,L[i]);let ch=0;if(bad('o',OUT,selO)){selO=0;ch=1}if(bad('p',PAR,selP)){selP=0;ch=1}if(bad('c',CARC,selC)){selC=0;ch=1}if(ch){try{localStorage.setItem('dzO',selO);localStorage.setItem('dzP',selP);localStorage.setItem('dzC',selC)}catch(e){}}applySkins()})();

// --- armadura ---
let armK='';function updArm(){const e=$('arm');if(!e)return;const k=Math.round(ARM.vest)+'|'+Math.round(ARM.helm)+'|'+mode;if(k===armK)return;armK=k;e.style.display=(mode==='ground'||mode==='drive')&&(ARM.vest>0||ARM.helm>0)?'block':'none';e.textContent='🛡 '+Math.round(ARM.vest)+'%  ⛑ '+Math.round(ARM.helm)+'%'}
function hurtP(d,b){if(b)lastHitBy=b;if(Math.random()<.15){if(ARM.helm>0){d*=1.8*.55;ARM.helm=Math.max(0,ARM.helm-d*.9);say('⛑ Capacete absorveu parte do tiro',.9)}else{d*=1.8;say('Tiro na cabeça!',.9)}}
 else if(ARM.vest>0){const ab=Math.min(ARM.vest,d*.45);ARM.vest-=ab;d-=ab}hp-=d;updArm()}

// --- nomes, kill feed, hit marker, dano ---
const NMS=['Lobo','Falcão','Sombra','Viper','Raio','Tigre','Nuvem','Cobra','Ghost','Titã','Fênix','Mamba','Jaguar','Trovão','Corvo'];
const bnm=b=>b?(b.nm||(b.nm=NMS[Math.floor(Math.random()*NMS.length)]+Math.floor(10+Math.random()*89))):'Bot';
function feed(h){const f=$('kf');if(!f)return;const d=document.createElement('div');d.innerHTML=h;f.appendChild(d);while(f.children.length>5)f.removeChild(f.firstChild);setTimeout(()=>d.remove(),5200)}
function feedK(b,me){const nm=bnm(b);let h;if(me){h='<b>Você</b> ▸ '+(me===true&&wp?WS[wp].n:'💥')+(lastHS?' 🎯':'')+' ▸ '+nm}else if(typeof KK!=='undefined'&&KK)h='<b>'+nmId(KK)+'</b> ▸ '+nm;else if(b.by)h='<b>'+bnm(b.by)+'</b> ▸ '+nm;else h=nm+(Math.hypot(b.x-zX,b.z-zZ)>zR?' morreu na zona ☠️':' foi eliminado');lastHS=0;feed(h)}
let hmT=0;function hitFx(x,y,z,dm,head,kill){const h=$('hm');h.className=kill?'k':head?'h':'';h.textContent=kill?'✕':'✕';h.style.display='block';clearTimeout(hmT);hmT=setTimeout(()=>h.style.display='none',kill?380:180);sfx(head?3200:2200,.3,.07,0);
 const v=new T.Vector3(x,y+.2,z).project(cam);if(v.z<1){const d=document.createElement('div');d.className='dn'+(head?' h':'');d.textContent=Math.round(dm)+(head?' 🎯':'');d.style.left=(v.x+1)/2*innerWidth+'px';d.style.top=(1-v.y)/2*innerHeight+'px';document.body.appendChild(d);requestAnimationFrame(()=>{d.style.transform='translate(-50%,-190%)';d.style.opacity='0'});setTimeout(()=>d.remove(),750)}}

// --- recuo ---
function recoil(){const rc=({rifle:.011,shotgun:.045,pistol:.018,sniper:.05})[wp]||0;if(!rc)return;const k=ads?.55:1;pit=Math.max(-.25,pit-rc*k);rcA+=rc*k;yaw+=(Math.random()-.5)*rc*.6}

// --- som direcional dos bots ---
function panOf(x,z){const dx=x-P.x,dz=z-P.z,fx=Math.sin(yaw),fz=Math.cos(yaw);return Math.sin(Math.atan2(-dx*fz+dz*fx,dx*fx+dz*fz))}
function botShot(b,dp){if(!b.sil&&dp<120)try{DZFX.flash(b.x+Math.sin(b.g.rotation.y)*.8,TERH(b.x,b.z)+1.35,b.z+Math.cos(b.g.rotation.y)*.8,.8)}catch(e){}if(b.sil||dp>150||mode==='lobby'||!vSnd(0))return;sfx(700+900*Math.max(0,1-dp/150),Math.min(.75,1.2*(1-dp/150)),.16,panOf(b.x,b.z));if(dp<60&&mode==='ground'&&performance.now()-lastPing>350){lastPing=performance.now();pingDir(b.x,b.z,'shot')}}

// --- soltar itens ---
const dropPos=()=>({x:P.x+Math.sin(yaw)*.9+(Math.random()-.5)*.7,z:P.z+Math.cos(yaw)*.9+(Math.random()-.5)*.7});
function dropItem(k){if(!(bag[k]>0))return;bag[k]--;const p=dropPos();mkLoot(ICK[k],p.x,p.z);lkey='';say('Soltou: '+BN[k],1.2)}
function dropW(i){const q=slots[i];if(!q)return;const p=dropPos();mkLoot(q.t,p.x,p.z,{mag:q.mag,res:q.res},q.sc,q.sil);slots[i]=null;if(cur===i){cur=-1;rlOn=0;rl=0}lkey='';say('Soltou: '+LN[q.t],1.2)}
function dropArm(k){if(!(ARM[k]>0))return;const p=dropPos();mkLoot(k,p.x,p.z,{d:ARM[k]});ARM[k]=0;lkey='';updArm();say('Soltou: '+LN[k],1.2)}

// --- fumaça ---
const SMK=[];const SMG=new T.SphereGeometry(1,10,8);
function spawnSmoke(x,z){const g=new T.Group();g.position.set(x,0,z);const ms=[];for(let i=0;i<8;i++){const m=new T.Mesh(SMG,new T.MeshBasicMaterial({color:0xc4c8cc,transparent:true,opacity:.8,depthWrite:false,side:T.DoubleSide}));m.userData={ox:(Math.random()-.5)*5,oz:(Math.random()-.5)*5,r:2.6+Math.random()*1.6,y:1+Math.random()*2};m.position.set(0,m.userData.y,0);m.scale.setScalar(.1);g.add(m);ms.push(m)}sc.add(g);SMK.push({g,ms,x,z,a:0});sfx(900,.5,.5,panOf(x,z))}
function smokeTick(dt){for(let i=SMK.length-1;i>=0;i--){const c=SMK[i];c.a+=dt;const gr=Math.min(1,c.a/1.6),fd=c.a>20?Math.max(0,1-(c.a-20)/5):1;for(const m of c.ms){const u=m.userData;m.position.set(u.ox*gr,u.y,u.oz*gr);m.scale.setScalar(.1+u.r*gr);m.material.opacity=.8*fd}if(c.a>25){sc.remove(c.g);SMK.splice(i,1)}}}
function smokeB(x0,z0,x1,z1){for(const c of SMK){if(c.a<1)continue;const dx=x1-x0,dz=z1-z0,l2=dx*dx+dz*dz||1;let t=((c.x-x0)*dx+(c.z-z0)*dz)/l2;t=Math.max(0,Math.min(1,t));if(Math.hypot(x0+dx*t-c.x,z0+dz*t-c.z)<5.5)return true}return false}
function throwSmoke(){if(mode!=='ground'||!(bag.smoke>0)||cast)return;const v=gVel(16);launchGren(v.x0,v.y0,v.z0,v.vx,v.vy,v.vz,2.2,0);const g=GRN[GRN.length-1];g.sm=1;g.m.material=M(0xb8bcc0);bag.smoke--;drawBag();say('Fumaça!',.8)}

// --- tela de morte / vitória / espectador ---
{const eg=document.createElement('div');eg.id='eg';document.body.appendChild(eg);
 const hm=document.createElement('div');hm.id='hm';document.body.appendChild(hm);
 const kf=document.createElement('div');kf.id='kf';document.body.appendChild(kf);
 const ar=document.createElement('div');ar.id='arm';document.body.appendChild(ar);
 const sp=document.createElement('div');sp.id='spc';sp.innerHTML='<button id="spp">◀</button><span>👁 <b id="spn"></b></span><button id="spx">▶</button><button id="spo">Resumo</button>';document.body.appendChild(sp);
 $('spp').onclick=()=>specNext(-1);$('spx').onclick=()=>specNext(1);$('spo').onclick=()=>{spec=null;sp.style.display='none';eg.style.display='flex'}}
let granted=0;
function gEnd(win){if(ended)return;ended=1;mode='dead';setLabel();const place=win?1:Math.max(1,alive);const xp=kills*40+Math.round(dmgDone/10)+Math.max(0,100-place)*2+(win?300:0),coins=kills*10+Math.round(Math.max(0,100-place)/5)+(win?150:0);
 const l0=lvOf(PR.xp);if(!granted){granted=1;PR.xp+=xp;PR.coins+=coins;savePR()}const l1=lvOf(PR.xp),tm=Math.max(0,Math.round(gt)),mm_=Math.floor(tm/60),ss=('0'+tm%60).slice(-2);
 const by=win?'':Math.hypot(P.x-zX,P.z-zZ)>zR?' · Morreu na zona ☠️':lastHitBy?' · Eliminado por '+bnm(lastHitBy):'';const canSpec=false;
 $('eg').innerHTML=`<div class="eg-stage"><div class="eg-scene"></div><div class="eg-x eg-t">${win?'VITÓRIA':'ELIMINADO'}</div><div class="eg-x eg-p">Posição <b>#${place}</b></div><div class="eg-x eg-bd">#${place}</div><div class="eg-x eg-v v1">${kills}</div><div class="eg-x eg-v v2">${Math.round(dmgDone)}</div><div class="eg-x eg-v v3">${mm_}:${ss}</div><div class="eg-x eg-v v4">+${xp} XP</div><div class="eg-x eg-s">+${coins}</div><div class="eg-x eg-m">Você: ${kills} abate(s) · ${Math.round(dmgDone)} de dano</div><button id="egr" type="button" aria-label="Voltar ao lobby"></button></div>`;
 egFit();if(canSpec)$('egs').onclick=()=>{$('eg').style.display='none';$('spc').style.display='flex';specNext(1,1)};$('eg').style.display='flex';updPn()}
die=function(){try{ejectDriver()}catch(e){}gEnd(0)};
function specNext(d,auto){const L=bots.filter(b=>!b.dead&&!b.air);if(!L.length){spec=null;$('spc').style.display='none';$('eg').style.display='flex';return}let i=L.indexOf(spec);i=i<0?0:(i+d+L.length)%L.length;spec=L[i];$('spn').textContent=bnm(spec)}
function specTick(){if(mode!=='dead'||$('spc').style.display==='none'){return}if(!spec||spec.dead||spec.air)specNext(1,1);if(!spec)return;P.x=spec.x;P.z=spec.z;P.y=0;pl.visible=false}
setInterval(()=>{if(!ended&&mode==='ground'&&!MP&&(typeof N==='undefined'||!N)&&alive<=1&&hp>0&&BOTS_ON)gEnd(1)},500);

// --- qualidade gráfica ---
function applyQ(){try{if(typeof DYN!=='undefined'){DYN.base=0;DYN.k=1}}catch(e){}const q=CFG.q==null?DZ_DEFQ:CFG.q;ren.setPixelRatio(q===0?Math.min(devicePixelRatio,.75):q===1?Math.min(devicePixelRatio,1):Math.min(devicePixelRatio,1.25));rs();sun.castShadow=q>=1;try{window.DZR&&DZR.applyQ&&DZR.envTex!==undefined&&DZR.applyQ(q)}catch(e){}}
$('cQ').onclick=()=>{CFG.q=((CFG.q==null?DZ_DEFQ:CFG.q)+2)%3;$('cQ').textContent=['Baixa','Média','Alta'][CFG.q];saveCfg();applyQ()};
applyQ();
