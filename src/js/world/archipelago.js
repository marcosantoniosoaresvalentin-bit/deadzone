/* Deadzone · world/archipelago.js
 * Arquipélago: ilha flutuante com construções, pontes, cachoeiras e loot premium.
 */
(()=>{try{
if(typeof addBox!=='function'||typeof mkLoot!=='function'||!window.THREE)return;
const T=THREE,ISY=140,OX=380,OZ=-380,CH=36,SH=17,SO=78,LR=15.5,IR=7;
let sd=7;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
const L=[],LE=[],WL=[],IS=[{x:OX,z:OZ,h:CH,c:1}],BR=[],SP=[],FLS=[],NK={v:0};
// RQ: visual realista (pedra/madeira/vidro/folhagem) mantendo as mesmas colisões; GLS vidraças; PR peças não-caixa; HV só colisão
const RQ=!!window.DZR,GLS=[],PR=[],HV={v:0};
const vb=(x,y,z,sx,sy,sz,c)=>L.push([x,y,z,sx,sy,sz,c]);
const cb=(x,z,sx,sz,yb,yt)=>addBox({x0:x-sx/2,x1:x+sx/2,z0:z-sz/2,z1:z+sz/2,w:1,yb,yt});
const sh=(c,k)=>{const f=v=>Math.min(255,(v*k)|0);return (f(c>>16&255)<<16)|(f(c>>8&255)<<8)|f(c&255)};
const pick=a=>a[(rn()*a.length)|0];
GY=function(x,z,y){let b=TERH(x,z);for(const s of IS){if(Math.abs(x-s.x)>s.h||Math.abs(z-s.z)>s.h)continue;let t=ISY;if(s.c){const r=Math.hypot(x-s.x,z-s.z);if(r<IR)t=ISY;else if(r<LR)t=ISY-1;}if(t<=y+1.3&&t>b)b=t}
 for(const r of BR)if(x>r[0]&&x<r[1]&&z>r[2]&&z<r[3]&&ISY<=y+1.3)b=ISY;
 for(const f of FLS)if(x>f[0]&&x<f[1]&&z>f[2]&&z<f[3]&&f[4]<=y+1.3&&f[4]>b)b=f[4];
 for(const q of RFL){const dx=x-q.x,dz=z-q.z;if(dx>q.r||dx<-q.r||dz>q.r||dz<-q.r)continue;const a=dx*q.cs-dz*q.sn,c=dx*q.sn+dz*q.cs;for(const e of q.f){const u=Math.abs(a-e.ox)/e.hw,v=Math.abs(c-e.oz)/e.hd;if(u>1||v>1)continue;const t=e.base+e.hh*(1-Math.max(u,v));if(t<=y+1.3&&t>b)b=t}}
 return b};
const GR=[0x5aa83a,0x66b542,0x4f9a34,0x74c04a],ST=[0x8a8d92,0x75787d,0x9a9da2],DI=[0x7a5a3c,0x6b4c32,0x86663f];
const STN=[0x9a948a,0x8c867c,0xa8a296,0x7e7a72,0x867f78,0x6f7f5a],WD=[0x9a6a3a,0x8a5a30,0xa87442,0x7a4c28],COB=[0x8f8580,0x9c918a,0x7f7a76,0x877f7a],OL=0x586a3c,LANT=0xffa030,GLOW=0xffc46a,REDL=0xff3040;
// ---- construtor de modelos com rotação (r*90°), coordenadas locais: +z = frente
function mk(cx,cz,r){const c=[1,0,-1,0][r],s=[0,1,0,-1][r],W=(x,z)=>[cx+x*c+z*s,cz-x*s+z*c],D=(a,b)=>[Math.abs(a*c)+Math.abs(b*s),Math.abs(a*s)+Math.abs(b*c)];
 const V=(x,y,z,a,h,b,col,e,kd)=>{const p=W(x,z),d=D(a,b);
  if(RQ&&col===GLOW){const tx=a<b,sg=(tx?x:z)>=0?1:-1,t=(tx?a:b)/2+.03,pp=W(x+(tx?sg*t:0),z+(tx?0:sg*t));
   L.push([p[0],ISY+y,p[1],d[0],h,d[1],0x0c0b0a,'int']);
   GLS.push([pp[0],ISY+y,pp[1],(tx?(sg>0?Math.PI/2:-Math.PI/2):(sg>0?0:Math.PI))+r*Math.PI/2,+(Math.max(a,b)*.96).toFixed(2),+(h*.96).toFixed(2)]);return}
  if(!HV.v)(e?LE:L).push([p[0],ISY+y,p[1],d[0],h,d[1],col,kd]);
  if(e||NK.v||h===1.12)return; // h===1.12: fiadas de parede (já têm K próprio)
  const top=y+h/2,mn=Math.min(d[0],d[1]),mx=Math.max(d[0],d[1]);
  const solid=(h>=.3&&top>.55&&mn>=.25)||(mx>=1.2&&mn<.25&&h<.25&&top>.3);
  if(solid)addBox({x0:p[0]-d[0]/2,x1:p[0]+d[0]/2,z0:p[1]-d[1]/2,z1:p[1]+d[1]/2,w:(mn>=.6&&h>=.8)?1:0,yb:ISY+y-h/2,yt:ISY+top});
  if(h>=.3&&h<=1.3&&mn>=1.5&&mx>=2&&top>.3)FLS.push([p[0]-d[0]/2,p[0]+d[0]/2,p[1]-d[1]/2,p[1]+d[1]/2,ISY+top])};
 const K=(x,z,a,b,y0,y1)=>{const p=W(x,z),d=D(a,b);cb(p[0],p[1],d[0],d[1],ISY+y0,ISY+y1)};
 const P=(x,z,yo)=>{const w=W(x,z);w[2]=yo||0;SP.push(w)};
 const G=(kg,col,x,y,z,sx,sy,sz,rx,ry,rz)=>{const p=W(x,z);PR.push([kg,col,p[0],ISY+y,p[1],sx,sy,sz,rx||0,(ry||0)+r*Math.PI/2,rz||0])};
 const NV=f=>{NK.v=1;try{f()}finally{NK.v=0}},HID=f=>{HV.v=1;try{f()}finally{HV.v=0}};
  const FR=(x0,x1,z0,z1,y)=>{const p=W(x0,z0),q=W(x1,z1);FLS.push([Math.min(p[0],q[0]),Math.max(p[0],q[0]),Math.min(p[1],q[1]),Math.max(p[1],q[1]),ISY+y])};
  const SL=(x0,x1,z0,z1,y,col)=>{const a=(x0+x1)/2,b=(z0+z1)/2,w=x1-x0,d=z1-z0;V(a,y-.35,b,w,.7,d,col);K(a,b,w,d,y-.7,y);FR(x0,x1,z0,z1,y)};
  const WX=(x0,x1,z,y0,h)=>{let x=x0;while(x<x1-.01){const w=Math.min(2.4+rn()*1.8,x1-x);for(let y=y0;y<y0+h-.01;y+=1.1)V(x+w/2,y+.55,z,w,1.12,.7,sh(pick(STN),.9+rn()*.2));x+=w}K((x0+x1)/2,z,x1-x0,.7,y0,y0+h)};
  const WZ=(z0,z1,x,y0,h)=>{let z=z0;while(z<z1-.01){const w=Math.min(2.4+rn()*1.8,z1-z);for(let y=y0;y<y0+h-.01;y+=1.1)V(x,y+.55,z+w/2,.7,1.12,w,sh(pick(STN),.9+rn()*.2));z+=w}K(x,(z0+z1)/2,.7,z1-z0,y0,y0+h)};
 const wx=(x0,x1,z,h,y0)=>{y0=y0||0;let x=x0;while(x<x1-.01){const w=Math.min(2.4+rn()*1.8,x1-x);for(let y=y0;y<y0+h;y+=1.1)V(x+w/2,y+.55,z,w,1.12,.7,sh(pick(STN),.9+rn()*.2));x+=w}if(!y0)K((x0+x1)/2,z,x1-x0,.7,0,h)};
 const wz=(z0,z1,x,h,y0)=>{y0=y0||0;let z=z0;while(z<z1-.01){const w=Math.min(2.4+rn()*1.8,z1-z);for(let y=y0;y<y0+h;y+=1.1)V(x,y+.55,z+w/2,.7,1.12,w,sh(pick(STN),.9+rn()*.2));z+=w}if(!y0)K(x,(z0+z1)/2,.7,z1-z0,0,h)};
 const crate=(x,z,spot)=>{V(x,.6,z,1.7,1.2,1.2,OL);V(x-.6,.6,z,.2,1.25,1.25,0x2a2a2a);V(x+.6,.6,z,.2,1.25,1.25,0x2a2a2a);V(x,1.22,z,1.8,.1,1.3,0x3a3a30);if(rn()<.5)V(x,.7,z+.63,.5,.9,.05,0xe0b020);K(x,z,1.7,1.2,0,1.2);if(spot!==0)P(x+(spot||0)+1.4,z+.2)};
 const barrel=(x,z)=>{V(x,.7,z,1,1.4,1,0xc02a2a);V(x,1.42,z,1.05,.1,1.05,0x7a1a1a);V(x,.8,z+.52,.4,.4,.05,0xffffff);K(x,z,1,1,0,1.4)};
 const lant=(x,y,z)=>{V(x,y,z,.5,.7,.5,LANT,1);V(x,y+.42,z,.6,.12,.6,0x2a2a2a)};
 const rails=(x0,x1,z0,z1,y,col)=>{col=col||0x2e2a28;for(let x=x0;x<=x1+.01;x+=(x1-x0)/Math.max(1,Math.round((x1-x0)/3.4))){V(x,y+.5,z0,.3,1,.3,col);V(x,y+.5,z1,.3,1,.3,col)}for(let z=z0;z<=z1+.01;z+=(z1-z0)/Math.max(1,Math.round((z1-z0)/3.4))){V(x0,y+.5,z,.3,1,.3,col);V(x1,y+.5,z,.3,1,.3,col)}
  for(const yy of[.45,.9]){V((x0+x1)/2,y+yy,z0,x1-x0,.14,.14,col);V((x0+x1)/2,y+yy,z1,x1-x0,.14,.14,col);V(x0,y+yy,(z0+z1)/2,.14,.14,z1-z0,col);V(x1,y+yy,(z0+z1)/2,.14,.14,z1-z0,col)}};
 const banner=(x,y,z,w,h,face)=>{const a=face==='x';const q=(dx,dy,dz,sw,sh_,col)=>V(x+(a?dx*0+.0:dx),y+dy,z+(a?dx:dz),a?.1:sw,sh_,a?sw:.1,col);
  V(x,y,z,a?.1:w,h,a?w:.1,0xc0262a);const o=a?.08:0;const sk=(u,v,sw,shh,col)=>V(x+(a?.1:0),y+v,z+(a?u:0)+0,a?.08:sw,shh,a?sw:.08,col);
  if(a){const f=(u,v,sw,shh,col)=>V(x+.1,y+v,z+u,.08,shh,sw,col);f(0,h*.1,w*.5,h*.22,0xf2f2f2);f(0,-h*.05,w*.32,h*.1,0xf2f2f2);f(-w*.12,h*.1,w*.12,h*.1,0x1a1a1a);f(w*.12,h*.1,w*.12,h*.1,0x1a1a1a)}
  else{const f=(u,v,sw,shh,col)=>V(x+u,y+v,z+.1,sw,shh,.08,col);f(0,h*.1,w*.5,h*.22,0xf2f2f2);f(0,-h*.05,w*.32,h*.1,0xf2f2f2);f(-w*.12,h*.1,w*.12,h*.1,0x1a1a1a);f(w*.12,h*.1,w*.12,h*.1,0x1a1a1a)}};
 const dish=(x,y,z)=>{V(x,y+.6,z,.4,1.2,.4,0x3a3a3a);V(x,y+1.4,z,2.6,.2,2.6,0xb0b0b0);V(x,y+1.6,z,1.8,.2,1.8,0x9a9a9a);V(x,y+1.8,z,.8,.2,.8,0x777777);V(x,y+2.4,z,.15,1,.15,0x333333)};
 const mast=(x,y,z,hh)=>{for(const a of[-.5,.5])for(const b of[-.5,.5])V(x+a,y+hh/2,z+b,.18,hh,.18,0x222428);for(let k=1;k<hh;k+=2.5){V(x,y+k,z,1.2,.12,.12,0x222428);V(x,y+k+1,z,.12,.12,1.2,0x222428)}V(x,y+hh+.2,z,.6,.6,.6,REDL,1)};
 const vine=(x,y,z,a,b,c)=>{for(let k=0;k<Math.ceil(b/2);k++)V(x+(rn()-.5)*.4,y-k*1.8,z+(rn()-.5)*.4,.9,1.6,.9,sh(pick(GR),.7+rn()*.3))};
 const cobble=(x0,x1,z0,z1)=>{for(let x=x0;x<x1;x+=3)for(let z=z0;z<z1;z+=3)V(x+1.5,.06,z+1.5,2.95,.12,2.95,pick(COB))};
 const wood=(x,y,z,a,h,b)=>{V(x,y,z,a,h,b,pick(WD))};
 let m_cr=crate,m_ba=barrel,m_la=lant,m_rl=rails,m_bn=banner,m_di=dish,m_vi=vine,m_co=cobble;
 if(RQ){
  const _rails=rails;
  m_cr=(x,z,spot)=>{V(x,.6,z,1.7,1.2,1.2,0x9a7a52,0,'wood');const fc=0x6a4a2a;NV(()=>{for(const a of[-1,1])for(const b of[-1,1]){V(x,.6+a*.56,z+b*.56,1.76,.12,.12,fc);V(x+a*.82,.6,z+b*.56,.12,1.24,.12,fc);V(x+a*.82,.6+b*.56,z,.12,.12,1.24,fc)}});
   if(rn()<.5)V(x,1.24,z,1.6,.04,1.1,0x3c4a2e,0,'cloth');K(x,z,1.7,1.2,0,1.2);if(spot!==0)P(x+(spot||0)+1.4,z+.2)};
  m_ba=(x,z)=>{const bc=pick([0x8a2a22,0x2a4a72,0x3f5a2e,0x7a4a26]);V(x,.7,z,1,1.4,1,bc,0,'paint|cyl');NV(()=>{for(const y of[.28,1.12])V(x,y,z,1.04,.07,1.04,0x2a2a2a,0,'metal|cyl');V(x,1.41,z,.94,.03,.94,sh(bc,.75),0,'paint|cyl')});G('metal|cyl',0x777777,x+.2,1.44,z+.15,.12,.05,.12);K(x,z,1,1,0,1.4)};
  m_la=(x,y,z)=>{G('glow|cyl',LANT,x,y,z,.24,.36,.24);G('metal|cone',0x1e1e1e,x,y+.27,z,.36,.18,.36);G('metal|cyl',0x1e1e1e,x,y-.2,z,.2,.05,.2)};
  m_rl=(x0,x1,z0,z1,y,col)=>{_rails(x0,x1,z0,z1,y,col);col=col||0x2e2a28;NV(()=>{for(const yy of[1,.55]){V((x0+x1)/2,y+yy,z0,x1-x0+.3,.08,.08,col);V((x0+x1)/2,y+yy,z1,x1-x0+.3,.08,.08,col);V(x0,y+yy,(z0+z1)/2,.08,.08,z1-z0+.3,col);V(x1,y+yy,(z0+z1)/2,.08,.08,z1-z0+.3,col)}})};
  m_bn=(x,y,z,w,h,face)=>{const a=face==='x',o=.06;V(x,y,z,a?.06:w,h,a?w:.06,0x6e1a1c,0,'cloth');
   for(const yy of[h/2-.2,-h/2+.2])V(x+(a?o:0),y+yy,z+(a?0:o),a?.03:w*.98,.09,a?w*.98:.03,0xc8a040,0,'paint');
   G('paint|cyl',0xc8a040,x+(a?o:0),y+h*.08,z+(a?0:o),w*.42,.03,w*.42,a?0:Math.PI/2,0,a?Math.PI/2:0);G('cloth|cyl',0x6e1a1c,x+(a?o+.02:0),y+h*.08,z+(a?0:o+.02),w*.3,.03,w*.3,a?0:Math.PI/2,0,a?Math.PI/2:0);
   G('wood|cyl',0x5a3f22,x+(a?o:0),y+h/2+.06,z+(a?0:o),.09,w+.4,.09,a?Math.PI/2:0,0,a?0:Math.PI/2)};
  m_di=(x,y,z)=>{HID(()=>V(x,y+.6,z,.4,1.2,.4,0x3a3a3a));G('metal|cyl',0x50555a,x,y+.6,z,.14,1.2,.14);G('metalL|dish',0xdcdedd,x,y+1.5,z,2.4,1.1,2.4,Math.PI-.6);
   G('metal|cyl',0x3a3a3a,x,y+1.95,z+.45,.05,1.1,.05,.75);G('metal|cyl',0x2a2a2a,x,y+2.3,z+.8,.16,.22,.16,.75)};
  m_vi=(x,y,z,a,b)=>{for(let k=0;k<Math.ceil(b/2);k++){const px=x+(rn()-.5)*.4,py=y-k*1.8,pz=z+(rn()-.5)*.4;HID(()=>V(px,py,pz,.9,1.6,.9,0x5aa83a));G('leaf|bush',0,px,py+.3,pz,.42,.75,.42,0,rn()*6)}};
  m_co=(x0,x1,z0,z1)=>V((x0+x1)/2,.06,(z0+z1)/2,x1-x0,.12,z1-z0,0xffffff,0,'cobble');
 }
 const nk=f=>(...a)=>{NK.v=1;try{return f(...a)}finally{NK.v=0}};
 return{V,K,P,G,wx,wz,crate:m_cr,barrel:m_ba,lant:m_la,rails:m_rl,banner:nk(m_bn),dish:(x,y,z)=>{nk(m_di)(x,y,z);K(x,z,.5,.5,y,y+1.3)},mast:(x,y,z,hh)=>{nk(mast)(x,y,z,hh);K(x,z,1.2,1.2,y,y+hh)},vine:nk(m_vi),cobble:nk(m_co),wood,FR,SL,WX,WZ}}
// ---- CASA PEQUENA (imagem 1): pedra, varanda de madeira, janelas com persiana, bandeira, antena e caixas verdes
function fpH(cx,cz,r,x0,x1,z0,z1){const c=[1,0,-1,0][r],s=[0,1,0,-1][r],W=(x,z)=>[cx+x*c+z*s,cz-x*s+z*c],p=W(x0,z0),q=W(x1,z1);FP.push({x0:Math.min(p[0],q[0]),x1:Math.max(p[0],q[0]),z0:Math.min(p[1],q[1]),z1:Math.max(p[1],q[1]),isl:1})}
function houseA(cx,cz,r){fpH(cx,cz,r,-4.5,4.5,-3.5,3.5);const m=mk(cx,cz,r),{V,K,P,wx,wz,crate,barrel,lant,rails,banner,dish,mast,vine,cobble,wood}=m,WN=0x24282c,SC=sh(0x8f8a82,1);
 cobble(-8,6,-4,10);
 V(0,.05,0,8.6,.1,6.6,0x7a5a38);
 for(const x of[-2.5,0,2.5])V(x,.07,0,.08,.04,6.6,0x6a4a28);
 wx(-4.5,4.5,-3.5,4);wz(-3.5,3.5,-4.5,4);wz(-3.5,3.5,4.5,4);wx(-4.5,-3.6,3.5,4);wx(-1.2,4.5,3.5,4);
 for(const [x,z] of[[-4.5,-3.5],[4.5,-3.5],[4.5,3.5],[-4.5,3.5]])V(x,2.2,z,1.1,4.4,1.1,sh(0x77716a,1));
 // porta com moldura e janela com persianas e jardineira
 V(-3.6,2,3.55,.3,4,.8,sh(pick(WD),.75));V(-1.2,2,3.55,.3,4,.8,sh(pick(WD),.75));V(-2.4,3.85,3.55,2.7,.35,.8,sh(pick(WD),.75));
 V(-2.4,3.2,3.4,2.1,.2,.2,LANT,1);
 V(2.2,2.2,3.88,2.6,1.7,.12,WN);V(2.2,2.2,3.82,2.2,1.4,.1,GLOW,1);V(2.2,2.2,3.92,.1,1.5,.1,WN);V(2.2,2.2,3.92,2.3,.1,.1,WN);
 V(.7,2.2,3.92,.6,1.7,.16,0x7a4c28);V(3.7,2.2,3.92,.6,1.7,.16,0x7a4c28);V(2.2,1.3,4.1,3,.2,.5,0x8a5a30);V(2.2,1.6,4.1,2.7,.35,.4,pick(GR));
 V(-2.4,3.45,3.5,3.4,1.1,.7,sh(pick(WD),.8));
 // telhado de pedra com beiral de madeira, caixas e antena
 V(0,4.4,0,10.6,.8,8.6,SC);K(0,0,10.6,8.6,4,4.8);V(0,3.9,0,10.9,.22,8.9,sh(pick(WD),.75));
 rails(-5,5,-4,4,4.8);dish(-2.5,4.8,-1.5);mast(3.4,4.8,-2.6,6.5);
 V(3,5.4,2.4,1.7,1.2,1.2,OL);V(2.4,5.4,2.4,.2,1.25,1.25,0x2a2a2a);V(3.6,5.4,2.4,.2,1.25,1.25,0x2a2a2a);
 V(-3.5,5.3,-2.8,1.2,1,1.2,sh(pick(STN),.9));
 // mobília interna
 V(1.3,.75,-.5,1.8,.12,1.1,0x9a6a3a);for(const dx of[-.7,.7])for(const dz of[-.4,.4])V(1.3+dx,.35,-.5+dz,.14,.7,.14,0x5a3f22);K(1.3,-.5,1.8,1.1,0,.9);
 V(-2,.4,-2.9,3,.8,.6,sh(pick(WD),.8));V(-2,.95,-3.1,3.2,.12,.5,0x7a4c28);lant(-.4,3.4,-3.1);lant(3.2,3.2,2.9);
 // varanda
 for(const x of[-8.8,-1.2]){wood(x,1.95,6.4,.8,3.9,.8);K(x,6.4,.8,.8,0,3.9);lant(x+(x<0&&x>-5?-.7:.7),3.0,5.9)}
 V(-5,.15,5.1,8.6,.3,3.8,0x8a5a30);for(let i=0;i<4;i++)V(-5,3.9,3.6+i*.95+.5,9.4,.55,1.0,sh(pick(WD),.9+i*.04));
 V(-5,.1,7.4,5,.2,1,0x9a6a3a);V(-5,.28,7.0,5,.2,1,0xa87442);
 banner(4.9,2.6,0,1.9,3.2,'x');lant(4.7,3.2,3.1);
 for(const [x,z] of[[-4.6,3.8],[4.6,3.8],[4.6,-3.6],[-4.6,-3.6]])vine(x,3.6,z,0,4);
 for(let x=-8;x<=4;x+=2){V(x,.55,8.4,.3,1.1,.3,0x8a5a30)}V(-2,.9,8.4,12,.15,.15,0x8a5a30);V(-2,.5,8.4,12,.15,.15,0x8a5a30);
 for(const [x,z] of[[-7,9.2],[5.5,5.5]])V(x,.6,z,1.2,1.2,1.2,sh(pick(STN),.9));
 for(const [x,z] of[[5.8,4.6],[-5.9,-2.8],[5.9,-2.4]]){V(x,.75,z,1.5,1.5,1.5,pick(GR));V(x,1.7,z,.9,.6,.9,pick(GR))}
 crate(-7.5,1.8,1);crate(7,1.5,2);crate(6,7.3,2);barrel(7.6,5);barrel(-6.6,-3);
 P(-1,-1.5);P(2,-1.5)}
// ---- PRÉDIO GRANDE (imagem 2): 2 andares com ESCADA, sacada, terraço, torre, bandeira, parabólica e torre de vigia
function houseB(cx,cz,r){fpH(cx,cz,r,-8,8,-5,5);const m=mk(cx,cz,r),{V,K,P,wx,wz,crate,barrel,lant,rails,banner,dish,mast,vine,cobble,wood,FR,SL,WX,WZ}=m,F=4.9,SC=sh(0x8f8a82,1),WN=0x24282c;
 const rl=(x0,x1,z,y)=>{for(let x=x0;x<=x1+.01;x+=1.7)V(x,y+.5,z,.22,1,.22,0x5a3f22);V((x0+x1)/2,y+.95,z,x1-x0,.16,.16,0x7a4c28);V((x0+x1)/2,y+.5,z,x1-x0,.1,.1,0x5a3f22)};
 const win=(x,y,z,s)=>{V(x,y,z+s*.38,2.5,2,.12,WN);V(x,y,z+s*.43,2.1,1.6,.1,GLOW,1);V(x,y,z+s*.48,.1,1.7,.1,WN);V(x,y,z+s*.48,2.2,.1,.1,WN);V(x-1.55,y,z+s*.45,.55,2,.14,0x7a4c28);V(x+1.55,y,z+s*.45,.55,2,.14,0x7a4c28);V(x,y-1.1,z+s*.5,2.8,.2,.5,0x8a5a30)};
 const cu=(x,z)=>{V(x,F+.6,z,1.7,1.2,1.2,OL);V(x-.6,F+.6,z,.2,1.25,1.25,0x2a2a2a);V(x+.6,F+.6,z,.2,1.25,1.25,0x2a2a2a);K(x,z,1.7,1.2,F,F+1.2)};
 cobble(-10,10,-6,12);
 V(0,.05,0,16.4,.1,9.6,0x7a5a38);
 for(const x of[-8,8])for(const z of[-5,5])V(x,2.2,z,1.3,4.4,1.3,sh(0x77716a,1));
 // térreo
 wx(-8,8,-5,4.4);wz(-5,5,-8,4.4);wz(-5,5,8,4.4);wx(-8,-5.6,5,4.4);wx(-3.3,2.3,5,4.4);wx(4.6,8,5,4.4);
 V(-4.45,3.95,5,2.4,.9,.7,sh(pick(WD),.8));V(3.45,3.95,5,2.4,.9,.7,sh(pick(WD),.8));
 for(const x of[-5.6,-3.3,2.3,4.6])V(x,2,5.05,.3,4,.8,sh(pick(WD),.75));
 win(-.5,2.3,5,1);win(6.2,2.3,5,1);win(-4,2.3,-5,-1);win(4,2.3,-5,-1);
 // laje do 2º andar (vão da escada entre x -0.4 e 7.6)
 SL(-8.5,8.5,-5.5,-4.3,F,SC);SL(-8.5,8.5,-2.2,5.5,F,SC);SL(-8.5,-.4,-4.3,-2.2,F,SC);SL(7.6,8.5,-4.3,-2.2,F,SC);
 // ESCADA de madeira (10 degraus) até o 2º andar
 for(let k=0;k<10;k++){const x=-.4+k*.8,t=F*(k+1)/10;NK.v=1;V(x+.4,t/2,-3.25,.8,t,2.1,sh(pick(WD),.9));NK.v=0;FR(x,x+.8,-4.3,-2.2,t);V(x+.4,t+.95,-2.3,.8,.14,.14,0x7a4c28);V(x+.1,t+.45,-2.3,.14,.9,.14,0x5a3f22)}
 rl(-.4,6,-2.25,F);lant(3,3.6,-2.6);lant(-4,3.6,3);lant(5,3.6,3);
 V(-3.2,.55,1.5,2.2,.12,1.2,0x9a6a3a);K(-3.2,1.5,2.2,1.2,0,.7);V(-5.5,.4,-3.5,2.4,.8,.7,sh(pick(WD),.8));
 // 2º andar (sala interna com porta p/ terraço e p/ sacada)
 WX(-1.1,8.1,-4.3,F,4.4);WZ(-4.3,3.3,8.1,F,4.4);WZ(-4.3,.9,-1.1,F,4.4);WX(-1.1,3.4,3.3,F,4.4);WX(4.8,8.1,3.3,F,4.4);
 for(const [x,z] of[[-1.1,-4.3],[8.1,-4.3],[8.1,3.3],[-1.1,3.3]])V(x,F+2.2,z,1.1,4.4,1.1,sh(0x77716a,1));
 V(-1.1,F+3.95,1.95,.7,.9,2.1,sh(pick(WD),.8));V(4.1,F+3.95,3.3,1.6,.9,.7,sh(pick(WD),.8));
 win(1.2,F+2.3,3.3,1);win(6.4,F+2.3,3.3,1);win(2,F+2.3,-4.3,-1);win(5.5,F+2.3,-4.3,-1);
 cu(6.5,2.2);cu(.6,-1.4);V(3.8,F+.55,-.2,2.4,.12,1.3,0x9a6a3a);K(3.8,-.2,2.4,1.3,F,F+.7);lant(3,F+3.4,-3.9);lant(7.2,F+3.4,2.6);
 // telhado + terraço
 V(3.5,9.8,-.5,10.2,.8,8.6,SC);K(3.5,-.5,10.2,8.6,9.3,10.2);rails(-1.4,8.4,-4.6,3.5,10.2);dish(6.5,10.2,-2.5);
 // sacada frontal e terraço esquerdo com guarda-corpo
 rl(-8.3,8.3,5.3,F);{const tr=(xa,xb,za,zb)=>{for(const yy of[.45,.9])V((xa+xb)/2,F+yy,(za+zb)/2,Math.max(.14,xb-xa),.14,Math.max(.14,zb-za),0x2e2a28)},tp=(x,z)=>V(x,F+.5,z,.3,1,.3,0x2e2a28);
 tr(-7.8,-1.2,-4.8,-4.8);tr(-7.8,-1.2,4.8,4.8);tr(-7.8,-7.8,-4.8,4.8);tr(-1.2,-1.2,-4.8,-.2);tr(-1.2,-1.2,3.9,4.8);
 for(const x of[-7.8,-5.6,-3.4,-1.2]){tp(x,-4.8);tp(x,4.8)}for(const z of[-1.6,1.6])tp(-7.8,z);tp(-1.2,-.2);tp(-1.2,3.9);tp(-1.2,-2.5)}
 for(const x of[1,6.5]){V(x,F+.4,4.7,2,.5,.6,0x8a5a30);V(x,F+.85,4.7,1.8,.45,.5,pick(GR))}
 // bloco da torre central-esquerda com bandeira grande
 for(let i=0;i<3;i++)V(-4,5.9+i*2,-1.5,5.4,2.04,5.4,sh(pick(STN),.85+rn()*.2));K(-4,-1.5,5.4,5.4,4.9,11.4);
 V(-4,11.7,-1.5,6.2,.7,6.2,SC);rails(-6.8,-1.2,-4.2,1.2,12.0);mast(-2,12.0,-3.6,5.5);
 for(const x of[-5.6,-3.6]){V(x,8.8,1.3,1.4,1.5,.12,WN);V(x,8.8,1.35,1.1,1.2,.1,GLOW,1)}
 // alpendres de madeira com pilares de pedra e lanternas
 for(let i=0;i<4;i++)V(0,4.15,5.9+i*.7,17.4,.5,.75,sh(pick(WD),.85+i*.05));
 for(const x of[-7.8,-1.5,5.9,7.8]){for(let y=0;y<2;y++)V(x,y*2+1,7.2,1,2.04,1,sh(pick(STN),.9));K(x,7.2,1,1,0,4);lant(x+.8,3.0,6.9)}
 V(0,.15,6.4,17,.3,2.6,0x8a5a30);
 for(const x of[-6.6,-5.6,-4.2,-2.6,3.4,5.2])vine(x,4.2,5.2,0,4);vine(-1,4,7.4,0,4);vine(7.8,4,7.4,0,4);vine(8.5,9.2,0,0,6);vine(-1.1,9.2,-4.3,0,5);
 for(const [x,z] of[[-7,-3.8],[-7,3.4]]){V(x,6,z,.9,2,.9,0x6b4a2a,0,'wood|cyl');V(x,8,z,3.2,2.6,3.2,pick(GR));V(x,9.6,z,2.2,1.2,2.2,0x74c04a)}
 // torre de vigia de madeira
 for(const a of[-2,2])for(const b of[-2,2]){V(-12.5+a,4.5,1+b,.7,9,.7,0x3a2c22);K(-12.5+a,1+b,.9,.9,0,9)}
 for(const y of[2.5,5.5]){V(-12.5,y,-1,4.4,.35,.35,0x4a382a);V(-12.5,y,3,4.4,.35,.35,0x4a382a);V(-14.5,y,1,.35,.35,4.4,0x4a382a);V(-10.5,y,1,.35,.35,4.4,0x4a382a)}
 V(-12.5,9.2,1,5.4,.5,5.4,0x8a5a30);V(-12.5,10.4,1,4.4,2,4.4,0x6a4a2a);K(-12.5,1,5.4,5.4,8.8,12);V(-12.5,10.3,3.25,2.6,.9,.1,GLOW,1);
 rails(-14.8,-10.2,-1.3,3.3,9.5,0x5a3f22);V(-12.5,12.4,1,5.6,.4,5.6,0x8a5a30);V(-12.5,13,1,4,.7,4,0x9a6a3a);V(-12.5,13.6,1,2.4,.6,2.4,0xa87442);
 V(-12.5,15.4,1,.15,3,.15,0x333333);V(-11.9,16.4,1,1.4,.8,.1,0xc0262a);V(-12.5,16.2,1,.4,.4,.4,REDL,1);
 // fachada
 for(const x of[-7.6,-2.6,.4,7.2])crate(x,9.6,0);
 crate(-2,-2,0);crate(5,-2,0);barrel(9.2,7);barrel(-9.4,6.4);
 for(let x=-10;x<=10;x+=4){V(x,.5,11.8,.3,1,.3,0x8a5a30)}V(0,.9,11.8,20,.15,.15,0x8a5a30);V(0,.5,11.8,20,.15,.15,0x8a5a30);
 P(-5,10.6);P(1,9.4);P(5.6,9.6);P(-2,0);P(5,.5);P(-4,-1);
 P(4,-1,F);P(7,1.2,F);P(1,4.3,F);P(-6.5,3.8,F)}
function island(cx,cz,h,ce){if(window.DZR){try{sc.add(DZR.islandRock(cx,cz,h,ISY,ce?40:26,(cx*7+cz*3)|0,ce?LR+.2:0));cb(cx,cz,2*h,2*h,ISY-24,ISY-1.3);return}catch(e){console.warn(e)}}const n=Math.round(h*2/6),cs=h*2/n;
 for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x=cx-h+cs*(i+.5),z=cz-h+cs*(j+.5);if(ce&&Math.hypot(x-cx,z-cz)<LR)continue;vb(x,ISY-.6,z,cs+.02,1.2,cs+.02,sh(pick(GR),.9+rn()*.2))}
 for(let l=0;l<6;l++){const s=2*h*(1-l*.14);vb(cx,ISY-3-3.6*l,cz,s,3.6,s,sh(l%2?pick(ST):pick(DI),.85+rn()*.25))}
 for(let q=0;q<(ce?14:6);q++){const l=(rn()*5)|0,s=2*h*(1-l*.14),a=rn()<.5,e=rn()<.5?-1:1,o=(rn()-.5)*s*.9,w=2+rn()*3;vb(cx+(a?e*s/2:o),ISY-3-3.6*l,cz+(a?o:e*s/2),w,w,w,sh(pick(ST),.9));if(rn()<.5)vb(cx+(a?e*(s/2+.4):o),ISY-3-3.6*l+1.5,cz+(a?o:e*(s/2+.4)),.5,3,.5,0x3f8f2a)}
 cb(cx,cz,2*h,2*h,ISY-24,ISY-1.3)}
function bridge(sx,sz){const rc=(a,b,c,d)=>{const p=[OX+sx*a,OZ+sz*c],q=[OX+sx*b,OZ+sz*d];return[Math.min(p[0],q[0]),Math.max(p[0],q[0]),Math.min(p[1],q[1]),Math.max(p[1],q[1])]};
 const deck=(a,b,c,d)=>{const r=rc(a,b,c,d);BR.push(r);const w=r[1]-r[0],l=r[3]-r[2],cx=(r[0]+r[1])/2,cz=(r[2]+r[3])/2;vb(cx,ISY-.2,cz,w,.4,l,0x8a6238);vb(cx,ISY-.7,cz,w>l?w:.5,.6,w>l?.5:l,0x5a3f22);
  for(let k=0;k<(w>l?w:l);k+=1.6)vb(w>l?r[0]+k+.4:cx,ISY+.01,w>l?cz:r[2]+k+.4,w>l?.08:w,.04,w>l?l:.08,0x6a4a28)};
 const rail=(a,b,c,d)=>{const r=rc(a,b,c,d),w=Math.max(r[1]-r[0],.3),l=Math.max(r[3]-r[2],.3),cx=(r[0]+r[1])/2,cz=(r[2]+r[3])/2;cb(cx,cz,w,l,ISY,ISY+.9);vb(cx,ISY+.85,cz,w,.18,l,0x6a4a28);
  const hz=w>l,N=Math.ceil((hz?w:l)/4);for(let k=0;k<=N;k++){const u=k/N;vb(hz?r[0]+(r[1]-r[0])*u:cx,ISY+.4,hz?cz:r[2]+(r[3]-r[2])*u,.25,.8,.25,0x5a3f22)}};
 deck(34,80.5,23.5,28.5);deck(75.5,80.5,23.5,61);rail(34,80.5,23.5,23.5);rail(34,75.5,28.5,28.5);rail(80.5,80.5,23.5,61);rail(75.5,75.5,28.5,61)}
function fall(x,z,w,d){const y0=1,y1=ISY-1.2;WL.push([x,(y0+y1)/2,z,w,y1-y0,d,0x6cc4ff])}
// ---- ILHA CENTRAL: somente árvore gigante + lago + casas
island(OX,OZ,CH,1);
{const s=SP.length;const RT=!!window.DZR;
 if(RT){try{const tp=DZR.tree(5);const tg=new T.Group();for(const [ge,mt] of tp){const m=new T.Mesh(ge,mt);m.castShadow=true;m.receiveShadow=true;tg.add(m)}tg.scale.setScalar(5.6);tg.position.set(OX,ISY-.6,OZ);sc.add(tg)}catch(e){console.warn(e)}}
 if(!RT)for(let i=0;i<5;i++){const w=7-i*.55;vb(OX,ISY+3+i*6,OZ,w,6,w,sh(0x7a4a26,.8+rn()*.35))}
 cb(OX,OZ,6.4,6.4,ISY,ISY+40);
 for(const [dx,dz] of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const f=dx&&dz?.7:1;for(let k=0;k<3;k++){const r=3.6+k*1.6;if(!RT)vb(OX+dx*r*f,ISY+1.3-k*.35,OZ+dz*r*f,2.4-k*.5,2.6-k*.7,2.4-k*.5,sh(0x6a3f20,.8+rn()*.3));cb(OX+dx*r*f,OZ+dz*r*f,2.4-k*.5,2.4-k*.5,ISY,ISY+2.6-k*.7)}}
 for(let gx=-3;gx<=3;gx++)for(let gy=-1;gy<=1;gy++)for(let gz=-3;gz<=3;gz++){if(!RT&&(gx*5/17)**2+(gy*5.5/10)**2+(gz*5/17)**2<1&&rn()>.08)vb(OX+gx*5+rn()*.6,ISY+38+gy*5.5,OZ+gz*5+rn()*.6,5.4,5.6,5.4,sh(pick(GR),.75+rn()*.5))}
 houseB(OX,OZ-27,0);houseB(OX,OZ+27,2);
 houseA(OX-27,OZ+12,1);houseA(OX-27,OZ-12,1);houseA(OX+27,OZ+12,3);houseA(OX+27,OZ-12,3);
 for(const a of[1,-1]){fall(OX+a*(CH+.6),OZ,1.2,3);const m=(CH+LR)/2;WL.push([OX+a*m,ISY-.45,OZ,CH-LR,.12,3,0x6cc4ff]);fall(OX+a*14,OZ+(CH+.6),3,1.2);fall(OX+a*14,OZ-(CH+.6),3,1.2)}
 SP.central=SP.splice(s)}
// ---- QUATRO ILHAS SECUNDÁRIAS + PONTES
[[-1,1],[1,1],[-1,-1],[1,-1]].forEach((q,i)=>{const cx=OX+q[0]*SO,cz=OZ+q[1]*SO;IS.push({x:cx,z:cz,h:SH});island(cx,cz,SH,0);bridge(q[0],q[1]);const s=SP.length;
 if(i===0)houseB(cx+2,cz-5,0);
 if(i===1){houseA(cx-3,cz-6,0);houseA(cx+3,cz+9,2)}
 if(i===2){houseA(cx-6,cz+5,1);houseA(cx+7,cz-6,3)}
 if(i===3)houseB(cx-2,cz+3,2);
 fall(cx+q[0]*(SH+.6),cz,1.2,3.5);SP['i'+i]=SP.splice(s)});
function merge(list,mat){const n=list.length,bg=new T.BoxGeometry(1,1,1).toNonIndexed(),bp=bg.attributes.position.array,bn=bg.attributes.normal.array,P=new Float32Array(n*108),N=new Float32Array(n*108),C=new Float32Array(n*108),c=new T.Color();
 list.forEach((b,i)=>{c.set(b[6]).convertSRGBToLinear();for(let v=0;v<36;v++){const o=i*108+v*3;P[o]=bp[v*3]*b[3]+b[0];P[o+1]=bp[v*3+1]*b[4]+b[1];P[o+2]=bp[v*3+2]*b[5]+b[2];N[o]=bn[v*3];N[o+1]=bn[v*3+1];N[o+2]=bn[v*3+2];C[o]=c.r;C[o+1]=c.g;C[o+2]=c.b}});
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(P,3));g.setAttribute('normal',new T.BufferAttribute(N,3));g.setAttribute('color',new T.BufferAttribute(C,3));g.computeBoundingSphere();return new T.Mesh(g,mat)}
const grp=new T.Group();
if(!RQ){const m1=merge(L,new T.MeshLambertMaterial({vertexColors:true}));m1.receiveShadow=true;grp.add(m1)}
else{
 // ---------- texturas procedurais (repetem sem emenda) ----------
 const rg=k=>()=>(k=(k*16807)%2147483647)/2147483647;
 const tex=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t};
 const noise=(g,w,h,r,n,a)=>{for(let i=0;i<n;i++){g.fillStyle='rgba('+(r()<.5?'0,0,0':'255,255,255')+','+(r()*a).toFixed(3)+')';g.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}};
 const wrapX=(w,f)=>{f(0);f(-w);f(w)};
 // cantaria: blocos de pedra cortada com argamassa, bordas chanfradas e manchas
 const stoneT=tex(512,512,(g,w,h)=>{const r=rg(91);g.fillStyle='#5a544b';g.fillRect(0,0,w,h);const rows=[64,48,80,56,72,48,80,64];let y=0;
  for(const rh of rows){const n=3+((r()*3)|0),ws=[];let sum=0;for(let i=0;i<n;i++){const v=.6+r();ws.push(v);sum+=v}let x=-r()*120;
   for(const v of ws){const bw=v/sum*w,L_=40+r()*20,hu=28+r()*14,sa=8+r()*14,X=x,Y=y;
    wrapX(w,o=>{const x0=X+o+2,y0=Y+2,bw_=bw-4,bh=rh-4;if(x0+bw_<0||x0>w)return;g.save();g.beginPath();g.rect(x0,y0,bw_,bh);g.clip();
     const gr=g.createLinearGradient(x0,y0,x0+bw_*.4,y0+bh);gr.addColorStop(0,'hsl('+hu+','+sa+'%,'+(L_+6)+'%)');gr.addColorStop(1,'hsl('+hu+','+sa+'%,'+(L_-6)+'%)');g.fillStyle=gr;g.fillRect(x0,y0,bw_,bh);
     const rr=rg(Math.abs((X*7+Y*13)|0)%2147483646+1);for(let i=0;i<10;i++){const cx_=x0+rr()*bw_,cy_=y0+rr()*bh,rd=10+rr()*30,gg=g.createRadialGradient(cx_,cy_,0,cx_,cy_,rd);gg.addColorStop(0,'rgba('+(rr()<.5?'50,44,36':'240,232,220')+','+(.05+rr()*.07).toFixed(3)+')');gg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gg;g.fillRect(cx_-rd,cy_-rd,rd*2,rd*2)}
     if(rr()<.25){const sg=g.createLinearGradient(0,y0+bh*.4,0,y0+bh);sg.addColorStop(0,'rgba(60,70,40,0)');sg.addColorStop(1,'rgba(60,70,40,.28)');g.fillStyle=sg;g.fillRect(x0,y0,bw_,bh)}
     for(let i=0;i<bw_*bh/40;i++){g.fillStyle='rgba('+(rr()<.5?'0,0,0':'255,255,255')+','+(rr()*.12).toFixed(3)+')';g.fillRect(x0+rr()*bw_,y0+rr()*bh,1+rr()*2,1+rr()*2)}
     g.fillStyle='rgba(255,250,240,.16)';g.fillRect(x0,y0,bw_,2);g.fillRect(x0,y0,2,bh);g.fillStyle='rgba(0,0,0,.30)';g.fillRect(x0,y0+bh-3,bw_,3);g.fillRect(x0+bw_-3,y0,3,bh);g.restore()});
    x+=bw}y+=rh}
  noise(g,w,h,r,6000,.08)});
 // tábuas de madeira com veios, nós e emendas (veio ao longo de v)
 const woodT=tex(256,512,(g,w,h)=>{const r=rg(37);const pw=w/4;
  for(let i=0;i<4;i++){const L_=62+r()*12;g.fillStyle='hsl('+(30+r()*8)+',22%,'+L_+'%)';g.fillRect(i*pw,0,pw,h);
   for(let k=0;k<26;k++){const x0=i*pw+r()*pw,am=1+r()*3,ph=r()*6.28,fq=(1+((r()*3)|0));g.strokeStyle='rgba(70,45,25,'+(.08+r()*.18).toFixed(3)+')';g.lineWidth=.6+r()*1.4;g.beginPath();for(let y=0;y<=h;y+=8){const xx=x0+Math.sin(y/h*6.283*fq+ph)*am;y?g.lineTo(xx,y):g.moveTo(xx,y)}g.stroke()}
   if(r()<.7){const kx=i*pw+pw*(.3+r()*.4),ky=r()*h;for(let q=4;q>0;q--){g.strokeStyle='rgba(60,35,18,'+(.15+q*.05)+')';g.lineWidth=1.2;g.beginPath();g.ellipse(kx,ky,q*2.2,q*5,0,0,7);g.stroke()}}
   const j=r()*h;g.fillStyle='rgba(30,18,10,.55)';g.fillRect(i*pw,j,pw,2);
   g.fillStyle='rgba(25,15,8,.6)';g.fillRect(i*pw,0,2,h);g.fillStyle='rgba(255,240,220,.12)';g.fillRect(i*pw+2,0,1,h)}
  noise(g,w,h,r,3000,.07)});
 // calçamento de paralelepípedos
 const cobT=tex(512,512,(g,w,h)=>{const r=rg(55);g.fillStyle='#4a453d';g.fillRect(0,0,w,h);const n=11,cs=w/n;
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const cx=(i+.5+(r()-.5)*.25)*cs,cy=(j+.5+(r()-.5)*.25)*cs,rx=cs*(.4+r()*.06),ry=cs*(.4+r()*.06),L_=30+r()*16,hu=25+r()*20,an=r()*.6;
   for(const ox of[-w,0,w])for(const oy of[-h,0,h]){const X=cx+ox,Y=cy+oy;if(X<-cs||X>w+cs||Y<-cs||Y>h+cs)continue;const gr=g.createRadialGradient(X-rx*.3,Y-ry*.3,1,X,Y,rx*1.1);gr.addColorStop(0,'hsl('+hu+',10%,'+(L_+12)+'%)');gr.addColorStop(1,'hsl('+hu+',8%,'+(L_-10)+'%)');g.fillStyle=gr;g.beginPath();g.ellipse(X,Y,rx,ry,an,0,7);g.fill()}}
  noise(g,w,h,r,9000,.1)});
 const lc=c=>new T.Color(c).convertSRGBToLinear();
 const SM=(o)=>new T.MeshStandardMaterial(Object.assign({vertexColors:true,roughness:.85,metalness:0},o));
 const MATS={stone:SM({map:stoneT,bumpMap:stoneT,bumpScale:.045,roughness:.93}),cobble:SM({map:cobT,bumpMap:cobT,bumpScale:.05,roughness:.95}),wood:SM({map:woodT,bumpMap:woodT,bumpScale:.015,roughness:.8}),
  metal:SM({metalness:.6,roughness:.42}),metalL:SM({metalness:.45,roughness:.32,side:T.DoubleSide}),paint:SM({roughness:.55,metalness:.15}),cloth:SM({roughness:1,side:T.DoubleSide}),
  int:SM({roughness:1,emissive:lc(0x1c1208)}),glow:new T.MeshBasicMaterial({vertexColors:true}),leaf:DZR.mats().leaf};
 const UVM={stone:['w',1/2.6],cobble:['w',1/3.2],wood:['b',1/.9,1/3]};
 const C3=new T.Color(),hsl={},M4=new T.Matrix4(),N3=new T.Matrix3(),Q=new T.Quaternion(),E=new T.Euler(),VP=new T.Vector3(),VS=new T.Vector3(),vv=new T.Vector3(),nn=new T.Vector3();
 const GEO={box:new T.BoxGeometry(1,1,1).toNonIndexed(),cyl:new T.CylinderGeometry(.5,.5,1,16).toNonIndexed(),cone:new T.ConeGeometry(.5,1,12).toNonIndexed(),dish:new T.SphereGeometry(.5,20,6,0,6.2832,0,1.0).toNonIndexed(),bush:DZR.bushGeo()};
 const cls=c=>{if(c===OL)return'paint';C3.setHex(c).getHSL(hsl);const hd=hsl.h*360,s_=hsl.s,l_=hsl.l;
  if(s_>.2&&s_<.62&&hd>=15&&hd<=48&&l_<.6)return'wood';if(s_>.3&&hd>70&&hd<160)return'leaf';if(s_>.35)return'paint';if(l_<.3)return'metal';return'stone'};
 const tint=(k,c)=>{if(k==='leaf')return[.72+rn()*.2,.82+rn()*.15,.58+rn()*.2];if(k==='cobble')return[.85,.83,.8];C3.setHex(c);
  if(k==='stone'){const l_=(C3.r+C3.g+C3.b)/3,f=Math.min(1.08,Math.max(.8,1+(l_/.56-1)*.35));return[f,f*.99,f*.97]}C3.convertSRGBToLinear();
  if(k==='wood'){const l_=(C3.r+C3.g+C3.b)/3;return[C3.r,C3.g,C3.b].map(v=>Math.min(1,(v*.65+l_*.35)*1.6))}return[C3.r,C3.g,C3.b]};
 const BK={},add=(k,gk,t,x,y,z,sx,sy,sz,rx,ry,rz)=>(BK[k]||(BK[k]=[])).push([gk,t,x,y,z,sx,sy,sz,rx||0,ry||0,rz||0,rn()*4]);
 for(const b of L){let [k,gk]=b[7]?b[7].split('|'):[cls(b[6])];gk=gk||'box';const t=tint(k,b[6]);
  if(k==='leaf'&&gk==='box'){const nx=Math.max(1,Math.round(b[3]/1.4)),ny=Math.max(1,Math.round(b[4]/1.6)),nz=Math.max(1,Math.round(b[5]/1.4));
   for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)for(let q=0;q<nz;q++){const cx=b[0]-b[3]/2+(i+.5)*b[3]/nx,cy=b[1]-b[4]/2+(j+.5)*b[4]/ny,cz=b[2]-b[5]/2+(q+.5)*b[5]/nz;
    add('leaf','bush',tint('leaf'),cx+(rn()-.5)*.2,cy,cz+(rn()-.5)*.2,Math.max(.4,b[3]/nx/2),Math.max(.32,b[4]/ny/1.5),Math.max(.4,b[5]/nz/2),0,rn()*6.3)}continue}
  add(k,gk,t,b[0],b[1],b[2],b[3],b[4],b[5])}
 for(const e of PR){const [k,gk]=e[0].split('|');add(k,gk||'box',tint(k,e[1]),e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9],e[10])}
 for(const k in BK){const it=BK[k],um=UVM[k];let n=0;for(const e of it)n+=GEO[e[0]].attributes.position.count;
  const P_=new Float32Array(n*3),N_=new Float32Array(n*3),U_=new Float32Array(n*2),C_=new Float32Array(n*3);let o=0;
  for(const e of it){const g=GEO[e[0]],gp=g.attributes.position,gn=g.attributes.normal,gu=g.attributes.uv,gc=g.attributes.color,bx=e[0]==='box';
   M4.compose(VP.set(e[2],e[3]-ISY,e[4]),Q.setFromEuler(E.set(e[8],e[9],e[10],'YXZ')),VS.set(e[5],e[6],e[7]));N3.getNormalMatrix(M4);
   for(let i=0;i<gp.count;i++,o++){vv.fromBufferAttribute(gp,i).applyMatrix4(M4);nn.fromBufferAttribute(gn,i).applyMatrix3(N3).normalize();
    P_[o*3]=vv.x;P_[o*3+1]=vv.y;P_[o*3+2]=vv.z;N_[o*3]=nn.x;N_[o*3+1]=nn.y;N_[o*3+2]=nn.z;let u=gu?gu.getX(i):0,v=gu?gu.getY(i):0;
    if(um&&bx){if(um[0]==='w'){const ax=Math.abs(nn.x),ay=Math.abs(nn.y),az=Math.abs(nn.z);if(ay>.7){u=vv.x;v=vv.z}else if(ax>az){u=vv.z;v=vv.y}else{u=vv.x;v=vv.y}u*=um[1];v*=um[1]}
     else{const lx=Math.abs(gn.getX(i)),ly=Math.abs(gn.getY(i));let du,dv;if(lx>.5){du=e[7];dv=e[6]}else if(ly>.5){du=e[5];dv=e[7]}else{du=e[5];dv=e[6]}let a_=u*du,b_=v*dv;if(du>dv){const t_=a_;a_=b_;b_=t_}u=a_*um[1]+e[11];v=b_*um[2]+e[11]*1.7}}
    else if(um&&!bx){u*=Math.max(1,e[5]*3.14*um[1]);v*=Math.max(1,e[6]*um[2]||1)}
    U_[o*2]=u;U_[o*2+1]=v;const sh_=gc?gc.getX(i):1;C_[o*3]=e[1][0]*sh_;C_[o*3+1]=e[1][1]*sh_;C_[o*3+2]=e[1][2]*sh_}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(P_,3));geo.setAttribute('normal',new T.BufferAttribute(N_,3));geo.setAttribute('uv',new T.BufferAttribute(U_,2));geo.setAttribute('color',new T.BufferAttribute(C_,3));geo.computeBoundingSphere();
  const me=new T.Mesh(geo,MATS[k]||MATS.paint);me.position.y=ISY;me.castShadow=k!=='glow'&&k!=='int';me.receiveShadow=true;grp.add(me)}
 // vidraças quebráveis (mesmo sistema das casas da cidade)
 if(window.DZW){const by={};for(const w of GLS){const key=w[4]+'x'+w[5];(by[key]||(by[key]=[])).push(w)}const gg=new T.Group();sc.add(gg);
  for(const key in by){const a=by[key];DZW.add(gg,a.map(w=>[w[0],w[1],w[2],w[3]]),a[0][4],a[0][5])}}
}
grp.add(merge(LE,new T.MeshBasicMaterial({vertexColors:true})));
grp.add(merge(WL,window.DZR?DZR.fallMat():new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.7,depthWrite:false})));
const wm=window.DZR?DZR.waterMat(new T.MeshStandardMaterial({transparent:true,opacity:.85})):new T.MeshBasicMaterial({color:new T.Color(0x2a9df4).convertSRGBToLinear(),transparent:true,opacity:.78});
const lake=new T.Mesh(new T.CylinderGeometry(LR,LR,.1,16),wm);lake.position.set(OX,ISY-.5,OZ);grp.add(lake);
const bed=new T.Mesh(new T.CylinderGeometry(LR+.3,LR+.3,.1,16),new T.MeshLambertMaterial({color:new T.Color(0xcdb98a).convertSRGBToLinear()}));bed.position.set(OX,ISY-1.15,OZ);grp.add(bed);
const isl=new T.Mesh(new T.CylinderGeometry(IR,IR,1.2,24),window.DZR&&DZR._islandGrass?DZR._islandGrass:new T.MeshLambertMaterial({color:new T.Color(0x5aa83a).convertSRGBToLinear()}));isl.position.set(OX,ISY-.6,OZ);grp.add(isl);
sc.add(grp);
// ---- LOOT PREMIUM
const PT=['sniper','sniper','rifle','rifle','rifle','shotgun','shotgun','pistol','scope8','scope2','sil','ammo','ammo','ammo','ammo','vest','vest','helm','helm','bp3','bp3','bp2','med','med','gren','gren','smoke'];
function mkP(t,x,z){if(WS[t]&&t!=='bow'){const m=WS[t].mag;mkLoot(t,x,z,{mag:m,res:m*4},(t==='rifle'||t==='sniper')?2:0,t==='shotgun'?0:1)}else mkLoot(t,x,z)}
function fixSp(p){const y=ISY+(p[2]||0),ok=(x,z)=>{for(const b of near(x,z)){if(b.off)continue;if(b.yt!==undefined&&(y>=b.yt-.05||y+1.9<=b.yb))continue;const cx=Math.max(b.x0,Math.min(x,b.x1)),cz=Math.max(b.z0,Math.min(z,b.z1));if(Math.hypot(x-cx,z-cz)<.75)return false}return Math.abs(GY(x,z,y+.01)-y)<.2};
 if(ok(p[0],p[1]))return;for(let r=.3;r<=5;r+=.3)for(let k=0;k<20;k++){const a=k*Math.PI/10,x=p[0]+Math.cos(a)*r,z=p[1]+Math.sin(a)*r;if(ok(x,z)){p[0]=x;p[1]=z;return}}}
