/* Deadzone · world/map.js
 * MAPA EM BRANCO: ilha pequena e plana (sem cidades, casas, estradas, árvores ou loot).
 * Base para construir o mapa do zero, peça por peça.
 *
 * Tamanho: MAPH é a metade do lado (MAPH=250 -> ilha de 500 x 500 m).
 * Tudo que depende do tamanho do mapa (limites, zona, rota do avião, mapa grande) lê MAPH.
 */
const MAPH=3800;         // metade do lado da ilha principal, em metros (ilha de ~7,6 x 7,6 km + Ilha Zênite)
const PLV=62;            // velocidade do avião (m/s)
// ---------- LITORAL da ilha principal (o terreno usa a mesma função) ----------
const DZN=(()=>{const hh=(x,z)=>{const v=Math.sin(x*127.1+z*311.7)*43758.5453;return v-Math.floor(v)};
 const vn=(x,z)=>{const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=xf*xf*(3-2*xf),w=zf*zf*(3-2*zf);return(hh(xi,zi)*(1-u)+hh(xi+1,zi)*u)*(1-w)+(hh(xi,zi+1)*(1-u)+hh(xi+1,zi+1)*u)*w};
 const fbm=(x,z)=>vn(x,z)*.5+vn(x*2.03+5.2,z*2.03+1.3)*.27+vn(x*4.1+9.1,z*4.1+3.7)*.15+vn(x*8.3+2.7,z*8.3+8.1)*.08;return{hh,vn,fbm}})();
function coastMain(x,z){const p=2.3,d=Math.pow(Math.pow(Math.abs(x),p)+Math.pow(Math.abs(z),p),1/p),a=Math.atan2(z,x),ca=Math.cos(a),sa=Math.sin(a);
 const cn=DZN.fbm(ca*1.7+7,sa*1.7+3)*.42+DZN.fbm(ca*4.6+1,sa*4.6+9)*.30+DZN.fbm(ca*11+4,sa*11+2)*.18+DZN.fbm(ca*26+2,sa*26+8)*.10;
 // lóbulos grandes (penínsulas e golfos) + recortes menores
 const R=MAPH-120+Math.sin(a*3+1.3)*330+Math.sin(a*5+.4)*210+Math.sin(a*2-.6)*230+Math.sin(a*7+2.2)*120+(cn-.5)*1250+Math.sin(a*9+2.1)*70;
 return R-d}                                                   // >0 dentro da ilha (m até a costa)
// tipo de trecho da costa: <0 praia larga de areia · 0 normal · >0 falésia de pedra
function coastKind(x,z){const a=Math.atan2(z,x),n=DZN.fbm(Math.cos(a)*2.6+11,Math.sin(a)*2.6+5);return n>.6?1:n<.4?-1:0}
// ponto da costa: andando do centro na direção (ux,uz) até a água
function coastAt(ux,uz,ax,az){ax=ax||0;az=az||0;let lo=0,hi=MAPH+1200;for(let i=0;i<44;i++){const m=(lo+hi)/2;if(coastMain(ax+ux*m,az+uz*m)>0)lo=m;else hi=m}return [ax+ux*lo,az+uz*lo]}
// ---------- posições dos locais (o desenho de cada local é o mesmo; aqui só muda ONDE ele fica) ----------
// ZÊNITE + PONTE: a ponte sai da costa oeste e chega na Ilha Zênite
const ZEN_Z=1500,ZEN_DZ=ZEN_Z-(-60),ZEN_CW=coastAt(-1,0,0,-78+ZEN_DZ)[0],ZEN_DX=ZEN_CW+246;
// LIMITES do mapa (ilha principal + Ilha Zênite a oeste)
const MAPB={x0:Math.min(-MAPH-700,-490+ZEN_DX-200),x1:MAPH+700,z0:-MAPH-700,z1:MAPH+700},MCX=(MAPB.x0+MAPB.x1)/2,MCZ=(MAPB.z0+MAPB.z1)/2,MAPR=Math.max(MAPB.x1-MCX,MAPB.z1-MCZ);
/* nas arenas (mapas separados, longe da ilha) não prende nos limites da ilha principal */
const MCLX=(v,m)=>window.DZAR_ON?v:Math.max(MAPB.x0+m,Math.min(MAPB.x1-m,v)),MCLZ=(v,m)=>window.DZAR_ON?v:Math.max(MAPB.z0+m,Math.min(MAPB.z1-m,v));
const PLT=(2*(MAPR+60))/PLV; // tempo até o avião atravessar o mapa (s)

