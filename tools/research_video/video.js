/* Research story video: 75 s at 1920 x 1080, captions and music only.
   make_video.py loads this page and calls renderAt(t) for every frame; each frame is a pure function of t.
   Content comes from the site's own data (data/research.json, data/publications.json). */
(async () => {
  const W = 1920, H = 1080, BEAT = 0.5;                          // 120 BPM: scene changes land on the beat
  const D = await fetch("../../data/research.json").then((r) => r.json());
  const P = await fetch("../../data/publications.json").then((r) => r.json()).catch(() => ({ items: [], counts: {} }));
  const $ = (id) => document.getElementById(id);
  const ov = $("ov"), bg = $("bg").getContext("2d");
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, k) => a + (b - a) * k;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const out3 = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const back = (x) => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const sine = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(x));
  const hash = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const fadeIO = (lt, d, a = 0.4, b = 0.4) => Math.min(sine(lt / a), sine((d - lt) / b));
  const rise = (lt, at, dy = 30, len = 0.6) => { const k = out3(seg(lt, at, at + len)); return `opacity:${k};transform:translateY(${((1 - k) * dy).toFixed(1)}px)`; };
  const pop = (lt, at, len = 0.45) => { const k = seg(lt, at, at + len); return `opacity:${clamp(k * 2)};transform:scale(${(0.6 + 0.4 * back(k)).toFixed(3)})`; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const type = (text, lt, at, cps = 22) => esc(text.slice(0, Math.max(0, Math.floor((lt - at) * cps)))) + (lt > at && (lt - at) * cps < text.length && Math.floor(lt * 3) % 2 ? "▍" : "");
  const metric = (label) => (D.metrics.find((m) => m.label.toLowerCase().includes(label)) || {}).value || "";

  // ---------------- the 3D constellation (domains scene) ----------------
  const T3 = window.THREE;
  const renderer = new T3.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H);
  $("gl").appendChild(renderer.domElement);
  const scene = new T3.Scene(), camera = new T3.PerspectiveCamera(45, W / H, 0.1, 100), world = new T3.Group();
  scene.add(world);
  const glowTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.25, "rgba(255,255,255,.5)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new T3.CanvasTexture(c);
  })();
  const sprite = (color, s) => { const m = new T3.Sprite(new T3.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, blending: T3.AdditiveBlending })); m.scale.set(s, s, 1); return m; };
  const DOMAINS = ["Li-Fi / VLC", "IoT Systems", "AI / ML", "Healthcare IoT", "AR / VR", "Embodied AI / Robotics", "Computer Vision / Health", "Digital Twins", "Indoor Positioning", "Blockchain", "IoT Education", "Quantum Computing", "Autonomous EVs", "P2P Energy Trading"];
  const STAR = DOMAINS.slice(0, 6);                                // named one by one in the scene
  const core = new T3.Mesh(new T3.IcosahedronGeometry(0.6, 1), new T3.MeshBasicMaterial({ color: 0xffb35c, wireframe: true, transparent: true, opacity: 0.8 }));
  world.add(core, sprite(0xffb35c, 2.6));
  const nodes = [], lp = [], R = 3.4;
  DOMAINS.forEach((name, k) => {
    const y = 1 - (k + 0.5) / DOMAINS.length * 2, rr = Math.sqrt(1 - y * y), th = k * 2.399963;
    const pos = new T3.Vector3(Math.cos(th) * rr * R, y * R * 0.85, Math.sin(th) * rr * R);
    const big = STAR.includes(name);
    const m = new T3.Mesh(new T3.SphereGeometry(big ? 0.17 : 0.11, 20, 14), new T3.MeshBasicMaterial({ color: 0x46e2ff }));
    const g = sprite(0x46e2ff, big ? 1.3 : 0.8);
    m.position.copy(pos); g.position.copy(pos); world.add(m, g);
    lp.push(0, 0, 0, pos.x, pos.y, pos.z);
    for (let j = 0; j < (big ? 4 : 2); j++) {                      // satellites: projects and papers
      const a = j * 1.7 + k, p = pos.clone().multiplyScalar(1.22).add(new T3.Vector3(Math.cos(a) * 0.6, Math.sin(a * 1.3) * 0.6, Math.sin(a) * 0.6));
      const col = j === 0 && big ? 0x5dffa8 : 0xbfeeff, s = new T3.Mesh(new T3.SphereGeometry(0.06, 10, 8), new T3.MeshBasicMaterial({ color: col }));
      s.position.copy(p); const sg = sprite(col, 0.45); sg.position.copy(p); world.add(s, sg);
      lp.push(pos.x, pos.y, pos.z, p.x, p.y, p.z);
    }
    nodes.push({ name, pos, m, g, base: big ? 1.3 : 0.8 });
  });
  const lines = new T3.BufferGeometry(); lines.setAttribute("position", new T3.Float32BufferAttribute(lp, 3));
  world.add(new T3.LineSegments(lines, new T3.LineBasicMaterial({ color: 0x46e2ff, transparent: true, opacity: 0.25 })));
  const dust = new T3.BufferGeometry(), dp = [];
  for (let i = 0; i < 700; i++) { const v = new T3.Vector3(hash(i) - 0.5, hash(i + 7) - 0.5, hash(i + 13) - 0.5).normalize().multiplyScalar(6 + hash(i + 3) * 14); dp.push(v.x, v.y, v.z); }
  dust.setAttribute("position", new T3.Float32BufferAttribute(dp, 3));
  scene.add(new T3.Points(dust, new T3.PointsMaterial({ color: 0x7fa7c9, size: 0.04, transparent: true, opacity: 0.7 })));
  const v3 = new T3.Vector3();
  function renderConstellation(lt, d, on){
    $("gl").style.opacity = on;
    if (!on) return [];
    const k = sine(lt / d);
    world.rotation.y = 0.3 + lt * 0.32;
    world.rotation.x = 0.22 + Math.sin(lt * 0.4) * 0.08;
    camera.position.set(0, 0, lerp(15, 8.4, out3(seg(lt, 0, 2.5))) - k * 0.8);
    camera.lookAt(0, 0, 0);
    const active = Math.floor(clamp((lt - 1.6) / 1.95, 0, STAR.length - 0.001));
    nodes.forEach((n) => { const hot = n.name === STAR[active] && lt > 1.6; n.g.scale.setScalar(n.base * (hot ? 2.4 + 0.3 * Math.sin(lt * 8) : 1)); n.m.material.color.setHex(hot ? 0xffffff : 0x46e2ff); });
    core.rotation.y = lt * 0.6; core.rotation.x = lt * 0.3;
    renderer.render(scene, camera);
    const n = nodes.find((x) => x.name === STAR[active]);
    v3.copy(n.pos).applyMatrix4(world.matrixWorld).project(camera);
    return [n, (v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H, active];
  }

  // ---------------- background: drifting particles, and a rain of paper titles ----------------
  const titles = P.items.map((x) => x.title);
  function drawBg(t, rain){
    bg.fillStyle = "#03060a"; bg.fillRect(0, 0, W, H);
    const g = bg.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, W * 0.7);
    g.addColorStop(0, "rgba(20,40,70,.55)"); g.addColorStop(1, "rgba(3,6,10,0)");
    bg.fillStyle = g; bg.fillRect(0, 0, W, H);
    for (let i = 0; i < 140; i++) {
      const x = (hash(i) * W + t * (6 + hash(i + 9) * 20)) % W, y = (hash(i + 4) * H - t * (4 + hash(i + 2) * 10) + H * 4) % H;
      bg.fillStyle = `rgba(150,200,255,${(0.15 + 0.4 * hash(i + 5)) * (0.6 + 0.4 * Math.sin(t * 2 + i))})`;
      bg.fillRect(x, y, 1.6, 1.6);
    }
    if (rain > 0 && titles.length) {                             // vertical columns of publication titles, slowly falling
      bg.save(); bg.font = "15px 'Courier New', monospace";
      for (let c = 0; c < 12; c++) {
        const x = 40 + c * 160, speed = 30 + hash(c) * 40;
        for (let r = 0; r < 9; r++) {
          const idx = (c * 9 + r) % titles.length, y = ((r * 150 + t * speed + hash(c + 3) * 900) % 1350) - 150;
          bg.fillStyle = `rgba(70,226,255,${(0.05 + 0.1 * hash(c * 9 + r)) * rain})`;
          bg.save(); bg.translate(x, y); bg.rotate(Math.PI / 2); bg.fillText(titles[idx].slice(0, 46), 0, 0); bg.restore();
        }
      }
      bg.restore();
    }
  }

  // ---------------- the montage: one card per piece of work ----------------
  const WORK = [
    { n: "Embodied AI Platform", sub: "A NAO humanoid robot as the voice and body of a locally hosted AI", tag: "Embodied AI · Robotics", status: "Ongoing", vis: nao },
    { n: "FIT-ARCADE", sub: "Fitness games played with your body, through a webcam, with heart rate from the camera", tag: "Computer Vision · Health", status: "Ongoing", vis: fit },
    { n: "Mobile IPS", sub: "Indoor positioning on a phone: ARCore maps, Wi-Fi fingerprints and a particle filter", tag: "Indoor Positioning", status: "Ongoing", vis: ips },
    { n: "Sign Language Translator", sub: "Continuous sign language to text, from hand tracking (Best Paper, IEEE AIC 2024)", tag: "AI / ML", status: "Ongoing", vis: sign },
    { n: "ARTHunt", sub: "Augmented-reality treasure hunts in the browser, and on HoloLens 2", tag: "AR / VR", status: "Ongoing", vis: ar },
    { n: "The Last Beacon", sub: "A story-driven IoT workshop: 7 missions on ESP8266 / ESP32 boards and a live 3D dashboard", tag: "IoT Education", status: "Ongoing", vis: beacon },
    { n: "Li-Fi for Secure Exam Wi-Fi", sub: "Light carries the key to the campus network during online exams", tag: "Li-Fi / VLC · Patent", status: "Granted · India & South Africa", vis: lifi },
  ];

  function nao(lt){                                              // robot head that talks, with its words typed out
    const talk = Math.abs(Math.sin(lt * 9)) * (Math.floor(lt * 2) % 3 ? 1 : 0.3);
    let bars = ""; for (let i = 0; i < 26; i++) { const h = 8 + 70 * Math.abs(Math.sin(lt * 7 + i * 0.7)) * (0.4 + 0.6 * hash(i + Math.floor(lt * 6))); bars += `<rect x="${440 + i * 12}" y="${300 - h / 2}" width="7" height="${h.toFixed(0)}" rx="3" fill="#5dffa8" opacity=".85"/>`; }
    return `<svg viewBox="0 0 860 560" width="860" height="560">
      <g transform="translate(70,70)">
        <rect x="0" y="40" width="300" height="300" rx="120" fill="#0d1622" stroke="#46e2ff" stroke-width="4"/>
        <rect x="40" y="130" width="220" height="90" rx="45" fill="#03060a" stroke="#46e2ff" stroke-opacity=".5" stroke-width="2"/>
        <circle cx="105" cy="175" r="${22 - (Math.floor(lt * 2.2) % 7 === 0 ? 18 : 0)}" fill="#46e2ff" style="filter:drop-shadow(0 0 14px #46e2ff)"/>
        <circle cx="195" cy="175" r="${22 - (Math.floor(lt * 2.2) % 7 === 0 ? 18 : 0)}" fill="#46e2ff" style="filter:drop-shadow(0 0 14px #46e2ff)"/>
        <rect x="115" y="${262 - talk * 6}" width="70" height="${8 + talk * 18}" rx="6" fill="#46e2ff" opacity=".8"/>
        <circle cx="-8" cy="190" r="22" fill="#0d1622" stroke="#ffb35c" stroke-width="4"/><circle cx="308" cy="190" r="22" fill="#0d1622" stroke="#ffb35c" stroke-width="4"/>
      </g>
      ${bars}
      <text x="440" y="120" fill="#9aa7b4" font-family="Courier New" font-size="22" letter-spacing="4">SPEECH → LOCAL LLM → GESTURE</text>
      <text x="440" y="440" fill="#e8eef2" font-family="Courier New" font-size="30">${type("“Hello! Ask me anything.”", lt, 0.4, 18)}</text>
    </svg>`;
  }
  function fit(lt){                                              // the game world, the hero, a pose skeleton and the heart rate
    const j = Math.abs(Math.sin(lt * 4)) * 40, sk = (x, y) => `${x},${(y - j * 0.6).toFixed(0)}`;
    return `<div style="position:absolute;inset:0;background:url(img/fit_city.jpg) center/cover;filter:saturate(1.2)"></div>
      <img src="img/fit_hero.png" style="position:absolute;left:300px;top:${(110 - j).toFixed(0)}px;width:330px">
      <svg viewBox="0 0 860 560" width="860" height="560" style="position:absolute;inset:0">
        <g stroke="#5dffa8" stroke-width="5" fill="none" opacity=".9" style="filter:drop-shadow(0 0 8px #5dffa8)">
          <polyline points="${sk(120, 150)} ${sk(120, 260)} ${sk(80, 360)}"/><polyline points="${sk(120, 260)} ${sk(160, 360)}"/>
          <polyline points="${sk(70, 200 - j)} ${sk(120, 180)} ${sk(170, 200 - j)}"/><circle cx="120" cy="${(125 - j * 0.6).toFixed(0)}" r="24"/>
        </g>
        <g font-family="Courier New" font-weight="700">
          <rect x="560" y="30" width="270" height="70" fill="rgba(3,6,10,.75)" stroke="#ff5c8a"/><text x="582" y="77" font-size="34" fill="#ff5c8a">♥ ${Math.round(118 + 14 * sine(lt / 2.5))} BPM</text>
          <rect x="30" y="470" width="300" height="60" fill="rgba(3,6,10,.75)" stroke="#5dffa8"/><text x="50" y="511" font-size="28" fill="#5dffa8">JUMP × ${Math.floor(lt * 2.4)}</text>
        </g>
      </svg>`;
  }
  function ips(lt){                                              // a floor plan; particles converge on the walking person
    const path = [[120, 440], [120, 200], [420, 200], [420, 120], [720, 120]], k = clamp(lt / 3), L = path.length - 1;
    const f = k * L, i = Math.min(L - 1, Math.floor(f)), u = f - i, px = lerp(path[i][0], path[i + 1][0], u), py = lerp(path[i][1], path[i + 1][1], u);
    let parts = "";
    for (let n = 0; n < 70; n++) { const spread = 160 * Math.exp(-lt * 1.3) + 14, a = hash(n) * 6.28, r = spread * Math.sqrt(hash(n + 9)); parts += `<circle cx="${(px + Math.cos(a + lt * 0.5) * r).toFixed(1)}" cy="${(py + Math.sin(a + lt * 0.5) * r).toFixed(1)}" r="3" fill="#46e2ff" opacity=".65"/>`; }
    let wifi = ""; for (let w = 0; w < 3; w++) { const rr = ((lt * 120 + w * 60) % 180); wifi += `<circle cx="740" cy="430" r="${rr.toFixed(0)}" fill="none" stroke="#ffb35c" stroke-opacity="${(1 - rr / 180).toFixed(2)}" stroke-width="2"/>`; }
    return `<svg viewBox="0 0 860 560" width="860" height="560">
      <g stroke="#46e2ff" stroke-opacity=".7" stroke-width="5" fill="none"><rect x="60" y="60" width="740" height="440"/>
        <path d="M60 300 H300 M360 300 H560 M560 60 V240 M560 300 V500 M300 60 V160"/></g>
      <g fill="#9aa7b4" font-family="Courier New" font-size="18" letter-spacing="2"><text x="80" y="95">LAB</text><text x="580" y="95">OFFICE</text><text x="80" y="335">CORRIDOR</text><text x="580" y="335">LIBRARY</text></g>
      ${wifi}<text x="700" y="480" font-family="Courier New" font-size="18" fill="#ffb35c">WI-FI</text>
      <polyline points="${path.slice(0, i + 1).map((p) => p.join(",")).join(" ")} ${px.toFixed(0)},${py.toFixed(0)}" stroke="#5dffa8" stroke-width="3" stroke-dasharray="8 8" fill="none"/>
      ${parts}<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="13" fill="#5dffa8" style="filter:drop-shadow(0 0 12px #5dffa8)"/>
    </svg>`;
  }
  function sign(lt){                                             // a tracked hand, finger by finger, spelling a word
    const word = "HELLO", n = Math.min(word.length, Math.floor(lt * 2) + 1), curl = (f) => 0.5 + 0.5 * Math.sin(lt * 5 + f * 1.3);
    const base = [430, 470], fingers = [[-150, -70], [-75, -230], [0, -260], [75, -235], [140, -180]];
    let g = "";
    fingers.forEach(([dx, dy], f) => {
      const c = curl(f) * (f === 0 ? 0.3 : 0.55), pts = [[base[0] + dx * 0.35, base[1] - 60]];
      for (let s = 1; s <= 3; s++) { const kk = s / 3; pts.push([base[0] + dx * (0.35 + 0.65 * kk) + c * 40 * kk * kk, base[1] - 60 + dy * kk * (1 - c * 0.6 * kk)]); }
      g += `<polyline points="${pts.map((p) => p.map((v) => v.toFixed(0)).join(",")).join(" ")}" stroke="#b48cff" stroke-width="5" fill="none"/>`;
      g += pts.map((p) => `<circle cx="${p[0].toFixed(0)}" cy="${p[1].toFixed(0)}" r="9" fill="#e8eef2" stroke="#b48cff" stroke-width="3"/>`).join("");
      g += `<line x1="${base[0]}" y1="${base[1]}" x2="${pts[0][0].toFixed(0)}" y2="${pts[0][1].toFixed(0)}" stroke="#b48cff" stroke-width="5"/>`;
    });
    return `<svg viewBox="0 0 860 560" width="860" height="560"><g style="filter:drop-shadow(0 0 10px #b48cff)">${g}<circle cx="${base[0]}" cy="${base[1]}" r="12" fill="#e8eef2"/></g>
      <text x="40" y="80" font-family="Courier New" font-size="22" fill="#9aa7b4" letter-spacing="4">21 LANDMARKS · CONTINUOUS</text>
      <text x="40" y="520" font-family="Courier New" font-weight="700" font-size="64" fill="#e8eef2" letter-spacing="18">${word.slice(0, n)}</text></svg>`;
  }
  function ar(lt){                                               // a phone finds the marker and a 3D object pops out
    const found = lt > 1.1, k = out3(seg(lt, 1.1, 1.7)), sc = Math.max(0, 1 - lt / 1.1);
    const cube = `<div style="position:absolute;left:330px;top:${210 - 40 * k}px;width:200px;height:200px;transform-style:preserve-3d;
        transform:perspective(800px) rotateX(-22deg) rotateY(${(lt * 90).toFixed(1)}deg) scale(${k.toFixed(3)})">${
      ["rotateY(0deg)", "rotateY(90deg)", "rotateY(180deg)", "rotateY(-90deg)", "rotateX(90deg)", "rotateX(-90deg)"].map((r) =>
        `<div style="position:absolute;inset:0;transform:${r} translateZ(100px);background:rgba(255,179,92,.18);border:3px solid #ffb35c;box-shadow:0 0 30px rgba(255,179,92,.5) inset"></div>`).join("")}</div>`;
    return `<div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,#0b1220 0 40px,#0d1626 40px 80px)"></div>
      <div style="position:absolute;left:250px;top:150px;width:360px;height:360px;border:2px dashed rgba(255,255,255,${found ? 0.15 : 0.6})"></div>
      ${["0 0", "100% 0", "0 100%", "100% 100%"].map((p, i) => `<div style="position:absolute;width:60px;height:60px;border:6px solid ${found ? "#5dffa8" : "#46e2ff"};
        left:${250 - 30 + 360 * (i % 2) - (i % 2 ? 30 : 0) + (i % 2 ? -1 : 1) * 40 * sc}px;top:${150 - 30 + 360 * (i > 1) - (i > 1 ? 30 : 0) + (i > 1 ? -1 : 1) * 40 * sc}px;
        border-${i % 2 ? "left" : "right"}:none;border-${i > 1 ? "top" : "bottom"}:none"></div>`).join("")}
      ${found ? cube : ""}
      <div class="mono" style="position:absolute;left:40px;top:30px;font-size:24px;letter-spacing:4px;color:${found ? "#5dffa8" : "#9aa7b4"}">${found ? "MARKER FOUND · CLUE 2 / 5" : "SCANNING…"}</div>
      <div class="mono" style="position:absolute;right:40px;bottom:30px;font-size:22px;letter-spacing:3px;color:#ffb35c">NO APP DOWNLOAD</div>`;
  }
  function beacon(lt){                                           // the workshop's own board and dashboard, missions completing
    const done = Math.min(7, Math.floor(lt * 2.2) + 1);
    return `<img src="img/beacon_dash.jpg" style="position:absolute;left:0;top:0;width:860px;height:560px;object-fit:cover;opacity:.55">
      <img src="img/beacon_board.jpg" style="position:absolute;left:${560 - 20 * sine(lt / 3)}px;top:180px;width:290px;border:2px solid #5dffa8;box-shadow:0 0 30px rgba(93,255,168,.4)">
      <div style="position:absolute;left:40px;top:60px;width:470px;background:rgba(3,6,10,.82);border:1.5px solid #5dffa8;padding:24px 26px">
        <div class="mono" style="color:#5dffa8;font-size:22px;letter-spacing:5px;font-weight:700">MISSION ${done} / 7</div>
        ${Array.from({ length: 7 }, (_, i) => `<div style="margin-top:14px;height:16px;border:1px solid rgba(93,255,168,.5)"><div style="height:100%;width:${i < done - 1 ? 100 : i === done - 1 ? (100 * ((lt * 2.2) % 1)).toFixed(0) : 0}%;background:#5dffa8;box-shadow:0 0 12px #5dffa8"></div></div>`).join("")}
      </div>`;
  }
  function lifi(lt){                                             // light from a lamp carries bits to a laptop
    const bits = "1011001110100101"; let pulses = "";
    for (let i = 0; i < 9; i++) { const k = ((lt * 0.9 + i / 9) % 1), x = lerp(330, 600, k), y = lerp(150, 380, k), b = bits[(i + Math.floor(lt * 3)) % bits.length];
      pulses += `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" font-family="Courier New" font-weight="700" font-size="34" fill="${b === "1" ? "#fff6c8" : "#46e2ff"}" opacity="${(1 - Math.abs(k - 0.5) * 1.6).toFixed(2)}">${b}</text>`; }
    const on = 0.55 + 0.45 * (Math.floor(lt * 18) % 2);
    return `<svg viewBox="0 0 860 560" width="860" height="560">
      <defs><linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8" stop-opacity="${(0.45 * on).toFixed(2)}"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient></defs>
      <rect x="230" y="40" width="200" height="36" rx="10" fill="#1a2433" stroke="#ffb35c" stroke-width="3"/>
      <circle cx="330" cy="92" r="20" fill="#fff6c8" opacity="${on.toFixed(2)}" style="filter:drop-shadow(0 0 22px #fff6c8)"/>
      <polygon points="300,100 360,100 760,520 120,520" fill="url(#cone)"/>
      ${pulses}
      <g transform="translate(520,380)"><rect x="0" y="0" width="230" height="140" rx="8" fill="#0d1622" stroke="#46e2ff" stroke-width="3"/>
        <rect x="-30" y="140" width="290" height="14" rx="5" fill="#46e2ff"/>
        <text x="115" y="80" text-anchor="middle" font-family="Courier New" font-weight="700" font-size="24" fill="${lt > 1.6 ? "#5dffa8" : "#9aa7b4"}">${lt > 1.6 ? "ACCESS ✓" : "AUTH…"}</text></g>
      <text x="40" y="250" font-family="Courier New" font-size="22" fill="#9aa7b4" letter-spacing="3">EXAM HALL</text>
    </svg>`;
  }

  // ---------------- scenes ----------------
  const S = [
    { a: 0, b: 6, f(lt, d) {                                     // cold open: a point of light
      const pulse = 0.6 + 0.4 * Math.sin(lt * 5), grow = out3(seg(lt, 5.1, 6)) * 60;
      return `<div class="abs" style="left:${W / 2 - 14}px;top:${H / 2 - 14}px;width:28px;height:28px;border-radius:50%;background:#fff;
          box-shadow:0 0 ${40 + 40 * pulse}px ${12 + 18 * pulse}px rgba(120,230,255,.75);transform:scaleX(${1 + grow}) scaleY(${1 - out3(seg(lt, 5.1, 6)) * 0.8})"></div>
        <div class="abs center" style="top:${H / 2 + 90}px;font-size:66px;font-weight:200;letter-spacing:.04em">${type("It started with light.", lt, 1.0, 16)}</div>
        <div class="abs center mono" style="top:${H / 2 + 190}px;font-size:22px;letter-spacing:.3em;color:#9aa7b4;${rise(lt, 3.2)}">VISIBLE LIGHT COMMUNICATION · PH.D., NIT KARNATAKA</div>`;
    } },
    { a: 6, b: 14, f(lt, d) {                                    // title: beams converge on the name
      const name = "SANKET SALVI", shown = Math.floor(clamp((lt - 0.6) / 1.4) * name.length);
      let beams = ""; for (let i = 0; i < 9; i++) { const y = H / 2 - 160 + i * 40 + Math.sin(lt * 2 + i) * 8, k = out3(seg(lt, i * 0.05, 1 + i * 0.05));
        beams += `<div class="abs" style="left:0;top:${y.toFixed(0)}px;height:2px;width:${W}px;background:linear-gradient(90deg,transparent ${100 - k * 100}%,rgba(70,226,255,${0.15 + 0.25 * hash(i)}) ${100 - k * 60}%,transparent);opacity:${1 - seg(lt, 2, 3.5) * 0.8}"></div>`; }
      return beams + `
        <div class="abs center" style="top:330px;font-size:150px;font-weight:200;letter-spacing:.24em;text-indent:.24em">${name.split("").map((c, i) => `<span style="opacity:${i < shown ? 1 : 0.06};text-shadow:${i < shown ? "0 0 26px rgba(70,226,255,.8)" : "none"}">${c === " " ? "&nbsp;" : c}</span>`).join("")}</div>
        <div class="abs center kick glow" style="top:540px;font-size:34px;letter-spacing:.9em;text-indent:.9em;${rise(lt, 2.2)}">RESEARCH</div>
        <div class="abs center" style="top:640px;${rise(lt, 3.6)}"><span class="mono" style="font-size:24px;letter-spacing:.32em;color:#9aa7b4">LI-FI · IOT · AI · HEALTHCARE · AR / VR · ROBOTICS</span></div>
        <div class="abs" style="left:1350px;top:210px;transform:rotate(-8deg)"><div class="stamp" style="font-size:26px;${pop(lt, 2.9, 0.35)}">CASE FILE 01</div></div>`;
    } },
    { a: 14, b: 26, f(lt, d) {                                   // the record: counters
      const C = [[metric("public"), "Publications"], [metric("patent"), "Patents"], [metric("google"), "Google Scholar h-index"], [metric("best"), "Best Paper awards"], ["12", "Years of research & teaching"]];
      const counts = P.counts || {}, parts = Object.keys(counts).map((k) => `${counts[k]} ${({ Journal: "journal papers", Conference: "conference papers", "Book chapter": "book chapters" })[k] || k}`).join("  ·  ");
      return `<div class="abs center kick glow" style="top:170px;${rise(lt, 0.2)}">The record</div>
        ${C.map(([v, l], i) => { const n = parseInt(v, 10) || 0, at = 0.6 + i * 0.7, k = out3(seg(lt, at, at + 1.6)), plus = String(v).includes("+") ? "+" : "";
          return `<div class="counter" style="left:${150 + i * 330}px;top:330px;${rise(lt, at, 50)};border-color:${i === 3 ? "rgba(255,179,92,.6)" : "rgba(70,226,255,.45)"}">
            <b style="${i === 3 ? "color:#ffb35c" : ""}">${Math.round(n * k)}${k > 0.98 ? plus : ""}</b><span>${esc(l)}</span></div>`; }).join("")}
        <div class="abs center mono" style="top:680px;font-size:28px;letter-spacing:.12em;color:#e8eef2;${rise(lt, 5.5)}">${esc(parts)}</div>
        <div class="abs center" style="top:760px;font-size:34px;font-weight:300;color:#9aa7b4;${rise(lt, 7.2)}">Assistant Professor at MIT-WPU · Post-doc, University of Central Florida</div>`;
    } },
    { a: 26, b: 40, gl: true, f(lt, d, hot) {                    // domains: the constellation, one area named at a time
      if (!hot || !hot[0]) return "";
      const [n, x, y, i] = hot, k = seg(lt - 1.6 - i * 1.95, 0, 0.4);
      return `<div class="abs kick glow" style="left:120px;top:120px;${rise(lt, 0.4)}">The domains</div>
        <div class="abs mono" style="left:120px;top:170px;font-size:22px;color:#9aa7b4;letter-spacing:.2em;${rise(lt, 0.7)}">${DOMAINS.length} AREAS · 6 ACTIVE PROJECTS · ${P.items.length} PUBLICATIONS</div>
        ${lt > 1.6 ? `<div class="abs" style="left:120px;bottom:150px;font-size:96px;font-weight:200;letter-spacing:.03em;opacity:${k};transform:translateX(${((1 - k) * -40).toFixed(0)}px);text-shadow:0 0 30px rgba(70,226,255,.6)">${esc(n.name)}</div>
          <div class="abs" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:90px;height:90px;margin:-45px;border:2px solid #fff;border-radius:50%;opacity:${(0.8 * k).toFixed(2)};transform:scale(${(1.4 - 0.4 * k).toFixed(2)})"></div>` : ""}`;
    } },
    { a: 40, b: 62, rain: 1, f(lt, d) {                          // the montage
      if (lt < 1) return `<div class="abs center kick glow" style="top:470px;font-size:60px;letter-spacing:.6em;text-indent:.6em;${pop(lt, 0, 0.4)}">The work</div>`;
      const each = 3, i = Math.min(WORK.length - 1, Math.floor((lt - 1) / each)), l = lt - 1 - i * each, w = WORK[i];
      const inK = out3(seg(l, 0, 0.35)), outK = seg(l, each - 0.2, each), glitch = l < 0.18 ? (hash(Math.floor(lt * 30)) - 0.5) * 30 : 0;
      const col = i === 6 ? "#ffb35c" : ["#46e2ff", "#5dffa8", "#46e2ff", "#b48cff", "#ffb35c", "#5dffa8"][i];
      return `<div class="abs mono" style="left:120px;top:110px;font-size:22px;letter-spacing:.3em;color:#9aa7b4">THE WORK · ${String(i + 1).padStart(2, "0")} / ${String(WORK.length).padStart(2, "0")}</div>
        <div class="abs" style="left:120px;top:150px;height:3px;width:${((lt - 1) / 21 * 1680).toFixed(0)}px;background:${col};box-shadow:0 0 12px ${col}"></div>
        <div class="frame" style="--fc:${col};border-color:${col};left:${(120 + glitch + (1 - inK) * -120).toFixed(0)}px;top:250px;width:860px;height:560px;opacity:${inK * (1 - outK)};box-shadow:0 0 50px -8px ${col}">${w.vis(l)}</div>
        <div class="abs" style="left:1060px;top:300px;width:740px;opacity:${inK * (1 - outK)};transform:translateX(${((1 - inK) * 80 + glitch * -0.5).toFixed(0)}px)">
          <div class="tag" style="color:${col}">${esc(w.tag)}</div>
          <div style="margin-top:30px;font-size:74px;font-weight:700;line-height:1.05;text-shadow:0 0 24px ${col}66">${esc(w.n)}</div>
          <div style="margin-top:28px;font-size:34px;font-weight:300;line-height:1.4;color:#c8d2dc">${esc(w.sub)}</div>
          <div class="mono" style="margin-top:34px;font-size:22px;letter-spacing:.25em;color:${col}">● ${esc(w.status.toUpperCase())}</div>
        </div>`;
    } },
    { a: 62, b: 70, rain: 0.5, f(lt, d) {                        // recognition: stamps
      const awards = [["BEST PAPER", "AIR 2025 · Nazarbayev University"], ["BEST PAPER", "IEEE AIC 2024"], ["BEST PAPER", "AITA 2024 · IFHE University"]];
      return `<div class="abs center kick glow" style="top:150px;${rise(lt, 0)}">Recognition</div>
        ${awards.map(([a, b], i) => `<div class="abs" style="left:${110 + i * 580}px;top:300px;width:540px;transform:rotate(${[-4, 3, -2][i]}deg)">
          <div class="stamp" style="text-align:center;font-size:40px;${pop(lt, 0.5 + i * 0.5, 0.3)}">${a}<div style="font-size:18px;letter-spacing:.08em;margin-top:10px;white-space:nowrap">${esc(b)}</div></div></div>`).join("")}
        <div class="abs center" style="top:620px;font-size:58px;font-weight:300;${rise(lt, 3.6)}">Patent granted <span style="color:#5dffa8">✓</span></div>
        <div class="abs center mono" style="top:710px;font-size:26px;letter-spacing:.2em;color:#9aa7b4;${rise(lt, 4.4)}">LI-FI FOR SECURED WI-FI ACCESS · INDIA 2024 · SOUTH AFRICA 2023</div>
        <div class="abs center mono" style="top:770px;font-size:24px;letter-spacing:.2em;color:#ffb35c;${rise(lt, 5.2)}">6 PATENTS FILED, PUBLISHED OR GRANTED</div>`;
    } },
    { a: 70, b: 75, f(lt, d) {                                   // close
      return `<div class="abs center" style="top:360px;font-size:120px;font-weight:200;letter-spacing:.06em;text-shadow:0 0 30px rgba(70,226,255,.5);${rise(lt, 0.1, 40, 0.8)}">Join the research.</div>
        <div class="abs center mono" style="top:540px;font-size:24px;letter-spacing:.24em;color:#9aa7b4;${rise(lt, 0.9)}">OPEN TO COLLABORATORS, PH.D. STUDENTS AND INDUSTRY PARTNERS</div>
        <div class="abs center kick glow" style="top:640px;font-size:40px;letter-spacing:.3em;text-indent:.3em;${rise(lt, 1.6)}">onlysanket.in</div>
        <div class="abs center mono" style="top:715px;font-size:22px;letter-spacing:.3em;color:#ffb35c;${rise(lt, 2.1)}">DR. SANKET SALVI</div>`;
    } },
  ];
  const TOTAL = 75;
  window.TOTAL = TOTAL;
  window.CUTS = S.slice(1).map((s) => s.a);

  window.renderAt = (t) => {
    const s = S.find((x) => t < x.b) || S[S.length - 1], lt = t - s.a, d = s.b - s.a;
    const rain = s.rain ? s.rain * fadeIO(lt, d, 1, 1) : 0;
    drawBg(t, rain);
    const hot = renderConstellation(lt, d, s.gl ? fadeIO(lt, d, 0.6, 0.6) : 0);
    ov.innerHTML = s.f(lt, d, hot);
    ov.style.opacity = fadeIO(lt, d, s.a === 0 ? 0.01 : 0.35, 0.35);
    $("flash").style.opacity = window.CUTS.includes(s.a) && lt < 0.25 ? (0.18 * (1 - lt / 0.25)).toFixed(3) : 0;
    $("fade").style.opacity = t < 0.5 ? 1 - t / 0.5 : t > TOTAL - 1.2 ? (t - (TOTAL - 1.2)) / 1.2 : 0;
  };
  // preload the images so no frame is captured half-loaded
  const imgs = ["img/fit_city.jpg", "img/fit_hero.png", "img/beacon_dash.jpg", "img/beacon_board.jpg"].map((src) => { const im = new Image(); im.src = src; return im; });
  await Promise.all(imgs.map((im) => im.decode().catch(() => { window.MISSING = (window.MISSING || []).concat(im.src); })));
  await document.fonts.ready;
  window.renderAt(0);
  window.READY = true;
})();
