/* Deadzone · core/engine.js
 * Renderizador, cena, câmera, luzes, céu e utilitários de geometria/colisão.
 */
const T=THREE,cv=document.getElementById('c');
// qualidade padrão quando o jogador nunca escolheu: Média no celular (toque), Alta no PC
const DZ_DEFQ=window.DZ_DEFQ=((('ontouchstart' in window)||navigator.maxTouchPoints>0)?1:2);
const ren=new T.WebGLRenderer({canvas:cv,antialias:(()=>{try{const q=JSON.parse(localStorage.getItem('dzCfg')||'{}').q;return (q==null?DZ_DEFQ:q)>=1}catch(e){return true}})(),powerPreference:'high-performance'});ren.setPixelRatio(Math.min(devicePixelRatio,1.25));ren.outputEncoding=T.sRGBEncoding;ren.toneMapping=T.ACESFilmicToneMapping;ren.toneMappingExposure=1.1;ren.shadowMap.enabled=true;ren.shadowMap.type=T.PCFShadowMap;
const sc=new T.Scene();sc.background=new T.Color(0xcce0f2);sc.fog=new T.Fog(new T.Color(0xcce0f2).convertSRGBToLinear(),80,400);
const cam=new T.PerspectiveCamera(65,1,.1,600);sc.add(cam);const rt=new T.WebGLRenderTarget(512,512),cam2=new T.PerspectiveCamera(16,1,.1,600),vmH=new T.Group();vmH.rotation.y=Math.PI;vmH.visible=false;cam.add(vmH);
sc.add(new T.HemisphereLight(0xbfd9ff,0x56633f,.75));
const sun=new T.DirectionalLight(0xfff0d2,2.1);sun.position.set(55,90,30);sun.castShadow=true;sun.shadow.mapSize.set(768,768);{const c=sun.shadow.camera;c.left=c.bottom=-42;c.right=c.top=42;c.near=10;c.far=260}sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;sc.add(sun,sun.target);
// ---- CÉU: atmosfera (horizonte claro, zênite azul), sol com brilho e nuvens macias que andam devagar.
// O ruído das nuvens vem de uma textura (não de seno), para ficar liso também no celular.
const skyN=(()=>{const W=256,c=document.createElement('canvas');c.width=c.height=W;const g=c.getContext('2d'),im=g.createImageData(W,W);let s=9;const r=()=>(s=(s*16807)%2147483647)/2147483647;
 // ruído de valor suave e que repete sem emenda (grade 32x32 interpolada)
 const G=32,v=new Float32Array(G*G);for(let k=0;k<G*G;k++)v[k]=r();const at=(i,j)=>v[((j%G+G)%G)*G+((i%G+G)%G)];
 for(let y=0;y<W;y++)for(let x=0;x<W;x++){const fx=x/W*G,fy=y/W*G,i=Math.floor(fx),j=Math.floor(fy),u=fx-i,w=fy-j,uu=u*u*(3-2*u),ww=w*w*(3-2*w);
  const n=(at(i,j)*(1-uu)+at(i+1,j)*uu)*(1-ww)+(at(i,j+1)*(1-uu)+at(i+1,j+1)*uu)*ww,o=(y*W+x)*4;im.data[o]=im.data[o+1]=im.data[o+2]=n*255;im.data[o+3]=255}
 g.putImageData(im,0,0);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;return t})();
