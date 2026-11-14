/* Deadzone · graphics/look.js
 * VISUAL REALISTA (sempre de dia, sem sistema de clima):
 *  - Correção de cor de cinema aplicada dentro do sombreador de todos os materiais (sem custo de pós-processamento):
 *    verdes menos "limão", saturação e contraste naturais, sombras levemente frias e luzes levemente quentes.
 *  - Céu com azul mais profundo e horizonte com névoa; neblina da mesma cor do horizonte (profundidade).
 *  - Sol de fim de manhã (um pouco mais baixo e quente), luz ambiente céu/chão mais suave, sombras mais macias.
 *  - Vinheta leve nas bordas da tela.
 */
(function () {
  // ---------- correção de cor (todos os materiais com tone mapping) ----------
  const GRADE = `
  #if defined( TONE_MAPPING )
  {
    vec3 cg = gl_FragColor.rgb;
    float gx = max(0.0, cg.g - max(cg.r, cg.b));            // excesso de verde
    cg.g -= gx * 0.38; cg.r += gx * 0.10;                     // verde-limão -> verde-oliva natural
    float lu = dot(cg, vec3(0.2126, 0.7152, 0.0722));
    cg = mix(vec3(lu), cg, 0.90);                             // saturação um pouco menor
    cg = clamp((cg - 0.5) * 1.07 + 0.5, 0.0, 1.0);            // contraste
    cg *= mix(vec3(0.96, 0.99, 1.04), vec3(1.03, 1.0, 0.95), smoothstep(0.15, 0.85, lu)); // sombras frias, luzes quentes
    gl_FragColor.rgb = cg;
  }
  #endif`;
  const C = THREE.ShaderChunk;
  if (!/cg\.g -= gx/.test(C.tonemapping_fragment)) C.tonemapping_fragment = C.tonemapping_fragment + GRADE;

  // ---------- céu ----------
  try {
    const m = sky.material;
    m.fragmentShader = m.fragmentShader
      .replace('vec3 zen=vec3(.13,.34,.74),hor=vec3(.70,.81,.92);', 'vec3 zen=vec3(.10,.27,.58),hor=vec3(.74,.80,.84);')
      .replace('vec3 c=mix(hor,zen,pow(y,.42));', 'vec3 c=mix(hor,zen,pow(y,.55));c=mix(c,vec3(.80,.82,.83),(1.-smoothstep(0.,.12,y))*.45);');
    m.needsUpdate = true;
  } catch (e) { }

  // ---------- luz, neblina, exposição ----------
  const HOR = new THREE.Color(0xc3cdd3);
  function apply() {
    try {
      ren.toneMappingExposure = 1.0;
      sun.color.set(0xfff0da); sun.intensity = 2.5; sun.position.set(70, 75, 38);
      try { sky.material.uniforms.sd.value.copy(sun.position).normalize(); } catch (e) { }
      sun.shadow.bias = -.0003; sun.shadow.normalBias = .035; if (sun.shadow.radius < 2) sun.shadow.radius = 2;
      sc.traverse(o => { if (o.isHemisphereLight && !o.userData.dzLobby) { o.color.set(0xc9dbee); o.groundColor.set(0x5b5444); } });
      if (sc.fog && (typeof mode === 'undefined' || mode !== 'lobby')) { sc.fog.color.copy(HOR).convertSRGBToLinear(); }
      if (sc.background && sc.background.isColor && (typeof mode === 'undefined' || mode !== 'lobby')) sc.background.copy(HOR);
    } catch (e) { }
  }
  // recompila os materiais que já existem para receberem a correção de cor
  function recompile() { try { sc.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { m.needsUpdate = true; }); }); } catch (e) { } }

  // ---------- vinheta ----------
  const vg = document.createElement('div');
  vg.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 62%,rgba(0,0,0,.22) 100%)';
  document.body.appendChild(vg);
  setInterval(() => { vg.style.display = (typeof mode !== 'undefined' && mode !== 'lobby') ? 'block' : 'none'; }, 500);

  window.addEventListener('load', () => { apply(); recompile(); setTimeout(() => { apply(); recompile(); }, 3000); });
  // a cada partida volta tudo para o "dia" (a luz pode ter sido mexida pelo lobby)
  const _sg = window.startGame; if (typeof _sg === 'function') window.startGame = function () { const r = _sg.apply(this, arguments); apply(); return r; };
  setInterval(() => { if (typeof mode !== 'undefined' && mode !== 'lobby' && sc.fog && !sc.fog.color.equals(new THREE.Color().copy(HOR).convertSRGBToLinear())) apply(); }, 2000);
})();
