/* Deadzone · features/team.js
 * Equipe e convites.
 */
(()=>{
 const $=id=>document.getElementById(id); const panel=$('teamPanel');
 let mode='squad',auto=true,team=[],lastInvite='';
 const readUser=()=>{try{return JSON.parse(localStorage.getItem('deadzone_current_user')||'null')}catch(e){return null}};
 const getId=()=>{let id=localStorage.getItem('deadzone_player_id');if(!id){id='DZ-'+Math.random().toString(36).slice(2,8).toUpperCase().replace(/[^A-Z0-9]/g,'0').padEnd(6,'0').slice(0,6);localStorage.setItem('deadzone_player_id',id)}return id};
 const playerName=()=>{const u=readUser();return u&&u.name?u.name:'Jogador';};
 const cap=()=>({solo:1,duo:2,trio:3,squad:4}[mode]||4);
 function status(t){$('teamStatus').textContent=t}
 function render(){const max=cap();if(team.length>max)team=team.slice(0,max);while(team.length<1)team.push({name:playerName(),id:getId(),kind:'you'});$('teamSlots').innerHTML='';for(let i=0;i<max;i++){const m=team[i];const d=document.createElement('div');d.className='slot';d.innerHTML='<span>'+(i+1)+'. '+(m?String(m.name).replace(/[<>]/g,''):'Vaga livre')+'</span><span>'+(m?(m.kind==='bot'?'🤖 BOT':m.kind==='you'?'⭐ VOCÊ':'👤 CONVIDADO'):'—')+'</span>';$('teamSlots').appendChild(d)}$('myPlayerId').textContent=getId();for(const b of $('teamModes').querySelectorAll('button'))b.classList.toggle('sel',b.dataset.mode===mode);$('teamAuto').classList.toggle('sel',auto);$('teamAuto').textContent='Autopareamento: '+(auto?'LIGADO':'DESLIGADO')}
 function open(){panel.style.display='flex';render();status('');}
 $('onb').insertAdjacentHTML('afterend','<button id="teamOpenBtn">👥 Equipe / Convites</button>');$('teamOpenBtn').addEventListener('click',open);
 $('teamClose').onclick=()=>panel.style.display='none';
 $('teamModes').addEventListener('click',e=>{const b=e.target.closest('button[data-mode]');if(!b)return;mode=b.dataset.mode;team=team.filter((x,i)=>i<cap());render();status('Modo selecionado: '+mode.toUpperCase()+'.')});
 $('copyPlayerId').onclick=async()=>{try{await navigator.clipboard.writeText(getId());status('Seu ID foi copiado.')}catch(e){status('Seu ID: '+getId()+' — selecione e copie manualmente.')}};
 $('sendInvite').onclick=()=>{const target=$('inviteTarget').value.trim();if(!target){status('Digite o nome ou ID do jogador.');return}lastInvite='🎮 Convite Deadzone! '+playerName()+' ('+getId()+') convidou você para uma partida '+mode.toUpperCase()+'. Código da equipe: '+getId()+'-'+mode.toUpperCase()+'. Jogador convidado: '+target;status('Convite preparado para '+target+'. Use “Copiar mensagem” para compartilhar. O envio online precisa de servidor.');};
 $('copyInvite').onclick=async()=>{if(!lastInvite){status('Primeiro digite um nome/ID e toque em Gerar convite.');return}try{await navigator.clipboard.writeText(lastInvite);status('Mensagem de convite copiada para compartilhar.')}catch(e){status(lastInvite)}};
 $('addDemoFriend').onclick=()=>{if(team.length>=cap()){status('A equipe já está cheia neste modo.');return}const n=$('inviteTarget').value.trim()||'Amigo de teste';team.push({name:n,id:'LOCAL',kind:'friend'});render();status('Adicionado apenas à demonstração local; não representa um jogador online real.')};
 $('teamFill').onclick=()=>{while(team.length<cap())team.push({name:'Vaga livre',id:'',kind:'empty'});render();status('Vagas exibidas. Ative autopareamento para procurar jogadores quando o servidor estiver integrado.')};
 $('teamBots').onclick=()=>{team=team.filter(x=>x.kind!=='bot');while(team.length<cap())team.push({name:'Bot '+(team.filter(x=>x.kind==='bot').length+1),id:'BOT',kind:'bot'});render();status('Equipe demonstrativa preenchida com bots locais. IA de bot e partida online sincronizada não estão conectadas por este painel.')};
 $('teamAuto').onclick=()=>{auto=!auto;render();status(auto?'Autopareamento marcado como ligado (precisa de servidor para buscar jogadores reais).':'Autopareamento desligado. Você controla o preenchimento da equipe.')};
 $('teamStart').onclick=()=>{localStorage.setItem('deadzone_team_config',JSON.stringify({mode,auto,team}));panel.style.display='none';status('');const mp=$('mpn');if(mp){mp.style.display='flex';const buttons=[...document.querySelectorAll('#mpm button')];const match=buttons.find(b=>(b.textContent||'').toLowerCase().includes(mode));if(match)match.click()}else alert('Equipe salva. A integração com início de partida por equipe precisa ser ligada ao sistema de partidas.');};
 const oldCurrent=localStorage.getItem('deadzone_current_user');if(oldCurrent){getId()}
})();
