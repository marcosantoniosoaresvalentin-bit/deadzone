/* Deadzone · player/vault.js
 * PULAR OBSTÁCULO (janela, mureta, parapeito): com o botão de pulo perto de um obstáculo baixo
 * (45 cm a 1,4 m) o personagem apoia as mãos em cima, encolhe as pernas, passa por cima e cai do
 * outro lado. Na janela, o vidro quebra com barulho. O pulo normal é baixo e não passa do obstáculo.
 */
let VLT = null;
const VLT_T = .78;
function vltHit(x, z, f) { for (const b of near(x, z)) if (b.w && !b.off && b.yt !== undefined && x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1 && f(b)) return b; return null; }
function tryVault() {
  if (mode !== 'ground' || st === 2 || VLT) return false;
  const y0 = P.y; if (y0 > GY(P.x, P.z, P.y) + .05) return false;
  const a = pl.rotation.y, fx = Math.sin(a), fz = Math.cos(a), rx = fz, rz = -fx;
  // 1) obstáculo logo à frente, na altura da cintura
  let d0 = -1, top = 0;
  for (let d = .25; d <= 1.25; d += .05) {
    const x = P.x + fx * d, z = P.z + fz * d, b = vltHit(x, z, b => b.yb < y0 + .6 && b.yt > y0 + .3);
    if (b) { const h = b.yt - y0; if (h < .45 || h > 1.4) return false; d0 = d; top = b.yt; break; }
  }
  if (d0 < 0) return false;
  // 2) onde o obstáculo acaba
  let d1 = d0; for (; d1 < d0 + 1.6; d1 += .05) { const x = P.x + fx * d1, z = P.z + fz * d1; if (!vltHit(x, z, b => b.yb < top - .05 && b.yt > y0 + .3 && !b.lint)) break; }
  if (d1 >= d0 + 1.6) return false;
  // 3) espaço livre por cima para o corpo encolhido (a parte de cima da janela fica acima)
  for (let d = d0; d <= d1 + .6; d += .1) for (const o of [-.25, 0, .25]) { const x = P.x + fx * d + rx * o, z = P.z + fz * d + rz * o;
    if (vltHit(x, z, b => !(b.lint && b.yb >= top + .8) && b.yb < top + 1 && b.yt > top + .05)) return false; }
  // 4) chegada: chão do outro lado (se for um buraco, termina na altura do obstáculo e cai)
  const D = d1 + .55, ex = P.x + fx * D, ez = P.z + fz * D, gl = GY(ex, ez, top + .3), ye = gl >= top - 1.6 ? gl : top;
  if (vltHit(ex, ez, b => !(b.lint && b.yb >= ye + .9) && b.yb < ye + 1.7 && b.yt > ye + .1)) return false;
  const hp = [-1, 1].map(s => new T.Vector3(P.x + fx * (d0 + .3) + rx * .2 * s, top + .02, P.z + fz * (d0 + .3) + rz * .2 * s));
  VLT = { x0: P.x, z0: P.z, y0, ex, ez, ye, top, fx, fz, t: 0, hp };
  st = 0; try { ui(); } catch (e) { } try { sfx(240, .18, .12, 0); } catch (e) { }
  return true;
}
const vltEase = u => u * u * (3 - 2 * u);
function vaultTick(dt) {
  const V = VLT; V.t = Math.min(1, V.t + dt / VLT_T); const u = V.t;
  // sobe apoiando (0-35%), passa por cima (35-70%), desce do outro lado (70-100%)
  const s = u < .35 ? .22 * vltEase(u / .35) : .22 + .78 * vltEase((u - .35) / .65);
  P.x = V.x0 + (V.ex - V.x0) * s; P.z = V.z0 + (V.ez - V.z0) * s;
  const pk = V.top + .12;
  P.y = u < .35 ? V.y0 + (pk - V.y0) * Math.sin(u / .35 * Math.PI / 2) : u < .7 ? pk : pk + (V.ye - pk) * ((u - .7) / .3) ** 2;
  P.vy = 0;
  if (window.DZW && DZW.touch) DZW.touch(P.x, P.y, P.z, V.fx, V.fz);
  if (u >= 1) { P.x = V.ex; P.z = V.ez; P.y = V.ye; P.vy = V.ye > GY(P.x, P.z, P.y) + .05 ? -1 : 0; VLT = null; vaultReset(); try { sfx(160, .2, .1, 0); } catch (e) { } }
}
function vaultReset() { hips.position.set(0, .95, 0); hips.rotation.set(0, 0, 0); tor.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0); for (const l of [lg1, lg2]) { l.th.rotation.set(0, 0, 0); l.kn.rotation.set(0, 0, 0); } }
const _vh = new T.Vector3();
function vaultPose() {
  const V = VLT; if (!V) return; const u = V.t, k = Math.sin(Math.PI * Math.min(1, u / .9)), side = .9;
  try { CH.loco = { w: 0, sp: 0, arm: false, fw: 1 }; for (const r of DZR.rigs) if (r.pl === pl && r.av) r.av.lw = 0; } catch (e) { }
  pl.rotation.y = Math.atan2(V.fx, V.fz);
  // corpo inclinado para frente, quadril de lado (passagem lateral), pernas encolhidas
  hips.position.set(0, .95 - .22 * k, 0); hips.rotation.set(0, .25 * k * side, .35 * k * side);
  tor.rotation.set(.9 * k, -.2 * k * side, -.2 * k * side); head.rotation.set(-.6 * k, .15 * k * side, 0);
  lg1.th.rotation.set(-1.55 * k, 0, .3 * k); lg1.kn.rotation.x = 2.0 * k; lg2.th.rotation.set(-1.2 * k, 0, .45 * k); lg2.kn.rotation.x = 1.6 * k;
  // mãos apoiadas no obstáculo até passar; depois os braços voltam para frente
  pl.position.set(P.x, P.y, P.z); pl.updateMatrixWorld(true);
  if (u < .62) { for (const [i, arm, s] of [[0, aL, -1], [1, aR, 1]]) { _vh.copy(V.hp[i]); tor.worldToLocal(_vh); ik(arm, s, _vh.x, _vh.y, _vh.z); } }
  else { const r = (u - .62) / .38; ik(aR, 1, .3, .15 + .2 * r, .35); ik(aL, -1, -.3, .15 + .2 * r, .35); }
  try { rf.visible = false; } catch (e) { }
}
