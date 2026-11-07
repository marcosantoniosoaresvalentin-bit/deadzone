/* Deadzone · world/roads.js
 * Chão, estradas e cidades.
 */
const MT=(c,map,r,e)=>new T.MeshStandardMaterial({color:lin(c),map:map||null,roughness:r||.9,metalness:.04});
const grT=ctex(512,512,(g,w,h)=>{g.fillStyle='#5a8a3a';g.fillRect(0,0,w,h);for(let i=0;i<40;i++){g.fillStyle='hsla('+R(60,100)+',40%,'+R(22,40)+'%,.2)';g.beginPath();g.arc(R(0,w),R(0,h),R(20,70),0,7);g.fill()}for(let i=0;i<9000;i++){g.fillStyle='hsl('+R(80,115)+','+R(35,55)+'%,'+R(20,46)+'%)';g.fillRect(R(0,w),R(0,h),R(1,2.5),R(2,5))}},240,240);
const gr=new T.Mesh(new T.PlaneGeometry(2400,2400),window.DZR?DZR.groundMat():new T.MeshStandardMaterial({map:grT,roughness:1}));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;gr.renderOrder=-2;sc.add(gr);
const rdT=ctex(128,256,(g,w,h)=>{g.fillStyle='#46494e';g.fillRect(0,0,w,h);for(let i=0;i<2500;i++){g.fillStyle='rgba('+(R(0,1)<.5?'0,0,0':'255,255,255')+','+R(.03,.1)+')';g.fillRect(R(0,w),R(0,h),R(1,3),R(1,3))}g.fillStyle='#ddd';g.fillRect(6,0,3,h);g.fillRect(w-9,0,3,h);g.fillStyle='#e0b020';g.fillRect(w/2-2,0,4,h/2)},1,1);
const rd2T=ctex(128,256,(g,w,h)=>{g.fillStyle='#46494e';g.fillRect(0,0,w,h);for(let i=0;i<2500;i++){g.fillStyle='rgba('+(R(0,1)<.5?'0,0,0':'255,255,255')+','+R(.03,.1)+')';g.fillRect(R(0,w),R(0,h),R(1,3),R(1,3))}g.fillStyle='#ccc';g.fillRect(6,0,3,h);g.fillRect(w-9,0,3,h)},1,1);
const RD1=new T.MeshStandardMaterial({map:rdT,roughness:.95,depthTest:false,depthWrite:false}),RD2=new T.MeshStandardMaterial({map:rd2T,roughness:.95,depthTest:false,depthWrite:false});
function road(x0,z0,x1,z1,sd){RDS.push([x0,z0,x1,z1]);const hz=(x1-x0)>(z1-z0),L=hz?x1-x0:z1-z0,ge=new T.PlaneGeometry(12,L),uv=ge.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*L/8);
 const m=new T.Mesh(ge,sd?RD2:RD1);m.rotation.set(-Math.PI/2,0,hz?Math.PI/2:0);m.position.set((x0+x1)/2,.06,(z0+z1)/2);m.renderOrder=-1;m.receiveShadow=true;sc.add(m)}
const CX=[-750,0,750],CZ=[-710,0,730];
for(const x of CX)road(x-6,-716,x+6,736);
for(const z of CZ){road(-776,z-6,-756,z+6);for(let k=0;k<2;k++)road(CX[k]+6,z-6,CX[k+1]-6,z+6);road(756,z-6,776,z+6)}
const CITIES=[{n:'Porto Real',x:0,z:0,t:'center'},{n:'Vila Pinheiro',x:-750,z:-710,t:'res'},{n:'Distrito Industrial',x:750,z:-710,t:'ind'},{n:'Praia Dourada',x:-750,z:730,t:'mix'},{n:'Cidade Alta',x:750,z:730,t:'high'}];
const nearestCity=(x,z)=>CITIES.reduce((a,c)=>Math.hypot(c.x-x,c.z-z)<Math.hypot(a.x-x,a.z-z)?c:a);
const onRoad=(x,z)=>RDS.some(r=>x>r[0]-8&&x<r[2]+8&&z>r[1]-8&&z<r[3]+8),inFP=(x,z,m)=>FP.some(b=>x>b.x0-m&&x<b.x1+m&&z>b.z0-m&&z<b.z1+m);
