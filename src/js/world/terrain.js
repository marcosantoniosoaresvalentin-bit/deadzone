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
 // grade de 4 m, retangular: cobre o mapa todo (ilha principal + Ilha Zênite) com 150 m de mar em volta
 const S=8, OX=MAPB.x0-100, OZ=MAPB.z0-100, NX=Math.round((MAPB.x1-MAPB.x0+200)/S)+1, NZ=Math.round((MAPB.z1-MAPB.z0+200)/S)+1, N=NX, O=OZ;
 const idx=(i,j)=>j*NX+i;
 // ---------- ruído suave ----------
 const hh=(x,z)=>{const v=Math.sin(x*127.1+z*311.7)*43758.5453;return v-Math.floor(v)};
 const vn=(x,z)=>{const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=xf*xf*(3-2*xf),w=zf*zf*(3-2*zf);return(hh(xi,zi)*(1-u)+hh(xi+1,zi)*u)*(1-w)+(hh(xi,zi+1)*(1-u)+hh(xi+1,zi+1)*u)*w};
 const fbm=(x,z)=>vn(x,z)*.5+vn(x*2.03+5.2,z*2.03+1.3)*.27+vn(x*4.1+9.1,z*4.1+3.7)*.15+vn(x*8.3+2.7,z*8.3+8.1)*.08;
 const ridge=(x,z)=>{const r=1-Math.abs(fbm(x,z)*2-1);return r*r};
 const ss=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t)};
 const gau=(x,z,cx,cz,r)=>Math.exp(-((x-cx)**2+(z-cz)**2)/(r*r));

 // ---------- litoral: quadrado arredondado com recortes (baías e pontas) ----------
 const coastDist=coastMain;
 window.DZCOAST=coastDist;
 // ---------- relevo em terra ----------
