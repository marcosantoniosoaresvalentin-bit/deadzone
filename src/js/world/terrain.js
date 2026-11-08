/* Deadzone · world/terrain.js
 * TERRENO da ilha: relevo (montanha, morros, vales), litoral irregular com praia,
 * fundo do mar e mistura de solos (grama, terra, rocha e areia).
 *
 * - TERH(x,z): altura do chão em qualquer ponto (igual à malha desenhada).
 * - TERG(x,z): quanto de grama há no ponto (0..1), usado pela grama alta perto do jogador.
 * - TERMAP: imagem do terreno vista de cima, usada no minimapa e no mapa grande.
 * Nível do mar = 0 m.
 */
const TER=(()=>{
 const S=4, EXT=MAPH+150, N=Math.round(EXT*2/S)+1, O=-EXT;          // grade de 4 m
 const idx=(i,j)=>j*N+i;
 // ---------- ruído suave ----------
 const hh=(x,z)=>{const v=Math.sin(x*127.1+z*311.7)*43758.5453;return v-Math.floor(v)};
 const vn=(x,z)=>{const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=xf*xf*(3-2*xf),w=zf*zf*(3-2*zf);return(hh(xi,zi)*(1-u)+hh(xi+1,zi)*u)*(1-w)+(hh(xi,zi+1)*(1-u)+hh(xi+1,zi+1)*u)*w};
 const fbm=(x,z)=>vn(x,z)*.5+vn(x*2.03+5.2,z*2.03+1.3)*.27+vn(x*4.1+9.1,z*4.1+3.7)*.15+vn(x*8.3+2.7,z*8.3+8.1)*.08;
 const ridge=(x,z)=>{const r=1-Math.abs(fbm(x,z)*2-1);return r*r};
 const ss=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t)};
 const gau=(x,z,cx,cz,r)=>Math.exp(-((x-cx)**2+(z-cz)**2)/(r*r));

 // ---------- litoral: quadrado arredondado com recortes (baías e pontas) ----------
 function coastDist(x,z){
  const p=8,d=Math.pow(Math.pow(Math.abs(x),p)+Math.pow(Math.abs(z),p),1/p),a=Math.atan2(z,x);
  const cn=fbm(Math.cos(a)*2.2+7,Math.sin(a)*2.2+3)*.75+fbm(Math.cos(a)*6+1,Math.sin(a)*6+9)*.25;
  const R=MAPH+6-cn*34;                 // raio do litoral varia ~34 m (baías)
  return R-d;                           // >0 dentro da ilha (m até a costa)
 }
 // ---------- relevo em terra ----------
 const M=MAPH/250;                     // escala (posições pensadas para MAPH=250)
 function landH(x,z){
  let h=1.6+Math.pow(fbm(x/150+3.1,z/150+7.7),1.4)*9+(fbm(x/42,z/42)-.5)*2.4;
  // montanha a noroeste com cristas rochosas
  const mt=gau(x,z,-135*M,-115*M,72*M);h+=mt*(30+ridge(x/38+4,z/38+2)*14);
  // morros
  h+=gau(x,z,125*M,95*M,58*M)*(16+ridge(x/30,z/30)*5);
  h+=gau(x,z,-70*M,150*M,46*M)*12;
  h+=gau(x,z,40*M,-40*M,50*M)*6;
  h+=gau(x,z,175*M,-20*M,40*M)*9;
  // vale raso cruzando a ilha (lugar natural para uma estrada no futuro)
  const vy=z-(x*.35+20*M)+Math.sin(x/60)*18*M;h-=gau(0,vy,0,0,22*M)*3.2*(1-mt);
  return h;
 }
 function rawH(x,z){
  const t=coastDist(x,z);
  if(t<=0)return Math.max(-14,.35+t*.09-Math.max(0,-t-30)*.05);           // fundo do mar (segue o litoral)
  const beach=.35+Math.min(t,22)*.085;                                    // praia sobe devagar
  const k=ss(12,48,t);return beach+Math.max(0,landH(x,z)-beach)*k;
 }
 // ---------- grade de alturas ----------
 const H=new Float32Array(N*N);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++)H[idx(i,j)]=rawH(O+i*S,O+j*S);
 // heliportos: área plana com borda suave
 for(const hp of (typeof HPS!=='undefined'?HPS:[])){const cx=hp[1],cz=hp[2],h0=rawH(cx,cz);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=O+i*S,z=O+j*S,d=Math.hypot(x-cx,z-cz);if(d>34)continue;const k=1-ss(13,32,d);H[idx(i,j)]=H[idx(i,j)]*(1-k)+h0*k}}
 // construções: terreno plano embaixo (e borda suave em volta)
 for(const b of (typeof BLDS!=='undefined'?BLDS:[])){if(b.city)continue;const cx=b.x,cz=b.z,h0=rawH(cx,cz),r0=b.flat||12,r1=r0+14;
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=O+i*S,z=O+j*S,d=Math.hypot(x-cx,z-cz);if(d>r1)continue;const k=1-ss(r0,r1,d);H[idx(i,j)]=H[idx(i,j)]*(1-k)+h0*k}}
 // prédios com interior: retângulo plano (com folga) e borda suave
 for(const b of (typeof STRS!=='undefined'?STRS:[])){if(b.city)continue;const cx=b.x,cz=b.z,h0=rawH(cx,cz),hw=Math.max(b.w,b.d)/2+3;
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=O+i*S,z=O+j*S,d=Math.max(0,Math.max(Math.abs(x-cx),Math.abs(z-cz))-hw);if(d>14)continue;const k=1-ss(0,14,d);H[idx(i,j)]=H[idx(i,j)]*(1-k)+h0*k}}
 // cidades e locais especiais: cada um vira um platô (nível médio do lugar) com borda suave
 for(const A of (typeof FLATS!=='undefined'?FLATS:[])){let sm=0,n=0;for(let x=A.x0;x<=A.x1;x+=6)for(let z=A.z0;z<=A.z1;z+=6){sm+=rawH(x,z);n++}const h0=A.h=Math.max(1.6,sm/n),bl=A.bl||30;
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=O+i*S,z=O+j*S,d=Math.hypot(Math.max(0,A.x0-x,x-A.x1),Math.max(0,A.z0-z,z-A.z1));if(d>bl)continue;const k=1-ss(0,bl,d);H[idx(i,j)]=H[idx(i,j)]*(1-k)+h0*k}}
 // mesma triangulação do PlaneGeometry: altura idêntica à malha
 function terh(x,z){
  const fx=(x-O)/S,fz=(z-O)/S;if(fx<0||fz<0||fx>=N-1||fz>=N-1)return -14;
  const i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j,a=H[idx(i,j)],b=H[idx(i,j+1)],c=H[idx(i+1,j+1)],d=H[idx(i+1,j)];
  return u+v<=1?a+(d-a)*u+(b-a)*v:c+(b-c)*(1-u)+(d-c)*(1-v);
 }
 // ---------- malha ----------
 const g=new T.PlaneGeometry(EXT*2,EXT*2,N-1,N-1),P=g.attributes.position;
 for(let k=0;k<P.count;k++)P.setZ(k,H[k]);
 g.rotateX(-Math.PI/2);g.computeVertexNormals();
 // ---------- mistura de solos por vértice: grama, terra, rocha, areia ----------
 const NR=g.attributes.normal,SPL=new Float32Array(P.count*4),GW=new Float32Array(P.count);
 for(let k=0;k<P.count;k++){
  const x=P.getX(k),y=P.getY(k),z=P.getZ(k),sl=1-NR.getY(k);
  let rock=ss(.07,.17,sl)+ss(30,40,y)*.6;
  const mt=gau(x,z,-135*M,-115*M,72*M);rock+=mt*ss(.55,.75,ridge(x/38+4,z/38+2))*.8;
  let sand=1-ss(1.1,2.1,y);
  let dirt=ss(.55,.72,fbm(x/55+20,z/55+5))*.85+ss(.035,.07,sl)*.35+ss(2.4,3.2,y)*(1-ss(3.2,5,y))*.35;
  rock=Math.min(1,rock);sand=Math.min(1,sand);dirt=Math.min(1,dirt)*(1-rock)*(1-sand);rock*=(1-sand);
  let grass=Math.max(0,1-rock-sand-dirt);const t=grass+dirt+rock+sand||1;
  SPL[k*4]=grass/t;SPL[k*4+1]=dirt/t;SPL[k*4+2]=rock/t;SPL[k*4+3]=sand/t;GW[k]=grass/t;
 }
 g.setAttribute('spl',new T.BufferAttribute(SPL,4));g.computeBoundingSphere();
 function terg(x,z){const i=Math.round((x-O)/S),j=Math.round((z-O)/S);if(i<0||j<0||i>=N||j>=N)return 0;return GW[idx(i,j)]}
 return {H,N,S,O,EXT,g,SPL,terh,terg,fbm};
})();
window.TERH=TER.terh;window.TERG=TER.terg;

