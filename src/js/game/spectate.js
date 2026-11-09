/* Deadzone · game/spectate.js
 * MODO ESPECTADOR melhorado (partida clássica):
 *  - Ordem: primeiro QUEM TE ELIMINOU (se ainda vivo), depois os ALIADOS, depois os mais próximos.
 *  - Câmera atrás do jogador assistido, acompanhando para onde ele olha (sem tremer).
 *  - Painel com nome, etiqueta (Seu assassino / Aliado), vida e arma; botões ◀ ▶ e Resumo.
 */
(function () {
  const css = document.createElement('style'); css.textContent = `
#dzSpI{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 56px);z-index:12;display:none;flex-direction:column;align-items:center;gap:4px;pointer-events:none;font-family:Bahnschrift,Oswald,"Roboto Condensed",system-ui,sans-serif;color:#fff;text-shadow:0 1px 3px #000}
#dzSpI .tg{font:800 10px system-ui;letter-spacing:1px;padding:2px 8px;border-radius:3px;background:rgba(0,0,0,.5);color:#cfd4ca}
#dzSpI .tg.k{background:#c0392b;color:#fff}#dzSpI .tg.a{background:#2f7d4a;color:#fff}
#dzSpI .nm{font:italic 900 22px/1 Impact,Haettenschweiler,"Arial Black",sans-serif;letter-spacing:.5px}
#dzSpI .hp{width:180px;height:6px;border-radius:3px;background:rgba(0,0,0,.5);overflow:hidden}#dzSpI .hp u{display:block;height:100%;background:#e9ecef;transition:width .2s}
#dzSpI .wp{font-size:12px;color:#c9cec4}
#spc #spn{display:none}
body.dzspec .bt,body.dzspec #sl,body.dzspec #bag,body.dzspec #tw,body.dzspec #cross,body.dzspec #lpd,body.dzspec #dzTeam{display:none!important}`;
  document.head.appendChild(css);
  const I = document.createElement('div'); I.id = 'dzSpI'; I.innerHTML = '<span class="tg"></span><span class="nm"></span><div class="hp"><u></u></div><span class="wp"></span>'; document.body.appendChild(I);

  const killerObj = () => {
    try { if (lastHitBy && lastHitBy.g && !lastHitBy.dead) return lastHitBy; } catch (e) { }
    try { if (typeof lastHit !== 'undefined' && lastHit && CL[lastHit] && !CL[lastHit].dead) return CL[lastHit]; } catch (e) { }
    return null;
  };
  const isAlly = e => { try { if (e.team === 1 && e.isCompanion) return true; if (e.ally) return true; for (const id of [...(window.dzAllies || [])]) if (CL[id] === e) return true; } catch (er) { } return false; };
  const classicOn = () => { try { return !(typeof SQ !== 'undefined' && SQ) && !MP; } catch (e) { return true; } };

  window.addEventListener('load', () => {
    // ordem de quem assistir
    const _sl = specList;
    specList = function () {
      const L = _sl.apply(this, arguments); if (!classicOn()) return L;
      const k = killerObj(), px = P.x, pz = P.z;
      const sc_ = e => (e === k ? -1e9 : 0) + (isAlly(e) ? -1e8 : 0) + Math.hypot(e.x - px, e.z - pz);
      return L.slice().sort((a, b) => sc_(a) - sc_(b));
    };
    const _sn = specNext;
    specNext = function (d, auto) { const r = _sn.apply(this, arguments); if (spec) { spYaw = spec.g ? spec.g.rotation.y : yaw; } return r; };
  });

  let spYaw = 0, spOn = false;
  const on = () => { try { return mode === 'dead' && $('spc').style.display !== 'none' && spec && spec.g && classicOn(); } catch (e) { return false; } };
  // câmera atrás do assistido (aplicada logo antes de desenhar)
  const _r = ren.render.bind(ren); const tp = new T.Vector3();
  ren.render = function (s, c) {
    if (c === cam && on()) {
      try {
        const e = spec, g = e.g; g.getWorldPosition(tp); const f = g.rotation.y;
        let d = ((f - spYaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI; spYaw += d * .08;
        let dd = 4.4; try { while (dd > 1.4 && blocked(tp.x, tp.y + 1.6, tp.z, tp.x - Math.sin(spYaw) * dd, tp.y + 2.3, tp.z - Math.cos(spYaw) * dd)) dd -= .6; } catch (er) { }
        const bx = tp.x - Math.sin(spYaw) * dd, bz = tp.z - Math.cos(spYaw) * dd, by = Math.max(tp.y + 2.3, GY(bx, bz, tp.y + 4) + 1.2);
        cam.position.set(bx, by, bz); cam.lookAt(tp.x + Math.sin(spYaw) * 2, tp.y + 1.4, tp.z + Math.cos(spYaw) * 2);
        g.visible = true;
      } catch (er) { }
    }
    return _r(s, c);
  };
  // painel
  setInterval(() => {
    const o = on(); document.body.classList.toggle('dzspec', o);
    if (!o) { if (spOn) { spOn = false; I.style.display = 'none'; } return; }
    spOn = true; I.style.display = 'flex';
    const e = spec, k = killerObj(), al = isAlly(e), tg = I.children[0];
    tg.textContent = e === k ? 'SEU ASSASSINO' : al ? 'ALIADO' : 'ASSISTINDO'; tg.className = 'tg' + (e === k ? ' k' : al ? ' a' : '');
    let nm = ''; try { nm = nmOf(e); } catch (er) { try { nm = bnm(e); } catch (er2) { nm = 'Jogador'; } }
    I.children[1].textContent = nm;
    const hp = Math.max(0, Math.min(100, e.hp == null ? 100 : e.hp)); I.children[2].firstChild.style.width = hp + '%'; I.children[2].firstChild.style.background = hp < 30 ? '#ff5a4a' : '#e9ecef';
    let w = ''; try { w = e.w && WS[e.w] ? WS[e.w].n : ''; } catch (er) { } I.children[3].textContent = w;
  }, 200);
})();
