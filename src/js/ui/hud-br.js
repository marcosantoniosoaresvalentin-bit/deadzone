/* Deadzone · ui/hud-br.js
 * TELA DO JOGO no estilo dos battle royales:
 *  - Bússola no topo (N, NE, L, SE, S, SO, O, NO e graus) com a direção atual.
 *  - Vivos e Abates em quadrinhos no canto de cima à direita.
 *  - Zona: quadrinho com relógio, tempo e fase embaixo da bússola; fora da zona fica vermelho com a distância.
 *  - Armas nos espaços de arma com a foto 3D do modelo.
 *  - Capacete e colete: ícones desenhados com o nível de durabilidade, ao lado da barra de vida.
 *  - Veículos: painel com velocidade, combustível e estado (e altura no helicóptero).
 */
(function () {
  const st = document.createElement('style');
  st.textContent = `
#hud,#zn,#arm{opacity:0!important}
#dzCmp{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 6px);transform:translateX(-50%);width:min(44vw,400px);height:30px;overflow:hidden;z-index:4;pointer-events:none;display:none;
 -webkit-mask-image:linear-gradient(90deg,transparent,#000 18%,#000 82%,transparent);mask-image:linear-gradient(90deg,transparent,#000 18%,#000 82%,transparent)}
#dzCmp .rl{position:absolute;top:0;left:0;height:30px;white-space:nowrap}
#dzCmp .tk{position:absolute;bottom:2px;width:1px;background:rgba(255,255,255,.75);transform:translateX(-.5px)}
#dzCmp .lb{position:absolute;top:1px;transform:translateX(-50%);font:700 11px system-ui;color:#fff;text-shadow:0 1px 2px #000}
#dzCmp .lb.c{font:900 13px system-ui;color:#f3c35a}
#dzCmpV{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 35px);transform:translateX(-50%);z-index:4;pointer-events:none;display:none;font:800 11px system-ui;color:#fff;background:rgba(0,0,0,.45);padding:1px 6px;border-radius:3px}
#dzCmpV:before{content:'';position:absolute;left:50%;top:-5px;margin-left:-4px;border:4px solid transparent;border-bottom-color:#f3c35a}
#dzAK{position:fixed;right:calc(env(safe-area-inset-right,0px) + 12px);top:calc(env(safe-area-inset-top,0px) + 8px);z-index:4;display:none;gap:4px;pointer-events:none}
#dzAK div{display:flex;align-items:center;gap:5px;padding:3px 9px;background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.35));border-radius:3px;color:#fff;font:800 15px system-ui}
#dzAK small{font:700 9px system-ui;color:#c9d2da;letter-spacing:1px}
#dzAK svg{width:14px;height:14px;fill:#fff}
#dzZn{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 56px);transform:translateX(-50%);z-index:4;display:none;align-items:center;gap:7px;padding:3px 10px 3px 6px;background:rgba(0,0,0,.45);border-radius:3px;pointer-events:none;color:#fff;font:800 13px system-ui;white-space:nowrap}
#dzZn svg{width:15px;height:15px}
#dzZn small{font:700 10px system-ui;color:#c9d2da}
#dzZn.out{background:rgba(160,20,20,.65)}
#dzZn.shr b{color:#7fc0ff}
#dzArm{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 3px);transform:translateX(calc(-50% - 132px));z-index:4;display:none;gap:4px;pointer-events:none}
#dzArm div{width:22px;height:22px;position:relative;background:rgba(0,0,0,.45);border-radius:3px;display:flex;align-items:center;justify-content:center}
#dzArm svg{width:16px;height:16px}
#dzArm i{position:absolute;left:2px;right:2px;bottom:1px;height:2px;background:rgba(255,255,255,.2)}#dzArm i u{display:block;height:100%;background:#fff}
#dzArm b{position:absolute;right:1px;top:0;font:900 7px system-ui;color:#f3c35a}
#sl div img.dzw{width:68px;height:26px;object-fit:contain;filter:drop-shadow(0 1px 2px rgba(0,0,0,.8))}
#dzVeh{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);transform:translateX(-50%);z-index:5;display:none;gap:14px;align-items:center;padding:6px 14px;background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.3));border-radius:8px;color:#fff;font:800 14px system-ui;white-space:nowrap;pointer-events:none}
#dzVeh .v{display:flex;flex-direction:column;align-items:center;min-width:54px}#dzVeh .v small{font:700 9px system-ui;color:#9aa6b2;letter-spacing:1px}
#dzVeh .bar{width:64px;height:6px;background:rgba(255,255,255,.15);border-radius:3px;overflow:hidden;margin-top:3px}#dzVeh .bar u{display:block;height:100%}
#dzVeh .warn{color:#ff6a5a}
body.dzVehOn #wpt{opacity:0}
#msg{top:calc(env(safe-area-inset-top,0px) + 86px)!important;font:700 13px system-ui!important;color:#fff!important;background:rgba(0,0,0,.4);padding:2px 10px;border-radius:3px}#msg:empty{display:none}`;
  document.head.appendChild(st);
  const mk = (id, h) => { const d = document.createElement('div'); d.id = id; if (h) d.innerHTML = h; document.body.appendChild(d); return d; };

  // ---------- bússola ----------
  const cmp = mk('dzCmp', '<div class="rl"></div>'), cmpV = mk('dzCmpV'), rl = cmp.querySelector('.rl');
  const PXD = 3.2; // pixels por grau
  { let h = ''; const NM = { 0: 'N', 45: 'NE', 90: 'L', 135: 'SE', 180: 'S', 225: 'SO', 270: 'O', 315: 'NO' };
    for (let d = -360; d <= 720; d += 5) { const a = ((d % 360) + 360) % 360, x = (d + 360) * PXD; h += '<span class="tk" style="left:' + x + 'px;height:' + (a % 15 === 0 ? 9 : 5) + 'px"></span>'; if (a % 15 === 0) h += '<span class="lb' + (NM[a] ? ' c' : '') + '" style="left:' + x + 'px">' + (NM[a] || a) + '</span>'; }
    rl.innerHTML = h; }
  // ---------- vivos / abates ----------
  const ak = mk('dzAK', '<div><svg viewBox="0 0 16 16"><circle cx="8" cy="5" r="3"/><path d="M2 15c0-3.5 2.7-6 6-6s6 2.5 6 6z"/></svg><span id="dzAl">100</span><small>VIVOS</small></div><div><svg viewBox="0 0 16 16"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg><span id="dzKl">0</span><small>ABATES</small></div>');
  // ---------- zona ----------
  const CLK = '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M8 4v4.5l3 1.6" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';
  const RUN = '<svg viewBox="0 0 16 16"><circle cx="10" cy="2.5" r="1.8" fill="#fff"/><path d="M6 6l3-1 2 3 3 1M9 5l-1 5-3 4M8 10l3 2 1 3" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';
  const zn = mk('dzZn');
  const fmt = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  // ---------- capacete / colete ----------
  const HEL = '<svg viewBox="0 0 16 16"><path d="M2 10a6 6 0 0 1 12 0v1H2z" fill="#c9d2a6"/><path d="M1 11h14v2H1z" fill="#8f9a6a"/></svg>';
  const VST = '<svg viewBox="0 0 16 16"><path d="M4 1h2.5l1.5 2 1.5-2H12l2 4v10H2V5z" fill="#9fb07a"/><path d="M5 8h6v3H5z" fill="#6f7d4f"/></svg>';
  const arm = mk('dzArm', '<div id="dzAH">' + HEL + '<i><u></u></i><b></b></div><div id="dzAV">' + VST + '<i><u></u></i><b></b></div>');
  // ---------- veículo ----------
  const veh = mk('dzVeh');

  let lk = '';
  function tick() {
    const inM = mode !== 'lobby' && mode !== 'dead' && typeof mode !== 'undefined';
    const on = inM && mode !== 'plane' && !document.body.classList.contains('dzinv');
    const tm_ = (typeof MP !== 'undefined' && MP) || (typeof SQ !== 'undefined' && SQ);
    cmp.style.display = cmpV.style.display = (inM) ? 'block' : 'none'; ak.style.display = inM && !tm_ ? 'flex' : 'none';
    if (inM) {
      // direção (0 = norte = -z do mapa; 90 = leste = +x)
      let fx = Math.sin(yaw), fz = Math.cos(yaw);
      if (mode === 'plane') { try { fx = pD.x; fz = pD.z; } catch (e) { } }
      const b = ((Math.atan2(fx, -fz) * 180 / Math.PI) + 360) % 360;
      rl.style.transform = 'translateX(' + (cmp.clientWidth / 2 - (b + 360) * PXD) + 'px)'; cmpV.textContent = Math.round(b) % 360;
      $('dzAl').textContent = typeof alive !== 'undefined' ? alive : ''; $('dzKl').textContent = typeof kills !== 'undefined' ? kills : 0;
    }
    // zona
    let zs = false;
    try {
      if (inM && typeof ZST !== 'undefined' && typeof gt !== 'undefined' && !(typeof MP !== 'undefined' && MP) && !(typeof SQ !== 'undefined' && SQ)) {
        zs = true; const t = gt - 120; let lab = '', tm = '', cls = '';
        if (t < 0) { lab = 'ZONA COMEÇA EM'; tm = fmt(-t); }
        else { let i = 0; while (i < ZS.length && t >= ZST[i + 1]) i++; if (i >= ZS.length) { lab = 'ZONA FINAL'; tm = ''; } else { const w = t - ZST[i]; if (w < ZWT[i]) { lab = 'ZONA FECHA EM'; tm = fmt(ZWT[i] - w); } else { lab = 'ZONA FECHANDO'; tm = fmt(ZSH[i] - (w - ZWT[i])); cls = 'shr'; } } }
        const d = Math.hypot(P.x - zX, P.z - zZ) - zR, out = d > 0 && mode !== 'plane';
        zn.className = (out ? 'out ' : '') + cls;
        zn.innerHTML = (out ? RUN + '<b>' + Math.round(d) + ' m</b><small>FORA DA ZONA</small>' : '') + CLK + '<small>' + lab + '</small>' + (tm ? '<b>' + tm + '</b>' : '');
      }
    } catch (e) { zs = false; }
    zn.style.display = zs ? 'flex' : 'none';
    // armadura
    const ao = on && (mode === 'ground' || mode === 'drive') && (ARM.vest > 0 || ARM.helm > 0);
    arm.style.display = ao ? 'flex' : 'none';
    if (ao) { const k = Math.round(ARM.helm) + '|' + Math.round(ARM.vest); if (k !== lk) { lk = k; const s = (id, v) => { const e = $(id); e.style.display = v > 0 ? 'flex' : 'none'; e.querySelector('u').style.width = Math.min(100, v) + '%'; e.querySelector('u').style.background = v < 30 ? '#ff6a5a' : '#fff'; }; s('dzAH', ARM.helm); s('dzAV', ARM.vest); } }
    // veículo
    let vo = false;
    try {
      if (mode === 'drive' && drv) {
        vo = true; const c = drv, kmh = Math.round(Math.abs(c.spd) * 3.6), fu = Math.round(c.fuel), hp_ = Math.max(0, Math.round(c.hp));
        const bar = (v, col) => '<span class="bar"><u style="width:' + v + '%;background:' + col + '"></u></span>';
        veh.innerHTML = '<div class="v"><small>VELOCIDADE</small>' + kmh + ' km/h</div>' + (c.heli ? '<div class="v"><small>ALTURA</small>' + Math.round(Math.max(0, c.y - (c.fb || 0))) + ' m</div>' : '') +
          '<div class="v"><small>COMBUSTÍVEL</small>' + bar(fu, fu < 20 ? '#ff6a5a' : '#f3c35a') + '</div><div class="v"><small>ESTADO</small>' + bar(hp_, hp_ < 30 ? '#ff6a5a' : '#7be07b') + '</div>' + (c.fire ? '<div class="v warn"><small>ALERTA</small>FOGO</div>' : c.fuel <= 0 ? '<div class="v warn"><small>ALERTA</small>SEM COMBUSTÍVEL</div>' : '');
      }
    } catch (e) { vo = false; }
    veh.style.display = vo ? 'flex' : 'none'; document.body.classList.toggle('dzVehOn', vo);
  }
  setInterval(tick, 100);

  // ---------- armas com foto 3D nos espaços ----------
  const _ds = drawSlots;
  drawSlots = function () {
    _ds.apply(this, arguments);
    try { if (!window.DZPIC) return; sl.querySelectorAll('div[data-i]').forEach(d => { const s = slots[+d.dataset.i]; if (!s || s.t === 'bow') return; const sv = d.querySelector('svg'); if (!sv) return; const src = DZPIC(s.t, s.v); if (!src) return; const im = document.createElement('img'); im.className = 'dzw'; im.src = src; sv.replaceWith(im); }); } catch (e) { }
  };
  try { sltxt = ''; drawSlots(); } catch (e) { }
})();
// ---------- mensagens: sem instruções longas na tela e sem emoji ----------
(function () {
  if (typeof say !== 'function') return;
  const BLOCK = /Arraste a tela|Queda livre|Paraquedas:|Planador:|Toque em (Abrir|Subir|Descer)|Pousou! Procure|Equipado automaticamente|segure ATIRAR|segure LANÇAR|selecionad[oa]|Pouse para sair|Ligando o motor|na mão · /i;
  const EMO = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu;
  const _s = say;
  say = function (m, d) { if (m == null) return; m = String(m); if (BLOCK.test(m)) return; m = m.replace(EMO, '').replace(/\s{2,}/g, ' ').trim(); if (!m) return; return _s.call(this, m, Math.min(d == null ? 1.5 : d, 3)); };
})();
