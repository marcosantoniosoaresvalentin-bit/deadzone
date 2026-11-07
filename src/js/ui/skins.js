/* Deadzone · ui/skins.js
 * Roupas, paraquedas e pinturas de veículo.
 */
const OUT=[
{id:'soldado',n:'Soldado',ol:0x55663f,pt:0x4f5640,hl:0x3b4430,dk:0x2f3828},
{id:'urbano',n:'Operador Urbano',ol:0x5a5f66,pt:0x3a3d42,hl:0x2b2d30,dk:0x1e2024,cost:150},
{id:'deserto',n:'Tempestade do Deserto',ol:0xb59a6a,pt:0x9a8458,hl:0x7a6a44,dk:0x5a4d33,cost:150},
{id:'artico',n:'Fantasma Ártico',ol:0xd6dde4,pt:0xb9c3cc,hl:0x9aa6b0,dk:0x6a7580,cost:200},
{id:'selva',n:'Caçador da Selva',ol:0x2f5a34,pt:0x2a4a2c,hl:0x1f3a22,dk:0x1a2a1c,cost:200},
{id:'ouro',n:'Rei Dourado',ol:0xc9a227,pt:0x8a6d1a,hl:0x6a5412,dk:0x3d300a,cost:300,lg:'o5'},
{id:'sangue',n:'Carniceiro',ol:0x8a1f1f,pt:0x4a1212,hl:0x3a0d0d,dk:0x240808,cost:250,lg:'o6'},
{id:'noturno',n:'Sombra Noturna',ol:0x2a3550,pt:0x1c2336,hl:0x141a28,dk:0x0c101a,cost:200,lg:'o7'},
{id:'dz_elite',n:'Deadzone Elite',ol:0x24262a,pt:0x15171a,hl:0xe8742d,dk:0x0c0d0f,cost:350}],
PAR=[
{id:'classico',n:'Clássico',c:0xe8742d,c2:0xf2f2f2},
{id:'ceu',n:'Céu Azul',c:0x2a6fd1,c2:0xf2f2f2,cost:100},
{id:'fogo',n:'Vermelho Fogo',c:0xc02a2a,c2:0xf2f2f2,cost:100},
{id:'selva',n:'Selva',c:0x3a9a4a,c2:0x1f5a2a,cost:100},
{id:'noite',n:'Noite Negra',c:0x222222,c2:0x555555,cost:100},
{id:'rosa',n:'Rosa Choque',c:0xe05a9a,c2:0xf8d0e2,cost:100},
{id:'dourado',n:'Dourado Real',c:0xe0b81a,c2:0xfff3b0,cost:150,lg:'p6'},
{id:'gelo',n:'Ciano Gelo',c:0x2ad1c8,c2:0xe6ffff,cost:120,lg:'p7'},
{id:'mistico',n:'Roxo Místico',c:0x7a3ad1,c2:0xd9c2ff,cost:120,lg:'p8'},
{id:'dz_classic',n:'Deadzone Clássico',c:0x1a1a1a,c2:0x2e2e2e,tx:{f:'#e8742d'},cost:250},
{id:'dz_gold',n:'Deadzone Ouro',c:0xe0b81a,c2:0xc99a10,tx:{f:'#1a1405'},cost:400},
{id:'dz_neon',n:'Deadzone Neon',c:0x0b1d2e,c2:0x12304a,tx:{f:'#2ad1c8'},cost:300},
{id:'dz_sangue',n:'Deadzone Sangue',c:0x8a1f1f,c2:0x5e1414,tx:{f:'#ffffff'},cost:300}];
const CARC=[
{id:'original',n:'Original',c:null},
{id:'vermelho',n:'Sport Vermelho',c:0xc02a2a,c2:0xffffff,cost:200},
{id:'azul',n:'Turbo Azul',c:0x2a6fd1,c2:0xffffff,cost:200},
{id:'branco',n:'Gelo Branco',c:0xe8e8e8,c2:0x222222,cost:200},
{id:'preto',n:'Noite Preta',c:0x222222,c2:0xc9a227,cost:250},
{id:'verde',n:'Selva Verde',c:0x3a9a4a,c2:0xffffff,cost:200},
{id:'amarelo',n:'Táxi Amarelo',c:0xe0b81a,c2:0x222222,cost:200},
{id:'laranja',n:'Chama Laranja',c:0xe8742d,c2:0x222222,cost:200},
{id:'rosa',n:'Rosa Neon',c:0xe05a9a,c2:0xffffff,cost:250},
{id:'roxo',n:'Roxo Místico',c:0x7a3ad1,c2:0xe0d0ff,cost:250},
{id:'ciano',n:'Ciano Elétrico',c:0x2ad1c8,c2:0x0b1d2e,cost:250},
{id:'dz_racing',n:'Deadzone Racing',c:0x1a1a1a,c2:0xe8742d,tx:{f:'#e8742d'},cost:400},
{id:'dz_gold',n:'Deadzone Ouro',c:0xe0b81a,c2:0x1a1405,tx:{f:'#1a1405'},cost:600},
{id:'dz_neon',n:'Deadzone Neon',c:0x0b1d2e,c2:0x2ad1c8,tx:{f:'#2ad1c8'},cost:500}],CMATC={},DZTX={};
const hxc=c=>'#'+c.toString(16).padStart(6,'0');
function carTex(it){const k='c'+it.id;if(DZTX[k])return DZTX[k];const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.fillStyle=hxc(it.c);g.fillRect(0,0,512,128);g.fillStyle=hxc(it.c2);
 if(it.tx){g.fillRect(0,22,512,9);g.fillRect(0,97,512,9);g.fillStyle=it.tx.f;g.font='900 46px system-ui,Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('DEADZONE',256,64)}else{g.fillRect(0,50,512,13);g.fillRect(0,70,512,5)}
 const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=4;return DZTX[k]=t}
function chuteTex(it,idx){const k='p'+it.id+idx;if(DZTX[k])return DZTX[k];const c=document.createElement('canvas');c.width=128;c.height=256;const g=c.getContext('2d');g.fillStyle=hxc(idx%2?it.c2:it.c);g.fillRect(0,0,128,256);g.fillStyle=it.tx.f;g.font='900 150px system-ui,Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('DEADZONE'[idx%8],64,150);
 const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=4;return DZTX[k]=t}
let selC=0;try{selC=+localStorage.getItem('dzC')||0;if(!CARC[selC])selC=0}catch(e){}
function carMatFor(i){return CMATC[i]||(CMATC[i]=(()=>{const it=CARC[i];if(it.c==null)return M(0xb03030);const m=M(0xffffff);m.map=carTex(it);m.roughness=.45;m.metalness=.3;return m})())}
let selO=0,selP=0,invT='o',lobRot=0,lobDrag=0,lobX=0;try{selO=+localStorage.getItem('dzO')||0;selP=+localStorage.getItem('dzP')||0}catch(e){}
function applySkins(){const o=OUT[selO];for(const k of['ol','pt','hl','dk'])PM[k].color.copy(lin(o[k]));const pk=PAR[selP];let ix=0;for(const m of canopy.children){if(!m.isMesh)continue;const mt=m.material;if(pk.tx){mt.map=chuteTex(pk,ix);mt.color.set(0xffffff)}else{mt.map=null;mt.color.set(ix%2?pk.c2:pk.c)}mt.needsUpdate=true;ix++}try{lobCarSet()}catch(e){}}
function renderInv(){const L=invT==='o'?OUT:PAR,sel=invT==='o'?selO:selP,g=$('ig');g.innerHTML='';$('tO').className=invT==='o'?'on':'';$('tP').className=invT==='p'?'on':'';
 L.forEach((it,i)=>{const d=document.createElement('div');d.className='ic'+(i===sel?' on':'');const hx=c=>'#'+c.toString(16).padStart(6,'0');d.innerHTML='<i>'+(invT==='o'?['ol','pt','hl'].map(k=>'<b style="background:'+hx(it[k])+'"></b>').join(''):'<b style="background:'+hx(it.c)+'"></b>')+'</i>'+it.n+(i===sel?' ✔':'');
  d.onclick=()=>{if(invT==='o')selO=i;else selP=i;try{localStorage.setItem('dzO',selO);localStorage.setItem('dzP',selP)}catch(e){}applySkins();renderInv()};g.appendChild(d)})}
$('invb').onclick=()=>{$('inv').style.display='flex';renderInv()};$('invx').onclick=()=>{$('inv').style.display='none'};$('tO').onclick=()=>{invT='o';renderInv()};$('tP').onclick=()=>{invT='p';renderInv()};$('tC').onclick=()=>{invT='c';renderInv()};
addEventListener('pointerdown',e=>{if(mode==='lobby'&&$('inv').style.display!=='flex'&&!e.target.closest('button')){lobDrag=1;lobX=e.clientX}});addEventListener('pointermove',e=>{if(lobDrag){lobRot+=(e.clientX-lobX)*.012;lobX=e.clientX}});addEventListener('pointerup',()=>{lobDrag=0});
setTimeout(()=>{try{applySkins()}catch(e){}},0);
