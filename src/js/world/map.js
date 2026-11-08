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

// ---- pontos fixos do mapa ----
// heliportos (o terreno fica plano em volta deles)
const HPS=[['Heliponto Norte',MAPH*.45,-MAPH*.5],['Heliponto Sul',-MAPH*.45,MAPH*.5]];
// o terreno (relevo, praia e mar) fica em world/terrain.js
// construções com modelo pronto (world/buildings.js) — nenhuma por enquanto
const BLDS=[];
// prédios com interior (world/structures.js): dá para entrar e subir em todos os andares e no terraço
// w,d = largura e fundo (m); floors = andares; rot: só múltiplos de 90°
const STRS=[
 // roof:'gable' = sobrado com telhado de telha; balcony = varandas na frente (dá para sair nelas)
 {id:'predio1',x:20,z:-150,w:12,d:10,floors:3,rot:0,color:0xd8cfc0},
 {id:'predio2',x:50,z:-162,w:13,d:10,floors:4,rot:-Math.PI/2,color:0xc7b7a3,balcony:1},
 {id:'casa1',x:44,z:-128,w:11,d:9,floors:2,rot:-Math.PI/2,color:0xc9b79c,roof:'gable'},
 {id:'casa2',x:-4,z:-126,w:11,d:9,floors:2,rot:Math.PI/2,color:0xb7c0b8,roof:'gable'},
 {id:'casa3',x:20,z:-116,w:11,d:9,floors:2,rot:Math.PI,color:0xe2d6b8,balcony:1},
 {id:'casa4',x:-10,z:-158,w:11,d:9,floors:2,rot:Math.PI/2,color:0xd1c4b4,roof:'gable'}];

// ---- dados do mapa (vazios) que outros sistemas consultam ----
const CX=[],CZ=[],BP=42,LK=[];
// um único ponto de referência no centro (usado por modos, bots e telas). blank: sem cidade de verdade
const CITIES=[{n:'Centro',x:0,z:0,t:'center',blank:1}];
const nearestCity=(x,z)=>CITIES[0];
const onRoad=(x,z)=>false;
const inFP=(x,z,m)=>FP.some(b=>x>b.x0-m&&x<b.x1+m&&z>b.z0-m&&z<b.z1+m);
function road(){}