// ---------- texturas dos solos (procedurais, repetem sem emenda) ----------
{const tex=(w,h,seed,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;let s=seed;const r=()=>(s=(s*16807)%2147483647)/2147483647;fn(c.getContext('2d'),w,h,r);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t};
 const blot=(g,w,h,r,n,rad,cols)=>{for(let i=0;i<n;i++){const x=r()*w,y=r()*h,rd=rad[0]+r()*(rad[1]-rad[0]),c=cols[(r()*cols.length)|0];for(const ox of[-w,0,w])for(const oy of[-h,0,h]){const gg=g.createRadialGradient(x+ox,y+oy,0,x+ox,y+oy,rd);gg.addColorStop(0,c);gg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gg;g.fillRect(x+ox-rd,y+oy-rd,rd*2,rd*2)}}};
 const speck=(g,w,h,r,n,a)=>{for(let i=0;i<n;i++){g.fillStyle='rgba('+(r()<.5?'0,0,0':'255,255,255')+','+(r()*a).toFixed(3)+')';g.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}};
 // terra: marrom com pedrinhas e raízes secas
 const dirtT=tex(512,512,11,(g,w,h,r)=>{g.fillStyle='#6e5338';g.fillRect(0,0,w,h);blot(g,w,h,r,90,[20,70],['rgba(90,66,42,.5)','rgba(120,92,60,.45)','rgba(70,52,34,.45)']);
  for(let i=0;i<500;i++){const x=r()*w,y=r()*h,s=1+r()*4;g.fillStyle='hsl('+(25+r()*15)+','+(8+r()*12)+'%,'+(30+r()*35)+'%)';g.beginPath();g.ellipse(x,y,s,s*(.6+r()*.4),r()*3,0,7);g.fill()}
  speck(g,w,h,r,16000,.14)});
 // rocha: cinza com veios, fraturas e manchas de líquen
 const rockT=tex(512,512,23,(g,w,h,r)=>{g.fillStyle='#7d7a74';g.fillRect(0,0,w,h);blot(g,w,h,r,120,[25,90],['rgba(60,58,55,.35)','rgba(160,156,148,.3)','rgba(105,100,92,.35)']);
  blot(g,w,h,r,25,[10,30],['rgba(120,130,70,.25)','rgba(150,150,110,.2)']);
  g.strokeStyle='rgba(30,28,26,.45)';for(let i=0;i<40;i++){g.lineWidth=.8+r()*2;g.beginPath();let x=r()*w,y=r()*h;g.moveTo(x,y);for(let k=0;k<6;k++){x+=(r()-.5)*70;y+=(r()-.3)*40;g.lineTo(x,y)}g.stroke()}
  speck(g,w,h,r,20000,.16)});
 // areia: clara com ondulações do vento e conchinhas
 const sandT=tex(512,512,37,(g,w,h,r)=>{g.fillStyle='#d6c49a';g.fillRect(0,0,w,h);blot(g,w,h,r,70,[30,90],['rgba(230,215,175,.45)','rgba(190,170,125,.35)']);
  g.strokeStyle='rgba(150,130,95,.18)';g.lineWidth=2;for(let y=0;y<h;y+=9){g.beginPath();for(let x=0;x<=w;x+=8){const yy=y+Math.sin(x/w*6.283*3+y*.3)*3;x?g.lineTo(x,yy):g.moveTo(x,yy)}g.stroke()}
  speck(g,w,h,r,22000,.13)});
 const grT=new T.TextureLoader().load('assets/textures/grass.jpg');grT.wrapS=grT.wrapT=T.RepeatWrapping;grT.encoding=T.sRGBEncoding;grT.anisotropy=8;
 // material: mistura os 4 solos pelo peso de cada vértice, com textura em coordenadas do mundo
 const m=new T.MeshStandardMaterial({map:grT,roughness:.97,metalness:0});
 m.onBeforeCompile=s=>{
  s.uniforms.tDirt={value:dirtT};s.uniforms.tRock={value:rockT};s.uniforms.tSand={value:sandT};
  s.vertexShader='attribute vec4 spl;varying vec4 vSpl;varying vec3 vWP;varying vec3 vWN;\n'+s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvSpl=spl;vWP=(modelMatrix*vec4(transformed,1.)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
  s.fragmentShader='uniform sampler2D tDirt;uniform sampler2D tRock;uniform sampler2D tSand;varying vec4 vSpl;varying vec3 vWP;varying vec3 vWN;\n'+s.fragmentShader.replace('#include <map_fragment>',`
   vec2 wp=vWP.xz;
   float mn=sin(wp.x*.021+sin(wp.y*.017)*1.7)*.5+sin(wp.y*.026+sin(wp.x*.013)*2.)*.5;
   vec3 g1=texture2D(map,wp*.10).rgb,g2=texture2D(map,wp*.031+vec2(.37,.11)).rgb;
   vec3 grass=mix(g1,g2,.5+.25*mn)*mix(vec3(.98,.92,.7),vec3(.72,.84,.66),.5+.5*mn);float gLum=dot(grass,vec3(.33));grass=mix(vec3(gLum),grass,.82);
   vec3 dirt=mix(texture2D(tDirt,wp*.11).rgb,texture2D(tDirt,wp*.037+.3).rgb,.4);
   vec3 sand=mix(texture2D(tSand,wp*.09).rgb,texture2D(tSand,wp*.029+.6).rgb,.35)*.86;
   vec3 an=abs(vWN);an/=(an.x+an.y+an.z);
   vec3 rock=texture2D(tRock,vWP.zy*.06).rgb*an.x+texture2D(tRock,vWP.xy*.06).rgb*an.z+texture2D(tRock,wp*.06).rgb*an.y;
   // bordas irregulares entre solos (a textura da terra serve de ruído)
   float nz=texture2D(tDirt,wp*.017).r-.4;
   vec4 w=vSpl;w.y=clamp(w.y+nz*.6*w.y*(1.-w.y)*4.,0.,1.);w.z=clamp(w.z+nz*.5*w.z*(1.-w.z)*4.,0.,1.);w/=max(.001,w.x+w.y+w.z+w.w);
   float wet=1.-smoothstep(.15,.9,vWP.y);sand*=mix(1.,.62,wet);
   vec3 col=grass*w.x+dirt*w.y+rock*w.z+sand*w.w;
   col=mix(col,col*vec3(.55,.7,.72),1.-smoothstep(-2.5,0.,vWP.y));   // fundo do mar mais escuro
   col=mix(col,vec3(.051,.208,.314),smoothstep(-1.5,-11.,vWP.y));   // e vai sumindo no azul do mar fundo
   col=mix(col,vec3(.93,.95,.95),.45*smoothstep(.22,.02,abs(vWP.y-.12)));    // espuma na beira
   vec4 texelColor=mapTexelToLinear(vec4(col,1.));diffuseColor*=texelColor;`);
 };
 const gr=new T.Mesh(TER.g,m);gr.receiveShadow=true;gr.renderOrder=-2;sc.add(gr);
 // mar no nível 0
 const wm=new T.MeshStandardMaterial({color:lin(0x2f6f9a),metalness:.5,roughness:.12,transparent:true,opacity:.86});if(window.DZR)DZR.waterMat(wm);wm.opacity=.82;
 const sea=new T.Mesh(new T.PlaneGeometry(6000,6000),wm);sea.rotation.x=-Math.PI/2;sea.position.y=0;sc.add(sea);
 // fundo do mar escuro além do terreno (senão aparece um "quadrado" claro em volta da ilha, visto do alto)
 const deep=new T.Mesh(new T.PlaneGeometry(6000,6000),new T.MeshStandardMaterial({color:lin(0x0d3550),roughness:.97,metalness:0}));deep.rotation.x=-Math.PI/2;deep.position.y=-14.05;deep.renderOrder=-3;sc.add(deep)}

// ---------- imagem do terreno vista de cima (minimapa e mapa grande) ----------
const TERMAP=(()=>{const W=1024,E=MAPH+30,c=document.createElement('canvas');c.width=c.height=W;const g=c.getContext('2d'),im=g.createImageData(W,W),d=im.data;
 const col=[[78,118,52],[118,92,62],[128,124,116],[214,198,156]];
 for(let py=0;py<W;py++)for(let px=0;px<W;px++){const x=-E+(px+.5)/W*2*E,z=-E+(py+.5)/W*2*E,h=TERH(x,z),o=(py*W+px)*4;
  if(h<0){const k=Math.max(0,Math.min(1,-h/3.5));d[o]=58-28*k;d[o+1]=128-50*k;d[o+2]=170-40*k;d[o+3]=255;continue}
  const i=Math.round((x-TER.O)/TER.S),j=Math.round((z-TER.O)/TER.S),q=(j*TER.N+i)*4,w=TER.SPL;
  let r=0,gg=0,b=0;for(let s=0;s<4;s++){r+=col[s][0]*w[q+s];gg+=col[s][1]*w[q+s];b+=col[s][2]*w[q+s]}
  // sombreamento do relevo (luz vinda do noroeste) e leve clareamento com a altura
  const sh=Math.max(.55,Math.min(1.35,1+(TERH(x-3,z-3)-TERH(x+3,z+3))*.09)),ah=1+Math.min(h,40)*.004;
  d[o]=Math.min(255,r*sh*ah);d[o+1]=Math.min(255,gg*sh*ah);d[o+2]=Math.min(255,b*sh*ah);d[o+3]=255}
 g.putImageData(im,0,0);c.E=E;return c})();
