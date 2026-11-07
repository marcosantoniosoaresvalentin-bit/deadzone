/* Deadzone · features/lobby-menus.js
 * Conquistas, ranking, missões e loja.
 */
(()=>{try{
const q=i=>document.getElementById(i),G=n=>{try{return(0,eval)(n)}catch(e){return undefined}};
const lv=()=>{try{return lvOf(PR.xp)}catch(e){return 1}};
const modal=(t,h)=>{q('d43mt').textContent=t;q('d43mb').innerHTML=h;q('dz43m').style.display='flex'};
q('d43mx').onclick=()=>q('dz43m').style.display='none';
const bar=(p)=>'<div class="bar"><i style="width:'+Math.min(100,p*100)+'%"></i></div>';
const row=(a,b,p)=>'<div class="r"><div>'+a+(p!=null?bar(p):'')+'</div><small>'+b+'</small></div>';
// presente diário
const today=()=>new Date().toISOString().slice(0,10),gk='dz43gift';
const gOk=()=>{try{return localStorage.getItem(gk)!==today()}catch(e){return false}};
q('d43g').onclick=()=>{if(!gOk()){modal('🎁 Presente diário','<p>Você já resgatou hoje. Volte amanhã!</p>');return}try{localStorage.setItem(gk,today());PR.coins+=100;savePR();updPn()}catch(e){}modal('🎁 Presente diário','<p>+100 🪙 resgatadas!</p>')};
const lf=q('lobbyFriendsBtn');
q('d43f').onclick=()=>lf&&lf.click();
q('d43e').onclick=()=>{lf&&lf.click();setTimeout(()=>{const t=document.querySelector('#dzSocialNav [data-tab=notices]');t&&t.click()},60)};
q('d43i').onclick=()=>window.dzOpenInv('inv');
q('d43c').onclick=()=>q('cfgb').click();
q('d43mo').onclick=()=>q('mapb').click();
q('d43p').onclick=()=>q('go').click();
q('d43id').onclick=()=>{const t=(q('dzPlayerIdText')||{}).textContent||'';try{navigator.clipboard.writeText(t)}catch(e){}};
document.querySelector('#dz43 .menu').onclick=e=>{const b=e.target.closest('button');if(!b)return;const m=b.dataset.m,l=lv(),c=PR.coins||0;
 if(m==='shop')return window.dzOpenInv('store');
 if(m==='ach')modal('🏆 Conquistas',[['Chegar ao nível 2',l,2],['Chegar ao nível 5',l,5],['Chegar ao nível 10',l,10],['Juntar 500 🪙',c,500],['Desbloquear 1 skin',(PR.unl||[]).length,1]].map(a=>row(a[0],Math.min(a[1],a[2])+'/'+a[2],a[1]/a[2])).join(''));
 if(m==='mis')modal('✅ Missões',[['Jogar 1 partida',1],['Conseguir 3 abates',3],['Ficar entre os 10 últimos',1]].map(a=>row(a[0],'0/'+a[1],0)).join('')+'<small style="opacity:.6">Rastreio de missões ainda não ligado às partidas.</small>');
 if(m==='rank'){const nm=['Shadow','Viper','Nova','Ghost','Blitz','Rex','Hawk','Echo','Zed'],a=nm.map((n,i)=>[n,(900-i*95)]);a.push([(q('d43n').textContent.split(' - ')[0]),PR.xp||0]);a.sort((x,y)=>y[1]-x[1]);modal('📊 Ranking',a.map((x,i)=>row('#'+(i+1)+' '+x[0],x[1]+' XP')).join('')+'<small style="opacity:.6">Ranking local (sem servidor).</small>')}};
q('d43b').onclick=()=>{const l=lv();modal('⬢ Passe de Batalha',Array.from({length:10},(_,i)=>row('Nível '+(i+1),i<l?'✓ liberado':'🔒',null)).join('')+'<small style="opacity:.6">Recompensas ainda não ligadas.</small>')};
const slides=[['JOGUE','AGORA!'],['NOVAS','SKINS!'],['PASSE DE','BATALHA']];let si=0;
const rs=()=>{q('d43pt').innerHTML=slides[si][0]+'<span>'+slides[si][1]+'</span>';[...document.querySelectorAll('#dz43 .dots i')].forEach((d,i)=>d.classList.toggle('on',i===si))};rs();
setInterval(()=>{si=(si+1)%3;rs()},4000);
const tick=()=>{const on=getComputedStyle(q('lb')).display!=='none';q('dz43').style.display=on?'block':'none';for(const i of['hud','hpb']){const e=q(i);if(e)e.style.visibility=on?'hidden':''}if(!on)return;
 const pn=q('pn').textContent,l=lv(),a=lvStart(l),b=lvStart(l+1),x=(PR.xp||0)-a,w=b-a;
 q('d43n').textContent=pn.split(' · ')[0]+' - Nv. '+l;
 const id=(q('dzPlayerIdText')||{}).textContent;if(id)q('d43id').textContent='ID: '+id+' ⧉';
 q('d43bl').textContent='Nível '+l;q('d43bi').style.width=Math.min(100,x/w*100)+'%';q('d43bx').textContent=x+'/'+w;
 q('d43gb').style.display=gOk()?'block':'none';
 try{const M=MODES.find(m=>m[0]===GMODE);q('d43mn').textContent=GMAP;q('d43ms').textContent='👥 '+(M?M[1]:'Clássico')}catch(e){}};
setInterval(tick,400);tick();
// cenário 3D: helicóptero, caixas, anel duplo no pedestal
try{const B=c=>new T.MeshBasicMaterial({color:c}),S=(c,r)=>new T.MeshStandardMaterial({color:c,roughness:r||.6,metalness:.3}),g=new T.Group(),add=(m,x,y,z,p)=>{m.position.set(x,y,z);(p||g).add(m);return m};
 const hel=mkHeli({body:0x4a5a3a,accent:0xe0b020,dark:0x1d2229,mil:1,lobby:1}),hu=hel.userData;hel.scale.setScalar(.82);hel.position.set(4.9,3.7,-7.2);g.add(hel);
 const rot={rotation:hu.rot.rotation};
 const cr=[[3.6,-2.4,1],[4.8,-2.8,1.2],[4.2,-2.6,.8]];cr.forEach((c,i)=>{const s=c[2];add(new T.Mesh(new T.BoxGeometry(s,s*.9,s),S(i?0x3d2a1a:0x2e2016,.9)),c[0],-.11+s*.45+(i==2?s*.9:0),c[1])});
 add(new T.Mesh(new T.CylinderGeometry(.35,.35,.9,12),S(0x5a3a3a)),5.7,.34,-2.2);
 const r2=add(new T.Mesh(new T.TorusGeometry(1.55,.035,8,64),B(0x3fb4ff)),0,.03,0);r2.rotation.x=Math.PI/2;
 const d=add(new T.Mesh(new T.CircleGeometry(1.5,40),new T.MeshBasicMaterial({color:0x2ea8ff,transparent:true,opacity:.07,blending:T.AdditiveBlending,depthWrite:false})),0,.045,0);d.rotation.x=-Math.PI/2;
 stage.add(g);const _a=lobAnim;let _lt=0;lobAnim=function(){_a();const n=performance.now()/1000,dt=Math.min(.05,n-(_lt||n));_lt=n;hu.rot.rotation.y+=dt*34;hu.trot.rotation.x+=dt*52;hu.disc.material.opacity=.17;hu.tdisc.material.opacity=.15;hel.position.set(4.9+Math.sin(n*.31)*.35,3.7+Math.sin(n*.9)*.2,-7.2+Math.cos(n*.27)*.25);hel.rotation.set(.07+Math.sin(n*.7)*.014,-.95+Math.sin(n*.37)*.05,Math.sin(n*.8)*.035);const bt=n%1.15;hu.strobe.visible=bt<.1;hu.beacon.visible=bt>.55&&bt<.68;r2.material.color.setHex(0x3fb4ff)}}catch(e){console.warn('dz43 cena',e)}
}catch(e){console.warn('dz43',e)}})();
