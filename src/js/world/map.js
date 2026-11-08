/* Deadzone · world/map.js
 * MAPA EM BRANCO: ilha pequena e plana (sem cidades, casas, estradas, árvores ou loot).
 * Base para construir o mapa do zero, peça por peça.
 *
 * Tamanho: MAPH é a metade do lado (MAPH=250 -> ilha de 500 x 500 m).
 * Tudo que depende do tamanho do mapa (limites, zona, rota do avião, mapa grande) lê MAPH.
 */
const MAPH=250;          // metade do lado do mapa, em metros
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
const CITY=(function(){
 let sd=7331;const rnd=()=>{sd=(sd*16807)%2147483647;return (sd-1)/2147483646};
 const C={n:'Porto Velho',x0:-36,x1:176,z0:-196,z1:-8,RW:8,SW:2.5,XL:[-28,22,72,122,168],ZL:[-188,-128,-72,-16],blocks:[],lots:[],skipV:{'3_0':1}};
 C.x=(C.x0+C.x1)/2;C.z=(C.z0+C.z1)/2;
 const pal=[0xd8cfc0,0xc7b7a3,0xc9b79c,0xb7c0b8,0xe2d6b8,0xd1c4b4,0xbfae96,0xd9c7a8,0xa9b4b8,0xcfc1ad,0xe0d0c0,0xb8a48c,0xc4a88a,0x9fa8a3];
 const e=C.RW/2+C.SW;
 // estádio: junta os quarteirões (2,0) e (3,0) (a rua entre eles some)
 C.stadium={x0:C.XL[2]+e,x1:C.XL[4]-e,z0:C.ZL[0]+e,z1:C.ZL[1]-e};
 C.blocks.push(Object.assign({id:'stad',stadium:1},C.stadium));
 const mkStr=(L,b,lw,ld,rt,wide)=>{
  const sr=rnd(),style=sr<.4?'plaster':sr<.66?'brick':sr<.84?'shop':'panel';
  const f=rnd();let floors=f<.1?1:f<.45?2:f<.75?3:4;if(style==='shop')floors=Math.max(2,Math.min(3,floors));if(style==='panel')floors=Math.max(3,floors);
  const w=wide?Math.min(lw-2,16+rnd()*4):Math.min(lw-1.25,11.1),d=Math.min(ld-6,8.5+rnd()*3.5);
  const S={id:'c'+C.lots.length,w:+w.toFixed(1),d:+d.toFixed(1),floors,rot:rt,color:pal[Math.floor(rnd()*pal.length)],mg:b.id,city:1,style};
  if(style==='panel')S.color=[0xb9b6ae,0xa7a59e,0xc6c0b4][Math.floor(rnd()*3)];
  if(style==='shop')S.awn=[0x2f5d3a,0x7a2e2a,0x2b4a6b,0x6b5a2b][Math.floor(rnd()*4)];
  if(floors<=2&&style!=='shop'&&rnd()<.5)S.roof='gable';if(floors>=2&&style!=='panel'&&rnd()<.45)S.balcony=1;S.band=style!=='plaster'||rnd()<.5?1:0;
  S.x=+((L.x0+L.x1)/2).toFixed(2);S.z=+(rt?L.z0+4+d/2:L.z1-4-d/2).toFixed(2);L.kind='str';L.S=S};
 for(let i=0;i<C.XL.length-1;i++)for(let j=0;j<C.ZL.length-1;j++){
  if(j===0&&(i===2||i===3))continue;               // estádio
  const b={x0:C.XL[i]+e,x1:C.XL[i+1]-e,z0:C.ZL[j]+e,z1:C.ZL[j+1]-e,id:'q'+i+j};C.blocks.push(b);
  const mz=(b.z0+b.z1)/2,W=b.x1-b.x0,u=W/3;
  for(const [lz0,lz1,rt] of [[b.z0,mz,Math.PI],[mz,b.z1,0]]){
   // cada fileira: 3 lotes estreitos, ou 1 lote largo (casa com garagem / prédio largo) + 1 estreito
   const pr=rnd(),pat=pr<.42?[1,1,1]:pr<.71?[2,1]:[1,2];let x=b.x0;
   pat.forEach((n,k)=>{const L={x0:x,x1:x+u*n,z0:lz0,z1:lz1,rot:rt,blk:b.id,eL:k===0,eR:k===pat.length-1};x+=u*n;C.lots.push(L);
    const lw=L.x1-L.x0,ld=lz1-lz0;
    if(n===2&&rnd()<.7){ // casa com garagem aberta (com um buggy dentro)
     L.kind='home';const w=11,d=9,gw=5.2,gd=7,left=rnd()<.5;
     const S={id:'c'+C.lots.length,w,d,floors:2,rot:rt,color:pal[Math.floor(rnd()*pal.length)],mg:b.id,city:1,style:rnd()<.6?'plaster':'brick',band:1};
     if(rnd()<.65)S.roof='gable';
     S.x=+(left?L.x0+2+w/2:L.x1-2-w/2).toFixed(2);S.z=+(rt?lz0+4.8+d/2:lz1-4.8-d/2).toFixed(2);L.S=S;
     L.G={x:+(left?L.x0+2+w+1.6+gw/2:L.x1-2-w-1.6-gw/2).toFixed(2),z:+(rt?lz0+3.2+gd/2:lz1-3.2-gd/2).toFixed(2),w:gw,d:gd,rot:rt};
    } else mkStr(L,b,lw,ld,rt,n===2);
   });
  }}
 C.rnd=rnd;return C})();
// ---- pontos fixos do mapa ----
// heliportos (o terreno fica plano em volta deles); o do norte fica no meio do campo do estádio
const HPS=[['Heliponto Norte',(CITY.stadium.x0+CITY.stadium.x1)/2,(CITY.stadium.z0+CITY.stadium.z1)/2],['Heliponto Sul',-MAPH*.45,MAPH*.5]];
// o terreno (relevo, praia e mar) fica em world/terrain.js
// construções com modelo pronto (world/buildings.js): nenhuma — todas as construções têm porta e interior
const BLDS=[];
// prédios com interior (world/structures.js): dá para entrar e subir em todos os andares
// w,d = largura e fundo (m); floors = andares; roof:'gable' = telhado de telha; balcony = varandas
const STRS=CITY.lots.filter(L=>L.S).map(L=>L.S);

// ---- dados do mapa (vazios) que outros sistemas consultam ----
const CX=[],CZ=[],BP=42,LK=[];
// um único ponto de referência no centro (usado por modos, bots e telas). blank: sem cidade de verdade
const CITIES=[{n:'Centro',x:0,z:0,t:'center',blank:1}];
const nearestCity=(x,z)=>(x>CITY.x0&&x<CITY.x1&&z>CITY.z0&&z<CITY.z1)?{n:CITY.n,x:CITY.x,z:CITY.z,t:'city',blank:1}:CITIES[0];
const onRoad=(x,z)=>false;
const inFP=(x,z,m)=>FP.some(b=>x>b.x0-m&&x<b.x1+m&&z>b.z0-m&&z<b.z1+m);
function road(){}
