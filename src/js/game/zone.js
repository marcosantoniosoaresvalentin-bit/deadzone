/* Deadzone · game/zone.js
 * Zona que fecha (círculo vermelho).
 */
const ZMAT=new T.MeshBasicMaterial({color:0xff2a2a,transparent:true,opacity:.22,side:T.DoubleSide,depthWrite:false,fog:false}),zw=new T.Mesh(new T.CylinderGeometry(1,1,260,72,1,true),ZMAT);zw.position.y=120;zw.frustumCulled=false;sc.add(zw);
const ZK=MAPH/1200,ZS=[900,500,260,120,40].map(r=>Math.round(r*ZK)),Z0=1700*ZK;let zR=Z0,zI=0,zX=0,zZ=0,ZP=null;
function zonePlan(){const a=Math.random()*6.2832,d=Math.sqrt(Math.random())*950*ZK,F=[Math.cos(a)*d,Math.sin(a)*d];let prev=Z0,tot=0;const gp_=[];for(const r of ZS){gp_.push(prev-r);tot+=prev-r;prev=r}let cum=0;const C=[[0,0]];for(let i=0;i<ZS.length;i++){cum+=gp_[i];C.push([F[0]*cum/tot,F[1]*cum/tot])}ZP={C,F,g:0}}
function zoneUpd(dt){if(!ZP||gt<ZP.g-1)zonePlan();ZP.g=gt;const t=gt-100;let r=Z0,idx=0,txt='',cx=0,cz=0;
 if(t>=0){idx=Math.floor(t/135);if(idx>=ZS.length){idx=ZS.length;r=ZS[ZS.length-1];cx=ZP.F[0];cz=ZP.F[1];txt='Zona final'}else{const w=t%135,p=idx?ZS[idx-1]:Z0,A=ZP.C[idx],B=ZP.C[idx+1];if(w<75){r=p;cx=A[0];cz=A[1];txt='Zona fecha em '+Math.ceil(75-w)+'s'}else{const k=(w-75)/60;r=lp(p,ZS[idx],k);cx=lp(A[0],B[0],k);cz=lp(A[1],B[1],k);txt='Zona fechando...'}}}else txt='Zona começa em '+Math.ceil(-t)+'s';
 zR=r;zI=idx;zX=cx;zZ=cz;zw.position.x=cx;zw.position.z=cz;zw.scale.set(r,1,r);const out=Math.hypot(P.x-cx,P.z-cz)>r;$('zn').textContent=txt+' · raio '+Math.round(r)+'m'+(out?' · FORA DA ZONA':'');$('zn').style.color=out?'#ff6a6a':'#fff';
 if(out&&(mode==='ground'||mode==='drive'))hp-=dt*(1.5+idx*1.2)}
