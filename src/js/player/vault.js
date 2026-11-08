/* Deadzone · player/vault.js
 * PULAR OBSTÁCULO (janela, mureta, parapeito): com o botão de pulo perto de um obstáculo baixo
 * (45 cm a 1,4 m) o personagem apoia as mãos em cima, encolhe as pernas, passa por cima e cai do
 * outro lado. Na janela, o vidro quebra com barulho. O pulo normal é baixo e não passa do obstáculo.
 */
let VLT = null;
const VLT_T = .85;
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
  const hp = [-1, 1].map(s => new T.Vector3(P.x + fx * (Math.min(d0 + .12, (d0 + d1) / 2)) - rx * .2 * s, top + .03, P.z + fz * (Math.min(d0 + .12, (d0 + d1) / 2)) - rz * .2 * s));
  VLT = { x0: P.x, z0: P.z, y0, ex, ez, ye, top, fx, fz, t: 0, hp };
  st = 0; try { ui(); } catch (e) { } try { sfx(240, .18, .12, 0); } catch (e) { }
  return true;
}
const vltEase = u => u * u * (3 - 2 * u), vltCl = (a, b, u) => Math.max(0, Math.min(1, (u - a) / (b - a)));
// curvas da animação (u = 0..1)
const vltLean = u => u < .3 ? 1.15 * vltEase(u / .3) : u < .55 ? 1.15 : 1.15 - .95 * vltEase((u - .55) / .45);
const vltTuck = u => u < .2 ? 0 : u < .45 ? vltEase((u - .2) / .25) : u < .75 ? 1 : 1 - vltEase((u - .75) / .25);
const vltHipY = u => .95 - .3 * vltTuck(u);
function vltHipH(V, u) { // altura do quadril no mundo: sobe até a borda, passa rente por cima, desce do outro lado
  const a = V.y0 + .95, b = V.top + .28, c = V.ye + .95;
  return u < .3 ? a + (b - a) * vltEase(u / .3) : u < .65 ? b + .04 * Math.sin((u - .3) / .35 * Math.PI) : b + (c - b) * vltEase((u - .65) / .35);
}
function vaultTick(dt) {
  const V = VLT; V.t = Math.min(1, V.t + dt / VLT_T); const u = V.t;
  // anda devagar enquanto sobe apoiando, passa por cima e desce do outro lado
  const s = u < .3 ? .2 * vltEase(u / .3) : .2 + .8 * vltEase((u - .3) / .7);
  P.x = V.x0 + (V.ex - V.x0) * s; P.z = V.z0 + (V.ez - V.z0) * s;
  P.y = vltHipH(V, u) - vltHipY(u);
  P.vy = 0;
  if (window.DZW && DZW.touch) DZW.touch(P.x, P.y + .3, P.z, V.fx, V.fz);
  if (u >= 1) { P.x = V.ex; P.z = V.ez; P.y = V.ye; P.vy = V.ye > GY(P.x, P.z, P.y) + .05 ? -1 : 0; VLT = null; vaultReset(); try { sfx(160, .2, .1, 0); } catch (e) { } }
}
function vaultReset() { hips.position.set(0, .95, 0); hips.rotation.set(0, 0, 0); tor.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0); for (const l of [lg1, lg2]) { l.th.rotation.set(0, 0, 0); l.kn.rotation.set(0, 0, 0); } }
const _vh = new T.Vector3(), _vs = new T.Vector3();
function vaultPose() {
  const V = VLT; if (!V) return; const u = V.t, ln = vltLean(u), tk = vltTuck(u);
  try { CH.loco = { w: 0, sp: 0, arm: false, fw: 1 }; for (const r of DZR.rigs) if (r.pl === pl && r.av) r.av.lw = 0; } catch (e) { }
  pl.rotation.set(0, Math.atan2(V.fx, V.fz), 0);
  // quadril baixo e girado de lado (pernas passam de lado, encolhidas), tronco bem inclinado para as mãos alcançarem
  hips.position.set(0, vltHipY(u), 0); hips.rotation.set(0, .55 * tk, .25 * tk);
  tor.rotation.set(ln, -.5 * tk, -.15 * tk); head.rotation.set(-.75 * ln, .35 * tk, 0);
  lg1.th.rotation.set(-1.6 * tk, 0, .45 * tk); lg1.kn.rotation.x = 1.9 * tk; lg2.th.rotation.set(-1.35 * tk, 0, .6 * tk); lg2.kn.rotation.x = 1.7 * tk;
  pl.position.set(P.x, P.y, P.z); pl.updateMatrixWorld(true);
  // mãos: vão até a borda, APOIAM em cima do obstáculo (ponto fixo no mundo) e soltam quando o corpo passa
  const reach = vltCl(.02, .14, u), hold = u < .5 ? 1 : 1 - vltCl(.5, .62, u);
  for (const [i, arm, sd] of [[0, aL, -1], [1, aR, 1]]) {
    _vh.copy(V.hp[i]); tor.worldToLocal(_vh);
    const rx = sd * .3, ry = .2 + .25 * (1 - hold), rz = .35; // braço solto, para frente
    const w = reach * hold; ik(arm, sd, rx + (_vh.x - rx) * w, ry + (_vh.y - ry) * w, rz + (_vh.z - rz) * w);
  }
  try { rf.visible = false; } catch (e) { }
}
