// Neerja: the 2D presenter character (design B, "campus mentor") for the explainer videos.
// Neerja.svg() returns the SVG markup; Neerja.pose(root, {mouth, blink, tilt, brow}) sets one frame.
// Everything is deterministic so frames can be rendered one at a time.
window.Neerja = (() => {
  const C = { skin: "#B57A4E", shade: "#96613A", hair: "#3B2416", hl: "#8A5A3B", lips: "#A9445A", inner: "#5A1E2A",
    jacket: "#4A78B5", jacketDk: "#35598C", tee: "#E0A82E", gold: "#E0A82E", frame: "#3A2418" };
  const MOUTH = {
    rest: "M-10 0 Q-5 -3 0 -1 Q5 -3 10 0 Q0 7 -10 0 Z",
    s: "M-10 -1 Q0 -4 10 -1 Q0 8 -10 -1 Z",
    m: "M-11 -2 Q0 -5 11 -2 Q0 12 -11 -2 Z",
    w: "M-12 -3 Q0 -6 12 -3 Q0 16 -12 -3 Z",
    o: "M-6 0 A6 8 0 1 0 6 0 A6 8 0 1 0 -6 0 Z",
  };
  const eye = (x) => `<g class="nj-eye" style="transform-origin:${x}px 114px">
      <ellipse cx="${x}" cy="114" rx="9" ry="6.6" fill="#fff"/>
      <circle cx="${x + 1}" cy="114" r="4.8" fill="#3A2418"/><circle cx="${x + 1}" cy="114" r="2.2" fill="#1A0F0A"/>
      <circle cx="${x + 2.6}" cy="112.3" r="1.5" fill="#fff"/>
      <path d="M${x - 10} 111 Q${x} 104 ${x + 10} 110 L${x + 12.5} 106.5" stroke="#1E140E" stroke-width="2.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const svg = (id = "nj") => `<svg viewBox="0 0 240 240" class="nj" role="img" aria-label="Neerja">
    <defs><clipPath id="${id}-c"><circle cx="120" cy="120" r="114"/></clipPath></defs>
    <circle cx="120" cy="120" r="114" fill="#FAEEDA" stroke="#FAC775" stroke-width="5"/>
    <g clip-path="url(#${id}-c)"><g class="nj-head" style="transform-origin:120px 172px">
      <path d="M62 104 Q52 156 68 186 Q80 200 94 188 L146 188 Q160 200 172 186 Q188 156 178 104 Q172 46 120 46 Q68 46 62 104 Z" fill="${C.hair}"/>
      <path d="M70 150 Q64 170 74 184 M170 150 Q176 170 166 184" stroke="${C.hl}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>
      <rect x="107" y="150" width="26" height="36" rx="8" fill="${C.shade}"/>
      <path d="M110 176 Q120 182 130 176" stroke="#80512F" stroke-width="2" fill="none" opacity=".5"/>
      <path d="M30 244 Q38 186 120 178 Q202 186 210 244 Z" fill="${C.jacket}"/>
      <path d="M98 180 Q120 204 142 180 L142 244 L98 244 Z" fill="${C.tee}"/>
      <path d="M98 180 L84 196 L98 206 M142 180 L156 196 L142 206" fill="none" stroke="${C.jacketDk}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M80 214 L80 244 M160 214 L160 244" stroke="${C.jacketDk}" stroke-width="2"/>
      <circle cx="80" cy="222" r="2.2" fill="#C9D6E8"/><circle cx="160" cy="222" r="2.2" fill="#C9D6E8"/>
      <ellipse cx="76" cy="118" rx="7" ry="10" fill="${C.shade}"/><ellipse cx="164" cy="118" rx="7" ry="10" fill="${C.shade}"/>
      <circle cx="74" cy="135" r="6" fill="none" stroke="${C.gold}" stroke-width="2.2"/><circle cx="166" cy="135" r="6" fill="none" stroke="${C.gold}" stroke-width="2.2"/>
      <ellipse cx="120" cy="114" rx="44" ry="52" fill="${C.skin}"/>
      <path d="M70 112 Q64 52 120 48 Q176 52 170 112 Q164 80 140 70 Q130 78 120 64 Q110 78 98 70 Q76 82 70 112 Z" fill="${C.hair}"/>
      <path d="M84 70 Q100 56 116 58 M128 60 Q146 58 158 72" stroke="${C.hl}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/>
      <ellipse cx="97" cy="133" rx="8" ry="4.5" fill="#E07A5F" opacity=".26"/><ellipse cx="143" cy="133" rx="8" ry="4.5" fill="#E07A5F" opacity=".26"/>
      <g class="nj-brows"><path d="M90 100 Q100 94 110 98" stroke="${C.hair}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
        <path d="M130 98 Q140 94 150 100" stroke="${C.hair}" stroke-width="2.8" fill="none" stroke-linecap="round"/></g>
      ${eye(101)}${eye(139)}
      <rect x="88" y="105" width="26" height="19" rx="9" fill="none" stroke="${C.frame}" stroke-width="2.2"/>
      <rect x="126" y="105" width="26" height="19" rx="9" fill="none" stroke="${C.frame}" stroke-width="2.2"/>
      <path d="M114 112 Q120 109 126 112" stroke="${C.frame}" stroke-width="2.2" fill="none"/>
      <path d="M120 118 Q118 127 121 130" stroke="${C.shade}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <g transform="translate(120 145)"><path class="nj-mouth" d="${MOUTH.rest}" fill="${C.lips}"/>
        <path class="nj-teeth" d="M-8 -1.5 Q0 -3 8 -1.5 L7 1 Q0 0 -7 1 Z" fill="#fff" style="display:none"/></g>
    </g></g></svg>`;
  function pose(root, p) {
    const k = p.mouth || "rest", open = k !== "rest";
    const m = root.querySelector(".nj-mouth");
    m.setAttribute("d", MOUTH[k]);
    m.setAttribute("fill", open ? C.inner : C.lips);
    m.setAttribute("stroke", open ? C.lips : "none");
    m.setAttribute("stroke-width", open ? "2.4" : "0");
    root.querySelector(".nj-teeth").style.display = k === "m" || k === "w" ? "" : "none";
    root.querySelectorAll(".nj-eye").forEach((e) => { e.style.transform = `scaleY(${p.blink ? 0.12 : 1})`; });
    root.querySelector(".nj-brows").style.transform = `translateY(${-(p.brow || 0) * 3}px)`;
    root.querySelector(".nj-head").style.transform = `rotate(${(p.tilt || 0).toFixed(2)}deg) translateY(${(p.bob || 0).toFixed(2)}px)`;
  }
  return { svg, pose };
})();