// ---- materiais básicos usados pelo resto do jogo (veículos, lobby, bake) ----
const MT=(c,map,r)=>new T.MeshStandardMaterial({color:lin(c),map:map||null,roughness:r||.9,metalness:.04});
const VT=(c,k)=>({c:lin(c),k:k||0});
const DARK=VT(0x1e1e1e);
const VM=[new T.MeshStandardMaterial({vertexColors:true,roughness:.9}),new T.MeshStandardMaterial({vertexColors:true,metalness:.7,roughness:.15}),new T.MeshBasicMaterial({vertexColors:true})];
if(window.DZR){VM[3]=DZR.roofMat();VM[4]=DZR.brickMat()}
// textura de asfalto (usada pelo cenário do lobby)
const rdT=ctex(128,256,(g,w,h)=>{g.fillStyle='#46494e';g.fillRect(0,0,w,h);for(let i=0;i<2500;i++){g.fillStyle='rgba('+(R(0,1)<.5?'0,0,0':'255,255,255')+','+R(.03,.1)+')';g.fillRect(R(0,w),R(0,h),R(1,3),R(1,3))}g.fillStyle='#ddd';g.fillRect(6,0,3,h);g.fillRect(w-9,0,3,h)},1,1);

// ---- CIDADE (gerada aqui, sempre igual: semente fixa) ----
// ruas de asfalto em grade, calçadas, quarteirões cheios de lotes estreitos (prédios lado a lado, com
// passagem entre eles), casas com garagem e um ESTÁDIO de futebol. Quem monta a cidade é world/city.js.
function genTown(cfg){
 let sd=cfg.seed||7331;const rnd=()=>{sd=(sd*16807)%2147483647;return (sd-1)/2147483646};
 const C=Object.assign({RW:8,SW:2.5,blocks:[],lots:[],bl:30},cfg),T_=cfg.tag||'';
 C.x=(C.x0+C.x1)/2;C.z=(C.z0+C.z1)/2;
 const pal=[0xd8cfc0,0xc7b7a3,0xc9b79c,0xb7c0b8,0xe2d6b8,0xd1c4b4,0xbfae96,0xd9c7a8,0xa9b4b8,0xcfc1ad,0xe0d0c0,0xb8a48c,0xc4a88a,0x9fa8a3];
 const e=C.RW/2+C.SW;
 // estádio: junta os quarteirões (2,0) e (3,0) (a rua entre eles some)
 if(cfg.stadium){C.skipV={'3_0':1};C.stadium={x0:C.XL[2]+e,x1:C.XL[4]-e,z0:C.ZL[0]+e,z1:C.ZL[1]-e};C.blocks.push(Object.assign({id:T_+'stad',stadium:1},C.stadium))}
 const mkStr=(L,b,lw,ld,rt,wide)=>{
  const sr=rnd(),style=sr<.4?'plaster':sr<.66?'brick':sr<.84?'shop':'panel';
  const f=rnd();let floors=f<.1?1:f<.45?2:f<.75?3:4;if(style==='shop')floors=Math.max(2,Math.min(3,floors));if(style==='panel')floors=Math.max(3,floors);
  const w=wide?Math.min(lw-6,16+rnd()*4):Math.min(lw-5,11.1+rnd()*2.4),d=Math.min(ld-7.5,8.5+rnd()*3.5);
  const S={id:T_+'c'+C.lots.length,w:+w.toFixed(1),d:+d.toFixed(1),floors,rot:rt,color:pal[Math.floor(rnd()*pal.length)],mg:b.id,city:1,style};
  if(style==='panel')S.color=[0xb9b6ae,0xa7a59e,0xc6c0b4][Math.floor(rnd()*3)];
  if(style==='shop')S.awn=[0x2f5d3a,0x7a2e2a,0x2b4a6b,0x6b5a2b][Math.floor(rnd()*4)];
  if(floors<=2&&style!=='shop'&&rnd()<.5)S.roof='gable';if(floors>=2&&style!=='panel'&&rnd()<.45)S.balcony=1;S.band=style!=='plaster'||rnd()<.5?1:0;
  S.x=+((L.x0+L.x1)/2).toFixed(2);S.z=+(rt?L.z0+4+d/2:L.z1-4-d/2).toFixed(2);L.kind='str';L.S=S};
 for(let i=0;i<C.XL.length-1;i++)for(let j=0;j<C.ZL.length-1;j++){
  if(cfg.stadium&&j===0&&(i===2||i===3))continue;  // estádio
  if(cfg.tower&&i===1&&j===1){C.tower={x0:C.XL[1]+e,x1:C.XL[2]-e,z0:C.ZL[1]+e,z1:C.ZL[2]-e};C.blocks.push(Object.assign({id:T_+'torre',tower:1},C.tower));continue}
  const b={x0:C.XL[i]+e,x1:C.XL[i+1]-e,z0:C.ZL[j]+e,z1:C.ZL[j+1]-e,id:T_+'q'+i+j};C.blocks.push(b);
  const mz=(b.z0+b.z1)/2,W=b.x1-b.x0,u=W/3;
  for(const [lz0,lz1,rt] of [[b.z0,mz,Math.PI],[mz,b.z1,0]]){
   // cada fileira: 2 lotes (prédio com quintal dos lados) ou 1 lote inteiro (casa com garagem / prédio largo)
   const pr=rnd(),pat=pr<.62?[1,1]:[2];let x=b.x0;const u2=W/2;
   pat.forEach((n,k)=>{const L={x0:x,x1:x+u2*n,z0:lz0,z1:lz1,rot:rt,blk:b.id,eL:k===0,eR:k===pat.length-1};x+=u2*n;C.lots.push(L);
    const lw=L.x1-L.x0,ld=lz1-lz0;
    if(n===2&&rnd()<.6){ // casa com garagem aberta (com um buggy dentro)
     L.kind='home';const w=11,d=9,gw=5.2,gd=7,left=rnd()<.5;
     const S={id:T_+'c'+C.lots.length,w,d,floors:2,rot:rt,color:pal[Math.floor(rnd()*pal.length)],mg:b.id,city:1,style:rnd()<.6?'plaster':'brick',band:1};
     if(rnd()<.65)S.roof='gable';
     S.x=+(left?L.x0+2+w/2:L.x1-2-w/2).toFixed(2);S.z=+(rt?lz0+4.8+d/2:lz1-4.8-d/2).toFixed(2);L.S=S;
     L.G={x:+(left?L.x0+2+w+1.6+gw/2:L.x1-2-w-1.6-gw/2).toFixed(2),z:+(rt?lz0+3.2+gd/2:lz1-3.2-gd/2).toFixed(2),w:gw,d:gd,rot:rt};
    } else mkStr(L,b,lw,ld,rt,n===2&&rnd()<.6);
   });
  }}
 C.rnd=rnd;return C}
