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
// ruas de asfalto em grade, calçadas, quarteirões com lotes. Cada lote tem: prédio com interior (STRS),
// construção de modelo pronto (BLDS), ou praça com muretas. Quem monta a cidade é world/city.js.
const CITY=(function(){
 let sd=7331;const rnd=()=>{sd=(sd*16807)%2147483647;return (sd-1)/2147483646};
 const C={n:'Porto Velho',x0:-36,x1:176,z0:-196,z1:-64,RW:8,SW:2.5,XL:[-28,22,72,122,168],ZL:[-188,-128,-72],blocks:[],lots:[]};
 C.x=(C.x0+C.x1)/2;C.z=(C.z0+C.z1)/2;
 const pal=[0xd8cfc0,0xc7b7a3,0xc9b79c,0xb7c0b8,0xe2d6b8,0xd1c4b4,0xbfae96,0xd9c7a8,0xa9b4b8,0xcfc1ad,0xe0d0c0,0xb8a48c,0xc4a88a,0x9fa8a3];
 const MODS=['apartment','tower','store','townhouse','office','house','police'];let mi=0;
 for(let i=0;i<C.XL.length-1;i++)for(let j=0;j<C.ZL.length-1;j++){
  const e=C.RW/2+C.SW,b={x0:C.XL[i]+e,x1:C.XL[i+1]-e,z0:C.ZL[j]+e,z1:C.ZL[j+1]-e,id:'q'+i+j};C.blocks.push(b);
  if(i===2&&j===0){b.heli=1;continue}           // quarteirão do heliponto
  const mx=(b.x0+b.x1)/2,mz=(b.z0+b.z1)/2;
  for(const [lx0,lx1] of [[b.x0,mx],[mx,b.x1]])for(const [lz0,lz1,rt] of [[b.z0,mz,Math.PI],[mz,b.z1,0]]){
   const L={x0:lx0,x1:lx1,z0:lz0,z1:lz1,rot:rt,blk:b.id};C.lots.push(L);
   const r=rnd(),lw=lx1-lx0,ld=lz1-lz0;
   if(r<.06)L.kind='plaza';
   else if(r<.27){L.kind='model';L.model=MODS[mi++%MODS.length]}
   else{L.kind='str';const f=rnd(),floors=f<.12?1:f<.5?2:f<.78?3:4;
    const w=Math.min(lw-3,11+rnd()*2.5),d=Math.min(ld-7,8+rnd()*2.5);
    const S={id:'c'+C.lots.length,w:+w.toFixed(1),d:+d.toFixed(1),floors,rot:rt,color:pal[Math.floor(rnd()*pal.length)],mg:b.id,city:1};
    if(floors<=2&&rnd()<.55)S.roof='gable';if(floors>=2&&rnd()<.45)S.balcony=1;
    S.x=+((lx0+lx1)/2).toFixed(2);S.z=+(rt?lz0+4.8+d/2:lz1-4.8-d/2).toFixed(2);L.S=S}
  }}
 C.rnd=rnd;return C})();
// ---- pontos fixos do mapa ----
// heliportos (o terreno fica plano em volta deles); o do norte fica no quarteirão do heliponto da cidade
const HPS=[['Heliponto Norte',97,-158],['Heliponto Sul',-MAPH*.45,MAPH*.5]];
// o terreno (relevo, praia e mar) fica em world/terrain.js
// construções com modelo pronto (world/buildings.js): lotes "model" da cidade
const BLDS=CITY.lots.filter(L=>L.kind==='model').map((L,i)=>({id:'m'+i,model:L.model,x:(L.x0+L.x1)/2,z:(L.z0+L.z1)/2,rot:L.rot,city:1,lot:L}));
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