function spawnArch(){const gu=['vest','helm','bp3','sniper','rifle','scope8','ammo','med'];mkLoot.y=ISY;
 try{for(const k of Object.keys(SP).filter(k=>k==='central'||k[0]==='i')){const sp=SP[k].slice().sort(()=>rn()-.5);sp.forEach((p,i)=>{fixSp(p);mkLoot.y=ISY+(p[2]||0);const t=i<gu.length&&(k==='central'||i<4)?gu[i]:pick(PT);if(t==='vest'||t==='helm')mkLoot(t,p[0],p[1],{d:100});else mkP(t,p[0],p[1])})}}finally{mkLoot.y=undefined}}
spawnArch();
const _rg=regenLoot;regenLoot=function(){_rg();spawnArch()};
{const bm=new T.Mesh(new T.CylinderGeometry(2.5,2.5,520,8,1,true),new T.MeshBasicMaterial({color:0x58c8ff,transparent:true,opacity:.28,fog:false,depthWrite:false,side:T.DoubleSide}));bm.position.set(OX,260,OZ);bm.frustumCulled=false;sc.add(bm);
 const lb=new T.Mesh(new T.SphereGeometry(5,10,8),new T.MeshBasicMaterial({color:0x9be3ff,fog:false}));lb.position.set(OX,ISY+60,OZ);sc.add(lb)}
{const b=document.createElement('button');b.textContent='🏝 Saltar no Arquipélago';b.style.cssText='position:fixed;right:12px;top:34%;z-index:60;padding:12px 14px;border:2px solid #ffd34d;border-radius:12px;background:rgba(10,20,32,.85);color:#ffd34d;font:700 14px sans-serif;display:none';
 b.onclick=()=>{if(mode!=='plane')return;pS={x:OX-pD.x*55*gt,z:OZ+3-pD.z*55*gt};jumpOut();say('Rumo ao Arquipélago! Abra o paraquedas sobre a ilha central',5)};document.body.appendChild(b);
 setInterval(()=>{try{b.style.display=(mode==='plane'&&gt>3)?'block':'none'}catch(e){}},300)}
window.DZ_ARCH={ISY,OX,OZ,GY:(x,z,y)=>GY(x,z,y),spots:SP,boxes:L.length+LE.length};
}catch(e){console.error('Arquipélago falhou',e)}})();