const onLand=(x,z,m)=>{let k=0;while(coastMain(x,z)<m&&k++<80){x*=.97;z*=.97}return [Math.round(x),Math.round(z)]};
// desloca a configuração de uma cidade (mesmo desenho, outro lugar)
const mvT=(c,dx,dz)=>Object.assign({},c,{x0:c.x0+dx,x1:c.x1+dx,z0:c.z0+dz,z1:c.z1+dz,XL:c.XL.map(v=>v+dx),ZL:c.ZL.map(v=>v+dz)});
const atT=(c,X,Z)=>{[X,Z]=onLand(X,Z,330);return mvT(c,X-(c.x0+c.x1)/2,Z-(c.z0+c.z1)/2)};
// cidade nova em grade: nx x nz quarteirões de 'b' metros, centrada em (X,Z)
const gridT=(n,tag,seed,X,Z,nx,nz,b,o)=>{[X,Z]=onLand(X,Z,330+Math.max(nx,nz)*b/2);const XL=[],ZL=[];for(let i=0;i<=nx;i++)XL.push(Math.round(X-nx*b/2+i*b));for(let j=0;j<=nz;j++)ZL.push(Math.round(Z-nz*b/2+j*b));return Object.assign({n,tag,seed,x0:XL[0]-8,x1:XL[nx]+8,z0:ZL[0]-8,z1:ZL[nz]+8,XL,ZL,bl:30},o||{})};
// cidades (bem longe uma da outra, como num mapa grande de battle royale)
const CITY=genTown(atT({n:'Nova Esperança',tag:'pv',seed:7331,x0:-36,x1:176,z0:-196,z1:-8,XL:[-28,22,72,122,168],ZL:[-188,-128,-72,-16],stadium:1},400,-1100));
const TOWNS=[CITY,
 genTown(atT({n:'Vila Rubra',tag:'vs',seed:4242,x0:-218,x1:-102,z0:112,z1:188,XL:[-210,-160,-110],ZL:[120,180],bl:20},-2150,1650)),
 genTown(atT({n:'Cerro Azul',tag:'mv',seed:9119,x0:133,x1:207,z0:143,z1:217,XL:[145,195],ZL:[155,205],bl:20},2350,2050)),
 genTown(mvT({n:'Zênite',tag:'zn',seed:2468,x0:-571,x1:-409,z0:-141,z1:21,XL:[-565,-515,-465,-415],ZL:[-135,-85,-35,15],bl:20,hFix:6,tower:1},ZEN_DX,ZEN_DZ)),
 genTown(atT({n:'Monte Alto',tag:'as',seed:5150,x0:52,x1:114,z0:58,z1:120,XL:[58,108],ZL:[64,114],bl:26},1650,350)),
 genTown(gridT('São Jorge','sj',3301,-1700,-1950,4,3,52)),
 genTown(gridT('Lagoa Seca','ls',3302,2850,-2250,3,3,50)),
 genTown(gridT('Vila Nova','vn',3303,-250,2750,4,2,50)),
 genTown(gridT('Campo Belo','cb',3304,-2900,-450,3,2,50)),
 genTown(gridT('Pinheiral','ph',3305,3050,-150,2,2,50)),
 genTown(gridT('Rio Claro','rc',3306,-550,550,4,3,52)),
 genTown(gridT('Santa Luz','sl',3307,1100,-2900,3,2,50)),
 genTown(gridT('Bela Vista','bv',3308,-1100,-1000,3,2,50)),
 genTown(gridT('Água Branca','ab',3309,2200,-900,3,2,50)),
 genTown(gridT('Terra Alta','ta',3310,-1300,3000,2,2,50)),
 genTown(gridT('Ponta Norte','pn',3311,500,-3300,2,2,50)),
 genTown(gridT('Alto Verde','av',3312,-3300,-1900,2,2,50)),
 genTown(gridT('Boa Vista','bo',3313,1450,-1450,3,2,50)),
 genTown(gridT('Santa Rita','sr',3314,-3050,1100,2,2,50)),
 genTown(gridT('Esperança','es',3315,3300,1900,2,2,50)),
 genTown(gridT('Nova Aurora','na',3316,-2200,2800,3,2,50))];
