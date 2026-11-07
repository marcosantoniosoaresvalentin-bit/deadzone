/* Deadzone · world/buildings.js
 * Gerador de construções (fachadas, janelas, interiores) e quarteirões.
 */
// texturas e materiais de construção
const plT=window.DZR?DZR.plasterTex(2,1):ctex(256,256,(g,w,h)=>{g.fillStyle='#ece8e0';g.fillRect(0,0,w,h);for(let i=0;i<3500;i++){g.fillStyle='rgba('+(R(0,1)<.5?'0,0,0':'255,255,255')+','+R(.02,.08)+')';g.fillRect(R(0,w),R(0,h),R(1,4),R(1,4))}},2,1);
const brT=ctex(256,256,(g,w,h)=>{g.fillStyle='#b8b0a4';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let x=0;x<w;x+=32){const o=(y/16%2)*16;g.fillStyle='hsl(12,'+R(35,50)+'%,'+R(32,46)+'%)';g.fillRect(x+o+1,y+1,30,14)}},2,1);
const mtT=ctex(128,128,(g,w,h)=>{g.fillStyle='#bbb';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=8){g.fillStyle='rgba(0,0,0,.22)';g.fillRect(x,0,3,h);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x+3,0,2,h)}},3,1);
const cnT=ctex(256,256,(g,w,h)=>{g.fillStyle='#b9b9b4';g.fillRect(0,0,w,h);for(let i=0;i<4000;i++){g.fillStyle='rgba('+(R(0,1)<.5?'0,0,0':'255,255,255')+','+R(.03,.1)+')';g.fillRect(R(0,w),R(0,h),R(1,3),R(1,3))}g.fillStyle='rgba(0,0,0,.12)';for(let y=64;y<h;y+=64)g.fillRect(0,y,w,2)},2,1);
const wdT=ctex(256,256,(g,w,h)=>{for(let x=0;x<w;x+=32){g.fillStyle='hsl(28,'+R(35,50)+'%,'+R(30,42)+'%)';g.fillRect(x,0,31,h)}},3,3);
const rfT=ctex(256,256,(g,w,h)=>{g.fillStyle='#9a9a9a';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let x=0;x<w;x+=32){const o=(y/16%2)*16;g.fillStyle='rgba(0,0,0,'+R(.05,.35)+')';g.fillRect(x+o,y,30,14)}},4,3);
const PAL={house:[0xe8d9b8,0xd9a27a,0xb8cfe0,0xe0b8b8,0xcfe0b8],villa:[0xf0e6d2,0xd8c3a5,0xc9d6c0],apartment:[0xcfcfc8,0xbfb5a5,0xa9b4bd],shop:[0xd9b36a,0x9ec1b0,0xc87a6a,0x8fa8c8],warehouse:[0x8a9aa8,0x9a8f80,0x6f8a73],church:[0xf2efe6]};
const VT=(c,k)=>({c:lin(c),k:k||0});
const TRIM=VT(0xf2f0ea),GLASS=VT(0x6a8fa8,1),DOORM=VT(0x4a301c),DARK=VT(0x1e1e1e),CEIL=VT(0xeeeae0),FLM=VT(0x9b7a52),FLC=VT(0x77777a),LAMP=VT(0xffe2b0,2),WOOD=VT(0x7a5330),FAB=[VT(0x5a6f8a),VT(0x8a5a5a),VT(0x6f7f5a)],CRATE=VT(0x8a6a3a),CONC=VT(0xa8a8a2),SIGN=[VT(0xb03030),VT(0x2a5a9a),VT(0x2a8a4a)],ROOFM=[0xa8432f,0x6b4a2b,0x3d5a80,0x5a5f66].map(c=>VT(c,window.DZR?3:0)),FLATM=VT(0x55575a),BRK=window.DZR?VT(0xf2e6dc,4):VT(0xa8523f),BRKW=window.DZR?VT(0xf0e2d6,4):null;
const VM=[new T.MeshStandardMaterial({vertexColors:true,map:plT,roughness:.9}),new T.MeshStandardMaterial({vertexColors:true,metalness:.7,roughness:.15}),new T.MeshBasicMaterial({vertexColors:true})];if(window.DZR){VM[3]=DZR.roofMat();VM[4]=DZR.brickMat()}
const WFG=new T.BoxGeometry(1.5,1.4,.1),WGG=new T.BoxGeometry(1.2,1.1,.14),WBK=new T.BoxGeometry(1.22,1.12,.01),SILX=new T.BoxGeometry(1.7,.07,.16),SILZ=new T.BoxGeometry(.16,.07,1.7),SHX=new T.BoxGeometry(.55,1.38,.05),SHZ=new T.BoxGeometry(.05,1.38,.55),SHUTC=[0x2f5a3a,0x5a3a24,0x3a4f6a,0x6a6f74].map(c=>VT(c)),ACU=VT(0xd8d8d2),roofG=new T.ConeGeometry(.7071,1,4);roofG.rotateY(Math.PI/4);
const SPEC={house:{w:[9,12],d:[8,10],H:3.4,rh:2.4,rows:[1.6]},villa:{w:[12,15],d:[10,12],H:6.4,rh:2.8,rows:[1.6,4.6]},apartment:{w:[16,22],d:[12,15],H:11.2,rows:[1.6,4.6,7.6,10]},shop:{w:[10,14],d:[9,11],H:4.2,rows:[]},warehouse:{w:[22,30],d:[14,18],H:7.5,rh:2.2,rows:[5.4]},church:{w:[12,13],d:[22,24],H:7,rh:3,rows:[2.4,5]}};
function mkBld(o){const{x,z,w,d,th,type}=o,S=SPEC[type],H=S.H,items=[],A=(a,b,c,m,px,py,pz,rx)=>items.push([new T.BoxGeometry(a,b,c),m,px,py,pz,rx]),Tn=.3,DW=1.3,DH=2.2,hz=d/2,dc=R(-w/2+2.2,w/2-2.2),pa=PAL[type],col=pa[Math.floor(R(0,pa.length))];
 const wm=type==='church'?BRK:(BRKW&&(type==='house'||type==='villa'||type==='warehouse'||type==='shop')&&Math.random()<.3)?BRKW:VT(col),cs=Math.cos(th),sn=Math.sin(th),WX=(a,b)=>x+a*cs+b*sn,WZ=(a,b)=>z-a*sn+b*cs;
 const wbox=(a,b,c,e,ex)=>{const xs=[WX(a,c),WX(a,e),WX(b,c),WX(b,e)],zs=[WZ(a,c),WZ(a,e),WZ(b,c),WZ(b,e)];const o_=Object.assign({x0:Math.min(...xs),x1:Math.max(...xs),z0:Math.min(...zs),z1:Math.max(...zs),w:1,top:H+(S.rh||0)+1.5},ex);if(!o_.h&&o_.yt===undefined){o_.yb=0;o_.yt=(ex&&ex.top)?ex.top:H}return addBox(o_)};
 A(w,H,Tn,wm,0,H/2,-hz+Tn/2);A(Tn,H,d,wm,-w/2+Tn/2,H/2,0);A(Tn,H,d,wm,w/2-Tn/2,H/2,0);
 const fl=dc-DW/2+w/2,fr=w/2-dc-DW/2;A(fl,H,Tn,wm,-w/2+fl/2,H/2,hz-Tn/2);A(fr,H,Tn,wm,w/2-fr/2,H/2,hz-Tn/2);A(DW,H-DH,Tn,wm,dc,DH+(H-DH)/2,hz-Tn/2);
 A(.1,DH,.4,TRIM,dc-DW/2-.05,DH/2,hz-Tn/2);A(.1,DH,.4,TRIM,dc+DW/2+.05,DH/2,hz-Tn/2);A(DW+.2,.1,.4,TRIM,dc,DH+.05,hz-Tn/2);
 wbox(-w/2,w/2,-hz,-hz+Tn);wbox(-w/2,-w/2+Tn,-hz,hz);wbox(w/2-Tn,w/2,-hz,hz);wbox(-w/2,dc-DW/2,hz-Tn,hz);wbox(dc+DW/2,w/2,hz-Tn,hz);
 const db=wbox(dc-DW/2,dc+DW/2,hz-Tn,hz);
 A(w-.2,.1,d-.2,type==='warehouse'?FLC:FLM,0,0,0);A(w,.2,d,CEIL,0,3,0);
 const GL_=[],DZW_=!!window.DZW,SHT=(type==='house'||type==='villa')&&Math.random()<.6?SHUTC[Math.floor(R(0,SHUTC.length))]:null;
 const win=(px,py,pz,ry)=>{items.push([WFG,TRIM,px,py,pz,0,ry,0]);if(!DZW_){items.push([WGG,GLASS,px,py,pz,0,ry,0]);return}
  const sd=ry?(px>0?1:-1):(pz>0?1:-1),nx=ry?sd:0,nz=ry?0:sd,ax=ry?0:1,az=ry?1:0;
  items.push([WBK,VT(0x161b20,2),px+nx*.058,py,pz+nz*.058,0,ry,0]);GL_.push([px+nx*.07,py,pz+nz*.07,ry]);
  items.push([ry?SILZ:SILX,TRIM,px+nx*.1,py-.74,pz+nz*.1]);items.push([ry?SILZ:SILX,TRIM,px+nx*.06,py+.74,pz+nz*.06]);
  if(SHT)for(const k of[-1,1])items.push([ry?SHZ:SHX,SHT,px+ax*k*1.05+nx*.08,py,pz+az*k*1.05+nz*.08])};
 for(const ry of S.rows){const up=ry>2;
  for(let px=-w/2+2;px<=w/2-1.9;px+=3.4){if(!up&&Math.abs(px-dc)<1.7)continue;win(px,ry,hz+.03,0);win(px,ry,-hz-.03,0);if(up&&(type==='villa'||type==='apartment')){A(1.9,.12,.9,CONC,px,ry-.75,hz+.45);if(DZW_){A(1.9,.05,.05,DARK,px,ry+.22,hz+.88);for(const k of[-1,1])A(.05,.05,.9,DARK,px+k*.93,ry+.22,hz+.45);for(let k=0;k<5;k++)A(.04,.95,.04,DARK,px-.9+k*.45,ry-.25,hz+.88)}}
   else if(DZW_&&up&&type==='apartment'&&Math.random()<.3)A(.8,.5,.4,ACU,px+.2,ry-1.05,hz+.22)}
  for(let pz=-hz+2;pz<=hz-1.9;pz+=3.4){win(w/2+.03,ry,pz,Math.PI/2);win(-w/2-.03,ry,pz,Math.PI/2)}}
 if(type==='house'||type==='villa'||type==='warehouse'){RFL.push({x:x,z:z,cs:cs,sn:sn,r:Math.hypot(w,d)/2+4,f:[{k:'p',ox:0,oz:0,hw:w*.56,hd:d*.56,base:H,hh:S.rh}]});const rm=ROOFM[Math.floor(R(0,4))],g_=roofG.clone();g_.scale(w*1.12,S.rh,d*1.12);items.push([g_,type==='warehouse'?VT(0x6b7078):rm,0,H+S.rh/2,0])}
 else if(type==='church'){RFL.push({x:x,z:z,cs:cs,sn:sn,r:Math.hypot(w,d)/2+8,f:[{k:'p',ox:0,oz:0,hw:w*.55,hd:d*.525,base:H,hh:S.rh},{k:'p',ox:-w/2+2,oz:hz+1,hw:2.5,hd:2.5,base:14,hh:4.5}]});const g_=roofG.clone();g_.scale(w*1.1,S.rh,d*1.05);items.push([g_,ROOFM[1],0,H+S.rh/2,0]);A(4,14,4,BRK,-w/2+2,7,hz+1);const g2=roofG.clone();g2.scale(5,4.5,5);items.push([g2,ROOFM[3],-w/2+2,16.2,hz+1]);wbox(-w/2,-w/2+4,hz-1,hz+3,{top:14});A(.2,2,.2,TRIM,-w/2+2,19.2,hz+1);A(1,.2,.2,TRIM,-w/2+2,19.6,hz+1)}
 else{A(w+.4,.3,d+.4,FLATM,0,H+.15,0);A(w+.4,.9,.25,CONC,0,H+.7,hz+.1);A(w+.4,.9,.25,CONC,0,H+.7,-hz-.1);A(.25,.9,d,CONC,w/2+.1,H+.7,0);A(.25,.9,d,CONC,-w/2-.1,H+.7,0);const pxx=R(-w/4,w/4);A(1.6,1,1.6,CONC,pxx,H+.8,-d/4);
  {const PY={yb:H+.3,yt:H+1.2};wbox(-w/2-.2,w/2+.2,hz-.025,hz+.225,PY);wbox(-w/2-.2,w/2+.2,-hz-.225,-hz+.025,PY);wbox(w/2-.025,w/2+.225,-hz-.2,hz+.2,PY);wbox(-w/2-.225,-w/2+.025,-hz-.2,hz+.2,PY);wbox(pxx-.8,pxx+.8,-d/4-.8,-d/4+.8,{yb:H+.3,yt:H+1.3})}
  RFL.push({x:x,z:z,cs:cs,sn:sn,r:Math.hypot(w,d)/2+4,f:[{k:'f',ox:0,oz:0,hw:w/2+.2,hd:d/2+.2,base:H+.3,hh:0}]});
  if(type==='shop'){const sg=SIGN[Math.floor(R(0,3))];A(3.6,.9,.3,sg,dc,3.7,hz+.1);A(3.6,.08,1.6,sg,dc,2.9,hz+.8,.25);for(const sx of[-1,1]){const gx=dc+sx*(DW/2+1.6);if(gx>-w/2+1&&gx<w/2-1)win(gx,1.6,hz+.03,0)}}}
 if(DZW_){const PL=VT(0x5f5b55),pb=.5;
  A(w+.08,pb,.06,PL,0,pb/2,-hz-.03);A(.06,pb,d+.08,PL,-w/2-.03,pb/2,0);A(.06,pb,d+.08,PL,w/2+.03,pb/2,0);
  if(fl>.05)A(fl+.04,pb,.06,PL,-w/2+fl/2-.02,pb/2,hz+.03);if(fr>.05)A(fr+.04,pb,.06,PL,w/2-fr/2+.02,pb/2,hz+.03);
  for(const ry of S.rows)if(ry>2){const y=ry-1.5;A(w+.12,.14,.07,TRIM,0,y,hz+.035);A(w+.12,.14,.07,TRIM,0,y,-hz-.035);A(.07,.14,d+.12,TRIM,w/2+.035,y,0);A(.07,.14,d+.12,TRIM,-w/2-.035,y,0)}
  if(type!=='church'&&type!=='warehouse'){A(.06,.14,d+.12,TRIM,w/2+.04,H-.07,0);A(.06,.14,d+.12,TRIM,-w/2-.04,H-.07,0);A(w+.12,.14,.06,TRIM,0,H-.07,hz+.04);A(w+.12,.14,.06,TRIM,0,H-.07,-hz-.04)}
  A(DW+.7,.16,.8,CONC,dc,.08,hz+.4);
  if(type==='house'||type==='villa'||type==='shop')A(DW+1,.07,.95,ROOFM[Math.floor(R(0,4))],dc,DH+.42,hz+.45,.22);
  if(type==='house'||type==='villa'||type==='warehouse')for(const k of[-1,1])A(.09,H,.09,DARK,k*(w/2+.06),H/2,hz+.07);
  if(type==='house'||type==='villa'){const cx_=R(-w/4,w/4),cz_=R(-d/6,d/6),ch=S.rh*.75+1;A(.75,ch,.75,BRKW||CONC,cx_,H+ch/2,cz_);A(.95,.12,.95,DARK,cx_,H+ch+.06,cz_)}}
 if(type==='warehouse')A(5,4.5,.25,DARK,-w/4,2.3,hz+.12);
 A(.6,.05,.6,LAMP,0,2.85,0);LAMPS.push({x:WX(0,0),y:2.7,z:WZ(0,0)});if(w>16){for(const sx of[-1,1]){A(.6,.05,.6,LAMP,sx*w/4,2.85,0);LAMPS.push({x:WX(sx*w/4,0),y:2.7,z:WZ(sx*w/4,0)})}}
 const fz=hz-2.2,iw=w/2-1,nF=type==='apartment'?4:3,fa=FAB[Math.floor(R(0,3))];
 if(type==='warehouse')for(let k=0;k<5;k++){const px=R(-iw,iw),pz=R(-hz+1.5,fz-1),s_=R(1,1.5);A(s_,s_,s_,CRATE,px,s_/2+.05,pz);wbox(px-s_/2,px+s_/2,pz-s_/2,pz+s_/2,{h:s_+.1})}
 else if(type==='shop'){A(w-5,1.1,.8,WOOD,0,.6,-hz+3);wbox(-(w-5)/2,(w-5)/2,-hz+2.6,-hz+3.4,{h:1.2});for(const sx of[-1,1]){A(.5,2,d-5,WOOD,sx*(w/2-.8),1.05,-1);wbox(sx*(w/2-.8)-.25,sx*(w/2-.8)+.25,-hz+1.5,hz-3.5,{h:2.1})}}
 else if(type==='church'){for(let k=0;k<4;k++)for(const sx of[-1,1]){A(3,.9,.6,WOOD,sx*3,.5,-hz+4+k*3);wbox(sx*3-1.5,sx*3+1.5,-hz+3.7+k*3,-hz+4.3+k*3,{h:1})}A(3,1,1,CONC,0,.55,-hz+1.5);}
 else for(let k=0;k<nF;k++){const px=R(-iw,iw),pz=R(-hz+1,fz),q=k%3;if(q===0){A(1.4,.8,.9,WOOD,px,.45,pz);A(.45,.9,.45,WOOD,px-1,.5,pz);A(.45,.9,.45,WOOD,px+1,.5,pz);wbox(px-.7,px+.7,pz-.45,pz+.45,{h:1})}else if(q===1){A(2,.85,.9,fa,px,.5,pz);A(2,.8,.2,fa,px,.9,pz-.45);wbox(px-1,px+1,pz-.5,pz+.5,{h:1.4})}else{A(1.8,.7,1.1,FAB[1],px,.4,pz);A(1.8,.5,.15,WOOD,px,.8,pz-.55);wbox(px-.9,px+.9,pz-.55,pz+.55,{h:1.1})}}
 for(let k=0;k<({house:3,villa:4,apartment:5,shop:3,warehouse:5,church:3}[type]||3);k++){const lx=R(-iw,iw),lz=R(-hz+1.2,fz);LS.push({x:WX(lx,lz),z:WZ(lx,lz)})}
 const g=new T.Group();g.position.set(x,0,z);g.rotation.y=th;sc.add(g);bake(g,items);if(DZW_)DZW.add(g,GL_);
 const piv=new T.Group();piv.position.set(dc-DW/2,0,hz-Tn/2);g.add(piv);bake(piv,[[new T.BoxGeometry(DW-.04,DH-.04,.07),DOORM,DW/2,DH/2,0],[new T.BoxGeometry(.12,.04,.07),DARK,DW-.15,1.05,.07],[new T.BoxGeometry(.12,.04,.07),DARK,DW-.15,1.05,-.07]]);
 const D={piv,x:WX(dc,hz),z:WZ(dc,hz),open:0,a:0,bx:db};db.door=D;doors.push(D);
 const xs=[WX(-w/2,-hz),WX(w/2,hz),WX(-w/2,hz),WX(w/2,-hz)],zs=[WZ(-w/2,-hz),WZ(w/2,hz),WZ(-w/2,hz),WZ(w/2,-hz)];FP.push({x0:Math.min(...xs),x1:Math.max(...xs),z0:Math.min(...zs),z1:Math.max(...zs),door:D,ox:WX(dc,hz+1.6),oz:WZ(dc,hz+1.6),ix:WX(dc,hz-1.6),iz:WZ(dc,hz-1.6)})}
