/* Deadzone · features/account.js
 * Conta local do jogador (cadastro/entrada).
 */
(()=>{
 const $=id=>document.getElementById(id);
 const auth=$('auth'),form=$('authForm'),nameWrap=$('nameWrap'),title=$('authTitle'),desc=$('authDesc'),submit=$('authSubmit'),switchBtn=$('authSwitch'),err=$('authError');
 let mode='signup';
 const getUsers=()=>{try{return JSON.parse(localStorage.getItem('deadzone_accounts')||'{}')}catch(e){return {}}};
 async function hash(p){const data=new TextEncoder().encode(p);const digest=await crypto.subtle.digest('SHA-256',data);return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}
 function setMode(m){mode=m;err.textContent='';title.textContent=m==='signup'?'CRIAR CONTA':'ENTRAR';desc.textContent=m==='signup'?'Crie seu perfil para jogar neste dispositivo.':'Entre com o e-mail e a senha da sua conta.';nameWrap.style.display=m==='signup'?'block':'none';$('playerName').required=m==='signup';$('playerPassword').autocomplete=m==='signup'?'new-password':'current-password';$('playerPassword').placeholder=m==='signup'?'Mínimo de 6 caracteres':'Sua senha';submit.textContent=m==='signup'?'CRIAR CONTA':'ENTRAR';switchBtn.textContent=m==='signup'?'Já tem conta? Entrar':'Não tem conta? Criar conta'}
 function enter(name,email){localStorage.setItem('deadzone_current_user',JSON.stringify({name,email}));$('pn').textContent=name+' · Nv. 1';auth.style.display='none';}
 const current=localStorage.getItem('deadzone_current_user');
 if(current){try{const u=JSON.parse(current);if(u&&u.name){$('pn').textContent=u.name+' · Nv. 1';auth.style.display='none'}}catch(e){}}
 switchBtn.addEventListener('click',()=>setMode(mode==='signup'?'login':'signup'));
 form.addEventListener('submit',async e=>{e.preventDefault();err.textContent='';const email=$('playerEmail').value.trim().toLowerCase(),password=$('playerPassword').value,name=$('playerName').value.trim();if(!email||password.length<6){err.textContent='Informe um e-mail válido e uma senha de pelo menos 6 caracteres.';return}submit.disabled=true;submit.textContent='AGUARDE...';try{const users=getUsers(),key=await hash(password);if(mode==='signup'){if(!name){err.textContent='Digite o nome do player.';return}if(users[email]){err.textContent='Esse e-mail já tem conta. Entre nela.';return}users[email]={name,passwordHash:key};localStorage.setItem('deadzone_accounts',JSON.stringify(users));enter(name,email)}else{if(!users[email]||users[email].passwordHash!==key){err.textContent='E-mail ou senha incorretos.';return}enter(users[email].name,email)}}catch(ex){err.textContent='Não foi possível validar a conta neste navegador. Abra o jogo pela hospedagem HTTPS.'}finally{submit.disabled=false;submit.textContent=mode==='signup'?'CRIAR CONTA':'ENTRAR'}});
 $('googleAuth').addEventListener('click',()=>{err.textContent='O botão está preparado na interface, mas o Google Sign-In ainda não está conectado. Para funcionar de verdade, é necessário configurar Firebase Authentication e o domínio autorizado.'});
})();
