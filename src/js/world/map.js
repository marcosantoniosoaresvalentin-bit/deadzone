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

// ---- chão: grama + faixa de areia + mar em volta ----
{const S=MAPH*2;
 const gm=window.DZR?DZR.groundMat():new T.MeshStandardMaterial({color:lin(0x5a8a3a),roughness:1});
 if(gm.map)gm.map.repeat.set(S/10,S/10);
 const gr=new T.Mesh(new T.PlaneGeometry(S,S),gm);gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;gr.renderOrder=-2;sc.add(gr);
 const sand=new T.Mesh(new T.PlaneGeometry(S+60,S+60),MT(0xd8c89a,null,1));sand.rotation.x=-Math.PI/2;sand.position.y=-.06;sand.receiveShadow=true;sc.add(sand);
 const wm=new T.MeshStandardMaterial({color:lin(0x2f6f9a),metalness:.5,roughness:.12,transparent:true,opacity:.92});if(window.DZR)DZR.waterMat(wm);
 const sea=new T.Mesh(new T.PlaneGeometry(6000,6000),wm);sea.rotation.x=-Math.PI/2;sea.position.y=-.5;sc.add(sea)}

// ---- dados do mapa (vazios) que outros sistemas consultam ----
const CX=[],CZ=[],BP=42,LK=[];
// um único ponto de referência no centro (usado por modos, bots e telas). blank: sem cidade de verdade
const CITIES=[{n:'Centro',x:0,z:0,t:'center',blank:1}];
const nearestCity=(x,z)=>CITIES[0];
const onRoad=(x,z)=>false;
const inFP=(x,z,m)=>FP.some(b=>x>b.x0-m&&x<b.x1+m&&z>b.z0-m&&z<b.z1+m);
function road(){}
