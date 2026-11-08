/* Deadzone · world/map.js
 * MAPA EM BRANCO: ilha pequena e plana (sem cidades, casas, estradas, árvores ou loot).
 * Base para construir o mapa do zero, peça por peça.
 *
 * Tamanho: MAPH é a metade do lado da área do mapa (MAPH=290 -> 580 x 580 m; a ilha é arredondada dentro dela).
 * Tudo que depende do tamanho do mapa (limites, zona, rota do avião, mapa grande) lê MAPH.
 */
const MAPH=290;          // metade do lado do mapa, em metros (a ilha tem forma orgânica dentro deste quadrado)
const PLV=30;            // velocidade do avião (m/s)
const PLT=(2*(MAPH+60))/PLV; // tempo até o avião atravessar o mapa (s)

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
  const w=wide?Math.min(lw-2,16+rnd()*4):Math.min(lw-1.25,11.1),d=Math.min(ld-6,8.5+rnd()*3.5);
  const S={id:T_+'c'+C.lots.length,w:+w.toFixed(1),d:+d.toFixed(1),floors,rot:rt,color:pal[Math.floor(rnd()*pal.length)],mg:b.id,city:1,style};
  if(style==='panel')S.color=[0xb9b6ae,0xa7a59e,0xc6c0b4][Math.floor(rnd()*3)];
  if(style==='shop')S.awn=[0x2f5d3a,0x7a2e2a,0x2b4a6b,0x6b5a2b][Math.floor(rnd()*4)];
  if(floors<=2&&style!=='shop'&&rnd()<.5)S.roof='gable';if(floors>=2&&style!=='panel'&&rnd()<.45)S.balcony=1;S.band=style!=='plaster'||rnd()<.5?1:0;
  S.x=+((L.x0+L.x1)/2).toFixed(2);S.z=+(rt?L.z0+4+d/2:L.z1-4-d/2).toFixed(2);L.kind='str';L.S=S};
 for(let i=0;i<C.XL.length-1;i++)for(let j=0;j<C.ZL.length-1;j++){
  if(cfg.stadium&&j===0&&(i===2||i===3))continue;  // estádio
  const b={x0:C.XL[i]+e,x1:C.XL[i+1]-e,z0:C.ZL[j]+e,z1:C.ZL[j+1]-e,id:T_+'q'+i+j};C.blocks.push(b);
  const mz=(b.z0+b.z1)/2,W=b.x1-b.x0,u=W/3;
  for(const [lz0,lz1,rt] of [[b.z0,mz,Math.PI],[mz,b.z1,0]]){
   // cada fileira: 3 lotes estreitos, ou 1 lote largo (casa com garagem / prédio largo) + 1 estreito
   const pr=rnd(),pat=pr<.42?[1,1,1]:pr<.71?[2,1]:[1,2];let x=b.x0;
   pat.forEach((n,k)=>{const L={x0:x,x1:x+u*n,z0:lz0,z1:lz1,rot:rt,blk:b.id,eL:k===0,eR:k===pat.length-1};x+=u*n;C.lots.push(L);
    const lw=L.x1-L.x0,ld=lz1-lz0;
    if(n===2&&rnd()<.7){ // casa com garagem aberta (com um buggy dentro)
     L.kind='home';const w=11,d=9,gw=5.2,gd=7,left=rnd()<.5;
     const S={id:T_+'c'+C.lots.length,w,d,floors:2,rot:rt,color:pal[Math.floor(rnd()*pal.length)],mg:b.id,city:1,style:rnd()<.6?'plaster':'brick',band:1};
     if(rnd()<.65)S.roof='gable';
     S.x=+(left?L.x0+2+w/2:L.x1-2-w/2).toFixed(2);S.z=+(rt?lz0+4.8+d/2:lz1-4.8-d/2).toFixed(2);L.S=S;
     L.G={x:+(left?L.x0+2+w+1.6+gw/2:L.x1-2-w-1.6-gw/2).toFixed(2),z:+(rt?lz0+3.2+gd/2:lz1-3.2-gd/2).toFixed(2),w:gw,d:gd,rot:rt};
    } else mkStr(L,b,lw,ld,rt,n===2);
   });
  }}
 C.rnd=rnd;return C}
// cidades (bem longe uma da outra): a grande no norte e duas vilas no sul
const CITY=genTown({n:'Porto Velho',tag:'pv',seed:7331,x0:-36,x1:176,z0:-196,z1:-8,XL:[-28,22,72,122,168],ZL:[-188,-128,-72,-16],stadium:1});
const TOWNS=[CITY,
 genTown({n:'Vila Serena',tag:'vs',seed:4242,x0:-218,x1:-102,z0:112,z1:188,XL:[-210,-160,-110],ZL:[120,180],bl:20}),
 genTown({n:'Monte Verde',tag:'mv',seed:9119,x0:133,x1:207,z0:143,z1:217,XL:[145,195],ZL:[155,205],bl:20})];