const PLC=(typeof FLATS!=='undefined'?FLATS:[]).map(A=>[(A.x0+A.x1)/2,(A.z0+A.z1)/2]);
 const farPts=(n,minCoast,minD)=>{const out=[];for(let k=0;k<n;k++){let best=null,bd=0;for(let x=-MAPH;x<=MAPH;x+=200)for(let z=-MAPH;z<=MAPH;z+=200){if(coastMain(x,z)<minCoast)continue;let d=1e9;for(const q of PLC)d=Math.min(d,Math.hypot(q[0]-x,q[1]-z));for(const q of out)d=Math.min(d,Math.hypot(q[0]-x,q[1]-z)*.9);if(d>bd){bd=d;best=[x,z]}}if(!best||bd<minD)break;out.push(best)}return out};
 const FAR=farPts(8,500,380),PEAKS=FAR.slice(0,5).map((q,i)=>({x:q[0],z:q[1],r:520+(i%3)*160,h:75+(i*37%50)})),LAKES=FAR.slice(5).map((q,i)=>({x:q[0],z:q[1],r:210+(i%2)*90}));
 window.DZLAKES=LAKES;window.DZPEAKS=PEAKS;
 for(let i=STRS.length-1;i>=0;i--){const b=STRS[i];if(b.rural&&LAKES.some(K=>Math.hypot(b.x-K.x,b.z-K.z)<K.r*2.6))STRS.splice(i,1)}
 // estradas desviam das lagoas
 for(const L_ of (typeof ROADLINES!=='undefined'?ROADLINES:[]))for(const q of L_)for(const K of LAKES){const dx=q[0]-K.x,dz=q[1]-K.z,d=Math.hypot(dx,dz)||1,lim=K.r*2.1;if(d<lim){q[0]=K.x+dx/d*lim;q[1]=K.z+dz/d*lim}}
 const M=MAPH/250;                     // escala (posições pensadas para a ilha antiga de 500 m)
 const MTX=-135*M,MTZ=-115*M,MTR=72*M;
 // serras isoladas nos lugares vazios
 const peaks=(x,z)=>{let h=0;for(const P of PEAKS)h+=gau(x,z,P.x,P.z,P.r)*(P.h+ridge(x/360+P.x*.01,z/360+P.z*.01)*P.h*.45);return h};
 function landH(x,z){
  let h=1.6+Math.pow(fbm(x/1400+3.1,z/1400+7.7),1.4)*34+(fbm(x/260+1.3,z/260+4.4)-.5)*10+(fbm(x/55,z/55)-.5)*2.4;
  // serra a noroeste com cristas rochosas
  const mt=gau(x,z,MTX,MTZ,MTR);h+=mt*(70+ridge(x/420+4,z/420+2)*40);
  // morros
  h+=gau(x,z,125*M,95*M,58*M)*(40+ridge(x/330,z/330)*12);
  h+=gau(x,z,-70*M,150*M,46*M)*30;
  h+=gau(x,z,40*M,-40*M,50*M)*15;
  h+=gau(x,z,175*M,-20*M,40*M)*22;
  h+=peaks(x,z);
  // vale largo cruzando a ilha
  const vy=z-(x*.35+20*M)+Math.sin(x/900)*270;h-=gau(0,vy,0,0,22*M)*8*(1-mt);
  return h;
 }
 // ILHA ZÊNITE (oeste): quadrado arredondado com metade do lado da ilha principal, relevo baixo com um morro
 const Z2={x:-490+ZEN_DX,z:-60+ZEN_DZ,R:125};
 function coast2(x,z){const dx=x-Z2.x,dz=z-Z2.z,p=2.6,d=Math.pow(Math.pow(Math.abs(dx),p)+Math.pow(Math.abs(dz),p),1/p),a=Math.atan2(dz,dx);
  const cn=fbm(Math.cos(a)*2.4+3,Math.sin(a)*2.4+11)*.7+fbm(Math.cos(a)*7+5,Math.sin(a)*7+2)*.3;return Z2.R+8-cn*26-d}
 function landH2(x,z){return 2+Math.pow(fbm(x/120+9.3,z/120+1.7),1.3)*6+gau(x,z,Z2.x-70,Z2.z+70,40)*14+(fbm(x/40,z/40)-.5)*2}
 // ILHAS DAS ARENAS: retângulo arredondado (comprido no Duelo), chão baixo e plano
 const ISL=(typeof ARENAS!=='undefined'?Object.values(ARENAS):[]);
 function coastA(A,x,z){const p=5,n=Math.pow(Math.pow(Math.abs(x-A.x)/A.RX,p)+Math.pow(Math.abs(z-A.z)/A.RZ,p),1/p),a=Math.atan2(z-A.z,x-A.x),cn=fbm(Math.cos(a)*2+A.x*.01,Math.sin(a)*2+A.z*.01)*.6;return (1-n)*Math.min(A.RX,A.RZ)-cn*6}
 // altura das ilhas das arenas (mapas separados, fora da grade da ilha principal)
 window.ARENAH=function(x,z){for(const A of ISL){if(Math.abs(x-A.x)<A.hw+7&&Math.abs(z-A.z)<A.hd+7)return A.h;const t=coastA(A,x,z);if(t>-80){if(t<=0)return Math.max(-14,.35+t*.09);const beach=.35+Math.min(t,22)*.085,k=ss(8,22,t);return beach+Math.max(0,A.h+(fbm(x/30,z/30)-.5)*.8-beach)*k}}return -14};
 function rawH(x,z){
  const t2=coast2(x,z),t1=coastDist(x,z);
  if(t2>t1){const t=t2;if(t<=0)return Math.max(-14,.35+t*.09-Math.max(0,-t-30)*.05);const beach=.35+Math.min(t,22)*.085,k=ss(12,40,t);return beach+Math.max(0,landH2(x,z)-beach)*k}
  const t=t1;
  if(t<=0)return Math.max(-14,.35+t*.09-Math.max(0,-t-30)*.05);           // fundo do mar (segue o litoral)
  const ck=coastKind(x,z),W=ck<0?78:ck>0?7:24,K0=ck<0?70:ck>0?3:12,K1=ck<0?190:ck>0?22:48; // praia larga / falésia / normal
  let h;
  if(t>K1)h=landH(x,z);
  else{const beach=.35+Math.min(t,W)*(ck<0?.022:ck>0?.28:.085),k=ss(K0,K1,t);h=beach+Math.max(0,landH(x,z)-beach)*k}
  // lagoas
  for(const L of LAKES){const wx=(fbm(x/150+L.x,z/150)-.5)*L.r*1.1,wz=(fbm(x/150,z/150+L.z)-.5)*L.r*1.1,d=Math.hypot((x-L.x+wx)*.75,(z-L.z+wz)*1.2);if(d<L.r*2.2){const k=1-ss(L.r*.4,L.r*2.2,d);h=h*(1-k)+(-1.8)*k}}
  return h;
 }
 // ---------- grade de alturas ----------
 const H=new Float32Array(NX*NZ);
 for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++)H[idx(i,j)]=rawH(OX+i*S,OZ+j*S);
 // heliportos: área plana com borda suave
 const RNG=(x0,z0,x1,z1,f)=>{const i0=Math.max(0,Math.floor((x0-OX)/S)),i1=Math.min(NX-1,Math.ceil((x1-OX)/S)),j0=Math.max(0,Math.floor((z0-OZ)/S)),j1=Math.min(NZ-1,Math.ceil((z1-OZ)/S));for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)f(i,j)};
 for(const hp of (typeof HPS!=='undefined'?HPS:[])){const cx=hp[1],cz=hp[2],h0=rawH(cx,cz);
  RNG(cx-34,cz-34,cx+34,cz+34,(i,j)=>{const x=OX+i*S,z=OZ+j*S,d=Math.hypot(x-cx,z-cz);if(d>34)return;const k=1-ss(13,32,d);H[idx(i,j)]=H[idx(i,j)]*(1-k)+h0*k})}
 // construções: terreno plano embaixo (e borda suave em volta)
 for(const b of (typeof BLDS!=='undefined'?BLDS:[])){if(b.city)continue;const cx=b.x,cz=b.z,h0=rawH(cx,cz),r0=b.flat||12,r1=r0+14;
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const x=OX+i*S,z=OZ+j*S,d=Math.hypot(x-cx,z-cz);if(d>r1)continue;const k=1-ss(r0,r1,d);H[idx(i,j)]=H[idx(i,j)]*(1-k)+h0*k}}
 // prédios com interior: retângulo plano (com folga) e borda suave
 for(const b of (typeof STRS!=='undefined'?STRS:[])){if(b.city)continue;const cx=b.x,cz=b.z,h0=rawH(cx,cz),hw=Math.max(b.w,b.d)/2+3;
  RNG(cx-hw-14,cz-hw-14,cx+hw+14,cz+hw+14,(i,j)=>{const x=OX+i*S,z=OZ+j*S,d=Math.max(0,Math.max(Math.abs(x-cx),Math.abs(z-cz))-hw);if(d>14)return;const k=1-ss(0,14,d);H[idx(i,j)]=H[idx(i,j)]*(1-k)+h0*k})}
 // cidades e locais especiais: cada um vira um platô (nível médio do lugar) com borda suave
 for(const A of (typeof FLATS!=='undefined'?FLATS:[])){let sm=0,n=0;for(let x=A.x0;x<=A.x1;x+=6)for(let z=A.z0;z<=A.z1;z+=6){sm+=rawH(x,z);n++}const h0=A.h=A.hFix!=null?A.hFix:Math.max(1.6,sm/n),bl=A.bl||30;
  RNG(A.x0-bl-6,A.z0-bl-6,A.x1+bl+6,A.z1+bl+6,(i,j)=>{const x=OX+i*S,z=OZ+j*S,d=Math.hypot(Math.max(0,A.x0-x,x-A.x1),Math.max(0,A.z0-z,z-A.z1));if(d>bl+5)return;const k=1-ss(5,bl+5,d);/* 5 m a mais totalmente plano em volta: piso e calçadas não ficam 'flutuando' */H[idx(i,j)]=H[idx(i,j)]*(1-k)+h0*k})}
 // ESTRADAS: curva suave pelos pontos. Altura da pista = terreno suavizado ao longo dela, PRESA na altura do
 // platô quando passa por cidade/local e na altura da outra estrada nos cruzamentos. Seção transversal plana:
 // tudo a até 10 m do eixo fica exatamente na altura da pista (o terreno nunca atravessa o asfalto).
 if(typeof ROADLINES!=='undefined'){const hAt=(x,z)=>{const fx=(x-OX)/S,fz=(z-OZ)/S,i=Math.max(0,Math.min(NX-2,Math.floor(fx))),j=Math.max(0,Math.min(NZ-2,Math.floor(fz))),u=fx-i,v=fz-j;return H[idx(i,j)]*(1-u)*(1-v)+H[idx(i+1,j)]*u*(1-v)+H[idx(i,j+1)]*(1-u)*v+H[idx(i+1,j+1)]*u*v};
  const bD=new Float32Array(NX*NZ).fill(1e9),bH=new Float32Array(NX*NZ);window.ROADS=[];const ALL=[],AG=new Map();
  const FL_=(typeof FLATS!=='undefined'?FLATS:[]),flatAt=(x,z)=>{for(const A of FL_)if(x>=A.x0-12&&x<=A.x1+12&&z>=A.z0-12&&z<=A.z1+12)return A.h;return null},inFlat=(x,z)=>FL_.some(A=>x>=A.x0-5&&x<=A.x1+5&&z>=A.z0-5&&z<=A.z1+5);
  const inFlatS=(x,z)=>{for(const A of FL_)if(x>=A.x0-3&&x<=A.x1+3&&z>=A.z0-3&&z<=A.z1+3)return A;return null};
  const G_=.1;   // inclinação máxima da pista (7,5%)
  for(const L of ROADLINES){const cv=new T.CatmullRomCurve3(L.map(p=>new T.Vector3(p[0],0,p[1])),false,'centripetal'),len=cv.getLength(),n=Math.max(2,Math.round(len/2)),pts=cv.getSpacedPoints(n);
   const ds=len/n,inF=pts.map(p=>inFlatS(p.x,p.z));
   // pontos fixos: dentro de cidade/local (altura do chão de lá) e encontro com outra estrada
   const pin=pts.map((p,k)=>{if(inF[k])return inF[k].h;let best=null,bd=5;const ci=Math.floor(p.x/8),cj=Math.floor(p.z/8);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=AG.get((ci+a)*100003+cj+b);if(L)for(const q of L){const d=Math.hypot(q[0]-p.x,q[1]-p.z);if(d<bd){bd=d;best=q[2]}}}return best});
   // base: terreno suavizado ao longo da pista
   let hs=pts.map(p=>hAt(p.x,p.z));for(let it=0;it<4;it++){const o=hs.slice();for(let k=0;k<hs.length;k++){let a=0,c=0;for(let q=-8;q<=8;q++){const m=k+q;if(m<0||m>=hs.length)continue;a+=o[m];c++}hs[k]=a/c}}
   // envelope de inclinação a partir dos pontos fixos: corta morro / aterra vale quando preciso
   const P=[];pin.forEach((v,k)=>{if(v!=null)P.push([k,v])});
   if(P.length){for(let k=0;k<hs.length;k++){let lo=-1e9,hi=1e9;for(const [m,v] of P){const d=Math.abs(k-m)*ds;lo=Math.max(lo,v-G_*d);hi=Math.min(hi,v+G_*d)}hs[k]=lo>hi?(lo+hi)/2:Math.max(lo,Math.min(hi,hs[k]))}}
   // limita a inclinação entre pontos vizinhos também (ida e volta), sem mexer nos fixos
   for(let it=0;it<3;it++){for(let k=1;k<hs.length;k++)if(pin[k]==null)hs[k]=Math.max(hs[k-1]-G_*ds,Math.min(hs[k-1]+G_*ds,hs[k]));for(let k=hs.length-2;k>=0;k--)if(pin[k]==null)hs[k]=Math.max(hs[k+1]-G_*ds,Math.min(hs[k+1]+G_*ds,hs[k]))}
   // suaviza as quebras (mantém os fixos)
   for(let it=0;it<3;it++){const o=hs.slice();for(let k=1;k<hs.length-1;k++)if(pin[k]==null)hs[k]=(o[k-1]+o[k]*2+o[k+1])/4}
   /* não desenha estrada só onde já existe chão pronto: dentro das RUAS da cidade (não na área toda dela, senão sobra um pedaço de grama entre a estrada e a primeira rua) e dentro do pátio dos locais */
   const onGrid=(A,x,z)=>{if(!A.XL)return true;const hw=(A.RW||8)/2+.5;return x>=Math.min(...A.XL)-hw&&x<=Math.max(...A.XL)+hw&&z>=Math.min(...A.ZL)-hw&&z<=Math.max(...A.ZL)+hw};
   const R={pts:pts.map((p,k)=>[p.x,p.z,hs[k],inF[k]&&!/^pont/.test(inF[k].id||'')&&onGrid(inF[k],p.x,p.z)?1:0])};ROADS.push(R);for(const q of R.pts){ALL.push(q);const key=Math.floor(q[0]/8)*100003+Math.floor(q[1]/8);let L=AG.get(key);if(!L)AG.set(key,L=[]);L.push(q)}
   pts.forEach((p,k)=>{const i0=Math.floor((p.x-22-OX)/S),i1=Math.ceil((p.x+22-OX)/S),j0=Math.floor((p.z-22-OZ)/S),j1=Math.ceil((p.z+22-OZ)/S);
    for(let j=Math.max(0,j0);j<=Math.min(NZ-1,j1);j++)for(let i=Math.max(0,i0);i<=Math.min(NX-1,i1);i++){const d=Math.hypot(OX+i*S-p.x,OZ+j*S-p.z),q=idx(i,j);if(d<bD[q]){bD[q]=d;bH[q]=hs[k]}}})}
  for(let q=0;q<NX*NZ;q++){const d=bD[q];if(d>22)continue;if(inFlat(OX+(q%NX)*S,OZ+Math.floor(q/NX)*S))continue;/* não mexe no chão plano de cidade/local */const k=d<=10?1:1-ss(10,22,d);H[q]=H[q]*(1-k)+(bH[q]-.02)*k}
  // garantia final: embaixo de QUALQUER pista (inclusive cruzamentos e chegadas nas cidades) o terreno fica
  // sempre um pouco abaixo do asfalto — a terra nunca aparece por cima da estrada
  for(const R of ROADS)for(const q of R.pts){if(q[3])continue;const i0=Math.floor((q[0]-8-OX)/S),i1=Math.ceil((q[0]+8-OX)/S),j0=Math.floor((q[1]-8-OZ)/S),j1=Math.ceil((q[1]+8-OZ)/S);
   for(let j=Math.max(0,j0);j<=Math.min(NZ-1,j1);j++)for(let i=Math.max(0,i0);i<=Math.min(NX-1,i1);i++){const d=Math.hypot(OX+i*S-q[0],OZ+j*S-q[1]);if(d>7.5)continue;const m=idx(i,j),lim=q[2]-.2;if(H[m]>lim)H[m]=lim}}}
 // ALTURA DA PISTA (para pés e rodas pisarem no asfalto, não no terreno rebaixado embaixo dele)
 const RG=new Map(),rk=(x,z)=>Math.floor(x/8)*100003+Math.floor(z/8);
 if(window.ROADS)ROADS.forEach((R,ri)=>R.pts.forEach((q,k)=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const key=(Math.floor(q[0]/8)+a)*100003+Math.floor(q[1]/8)+b;let L=RG.get(key);if(!L)RG.set(key,L=[]);L.push(ri*100000+k)}}));
 window.ROADH=function(x,z){const L=RG.get(rk(x,z));if(!L)return null;let best=null,bd=3.65;
  for(const id of L){const R=ROADS[Math.floor(id/100000)].pts,k=id%100000;for(const m of [k-1,k]){if(m<0||m+1>=R.length)continue;const a=R[m],b=R[m+1];if(a[3]&&b[3])continue;const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;let t=((x-a[0])*dx+(z-a[1])*dz)/l2;t=Math.max(0,Math.min(1,t));const px=a[0]+dx*t,pz=a[1]+dz*t,d=Math.hypot(x-px,z-pz);if(d<bd){bd=d;best=a[2]+(b[2]-a[2])*t+.03}}}
  return best};
 // mesma triangulação do PlaneGeometry: altura idêntica à malha
 function terh(x,z){
  if(x>3500)return ARENAH(x,z);
  const fx=(x-OX)/S,fz=(z-OZ)/S;if(fx<0||fz<0||fx>=NX-1||fz>=NZ-1)return -14;
  const i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j,a=H[idx(i,j)],b=H[idx(i,j+1)],c=H[idx(i+1,j+1)],d=H[idx(i+1,j)];
  return u+v<=1?a+(d-a)*u+(b-a)*v:c+(b-c)*(1-u)+(d-c)*(1-v);
 }
 // ---------- normais e mistura de solos por ponto da grade (grama, terra, rocha, areia) ----------
 const NRM=new Int8Array(NX*NZ*3),SPL=new Uint8Array(NX*NZ*4);
 const hg=(i,j)=>H[idx(Math.max(0,Math.min(NX-1,i)),Math.max(0,Math.min(NZ-1,j)))];
 for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const k=idx(i,j),dx=(hg(i+1,j)-hg(i-1,j))/(2*S),dz=(hg(i,j+1)-hg(i,j-1))/(2*S),l=Math.hypot(dx,1,dz),ny=1/l;
  NRM[k*3]=Math.round(-dx/l*127);NRM[k*3+1]=Math.round(ny*127);NRM[k*3+2]=Math.round(-dz/l*127);
  const x=OX+i*S,z=OZ+j*S,y=H[k],sl=1-ny;
  let rock=ss(.07,.17,sl)+ss(70,95,y)*.6;
  const mt=gau(x,z,MTX,MTZ,MTR);rock+=mt*ss(.55,.75,ridge(x/420+4,z/420+2))*.8;
  let sand=1-ss(1.1,2.1,y);
  { const ct=coastDist(x,z),ck=coastKind(x,z);if(ct>0&&ct<60){if(ck>0)rock+=ss(60,6,ct)*.9;if(ck<0)sand=Math.max(sand,ss(150,60,ct))} }
  let dirt=ss(.55,.72,fbm(x/55+20,z/55+5))*.85+ss(.035,.07,sl)*.35+ss(2.4,3.2,y)*(1-ss(3.2,5,y))*.35;
  rock=Math.min(1,rock);sand=Math.min(1,sand);dirt=Math.min(1,dirt)*(1-rock)*(1-sand);rock*=(1-sand);
  const grass=Math.max(0,1-rock-sand-dirt),t=grass+dirt+rock+sand||1;
  SPL[k*4]=grass/t*255;SPL[k*4+1]=dirt/t*255;SPL[k*4+2]=rock/t*255;SPL[k*4+3]=sand/t*255}
 // ---------- malha em BLOCOS com nível de detalhe (perto = detalhado, longe = simples) ----------
 // só os blocos perto do jogador usam a grade inteira; o resto usa 1 a cada 2, 4 ou 8 pontos. Bordas com "saia" (sem frestas)
 const CH=64,CX_=Math.ceil((NX-1)/CH),CZ_=Math.ceil((NZ-1)/CH),SK=18;
 function chunkGeo(ci,cj,st){
  const i0=ci*CH,j0=cj*CH,i1=Math.min(NX-1,i0+CH),j1=Math.min(NZ-1,j0+CH),ni=Math.ceil((i1-i0)/st),nj=Math.ceil((j1-j0)/st),W=ni+1,Hh=nj+1;
  const nv=W*Hh+2*(W+Hh),pos=new Float32Array(nv*3),nor=new Int8Array(nv*3),spl=new Uint8Array(nv*4),ix=[];let v=0;
  const put=(i,j,dy)=>{i=Math.min(i,i1);j=Math.min(j,j1);const k=idx(i,j);pos[v*3]=OX+i*S;pos[v*3+1]=H[k]-dy;pos[v*3+2]=OZ+j*S;nor[v*3]=NRM[k*3];nor[v*3+1]=NRM[k*3+1];nor[v*3+2]=NRM[k*3+2];spl[v*4]=SPL[k*4];spl[v*4+1]=SPL[k*4+1];spl[v*4+2]=SPL[k*4+2];spl[v*4+3]=SPL[k*4+3];return v++};
  for(let b=0;b<Hh;b++)for(let a=0;a<W;a++)put(i0+a*st,j0+b*st,0);
  for(let b=0;b<nj;b++)for(let a=0;a<ni;a++){const p=b*W+a,q=p+1,r=p+W,t=r+1;ix.push(p,r,q,q,r,t)}
  // saias: borda duplicada 18 m para baixo
  const skirt=(L,flip)=>{const base=v;for(const [a,b] of L)put(i0+a*st,j0+b*st,SK);for(let k=0;k<L.length-1;k++){const e0=L[k][1]*W+L[k][0],e1=L[k+1][1]*W+L[k+1][0],s0=base+k,s1=base+k+1;if(flip)ix.push(e0,e1,s0,e1,s1,s0);else ix.push(e0,s0,e1,e1,s0,s1)}};
  const top=[],bot=[],lef=[],rig=[];for(let a=0;a<W;a++){top.push([a,0]);bot.push([a,nj])}for(let b=0;b<Hh;b++){lef.push([0,b]);rig.push([ni,b])}
  skirt(top,0);skirt(bot,1);skirt(lef,1);skirt(rig,0);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos.subarray(0,v*3),3));g.setAttribute('normal',new T.BufferAttribute(nor.subarray(0,v*3),3,true));
  g.setAttribute('spl',new T.BufferAttribute(spl.subarray(0,v*4),4,true));g.setIndex(ix);g.computeBoundingSphere();return g}
 const CHUNKS=[];for(let cj=0;cj<CZ_;cj++)for(let ci=0;ci<CX_;ci++){const cx=OX+(ci*CH+CH/2)*S,cz=OZ+(cj*CH+CH/2)*S;CHUNKS.push({ci,cj,cx,cz,g:[null,null,null,null],lod:-1,mesh:null})}
 function terg(x,z){const i=Math.round((x-OX)/S),j=Math.round((z-OZ)/S);if(i<0||j<0||i>=NX||j>=NZ)return 0;return SPL[idx(i,j)*4]/255}
 return {H,N:NX,NX,NZ,S,O:OX,OX,OZ,g:null,SPL,terh,terg,fbm,CHUNKS,chunkGeo};
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
 // blocos do terreno: o nível de detalhe de cada um muda com a distância da câmera (some a malha velha)
 const STEPS=[1,2,4,8],TGRP=new T.Group();TGRP.name='terreno';sc.add(TGRP);
 function upd(){const c=cam.position,hi=c.y>150;for(const C of TER.CHUNKS){const d=Math.hypot(C.cx-c.x,C.cz-c.z);let l=d<620?0:d<1300?1:d<2600?2:3;if(hi&&l<1)l=1;
   if(l===C.lod)continue;if(!C.g[l])C.g[l]=TER.chunkGeo(C.ci,C.cj,STEPS[l]);if(!C.mesh){C.mesh=new T.Mesh(C.g[l],m);C.mesh.receiveShadow=true;C.mesh.renderOrder=-2;C.mesh.matrixAutoUpdate=false;C.mesh.updateMatrix();TGRP.add(C.mesh)}else C.mesh.geometry=C.g[l];
   // libera a malha detalhada de blocos que ficaram longe
   if(l>=2&&C.g[0]){C.g[0].dispose();C.g[0]=null}C.lod=l}}
 upd();setInterval(upd,350);window.DZTERUPD=upd;
 // mar no nível 0
 const wm=new T.MeshStandardMaterial({color:lin(0x2f6f9a),metalness:.5,roughness:.12,transparent:true,opacity:.86});if(window.DZR)DZR.waterMat(wm);wm.opacity=.82;
 const sea=new T.Mesh(new T.PlaneGeometry(40000,40000),wm);sea.rotation.x=-Math.PI/2;sea.position.y=0;sc.add(sea);
 // fundo do mar escuro além do terreno (senão aparece um "quadrado" claro em volta da ilha, visto do alto)
 const deep=new T.Mesh(new T.PlaneGeometry(40000,40000),new T.MeshStandardMaterial({color:lin(0x0d3550),roughness:.97,metalness:0}));deep.rotation.x=-Math.PI/2;deep.position.y=-14.05;deep.renderOrder=-3;sc.add(deep)}

