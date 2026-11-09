/* Deadzone · ui/inventory-pubg.js
 * MOCHILA no estilo dos battle royales: três colunas
 *   CHÃO (itens perto, toque para pegar) | MOCHILA (itens, peso, usar, descartar com quantidade) | EQUIPAMENTO
 *   (armas com acessórios, capacete, colete e mochila).
 * Cada item aparece como objeto 3D (foto renderizada do próprio modelo do jogo).
 * Também: MUNIÇÃO POR CALIBRE (5.56, 7.62, 9 mm, calibre 12 e .50); cada arma só usa a sua.
 */
(function () {
  // ===================== calibres =====================
  const CAL = { a556: '5.56 mm', a545: '5.45 mm', a762: '7.62 mm', a9: '9 mm', a45: '.45 ACP', a12: 'Calibre 12', a50: '.50 BMG' };
  const CALW = { rifle_assault_west: 'a556', rifle_assault_east: 'a545', rifle_battle_west: 'a762', rifle_battle_east: 'a556', smg_full_west: 'a9', smg_full_east: 'a9', smg_compact_east: 'a45', smg_compact_west: 'a9',
    shotgun_pump_east: 'a12', shotgun_pump_west: 'a12', shotgun_auto_east: 'a12', shotgun_auto_west: 'a12', pistol_compact_east: 'a9', pistol_compact_west: 'a45', pistol_full_east: 'a9', pistol_full_west: 'a9',
    sniper_rifle_west: 'a762', sniper_rifle_east: 'a762', sniper_material_west: 'a50', sniper_material_east: 'a50' };
  const CDEF = { rifle: 'a556', shotgun: 'a12', pistol: 'a9', sniper: 'a762' };
  const calOf = q => q ? (CALW[q.v] || CDEF[q.t] || null) : null;
  window.calOf = calOf;
  for (const k in CAL) { bag[k] = bag[k] || 0; W[k] = 1; BN[k] = 'Munição ' + CAL[k]; ICK[k] = 'ammo'; }
  // recarregar: usa a caixa do calibre da arma (a caixa "genérica" antiga ainda serve para qualquer uma)
  const _sr = startReload;
  startReload = function () {
    const s = cur >= 0 ? slots[cur] : null, c = calOf(s);
    if (s && c && s.res <= 0 && !(bag[c] > 0) && !(bag.ammo > 0) && s.t !== 'bow') { say('Sem munição ' + CAL[c], 1.6); return; }
    if (s && c && s.res <= 0 && bag[c] > 0 && !rlOn && !cast && mode === 'ground') { bag[c]--; s.res += WS[s.t].mag * 2; drawBag(); }
    return _sr.apply(this, arguments);
  };
  // munição no chão: do calibre da arma que nasceu ao lado; senão, um calibre qualquer
  let lastW = null;
  const _mk = mkLoot;
  mkLoot = function (t, x, z, am, lv, sil) {
    _mk(t, x, z, am, lv, sil); const o = loot[loot.length - 1]; if (!o) return;
    if (WS[o.t]) lastW = { o, x, z, t: performance.now() };
    if (o.t === 'ammo') {
      if (am && am.cal && CAL[am.cal]) o.cal = am.cal;
      else if (lastW && performance.now() - lastW.t < 50 && Math.hypot(lastW.x - x, lastW.z - z) < 3) o.cal = calOf(lastW.o) || 'a556';
      else { const L = ['a556', 'a556', 'a545', 'a762', 'a762', 'a9', 'a9', 'a45', 'a12', 'a12', 'a50']; o.cal = L[Math.floor(Math.random() * L.length)]; }
      o.n = (am && am.n) || 1;
    } else if (am && am.n > 1) o.n = am.n;
  };
  // itens que já estavam no chão quando este arquivo carregou
  try { let pw = null; for (const o of loot) { if (WS[o.t]) pw = o; else if (o.t === 'ammo' && !o.cal) o.cal = (pw && Math.hypot(pw.x - o.x, pw.z - o.z) < 3 ? calOf(pw) : null) || ['a556', 'a545', 'a762', 'a9', 'a45', 'a12'][Math.floor(Math.random() * 6)]; } } catch (e) { }
  // pegar: munição vai para o calibre certo; itens com quantidade entram todos
  const _tk = take_;
  take_ = function (o) {
    const tk = TK[o.t];
    if (o.t === 'ammo' || (tk && o.n > 1)) {
      const k = o.t === 'ammo' ? (o.cal || 'ammo') : tk[0], n = o.n || 1;
      if (!addBag(k, n, 'Guardou: ' + (BN[k] || k) + (n > 1 ? ' x' + n : ''))) return;
      sc.remove(o.top); loot.splice(loot.indexOf(o), 1); lkey = ''; drawSlots(); return;
    }
    return _tk.apply(this, arguments);
  };
  // soltar com quantidade (vira um item só no chão)
  function dropN(k, n) {
    n = Math.max(1, Math.min(n | 0, bag[k] | 0)); if (!n) return;
    bag[k] -= n; const p = dropPos(); mkLoot(ICK[k] || k, p.x, p.z, CAL[k] ? { cal: k, n } : { n }); lkey = ''; drawBag(); say('Soltou: ' + BN[k] + (n > 1 ? ' x' + n : ''), 1.2);
  }
  window.dropN = dropN;

  // ===================== fotos 3D dos itens =====================
  let R3 = null; const PIC = {}; window.DZPICCLR = () => { for (const k in PIC) delete PIC[k]; };
  function r3() {
    if (R3) return R3;
    const cv = document.createElement('canvas'); cv.width = 192; cv.height = 120;
    const r = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, preserveDrawingBuffer: true }); r.outputEncoding = T.sRGBEncoding; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.5;
    const s = new T.Scene(); s.add(new T.HemisphereLight(0xffffff, 0x445566, 1.1)); const d = new T.DirectionalLight(0xffffff, 1.6); d.position.set(2, 3, 4); s.add(d); const d2 = new T.DirectionalLight(0x9ec8ff, 1.4); d2.position.set(-4, 2, 0); s.add(d2); const d3 = new T.DirectionalLight(0xffffff, .9); d3.position.set(-2, 4, 2); s.add(d3);
    const c = new T.PerspectiveCamera(28, 192 / 120, .01, 50);
    R3 = { r, s, c, cv }; return R3;
  }
  function pic(key, build) {
    if (PIC[key]) return PIC[key];
    try {
      const { r, s, c, cv } = r3(); const o = build(); if (!o) return '';
      const g = new T.Group(); g.add(o); s.add(g); g.updateMatrixWorld(true);
      const bb = new T.Box3().setFromObject(g), sz = bb.getSize(new T.Vector3()), ct = bb.getCenter(new T.Vector3());
      const rad = Math.max(sz.x, sz.y, sz.z) * .62 || .3;
      const side = sz.z > sz.x * 1.6; // arma (comprida em z): de lado
      if (side) c.position.set(ct.x - rad * 2.45, ct.y + rad * .35, ct.z + rad * .12); else c.position.set(ct.x + rad * 2.2, ct.y + rad * 1.9, ct.z + rad * 2.9);
      c.lookAt(ct); r.setClearColor(0, 0); r.clear(); r.render(s, c); PIC[key] = cv.toDataURL('image/png'); s.remove(g);
    } catch (e) { console.warn('foto', key, e); PIC[key] = ''; }
    return PIC[key];
  }
  const CALC = { a556: 0x4f6b3a, a762: 0x6b4a2a, a9: 0x2f4f6f, a12: 0x8a2a20, a50: 0x3a3a3a };
  function itemPic(t, extra) {
    if (WS[t] && t !== 'bow') return pic('w:' + t + ':' + (extra || ''), () => mkW(t, 0, 0, 0, extra));
    if (t === 'ammo' && extra) return pic('a:' + extra, () => DZItem('ammo:' + extra));
    if (window.DZItem && DZItem.has(t)) return pic('i:' + t, () => DZItem(t));
    return '';
  }
  window.DZPIC = itemPic;
  const img = (src, cls) => src ? '<img class="' + (cls || 'ph') + '" src="' + src + '" alt="">' : '<span class="ph"></span>';

  // ===================== tela =====================
  const st = document.createElement('style');
  st.textContent = `
#pk.dz3{padding:0;gap:0;background:linear-gradient(160deg,rgba(12,16,20,.97),rgba(20,26,32,.96));overflow:hidden;font-family:system-ui,sans-serif}
#pk.dz3 .top{display:flex;align-items:center;gap:14px;padding:8px 14px;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.3)}
#pk.dz3 .top b{font:900 15px system-ui;letter-spacing:2px;color:#f3c35a;text-transform:uppercase}
#pk.dz3 .cap{flex:1;max-width:340px;display:flex;align-items:center;gap:8px;color:#cfd6dd;font:700 12px system-ui}
#pk.dz3 .cap i{flex:1;height:6px;background:rgba(255,255,255,.12);border-radius:3px;overflow:hidden}#pk.dz3 .cap i u{display:block;height:100%;background:linear-gradient(90deg,#e0a52c,#f6cf6a)}
#pk.dz3 #pkx{margin-left:auto;background:transparent;border:1px solid rgba(255,255,255,.35);color:#fff;border-radius:5px;padding:5px 14px;font:700 13px system-ui}
#pk.dz3 .cols{flex:1;display:flex;min-height:0}
#pk.dz3 .col{display:flex;flex-direction:column;min-height:0;border-right:1px solid rgba(255,255,255,.06)}
#pk.dz3 .col h5{margin:0;padding:7px 12px;font:800 11px system-ui;letter-spacing:1.5px;color:#9aa6b2;text-transform:uppercase;background:rgba(255,255,255,.03)}
#pk.dz3 .ls{flex:1;overflow:auto;padding:6px;display:flex;flex-direction:column;gap:4px}
#pk.dz3 .gr{width:24%}#pk.dz3 .bg{width:34%}#pk.dz3 .eq{flex:1;border-right:0}
#pk.dz3 .it{display:flex;align-items:center;gap:8px;padding:4px 8px 4px 4px;border-radius:5px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);color:#e8edf2;font:700 12px system-ui;min-height:44px}
#pk.dz3 .it .ph{width:62px;height:39px;flex:none;object-fit:contain;filter:drop-shadow(0 2px 3px rgba(0,0,0,.6))}
#pk.dz3 .it .nm{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pk.dz3 .it .nm small{display:block;font:600 10px system-ui;color:#8f9aa5}
#pk.dz3 .it .q{font:900 13px system-ui;color:#f3c35a}
#pk.dz3 .it.sel{border-color:#f3c35a;background:rgba(243,195,90,.12)}
#pk.dz3 .act{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:6px 8px;margin:-2px 0 2px;background:rgba(243,195,90,.08);border-radius:0 0 5px 5px}
#pk.dz3 .act button,#pk.dz3 .wp button{background:linear-gradient(180deg,#f6cf6a,#e0a52c);color:#1b1404;border:0;border-radius:4px;font:800 11px system-ui;padding:6px 10px;margin:0}
#pk.dz3 .act button.gh,#pk.dz3 .wp button.gh{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.25)}
#pk.dz3 .act input{width:90px;accent-color:#f3c35a}#pk.dz3 .act span{font:800 12px system-ui;color:#fff;min-width:22px;text-align:center}
#pk.dz3 .wp{position:relative;display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)}
#pk.dz3 .wp.on{border-color:#f3c35a}
#pk.dz3 .wp .ph{width:120px;height:62px;flex:none;object-fit:contain;filter:drop-shadow(0 3px 4px rgba(0,0,0,.6))}
#pk.dz3 .wp .tx{flex:1;min-width:0}#pk.dz3 .wp .tx b{display:block;font:800 13px system-ui;color:#fff}#pk.dz3 .wp .tx small{display:block;font:600 11px system-ui;color:#9aa6b2;margin-top:2px}
#pk.dz3 .wp .no{position:absolute;left:6px;top:4px;font:900 10px system-ui;color:#8f9aa5}
#pk.dz3 .wp .chips{display:flex;gap:4px;margin-top:4px;flex-wrap:wrap}#pk.dz3 .wp .chips i{font-style:normal;font:700 10px system-ui;background:rgba(90,200,255,.15);border:1px solid rgba(90,200,255,.4);color:#bfe6ff;border-radius:3px;padding:1px 5px}
#pk.dz3 .wp.em{opacity:.5}
#pk.dz3 .ar{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
#pk.dz3 .ar .wp{flex-direction:column;align-items:stretch;text-align:center;padding:4px}
#pk.dz3 .ar .wp .ph{width:100%;height:46px}
#pk.dz3 .dur{height:4px;background:rgba(255,255,255,.12);border-radius:2px;overflow:hidden;margin-top:3px}#pk.dz3 .dur u{display:block;height:100%;background:#7be07b}
#pk.dz3 .emp{color:#6f7a85;font:600 12px system-ui;text-align:center;padding:16px 4px}`;
  document.head.appendChild(st);

  const PK = $('pk'); PK.classList.add('dz3'); PK.innerHTML = '<div class="top"><b>Mochila</b><div class="cap"><span id="dzCapT"></span><i><u id="dzCapB"></u></i></div><button id="pkx">Fechar</button></div><div class="cols"><div class="col gr"><h5>Chão</h5><div class="ls" id="dzGr"></div></div><div class="col bg"><h5>Mochila</h5><div class="ls" id="dzBg"></div></div><div class="col eq"><h5>Equipamento</h5><div class="ls" id="dzEq"></div></div></div>';
  let SEL = null, QN = 1;
  const nearL = () => loot.filter(o => Math.hypot(o.x - P.x, o.z - P.z) < 3.2 && Math.abs((o.y || 0) - P.y) < 2.6).slice(0, 30);
  const LBL = { med: 'Usar', band: 'Usar', fuel: 'Abastecer', sc1: 'Equipar', sc2: 'Equipar', sc3: 'Equipar', sil: 'Equipar' };
  const lnm = o => WS[o.t] ? (window.wNm ? wNm(o) : WS[o.t].n) : o.t === 'ammo' ? 'Munição ' + (CAL[o.cal] || '') : (LN[o.t] || BN[TK[o.t] && TK[o.t][0]] || o.t);
  function render() {
    // capacidade
    const u = bagUsed(), cp = CAPS[bagLv]; $('dzCapT').textContent = 'Nv.' + bagLv + ' · ' + u + '/' + cp; $('dzCapB').style.width = Math.min(100, u / cp * 100) + '%';
    // chão
    const G = nearL(); $('dzGr').innerHTML = G.length ? G.map(o => '<div class="it" data-g="' + o.id + '">' + img(itemPic(o.t, WS[o.t] ? o.v : o.cal)) + '<span class="nm">' + lnm(o) + (WS[o.t] && o.sc ? '<small>com luneta</small>' : '') + '</span>' + (o.n > 1 ? '<span class="q">x' + o.n + '</span>' : '') + '</div>').join('') : '<div class="emp">Nada por perto</div>';
    // mochila
    let h = ''; const keys = Object.keys(W).filter(k => bag[k] > 0);
    for (const k of keys) {
      const t = ICK[k] || k, cal = CAL[k] ? k : null;
      h += '<div class="it' + (SEL === k ? ' sel' : '') + '" data-b="' + k + '">' + img(itemPic(t, cal)) + '<span class="nm">' + BN[k] + '<small>' + (W[k] * bag[k]) + ' de peso' + (cal && cur >= 0 && calOf(slots[cur]) === k ? ' · da arma na mão' : '') + '</small></span><span class="q">' + bag[k] + '</span></div>';
      if (SEL === k) { QN = Math.max(1, Math.min(QN, bag[k])); h += '<div class="act">' + (LBL[k] ? '<button data-use="' + k + '">' + LBL[k] + '</button>' : '') + (bag[k] > 1 ? '<input type="range" min="1" max="' + bag[k] + '" value="' + QN + '" data-qn="1"><span id="dzQn">' + QN + '</span>' : '') + '<button class="gh" data-drop="' + k + '">Descartar' + (bag[k] > 1 ? '' : '') + '</button></div>'; }
    }
    $('dzBg').innerHTML = h || '<div class="emp">Mochila vazia</div>';
    // equipamento: armas + capacete, colete, mochila
    const nmS = ['1', '2', '3']; let e = '';
    for (let i = 0; i < 3; i++) {
      const q = slots[i];
      if (!q) { e += '<div class="wp em"><span class="no">' + nmS[i] + '</span>' + '<span class="ph"></span><div class="tx"><b>' + (i < 2 ? 'Arma principal' : 'Pistola') + '</b><small>vazio</small></div></div>'; continue; }
      const c = calOf(q);
      e += '<div class="wp' + (i === cur ? ' on' : '') + '" data-w="' + i + '"><span class="no">' + nmS[i] + '</span>' + img(q.t === 'bow' ? '' : itemPic(q.t, q.v)) + '<div class="tx"><b>' + (window.wNm ? wNm(q) : WS[q.t].n) + '</b><small>' + q.mag + ' / ' + q.res + (c ? ' · ' + CAL[c] + ' (' + (bag[c] | 0) + ' cx)' : '') + '</small><div class="chips">' + (q.sc ? '<i data-u="sc' + q.sc + '" data-i="' + i + '">Luneta ' + (q.sc === 3 ? 8 : q.sc) + 'x ✕</i>' : '') + (q.sil ? '<i data-u="sil" data-i="' + i + '">Silenciador ✕</i>' : '') + '</div></div><button class="gh" data-x="' + i + '">Soltar</button></div>';
    }
    const arm = (t, lab, val, dk) => '<div class="wp' + (val > 0 ? '' : ' em') + '">' + img(itemPic(t)) + '<b style="font:800 11px system-ui;color:#fff">' + lab + '</b><div class="dur"><u style="width:' + Math.max(0, Math.min(100, val)) + '%"></u></div>' + (val > 0 && dk ? '<button class="gh" style="margin-top:4px" data-r="' + dk + '">Soltar</button>' : '') + '</div>';
    e += '<div class="ar">' + arm('helm', 'Capacete', ARM.helm, 'helm') + arm('vest', 'Colete', ARM.vest, 'vest') + arm(bagLv ? 'bp' + bagLv : 'bp1', 'Mochila Nv.' + bagLv, bagLv ? 100 : 0, null) + '</div>';
    $('dzEq').innerHTML = e;
  }
  renderPk = render;
  PK.onclick = null;
  PK.addEventListener('pointerdown', ev => {
    const t = ev.target; if (t.matches && t.matches('input[type=range]')) return;
    if (t.closest('#pkx')) { ev.preventDefault(); PK.style.display = 'none'; SEL = null; return; }
    const g = t.closest('[data-g]'); if (g) { const o = loot.find(l => String(l.id) === g.dataset.g); if (o) { try { take(o); } catch (e) { } } render(); return; }
    const ub = t.closest('[data-use]'); if (ub) { const k = ub.dataset.use; if (k[0] === 's' && k !== 'smoke') equipAtt(k); else if (k === 'band' || k === 'med') { useItem(k); PK.style.display = 'none'; } else if (k === 'fuel') refuel(); drawBag(); drawSlots(); render(); return; }
    const db = t.closest('[data-drop]'); if (db) { dropN(db.dataset.drop, QN); SEL = null; QN = 1; render(); return; }
    const b = t.closest('[data-b]'); if (b) { SEL = SEL === b.dataset.b ? null : b.dataset.b; QN = 1; render(); return; }
    const u = t.closest('[data-u]'); if (u) { const q = slots[+u.dataset.i], k = u.dataset.u; if (bagUsed() + W[k] > CAPS[bagLv]) say('Mochila cheia', 2); else { bag[k]++; if (k === 'sil') q.sil = 0; else q.sc = 0; } drawSlots(); render(); return; }
    const x = t.closest('[data-x]'); if (x) { dropW(+x.dataset.x); drawSlots(); render(); return; }
    const r = t.closest('[data-r]'); if (r) { dropArm(r.dataset.r); render(); return; }
    const w = t.closest('[data-w]'); if (w && slots[+w.dataset.w]) { try { selSlot(+w.dataset.w); } catch (e) { } render(); }
  });
  PK.addEventListener('input', ev => { if (ev.target.dataset.qn) { QN = +ev.target.value; const s = $('dzQn'); if (s) s.textContent = QN; } });
  // a lista do chão muda enquanto a mochila está aberta
  setInterval(() => { if (PK.style.display === 'flex') { const k = nearL().map(o => o.id).join(); if (k !== PK.dataset.gk) { PK.dataset.gk = k; render(); } } }, 400);
})();