// LOCAIS ESPECIAIS (world/city.js monta): base militar, escola, porto e galpões
const SITES=[
 {id:'base',t:'military',n:'Base Militar',x0:-148,x1:-22,z0:15,z1:108,bl:22},
 {id:'escola',t:'school',n:'Escola',x0:-18,x1:48,z0:100,z1:150,bl:18},
 {id:'cais',t:'port',n:'Porto',x0:20,x1:110,z0:192,z1:222,bl:10},
 {id:'galpoes',t:'depot',n:'Galpões',x0:-215,x1:-150,z0:-15,z1:30,bl:18},
 {id:'posto',t:'gas',n:'Posto de Gasolina',x0:27,x1:47,z0:36,z1:58,bl:10},
 {id:'fazenda',t:'farm',n:'Fazenda',x0:55,x1:108,z0:8,z1:50,bl:18},
 {id:'pedreira',t:'quarry',n:'Pedreira',x0:-212,x1:-165,z0:-100,z1:-55,bl:30,hFix:8.5},
 {id:'praia',t:'beach',n:'Praia',x0:-95,x1:10,z0:200,z1:222,bl:8},
 {id:'usina',t:'power',n:'Usina',x0:180,x1:222,z0:-40,z1:10,bl:16}];
// novo lugar de cada local (centro). Porto e praia ficam na costa sul (o píer avança para o mar, +z)
{const S_SHIFT={base:[-650,-2650],escola:[900,1250],galpoes:[-2550,700],posto:[1150,-450],fazenda:[-1250,2250],pedreira:[-2400,-1450],usina:[3150,1150]};
 for(const S_ of SITES)S_.h=undefined;
 for(const S_ of SITES){const cx=(S_.x0+S_.x1)/2,cz=(S_.z0+S_.z1)/2;let tx,tz;
  if(S_.id==='cais'||S_.id==='praia'){const X=S_.id==='cais'?700:-950,cz2=coastAt(0,1,X,-900)[1];tx=X;tz=cz2-28-(S_.z1-cz)}
  else{[tx,tz]=onLand(S_SHIFT[S_.id][0],S_SHIFT[S_.id][1],420)}
  S_.dx=Math.round(tx-cx);S_.dz=Math.round(tz-cz);S_.x0+=S_.dx;S_.x1+=S_.dx;S_.z0+=S_.dz;S_.z1+=S_.dz;delete S_.hFix}}
