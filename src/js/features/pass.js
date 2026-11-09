/* Deadzone · features/pass.js
 * PASSE DEADZONE (temporada 1) — recompensas por nível, sem dinheiro de verdade.
 *  - 30 níveis (o nível vem do XP das partidas). Cada nível tem uma recompensa para RESGATAR:
 *    moedas, roupas, paraquedas ou SKINS DE ARMA.
 *  - Aba "Skins de arma": equipa a camuflagem que aparece nas suas armas (na mão, nas costas e na mira).
 *  - Pontinho vermelho no painel do passe (lobby) quando há recompensa para resgatar.
 */
(function () {
  // ---------- skins de arma ----------
  // m: 0 camuflado (manchas) · 1 listras · 2 metálico liso
  const WSK = [
    { id: 'padrao', n: 'Padrão' },
    { id: 'floresta', n: 'Floresta', m: 0, c: [0x4b5a32, 0x2e3a22, 0x7a7048] },
    { id: 'deserto', n: 'Deserto', m: 0, c: [0xc2a36b, 0x9a7d4f, 0x6d5a3a] },
    { id: 'urbano', n: 'Urbano', m: 0, c: [0x8a8f96, 0x55595f, 0x2e3236] },
    { id: 'artico', n: 'Ártico', m: 0, c: [0xe6ecf0, 0xb3bec8, 0x76818c] },
    { id: 'tigre', n: 'Tigre', m: 1, c: [0xd08a2a, 0x1a1712, 0xe0a040] },
    { id: 'carbono', n: 'Carbono', m: 2, c: [0x202327, 0x2f3338, 0x16181b], met: .7 },
    { id: 'neon', n: 'Neon', m: 1, c: [0x16191c, 0x18d6c0, 0x16191c] },
    { id: 'noturno', n: 'Noturno', m: 0, c: [0x2a3550, 0x1a2134, 0x45557a] },
    { id: 'ouro', n: 'Ouro', m: 2, c: [0xd8aa32, 0xb88a1c, 0xf0cc60], met: .9 }
  ];
  window.DZWSK = WSK;
  const hx = c => '#' + c.toString(16).padStart(6, '0');
  const swatch = s => !s.c ? 'linear-gradient(135deg,#3a3f45,#23272b)' : s.m === 1 ? 'repeating-linear-gradient(60deg,' + hx(s.c[0]) + ' 0 9px,' + hx(s.c[1]) + ' 9px 15px)' : s.m === 2 ? 'linear-gradient(135deg,' + hx(s.c[2]) + ',' + hx(s.c[0]) + ' 45%,' + hx(s.c[1]) + ')' : 'radial-gradient(circle at 30% 35%,' + hx(s.c[1]) + ' 0 22%,transparent 23%),radial-gradient(circle at 70% 65%,' + hx(s.c[2]) + ' 0 20%,transparent 21%),radial-gradient(circle at 75% 20%,' + hx(s.c[1]) + ' 0 12%,transparent 13%),' + hx(s.c[0]);

  // ---------- recompensas por nível ----------
  const R = { 1: ['p', 'dz_red'], 2: ['c', 100], 3: ['w', 'floresta'], 4: ['p', 'ceu'], 5: ['o', 'urbano'], 6: ['c', 150], 7: ['w', 'deserto'], 8: ['p', 'selva'], 9: ['o', 'deserto'], 10: ['w', 'urbano'],
    11: ['c', 200], 12: ['o', 'digital'], 13: ['p', 'noite'], 14: ['w', 'artico'], 15: ['o', 'artico'], 16: ['c', 250], 17: ['w', 'tigre'], 18: ['o', 'selva'], 19: ['p', 'gelo'], 20: ['w', 'carbono'],
    21: ['o', 'tigre'], 22: ['w', 'neon'], 23: ['p', 'mistico'], 24: ['o', 'flecktarn'], 25: ['w', 'noturno'], 26: ['o', 'noturno'], 27: ['p', 'dourado'], 28: ['w', 'ouro'], 29: ['c', 500], 30: ['o', 'ouro'] };
  const MAXL = 30;
  const lv = () => { try { return lvOf(PR.xp || 0); } catch (e) { return 1; } };
  const claimed = () => (PR.pc = PR.pc || []);
  const item = (t, id) => { try { return (t === 'o' ? OUT : t === 'p' ? PAR : WSK).find(x => x.id === id); } catch (e) { return null; } };
  const canClaim = l => l <= lv() && !claimed().includes(l);
  const pending = () => { let n = 0; for (let l = 1; l <= MAXL; l++) if (canClaim(l)) n++; return n; };
  function claim(l) {
    if (!canClaim(l)) return; const [t, v] = R[l];
    if (t === 'c') PR.coins = (PR.coins || 0) + v;
    else { const k = t + ':' + v; PR.unl = PR.unl || []; if (!PR.unl.includes(k)) PR.unl.push(k); }
    claimed().push(l); try { savePR(); updPn(); } catch (e) { }
    try { sfx(780, .3, .15, 0); setTimeout(() => sfx(1040, .3, .15, 0), 110); } catch (e) { }
  }
  const ownW = id => id === 'padrao' || (PR.unl || []).includes('w:' + id);
  function preview(t, v) {
    if (t === 'c') return '<div class="pv coin"><b>' + v + '</b></div>';
    if (t === 'w') return '<div class="pv" style="background:' + swatch(item('w', v)) + '"></div>';
    const it = item(t, v); let h = ''; try { h = skinPrev(t, it); } catch (e) { }
    return '<div class="pv sk ' + t + '">' + h + '</div>';
  }
  const label = (t, v) => t === 'c' ? v + ' moedas' : (item(t, v) || {}).n || v;
  const kindN = { c: 'Moedas', w: 'Skin de arma', o: 'Roupa', p: 'Paraquedas' };

  // ---------- tela ----------
  const css = document.createElement('style'); css.textContent = `
#dzPass{position:fixed;inset:0;z-index:70;display:none;flex-direction:column;background:linear-gradient(160deg,#151b14,#0b0e0b 60%,#1a1608);color:#fff;font-family:Bahnschrift,Oswald,"Roboto Condensed",system-ui,sans-serif;padding:max(10px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) 10px max(16px,env(safe-area-inset-left))}
#dzPass .hd{display:flex;align-items:center;gap:14px}
#dzPass .hd h2{margin:0;font:italic 900 clamp(18px,5.5vh,28px)/1 Impact,Haettenschweiler,"Arial Black",sans-serif;letter-spacing:1px}#dzPass .hd h2 span{color:#ffc933}
#dzPass .hd .tabs{display:flex;gap:6px;margin-left:10px}#dzPass .hd .tabs button{background:rgba(255,255,255,.08);color:#cfd4ca;border:1px solid rgba(255,255,255,.15);border-radius:5px;padding:6px 12px;font:700 12px system-ui}
#dzPass .hd .tabs button.on{background:#ffc933;color:#231700;border-color:#ffc933}
#dzPass .hd .x{margin-left:auto;background:rgba(255,255,255,.1);color:#fff;border:0;border-radius:6px;width:38px;height:34px;font:800 16px system-ui}
#dzPass .lvl{display:flex;align-items:center;gap:12px;margin:1.4vh 0}
#dzPass .lvl .hex{width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:#ffc933;color:#231700;font:900 18px system-ui;clip-path:polygon(25% 3%,75% 3%,100% 50%,75% 97%,25% 97%,0 50%)}
#dzPass .lvl .bar{flex:1;max-width:420px}#dzPass .lvl .bar small{color:#b8beb3;font-size:12px}#dzPass .lvl .bar i{display:block;height:8px;border-radius:4px;background:rgba(255,255,255,.12);margin-top:4px;overflow:hidden}#dzPass .lvl .bar i u{display:block;height:100%;background:linear-gradient(90deg,#f3c35a,#ffdf85)}
#dzPass .lvl .all{margin-left:auto;background:linear-gradient(180deg,#ffd65c,#f0a91c);color:#2a1a00;border:0;border-radius:6px;padding:9px 16px;font:italic 900 14px Impact,Haettenschweiler,"Arial Black",sans-serif;letter-spacing:.5px}
#dzPass .lvl .all[disabled]{opacity:.35}
#dzPass .trk{flex:1;display:flex;gap:10px;overflow-x:auto;overflow-y:hidden;padding:6px 2px 12px;scroll-behavior:smooth;-webkit-overflow-scrolling:touch}
#dzPass .cd{flex:0 0 clamp(104px,15vw,140px);display:flex;flex-direction:column;background:linear-gradient(180deg,rgba(255,255,255,.1),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.12);border-radius:8px;overflow:hidden;position:relative}
#dzPass .cd.cur{border-color:#ffc933;box-shadow:0 0 0 1px #ffc933,0 0 18px rgba(255,201,51,.25)}
#dzPass .cd .n{font:900 12px system-ui;padding:5px 8px;background:rgba(0,0,0,.35);color:#cfd4ca}
#dzPass .cd .pv{flex:1;min-height:60px;margin:8px;border-radius:6px;background:#2a2f2a;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;overflow:hidden}
#dzPass .cd .pv.coin{background:radial-gradient(circle,#ffd65c 0 30%,#c98a12 31% 36%,#2a2f2a 37%)}#dzPass .cd .pv.coin b{font:900 15px system-ui;color:#3a2600}
#dzPass .cd .pv.sk b{display:block;width:33%;height:50%}#dzPass .cd .pv.sk.o b{width:33.3%;height:100%}#dzPass .cd .pv.sk.p b{width:25%}
#dzPass .cd .t{padding:0 8px;font:700 12px system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#dzPass .cd .k{padding:0 8px 6px;font-size:10px;color:#9fa69a;text-transform:uppercase;letter-spacing:.5px}
#dzPass .cd button{margin:0 8px 8px;border:0;border-radius:5px;padding:7px 0;font:800 12px system-ui}
#dzPass .cd button.go{background:linear-gradient(180deg,#ffd65c,#f0a91c);color:#2a1a00}#dzPass .cd button.ok{background:rgba(123,224,123,.15);color:#7be07b}#dzPass .cd button.lk{background:rgba(255,255,255,.07);color:#8a9086}
#dzPass .cd.lock .pv{filter:grayscale(.6) brightness(.6)}
#dzPass .gw{flex:1;display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;overflow:auto;align-content:start;padding:4px 2px}
#dzPass .gw .cd{flex:none}#dzPass .gw .cd .pv{min-height:70px}
#dz43 .dzpd{position:absolute;right:6px;top:6px;width:10px;height:10px;border-radius:50%;background:#ff3b30;box-shadow:0 0 0 2px rgba(0,0,0,.4);display:none}`;
  document.head.appendChild(css);
  const W = document.createElement('div'); W.id = 'dzPass'; document.body.appendChild(W);
  let tab = 'pass';
  function render() {
    const l = lv(), a = lvStart(l), b = lvStart(l + 1), x = (PR.xp || 0) - a, pend = pending();
    let h = '<div class="hd"><h2>PASSE <span>DEADZONE</span></h2><div class="tabs"><button data-tab="pass" class="' + (tab === 'pass' ? 'on' : '') + '">Recompensas</button><button data-tab="wsk" class="' + (tab === 'wsk' ? 'on' : '') + '">Skins de arma</button></div><button class="x" data-x="1">✕</button></div>';
    h += '<div class="lvl"><div class="hex">' + Math.min(l, 99) + '</div><div class="bar"><small>Nível ' + l + ' · ' + x + ' / ' + (b - a) + ' XP</small><i><u style="width:' + Math.min(100, x / Math.max(1, b - a) * 100) + '%"></u></i></div>'
      + (tab === 'pass' ? '<button class="all" data-all="1"' + (pend ? '' : ' disabled') + '>RESGATAR TUDO' + (pend ? ' (' + pend + ')' : '') + '</button>' : '') + '</div>';
    if (tab === 'pass') {
      h += '<div class="trk">';
      for (let i = 1; i <= MAXL; i++) {
        const [t, v] = R[i], got = claimed().includes(i), ok = i <= l;
        h += '<div class="cd' + (i === l ? ' cur' : '') + (ok ? '' : ' lock') + '" data-l="' + i + '"><div class="n">NÍVEL ' + i + '</div>' + preview(t, v) + '<div class="t">' + label(t, v) + '</div><div class="k">' + kindN[t] + '</div>'
          + (got ? '<button class="ok">✓ Resgatado</button>' : ok ? '<button class="go" data-c="' + i + '">Resgatar</button>' : '<button class="lk">🔒 Nível ' + i + '</button>') + '</div>';
      }
      h += '</div>';
    } else {
      const eq = PR.wsk || 'padrao', need = id => { for (const k in R) if (R[k][0] === 'w' && R[k][1] === id) return +k; return 0; };
      h += '<div class="gw">' + WSK.map(s => { const own = ownW(s.id); return '<div class="cd' + (s.id === eq ? ' cur' : '') + (own ? '' : ' lock') + '"><div class="n">' + s.n.toUpperCase() + '</div><div class="pv" style="background:' + swatch(s) + '"></div>'
        + (s.id === eq ? '<button class="ok">✓ Equipada</button>' : own ? '<button class="go" data-w="' + s.id + '">Equipar</button>' : '<button class="lk">🔒 Nível ' + need(s.id) + '</button>') + '</div>'; }).join('') + '</div>';
    }
    W.innerHTML = h;
    if (tab === 'pass') { const c = W.querySelector('.cd.cur'); const tr = W.querySelector('.trk'); if (c && tr) tr.scrollLeft = Math.max(0, c.offsetLeft - tr.clientWidth / 2 + c.clientWidth / 2); }
  }
  W.addEventListener('pointerdown', e => {
    const t = e.target.closest('button'); if (!t) return; e.preventDefault(); e.stopPropagation();
    if (t.dataset.x) { W.style.display = 'none'; return; }
    if (t.dataset.tab) { tab = t.dataset.tab; render(); return; }
    if (t.dataset.all) { for (let l = 1; l <= MAXL; l++) claim(l); render(); return; }
    if (t.dataset.c) { const tr = W.querySelector('.trk'), sl = tr ? tr.scrollLeft : 0; claim(+t.dataset.c); render(); const tr2 = W.querySelector('.trk'); if (tr2) tr2.scrollLeft = sl; return; }
    if (t.dataset.w) { PR.wsk = t.dataset.w; try { savePR(); } catch (e) { } render(); }
  });
  function open() { tab = 'pass'; W.style.display = 'flex'; render(); }
  window.dzOpenPass = open;
  // painel e banner do passe no lobby abrem esta tela; pontinho vermelho quando há recompensa
  const hook = () => {
    const b = document.getElementById('d43b'); if (b && !b.dataset.pass) { b.dataset.pass = 1; b.onclick = e => { e && e.stopPropagation && e.stopPropagation(); open(); }; const d = document.createElement('i'); d.className = 'dzpd'; b.appendChild(d); }
    if (b) { const d = b.querySelector('.dzpd'); if (d) d.style.display = pending() ? 'block' : 'none'; }
    const ban = document.getElementById('d43pt'); const bc = ban && ban.closest('[id^="d43"]:not(#d43pt)') || (ban && ban.parentElement);
    if (bc && !bc.dataset.pass) { bc.dataset.pass = 1; bc.style.cursor = 'pointer'; bc.addEventListener('click', () => { if (/PASSE/.test(ban.textContent)) open(); }); }
  };
  setInterval(hook, 600); hook();

  // ---------- skin aplicada nas armas do jogador ----------
  const MC = new Map();
  function skinMat(om, s, sc) {
    const key = om.uuid + '|' + s.id + '|' + sc; let m = MC.get(key); if (m) return m;
    m = om.clone(); const C = s.c.map(c => new T.Color(c).convertSRGBToLinear());
    if (s.met) { m.metalness = s.met; m.roughness = .32; }
    m.onBeforeCompile = sh => {
      sh.uniforms.cA = { value: C[0] }; sh.uniforms.cB = { value: C[1] }; sh.uniforms.cC = { value: C[2] }; sh.uniforms.sc = { value: sc };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vOP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvOP=position;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vOP;uniform vec3 cA,cB,cC;uniform float sc;\nfloat h3(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}\nfloat n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1.,0.,0.)),f.x),mix(h3(i+vec3(0.,1.,0.)),h3(i+vec3(1.,1.,0.)),f.x),f.y),mix(mix(h3(i+vec3(0.,0.,1.)),h3(i+vec3(1.,0.,1.)),f.x),mix(h3(i+vec3(0.,1.,1.)),h3(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}')
        .replace('#include <color_fragment>', '#include <color_fragment>\n{vec3 q=vOP*sc;float a=' + (s.m === 1 ? 'step(.5,fract((q.x+q.y*.6+n3(q*.7)*1.3)*.9))' : s.m === 2 ? 'n3(q*3.)*.35' : 'n3(q)*.65+n3(q*2.3)*.35') + ';vec3 c=' + (s.m === 1 ? 'mix(cA,cB,a)' : s.m === 2 ? 'mix(cA,cC,a)' : '(a<.42?cA:(a<.6?cB:cC))') + ';float lum=dot(diffuseColor.rgb,vec3(.3,.59,.11));diffuseColor.rgb=c*(.55+lum*1.6);}');
    };
    m.customProgramCacheKey = () => 'dzwsk' + s.m + s.id + sc; MC.set(key, m); return m;
  }
  const _b = new T.Box3(), _s = new T.Vector3(), _ws = new T.Vector3();
  function apply(w, s) {
    const inner = w.children && w.children[0]; if (!inner) return;
    let sc = 6;
    try { w.updateMatrixWorld(true); _b.setFromObject(inner); _b.getSize(_s); inner.getWorldScale(_ws); const L = Math.max(_s.x, _s.y, _s.z) / Math.max(1e-4, _ws.x); sc = Math.round(7 / Math.max(1e-3, L) * 100) / 100; } catch (e) { }
    inner.traverse(o => {
      if (!o.isMesh || !o.material) return;
      if (!o.userData.om) o.userData.om = o.material;
      o.material = s.c ? skinMat(o.userData.om, s, sc) : o.userData.om;
    });
  }
  let lastK = '';
  const _lb = window.loopBody;
  window.loopBody = function (t) {
    _lb(t);
    try {
      const s = WSK.find(q => q.id === (PR.wsk || 'padrao')) || WSK[0];
      for (const G of [rf, sling, hipG, vmH]) for (const w of G.children) if (w.userData.dzSk !== s.id) { w.userData.dzSk = s.id; apply(w, s); }
    } catch (e) { }
  };
})();
