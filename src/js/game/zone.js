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
const ZK=MAPR/1200,ZS=[880,560,320,160,55].map(r=>Math.round(r*ZK)),Z0=1300*ZK;
// fases mais lentas: espera (s) antes de fechar e tempo (s) fechando, por fase
const ZWT=[150,120,100,80,60],ZSH=[100,80,65,55,45],ZST=[];{let a=0;for(let i=0;i<ZWT.length;i++){ZST.push(a);a+=ZWT[i]+ZSH[i]}ZST.push(a)}
const fmtT=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};let zR=Z0,zI=0,zX=MCX,zZ=MCZ,ZP=null;
function zonePlan(){/* zona final sempre em terra: perto de uma cidade/local (com um desvio) */const L_=(typeof FLATS!=='undefined'?FLATS.filter(f=>f.n):[]),A_=L_.length?L_[Math.floor(Math.random()*L_.length)]:{x:MCX,z:MCZ},a=Math.random()*6.2832,d=Math.random()*25,F=[A_.x+Math.cos(a)*d,A_.z+Math.sin(a)*d];let prev=Z0,tot=0;const gp_=[];for(const r of ZS){gp_.push(prev-r);tot+=prev-r;prev=r}let cum=0;const C=[[MCX,MCZ]];for(let i=0;i<ZS.length;i++){cum+=gp_[i];C.push([MCX+(F[0]-MCX)*cum/tot,MCZ+(F[1]-MCZ)*cum/tot])}ZP={C,F,g:0}}
function zoneUpd(dt){ZU.uT.value+=dt;ZU.uFar.value=cam.far;if(!ZP||gt<ZP.g-1)zonePlan();ZP.g=gt;const t=gt-120;let r=Z0,idx=0,txt='',cx=MCX,cz=MCZ;
 if(t>=0){idx=0;while(idx<ZS.length&&t>=ZST[idx+1])idx++;if(idx>=ZS.length){idx=ZS.length;r=ZS[ZS.length-1];cx=ZP.F[0];cz=ZP.F[1];txt='Zona final'}else{const w=t-ZST[idx],p=idx?ZS[idx-1]:Z0,A=ZP.C[idx],B=ZP.C[idx+1];if(w<ZWT[idx]){r=p;cx=A[0];cz=A[1];txt='Zona fecha em '+fmtT(ZWT[idx]-w)}else{const k=(w-ZWT[idx])/ZSH[idx];r=lp(p,ZS[idx],k);cx=lp(A[0],B[0],k);cz=lp(A[1],B[1],k);txt='Zona fechando · '+fmtT(ZSH[idx]-(w-ZWT[idx]))}}}else txt='Zona começa em '+fmtT(-t);
 zR=r;zI=idx;zX=cx;zZ=cz;zw.position.x=cx;zw.position.z=cz;zw.scale.set(r,1,r);const out=Math.hypot(P.x-cx,P.z-cz)>r;$('zn').textContent=txt+' · raio '+Math.round(r)+'m'+(out?' · FORA DA ZONA':'');$('zn').style.color=out?'#ff6a6a':'#fff';
 if(out&&(mode==='ground'||mode==='drive'))hp-=dt*(1.5+idx*1.2)}
