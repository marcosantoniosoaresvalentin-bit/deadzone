/* Deadzone · features/party.js
 * Grupo (party) no lobby.
 */
(()=>{try{
const W=window,$=id=>document.getElementById(id),LS=localStorage,N=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,''),esc=s=>String(s).replace(/[<>&"]/g,'');
const ME=()=>N(LS.getItem('deadzone_player_id')),LEAD=()=>N(LS.getItem('deadzone_party_leader'));
const nm=()=>{try{const u=JSON.parse(LS.getItem('deadzone_current_user')||'null');return String(LS.getItem('deadzone_player_name')||(u&&u.name)||'Jogador').slice(0,22)}catch(e){return'Jogador'}};
const CAP=()=>({solo:1,duo:2,trio:3,squad:4})[LS.getItem('deadzone_party_mode')||'squad']||4,BASE='dz3d/v1/party/';
let c=null,sub='',R={},ready=0,lastPub=0,CH={};
function conn(){if(c||!W.mqtt)return;c=mqtt.connect('wss://broker.emqx.io:8084/mqtt',{clientId:'dzpty_'+Math.random().toString(36).slice(2,10),reconnectPeriod:2500,keepalive:20});
 c.on('connect',()=>{sub=''});
 c.on('message',(tp,pl)=>{const s=pl.toString(),L=LEAD();if(!L||!tp.startsWith(BASE+L+'/'))return;const k=tp.slice((BASE+L+'/').length);
  if(k==='go'){try{onGo(JSON.parse(s))}catch(e){}return}
  if(k.startsWith('m/')){const id=k.slice(2);if(!s)delete R[id];else try{R[id]=JSON.parse(s)}catch(e){}}})}
function pub(clear){const L=LEAD();if(!c||!c.connected||!L)return;c.publish(BASE+L+'/m/'+ME(),clear?'':JSON.stringify({id:ME(),mp:mpId,name:nm(),ready:ready?1:0,o:+LS.getItem('dzO')||0,ts:Date.now()}),{retain:true,qos:1});lastPub=Date.now()}
function roster(){const L=LEAD();if(!L)return[];const now=Date.now(),a=Object.values(R).filter(m=>m&&m.id&&now-m.ts<20000);a.sort((x,y)=>x.id===L?-1:y.id===L?1:x.id<y.id?-1:1);return a.slice(0,CAP())}
function mk(m){const pm={};for(const k in CM0)pm[k]=CM0[k].clone();const o=OUT[m.o]||OUT[0];for(const k of['ol','pt','hl','dk'])if(o&&o[k]!=null&&pm[k])pm[k].color.copy(lin(o[k]));
 const g=buildChar(0,pm).pl;stage.add(g);const lb=document.createElement('div');lb.style.cssText='position:fixed;z-index:20;color:#fff;font:700 12px system-ui;text-shadow:0 1px 3px #000,0 0 5px #000;pointer-events:none;transform:translate(-50%,-100%);display:none';document.body.appendChild(lb);return{g,lb,o:m.o}}
function drop(id){stage.remove(CH[id].g);CH[id].lb.remove();delete CH[id]}
function sync(){const ro=roster().filter(m=>m.id!==ME());for(const id in CH){const m=ro.find(x=>x.id===id);if(!m||m.o!==CH[id].o)drop(id)}
 ro.forEach(m=>{if(!CH[m.id])CH[m.id]=mk(m);CH[m.id].lb.textContent=(m.ready?'✅ ':'')+m.name});W.dzLobBack=ro.length*.8}
function clean(){for(const id in CH)drop(id);W.dzLobBack=0}
setInterval(()=>{const ids=Object.keys(CH),lob=mode==='lobby';ids.forEach((id,i)=>{const e=CH[id],x=(i%2?1:-1)*(1+(i>>1))*1.25;e.g.visible=lob;e.g.position.set(x,0,-.2*(1+(i>>1)));e.g.rotation.y=-x*.1;/* posição dentro do palco do lobby (o palco já está no jogador) */
 if(!lob){e.lb.style.display='none';return}const v=e.g.getWorldPosition(new T.Vector3());v.y+=2.15;v.project(cam),ok=v.z<1&&Math.abs(v.x)<1.1;e.lb.style.display=ok?'block':'none';if(ok){e.lb.style.left=(v.x+1)*.5*innerWidth+'px';e.lb.style.top=(1-v.y)*.5*innerHeight+'px'}})},33);
const css=document.createElement('style');css.textContent='#dzpty{position:fixed;left:10px;top:calc(env(safe-area-inset-top,0px) + 62px);z-index:17;width:min(220px,46vw);background:rgba(8,20,32,.88);border:1px solid #2ee6c8;border-radius:12px;padding:9px;color:#eafffb;font:600 13px system-ui;display:none}#dzpty .r{display:flex;justify-content:space-between;gap:6px;padding:3px 0}#dzpty button{width:100%;margin-top:6px;padding:10px;border:0;border-radius:9px;font-weight:800;font-size:14px;background:#2ee6c8;color:#04201b}#dzpty button.off{background:#f0a830;color:#201402}#dzpty button.lv{background:#2b3b4a;color:#fff;font-size:12px;padding:6px}#dzpty small{display:block;margin-top:4px;opacity:.75}#dzpty{width:auto;background:none;border:0;padding:0}#dzpty button.lv{width:auto;margin:0;padding:5px 9px;opacity:.8}';
const p=document.createElement('div');p.id='dzpty';document.body.append(css,p);
function ui(){const L=LEAD(),g=$('go');if(g&&!g.dataset.o)g.dataset.o=g.textContent;
 if(!L||mode!=='lobby'){p.style.display='none';if(g&&g.dataset.o)g.textContent=g.dataset.o;return}
 const lead=L===ME();if(g)g.textContent=lead?g.dataset.o:(ready?'CANCELAR':'PRONTO');
 if(!p.dataset.h){p.dataset.h=1;p.innerHTML='<button class="lv" id="dzpl">Sair da equipe</button>'}p.style.display='block'}
p.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='dzpr'){ready=ready?0:1;pub();p.dataset.h=''}else if(b.id==='dzpl'){pub(true);LS.removeItem('deadzone_party_leader');LS.setItem('deadzone_team_local','[]');ready=0;R={};if(c&&sub)c.unsubscribe(BASE+sub+'/#');sub='';clean();ui()}};
function tick(){if(!LEAD()){clean();ui();return}conn();try{mqConn()}catch(e){}
 if(c&&c.connected&&sub!==LEAD()){if(sub)c.unsubscribe(BASE+sub+'/#');sub=LEAD();R={};c.subscribe(BASE+sub+'/#',{qos:1})}
 if(Date.now()-lastPub>2500)pub();sync();ui()}
setInterval(tick,700);W.dzPartyChanged=tick;addEventListener('beforeunload',()=>{try{pub(true)}catch(e){}});
function onGo(G){if(!G||!G.ids||!G.mid||typeof mpId==='undefined'||!G.ids.includes(mpId))return;if(W.dzPartyGO&&W.dzPartyGO.mid===G.mid)return;
 G.at=Date.now();W.dzPartyGO=G;try{LS.setItem('dzSelectedMode','classic');LS.setItem('dzMode','classic')}catch(e){}ready=0;
 const g=$('go');if(g){g.style.removeProperty('display');g.dispatchEvent(new MouseEvent('click',{bubbles:true}))}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#go'),L=LEAD();if(!b||!L)return;const G0=W.dzPartyGO;if(G0&&Date.now()-G0.at<25000)return;
 if(L!==ME()){e.stopImmediatePropagation();e.preventDefault();ready=ready?0:1;pub();ui();return}
 const ro=roster();if(ro.length<2||(LS.getItem('dzSelectedMode')||LS.getItem('dzMode')||'classic')!=='classic')return;
 const w=ro.filter(m=>m.id!==L&&!m.ready);if(w.length){e.stopImmediatePropagation();e.preventDefault();say('Aguardando todos ficarem prontos ('+w.length+')',2.5);return}
 const names={};ro.forEach(m=>names[m.mp]=m.name);
 const G={mid:Math.random().toString(36).slice(2,8),ids:ro.map(m=>m.mp).filter(Boolean).sort(),seed:Math.random()*4e9>>>0,city:CITIES[Math.random()*CITIES.length|0].n,names,allies:ro.map(m=>m.mp),at:Date.now()};
 W.dzPartyGO=G;let k=0;const iv=setInterval(()=>{if(c&&c.connected)c.publish(BASE+L+'/go',JSON.stringify(G),{qos:1});if(++k>6)clearInterval(iv)},350);ready=0},true);
}catch(e){console.warn('dz50',e)}})();
