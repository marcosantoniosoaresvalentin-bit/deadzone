/* Deadzone · features/gladiators-duo-nametags.js
 * Gladiadores em dupla e nomes dos aliados.
 */
(()=>{
 const $=id=>document.getElementById(id);
 // Names used by local bots; every teammate receives a stable, distinct name per round.
 const names=['Raven','Ghost','Viper','Falcão','Sombra','Hunter','Ninja','Trovão','Wolf','Spectro','Blade','Venom','Drako','Phoenix','Titan','Zero','Raptor','Cobra','Lobo','Fênix','Maverick','Shadow','Reaper','Storm','Atlas','Dante','Onyx','Ranger','Hawk','Orion'];
 const used=new Set();
 const pickName=()=>{let a=names.filter(n=>!used.has(n));if(!a.length){used.clear();a=names}const n=a[Math.floor(Math.random()*a.length)];used.add(n);return n};
 const playerLabel=e=>{
   if(e&&e.nm)return String(e.nm);
   if(e&&e.id)return 'Parceiro '+String(e.id).slice(0,4).toUpperCase();
   return pickName();
 };
 // Make the lobby's INICIAR button honor the saved Gladiadores size.
 const go=$('go');
 if(go)go.addEventListener('click',e=>{
   const m=localStorage.getItem('dzSelectedMode')||localStorage.getItem('dzMode')||'classic';
   if(m!=='pvp')return;
   e.preventDefault();e.stopImmediatePropagation();
   const size=localStorage.getItem('dzMatchSize')==='2v2'?'2v2':'1v1';
   localStorage.setItem('dzMatchSize',size);
   localStorage.setItem('dzRoomType','gladiator');
   localStorage.setItem('deadzone_party_mode',size==='2v2'?'duo':'solo');
   if($('on'))$('on').style.display='none';
   if(typeof queue==='function'&&typeof window.sqStart==='function'){
     queue('squad',size==='2v2'?4:2,window.sqStart);
   }else if(typeof window.startGame==='function')window.startGame();
 },true);
 // Make sure the selected size is reflected in the Gladiadores arena setup.
 const originalSqStart=window.sqStart;
 if(typeof originalSqStart==='function'){
   window.sqStart=function(ids,mid,seed,city,playerNames){
     used.clear();
     const size=localStorage.getItem('dzMatchSize')==='2v2'?'2v2':'1v1';
     localStorage.setItem('dzMatchSize',size);
     const result=originalSqStart.apply(this,[ids,mid,seed,city]);
     if(typeof SQ!=='undefined'&&SQ){
       SQ.matchSize=size;
       SQ.teamCap=size==='2v2'?2:1;
       // Name every allied bot and every allied human. Never add a tag for the local player.
       for(const ent of (SQ.B||[])){
         if(!ent||ent.team!==SQ.mt)continue;
         if(ent.id){
           ent.nm=String((playerNames||{})[ent.id]||playerLabel(ent)).slice(0,22);
         }else if(ent.bi!=null || (SQ.K||[]).includes(ent)){
           ent.nm=playerLabel(ent);
         }else if(!ent.nm){
           ent.nm=playerLabel(ent);
         }
       }
     }
     return result;
   };
 }
 let tagLayer=null,list=null,tags=new Map(),lastRound=null;
 function ensureUI(){
   if(!tagLayer){
     tagLayer=document.createElement('div');tagLayer.id='dz35-squad-name-tags';
     tagLayer.style.cssText='position:fixed;inset:0;z-index:26;pointer-events:none;overflow:hidden';
     document.body.appendChild(tagLayer);
   }
   if(!list){
     list=document.createElement('div');list.id='dz35-squad-roster';
     list.style.cssText='position:fixed;left:9px;top:78px;z-index:27;min-width:112px;max-width:155px;padding:7px 9px;border-radius:9px;background:rgba(5,15,24,.62);border:1px solid rgba(110,220,255,.42);color:#fff;font:600 11px/1.55 system-ui,sans-serif;text-shadow:0 1px 2px #000;pointer-events:none;display:none';
     document.body.appendChild(list);
   }
 }
 function sync(){
   ensureUI();
   const S=typeof SQ!=='undefined'?SQ:null;
   if(!S||!S.B||!['ground','dead'].includes(mode)||!S.matchSize){
     list.style.display='none';tagLayer.style.display='none';return;
   }
   tagLayer.style.display='block';
   const allies=S.B.filter(e=>e&&e.team===S.mt&&!e.dead);
   const roundKey=S.mid||S.ids?.join(',')||'round';
   if(lastRound!==roundKey){tags.forEach(t=>t.remove());tags.clear();lastRound=roundKey}
   const liveKeys=new Set();
   const rows=[];
   for(const ent of allies){
     // SQ.B contains remote human partners and local AI bots; skip our own avatar.
     if(ent.id && typeof mpId!=='undefined' && ent.id===mpId)continue;
     if(!ent.nm)ent.nm=playerLabel(ent);
     const key=ent.id||('bot-'+(ent.bi!=null?ent.bi:(S.K||[]).indexOf(ent)));
     liveKeys.add(key);rows.push(ent.nm);
     let el=tags.get(key);
     if(!el){
       el=document.createElement('div');el.style.cssText='position:absolute;color:#fff;font:600 10px/1 system-ui,sans-serif;letter-spacing:.1px;white-space:nowrap;text-shadow:0 1px 2px #000,0 0 4px #000;transform:translate(-50%,-100%);pointer-events:none';
       tagLayer.appendChild(el);tags.set(key,el);
     }
     el.textContent=ent.nm;
     const pos=ent.g&&ent.g.position?ent.g.position.clone():new T.Vector3(ent.x||0,ent.py||ent.y||0,ent.z||0);
     pos.y+=2.35;
     const p=pos.project(cam);
     const visible=ent.g&&ent.g.visible!==false&&p.z>-1&&p.z<1&&Math.abs(p.x)<1.08&&Math.abs(p.y)<1.08&&mode!=='dead';
     el.style.display=visible?'block':'none';
     if(visible){el.style.left=((p.x+1)*.5*innerWidth)+'px';el.style.top=((1-p.y)*.5*innerHeight)+'px'}
   }
   for(const [key,el] of tags){if(!liveKeys.has(key)){el.remove();tags.delete(key)}}
   list.style.display=allies.length?'block':'none';
   list.innerHTML='<div style="color:#7debdc;font-weight:800;margin-bottom:3px">'+(S.matchSize==='2v2'?'GLADIADORES · DUO':'GLADIADORES · SOLO')+'</div>'+rows.map((n,i)=>'<div>• '+String(n).replace(/[&<>"]/g,'')+'</div>').join('');
 }
 setInterval(sync,80);
})();
