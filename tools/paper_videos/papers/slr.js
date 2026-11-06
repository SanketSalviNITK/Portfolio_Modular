/* Research Bytes #02, continuous sign language recognition with a Leap Motion sensor: the visuals for each scene
   (the script is papers/slr.json). Visuals sit left of Neerja and above the captions: x 140..1500, y 120..850. */
(() => {
  const { clamp, lerp, seg, out3, sine, hash, esc, rise, pop, cs, count } = window.PV;
  const V = window.VIEWS;
  const CY = "#46e2ff", GR = "#5dffa8", AM = "#ffb35c", VI = "#b48cff", RD = "#ff6b8a", DIM = "#9aa7b4";
  const head = (lt, kick, text, color = CY) => `<div class="abs kick" style="left:150px;top:130px;color:${color};${rise(lt, 0.05)}">${kick}</div>
    <div class="abs h1" style="left:150px;top:175px;width:1300px;${rise(lt, 0.2)}">${text}</div>`;

  // a stylised hand: a palm and five fingers of three bones; fingertips (green) and palm centre (amber) glow; curl bends them
  function hand(cx, cy, s, curl, mirror, opts = {}) {
    const m = mirror ? -1 : 1;
    // finger roots along the top of the palm (thumb low at the side), their direction, and their length
    const fingers = [[-0.62, 0.05, -2.45, 0.62], [-0.36, -0.42, -1.85, 0.86], [-0.08, -0.5, -1.62, 0.95], [0.2, -0.45, -1.4, 0.88], [0.44, -0.3, -1.2, 0.7]];
    let g = `<path d="M${cx + m * -0.55 * s} ${cy - 0.35 * s} Q${cx} ${cy - 0.62 * s} ${cx + m * 0.55 * s} ${cy - 0.3 * s} L${cx + m * 0.5 * s} ${cy + 0.35 * s}
      Q${cx} ${cy + 0.62 * s} ${cx + m * -0.5 * s} ${cy + 0.35 * s} Z" fill="rgba(180,140,255,.14)" stroke="${opts.bone || VI}" stroke-width="${(s * 0.03).toFixed(1)}" stroke-linejoin="round"/>`;
    const tips = [];
    fingers.forEach(([bx, by, dir, len], f) => {
      const c = clamp(curl[f] ?? curl);
      let x = cx + m * bx * s, y = cy + by * s, ang = mirror ? Math.PI - dir : dir;
      const pts = [[x, y]];
      for (let b = 0; b < 3; b++) {
        ang += c * 0.5 * m * (f === 0 ? -1 : 1);
        x += Math.cos(ang) * 0.24 * s * len; y += Math.sin(ang) * 0.24 * s * len; pts.push([x, y]);
      }
      g += `<polyline points="${pts.map((p) => p.map((v) => v.toFixed(0)).join(",")).join(" ")}" stroke="${opts.bone || VI}" stroke-width="${(s * 0.07).toFixed(1)}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`;
      tips.push([x, y]);
    });
    const glow = opts.glow ?? 1, dot = (p, col) => `<circle cx="${p[0].toFixed(0)}" cy="${p[1].toFixed(0)}" r="${(s * 0.055).toFixed(1)}" fill="${col}" opacity="${glow}" style="filter:drop-shadow(0 0 8px ${col})"/>`;
    return { svg: g + tips.map((p) => dot(p, GR)).join("") + dot([cx, cy], AM), tips, palm: [cx, cy] };
  }

  // the need: two counters, then a signer and a listener with a gap between them
  V.need = (s, lt) => {
    const gapK = out3(seg(lt, cs(s, 1), cs(s, 1) + 0.8)), sway = Math.sin(lt * 3);
    const signer = hand(380, 660, 140, [0.2 + 0.3 * sine((lt % 1.2) / 1.2), 0.1, 0.5 + 0.4 * Math.sin(lt * 4), 0.6, 0.3], false, { glow: 0.9 });
    return head(lt, "The need", "A language most people can't read") + `
      <div class="abs" style="left:150px;top:300px;${rise(lt, cs(s, 0) + 0.2)}"><div style="font-size:120px;font-weight:700;color:${CY};text-shadow:0 0 26px ${CY}">${count(lt, cs(s, 0) + 0.2, cs(s, 0) + 1.6, 7)}%</div>
        <div style="font-size:28px;font-weight:600">of people worldwide have hearing loss</div></div>
      <div class="abs" style="left:780px;top:300px;${rise(lt, cs(s, 0) + 1.6)}"><div style="font-size:120px;font-weight:700;color:${AM};text-shadow:0 0 26px ${AM}">${count(lt, cs(s, 0) + 1.6, cs(s, 0) + 3, 63)}M</div>
        <div style="font-size:28px;font-weight:600">in India alone</div></div>
      <svg class="abs" style="left:0;top:0;opacity:${gapK}" width="1600" height="900" viewBox="0 0 1600 900">${signer.svg}
        <g transform="translate(1100 600)"><circle r="56" fill="none" stroke="${DIM}" stroke-width="5"/><path d="M-90 170 Q0 70 90 170" fill="none" stroke="${DIM}" stroke-width="5"/>
          <text x="80" y="-60" font-size="80" fill="${RD}" font-weight="700">?</text></g>
        <line x1="560" y1="600" x2="980" y2="600" stroke="${RD}" stroke-width="4" stroke-dasharray="14 12" opacity="${(0.4 + 0.4 * Math.abs(sway)).toFixed(2)}"/>
        <text x="770" y="580" text-anchor="middle" font-family="Courier New" font-weight="700" font-size="22" fill="${RD}" letter-spacing="4">NO TRANSLATOR</text></svg>`;
  };

  // the problem: isolated words are read cleanly; a continuous stream blurs into unknowns
  V.problem = (s, lt) => {
    const words = ["HI", "HOW", "ARE", "YOU"], half = cs(s, 1);
    const iso = words.map((w, i) => `<div style="display:inline-block;margin-right:28px;text-align:center;${pop(lt, 0.6 + i * 0.4, 0.3)}">
        <div style="width:150px;height:110px;border:2px solid ${GR};display:grid;place-items:center;font-size:44px">✋</div>
        <div class="mono" style="margin-top:10px;font-size:26px;font-weight:700;color:${GR}">${w} ✓</div></div>`).join("");
    let stream = ""; for (let i = 0; i < 26; i++) { const x = ((i * 60 + lt * 260) % 1560) - 60; stream += `<span style="position:absolute;left:${x.toFixed(0)}px;top:${(30 + 18 * Math.sin(i + lt * 3)).toFixed(0)}px;font-size:44px;filter:blur(${(2 + 3 * hash(i)).toFixed(1)}px);opacity:.75">✋</span>`; }
    return head(lt, "The problem", "Real signing flows, word after word") + `
      <div class="abs mono" style="left:150px;top:310px;font-size:22px;letter-spacing:.2em;color:${GR};${rise(lt, 0.3)}">ISOLATED SIGNS</div>
      <div class="abs" style="left:150px;top:350px">${iso}</div>
      <div class="abs mono" style="left:150px;top:600px;font-size:22px;letter-spacing:.2em;color:${RD};${rise(lt, half)}">CONTINUOUS SIGNING</div>
      <div class="abs" style="left:150px;top:640px;width:1300px;height:130px;overflow:hidden;border:2px solid rgba(255,107,138,.5);opacity:${seg(lt, half, half + 0.5)}">${stream}
        <div class="mono" style="position:absolute;right:20px;bottom:14px;font-size:26px;font-weight:700;color:${RD}">? ? ? ?</div></div>`;
  };

  // the sensor: a Leap Motion device, its IR cameras and LEDs, a scan dome and a frame counter
  V.sensor = (s, lt) => {
    const scan = (lt * 0.8) % 1, k = out3(seg(lt, 0.3, 1.2));
    const fps = Math.min(90, Math.round(90 * seg(lt, cs(s, 0) + 3, cs(s, 0) + 4.5)));
    const h = hand(760, 560 + 10 * Math.sin(lt * 2), 150, [0.15, 0.05 + 0.3 * sine(lt % 1), 0.1, 0.2, 0.3], false);
    return head(lt, "The sensor", "Leap Motion: hands in 3D") + `
      <svg class="abs" style="left:0;top:0" width="1600" height="900" viewBox="0 0 1600 900">
        <defs><radialGradient id="dome" cx="50%" cy="100%" r="100%"><stop offset="0" stop-color="${CY}" stop-opacity=".22"/><stop offset="1" stop-color="${CY}" stop-opacity="0"/></radialGradient></defs>
        <path d="M410 760 A350 330 0 0 1 1110 760 Z" fill="url(#dome)" opacity="${k}"/>
        <path d="M${410 + 700 * scan * 0} 760 A350 330 0 0 1 1110 760" fill="none" stroke="${CY}" stroke-width="2" opacity="${(0.3 * k).toFixed(2)}" stroke-dasharray="6 10"/>
        <line x1="420" y1="${(760 - 330 * scan).toFixed(0)}" x2="1100" y2="${(760 - 330 * scan).toFixed(0)}" stroke="${CY}" stroke-width="2" opacity="${(0.5 * (1 - scan) * k).toFixed(2)}"/>
        ${h.svg}
        <g transform="translate(760 790)" opacity="${k}">
          <rect x="-190" y="-34" width="380" height="68" rx="22" fill="#11161f" stroke="#c9d6e8" stroke-width="3"/>
          ${[-110, 110].map((x) => `<circle cx="${x}" cy="0" r="18" fill="#1d2633" stroke="${VI}" stroke-width="3"/>`).join("")}
          ${[-45, 0, 45].map((x, i) => `<circle cx="${x}" cy="0" r="9" fill="${RD}" opacity="${(0.5 + 0.5 * Math.sin(lt * 9 + i)).toFixed(2)}" style="filter:drop-shadow(0 0 8px ${RD})"/>`).join("")}
        </g>
        <g font-family="Courier New" font-weight="700" font-size="22" letter-spacing="3">
          <text x="1150" y="745" fill="${VI}" opacity="${seg(lt, cs(s, 0) + 1.0, cs(s, 0) + 1.5)}">◉ 2 INFRARED CAMERAS</text>
          <text x="1150" y="790" fill="${RD}" opacity="${seg(lt, cs(s, 0) + 1.8, cs(s, 0) + 2.3)}">● 3 INFRARED LEDS</text>
          <text x="1150" y="420" fill="${GR}" font-size="64" opacity="${seg(lt, cs(s, 0) + 3, cs(s, 0) + 3.4)}">${fps}</text>
          <text x="1150" y="460" fill="${DIM}" opacity="${seg(lt, cs(s, 0) + 3, cs(s, 0) + 3.4)}">FRAMES / SECOND</text></g>
      </svg>`;
  };

  // the features: two hands, 12 glowing points (10 fingertips, 2 palms), xyz numbers streaming, then normalisation
  V.features = (s, lt) => {
    const curl = (o) => [0.2 + 0.2 * Math.sin(lt * 2 + o), 0.15, 0.3 + 0.3 * Math.sin(lt * 3 + o), 0.3, 0.25];
    const L = hand(430, 600, 150, curl(0), true), R = hand(830, 600, 150, curl(1.5), false);
    const pts = [...L.tips, ...R.tips, L.palm, R.palm], shown = Math.floor(count(lt, cs(s, 0) + 0.6, cs(s, 0) + 2.6, 12));
    const norm = seg(lt, cs(s, 1), cs(s, 1) + 1.2);
    const rows = pts.slice(0, shown).map((p, i) => {
      const x = (p[0] - 630) / 3, y = (600 - p[1]) / 3, z = 40 + 20 * Math.sin(lt + i);
      const f = (v, d) => (norm > 0.5 ? (v / d).toFixed(2) : v.toFixed(0)).padStart(6, " ");
      return `<div>f${String(i + 1).padStart(2, "0")} ${f(x, 140)} ${f(y, 140)} ${f(z, 40)}</div>`;
    }).join("");
    return head(lt, "The features", "12 points per frame") + `
      <svg class="abs" style="left:0;top:0" width="1600" height="900" viewBox="0 0 1600 900">${L.svg}${R.svg}
        ${pts.map((p, i) => `<text x="${(p[0] + 14).toFixed(0)}" y="${(p[1] - 12).toFixed(0)}" font-family="Courier New" font-size="16" fill="${i >= 10 ? AM : GR}" opacity="${i < shown ? 1 : 0}">f${i + 1}</text>`).join("")}</svg>
      <div class="panel mono" style="left:1080px;top:300px;width:400px;padding:16px 20px;font-size:19px;line-height:1.45;white-space:pre;color:${norm > 0.5 ? GR : "#e8eef2"};${rise(lt, cs(s, 0) + 0.6)}">
<div style="color:${DIM}">       x      y      z</div>${rows}</div>
      <div class="abs" style="left:1080px;top:${300 + 40 + 27 * Math.max(shown, 1) + 40}px;opacity:${norm}"><span class="chip" style="color:${GR}">NORMALISED · HAND SIZE REMOVED</span></div>`;
  };

  // the model: frames flow into two LSTM layers, then softmax picks a word; trained isolated → continuous
  V.model = (s, lt) => {
    let frames = ""; for (let i = 0; i < 8; i++) { const x = 160 + i * 48, on = (Math.floor(lt * 6) - i + 80) % 8 === 0; frames += `<rect x="${x}" y="330" width="38" height="120" rx="4" fill="${on ? GR : "#0d1622"}" stroke="${GR}" stroke-width="2" opacity="${on ? 1 : 0.55}"/>`; }
    const layer = (x, label, at) => { const k = out3(seg(lt, at, at + 0.5)), cells = [0, 1, 2, 3].map((j) => `<rect x="${x + 16}" y="${300 + j * 46}" width="148" height="34" rx="6" fill="rgba(180,140,255,${(0.12 + 0.35 * sine(((lt * 2 + j * 0.3 + x / 400) % 1))).toFixed(2)})" stroke="${VI}" stroke-width="2"/>`).join("");
      return `<g opacity="${k}"><rect x="${x}" y="280" width="180" height="210" rx="10" fill="#0d1622" stroke="${VI}" stroke-width="3"/>${cells}<text x="${x + 90}" y="530" text-anchor="middle" font-family="Courier New" font-weight="700" font-size="22" fill="${VI}">${label}</text></g>`; };
    const sk = out3(seg(lt, cs(s, 0) + 2.2, cs(s, 0) + 2.8));
    const probs = [["HI", 0.82], ["HOW", 0.09], ["HELP", 0.05], ["HAPPY", 0.04]];
    const train = seg(lt, cs(s, 1), cs(s, 1) + 1.2), tune = seg(lt, cs(s, 2), cs(s, 2) + 1.2);
    return head(lt, "The model", "An LSTM: a network with memory") + `
      <svg class="abs" style="left:0;top:0" width="1600" height="900" viewBox="0 0 1600 900">${frames}
        <text x="310" y="490" text-anchor="middle" font-family="Courier New" font-size="20" fill="${DIM}">FRAMES · 12 × xyz</text>
        <path d="M560 390 H620" stroke="${CY}" stroke-width="4"/>${layer(630, "LSTM 1 · 128", cs(s, 0) + 0.8)}
        <path d="M810 390 H860" stroke="${CY}" stroke-width="4" opacity="${seg(lt, cs(s, 0) + 1.4, cs(s, 0) + 1.8)}"/>${layer(870, "LSTM 2 · 128", cs(s, 0) + 1.4)}
        <path d="M1050 390 H1100" stroke="${CY}" stroke-width="4" opacity="${sk}"/>
        <g opacity="${sk}">${probs.map(([w, p], i) => `<text x="1110" y="${318 + i * 46}" font-family="Courier New" font-weight="700" font-size="22" fill="${i ? DIM : GR}">${w}</text>
          <rect x="1200" y="${300 + i * 46}" width="${(240 * p * sk).toFixed(0)}" height="24" fill="${i ? DIM : GR}" opacity="${i ? 0.5 : 1}"/>`).join("")}
          <text x="1110" y="530" font-family="Courier New" font-weight="700" font-size="22" fill="${CY}">SOFTMAX</text></g>
      </svg>
      <div class="abs" style="left:150px;top:640px;display:flex;gap:24px;align-items:center;font-size:30px;font-weight:600">
        <span class="chip" style="color:${AM};opacity:${train}">1 · ISOLATED SIGNS</span><span style="opacity:${tune};font-size:40px;color:${DIM}">→</span>
        <span class="chip" style="color:${GR};opacity:${tune}">2 · FINE-TUNED ON CONTINUOUS SIGNING + TRANSITIONS</span></div>`;
  };

  // in action: a flowing gesture stream becomes words, and the words a sentence (an illustrative example)
  V.demo = (s, lt) => {
    const words = ["HI", "HOW", "ARE", "YOU"], each = 0.8, n = Math.min(words.length, Math.floor(seg(lt, 0.5, 0.5 + each * words.length) * words.length + 0.0001));
    const sentence = seg(lt, 0.5 + each * words.length + 0.2, 0.5 + each * words.length + 0.8);
    const h = hand(420, 580, 160, [0.2 + 0.5 * sine((lt % each) / each), 0.1, 0.5 * Math.abs(Math.sin(lt * 4)), 0.5, 0.3], false);
    return head(lt, "In action", "From a gesture stream to a sentence") + `
      <svg class="abs" style="left:0;top:0" width="1600" height="900" viewBox="0 0 1600 900">${h.svg}
        <path d="M620 560 H700" stroke="${CY}" stroke-width="4"/><text x="660" y="540" text-anchor="middle" font-family="Courier New" font-size="18" fill="${DIM}">LSTM</text></svg>
      <div class="abs" style="left:740px;top:400px;display:flex;gap:16px">${words.map((w, i) => `<span class="chip" style="font-size:40px;padding:14px 20px;color:${GR};${i < n ? pop(lt, 0.5 + i * each, 0.3) : "opacity:0"}">${w}</span>`).join("")}</div>
      <div class="abs" style="left:740px;top:560px;font-size:72px;font-weight:700;opacity:${sentence};text-shadow:0 0 26px ${CY}">“Hi, how are you?”</div>
      <div class="abs mono" style="left:740px;top:670px;font-size:20px;letter-spacing:.2em;color:${DIM};opacity:${sentence}">EXAMPLE · ALL FOUR WORDS ARE IN THE DATASET</div>`;
  };

  // the dataset: the 42 sign words from the paper's Table II, and the counts
  const WORDS = ["A", "after", "am", "are", "B", "bad", "ball", "blue", "C", "call", "carom", "college", "English", "excuse", "fine", "food", "friend", "good", "happy", "help", "hi", "how", "I", "morning",
    "name", "orange", "phone", "place", "please", "sorry", "talk", "thank", "think", "Thursday", "time", "toilet", "Tuesday", "what", "where", "which", "work", "you"];
  V.data = (s, lt) => head(lt, "The data", "42 words · 420 recordings · 28 sentences") + `
      <div class="abs" style="left:150px;top:300px;width:880px;display:flex;flex-wrap:wrap;gap:10px">${WORDS.map((w, i) =>
        `<span class="mono" style="font-size:22px;padding:7px 12px;border:1.5px solid rgba(70,226,255,.45);color:#e8eef2;${pop(lt, 0.3 + i * 0.045, 0.25)}">${esc(w)}</span>`).join("")}</div>
      <div class="abs" style="left:1100px;top:300px">${[["42", "sign words", CY, cs(s, 0)], ["× 10", "recordings each", AM, cs(s, 0) + 1.6], ["420", "recordings", GR, cs(s, 0) + 2.8], ["28", "sentences", VI, cs(s, 0) + 4.2]].map(([v, l, c, at]) =>
        `<div style="margin-bottom:22px;${rise(lt, at)}"><span style="font-size:64px;font-weight:700;color:${c};text-shadow:0 0 18px ${c}">${v}</span> <span style="font-size:26px">${l}</span></div>`).join("")}</div>`;

  // the results: LSTM against SVM, for words and for sentences
  V.results = (s, lt) => {
    const grp = (x, label, a, b, at) => {
      const k = out3(seg(lt, at, at + 1.2)), H = 380, top = 760;
      const bar = (bx, v, col, name) => `<rect x="${bx}" y="${(top - H * (v - 50) / 50 * k).toFixed(0)}" width="150" height="${(H * (v - 50) / 50 * k).toFixed(0)}" fill="${col}" ${col === GR ? `style="filter:drop-shadow(0 0 14px ${GR})"` : ""}/>
        <text x="${bx + 75}" y="${(top - H * (v - 50) / 50 * k - 16).toFixed(0)}" text-anchor="middle" font-weight="700" font-size="34" fill="${col}">${(v * k + 0 * (1 - k)).toFixed(2)}%</text>
        <text x="${bx + 75}" y="${top + 36}" text-anchor="middle" font-family="Courier New" font-weight="700" font-size="22" fill="${col}">${name}</text>`;
      return `<g opacity="${seg(lt, at, at + 0.3)}">${bar(x, a, GR, "LSTM")}${bar(x + 180, b, AM, "SVM")}
        <text x="${x + 165}" y="${top + 86}" text-anchor="middle" font-size="30" font-weight="600" fill="#fff">${label}</text></g>`;
    };
    return head(lt, "The results", "The LSTM wins, words and sentences") + `
      <svg class="abs" style="left:0;top:0" width="1600" height="900" viewBox="0 0 1600 900">
        <line x1="150" y1="760" x2="1300" y2="760" stroke="rgba(255,255,255,.25)" stroke-width="2"/>
        <text x="150" y="790" font-family="Courier New" font-size="16" fill="${DIM}">50%</text>
        ${grp(260, "Word accuracy", 90.35, 85.96, cs(s, 0) + 0.3)}${grp(820, "Sentence accuracy", 98.21, 89.58, cs(s, 0) + 2.6)}</svg>`;
  };

  // what's next: three directions from the paper's conclusion
  V.next = (s, lt) => head(lt, "What's next", "Where this goes") + [["🎥🎙️", "Cameras + audio", "multi-modal input"], ["🌏", "More sign languages", "regional variations"], ["📱⌚", "Phones & wearables", "real-time, anywhere"]].map(([icon, t, sub], i) =>
      `<div class="panel" style="left:${150 + i * 440}px;top:330px;width:400px;height:330px;padding:34px;text-align:center;${rise(lt, 0.5 + i * 0.7)}">
        <div style="font-size:96px">${icon}</div><div style="margin-top:20px;font-size:34px;font-weight:700">${t}</div>
        <div class="mono" style="margin-top:10px;font-size:20px;color:${DIM};letter-spacing:.1em">${sub.toUpperCase()}</div></div>`).join("");
})();
