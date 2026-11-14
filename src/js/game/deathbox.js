/* Deadzone · game/deathbox.js
 * CAIXA DE MORTE (como nos battle royales): quando um bot ou o jogador morre, fica no chão uma caixa
 * com o loot dele. Os itens aparecem em "Nos arredores" quando você chega perto; a caixa some
 * quando fica vazia.
 *  - Bot: a arma que usava (com munição), munição extra, às vezes cura e granada, e o colete,
 *    capacete e mochila que ele estava usando (os mesmos que aparecem no corpo dele).
 *  - Jogador: as armas, a mochila inteira e o equipamento.
 */
(function () {
  const BOXES = []; let bid = 0;
  // ---------- modelo da caixa ----------
  let GEO = null;
  function model() {
    if (!GEO) {
      const base = new T.MeshStandardMaterial({ color: 0x1f2618, roughness: .8, metalness: .3 }), dark = new T.MeshStandardMaterial({ color: 0x0e110b, roughness: .7, metalness: .4 }),
        edge = new T.MeshStandardMaterial({ color: 0x4a4636, roughness: .45, metalness: .7 }), tag = new T.MeshStandardMaterial({ color: 0x9a7a22, roughness: .55, metalness: .2 });
      GEO = { base, dark, edge, tag };
    }
    const g = new T.Group(), B = (w, h, d, m, x, y, z) => { const me = new T.Mesh(new T.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; g.add(me); return me; };
    B(.78, .4, .5, GEO.base, 0, .2, 0);             // corpo
    B(.82, .08, .54, GEO.dark, 0, .44, 0);          // tampa
    for (const x of [-.3, .3]) B(.06, .42, .52, GEO.dark, x, .21, 0); // cintas
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(.06, .5, .06, GEO.edge, sx * .37, .25, sz * .23); // cantoneiras
    for (const sx of [-1, 1]) B(.12, .04, .05, GEO.dark, sx * .43, .3, 0); // alças
    B(.22, .1, .01, GEO.tag, 0, .24, .256);         // etiqueta
    return g;
  }
  // ---------- cria a caixa e guarda os itens "dentro" dela ----------
  function spawn(x, z, y, ry, items) {
    if (!items.length) return null;
    const id = ++bid, g = model(), gy = GY(x, z, y != null ? y : P.y);
    g.position.set(x, gy, z); g.rotation.y = ry || 0; sc.add(g);
    const prevY = mkLoot.y; mkLoot.y = gy + .3;
    for (const it of items) {
      try {
        mkLoot(it.t, x, z, it.am || null, it.lv || 0, it.sil || 0); const o = loot[loot.length - 1];
        if (it.v) o.v = it.v; if (it.cal) o.cal = it.cal; if (it.am && it.am.n) o.n = it.am.n;
        o.box = id; o.top.visible = false;
      } catch (e) { }
    }
    mkLoot.y = prevY;
    const B = { id, g, x, z }; BOXES.push(B); return B;
  }
  // caixa vazia some
  setInterval(() => {
    for (let i = BOXES.length - 1; i >= 0; i--) { const B = BOXES[i]; if (!loot.some(o => o.box === B.id)) { sc.remove(B.g); BOXES.splice(i, 1); } }
  }, 400);
  window.DZBOXES = BOXES;

  const R_ = (a, b) => a + Math.random() * (b - a);
  // ---------- bot ----------
  window.dzDeathBox = function (b) {
    const L = [];
    if (b.w && WS[b.w]) L.push({ t: b.w, v: b.v, sil: b.sil, am: { mag: WS[b.w].mag, res: Math.round(WS[b.w].mag * R_(1, 3)) } });
    if (b.w && b.w !== 'bow') L.push({ t: 'ammo' });
    if (Math.random() < .6) L.push({ t: 'bandage' }); if (Math.random() < .25) L.push({ t: 'bandage' });
    if (Math.random() < .3) L.push({ t: 'med' });
    if (Math.random() < .25) L.push({ t: 'gren' });
    // equipamento que ele estava usando (o mesmo do corpo)
    let sd = null; try { sd = b.g && b.g.rig ? b.g.rig.seed : null; } catch (e) { }
    if (sd != null) {
      if (sd % 3 !== 1) L.push({ t: 'vest', am: { d: Math.round(R_(35, 100)) } });
      if (sd % 2 === 0) L.push({ t: 'helm', am: { d: Math.round(R_(35, 100)) } });
      if (sd % 4 !== 0) L.push({ t: sd % 7 === 0 ? 'bp2' : 'bp1' });
    }
    return spawn(b.x, b.z, b.g ? b.g.position.y + .5 : TERH(b.x, b.z) + .5, b.g ? b.g.rotation.y : 0, L);
  };
  // ---------- jogador ----------
  window.dzPlayerBox = function () {
    const L = [];
    try { for (const s of slots) if (s) L.push({ t: s.t, v: s.v, sil: s.sil, lv: s.sc, am: { mag: s.mag, res: s.res } }); } catch (e) { }
    try {
      const MAP = { band: 'bandage', med: 'med', gren: 'gren', smoke: 'smoke', knife: 'knife', fuel: 'fuel', ammo: 'ammo', sc1: 'scope1', sc2: 'scope2', sc3: 'scope8', sil: 'sil' };
      for (const k in MAP) { const n = Math.min(12, bag[k] | 0); for (let i = 0; i < n; i++) L.push({ t: MAP[k] }); }
    } catch (e) { }
    try { if (ARM.vest > 5) L.push({ t: 'vest', am: { d: Math.round(ARM.vest) } }); if (ARM.helm > 5) L.push({ t: 'helm', am: { d: Math.round(ARM.helm) } }); if (bagLv > 0) L.push({ t: 'bp' + bagLv }); } catch (e) { }
    return spawn(P.x, P.z, P.y, typeof pl !== 'undefined' ? pl.rotation.y : 0, L);
  };
  // morte do jogador (modo clássico): deixa a caixa
  window.addEventListener('load', () => {
    const _d = die;
    die = function () { try { if (mode === 'ground' && !(typeof MP !== 'undefined' && MP)) dzPlayerBox(); } catch (e) { } return _d.apply(this, arguments); };
  });
  // nova partida: limpa as caixas
  const _sg = window.startGame; if (typeof _sg === 'function') window.startGame = function () { for (const B of BOXES) sc.remove(B.g); BOXES.length = 0; try { bagLv = 0; } catch (e) { } return _sg.apply(this, arguments); };
})();