for(const S_ of SITES){S_.x=(S_.x0+S_.x1)/2;S_.z=(S_.z0+S_.z1)/2}
const SITEBY=Object.fromEntries(SITES.map(S_=>[S_.id,S_]));
// prédios com interior dos locais (entram na lista STRS: dá para entrar, subir, pular janela...)
const SITE_STRS=[
 {id:'base_aloj1',x:-100,z:75,w:16,d:9,floors:2,rot:0,style:'panel',color:0x8f9479,band:1,mg:'base',city:1},
 {id:'base_aloj2',x:-100,z:52,w:16,d:9,floors:2,rot:0,style:'panel',color:0x8f9479,band:1,mg:'base',city:1},
 {id:'base_aloj3',x:-75,z:96,w:14,d:9,floors:1,rot:Math.PI,style:'panel',color:0x7f8a6a,band:1,mg:'base',city:1},
 {id:'posto_loja',x:42,z:52,w:10,d:7,floors:1,rot:-Math.PI/2,style:'shop',color:0xe6e1d6,awn:0xc0302a,mg:'posto',city:1},
 {id:'usina_ctrl',x:211,z:-28,w:13,d:9,floors:2,rot:-Math.PI/2,style:'panel',color:0xb9b6ae,band:1,mg:'usina',city:1},
 {id:'pedreira_esc',x:-200,z:-64,w:12,d:8.5,floors:2,rot:0,style:'brick',band:1,mg:'pedreira',city:1},
 {id:'faz_casa',x:96,z:18,w:11,d:9,floors:2,rot:-Math.PI/2,style:'plaster',color:0xe9e0c6,roof:'gable',band:1,balcony:1,mg:'fazenda',city:1},
 {id:'base_cmd',x:-58,z:30,w:12,d:9,floors:3,rot:Math.PI,style:'brick',band:1,mg:'base',city:1},
 {id:'escola1',x:15,z:111.5,w:24,d:11,floors:2,rot:Math.PI,style:'plaster',color:0xe8dcb8,band:1,balcony:1,mg:'escola',city:1},
 {id:'escola2',x:-5,z:139,w:12,d:9,floors:1,rot:0,style:'plaster',color:0xe8dcb8,band:1,mg:'escola',city:1},
 {id:'cais_cap',x:30,z:203,w:11,d:9,floors:2,rot:0,style:'plaster',color:0x9fb6c4,band:1,balcony:1,mg:'cais',city:1}];