const MIX={center:{apartment:.35,shop:.35,villa:.1,house:.2},res:{house:.6,villa:.35,shop:.05},ind:{warehouse:.65,shop:.15,house:.1,apartment:.1},mix:{shop:.3,house:.4,villa:.2,apartment:.1},high:{apartment:.6,villa:.15,shop:.25}};
function pick(t){let r=Math.random(),m=MIX[t];for(const k in m){if((r-=m[k])<0)return k}return'house'}
const LK=[{x:-380,z:-350,r:60},{x:390,z:360,r:50},{x:-390,z:370,r:40}];
{const sandM=MT(0xd8c89a),wtM=new T.MeshStandardMaterial({color:lin(0x2f6f9a),metalness:.5,roughness:.12,transparent:true,opacity:.88});if(window.DZR)DZR.waterMat(wtM);sandM.depthTest=false;sandM.depthWrite=false;wtM.polygonOffset=true;wtM.polygonOffsetFactor=wtM.polygonOffsetUnits=-3;
 for(const l of LK){const a=new T.Mesh(new T.CircleGeometry(l.r+7,40),sandM);a.rotation.x=-Math.PI/2;a.position.set(l.x,.04,l.z);a.renderOrder=-.4;sc.add(a);const w=new T.Mesh(new T.CircleGeometry(l.r,40),wtM);w.rotation.x=-Math.PI/2;w.position.set(l.x,.09,l.z);sc.add(w)}}
