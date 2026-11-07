/* Deadzone · combat/weapon-models.js
 * Modelos 3D novos das armas e dos itens (feitos do zero).
 * - Silhuetas recortadas (coronha, empunhadura, carregador curvo) com bordas arredondadas.
 * - Materiais de metal, polímero e madeira.
 * - Mesmas peças animadas de antes (ferrolho, carregador, slide, bomba, cartucho, clarão),
 *   então recarregar/atirar continuam funcionando igual.
 * Substitui mkW() (armas) e fornece DZItem() (itens do chão).
 */
(function () {
  const Mt = (c, me, ro) => new T.MeshStandardMaterial({ color: lin(c), metalness: me, roughness: ro });
  const WM = {
    steel: Mt(0x2b2e33, .75, .32), black: Mt(0x17181b, .55, .45), poly: Mt(0x1e2023, .05, .72), polyG: Mt(0x3a3d33, .05, .75),
    tan: Mt(0x8a7a5a, .05, .7), alu: Mt(0x3a3d42, .7, .3), chrome: Mt(0x9a9fa6, .9, .18), wood: Mt(0x6b4526, .02, .6),
    wood2: Mt(0x4a2e18, .02, .55), rub: Mt(0x0b0b0c, 0, .92), brass: Mt(0xb08a3a, .85, .3), red: Mt(0xa32020, .1, .5),
    glass: new T.MeshStandardMaterial({ color: lin(0x203a4a), metalness: .9, roughness: .05, transparent: true, opacity: .75 }),
    lens: new T.MeshBasicMaterial({ color: 0x0c1a24 }), dot: new T.MeshBasicMaterial({ color: 0xff2020 })
  };
  window.WMODEL = WM;

  // perfil 2D (z, y) extrudado na largura w -> peça com silhueta de verdade e bordas arredondadas
  function prof(pts, w, bev) {
    const s = new T.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath();
    const b = bev == null ? Math.min(.004, w * .15) : bev;
    const g = new T.ExtrudeGeometry(s, { depth: w - b * 2, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: 1, curveSegments: 6 });
    g.rotateY(-Math.PI / 2); g.translate((w - b * 2) / 2, 0, 0); return g;
  }
  const box = (w, h, d) => new T.BoxGeometry(w, h, d);
  const cyl = (r1, r2, l, n) => new T.CylinderGeometry(r1, r2, l, n || 12);

  function build(t, lv, sil, vm) {
    const g = new T.Group(), it = [], u = g.ud = { t }, M = WM;
    const add = (geo, m, x, y, z, rx, ry, rz) => it.push([geo, m, x || 0, y || 0, z || 0, rx || 0, ry || 0, rz || 0]);
    const Z = (r1, r2, l, m, x, y, z, n) => add(cyl(r1, r2, l, n), m, x, y, z, Math.PI / 2);   // cilindro ao longo do cano (z)
    const sub = (x, y, z) => { const q = new T.Group(); q.position.set(x, y, z); g.add(q); return q; };
    const flash = (z, r, y) => { if (vm) return; const f = new T.Mesh(new T.ConeGeometry(r, r * 3.2, 7), FLM_); f.rotation.x = -Math.PI / 2; f.position.set(0, y || .01, z); f.visible = false; g.add(f); u.fl = f; };
    const rail = (z0, z1, y) => { add(box(.026, .008, z1 - z0), M.black, 0, y, (z0 + z1) / 2); for (let z = z0 + .006; z < z1; z += .011) add(box(.03, .005, .005), M.black, 0, y + .0055, z); };

    if (t === 'rifle') { // ---------- fuzil (estilo M4) ----------
      add(prof([[-.13, .005], [.19, .005], [.19, .07], [-.13, .07]], .056), M.alu, 0, 0, 0);           // receptor superior
      add(prof([[-.12, -.05], [.11, -.05], [.12, .005], [-.14, .005]], .052), M.alu, 0, 0, 0);          // receptor inferior
      add(prof([[-.03, -.05], [.01, -.05], [-.01, -.15], [-.06, -.155], [-.075, -.14]], .04), M.poly, 0, 0, 0); // empunhadura
      add(box(.006, .03, .07), M.black, 0, -.064, .035);                                              // guarda-mato
      rail(-.12, .19, .074);
      add(cyl(.032, .032, .34, 8), M.black, 0, .035, .36, Math.PI / 2, 0, Math.PI / 8);            // guarda-mão octogonal
      rail(.2, .52, .072); for (const s of [-1, 1]) for (let k = 0; k < 5; k++) add(box(.004, .014, .045), M.rub, s * .033, .035, .24 + k * .06);
      Z(.012, .012, .24, M.steel, 0, .035, .64); Z(.018, .016, .05, M.black, 0, .035, .78, 10);      // cano e quebra-chama
      for (let k = 0; k < 4; k++) add(box(.004, .02, .03), M.steel, 0, .035 + Math.cos(k * 1.57) * .017, .78);
      add(box(.014, .045, .02), M.black, 0, .07, .55); add(box(.022, .02, .03), M.black, 0, .05, .55); // massa de mira / bloco de gás
      Z(.018, .018, .22, M.black, 0, .04, -.24);                                                         // tubo da coronha
      add(prof([[-.2, .07], [-.38, .075], [-.4, .07], [-.4, -.06], [-.36, -.06], [-.24, .015], [-.2, .015]], .046), M.poly, 0, 0, 0); // coronha
      add(box(.05, .13, .012), M.rub, 0, .005, -.405);
      add(box(.008, .012, .02), M.steel, .03, .045, -.02); Z(.008, .008, .02, M.steel, .033, .03, .02);  // retém e forward assist
      add(box(.003, .018, .05), M.black, .029, .04, .06);                                                // janela de ejeção
      const mg = sub(0, -.05, .07);                                                                      // carregador curvo
      bake(mg, [[box(.03, .06, .07), M.black, 0, -.03, 0, -.06], [box(.03, .06, .068), M.black, 0, -.085, .008, -.16], [box(.03, .055, .066), M.black, 0, -.135, .022, -.26], [box(.034, .012, .07), M.poly, 0, -.165, .03, -.3]]);
      u.mag = mg; u.my = -.05;
      const bo = sub(0, .075, -.11); bake(bo, [[box(.02, .012, .05), M.black, 0, 0, 0], [box(.05, .01, .012), M.black, 0, .004, -.02]]); u.bolt = bo; u.bz = -.11;
      flash(.83, .045, .035);
    } else if (t === 'sniper') { // ---------- rifle de precisão (ferrolho) ----------
      add(prof([[-.12, -.01], [.2, -.01], [.2, .06], [-.12, .06]], .052), M.steel, 0, 0, 0);
      add(prof([[.2, -.005], [.48, .0], [.48, .05], [.2, .055]], .056), M.polyG, 0, 0, 0);               // guarda-mão
      add(prof([[-.12, -.01], [.12, -.01], [.12, -.045], [.02, -.055], [-.02, -.13], [-.07, -.135], [-.09, -.07], [-.2, -.06], [-.42, -.09], [-.48, -.08], [-.48, .06], [-.4, .07], [-.2, .055], [-.12, .055]], .05), M.polyG, 0, 0, 0); // coronha com empunhadura
      add(box(.052, .03, .02), M.rub, 0, .0, -.49); add(box(.006, .03, .06), M.black, 0, -.05, .04);
      Z(.014, .011, .62, M.steel, 0, .03, .78); Z(.022, .02, .08, M.black, 0, .03, 1.12, 10);           // cano e freio de boca
      for (const s of [-1, 1]) add(box(.004, .012, .05), M.black, s * .021, .03, 1.12);
      rail(-.1, .2, .066);
      for (const s of [-1, 1]) add(box(.012, .012, .2), M.black, s * .02, -.02, .52, .05, 0, s * .25); // bipé dobrado
      const mg = sub(0, -.02, .07); bake(mg, [[box(.034, .05, .07), M.black, 0, -.025, 0]]); u.mag = mg; u.my = -.02;
      const bo = sub(.03, .045, -.07); bake(bo, [[cyl(.006, .006, .05, 8), M.steel, .02, 0, 0, 0, 0, Math.PI / 2], [new T.SphereGeometry(.011, 10, 8), M.steel, .045, -.004, 0]]); u.bolt = bo; u.bz = -.07;
      flash(1.17, .05, .03);
    } else if (t === 'shotgun') { // ---------- espingarda de bomba ----------
      add(prof([[-.12, -.04], [.17, -.04], [.17, .055], [-.12, .055]], .06), M.black, 0, 0, 0);
      add(box(.006, .03, .07), M.black, 0, -.055, -.02);
      Z(.017, .017, .5, M.steel, 0, .035, .42); Z(.015, .015, .4, M.black, 0, -.005, .37);               // cano e tubo do carregador
      add(box(.006, .008, .48), M.steel, 0, .055, .42); add(box(.008, .018, .008), M.chrome, 0, .062, .66);
      add(prof([[-.12, .05], [-.48, .02], [-.5, .015], [-.5, -.1], [-.46, -.1], [-.18, -.045], [-.14, -.1], [-.09, -.1], [-.08, -.04], [-.12, -.04]], .052), M.wood, 0, 0, 0); // coronha de madeira
      add(box(.054, .12, .018), M.rub, 0, -.04, -.505);
      const pm = sub(0, -.005, .36); bake(pm, [[cyl(.026, .026, .2, 14), M.wood2, 0, 0, 0, Math.PI / 2], ...[-.06, -.02, .02, .06].map(z => [cyl(.0275, .0275, .01, 14), M.rub, 0, 0, z, Math.PI / 2])]); u.pump = pm; u.pz = .36;
      const sh = new T.Mesh(cyl(.011, .011, .06, 10), M.red); sh.rotation.x = Math.PI / 2; sh.position.set(.03, .02, .04); sh.visible = false; g.add(sh); u.shell = sh;
      flash(.69, .055, .035);
    } else { // ---------- pistola ----------
      add(prof([[-.08, -.02], [.1, -.02], [.1, .025], [-.08, .025]], .04), M.poly, 0, 0, 0);            // armação
      add(prof([[-.075, -.02], [-.02, -.02], [-.045, -.13], [-.095, -.135], [-.1, -.12]], .036), M.poly, 0, 0, 0); // empunhadura
      add(box(.005, .022, .05), M.poly, 0, -.035, .02); add(box(.004, .02, .006), M.steel, 0, -.03, .01);
      for (let k = 0; k < 6; k++) add(box(.038, .004, .03), M.rub, 0, -.05 - k * .015, -.06, 0, 0, 0);
      const sl = sub(0, .045, .01);
      bake(sl, [[prof([[-.09, -.02], [.1, -.02], [.1, .02], [.095, .025], [-.085, .025], [-.09, .02]], .042), M.steel, 0, 0, 0],
        ...[-.08, -.07, -.06, -.05].map(z => [box(.044, .03, .004), M.black, 0, 0, z]),
        [box(.008, .008, .01), M.black, 0, .03, .09], [box(.016, .008, .01), M.black, 0, .03, -.08], [cyl(.008, .008, .02, 8), M.black, 0, .0, .105, Math.PI / 2]]);
      u.slide = sl; u.sz = .01;
      const mg = sub(0, -.06, -.05); bake(mg, [[box(.03, .09, .036), M.black, 0, -.04, -.012, .18], [box(.034, .012, .04), M.poly, 0, -.085, -.02, .18]]); u.mag = mg; u.my = -.06;
      flash(.13, .03, .045);
    }

    // ---------- miras ----------
    if (t === 'rifle' || t === 'sniper') {
      const yb = t === 'rifle' ? .078 : .07;
      if (lv === 1) { // mira holográfica
        add(box(.05, .012, .07), M.black, 0, yb + .006, .1);
        add(prof([[.07, yb], [.13, yb], [.13, yb + .085], [.12, yb + .09], [.075, yb + .09], [.07, yb + .085]], .05, .003), M.black, 0, 0, 0);
        const gl = new T.Mesh(box(.038, .05, .002), M.glass); gl.position.set(0, .13, .11); g.add(gl);
        const d = new T.Mesh(new T.CircleGeometry(.0025, 10), M.dot); d.rotation.y = Math.PI; d.position.set(0, .13, .108); g.add(d);
      } else if (lv === 2) { // luneta 2x
        add(box(.03, .03, .1), M.black, 0, yb + .02, .12);
        Z(.022, .022, .16, M.black, 0, .13, .12, 16); Z(.03, .024, .04, M.black, 0, .13, .22, 16); Z(.028, .022, .035, M.black, 0, .13, .025, 16);
        const tb = new T.Mesh(cyl(.018, .018, .002, 18), vm ? new T.MeshBasicMaterial({ map: rt.texture, fog: false }) : M.lens); tb.rotation.x = Math.PI / 2; tb.position.set(0, .13, .006); g.add(tb);
        const ob = new T.Mesh(cyl(.026, .026, .002, 18), M.glass); ob.rotation.x = Math.PI / 2; ob.position.set(0, .13, .241); g.add(ob);
      } else if (lv === 3 && t === 'sniper') { // luneta 8x
        for (const z of [.0, .16]) add(box(.03, .05, .025), M.black, 0, yb + .03, z);
        Z(.02, .02, .36, M.black, 0, .13, .08, 16); Z(.034, .022, .1, M.black, 0, .13, .3, 16); Z(.03, .02, .07, M.black, 0, .13, -.12, 16);
        Z(.015, .015, .03, M.black, 0, .16, .08, 10); add(cyl(.013, .013, .03, 10), M.black, .03, .13, .08, 0, 0, Math.PI / 2);
        const ob = new T.Mesh(cyl(.03, .03, .002, 18), M.glass); ob.rotation.x = Math.PI / 2; ob.position.set(0, .13, .351); g.add(ob);
      } else { // miras abertas
        add(box(.022, .022, .02), M.black, 0, yb + .012, -.08); for (const s of [-1, 1]) add(box(.004, .02, .01), M.black, s * .008, yb + .03, -.08);
      }
    }
    if (sil && t !== 'shotgun') {
      const zz = t === 'pistol' ? .17 : t === 'sniper' ? 1.22 : .86, yy = t === 'pistol' ? .045 : t === 'sniper' ? .03 : .035;
      Z(.022, .022, t === 'pistol' ? .14 : .2, M.black, 0, yy, zz, 16); if (u.fl) u.fl = null;
    }
    if (vm) { const h = HG[t]; for (let k = 0; k < 2; k++) { const p = h[k]; add(box(.07, .08, .1), M.rub, p[0], p[1], p[2]); add(box(.075, .075, .5), Mt(0x55663f, 0, .9), p[0] + (k ? -.02 : .02), p[1] - .06, p[2] - .3, -.25); } }
    bake(g, it);
    g.traverse(o => { if (o.isMesh) o.castShadow = !vm; });
    return g;
  }
  mkW = function (t, lv, sil, vm) { try { return build(t, lv, sil, vm); } catch (e) { console.warn('arma', t, e); return new T.Group(); } };

  /* ================= itens do chão ================= */
  const IC = {};
  const IM = {
    olive: Mt(0x4a5a3a, 0, .8), olive2: Mt(0x3a4630, 0, .8), black: Mt(0x1a1b1d, .1, .7), white: Mt(0xeeeeea, 0, .6), red: Mt(0xc02424, 0, .55),
    cloth: Mt(0xe8e2d4, 0, .95), metal: Mt(0x55595f, .7, .35), green: Mt(0x2f3a24, .2, .6), can: Mt(0x8a1a1a, .3, .5), blade: Mt(0xb8bdc4, .9, .2),
    ammo: Mt(0x4a5236, .2, .6), brass: WM.brass, gray: Mt(0x8a9096, .5, .45), bp1: Mt(0x5a6a3a, 0, .85), bp2: Mt(0x3a4a5a, 0, .85), bp3: Mt(0x5a3a2a, 0, .85), tan: Mt(0x8a7a5a, 0, .85)
  };
  function item(t) {
    const g = new T.Group(), it = [], A = (geo, m, x, y, z, rx, ry, rz) => it.push([geo, m, x || 0, y || 0, z || 0, rx || 0, ry || 0, rz || 0]);
    if (t === 'vest') { // colete balístico
      A(prof([[-.2, 0], [.2, 0], [.22, .18], [.14, .3], [.06, .3], [.03, .2], [-.03, .2], [-.06, .3], [-.14, .3], [-.22, .18]], .05, .01), IM.olive, 0, 0, 0, 0, Math.PI / 2, 0);
      for (let i = -1; i <= 1; i++) A(box(.11, .1, .05), IM.olive2, i * .13, .08, .045);
      A(box(.36, .04, .06), IM.black, 0, .02, .03); A(box(.1, .06, .02), IM.black, -.1, .2, .04);
    } else if (t === 'helm') { // capacete
      A(new T.SphereGeometry(.16, 20, 12, 0, Math.PI * 2, 0, Math.PI * .55), IM.olive, 0, 0, 0); A(new T.TorusGeometry(.165, .012, 6, 24), IM.olive2, 0, .025, 0, Math.PI / 2);
      A(box(.06, .02, .03), IM.black, 0, .12, .13); for (const s of [-1, 1]) A(box(.02, .1, .01), IM.black, s * .15, -.02, 0);
    } else if (t === 'bp1' || t === 'bp2' || t === 'bp3') { // mochila
      const m = IM[t], k = t === 'bp1' ? .85 : t === 'bp2' ? 1 : 1.15;
      A(box(.34 * k, .44 * k, .2 * k), m, 0, .22 * k, 0); A(cyl(.09 * k, .09 * k, .34 * k, 12), m, 0, .44 * k, 0, 0, 0, Math.PI / 2);
      A(box(.24 * k, .18 * k, .07), m, 0, .14 * k, .13 * k); A(box(.26 * k, .02, .08), IM.black, 0, .3 * k, .12 * k);
      for (const s of [-1, 1]) { A(box(.08, .24 * k, .12 * k), m, s * .2 * k, .2 * k, 0); A(box(.04, .4 * k, .02), IM.black, s * .09, .24 * k, -.11 * k); }
    } else if (t === 'med') { // kit médico
      A(box(.36, .2, .24), IM.white, 0, .1, 0); A(box(.37, .03, .245), IM.gray, 0, .19, 0);
      A(box(.16, .006, .05), IM.red, 0, .206, 0); A(box(.05, .006, .16), IM.red, 0, .206, 0); A(box(.1, .03, .03), IM.black, 0, .215, -.08);
    } else if (t === 'bandage') { // bandagem
      A(cyl(.06, .06, .08, 18), IM.cloth, 0, .04, 0); A(cyl(.02, .02, .081, 10), IM.gray, 0, .04, 0); A(box(.1, .002, .07), IM.cloth, .07, .002, 0);
      A(cyl(.06, .06, .08, 18), IM.cloth, .14, .04, .05); A(cyl(.02, .02, .081, 10), IM.gray, .14, .04, .05);
    } else if (t === 'ammo') { // caixa de munição com balas
      A(box(.3, .17, .14), IM.ammo, 0, .085, 0); A(box(.305, .02, .145), IM.green, 0, .17, 0); A(box(.1, .02, .02), IM.black, 0, .19, 0);
      for (let i = 0; i < 5; i++) { A(cyl(.008, .008, .06, 8), IM.brass, -.06 + i * .03, .03, .1); A(cyl(.003, .008, .02, 8), IM.metal, -.06 + i * .03, .07, .1); }
    } else if (t === 'gren') { // granada de fragmentação
      A(new T.SphereGeometry(.05, 14, 10), IM.green, 0, .06, 0); A(cyl(.018, .02, .03, 10), IM.metal, 0, .115, 0);
      A(box(.012, .07, .02), IM.metal, .025, .1, 0, 0, 0, -.3); A(new T.TorusGeometry(.015, .003, 6, 12), IM.metal, -.02, .13, 0);
    } else if (t === 'smoke') { // granada de fumaça
      A(cyl(.035, .035, .13, 14), IM.gray, 0, .065, 0); A(cyl(.036, .036, .03, 14), IM.black, 0, .1, 0); A(cyl(.015, .02, .03, 10), IM.metal, 0, .145, 0);
    } else if (t === 'fuel') { // galão
      A(prof([[-.12, 0], [.12, 0], [.12, .3], [.06, .36], [-.12, .36]], .14, .012), IM.can, 0, 0, 0, 0, Math.PI / 2, 0);
      A(cyl(.018, .02, .05, 10), IM.metal, .08, .39, 0, 0, 0, -.5); A(box(.12, .03, .03), IM.can, -.04, .38, 0);
    } else if (t === 'knife') { // faca
      A(prof([[0, 0], [.17, .005], [.2, .02], [.17, .03], [0, .03]], .006, .001), IM.blade, 0, 0, 0); A(box(.014, .03, .11), IM.black, 0, .015, -.055); A(box(.02, .05, .012), IM.black, 0, .015, .002);
    } else if (t === 'sil') { // silenciador
      A(cyl(.022, .022, .2, 16), WM.black, 0, .022, 0, Math.PI / 2); A(cyl(.016, .016, .03, 12), WM.steel, 0, .022, -.11, Math.PI / 2);
    } else if (t === 'scope1' || t === 'scope2' || t === 'scope8') { // miras soltas
      if (t === 'scope1') { A(box(.05, .015, .07), WM.black, 0, .008, 0); A(prof([[-.03, .015], [.03, .015], [.03, .1], [-.03, .1]], .05, .003), WM.black, 0, 0, 0); }
      else { const L = t === 'scope8' ? .36 : .16; A(cyl(.022, .022, L, 16), WM.black, 0, .05, 0, Math.PI / 2); A(cyl(.032, .024, .05, 16), WM.black, 0, .05, L / 2 + .02, Math.PI / 2); A(box(.03, .03, .06), WM.black, 0, .015, 0); }
    } else return null;
    bake(g, it); g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return g;
  }
  window.DZItem = function (t) { if (!(t in IC)) IC[t] = item(t); return IC[t] ? IC[t].clone(true) : null; };
  DZItem.has = t => ['vest', 'helm', 'bp1', 'bp2', 'bp3', 'med', 'bandage', 'ammo', 'gren', 'smoke', 'fuel', 'knife', 'sil', 'scope1', 'scope2', 'scope8'].includes(t);
})();