for(const b of SITE_STRS){const S_=SITEBY[b.mg];if(S_){b.x+=S_.dx;b.z+=S_.dz}}
// ESTRADAS ligando cidades e locais: rede gerada (árvore mínima + atalhos), curvas suaves, sem passar pelo mar
const ROADLINES=(()=>{const L=[];let sd=777;const r=()=>{sd=(sd*16807)%2147483647;return (sd-1)/2147483646};
 const P=TOWNS.filter(t=>t.tag!=='zn').map(t=>({x:(t.x0+t.x1)/2,z:(t.z0+t.z1)/2,id:t.tag})).concat(SITES.filter(S_=>S_.id!=='praia').map(S_=>({x:S_.x,z:S_.z,id:S_.id})));
 const n=P.length,used=[0],E=[];const D=(a,b)=>Math.hypot(P[a].x-P[b].x,P[a].z-P[b].z);
 while(used.length<n){let ba=-1,bb=-1,bd=1e9;for(const a of used)for(let b=0;b<n;b++){if(used.includes(b))continue;const d=D(a,b);if(d<bd){bd=d;ba=a;bb=b}}used.push(bb);E.push([ba,bb])}
 // atalhos: cada local também liga ao 2º vizinho mais perto (se ainda não ligado)
 for(let a=0;a<n;a++){const o=[...Array(n).keys()].filter(b=>b!==a).sort((p,q)=>D(a,p)-D(a,q));const b=o[1];if(!E.some(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a))&&D(a,b)<2600)E.push([a,b])}
 const inland=(x,z,m)=>coastMain(x,z)>m;
 for(const [a,b] of E){const A=P[a],B=P[b],len=D(a,b),k=Math.max(2,Math.round(len/450)),pts=[[A.x,A.z]];const nx=-(B.z-A.z)/len,nz=(B.x-A.x)/len;
  for(let i=1;i<k;i++){const t=i/k;let x=A.x+(B.x-A.x)*t,z=A.z+(B.z-A.z)*t;const off=(r()-.5)*Math.min(260,len*.12);x+=nx*off;z+=nz*off;let g=0;while(!inland(x,z,80)&&g++<30){x*=.96;z*=.96}pts.push([x,z])}
  pts.push([B.x,B.z]);L.push(pts)}
 return L})();
// cabeceiras da ponte (chão plano na altura do tabuleiro) — a ponte liga a pedreira à Ilha Zênite
const BRIDGE={z:-78+ZEN_DZ,x0:-238+ZEN_DX,x1:-372+ZEN_DX,y:6};
const BRIDGE_FLATS=[{id:'pontA',x0:-250+ZEN_DX,x1:-226+ZEN_DX,z0:-90+ZEN_DZ,z1:-66+ZEN_DZ,bl:16,hFix:6},{id:'pontB',x0:-384+ZEN_DX,x1:-360+ZEN_DX,z0:-90+ZEN_DZ,z1:-66+ZEN_DZ,bl:16,hFix:6}];
// ruas da ponte: Zênite -> ponte -> local mais perto na ilha principal
{const za=[-411+ZEN_DX,-85+ZEN_DZ],pb=[-372+ZEN_DX-12,-78+ZEN_DZ],pa=[-238+ZEN_DX+12,-78+ZEN_DZ];ROADLINES.push([za,[-398+ZEN_DX,-82+ZEN_DZ],pb]);
 const P_=TOWNS.filter(t=>t.tag!=='zn').map(t=>[(t.x0+t.x1)/2,(t.z0+t.z1)/2]).concat(SITES.map(S_=>[S_.x,S_.z]));let b=P_[0];for(const q of P_)if(Math.hypot(q[0]-pa[0],q[1]-pa[1])<Math.hypot(b[0]-pa[0],b[1]-pa[1]))b=q;
 ROADLINES.push([pa,[pa[0]+60,pa[1]],[(pa[0]+60+b[0])/2,(pa[1]+b[1])/2],b])}