// ---------- imagem do terreno vista de cima (minimapa e mapa grande) ----------
const TERMAP=(()=>{const W=1024,E=MAPR+30,c=document.createElement('canvas');c.width=c.height=W;const g=c.getContext('2d'),im=g.createImageData(W,W),d=im.data;
 const col=[[78,118,52],[118,92,62],[128,124,116],[214,198,156]];
 for(let py=0;py<W;py++)for(let px=0;px<W;px++){const x=MCX-E+(px+.5)/W*2*E,z=MCZ-E+(py+.5)/W*2*E,h=TERH(x,z),o=(py*W+px)*4;
  if(h<0){const k=Math.max(0,Math.min(1,-h/3.5));d[o]=58-28*k;d[o+1]=128-50*k;d[o+2]=170-40*k;d[o+3]=255;continue}
  const i=Math.max(0,Math.min(TER.NX-1,Math.round((x-TER.OX)/TER.S))),j=Math.max(0,Math.min(TER.NZ-1,Math.round((z-TER.OZ)/TER.S))),q=(j*TER.NX+i)*4,w=TER.SPL;
  let r=0,gg=0,b=0;for(let s=0;s<4;s++){const ww=w[q+s]/255;r+=col[s][0]*ww;gg+=col[s][1]*ww;b+=col[s][2]*ww}
  // sombreamento do relevo (luz vinda do noroeste) e leve clareamento com a altura
  const sh=Math.max(.55,Math.min(1.35,1+(TERH(x-3,z-3)-TERH(x+3,z+3))*.09)),ah=1+Math.min(h,40)*.004;
  d[o]=Math.min(255,r*sh*ah);d[o+1]=Math.min(255,gg*sh*ah);d[o+2]=Math.min(255,b*sh*ah);d[o+3]=255}
 g.putImageData(im,0,0);c.E=E;c.x0=MCX-E;c.z0=MCZ-E;return c})();
