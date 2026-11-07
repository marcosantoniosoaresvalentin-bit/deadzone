/* Deadzone · game/zone.js
 * Zona que fecha (parede azul transparente).
 */
// parede da zona: azul transparente, mais forte embaixo e some para cima; faixas subindo devagar.
// Também some com a distância (antes do limite de visão da câmera), para não aparecer cortada.
const ZU={uT:{value:0},uC:{value:new T.Color(0x2f8cff)},uCam:{value:cam.position},uFar:{value:380}};
const ZMAT=new T.ShaderMaterial({uniforms:ZU,transparent:true,depthWrite:false,side:T.DoubleSide,fog:false,
 vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
 fragmentShader:`uniform float uT;uniform vec3 uC;uniform vec3 uCam;uniform float uFar;varying vec3 vW;
 void main(){float d=distance(vW.xz,uCam.xz),h=1.-smoothstep(0.,95.,vW.y-uCam.y*.25);
  float f=fract(vW.y*.09-uT*.25),band=smoothstep(0.,.06,f)*smoothstep(.22,.1,f)*(1.-smoothstep(50.,150.,d));
  float a=(.16+.30*h+.22*band*h)*(1.-smoothstep(uFar*.55,uFar*.92,d));
  a+=.22*h*(1.-smoothstep(0.,45.,d));
  a*=1.-smoothstep(50.,170.,vW.y);
  a*=mix(1.,.12,smoothstep(40.,160.,uCam.y));   // vista do avião/paraquedas alto: a parede quase some para dar de ver o mapa
  gl_FragColor=vec4(mix(uC,vec3(.8,.93,1.),band*.55),clamp(a,0.,.72));}`}),
 zw=new T.Mesh(new T.CylinderGeometry(1,1,260,96,1,true),ZMAT);zw.position.y=120;zw.frustumCulled=false;zw.renderOrder=3;sc.add(zw);
const ZK=MAPH/1200,ZS=[900,500,260,120,40].map(r=>Math.round(r*ZK)),Z0=1700*ZK;let zR=Z0,zI=0,zX=0,zZ=0,ZP=null;
function zonePlan(){const a=Math.random()*6.2832,d=Math.sqrt(Math.random())*950*ZK,F=[Math.cos(a)*d,Math.sin(a)*d];let prev=Z0,tot=0;const gp_=[];for(const r of ZS){gp_.push(prev-r);tot+=prev-r;prev=r}let cum=0;const C=[[0,0]];for(let i=0;i<ZS.length;i++){cum+=gp_[i];C.push([F[0]*cum/tot,F[1]*cum/tot])}ZP={C,F,g:0}}
function zoneUpd(dt){ZU.uT.value+=dt;ZU.uFar.value=cam.far;if(!ZP||gt<ZP.g-1)zonePlan();ZP.g=gt;const t=gt-100;let r=Z0,idx=0,txt='',cx=0,cz=0;
 if(t>=0){idx=Math.floor(t/135);if(idx>=ZS.length){idx=ZS.length;r=ZS[ZS.length-1];cx=ZP.F[0];cz=ZP.F[1];txt='Zona final'}else{const w=t%135,p=idx?ZS[idx-1]:Z0,A=ZP.C[idx],B=ZP.C[idx+1];if(w<75){r=p;cx=A[0];cz=A[1];txt='Zona fecha em '+Math.ceil(75-w)+'s'}else{const k=(w-75)/60;r=lp(p,ZS[idx],k);cx=lp(A[0],B[0],k);cz=lp(A[1],B[1],k);txt='Zona fechando...'}}}else txt='Zona começa em '+Math.ceil(-t)+'s';
 zR=r;zI=idx;zX=cx;zZ=cz;zw.position.x=cx;zw.position.z=cz;zw.scale.set(r,1,r);const out=Math.hypot(P.x-cx,P.z-cz)>r;$('zn').textContent=txt+' · raio '+Math.round(r)+'m'+(out?' · FORA DA ZONA':'');$('zn').style.color=out?'#ff6a6a':'#fff';
 if(out&&(mode==='ground'||mode==='drive'))hp-=dt*(1.5+idx*1.2)}