// tudo que precisa de chão plano (o terreno lê esta lista)
// ARENAS = MAPAS SEPARADOS (cada um numa ilha própria, a 5 km da ilha principal, fora do alcance da vista e do mapa)
// Duelo = Pátio de Containers · Mata-mata em Equipe = Armazéns do Porto
const ARENAS={duel:{id:'arDuel',n:'Pátio de Containers',x:14000,z:0,hw:14,hd:34,RX:40,RZ:62,h:3},tdm:{id:'arTdm',n:'Armazéns do Porto',x:14000,z:3000,hw:62,hd:62,RX:86,RZ:86,h:3},train:{id:'arTrain',n:'Campo de Treino',x:14000,z:-3000,hw:40,hd:122,RX:66,RZ:150,h:3}};
const ARENA_FLATS=Object.values(ARENAS).map(a=>({id:a.id,x0:a.x-a.hw-4,x1:a.x+a.hw+4,z0:a.z-a.hd-4,z1:a.z+a.hd+4,bl:14,hFix:a.h,arena:1}));
const FLATS=TOWNS.concat(SITES,BRIDGE_FLATS);
// nomes no mapa grande (como no mapa antigo)
const MAPNAMES=TOWNS.map(t=>({n:t.n,x:t.x,z:t.z})).concat(SITES.map(t=>({n:t.n,x:t.x,z:t.z})));
// ---- pontos fixos do mapa ----
// heliportos (o terreno fica plano em volta deles); o do norte fica no meio do campo do estádio
// [nome, x, z, sem a marca H no chão]: no estádio fica só o helicóptero no meio do campo; a base militar tem heliponto
// [nome, x, z, sem a marca H, altura]: o ÚNICO helicóptero fica no topo do arranha-céu da Ilha Zênite
const TOWER={x:-490+ZEN_DX,z:-60+ZEN_DZ,w:26,h:78,y0:6};   // y0 = chão da Zênite (hFix)
const HPS=[['Torre Zênite',TOWER.x+4,TOWER.z,0,TOWER.y0+TOWER.h+.06]];
// o terreno (relevo, praia e mar) fica em world/terrain.js
// construções com modelo pronto (world/buildings.js): nenhuma — todas as construções têm porta e interior
const BLDS=[];
// prédios com interior (world/structures.js): dá para entrar e subir em todos os andares
// w,d = largura e fundo (m); floors = andares; roof:'gable' = telhado de telha; balcony = varandas
const STRS=[].concat(...TOWNS.map(T=>T.lots.filter(L=>L.S).map(L=>L.S)),SITE_STRS);

// ---- dados do mapa (vazios) que outros sistemas consultam ----
const CX=[],CZ=[],BP=42,LK=[];
// um único ponto de referência no centro (usado por modos, bots e telas). blank: sem cidade de verdade
const CITIES=[{n:'Centro',x:0,z:0,t:'center',blank:1}];
const nearestCity=(x,z)=>{for(const A of FLATS)if(A.n&&x>A.x0-10&&x<A.x1+10&&z>A.z0-10&&z<A.z1+10)return{n:A.n,x:A.x,z:A.z,t:'city',blank:1};return CITIES[0]};
const onRoad=(x,z)=>false;
const inFP=(x,z,m)=>FP.some(b=>x>b.x0-m&&x<b.x1+m&&z>b.z0-m&&z<b.z1+m);
function road(){}