// LOCAIS ESPECIAIS (world/city.js monta): base militar, escola, porto e galpões
const SITES=[
 {id:'base',t:'military',n:'Base Sentinela',x0:-148,x1:-22,z0:15,z1:108,bl:22},
 {id:'escola',t:'school',n:'Escola Estadual',x0:-18,x1:48,z0:100,z1:150,bl:18},
 {id:'cais',t:'port',n:'Cais do Sul',x0:20,x1:110,z0:192,z1:222,bl:10},
 {id:'galpoes',t:'depot',n:'Galpões do Oeste',x0:-215,x1:-150,z0:-15,z1:30,bl:18},
 {id:'posto',t:'gas',n:'Posto Rota 1',x0:27,x1:47,z0:36,z1:58,bl:10},
 {id:'fazenda',t:'farm',n:'Fazenda Boa Vista',x0:55,x1:108,z0:8,z1:50,bl:18}];
for(const S_ of SITES){S_.x=(S_.x0+S_.x1)/2;S_.z=(S_.z0+S_.z1)/2}
// prédios com interior dos locais (entram na lista STRS: dá para entrar, subir, pular janela...)
const SITE_STRS=[
 {id:'base_aloj1',x:-100,z:75,w:16,d:9,floors:2,rot:0,style:'panel',color:0x8f9479,band:1,mg:'base',city:1},
 {id:'base_aloj2',x:-100,z:52,w:16,d:9,floors:2,rot:0,style:'panel',color:0x8f9479,band:1,mg:'base',city:1},
 {id:'base_aloj3',x:-75,z:96,w:14,d:9,floors:1,rot:Math.PI,style:'panel',color:0x7f8a6a,band:1,mg:'base',city:1},
 {id:'posto_loja',x:42,z:52,w:10,d:7,floors:1,rot:-Math.PI/2,style:'shop',color:0xe6e1d6,awn:0xc0302a,mg:'posto',city:1},
 {id:'faz_casa',x:96,z:18,w:11,d:9,floors:2,rot:-Math.PI/2,style:'plaster',color:0xe9e0c6,roof:'gable',band:1,balcony:1,mg:'fazenda',city:1},
 {id:'base_cmd',x:-58,z:30,w:12,d:9,floors:3,rot:Math.PI,style:'brick',band:1,mg:'base',city:1},
 {id:'escola1',x:15,z:111.5,w:24,d:11,floors:2,rot:Math.PI,style:'plaster',color:0xe8dcb8,band:1,balcony:1,mg:'escola',city:1},
 {id:'escola2',x:-5,z:139,w:12,d:9,floors:1,rot:0,style:'plaster',color:0xe8dcb8,band:1,mg:'escola',city:1},
 {id:'cais_cap',x:30,z:203,w:11,d:9,floors:2,rot:0,style:'plaster',color:0x9fb6c4,band:1,balcony:1,mg:'cais',city:1}];
// ESTRADAS ligando cidades e locais (curvas suaves passando por estes pontos; o terreno fica plano embaixo)
const ROADLINES=[
 [[22,-12],[22,18],[16,55],[15,99]],                               // Porto Velho -> escola
 [[22,10],[-20,6],[-80,8],[-148,7]],                               // -> base militar -> galpões
 [[-80,8],[-80,15]],                                               // portão da base
 [[-182,31],[-182,62],[-162,96],[-160,116]],                       // galpões -> Vila Serena
 [[-106,180],[-50,184],[15,187],[64,191]],                         // Vila Serena -> porto
 [[111,206],[141,205]],                                            // porto -> Monte Verde
 [[145,151],[152,105],[172,45],[168,-12]],                         // Monte Verde -> Porto Velho
 [[22,26],[40,30],[55,30]]];                                       // -> fazenda
// tudo que precisa de chão plano (o terreno lê esta lista)
const FLATS=TOWNS.concat(SITES);
// nomes no mapa grande (como no mapa antigo)
const MAPNAMES=TOWNS.map(t=>({n:t.n,x:t.x,z:t.z})).concat(SITES.map(t=>({n:t.n,x:t.x,z:t.z})));
// ---- pontos fixos do mapa ----
// heliportos (o terreno fica plano em volta deles); o do norte fica no meio do campo do estádio
// [nome, x, z, sem a marca H no chão]: no estádio fica só o helicóptero no meio do campo; a base militar tem heliponto
const HPS=[['Estádio',(CITY.stadium.x0+CITY.stadium.x1)/2,(CITY.stadium.z0+CITY.stadium.z1)/2,1],['Base Sentinela',-48,88]];
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
const nearestCity=(x,z)=>{for(const A of FLATS)if(x>A.x0-10&&x<A.x1+10&&z>A.z0-10&&z<A.z1+10)return{n:A.n,x:A.x,z:A.z,t:'city',blank:1};return CITIES[0]};
const onRoad=(x,z)=>false;
const inFP=(x,z,m)=>FP.some(b=>x>b.x0-m&&x<b.x1+m&&z>b.z0-m&&z<b.z1+m);
function road(){}