const BP=42,swM=new T.MeshStandardMaterial({color:lin(0x9b9b95),roughness:1,depthTest:false,depthWrite:false});
for(const C of CITIES){
 for(const k of[-2,-1,1,2]){road(C.x+k*BP-6,C.z-90,C.x+k*BP+6,C.z+90,1);road(C.x-90,C.z+k*BP-6,C.x+90,C.z+k*BP+6,1)}
 const sw=[],pl_=[];
 for(const bi of[-2,-1,0,1])for(const bj of[-2,-1,0,1]){
  const xa=bi*BP+9.5,xb=bi*BP+32.5,za=bj*BP+9.5,zb=bj*BP+32.5;
  sw.push([new T.PlaneGeometry(xb-xa+7,zb-za+7),swM,C.x+(xa+xb)/2,.05,C.z+(za+zb)/2,-Math.PI/2]);
  for(const [px,pz,dx,dz] of[[xa-2,za-2,1,0],[xb+2,zb+2,-1,0]]){const X=C.x+px,Z=C.z+pz;pl_.push([new T.CylinderGeometry(.07,.09,6,6),DARK,X,3,Z],[new T.BoxGeometry(1.4,.1,.1),DARK,X+dx*.7,6,Z],[new T.BoxGeometry(.5,.12,.3),LAMP,X+dx*1.4,5.92,Z]);addBox({x0:X-.15,x1:X+.15,z0:Z-.15,z1:Z+.15})}
  if(C.t==='ind'&&bi===0&&bj===0)continue;
  if(C.t==='center'&&bi===-1&&bj===0){mkBld({x:C.x+(xa+xb)/2,z:C.z+(za+zb)/2,w:12,d:21,th:Math.PI,type:'church'});continue}
  if(C.t!=='center'&&Math.random()<.06)continue;
  for(const row of[0,1]){let xc=xa+R(0,1.5);
   while(xc<xb-7.5){const ty=pick(C.t),S=SPEC[ty],rem=xb-xc;let w=(ty==='apartment'||ty==='warehouse')?Math.min(rem,R(18,22)):Math.min(rem,R(S.w[0]*.8,S.w[1]*.9));if(w<7.5)break;const d=Math.min(11.5,R(S.d[0]*.9,S.d[1]));
    mkBld({x:C.x+xc+w/2,z:C.z+(row?zb-d/2:za+d/2),w,d,th:row?0:Math.PI,type:ty});xc+=w+R(.8,2)}}}
 const g=new T.Group();sc.add(g);bake(g,sw);g.children.forEach(m=>{m.renderOrder=-.5;m.castShadow=false});const g2=new T.Group();sc.add(g2);bake(g2,pl_)}
{const C=CITIES[2],tx=C.x+21,tz=C.z+20.5,wt=new T.Group(),cc=MT(0x9a9a96),mt=MT(0xb5b9bd);wt.position.set(tx,0,tz);sc.add(wt);const lg=new T.BoxGeometry(.5,11,.5);
 for(const a of[-1,1])for(const b of[-1,1]){const m=new T.Mesh(lg,cc);m.position.set(a*2.2,5.5,b*2.2);m.castShadow=true;wt.add(m)}
 const tk=new T.Mesh(new T.CylinderGeometry(3.2,3.2,4.5,16),mt);tk.position.y=13;tk.castShadow=true;wt.add(tk);const tc=new T.Mesh(new T.ConeGeometry(3.4,1.6,16),MT(0x7a7f84));tc.position.y=16;wt.add(tc);addBox({x0:tx-2.7,x1:tx+2.7,z0:tz-2.7,z1:tz+2.7,w:1,top:18})}
{const mids=[];for(const x of CX)for(const z of[-355,365])mids.push([x,z,1]);for(const z of CZ)for(const x of[-375,375])mids.push([x,z,0]);
 for(const [rx,rz,vt] of mids)for(const sd of[-1,1]){const ty=['house','warehouse','shop','villa'][Math.floor(R(0,4))],S=SPEC[ty],o=R(-35,35);
  mkBld({x:vt?rx+sd*30:rx+o,z:vt?rz+o:rz+sd*30,w:R(S.w[0],S.w[1]),d:R(S.d[0],S.d[1]),th:vt?(sd>0?-Math.PI/2:Math.PI/2):(sd>0?Math.PI:0),type:ty})}}