const sky=new T.Mesh(new T.SphereGeometry(540,48,24),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{sd:{value:new T.Vector3(55,90,30).normalize()},uT:{value:0},tN:{value:skyN}},
vertexShader:'varying vec3 vp;void main(){vp=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
fragmentShader:`varying vec3 vp;uniform vec3 sd;uniform float uT;uniform sampler2D tN;
float fbm(vec2 p){float f=0.,a=.5;for(int i=0;i<5;i++){f+=a*texture2D(tN,p).r;p=p*2.03+vec2(.173,.317);a*=.5;}return f/.97;}
void main(){vec3 d=normalize(vp);float y=max(d.y,0.),s=max(dot(d,sd),0.);
 vec3 zen=vec3(.13,.34,.74),hor=vec3(.70,.81,.92);
 vec3 c=mix(hor,zen,pow(y,.42));
 c+=vec3(1.,.80,.55)*(pow(s,6.)*.16+pow(s,48.)*.30);
 if(d.y>0.){
  vec2 q=d.xz/(d.y+.10)*.055+vec2(uT*.0016,uT*.0007);
  float b=fbm(q),dt=fbm(q*3.3+vec2(.41,.13)+uT*.0008),den=b*.72+dt*.36;
  float cl=smoothstep(.50,.74,den);
  // luz das nuvens: amostra um pouco na direção do sol; mais densa ali = lado de sombra
  float den2=fbm(q+sd.xz*.012)*.72+dt*.36,sh=clamp((den2-den)*6.+.5,0.,1.);
  vec3 cc=mix(vec3(1.,.99,.96),vec3(.62,.67,.76),smoothstep(.55,.95,den)*.8+sh*.25);
  cc+=vec3(1.,.85,.6)*pow(s,10.)*.35*(1.-smoothstep(.5,.9,den));
  float fade=smoothstep(.0,.22,d.y);
  c=mix(c,cc,cl*fade*.96);
  c=mix(c,hor,(1.-smoothstep(0.,.10,d.y))*.6);   // névoa no horizonte
 }
 c+=vec3(1.,.96,.88)*pow(s,1200.)*5.;
 if(d.y<0.)c=mix(hor,vec3(.55,.66,.76),min(1.,-d.y*3.));
 gl_FragColor=vec4(c,1.);}`}));
sky.renderOrder=-1;sc.add(sky);
function rs(){const w=cv.clientWidth,h=cv.clientHeight;ren.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
addEventListener('resize',rs);rs();
const M=c=>new T.MeshStandardMaterial({color:new T.Color(c).convertSRGBToLinear(),roughness:.8,metalness:.06}),R=(a,b)=>a+Math.random()*(b-a);
const lin=c=>new T.Color(c).convertSRGBToLinear();
function ctex(w,h,fn,rx,ry){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.encoding=T.sRGBEncoding;t.anisotropy=4;t.repeat.set(rx,ry);return t}

const GRD=new Map(),EMP=[],box=[],FP=[],RDS=[],LS=[],LAMPS=[],doors=[],RFL=[];
const gk=(i,j)=>(i+900)*2000+(j+900);
function addBox(b){box.push(b);const i0=Math.floor((b.x0-.6)/32),i1=Math.floor((b.x1+.6)/32),j0=Math.floor((b.z0-.6)/32),j1=Math.floor((b.z1+.6)/32);for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=gk(i,j);let a=GRD.get(k);if(!a)GRD.set(k,a=[]);a.push(b)}return b}
const near=(x,z)=>GRD.get(gk(Math.floor(x/32),Math.floor(z/32)))||EMP;
const _o=new T.Object3D();
function bake(parent,items,cast){const by=new Map();for(const it of items){_o.position.set(it[2],it[3],it[4]);_o.rotation.set(it[5]||0,it[6]||0,it[7]||0);_o.updateMatrix();const g=it[0].index?it[0].toNonIndexed():it[0].clone();g.applyMatrix4(_o.matrix);const tk=it[1].c,key=tk?'v'+it[1].k:it[1];let a=by.get(key);if(!a)by.set(key,a={m:tk?VM[it[1].k]:it[1],v:!!tk,gs:[],cs:[]});
  if(tk){const n=g.attributes.position.count,ca=new Float32Array(n*3);for(let i=0;i<n;i++){ca[i*3]=tk.r;ca[i*3+1]=tk.g;ca[i*3+2]=tk.b}a.cs.push(ca)}a.gs.push(g)}
 for(const a of by.values()){let n=0;for(const g of a.gs)n+=g.attributes.position.count;const P_=new Float32Array(n*3),N_=new Float32Array(n*3),U_=new Float32Array(n*2),C_=a.v?new Float32Array(n*3):null;let o=0;
  a.gs.forEach((g,i)=>{const c=g.attributes.position.count;P_.set(g.attributes.position.array,o*3);N_.set(g.attributes.normal.array,o*3);U_.set(g.attributes.uv.array,o*2);if(C_)C_.set(a.cs[i],o*3);o+=c;g.dispose()});
  const m=new T.BufferGeometry();m.setAttribute('position',new T.BufferAttribute(P_,3));m.setAttribute('normal',new T.BufferAttribute(N_,3));m.setAttribute('uv',new T.BufferAttribute(U_,2));if(C_)m.setAttribute('color',new T.BufferAttribute(C_,3));
  const me=new T.Mesh(m,a.m);me.castShadow=cast!==false&&!(a.v&&a.m!==VM[0]&&a.m!==VM[3]&&a.m!==VM[4]);me.receiveShadow=true;parent.add(me)}}
