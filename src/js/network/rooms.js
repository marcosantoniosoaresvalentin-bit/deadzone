/* Deadzone · network/rooms.js
 * Conexão online (MQTT) e salas.
 */
// ===== ONLINE (MQTT público) · Gladiador 1v1 =====
let MP=0,RB=null,OP=null,AR=null,mq=null,myRoom=null,opId='',mpWho='',mpCity='Porto Real',mpT=0,MPDONE=0,selCity='Porto Real',ROOMS={};const ICE=[],mpId=Math.random().toString(36).slice(2,8),TP='dz3d/v1/';
const mpOk=()=>!MP||(RB&&RB.state==='live'),mpMove=()=>!MP||(RB&&(RB.state==='live'||RB.state==='pick'||RB.state==='count'));
let sq=0;const SEEN=new Set();
function snd(m,q){if(mq&&opId&&mq.connected){m.n=++sq;mq.publish(TP+'p/'+opId,JSON.stringify(Object.assign({from:mpId},m)),{qos:q||0})}}
const onShow=id=>{for(const k of['onMenu','onCreate','onWait','onList'])$(k).style.display=k===id?'flex':'none'};
function pubRoom(){if(mq&&myRoom)mq.publish(TP+'rooms/'+mpId,JSON.stringify({id:mpId,name:myRoom.name,city:mpCity,s:myRoom.s,t:Date.now()}),{retain:true,qos:1})}
function renderRooms(){const l=Object.values(ROOMS).filter(r=>r.s==='wait'&&r.id!==mpId);$('onl').innerHTML=l.length?l.map(r=>'<div class="rc"><span><b>'+r.name+'</b> · '+r.city+'</span><button data-j="'+r.id+'">Entrar</button></div>').join(''):'<p>Nenhuma sala ativa agora. Toque em Atualizar.</p>'}
function mqConn(){if(mq)return;if(!window.mqtt){$('onst').textContent='⚠ Sem internet: a biblioteca online não carregou';return}
 $('onst').textContent='Conectando ao servidor...';
 mq=mqtt.connect('wss://broker.emqx.io:8084/mqtt',{clientId:'dz3d_'+mpId,reconnectPeriod:2000,keepalive:15,resubscribe:true,connectTimeout:10000,will:{topic:TP+'rooms/'+mpId,payload:'',qos:1,retain:true}});
 mq.on('connect',()=>{$('onst').textContent='🟢 Conectado';mq.subscribe(TP+'rooms/+');mq.subscribe(TP+'p/'+mpId,{qos:1});pubRoom()});
 mq.on('offline',()=>{$('onst').textContent='🔴 Sem conexão, tentando de novo...'});mq.on('error',()=>{$('onst').textContent='🔴 Erro de conexão'});
 mq.on('message',(tp,pl_)=>{const str=pl_.toString();if(tp.startsWith(TP+'rooms/')){const id=tp.slice((TP+'rooms/').length);if(!str)delete ROOMS[id];else{try{ROOMS[id]=JSON.parse(str)}catch(e){}}renderRooms();return}
  try{mpMsg(JSON.parse(str))}catch(e){}})}
function cancelRoom(){if(mq&&myRoom)mq.publish(TP+'rooms/'+mpId,'',{retain:true,qos:1});myRoom=null;opId=''}
$('onct').innerHTML=CITIES.map(c=>'<button data-c="'+c.n+'">'+c.n+'</button>').join('');
$('onct').onclick=e=>{const b=e.target.closest('button');if(!b)return;selCity=b.dataset.c;for(const x of $('onct').children)x.classList.toggle('sel',x===b)};
$('onct').children[0].classList.add('sel');
$('onb').onclick=()=>{$('on').style.display='flex';onShow('onMenu');mqConn()};
$('onx').onclick=()=>{cancelRoom();$('on').style.display='none'};
$('onNew').onclick=()=>onShow('onCreate');$('onJoin').onclick=()=>{onShow('onList');refreshRooms()};
$('oncr').onclick=()=>{mqConn();mpWho='a';mpCity=selCity;opId='';myRoom={s:'wait',name:$('onn').value.trim()||'Sala '+mpId};onShow('onWait');$('onwt').textContent='Aguardando jogadores... ('+mpCity+')';pubRoom()};
$('onwx').onclick=()=>{cancelRoom();onShow('onMenu')};$('onr').onclick=()=>refreshRooms();
$('onl').onclick=e=>{const b=e.target.closest('button');if(!b)return;const r=ROOMS[b.dataset.j];if(!r||!mq)return;mpCity=r.city;mpWho='b';opId=r.id;$('onst').textContent='Entrando na sala...';
 mq.publish(TP+'p/'+r.id,JSON.stringify({t:'join',from:mpId}),{qos:1});setTimeout(()=>{if(!MP){opId='';$('onst').textContent='Sala indisponível. Atualize a lista.'}},7000)};
function refreshRooms(){if(!mq)return;ROOMS={};renderRooms();mq.unsubscribe(TP+'rooms/+',()=>mq.subscribe(TP+'rooms/+'))}
addEventListener('beforeunload',()=>{try{cancelRoom()}catch(e){}});
