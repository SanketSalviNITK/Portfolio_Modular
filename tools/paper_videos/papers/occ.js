/* Research Bytes #03, nested-texture pattern optical camera communication: the visuals for each scene
   (the script is papers/occ.json). Visuals sit left of Neerja and above the captions: x 140..1500, y 120..850.
   The 8x8 pattern follows the paper exactly (Eq. 3-6): outer positions P1..P4 carry bits 1-4, inner P5..P8 bits 5-8;
   a 0 is a full 2x2 block (L0), a 1 is a 3-LED corner block pointing to its corner (L1 top-left .. L4 bottom-right). */
(() => {
  const { clamp, lerp, seg, out3, sine, hash, esc, rise, pop, cs, count } = window.PV;
  const V = window.VIEWS;
  const CY = "#46e2ff", GR = "#5dffa8", AM = "#ffb35c", VI = "#b48cff", RD = "#ff6b8a", DIM = "#9aa7b4", LED = "#ff3b5c";
  const head = (lt, kick, text, color = CY) => `<div class="abs kick" style="left:150px;top:130px;color:${color};${rise(lt, 0.05)}">${kick}</div>
    <div class="abs h1" style="left:150px;top:175px;width:1300px;${rise(lt, 0.2)}">${text}</div>`;

  // ---------------- the pattern (from the paper) ----------------
  const POS = [[0, 0], [0, 6], [6, 0], [6, 6], [2, 2], [2, 4], [4, 2], [4, 4]];        // P1..P8: [row, col] of each 2x2 block
  const CORNER = [[[1, 1], [1, 0]], [[1, 1], [0, 1]], [[1, 0], [1, 1]], [[0, 1], [1, 1]]]; // L1 top-left, L2 top-right, L3 bottom-left, L4 bottom-right
  const block = (k, bit) => (bit ? CORNER[k % 4] : [[1, 1], [1, 1]]);                   // P1,P5 -> L1; P2,P6 -> L2; P3,P7 -> L3; P4,P8 -> L4
  const BYTE = [1, 0, 1, 1, 0, 1, 1, 1];                                                  // the paper's example, 10110111
  function grid(bits, upto = 8) {                                                        // 8x8 of 0/1 (and which block each LED is in)
    const g = Array.from({ length: 8 }, () => Array(8).fill(0)), owner = Array.from({ length: 8 }, () => Array(8).fill(-1));
    POS.forEach(([r, c], k) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { owner[r + i][c + j] = k; if (k < upto) g[r + i][c + j] = block(k, bits[k])[i][j]; } });
    return { g, owner };
  }
  // an LED matrix: x, y top-left, cell pitch; on(r, c) -> 0..1 brightness; tint(r, c) -> colour; blur in px
  function leds(x, y, p, on, { tint = () => LED, blur = 0, frame = true, ghost = 0.1 } = {}) {
    let s = frame ? `<rect x="${x - p * 0.35}" y="${y - p * 0.35}" width="${p * 8.7}" height="${p * 8.7}" rx="${p * 0.25}" fill="#0b0f16" stroke="#2a3442" stroke-width="3"/>` : "";
    s += `<g ${blur ? `style="filter:blur(${blur.toFixed(1)}px)"` : ""}>`;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const k = clamp(on(r, c)), col = tint(r, c), cx = x + c * p + p / 2, cy = y + r * p + p / 2;
      s += `<circle cx="${cx}" cy="${cy}" r="${(p * 0.36).toFixed(1)}" fill="${col}" opacity="${(ghost + (1 - ghost) * k).toFixed(2)}" ${k > 0.5 ? `style="filter:drop-shadow(0 0 ${(p * 0.3).toFixed(0)}px ${col})"` : ""}/>`;
    }
    return s + "</g>";
  }
  // an illustrative dense "Data Matrix-like" pattern: an L-shaped finder border and pseudo-random data
  const DM = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => (c === 0 || r === 7 ? 1 : r === 0 ? c % 2 === 0 ? 1 : 0 : c === 7 ? r % 2 : hash(r * 8 + c + 3) > 0.5 ? 1 : 0)));
  const svg = (inner) => `<svg class="abs" style="left:0;top:0" width="1600" height="900" viewBox="0 0 1600 900">${inner}</svg>`;
  const T = (x, y, txt, col = DIM, size = 20, extra = "") => `<text x="${x}" y="${y}" font-family="Courier New" font-weight="700" font-size="${size}" fill="${col}" letter-spacing="2" ${extra}>${txt}</text>`;

  // a simple webcam
  const cam = (x, y, s = 1, col = "#c9d6e8") => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-60" y="-42" width="120" height="84" rx="20" fill="#11161f" stroke="${col}" stroke-width="3"/>
    <circle r="26" fill="#0b1422" stroke="${CY}" stroke-width="4"/><circle r="10" fill="${CY}" opacity=".7"/><rect x="-14" y="42" width="28" height="30" fill="#2a3442"/><rect x="-40" y="70" width="80" height="10" rx="4" fill="#2a3442"/></g>`;

  // ---------------- scenes ----------------

  // the need: radio waves crowding, a no-radio sign over a hospital and a school, then an LED beaming bits to a camera
  V.need = (s, lt) => {
    const a = cs(s, 0), b = cs(s, 1), c = cs(s, 2);
    let waves = "";
    for (let t = 0; t < 4; t++) for (let i = 0; i < 9; i++) {
      const ph = ((lt * 0.6 + i / 9) % 1), r = 30 + ph * 300, k = seg(lt, a + 0.2 + t * 0.4, a + 0.8 + t * 0.4) * (1 - seg(lt, b, b + 0.6) * 0.75);
      waves += `<circle cx="${260 + t * 150}" cy="560" r="${r.toFixed(0)}" fill="none" stroke="${[CY, AM, VI, RD][t]}" stroke-width="2" opacity="${((1 - ph) * 0.55 * k).toFixed(2)}"/>`;
    }
    const towers = [0, 1, 2, 3].map((t) => `<g opacity="${(seg(lt, a + 0.2 + t * 0.4, a + 0.6 + t * 0.4) * (1 - out3(seg(lt, b, b + 0.6)))).toFixed(2)}"><path d="M${245 + t * 150} 640 L${260 + t * 150} 545 L${275 + t * 150} 640" stroke="#c9d6e8" stroke-width="4" fill="none"/><circle cx="${260 + t * 150}" cy="540" r="7" fill="#fff"/></g>`).join("");
    const noK = out3(seg(lt, a + 2.6, a + 3.2));
    const places = [["🏥", "HOSPITALS"], ["🏫", "SCHOOLS"]].map(([ic, l], i) => `<div style="display:inline-block;margin-right:40px;text-align:center;${pop(lt, a + 2.6 + i * 0.4, 0.35)}">
        <div style="font-size:84px;position:relative">${ic}<span style="position:absolute;right:-24px;top:-14px;font-size:42px;color:${RD}">📵</span></div>
        <div class="mono" style="font-size:20px;letter-spacing:.2em;color:${RD};margin-top:6px">${l}</div></div>`).join("");
    const k = out3(seg(lt, b, b + 0.8)), k2 = out3(seg(lt, c, c + 0.8));
    let bits = "";
    for (let i = 0; i < 12; i++) { const x = 620 + ((lt * 260 + i * 70) % 560); bits += T(x.toFixed(0), 470 + 10 * Math.sin(i + lt * 3), (i * 7 + 3) % 3 ? "1" : "0", "#fff6", 24, `opacity="${k2}"`); }
    return head(lt, "The need", "Light can carry data too") + svg(`${waves}${towers}
        <g opacity="${k}"><rect x="520" y="390" width="70" height="170" rx="10" fill="#11161f" stroke="#c9d6e8" stroke-width="3"/>
          <circle cx="555" cy="440" r="22" fill="#fff" style="filter:drop-shadow(0 0 ${(18 + 14 * Math.sin(lt * 8)).toFixed(0)}px #fff)" opacity="${(0.6 + 0.4 * Math.abs(Math.sin(lt * 7))).toFixed(2)}"/>
          ${T(500, 600, "LED", "#fff", 22)}</g>
        <path d="M580 440 L1220 400 L1220 520 Z" fill="url(#beam)" opacity="${(0.55 * k2).toFixed(2)}"/>
        <defs><linearGradient id="beam" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="${CY}" stop-opacity=".05"/></linearGradient></defs>
        ${bits}<g opacity="${k2}">${cam(1300, 460, 1.1)}${T(1235, 560, "CAMERA", "#fff", 22)}</g>
        <g opacity="${(1 - k) * seg(lt, a, a + 0.5)}">${T(170, 750, "RADIO SPECTRUM: CROWDED", RD, 22)}</g>`) +
      `<div class="abs" style="left:900px;top:330px;opacity:${(noK * (1 - k)).toFixed(2)}">${places}</div>`;
  };

  // the problem: a dense LED pattern photographed nearer and further (sharper -> blurred), then a 1..256 search counter
  V.problem = (s, lt) => {
    const a = cs(s, 0), b = cs(s, 1), c = cs(s, 2);
    const dist = [["20 cm", 0, 40, 170], ["1 m", 2.5, 30, 570], ["2 m", 6, 20, 880]];
    const shots = dist.map(([lab, bl, p, x], i) => {
      const y = 690 - p * 8.4, k = seg(lt, i === 0 ? a + 0.3 : b + (i - 1) * 0.8, (i === 0 ? a + 0.3 : b + (i - 1) * 0.8) + 0.5);
      return `<g opacity="${k}">${leds(x, y, p, (r, cc) => DM[r][cc], { blur: bl })}${T(x, 740, lab, i ? RD : GR, 24)}</g>`;
    }).join("");
    const n = Math.max(1, Math.floor(count(lt, c + 0.2, c + 2.6, 256)));
    const ck = seg(lt, c, c + 0.4);
    let thumbs = "";
    for (let i = 0; i < 48; i++) { const on = i === (n - 1) % 48; thumbs += `<rect x="${1110 + (i % 8) * 46}" y="${360 + Math.floor(i / 8) * 46}" width="38" height="38" fill="${on ? AM : "#0d1622"}" stroke="${on ? AM : "#2a3442"}" stroke-width="2"/>`; }
    return head(lt, "The problem", "Far away, the dots blur") + svg(`${shots}
        <path d="M170 800 H1050" stroke="${DIM}" stroke-width="2" marker-end="url(#ar)" opacity="${seg(lt, b, b + 0.5)}"/>
        <defs><marker id="ar" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="${DIM}"/></marker></defs>
        ${T(610, 835, "CAMERA MOVES BACK", DIM, 20, `text-anchor="middle" opacity="${seg(lt, b, b + 0.5)}"`)}
        <g opacity="${ck}">${thumbs}${T(1110, 690, "MATCHING…", AM, 22)}${T(1110, 750, `${n} / 256`, "#fff", 48)}</g>`);
  };

  // the idea: the 8x8 grid, outer blocks (bits 1-4, cyan) and inner blocks (bits 5-8, amber) light up in turn
  V.idea = (s, lt) => {
    const a = cs(s, 0), b = cs(s, 1), c = cs(s, 2);
    const { owner } = grid(BYTE);
    const outK = seg(lt, c + 0.3, c + 1.0), inK = seg(lt, c + 2.2, c + 2.9), gridK = out3(seg(lt, b, b + 0.6));
    const on = (r, cc) => { const o = owner[r][cc]; return o < 0 ? 0 : o < 4 ? outK : inK; };
    const tint = (r, cc) => (owner[r][cc] < 4 ? CY : AM);
    // a texture motif for "texture analysis": nested squares
    let motif = ""; for (let i = 0; i < 5; i++) { const sz = 40 + i * 44; motif += `<rect x="${1200 - sz / 2}" y="${470 - sz / 2}" width="${sz}" height="${sz}" fill="none" stroke="${i % 2 ? CY : VI}" stroke-width="3" opacity="${(seg(lt, a + 0.4 + i * 0.25, a + 0.8 + i * 0.25) * (1 - gridK)).toFixed(2)}" transform="rotate(${(lt * 6 * (i % 2 ? 1 : -1)).toFixed(1)} 1200 470)"/>`; }
    const lab = (k, x, y, col, al) => `${T(x, y, `P${k + 1}`, col, 20, `text-anchor="${al}"`)}`;
    const P = 64, X = 420, Y = 300;
    const labels = POS.map(([r, cc], k) => lab(k, X + cc * P + P, Y + r * P - 8, k < 4 ? CY : AM, "middle")).join("");
    return head(lt, "The idea", "Patterns inside patterns") + svg(`${motif}${T(1110, 760, "TEXTURE ANALYSIS", VI, 22, `opacity="${(seg(lt, a + 0.6, a + 1.2) * (1 - gridK)).toFixed(2)}"`)}
        <g opacity="${gridK}">${leds(X, Y, P, on, { tint, ghost: 0.12 })}
          ${POS.map(([r, cc], k) => `<rect x="${X + cc * P + 3}" y="${Y + r * P + 3}" width="${P * 2 - 6}" height="${P * 2 - 6}" fill="none" stroke="${k < 4 ? CY : AM}" stroke-width="2" stroke-dasharray="6 6" opacity="${(k < 4 ? outK : inK).toFixed(2)}"/>`).join("")}
          <g opacity="${outK}">${labels.split("</text>").slice(0, 4).join("</text>")}</text></g><g opacity="${inK}">${labels.split("</text>").slice(4, 8).join("</text>")}</text></g></g>
        <g opacity="${outK}">${T(1000, 380, "OUTER · BITS 1–4", CY, 26)}</g>
        <g opacity="${inK}">${T(1000, 440, "INNER · BITS 5–8", AM, 26)}</g>
        <g opacity="${gridK}">${T(1000, 520, "1 BYTE = 1 FRAME", DIM, 22)}</g>`);
  };

  // encoding: the two block shapes, then the byte 10110111 built block by block, ending in the paper's exact matrix
  V.encode = (s, lt) => {
    const a = cs(s, 0), b = cs(s, 1), c = cs(s, 2);
    const mini = (x, y, m, col, lbl, at) => `<g opacity="${seg(lt, at, at + 0.4)}">${[0, 1].map((i) => [0, 1].map((j) => `<circle cx="${x + j * 40 + 20}" cy="${y + i * 40 + 20}" r="15" fill="${m[i][j] ? col : "#1a2230"}" ${m[i][j] ? `style="filter:drop-shadow(0 0 8px ${col})"` : ""}/>`).join("")).join("")}
        ${T(x + 40, y + 115, lbl, col, 20, `text-anchor="middle"`)}</g>`;
    const legend = mini(1040, 300, [[1, 1], [1, 1]], GR, "0 · L0", a + 0.2) +
      CORNER.map((m, i) => mini(1040 + i * 105, 460, m, AM, `1 · L${i + 1}`, b + 0.3 + i * 0.25)).join("");
    // the byte is built bit by bit during the third sentence
    const per = Math.max(0.35, (s.captions[2] ? s.captions[2].end - s.captions[2].start - 1.2 : 3) / 8);
    const built = lt < c + 1.0 ? 0 : Math.min(8, Math.floor((lt - c - 1.0) / per) + 1);
    const { g, owner } = grid(BYTE, built);
    const done = built >= 8, P = 60, X = 300, Y = 300;
    const on = (r, cc) => g[r][cc] * (owner[r][cc] === built - 1 && !done ? 0.6 + 0.4 * Math.sin(lt * 12) : 1);
    const tint = (r, cc) => { const o = owner[r][cc]; return o < 0 ? LED : BYTE[o] ? AM : GR; };
    const bitsRow = BYTE.map((v, i) => `<span style="display:inline-block;width:56px;text-align:center;font-size:60px;font-weight:700;color:${i < built ? (v ? AM : GR) : "#3a4656"};${i === built - 1 && !done ? `text-shadow:0 0 20px ${v ? AM : GR}` : ""}">${v}</span>`).join("");
    return head(lt, "Encoding", "Zero: a full block · One: an L") + svg(`${leds(X, Y, P, on, { tint, ghost: 0.1 })}${legend}
        ${done ? T(X, Y + P * 8 + 46, "= THE PAPER'S EXAMPLE PATTERN (EQ. 6)", DIM, 18) : ""}`) +
      `<div class="abs mono" style="left:1030px;top:640px;${rise(lt, c)}">${bitsRow}</div>
       <div class="abs mono" style="left:1030px;top:720px;font-size:20px;letter-spacing:.2em;color:${DIM};${rise(lt, c + 0.3)}">BITS 1–4 OUTER · 5–8 INNER</div>`;
  };

  // energy vs entropy: Data Matrix-like vs nested, two gauges, then the trade-off
  V.energy = (s, lt) => {
    const a = cs(s, 0), b = cs(s, 1), c = cs(s, 2);
    const { g } = grid(BYTE);
    const gauge = (x, y, v, max, col, lbl, at) => { const k = out3(seg(lt, at, at + 1.2)), w = 320;
      return `<g opacity="${seg(lt, at, at + 0.3)}"><rect x="${x}" y="${y}" width="${w}" height="26" fill="#0d1622" stroke="#2a3442" stroke-width="2"/>
        <rect x="${x}" y="${y}" width="${(w * v / max * k).toFixed(0)}" height="26" fill="${col}" style="filter:drop-shadow(0 0 10px ${col})"/>
        ${T(x + w + 18, y + 22, (v * k).toFixed(2), col, 30)}${T(x, y - 12, lbl, DIM, 18)}</g>`; };
    const tk = seg(lt, c, c + 0.5);
    const blurNow = seg(lt, b + 1.5, b + 3.0) * 3.5;
    return head(lt, "Why it works", "More order, seen from further") + svg(`
        <g opacity="${seg(lt, a, a + 0.5)}">${leds(190, 300, 40, (r, cc) => DM[r][cc], { blur: blurNow })}${T(190, 660, "DATA MATRIX (ILLUSTRATIVE)", DIM, 18)}
          ${leds(620, 300, 40, (r, cc) => g[r][cc], { tint: () => AM, blur: blurNow * 0.6 })}${T(620, 660, "NESTED PATTERN", AM, 18)}</g>
        ${gauge(1030, 340, 0.2678, 0.5, DIM, "ENERGY · DATA MATRIX", b + 0.2)}${gauge(1030, 430, 0.4399, 0.5, GR, "ENERGY · NESTED", b + 0.9)}
        <g opacity="${tk}">${T(1030, 560, "TRADE-OFF · ENTROPY (INFORMATION)", AM, 18)}${T(1030, 600, "DATA MATRIX 2.00 · NESTED 1.64", "#fff", 22)}</g>
        ${T(1030, 720, "PAPER, TABLE 1 (GLCM)", DIM, 16, `opacity="${seg(lt, b + 1, b + 1.5)}"`)}`);
  };

  // decoding: the pattern splits into outer and inner 4x4s, two threads each scan 16 candidates, the bits join up
  V.decode = (s, lt) => {
    const a = cs(s, 0), b = cs(s, 1);
    const { g } = grid(BYTE);
    const split = out3(seg(lt, a + 0.6, a + 1.8));
    // outer 4x4 = the four corner blocks; inner 4x4 = the centre (paper Eq. 7, 8)
    const sub = (inner) => Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, c) => inner ? g[2 + r][2 + c] : g[r < 2 ? r : r + 4][c < 2 ? c : c + 4]));
    const OP = sub(false), IP = sub(true);
    const mat = (x, y, m, p, col) => m.map((row, r) => row.map((v, c) => `<circle cx="${x + c * p + p / 2}" cy="${y + r * p + p / 2}" r="${p * 0.36}" fill="${v ? col : "#1a2230"}" ${v ? `style="filter:drop-shadow(0 0 6px ${col})"` : ""}/>`).join("")).join("");
    const whole = `<g opacity="${(1 - split).toFixed(2)}">${leds(560, 290, 44, (r, c) => g[r][c], { tint: () => AM })}</g>`;
    const ox = lerp(600, 200, split), ix = lerp(640, 960, split), y = lerp(330, 300, split);
    const scanK = seg(lt, a + 2.0, a + 2.3), found = lt > a + 4.2;
    const lane = (x, label, col, idx, bits, t0) => {
      let cand = ""; for (let i = 0; i < 16; i++) { const cur = found ? idx : Math.floor((lt - t0) * 6) % 16, on = i === cur;
        cand += `<rect x="${x + (i % 8) * 34}" y="${560 + Math.floor(i / 8) * 34}" width="28" height="28" fill="${on ? (found ? GR : col) : "#0d1622"}" stroke="${on ? col : "#2a3442"}" stroke-width="2"/>`; }
      return `<g opacity="${scanK}">${T(x, 540, label, col, 20)}${cand}${T(x, 670, found ? `→ ${bits}` : "SEARCHING…", found ? GR : DIM, found ? 36 : 20)}</g>`;
    };
    const joinK = seg(lt, a + 4.6, a + 5.2), nk = seg(lt, b, b + 0.6);
    return head(lt, "Decoding", "Two searches, in parallel") + svg(`${whole}
        <g opacity="${split}">${mat(ox, y, OP, 50, CY)}${T(ox, y - 14, "OUTER", CY, 20)}${mat(ix, y, IP, 50, AM)}${T(ix, y - 14, "INNER", AM, 20)}</g>
        ${lane(200, "THREAD 1 · 16 PATTERNS", CY, 11, "1011", a + 2.0)}${lane(960, "THREAD 2 · 16 PATTERNS", AM, 7, "0111", a + 2.0)}
        ${T(800, 760, "10110111", "#fff", 56, `text-anchor="middle" opacity="${joinK}" style="filter:drop-shadow(0 0 14px ${GR})"`)}`) +
      `<div class="abs" style="left:1300px;top:290px;width:200px;text-align:center;opacity:${nk}"><div style="font-size:84px;font-weight:700;color:${GR};text-shadow:0 0 20px ${GR}">16</div>
        <div class="mono" style="font-size:18px;color:${DIM};letter-spacing:.15em">PER THREAD</div><div style="font-size:40px;color:${DIM};text-decoration:line-through;margin-top:10px">256</div></div>`;
  };

  // the prototype: Arduino -> LED matrix ~~ light ~~ webcam -> laptop; then the three tuned camera settings
  V.proto = (s, lt) => {
    const a = cs(s, 0), b = cs(s, 1);
    const { g } = grid(BYTE), flick = Math.floor(lt * 2) % 2;
    const alt = grid([0, 1, 1, 0, 1, 0, 0, 1]).g;
    const k1 = seg(lt, a + 0.4, a + 0.9), k2 = seg(lt, a + 1.4, a + 1.9), k3 = seg(lt, a + 2.6, a + 3.1), k4 = seg(lt, a + 3.6, a + 4.1);
    const slider = (y, lbl, v, min, max, at) => { const k = out3(seg(lt, at, at + 0.9)), x = 960, w = 380, pos = (v - min) / (max - min);
      return `<g opacity="${seg(lt, at, at + 0.3)}">${T(x, y - 14, lbl, DIM, 18)}<rect x="${x}" y="${y}" width="${w}" height="8" fill="#2a3442"/>
        <rect x="${x}" y="${y}" width="${(w * pos * k).toFixed(0)}" height="8" fill="${GR}"/><circle cx="${(x + w * pos * k).toFixed(0)}" cy="${y + 4}" r="14" fill="${GR}" style="filter:drop-shadow(0 0 8px ${GR})"/>
        ${T(x + w + 26, y + 12, String(v), "#fff", 26)}</g>`; };
    return head(lt, "The prototype", "Low-cost, and on purpose") + svg(`
        <g opacity="${k1}"><rect x="170" y="420" width="170" height="120" rx="8" fill="#0d3a5c" stroke="${CY}" stroke-width="3"/>${T(186, 470, "ARDUINO", "#fff", 20)}${T(186, 500, "UNO", "#fff", 20)}
          <path d="M340 480 H400" stroke="${CY}" stroke-width="4"/></g>
        <g opacity="${k2}">${leds(410, 380, 26, (r, c) => (flick ? alt : g)[r][c])}${T(410, 620, "8×8 LED MATRIX", LED, 18)}</g>
        <path d="M640 430 L780 400 L780 520 L640 490 Z" fill="${CY}" opacity="${(0.12 * k3).toFixed(2)}"/>
        <g opacity="${k3}">${cam(850, 460, 0.9)}${T(790, 560, "LOGITECH WEBCAM", "#fff", 16)}${T(790, 590, "160 × 140 PX", AM, 22)}</g>
        ${slider(330, "BRIGHTNESS", 128, 0, 255, b + 0.3)}${slider(430, "EXPOSURE", -6, 0, -9, b + 1.0)}${slider(530, "CONTRAST", 96, 0, 255, b + 1.7)}
        <g opacity="${seg(lt, b + 2.6, b + 3.1)}">${T(960, 640, "→ BEST SIGNAL-TO-NOISE RATIO", GR, 22)}${T(960, 676, "AMBIENT LIGHT 10–20 LUX", DIM, 16)}</g>`);
  };

  // results: search time (qualitative), then BER at 2 m and 256 bps from Table 3, with the two improvements
  V.results = (s, lt) => {
    const a = cs(s, 0), b = cs(s, 1);
    const k0 = seg(lt, a + 0.2, a + 0.6) * (1 - seg(lt, b, b + 0.5));
    const lin = `<path d="M200 700 ${Array.from({ length: 40 }, (_, i) => `L${200 + i * 26} ${(700 - i * 9 - 30 * hash(i)).toFixed(0)}`).join(" ")}" fill="none" stroke="${RD}" stroke-width="4" stroke-dasharray="1400" stroke-dashoffset="${(1400 * (1 - seg(lt, a + 0.3, a + 2.2))).toFixed(0)}"/>`;
    const bin = `<path d="M200 690 ${Array.from({ length: 40 }, (_, i) => `L${200 + i * 26} ${(690 - 6 * hash(i + 50)).toFixed(0)}`).join(" ")}" fill="none" stroke="${GR}" stroke-width="4" stroke-dasharray="1400" stroke-dashoffset="${(1400 * (1 - seg(lt, a + 0.6, a + 2.5))).toFixed(0)}"/>`;
    const part1 = `<g opacity="${k0}">${lin}${bin}<line x1="200" y1="720" x2="1240" y2="720" stroke="#ffffff40" stroke-width="2"/>
        ${T(1100, 330, "LINEAR SEARCH", RD, 20)}${T(1100, 670, "TWO-THREAD SEARCH", GR, 20)}${T(200, 760, "SEARCH TIME PER PATTERN · SHAPE ILLUSTRATIVE (PAPER, FIG. 11–12)", DIM, 16)}</g>`;
    const k1 = seg(lt, b, b + 0.4);
    const bars = [["DATA MATRIX", 5.517578125, DIM], ["QR CODE", 4.931640625, VI], ["NESTED", 2.83203125, GR]].map(([n, v, col], i) => {
      const k = out3(seg(lt, b + 0.3 + i * 0.4, b + 1.3 + i * 0.4)), h = 340 * v / 6 * k, x = 230 + i * 230;
      return `<rect x="${x}" y="${(720 - h).toFixed(0)}" width="150" height="${h.toFixed(0)}" fill="${col}" ${i === 2 ? `style="filter:drop-shadow(0 0 14px ${GR})"` : ""}/>
        ${T(x + 75, (705 - h).toFixed(0), (v * k).toFixed(2) + "%", col, 28, `text-anchor="middle"`)}${T(x + 75, 756, n, col, 18, `text-anchor="middle"`)}`; }).join("");
    const imp = (y, txt, at) => `<div style="position:absolute;left:0;top:${y}px;${pop(lt, at, 0.4)}"><span class="chip" style="font-size:28px;padding:12px 18px;white-space:nowrap;color:${GR}">${txt}</span></div>`;
    return head(lt, "The results", "Faster search · fewer errors") + svg(`${part1}
        <g opacity="${k1}">${bars}<line x1="200" y1="720" x2="940" y2="720" stroke="#ffffff40" stroke-width="2"/>${T(200, 330, "BIT ERROR RATE · 2 M · 256 BPS (PAPER, TABLE 3)", DIM, 18)}</g>`) +
      `<div class="abs" style="left:990px;top:0;opacity:${k1}">${imp(400, "−48.6% vs DATA MATRIX", b + 2.2)}${imp(500, "−42.5% vs QR CODE", b + 4.0)}</div>`;
  };

  // what's next: a factory machine with an LED panel watched by a camera (no radio), then three directions
  V.next = (s, lt) => {
    const a = cs(s, 0), b = cs(s, 1);
    const k = seg(lt, a + 0.2, a + 0.8) * (1 - seg(lt, b, b + 0.5) * 0.85);
    const { g } = grid([(Math.floor(lt * 2)) % 2, 1, 0, 1, 1, 0, 1, (Math.floor(lt * 2) + 1) % 2]);
    const gear = (x, y, r, sp) => `<g transform="translate(${x} ${y}) rotate(${(lt * sp).toFixed(1)})">${Array.from({ length: 8 }, (_, i) => `<rect x="-${r * 0.18}" y="-${r * 1.25}" width="${r * 0.36}" height="${r * 0.5}" fill="#3a4656" transform="rotate(${i * 45})"/>`).join("")}<circle r="${r}" fill="#3a4656"/><circle r="${r * 0.35}" fill="#0b0f16"/></g>`;
    const cards = [["📷", "Sharper cameras", "higher resolution"], ["🔍", "Magnification", "longer distances"], ["🎨", "More patterns + colours", "more data per frame"]].map(([ic, t, sub], i) =>
      `<div class="panel" style="left:${150 + i * 440}px;top:360px;width:400px;height:300px;padding:30px;text-align:center;${rise(lt, b + 0.8 + i * 0.6)}">
        <div style="font-size:84px">${ic}</div><div style="margin-top:16px;font-size:32px;font-weight:700">${t}</div>
        <div class="mono" style="margin-top:10px;font-size:19px;color:${DIM};letter-spacing:.1em">${sub.toUpperCase()}</div></div>`).join("");
    return head(lt, "What's next", "Built for the factory floor") + svg(`<g opacity="${k}">
        <rect x="220" y="380" width="380" height="300" rx="12" fill="#151c27" stroke="#3a4656" stroke-width="4"/>${gear(330, 600, 50, 40)}${gear(440, 620, 34, -60)}
        ${leds(450, 400, 16, (r, c) => g[r][c])}${T(240, 420, "MACHINE", DIM, 18)}
        <path d="M600 470 L1000 430 L1000 520 Z" fill="${CY}" opacity=".1"/>${cam(1080, 470, 1)}
        ${T(980, 590, "READS MACHINE DATA", "#fff", 18)}${T(980, 620, "📵 NO RADIO", RD, 20)}</g>`) + cards;
  };
})();
