/* Deadzone · player/character.js
 * Esqueleto procedural do personagem (base das animações).
 */
// ---------- personagem ----------
const SK=0xe0b48c,OL=0x55663f,DK=0x2f3828,BK=0x1c1c1c,PT=0x4f5640,HL=0x3b4430;
const CM0={sk:M(SK),ol:M(OL),dk:M(DK),bk:M(BK),pt:M(PT),hl:M(HL),bg:M(0x4d5a3a),kh:M(0x8a7a52),gn:M(0x25301f),vs:M(DK),bt:M(BK)};const CM=CM0,PM={};for(const k in CM0)PM[k]=CM0[k].clone();
function buildChar(lo,pm){const CM=pm||CM0;const pl=new T.Group(),body=new T.Group();pl.add(body);
 const G=(x,y,z,p)=>{const g=new T.Group();g.position.set(x,y,z);(p||body).add(g);return g},bx=(a,b,c)=>new T.BoxGeometry(a,b,c),cy=(a,b,h,n)=>new T.CylinderGeometry(a,b,h,n||8),
 ms=(p,ge,m,x,y,z)=>{const o=new T.Mesh(ge,m);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o};
 const hips=G(0,.95,0);bake(hips,[[bx(.4,.2,.25),CM.dk,0,0,0],[bx(.45,.07,.29),CM.bk,0,.1,0],[bx(.1,.16,.08),CM.bk,.24,-.02,.02],[bx(.1,.14,.08),CM.bk,-.24,-.02,.02]]);
 const tor=G(0,.1,0,hips),sp=new T.SphereGeometry(.125,12,10);sp.scale(1,1.1,1);const hm=new T.SphereGeometry(.152,12,8,0,Math.PI*2,0,Math.PI/2);
 const TI=[[bx(.44,.5,.27),CM.ol,0,.28,0],[bx(.48,.38,.31),CM.vs||CM.dk,0,.34,.01],[bx(.09,.07,.09),CM.sk,0,.58,0],[bx(.5,.07,.3),CM.gn,0,.1,0],
  [bx(.5,.46,.22),CM.bg,0,.3,-.27],[bx(.44,.1,.24),CM.bg,0,.6,-.27],[bx(.1,.28,.18),CM.bg,.29,.2,-.27],[bx(.1,.28,.18),CM.bg,-.29,.2,-.27]];
 if(!lo)TI.push([bx(.11,.12,.07),CM.bk,-.14,.2,.19],[bx(.11,.12,.07),CM.bk,0,.2,.19],[bx(.11,.12,.07),CM.bk,.14,.2,.19],[bx(.07,.1,.34),CM.vs||CM.dk,-.18,.55,0],[bx(.07,.1,.34),CM.vs||CM.dk,.18,.55,0],[cy(.07,.07,.46,8),CM.kh,0,.7,-.28,0,0,Math.PI/2],[bx(.18,.06,.04),CM.bk,0,.45,.17]);
 const HI=[[sp,CM.sk,0,0,0],[hm,CM.hl,0,.03,0],[bx(.33,.025,.33),CM.hl,0,.04,0],[bx(.22,.05,.04),CM.bk,0,.1,.14],[bx(.2,.04,.02),CM.bk,0,.02,.118],[bx(.18,.09,.12),CM.dk,0,-.06,.07],[bx(.02,.12,.02),CM.bk,.11,-.05,.04]];
 let head;if(lo){bake(tor,TI.concat(HI.map(h=>[h[0],h[1],h[2],h[3]+.7,h[4]])));head=G(0,.7,0,tor)}else{bake(tor,TI);head=G(0,.7,0,tor);bake(head,HI)}
 const arm=s=>{const sh=G(s*.29,.5,0,tor);ms(sh,cy(.058,.048,.3),CM.ol,0,-.15,0);if(!lo)ms(sh,bx(.15,.08,.15),CM.dk,0,.0,0);const el=G(0,-.3,0,sh);ms(el,cy(.048,.04,.27),CM.ol,0,-.135,0);if(!lo)ms(el,bx(.1,.06,.1),CM.bk,0,-.01,.03);ms(el,bx(.09,.1,.11),CM.bk,0,-.31,0);return{sh,el}};
 const leg=s=>{const th=G(s*.11,-.05,0,hips);ms(th,cy(.095,.075,.45),CM.pt,0,-.225,0);const kn=G(0,-.45,0,th);ms(kn,cy(.075,.055,.42),CM.pt,0,-.21,0);if(!lo)ms(kn,bx(.13,.12,.06),CM.bk,0,0,.08);ms(kn,bx(.15,.1,.27),CM.bt||CM.bk,0,-.43,.05);ms(kn,bx(.13,.12,.14),CM.bt||CM.bk,0,-.36,0);return{th,kn}};
 const RG={pl,body,hips,tor,head,aL:arm(-1),aR:arm(1),lg1:leg(-1),lg2:leg(1)};try{window.DZR&&DZR.reg(RG,lo,pm)}catch(e){console.warn(e)}return RG}
const CH=buildChar(0,PM),pl=CH.pl,body=CH.body,hips=CH.hips,tor=CH.tor,head=CH.head,aL=CH.aL,aR=CH.aR,lg1=CH.lg1,lg2=CH.lg2;sc.add(pl);
const rf=new T.Group();rf.position.set(.12,.28,.28);tor.add(rf);rf.visible=false;const sling=new T.Group(),hipG=new T.Group();tor.add(sling);hips.add(hipG);
pl.traverse(o=>{if(o.isMesh)o.castShadow=true});
const shd=new T.Mesh(new T.CircleGeometry(.55,16),new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.3}));shd.rotation.x=-Math.PI/2;shd.position.y=.06;sc.add(shd);
const P={x:6,z:6,y:0,vy:0};let st=0,cr=0,pr=0,air=0,sk=0,ch=0;
