/* Deadzone · core/perf.js
 * DESEMPENHO e CONFIGURAÇÕES GRÁFICAS
 *  - Qualidade gráfica: Baixa / Média / Alta / Ultra (resolução, sombras suaves, reflexos, grama)
 *  - Distância de renderização: Curta / Média / Longa / Máxima (limite de visão + some o que está longe)
 *  - Sombras: ligadas/desligadas · Limite de FPS: 30 / 60 · Mostrar FPS
 *  - Objetos parados (prédios, ruas, muros) ficam "congelados": o celular não recalcula a posição deles a cada quadro
 */
(function () {
  const QN = ['Baixa', 'Média', 'Alta', 'Ultra'], RDN = ['Curta', 'Média', 'Longa', 'Máxima'], RDM = [190, 300, 450, 650];
  const touch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (CFG.q == null) CFG.q = touch ? 1 : 2;
  if (CFG.rd == null) CFG.rd = touch ? 1 : 2;
  if (CFG.sh == null) CFG.sh = CFG.q >= 1 ? 1 : 0;
  if (CFG.fps == null) CFG.fps = touch ? 1 : 0;   // 0 = 60 FPS, 1 = 30 FPS (economiza bateria e não esquenta)
  if (CFG.showFps == null) CFG.showFps = 0;
  const q = () => Math.max(0, Math.min(3, CFG.q | 0));
  window.DZRD = () => Math.round([200, 280, 380, 480][q()] * (window.__rdK || 1));

  // ---------- qualidade ----------
  window.applyQ = function () {
    const Q = q(), dpr = devicePixelRatio || 1, pr = [Math.min(dpr, .8), Math.min(dpr, 1.1), Math.min(dpr, 1.4), Math.min(dpr, 2)][Q];
    try { if (typeof DYN !== 'undefined') { DYN.base = pr; DYN.k = 1; } } catch (e) { }
    ren.setPixelRatio(pr); try { rs(); } catch (e) { }
    sun.castShadow = !!CFG.sh;
    try { window.DZR && DZR.applyQ && DZR.envTex !== undefined && DZR.applyQ(Math.min(2, Q)); } catch (e) { }
    if (CFG.sh) { const ms = [512, 1024, 2048, 2048][Q]; if (sun.shadow.mapSize.x !== ms) { sun.shadow.mapSize.set(ms, ms); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } } }
    applyRD();
  };
  // ---------- distância de renderização ----------
  function applyRD() { const far = DZRD(); window.__dzFar = far; if (!(mode === 'plane' || mode === 'sky' || mode === 'chute')) { cam.far = far; sc.fog.near = far * .3; sc.fog.far = far * .92; cam.updateProjectionMatrix(); } cullNow(); }

  // ---------- painel ----------
  function row(id, label) { const r = document.createElement('div'); r.className = 'row'; r.innerHTML = '<span>' + label + '</span><button id="' + id + '"></button>'; return r; }
  const qRow = $('cQ') && $('cQ').closest('.row');
  if (qRow && !$('cSh')) {
    const sub = document.createElement('p'); sub.className = 'sm'; sub.id = 'cGfxH'; sub.style.margin = '6px 0 0'; sub.innerHTML = '<b>Gráficos</b>';
    qRow.parentNode.insertBefore(sub, qRow);
    const rSh = row('cSh', 'Sombras'), rF = row('cFps', 'Limite de FPS'), rFs = row('cFpsS', 'Mostrar FPS na tela');
    qRow.after(rSh); rSh.after(rF); rF.after(rFs);
    const tip = document.createElement('p'); tip.className = 'sm'; tip.textContent = 'Se o jogo travar: qualidade Baixa, sombras desligadas e 30 FPS. A distância de visão se ajusta sozinha.'; rFs.after(tip);
  }
  function paint() {
    if (!$('cQ')) return; $('cQ').textContent = QN[q()]; $('cSh').textContent = CFG.sh ? 'Ligadas' : 'Desligadas';
    $('cFps').textContent = CFG.fps ? '30 FPS' : '60 FPS'; $('cFpsS').textContent = CFG.showFps ? 'Ligado' : 'Desligado';
  }
  if ($('cQ')) {
    $('cQ').onclick = () => { CFG.q = (q() + 1) % 4; saveCfg(); applyQ(); paint(); };
    $('cSh').onclick = () => { CFG.sh = CFG.sh ? 0 : 1; saveCfg(); applyQ(); paint(); };
    $('cFps').onclick = () => { CFG.fps = CFG.fps ? 0 : 1; saveCfg(); paint(); };
    $('cFpsS').onclick = () => { CFG.showFps = CFG.showFps ? 0 : 1; saveCfg(); paint(); fpsEl.style.display = CFG.showFps ? 'block' : 'none'; };
    $('cfgb').addEventListener('click', () => setTimeout(paint, 0));
  }

  // ---------- limite de FPS e contador ----------
  const fpsEl = document.createElement('div'); fpsEl.id = 'dzFps'; fpsEl.style.cssText = 'position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 4px);transform:translateX(-50%);z-index:30;font:700 11px system-ui;color:#c8ffd8;background:rgba(0,0,0,.45);padding:2px 7px;border-radius:6px;pointer-events:none;display:' + (CFG.showFps ? 'block' : 'none'); document.body.appendChild(fpsEl);
  let lastF = 0, fN = 0, fT = 0;
  const _loop = window.loop;
  if (typeof _loop === 'function') window.loop = function (t) {
    if (CFG.fps && lastF && t - lastF < 30.5) { requestAnimationFrame(window.loop); return; }  // 30 FPS: pula quadros
    lastF = t; fN++; if (t - fT > 1000) { { /* distância automática: FPS baixo -> enxerga menos; FPS bom -> volta */ const fps = fN * 1000 / (t - fT), alvo = CFG.fps ? 27 : 50, k0 = window.__rdK || 1; let k = k0; if (fps < alvo * .8) k = Math.max(.6, k - .1); else if (fps > alvo * .95) k = Math.min(1, k + .05); if (k !== k0 && mode !== 'lobby') { window.__rdK = k; applyRD(); } } if (CFG.showFps) fpsEl.textContent = Math.round(fN * 1000 / (t - fT)) + ' FPS · ' + (ren.info.render.calls | 0) + ' desenhos'; fN = 0; fT = t; }
    _loop(t);
  };

  // ---------- objetos parados congelados + some de longe ----------
  const CULL = []; let frozen = 0;
  function freeze() {
    if (frozen) return; frozen = 1;
    const dyn = new Set(); for (const d of (typeof doors !== 'undefined' ? doors : [])) if (d.piv) dyn.add(d.piv);
    for (const c of (typeof CARS !== 'undefined' ? CARS : [])) if (c.g) dyn.add(c.g);
    const list = window.__dzWorldAdds || [];
    const fr = o => { if (dyn.has(o)) { for (const ch of o.children) fr(ch); return; } o.updateMatrix(); o.matrixAutoUpdate = false; for (const ch of o.children) fr(ch); };
    for (const o of list) { if (!o || dyn.has(o)) continue; fr(o); o.updateMatrixWorld(true); }
    // terreno e mar também não se mexem
    sc.children.forEach(o => { if (o.isMesh && o.geometry && (o.geometry === (typeof TER !== 'undefined' && TER.g))) { o.updateMatrix(); o.matrixAutoUpdate = false; } });
    // lista para sumir de longe: malhas grandes do mundo e grupos de prédio
    const s = new T.Sphere();
    for (const o of list) {
      if (!o || dyn.has(o)) continue;
      if (o.isMesh && o.geometry) { if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); s.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld); if (s.radius > 300) continue; CULL.push({ o, x: s.center.x, z: s.center.z, r: s.radius, glass: o.renderOrder === 2, int: (window.DZMATINT || []).includes(o.material) }); }
      else if (o.isGroup) { const bb = new T.Box3().setFromObject(o); if (bb.isEmpty()) continue; bb.getBoundingSphere(s); if (s.radius > 300) continue; CULL.push({ o, x: s.center.x, z: s.center.z, r: s.radius, grp: 1 });
        o.traverse(m => { if (m !== o && m.isMesh && m.renderOrder === 2 && m.geometry) { if (!m.geometry.boundingSphere) m.geometry.computeBoundingSphere(); const s2 = m.geometry.boundingSphere.clone().applyMatrix4(m.matrixWorld); CULL.push({ o: m, x: s2.center.x, z: s2.center.z, r: s2.radius, glass: 1 }); } }); }
    }
    cullNow();
  }
  function cullNow() {
    if (!frozen || mode === 'lobby') return; /* no lobby o mapa fica escondido */ const px = cam.position.x, pz = cam.position.z, high = mode === 'plane' || mode === 'sky' || mode === 'chute' || cam.position.y > 120;
    const RD = high ? 2400 : DZRD(), GD = Math.min(RD, [90, 130, 180, 240][q()]), ID = high ? 0 : Math.min(RD, [45, 65, 90, 130][q()]);
    for (const e of CULL) { const d = Math.hypot(e.x - px, e.z - pz) - e.r, v = d < (e.int ? ID : e.glass ? GD : RD); if (e.o.visible !== v) e.o.visible = v; }
  }
  setInterval(cullNow, 300);
  // congela quando o mapa terminar de montar
  const tryFreeze = () => { if (window.__dzWorldDone) { freeze(); return; } setTimeout(tryFreeze, 400); };
  setTimeout(tryFreeze, 500);
  window.DZPERF = { freeze, cullNow, CULL };
  try { applyQ(); paint(); } catch (e) { console.warn('perf', e); }
})();
