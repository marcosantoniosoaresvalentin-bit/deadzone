/* Deadzone · bots/navigation.js
 * Navegação dos bots e linha de visão (paredes, relevo, janelas).
 */
function res(e){for(const b of near(e.x,e.z)){if(b.off||(b.yt!==undefined&&((e.y||0)>=b.yt-.05||(e.y||0)+1.9<=b.yb)))continue;const cx=Math.max(b.x0,Math.min(e.x,b.x1)),cz=Math.max(b.z0,Math.min(e.z,b.z1)),ex=e.x-cx,ez=e.z-cz,d=Math.hypot(ex,ez);if(b.door&&d<1.3&&!b.door.open)b.door.open=1;if(d<.45){if(d>0){e.x+=ex/d*(.45-d);e.z+=ez/d*(.45-d)}else{const dl=e.x-b.x0,dr_=b.x1-e.x,dn=e.z-b.z0,df=b.z1-e.z,m=Math.min(dl,dr_,dn,df);if(m===dl)e.x=b.x0-.45;else if(m===dr_)e.x=b.x1+.45;else if(m===dn)e.z=b.z0-.45;else e.z=b.z1+.45}}}}
function mvE(e,dx,dz){e.x+=dx;res(e);e.z+=dz;res(e);e.x=MCLX(e.x,5);e.z=MCLZ(e.z,5)}
// Navegação de bots: contorna fachadas, usa portas e evita insistir contra paredes.
function botInside(q,x,z){return x>q.x0+.55&&x<q.x1-.55&&z>q.z0+.55&&z<q.z1-.55}
// Teste exato segmento/retângulo (sem amostragem): mais leve e não deixa a rota cortar fachadas.
function botLineHits(q,x0,z0,x1,z1){
 const pad=.72,minX=q.x0-pad,maxX=q.x1+pad,minZ=q.z0-pad,maxZ=q.z1+pad;
 const dx=x1-x0,dz=z1-z0;let lo=0,hi=1;
 if(Math.abs(dx)<1e-8){if(x0<=minX||x0>=maxX)return false}
 else{let a=(minX-x0)/dx,c=(maxX-x0)/dx;if(a>c){const t=a;a=c;c=t}lo=Math.max(lo,a);hi=Math.min(hi,c);if(lo>=hi)return false}
 if(Math.abs(dz)<1e-8){if(z0<=minZ||z0>=maxZ)return false}
 else{let a=(minZ-z0)/dz,c=(maxZ-z0)/dz;if(a>c){const t=a;a=c;c=t}lo=Math.max(lo,a);hi=Math.min(hi,c);if(lo>=hi)return false}
 return hi>Math.max(lo,0)&&hi>0&&lo<1
}
function botNavigate(b,tx,tz,speed,dt){
 let wx=tx,wz=tz;
 /* só construções com porta (muros, guaritas e áreas sem porta não têm entrada/saída) */const from=FP.find(q=>q.door&&q.ox!=null&&botInside(q,b.x,b.z)),to=FP.find(q=>q.door&&q.ox!=null&&botInside(q,tx,tz));
 if(from&&from===to){/* deslocamento dentro do mesmo prédio */}
 else if(to&&!from){
   const d=Math.hypot(to.ox-b.x,to.oz-b.z);
   if(d<3.8)to.door.open=1;
   if(d>1.35){wx=to.ox;wz=to.oz}else{to.door.open=1;wx=to.ix;wz=to.iz}
 }else if(from&&!to){
   const d=Math.hypot(from.ix-b.x,from.iz-b.z);
   if(d<3.8)from.door.open=1;
   if(d>1.25){wx=from.ix;wz=from.iz}else{from.door.open=1;wx=from.ox;wz=from.oz}
 }else{
   let hit=null;
   for(const q of FP){if(q!==from&&q!==to&&botLineHits(q,b.x,b.z,tx,tz)){hit=q;break}}
   if(hit){
     const pad=1.65,corners=[[hit.x0-pad,hit.z0-pad],[hit.x0-pad,hit.z1+pad],[hit.x1+pad,hit.z0-pad],[hit.x1+pad,hit.z1+pad]];
     let best=null,bestCost=Infinity;
     for(const c of corners){
       let blocked1=false,blocked2=false;
       for(const q of FP){if(q===hit||q===from||q===to)continue;if(botLineHits(q,b.x,b.z,c[0],c[1])||botLineHits(q,c[0],c[1],tx,tz)){blocked1=true;break}}
       if(blocked1)continue;
       const cost=Math.hypot(c[0]-b.x,c[1]-b.z)+Math.hypot(tx-c[0],tz-c[1]);
       if(cost<bestCost){bestCost=cost;best=c}
     }
     if(best){wx=best[0];wz=best[1]}
     else{
       // Se todos os desvios estão bloqueados, espera e recalcula no próximo ciclo.
       // É preferível pausar brevemente a tentar atravessar uma parede.
       return 0;
     }
   }
 }
 const dx=wx-b.x,dz=wz-b.z,d=Math.hypot(dx,dz);
 if(d<.45)return 0;
 const step=Math.min(speed*dt,d),ox=b.x,oz=b.z;
 mvE(b,dx/d*step,dz/d*step);
 const moved=Math.hypot(b.x-ox,b.z-oz);
 if(moved<step*.22){
   // Desliza paralelamente à parede, sem insistir na direção bloqueada.
   const sides=[-1,1].map(v=>({x:-dz/d*v,z:dx/d*v})).sort((a,c)=>{
     const aa=(tx-(b.x+a.x*2))**2+(tz-(b.z+a.z*2))**2,cc=(tx-(b.x+c.x*2))**2+(tz-(b.z+c.z*2))**2;return aa-cc
   });
   for(const side of sides){const sx=b.x,sz=b.z;mvE(b,side.x*speed*dt*.7,side.z*speed*dt*.7);if(Math.hypot(b.x-sx,b.z-sz)>.02)break}
 }
 b.g.rotation.y=Math.atan2(dx,dz);
 return 1;
}

function blocked(x0,y0,z0,x1,y1,z1){const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/.25)+1;for(let i=1;i<n;i++){const u=i/n,x=x0+(x1-x0)*u,y=y0+(y1-y0)*u,z=z0+(z1-z0)*u;if(i%4===0&&y<TERH(x,z)-.15)return true;for(const b of near(x,z))if(b.w&&!b.off&&(b.yt!==undefined?(y>b.yb&&y<b.yt):y<(b.h||(b.ice?2.8:6)))&&x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1&&!(window.DZW&&DZW.broken&&DZW.hole(x,y,z)))return true}return false}
