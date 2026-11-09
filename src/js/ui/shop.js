/* Deadzone · ui/shop.js
 * LOJA DE SUPRIMENTOS (estilo battle royale): categorias Armas · Equipamento · Acessórios · Consumíveis,
 * cada item com a foto 3D do modelo e o preço, detalhe à esquerda, carrinho embaixo e botão Comprar.
 *  - CLÁSSICO: lojinhas (quiosques 3D) espalhadas no mapa, marcadas com um carrinho no minimapa e no mapa.
 *    Paga com MOEDAS ganhas na partida (começa com 25; +10 por abate; +2 por minuto vivo).
 *  - MATA-MATA: a mesma tela na fase de compras, com o dinheiro da rodada.
 *  - DUELO: a mesma tela para escolher a arma da rodada (grátis).
 */
(function () {
  // ---------- tela ----------
  const st = document.createElement('style');
  st.textContent = `
#dzShop{position:fixed;inset:0;z-index:60;display:none;font-family:system-ui,sans-serif;color:#fff;background:rgba(0,0,0,.35)}
#dzShop.on{display:flex}
#dzShop .det{width:34%;max-width:320px;padding:56px 14px 14px 18px;display:flex;flex-direction:column;gap:10px}
#dzShop .det .im{background:#c9cbcd;border-radius:3px;height:44%;min-height:120px;display:flex;align-items:center;justify-content:center;overflow:hidden}
#dzShop .det .im img{width:92%;height:92%;object-fit:contain;filter:drop-shadow(0 4px 6px rgba(0,0,0,.45))}
#dzShop .det b{font:800 16px system-ui}#dzShop .det p{margin:0;font:500 12px system-ui;color:#d7dde2;line-height:1.35}
#dzShop .det .bx{background:rgba(10,14,18,.86);padding:12px;border-radius:3px;display:flex;flex-direction:column;gap:8px}
#dzShop .pn{flex:1;display:flex;flex-direction:column;background:linear-gradient(180deg,rgba(18,24,30,.97),rgba(12,16,20,.97));min-width:0}
#dzShop .hd{display:flex;align-items:center;gap:12px;padding:8px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
#dzShop .hd b{font:900 20px system-ui;flex:1}
#dzShop .coin{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ffe9a0,#e0a52c 60%,#a8701a);color:#6a4410;font:900 10px system-ui;box-shadow:0 0 0 1px #8a5a14 inset;flex:none}
#dzShop .hd .mo{display:flex;align-items:center;gap:6px;font:900 18px system-ui}
#dzShop .hd .x{background:transparent;border:0;color:#fff;font:300 30px system-ui;line-height:1;padding:0 4px}
#dzShop .bd{flex:1;overflow:auto;padding:4px 12px 10px}
#dzShop h6{margin:10px 0 6px;font:800 13px system-ui;display:flex;align-items:center;gap:6px;color:#e8edf2}
#dzShop .gr{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:6px}
#dzShop .tl{position:relative;background:#c4c6c8;border-radius:2px;height:78px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;overflow:hidden;border:2px solid transparent}
#dzShop .tl img{position:absolute;left:6%;top:4%;width:88%;height:66%;object-fit:contain;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45))}
#dzShop .tl .pr{position:relative;width:100%;display:flex;align-items:center;justify-content:center;gap:4px;background:rgba(255,255,255,.55);font:900 13px system-ui;color:#c0281c;padding:2px 0}
#dzShop .tl .pr.free{color:#1f6f2a}
#dzShop .tl .nm{position:absolute;left:4px;top:3px;font:800 9px system-ui;color:#2a2d31;text-transform:uppercase}
#dzShop .tl.sel{border-color:#f3c35a}
#dzShop .tl.no{opacity:.5}
#dzShop .ct{display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba(40,52,64,.95);border-top:1px solid rgba(255,255,255,.1)}
#dzShop .ct .ic{display:flex;flex-direction:column;align-items:center;font:700 10px system-ui;color:#c9d2da}
#dzShop .ct .ic svg{width:30px;height:24px}
#dzShop .ct .its{flex:1;display:flex;gap:6px;overflow:auto;min-height:52px;background:rgba(0,0,0,.25);border-radius:3px;padding:4px}
#dzShop .ct .ci{position:relative;width:60px;height:46px;flex:none;background:#c4c6c8;border-radius:2px}
#dzShop .ct .ci img{width:100%;height:100%;object-fit:contain}
#dzShop .ct .ci i{position:absolute;right:-5px;top:-5px;width:16px;height:16px;border-radius:50%;background:#222;border:1px solid #fff;font:900 12px/14px system-ui;text-align:center;font-style:normal}
#dzShop .ct .ci u{position:absolute;right:2px;bottom:1px;font:900 11px system-ui;color:#111;text-decoration:none}
#dzShop .ct .tt{display:flex;align-items:center;gap:6px;font:900 20px system-ui}
#dzShop .ct .buy{background:linear-gradient(180deg,#ffd84a,#f0b414);color:#2a1d04;border:0;border-radius:3px;padding:12px 22px;font:900 16px system-ui}
#dzShop .ct .buy:disabled{filter:grayscale(1);opacity:.6}
#dzShopB{position:fixed;right:200px;bottom:200px;z-index:6;display:none;width:74px;height:74px;border-radius:50%;border:2px solid rgba(255,255,255,.6);background:rgba(200,140,20,.8);color:#fff;font:800 12px system-ui;align-items:center;justify-content:center;flex-direction:column;gap:2px;user-select:none;-webkit-user-select:none;touch-action:none}
#dzShopB svg{width:26px;height:22px}
@media (max-width:700px){#dzShop .det{display:none}}`;
  document.head.appendChild(st);
  const CART = '<svg viewBox="0 0 32 26"><path d="M2 3h5l4 14h15l3-10H9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/><circle cx="13" cy="22" r="2.4" fill="#fff"/><circle cx="24" cy="22" r="2.4" fill="#fff"/></svg>';
  const IC = { arm: '<svg viewBox="0 0 24 12" width="22" height="11"><path d="M1 4h15l2-2h4v4h-6l-2 2h-3l-1 3H7l1-3H1z" fill="#fff"/></svg>', eq: '<svg viewBox="0 0 16 16" width="15" height="15"><path d="M2 10a6 6 0 0 1 12 0v1H2z" fill="#fff"/></svg>', ac: '<svg viewBox="0 0 16 16" width="15" height="15"><circle cx="8" cy="8" r="5" fill="none" stroke="#fff" stroke-width="2"/><path d="M8 1v4M8 11v4M1 8h4M11 8h4" stroke="#fff" stroke-width="2"/></svg>', co: '<svg viewBox="0 0 16 16" width="15" height="15"><rect x="2" y="4" width="12" height="10" rx="2" fill="#fff"/><path d="M8 6v6M5 9h6" stroke="#c0281c" stroke-width="2"/></svg>' };
  const root = document.createElement('div'); root.id = 'dzShop';
  root.innerHTML = '<div class="det"><div class="im"><img alt=""></div><div class="bx"><b></b><p></p></div></div><div class="pn"><div class="hd"><b>Loja de Suprimentos</b><span class="mo"><span class="coin">$</span><span class="mv">0</span></span><button class="x">×</button></div><div class="bd"></div><div class="ct"><span class="ic">' + CART + 'Carrinho</span><div class="its"></div><span class="tt"><span class="coin">$</span><span class="tv">0</span></span><button class="buy">Comprar</button></div></div>';
  document.body.appendChild(root);
  const q = s => root.querySelector(s);
  let CFGS = null, cart = [], selI = null;
  const pic = it => { try { return it.pic ? it.pic() : ''; } catch (e) { return ''; } };
  function render() {
    const C = CFGS; if (!C) return; const money = C.money();
    q('.hd b').textContent = C.title || 'Loja de Suprimentos'; q('.mv').textContent = money; q('.hd .mo').style.display = C.pick ? 'none' : 'flex';
    const cats = [['arm', 'Armas'], ['eq', 'Equipamento'], ['ac', 'Acessórios'], ['co', 'Consumíveis']];
    let h = ''; for (const [k, n] of cats) { const L = C.items.map((it, i) => [it, i]).filter(([it]) => it.cat === k); if (!L.length) continue;
      h += '<h6>' + IC[k] + n + '</h6><div class="gr">' + L.map(([it, i]) => '<div class="tl' + (selI === i ? ' sel' : '') + (!C.pick && it.price > money ? ' no' : '') + '" data-i="' + i + '"><span class="nm">' + it.name + '</span>' + (pic(it) ? '<img src="' + pic(it) + '">' : '') + '<span class="pr' + (C.pick || !it.price ? ' free' : '') + '">' + (C.pick || !it.price ? 'GRÁTIS' : '<span class="coin">$</span>' + it.price) + '</span></div>').join('') + '</div>'; }
    q('.bd').innerHTML = h;
    const it = selI != null ? C.items[selI] : null;
    q('.det').style.visibility = it ? 'visible' : 'hidden';
    if (it) { q('.det img').src = pic(it) || ''; q('.det b').textContent = it.name; q('.det p').textContent = it.desc || ''; }
    q('.ct').style.display = C.pick ? 'none' : 'flex';
    const tot = cart.reduce((a, i) => a + C.items[i].price, 0), cnt = {};
    for (const i of cart) cnt[i] = (cnt[i] || 0) + 1;
    q('.its').innerHTML = Object.keys(cnt).map(i => '<div class="ci" data-r="' + i + '">' + (pic(C.items[i]) ? '<img src="' + pic(C.items[i]) + '">' : '') + '<i>−</i>' + (cnt[i] > 1 ? '<u>' + cnt[i] + '</u>' : '') + '</div>').join('');
    q('.tv').textContent = tot; q('.buy').disabled = !cart.length || tot > money;
  }
  root.addEventListener('pointerdown', e => {
    e.stopPropagation(); const C = CFGS; if (!C) return;
    if (e.target.closest('.x') || e.target === root) { close(); return; }
    const tl = e.target.closest('.tl'); if (tl) { const i = +tl.dataset.i; selI = i; if (C.pick) { C.onPick(C.items[i]); close(); return; } const it = C.items[i], money = C.money(), tot = cart.reduce((a, j) => a + C.items[j].price, 0); if (tot + it.price <= money) cart.push(i); else say('Moedas insuficientes', 1.2); render(); return; }
    const ci = e.target.closest('.ci'); if (ci) { const k = cart.indexOf(+ci.dataset.r); if (k >= 0) cart.splice(k, 1); render(); return; }
    if (e.target.closest('.buy')) { const tot = cart.reduce((a, j) => a + C.items[j].price, 0); if (!cart.length || tot > C.money()) return; const L = cart.map(i => C.items[i]); cart = []; C.onBuy(L, tot); render(); }
  });
  function open(c) { CFGS = c; cart = []; selI = null; root.classList.add('on'); render(); try { firing = 0; ads = 0; } catch (e) { } }
  function close() { root.classList.remove('on'); if (CFGS && CFGS.onClose) CFGS.onClose(); CFGS = null; }
  window.dzShop = { open, close, render, isOpen: () => root.classList.contains('on') };

  // ---------- itens ----------
  const P_ = (t, x) => () => (window.DZPIC ? DZPIC(t, x) : '');
  const W_ = (v, price, desc) => { const D = WVAR[v]; return { cat: 'arm', name: D.n, price, desc, pic: P_(D.t, v), give: () => give(D.t, { v }, 0, 0) }; };
  const BR_ITEMS = () => [
    W_('rifle_assault_west', 15, 'Fuzil 5.56 equilibrado: boa precisão e cadência.'), W_('rifle_assault_east', 15, 'Fuzil 7.62: mais dano por tiro, mais recuo.'), W_('rifle_battle_west', 20, 'Fuzil de batalha 7.62: muito dano, atira mais devagar.'),
    W_('smg_full_west', 12, 'Submetralhadora 9 mm: rápida para curta distância.'), W_('smg_compact_east', 10, 'Micro UZI: altíssima cadência, pouco alcance.'), W_('shotgun_pump_east', 12, 'Escopeta de bomba: devastadora de perto.'),
    W_('shotgun_auto_west', 18, 'Escopeta automática com tambor.'), W_('sniper_rifle_west', 22, 'Fuzil de precisão semiautomático (7.62).'), W_('sniper_material_west', 35, 'Antimaterial .50: derruba com um tiro.'), W_('pistol_full_west', 6, 'Pistola 9 mm de reserva.'),
    { cat: 'eq', name: 'Capacete', price: 10, desc: 'Capacete balístico com durabilidade total.', pic: P_('helm'), give: () => give('helm', { d: 100 }) },
    { cat: 'eq', name: 'Colete', price: 12, desc: 'Colete balístico com durabilidade total.', pic: P_('vest'), give: () => give('vest', { d: 100 }) },
    { cat: 'eq', name: 'Mochila Nv.2', price: 8, desc: 'Mais espaço para itens.', pic: P_('bp2'), give: () => give('bp2') },
    { cat: 'eq', name: 'Mochila Nv.3', price: 15, desc: 'Mochila grande: o máximo de espaço.', pic: P_('bp3'), give: () => give('bp3') },
    { cat: 'eq', name: 'Escudo de campo', price: 14, desc: 'Escudo de aço dobrável: monte no chão, abre o centro e duas escamas de cada lado. Dá para recolher e usar de novo.', pic: P_('shield'), give: () => give('shield') },
    { cat: 'ac', name: 'Mira holográfica', price: 6, desc: 'Mira 1x para fuzis e snipers.', pic: P_('scope1'), give: () => give('scope1') },
    { cat: 'ac', name: 'Luneta 2x', price: 8, desc: 'Aproxima 2 vezes.', pic: P_('scope2'), give: () => give('scope2') },
    { cat: 'ac', name: 'Luneta 8x', price: 15, desc: 'Só para snipers. Aproxima 8 vezes.', pic: P_('scope8'), give: () => give('scope8') },
    { cat: 'ac', name: 'Silenciador', price: 8, desc: 'Abafa o tiro e esconde o clarão.', pic: P_('sil'), give: () => give('sil') },
    { cat: 'co', name: 'Kit médico', price: 8, desc: 'Recupera toda a vida.', pic: P_('med'), give: () => give('med') },
    { cat: 'co', name: 'Bandagem x3', price: 3, desc: 'Três bandagens.', pic: P_('bandage'), give: () => give('bandage', { n: 3 }) },
    { cat: 'co', name: 'Granada', price: 6, desc: 'Granada de fragmentação.', pic: P_('gren'), give: () => give('gren') },
    { cat: 'co', name: 'Fumaça', price: 4, desc: 'Granada de fumaça.', pic: P_('smoke'), give: () => give('smoke') },
    ...[['a556', '5.56'], ['a545', '5.45'], ['a762', '7.62'], ['a9', '9 mm'], ['a45', '.45 ACP'], ['a12', 'Cal. 12'], ['a50', '.50']].map(([c, n]) => ({ cat: 'co', name: 'Munição ' + n, price: c === 'a50' ? 5 : c === 'a9' || c === 'a12' || c === 'a45' ? 2 : 3, desc: 'Caixa de munição ' + n + '.', pic: P_('ammo', c), give: () => give('ammo', { cal: c }) }))
  ];
  // entrega: o item aparece no chão aos pés e já é pego (se couber)
  function give(t, am, lv, sil) {
    try { mkLoot.y = P.y + .6; mkLoot(t, P.x + (Math.random() - .5) * .6, P.z + (Math.random() - .5) * .6, am || null, lv || 0, sil || 0); mkLoot.y = undefined; const o = loot[loot.length - 1]; if (o && o.t === t) take(o); } catch (e) { console.warn('loja', e); }
  }

  // ---------- moedas (clássico) ----------
  let coins = 0, lk = 0, lt = 0;
  window.dzCoins = () => coins;
  const _sg = window.startGame; if (typeof _sg === 'function') window.startGame = function () { coins = 25; lk = 0; lt = 0; return _sg.apply(this, arguments); };
  setInterval(() => {
    try {
      if (mode === 'lobby' || (typeof MP !== 'undefined' && MP)) return;
      if (kills > lk) { coins += 10 * (kills - lk); say('+' + 10 * (kills - lk) + ' moedas', 1.2); lk = kills; }
      if (mode === 'ground' || mode === 'drive' || mode === 'glide') { lt += .5; if (lt >= 60) { lt = 0; coins += 2; } }
      if (root.classList.contains('on') && CFGS && !CFGS.pick) q('.mv').textContent = CFGS.money();
    } catch (e) { }
  }, 500);

  // ---------- quiosques no mapa ----------
  const KI = []; window.DZSHOPS = KI;
  function kiosk(x, z, ry) {
    const H = GY(x, z, 60), g = new T.Group(); g.position.set(x, H, z); g.rotation.y = ry;
    const M = (c, r, m) => new T.MeshStandardMaterial({ color: lin(c), roughness: r == null ? .8 : r, metalness: m || 0 });
    const tx = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t; };
    const awn = tx(128, 32, (g2, w) => { for (let i = 0; i < 8; i++) { g2.fillStyle = i % 2 ? '#f3f3ee' : '#c8352a'; g2.fillRect(i * w / 8, 0, w / 8, 32); } });
    const sign = tx(256, 96, (g2, w, h) => { g2.fillStyle = '#1b2632'; g2.fillRect(0, 0, w, h); g2.strokeStyle = '#f3c35a'; g2.lineWidth = 6; g2.strokeRect(4, 4, w - 8, h - 8); g2.fillStyle = '#f3c35a'; g2.font = '900 46px system-ui,sans-serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.fillText('LOJA', w / 2 + 24, h / 2 + 2); g2.lineWidth = 5; g2.beginPath(); g2.moveTo(28, 28); g2.lineTo(42, 28); g2.lineTo(52, 62); g2.lineTo(86, 62); g2.lineTo(94, 38); g2.lineTo(46, 38); g2.stroke(); g2.beginPath(); g2.arc(58, 72, 5, 0, 7); g2.arc(82, 72, 5, 0, 7); g2.fill(); });
    const add = (geo, m, px, py, pz) => { const me = new T.Mesh(geo, m); me.position.set(px, py, pz); me.castShadow = true; me.receiveShadow = true; g.add(me); return me; };
    const wood = M(0x7a5a3a), metal = M(0x3c4248, .5, .5), floor = M(0x9a958a, .9);
    add(new T.BoxGeometry(4.6, .18, 3.4), floor, 0, .09, 0);
    add(new T.BoxGeometry(4.4, 2.8, .14), M(0xd8d2c4, .85), 0, 1.5, -1.55);                       // parede do fundo
    for (const s of [-1, 1]) add(new T.BoxGeometry(.14, 2.8, 3.1), M(0xd8d2c4, .85), s * 2.15, 1.5, 0);
    add(new T.BoxGeometry(4.2, 1.05, .6), wood, 0, .7, .9);                                        // balcão
    add(new T.BoxGeometry(4.3, .06, .7), M(0x2c2f33, .4, .3), 0, 1.25, .9);
    for (let i = 0; i < 2; i++) add(new T.BoxGeometry(3.8, .05, .45), metal, 0, 1.3 + i * .55, -1.25);  // prateleiras
    const crate = M(0x6b4a2a); for (const [px, py] of [[-1.3, 1.45], [-.4, 1.45], [.6, 2], [1.4, 2]]) add(new T.BoxGeometry(.5, .32, .32), crate, px, py, -1.25);
    const am = add(new T.BoxGeometry(4.8, .08, 1.6), new T.MeshStandardMaterial({ map: awn, roughness: .9 }), 0, 3.0, 1.5); am.rotation.x = -.35;      // toldo listrado
    add(new T.BoxGeometry(4.6, .2, 3.6), M(0x3c4248, .6, .4), 0, 2.95, -.1);                          // teto
    const sg = add(new T.PlaneGeometry(2.6, .95), new T.MeshBasicMaterial({ map: sign }), 0, 3.65, 1.62); sg.castShadow = false;
    add(new T.BoxGeometry(2.8, 1.05, .08), metal, 0, 3.65, 1.56);
    // armas expostas na parede
    try { for (const [t, v, px] of [['rifle', 'rifle_assault_east', -1], ['sniper', 'sniper_rifle_west', 1]]) { const w = mkW(t, 0, 0, 0, v); w.rotation.set(0, Math.PI / 2, 0); w.position.set(px, 2.35, -1.45); g.add(w); } } catch (e) { }
    sc.add(g); g.updateMatrixWorld(true); g.traverse(o => { o.matrixAutoUpdate = false; o.updateMatrix(); }); g.updateMatrixWorld(true);
    // colisão: paredes e balcão
    const W2 = (lx, lz) => [x + lx * Math.cos(ry) + lz * Math.sin(ry), z - lx * Math.sin(ry) + lz * Math.cos(ry)];
    const colR = (a, b, c, d, yt) => { const p = [W2(a, b), W2(c, d), W2(a, d), W2(c, b)]; addBox({ x0: Math.min(...p.map(v => v[0])), x1: Math.max(...p.map(v => v[0])), z0: Math.min(...p.map(v => v[1])), z1: Math.max(...p.map(v => v[1])), yb: H - 1, yt: H + yt, w: 1 }); };
    colR(-2.2, -1.62, 2.2, -1.48, 2.9); colR(-2.22, -1.6, -2.08, 1.5, 2.9); colR(2.08, -1.6, 2.22, 1.5, 2.9); colR(-2.1, .6, 2.1, 1.2, 1.25);
    const fr = W2(0, 2.4); KI.push({ x: fr[0], z: fr[1], y: H, g });
  }
  // lugares: perto das entradas das cidades/locais, à beira da estrada, longe de construções
  function place() {
    const C = []; const NM = (typeof FLATS !== 'undefined' ? FLATS : []).filter(f => f.n);
    for (const A of NM) {
      let best = null;
      for (const R of (typeof ROADS !== 'undefined' ? ROADS : [])) for (let i = 1; i < R.pts.length - 1; i++) {
        const p = R.pts[i]; if (p[3]) continue; const d = Math.hypot(Math.max(0, A.x0 - p[0], p[0] - A.x1), Math.max(0, A.z0 - p[1], p[1] - A.z1)); if (d < 6 || d > 26) continue;
        const a = R.pts[i - 1], b = R.pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, nx = dz / L, nz = -dx / L;
        for (const s of [1, -1]) { const x = p[0] + nx * 9 * s, z = p[1] + nz * 9 * s; if (FP.some(f => x > f.x0 - 5 && x < f.x1 + 5 && z > f.z0 - 5 && z < f.z1 + 5)) continue; if (TERH(x, z) < 1.5) continue; const h0 = GY(x, z, 60); let ok = 1; for (const [ox, oz] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) if (Math.abs(GY(x + ox, z + oz, 60) - h0) > .7) ok = 0; if (!ok) continue; const sc_ = d; if (!best || sc_ < best.s) best = { x, z, ry: Math.atan2(-nx * s, -nz * s), s: sc_ }; }
      }
      if (best && C.every(c => Math.hypot(c.x - best.x, c.z - best.z) > 90)) C.push(best);
    }
    for (const c of C.slice(0, 7)) try { kiosk(c.x, c.z, c.ry); } catch (e) { console.warn('quiosque', e); }
  }
  const go = () => { if (window.__dzWorldDone && typeof ROADS !== 'undefined' && window.DZPIC !== undefined) place(); else setTimeout(go, 500); };
  setTimeout(go, 800);

  // botão "Loja" perto do quiosque
  const bB = document.createElement('div'); bB.id = 'dzShopB'; bB.innerHTML = CART + 'Loja'; document.body.appendChild(bB);
  const openBR = () => open({ br: 1, title: 'Loja de Suprimentos', items: BR_ITEMS(), money: () => coins, onBuy: (L, tot) => { coins -= tot; for (const it of L) it.give(); say('Compra feita!', 1.2); try { drawSlots(); drawBag(); } catch (e) { } } });
  bB.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); openBR(); });
  setInterval(() => { let n = false; try { if (mode === 'ground' && !(typeof MP !== 'undefined' && MP)) for (const k of KI) if (Math.hypot(k.x - P.x, k.z - P.z) < 3.6 && Math.abs(k.y - P.y) < 2) n = true; } catch (e) { } bB.style.display = n ? 'flex' : 'none'; if (!n && root.classList.contains('on') && CFGS && CFGS.br) close(); }, 200);
  // carrinho no minimapa e no mapa grande
  const drawCart = (g2, x, y, s) => { g2.save(); g2.translate(x, y); g2.fillStyle = '#f3c35a'; g2.strokeStyle = '#1b1404'; g2.lineWidth = 1.5; g2.beginPath(); g2.arc(0, 0, 8 * s, 0, 7); g2.fill(); g2.stroke(); g2.strokeStyle = '#1b1404'; g2.lineWidth = 1.6 * s; g2.beginPath(); g2.moveTo(-5 * s, -3.5 * s); g2.lineTo(-3 * s, -3.5 * s); g2.lineTo(-1.5 * s, 2 * s); g2.lineTo(4 * s, 2 * s); g2.lineTo(5 * s, -1.5 * s); g2.lineTo(-2.5 * s, -1.5 * s); g2.stroke(); g2.restore(); };
  window.dzMMExtra = (mx, X, Z, ra) => { for (const k of KI) { const px = X(k.x), pz = Z(k.z); if (Math.abs(px) > 140 || Math.abs(pz) > 140) continue; mx.save(); mx.translate(px, pz); mx.rotate(ra); drawCart(mx, 0, 0, 1); mx.restore(); } };
  window.dzWMExtra = (g2, X, Y, d) => { for (const k of KI) drawCart(g2, X(k.x), Y(k.z), d * 1.1); };

  // ---------- MATA-MATA: a mesma tela na fase de compras ----------
  try {
    const sqOpen = () => { const S = SQ; if (!S) return; const pk = { pistol: ['pistol', 'pistol_full_west'], shotgun: ['shotgun', 'shotgun_pump_east'], rifle: ['rifle', 'rifle_assault_west'], sniper: ['sniper', 'sniper_rifle_west'] };
      const items = SP.map((s, i) => { const [k, n, pr] = s, w = pk[k]; return { cat: (w || WS[k]) ? 'arm' : /^sc|scope|sil/.test(k) ? 'ac' : 'co', name: n, price: pr, desc: w ? 'Arma da rodada.' : 'Item da rodada.', pic: w ? P_(w[0], w[1]) : P_(k === 'sc1' ? 'scope1' : k === 'sc2' ? 'scope2' : k === 'sc3' ? 'scope8' : k), idx: i }; });
      open({ title: 'Loja de Suprimentos', items, money: () => SQ ? SQ.m : 0, onBuy: L => { for (const it of L) { try { sqBuy(it.idx); } catch (e) { } } }, onClose: () => { try { $('sqs').style.display = 'none'; } catch (e) { } } }); };
    const b = $('sqb'); if (b) b.onclick = () => sqOpen();
    const s2 = document.createElement('style'); s2.textContent = '#sqs{display:none!important}'; document.head.appendChild(s2);
  } catch (e) { }
  // ---------- DUELO: escolher a arma da rodada na mesma tela ----------
  try {
    const PICK = { rifle: 'rifle_assault_west', shotgun: 'shotgun_pump_east', pistol: 'pistol_full_west', sniper: 'sniper_rifle_west' };
    let shown = '';
    setInterval(() => {
      const ws = $('wsel'), wb = $('wsb'); if (!ws || !wb) return; const btns = [...wb.querySelectorAll('button[data-w]')], vis = getComputedStyle(ws).display !== 'none' && btns.length;
      ws.style.opacity = vis ? '0' : ''; ws.style.pointerEvents = vis ? 'none' : '';
      const key = vis ? btns.map(b => b.dataset.w).join() + ($('wst').textContent || '') : '';
      if (key && key !== shown && !root.classList.contains('on')) { shown = key;
        open({ title: ($('wst').textContent || 'Escolha a arma'), pick: 1, onClose: () => { shown = ''; }, money: () => 0, items: btns.map(b => ({ cat: 'arm', name: WS[b.dataset.w] ? (WS[b.dataset.w]._n || WS[b.dataset.w].n) : b.textContent, price: 0, desc: 'Arma desta rodada.', pic: PICK[b.dataset.w] ? P_(b.dataset.w, PICK[b.dataset.w]) : () => '', w: b.dataset.w })), onPick: it => { const bt = wb.querySelector('button[data-w="' + it.w + '"]'); if (bt) bt.click(); } });
      }
      if (!key) { shown = ''; if (root.classList.contains('on') && CFGS && CFGS.pick) close(); }
    }, 250);
  } catch (e) { }
})();
