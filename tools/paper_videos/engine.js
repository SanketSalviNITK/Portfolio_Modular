/* Research Bytes engine: the series look shared by every paper video.
   make_paper_video.py injects window.TIMELINE = {fps, total, amp, meta, scenes: [{view, start, end, captions, vo}]}
   and loads papers/<id>.js, which adds that paper's views to window.VIEWS. renderAt(t) draws one frame; every frame is a
   pure function of t. The shared views here: intro (the same for every episode), title, outro, and the helpers (PV). */
(() => {
  const W = 1920, H = 1080;
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, k) => a + (b - a) * k;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const out3 = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const inOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const back = (x) => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const sine = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(x));
  const hash = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const rise = (lt, at, dy = 30, len = 0.55) => { const k = out3(seg(lt, at, at + len)); return `opacity:${k.toFixed(3)};transform:translateY(${((1 - k) * dy).toFixed(1)}px)`; };
  const pop = (lt, at, len = 0.45) => { const k = seg(lt, at, at + len); return `opacity:${clamp(k * 2).toFixed(3)};transform:scale(${(0.6 + 0.4 * back(k)).toFixed(3)})`; };
  // when sentence k of a scene starts / ends, in scene time (so visuals can follow the narration)
  const cs = (s, k) => (s.captions[k] ? s.captions[k].start - s.start : 0);
  const ce = (s, k) => (s.captions[k] ? s.captions[k].end - s.start : 0);
  // a number counting up from 0 to v between a and b
  const count = (lt, a, b, v, dec = 0) => (v * out3(seg(lt, a, b))).toFixed(dec);
  window.PV = { W, H, clamp, lerp, seg, out3, inOut, back, sine, hash, esc, rise, pop, cs, ce, count };

  const T = window.TIMELINE, M = T.meta;
  const $ = (id) => document.getElementById(id);
  const A = $("A"), B = $("B"), bg = $("bg").getContext("2d"), av = $("av"), tag = $("tag"), cap = $("cap");
  av.innerHTML = Neerja.svg("nj");

  // ---------------- shared views ----------------
  const V = window.VIEWS = window.VIEWS || {};

  // the series intro (identical in every episode): a point of light bursts into beams that draw the logo; Neerja waves
  V.intro = (s, lt) => {
    const burst = out3(seg(lt, 1.7, 2.4)), pulse = 0.6 + 0.4 * Math.sin(lt * 6);
    let beams = "";
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.2, len = burst * (900 + 300 * hash(i)) * (1 - seg(lt, 2.6, 3.4) * 0.9);
      beams += `<div class="abs" style="left:${W / 2}px;top:${H / 2 - 40}px;width:${len.toFixed(0)}px;height:2px;transform-origin:0 50%;transform:rotate(${(a * 57.3).toFixed(1)}deg);
        background:linear-gradient(90deg,rgba(255,255,255,.9),rgba(70,226,255,${(0.5 * (1 - seg(lt, 2.6, 3.4))).toFixed(2)}),transparent)"></div>`;
    }
    const word = "RESEARCH", shown = Math.floor(seg(lt, 2.3, 3.3) * word.length);
    const logoK = out3(seg(lt, 2.3, 3.0));
    return `${lt < 2.6 ? `<div class="abs" style="left:${W / 2 - 12}px;top:${H / 2 - 52}px;width:24px;height:24px;border-radius:50%;background:#fff;
        box-shadow:0 0 ${(40 + 50 * pulse).toFixed(0)}px ${(12 + 20 * pulse).toFixed(0)}px rgba(120,230,255,.8);transform:scale(${(1 + burst * 3).toFixed(2)});opacity:${(1 - seg(lt, 2.2, 2.6)).toFixed(2)}"></div>` : ""}
      ${beams}
      <div class="abs center" style="top:${H / 2 - 150}px;font-size:150px;font-weight:200;letter-spacing:.18em;text-indent:.18em;opacity:${logoK}">
        ${word.split("").map((c, i) => `<span style="opacity:${i < shown ? 1 : 0.08};text-shadow:${i < shown ? "0 0 30px rgba(70,226,255,.8)" : "none"}">${c}</span>`).join("")}</div>
      <div class="abs center kick glow" style="top:${H / 2 + 30}px;font-size:58px;letter-spacing:.7em;text-indent:.7em;${pop(lt, 3.1, 0.4)}">BYTES</div>
      <div class="abs center mono" style="top:${H / 2 + 140}px;font-size:24px;letter-spacing:.35em;color:#9aa7b4;${rise(lt, 3.6)}">ONE PAPER · TWO MINUTES · WITH DR. SANKET SALVI</div>`;
  };

  V.title = (s, lt) => `
      <div class="abs kick glow" style="left:150px;top:230px;${rise(lt, 0.1)}">Episode ${String(T.episode).padStart(2, "0")} · ${esc(M.domain)}</div>
      <div class="abs h1" style="left:150px;top:290px;width:1300px;font-size:76px;${rise(lt, 0.3, 40)}">${esc(M.title)}</div>
      <div class="abs" style="left:150px;top:620px;display:flex;gap:16px;${rise(lt, 1.0)}">${M.badges.map((b, i) =>
        `<span class="chip" style="color:${b.startsWith("★") ? "#ffb35c" : "#46e2ff"};${pop(lt, 1.0 + i * 0.25, 0.35)}">${esc(b)}</span>`).join("")}</div>
      <div class="abs mono" style="left:150px;top:720px;font-size:22px;letter-spacing:.06em;color:#9aa7b4;${rise(lt, 1.6)}">${esc(M.authors.join(" · "))}</div>`;

  // credits: the paper, its authors (Dr. Salvi highlighted), venue, publisher, DOI and badges
  V.credits = (s, lt) => `<div class="abs kick glow" style="left:150px;top:180px;${rise(lt, 0)}">The paper</div>
      <div class="abs h1" style="left:150px;top:230px;width:1300px;font-size:56px;${rise(lt, 0.2)}">${esc(M.title)}</div>
      <div class="abs" style="left:150px;top:${M.title.length > 70 ? 450 : 400}px;width:1300px">${M.authors.map((a, i) => `<span style="display:inline-block;margin:0 26px 18px 0;font-size:36px;font-weight:${a === "Sanket Salvi" ? 700 : 400};color:${a === "Sanket Salvi" ? "#46e2ff" : "#fff"};${pop(lt, 0.5 + i * 0.35, 0.35)}">${esc(a)}</span>`).join("")}</div>
      <div class="abs mono" style="left:150px;top:${M.title.length > 70 ? 610 : 560}px;font-size:24px;color:#9aa7b4;letter-spacing:.06em;${rise(lt, 2.2)}">${esc(M.venue)}<br>${esc(M.publisher)}${M.doi ? ` · doi:${esc(M.doi)}` : ""}</div>
      <div class="abs" style="left:150px;top:${M.title.length > 70 ? 710 : 660}px;display:flex;gap:14px">${M.badges.map((b, i) => `<span class="chip" style="color:${b.startsWith("★") ? "#ffb35c" : "#46e2ff"};${pop(lt, 2.8 + i * 0.25, 0.4)}">${esc(b)}</span>`).join("")}</div>`;

  V.outro = (s, lt) => `
      <div class="abs center" style="top:250px;font-size:120px;font-weight:200;letter-spacing:.16em;text-indent:.16em;text-shadow:0 0 30px rgba(70,226,255,.6);${rise(lt, 0)}">RESEARCH</div>
      <div class="abs center kick glow" style="top:400px;font-size:52px;letter-spacing:.7em;text-indent:.7em;${rise(lt, 0.2)}">BYTES</div>
      <div class="abs center" style="top:510px;${rise(lt, cs(s, 0))}"><span class="chip" style="color:#5dffa8">▶ READ THE FULL PAPER · LINK IN THE DESCRIPTION</span></div>
      <div class="abs center mono" style="top:600px;font-size:26px;letter-spacing:.3em;color:#ffb35c;${rise(lt, cs(s, 1))}">NEXT BYTE SOON</div>
      <div class="abs center mono" style="top:660px;font-size:22px;letter-spacing:.3em;color:#9aa7b4;${rise(lt, cs(s, 1) + 0.5)}">ONLYSANKET.IN · DR. SANKET SALVI</div>`;

  // the YouTube thumbnail (rendered once, not part of the video): the short title, the episode and its badges, Neerja large
  V.thumb = () => `
      <div class="abs kick" style="left:110px;top:120px;font-size:30px;color:#46e2ff">RESEARCH BYTES · #${String(T.episode).padStart(2, "0")}</div>
      <div class="abs" style="left:110px;top:200px;width:1150px;font-size:118px;font-weight:800;line-height:1.02;text-shadow:0 0 34px rgba(70,226,255,.55)">${esc(M.short)}</div>
      <div class="abs" style="left:110px;top:${M.short.length > 22 ? 560 : 460}px;display:flex;gap:18px">${M.badges.map((b) =>
        `<span class="chip" style="font-size:30px;padding:10px 18px;color:${b.startsWith("★") ? "#ffb35c" : "#5dffa8"}">${esc(b)}</span>`).join("")}</div>
      <div class="abs mono" style="left:110px;bottom:110px;font-size:28px;letter-spacing:.2em;color:#9aa7b4">${esc(M.title.split(":")[0])} · ${M.year}</div>`;

  // ---------------- background: a slow neon grid and drifting particles ----------------
  function drawBg(t){
    bg.fillStyle = "#04070c"; bg.fillRect(0, 0, W, H);
    const g = bg.createRadialGradient(W * 0.4, H * 0.35, 0, W * 0.4, H * 0.35, W * 0.75);
    g.addColorStop(0, "rgba(18,40,70,.6)"); g.addColorStop(1, "rgba(4,7,12,0)");
    bg.fillStyle = g; bg.fillRect(0, 0, W, H);
    bg.strokeStyle = "rgba(70,226,255,.05)"; bg.lineWidth = 1;
    const off = (t * 14) % 80;
    for (let x = -80 + off; x < W; x += 80) { bg.beginPath(); bg.moveTo(x, 0); bg.lineTo(x, H); bg.stroke(); }
    for (let y = -80 + off; y < H; y += 80) { bg.beginPath(); bg.moveTo(0, y); bg.lineTo(W, y); bg.stroke(); }
    for (let i = 0; i < 90; i++) {
      const x = (hash(i) * W + t * (5 + hash(i + 9) * 16)) % W, y = (hash(i + 4) * H - t * (3 + hash(i + 2) * 8) + H * 9) % H;
      bg.fillStyle = `rgba(150,210,255,${((0.12 + 0.35 * hash(i + 5)) * (0.6 + 0.4 * Math.sin(t * 2 + i))).toFixed(3)})`;
      bg.fillRect(x, y, 1.6, 1.6);
    }
  }

  // Neerja: centre stage in the intro and outro, bottom right otherwise
  const SPOT = { big: { x: W - 390, y: H - 430, s: 1.15 }, corner: { x: W - 330, y: H - 330, s: 1.05 }, hidden: { x: W - 330, y: H + 80, s: 1.05 } };
  const spotOf = (s, lt) => (s.view === "intro" ? (lt < 3.8 ? SPOT.hidden : SPOT.big) : s.view === "outro" ? SPOT.big : SPOT.corner);
  const TR = 0.45;

  window.renderThumb = () => {
    drawBg(3);
    B.innerHTML = V.thumb(); A.innerHTML = ""; cap.innerHTML = "";
    ["bug", "bar", "fade", "tag"].forEach((id) => { $(id).style.opacity = 0; });
    av.style.left = "1250px"; av.style.top = "250px"; av.style.transform = "scale(2.3)";
    Neerja.pose(av, { mouth: "m", blink: false, tilt: -3, bob: 0, brow: 1 });
  };

  window.renderAt = (t) => {
    drawBg(t);
    let i = T.scenes.findIndex((x) => t < x.end); if (i < 0) i = T.scenes.length - 1;
    const s = T.scenes[i], lt = t - s.start, prev = T.scenes[i - 1];
    B.innerHTML = (V[s.view] || (() => ""))(s, lt, s.end - s.start);
    A.style.cssText = B.style.cssText = "";
    if (prev && lt < TR) {                                      // cross-fade with a little push between scenes
      const k = inOut(lt / TR);
      A.innerHTML = (V[prev.view] || (() => ""))(prev, prev.end - prev.start + lt, prev.end - prev.start);
      A.style.opacity = 1 - k; A.style.transform = `translateX(${(-60 * k).toFixed(1)}px)`;
      B.style.opacity = k; B.style.transform = `translateX(${(60 * (1 - k)).toFixed(1)}px)`;
    } else A.innerHTML = "";
    // the series bug and the progress bar are hidden in the intro
    $("bug").style.opacity = s.view === "intro" || s.view === "outro" ? 0 : 1;
    $("bar").style.width = (s.view === "intro" ? 0 : (t / T.total) * 100) + "%";
    // captions: the sentence being spoken
    const c = s.captions.find((x) => t >= x.start - 0.05 && t < x.end + 0.2);
    cap.innerHTML = c ? `<span>${esc(c.text)}</span>` : "";
    cap.style.right = "420px";
    // Neerja moves between spots, waves in the intro, and lip-syncs to her own voice
    const to = spotOf(s, lt), from = prev ? spotOf(prev, prev.end - prev.start) : to, k = inOut(lt / 0.8);
    const p = { x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k), s: lerp(from.s, to.s, k) };
    if (s.view === "intro") { const kk = out3(seg(lt, 3.8, 4.5)); p.y = lerp(H + 80, SPOT.big.y, kk); }
    const wave = s.view === "intro" ? Math.sin(seg(lt, 4.3, 6.4) * Math.PI * 4) * 6 * (lt > 4.3 && lt < 6.4 ? 1 : 0) : 0;
    av.style.left = p.x + "px"; av.style.top = p.y + "px"; av.style.transform = `scale(${p.s})`;
    tag.style.left = p.x + 120 * p.s - 52 + "px"; tag.style.top = p.y + 236 * p.s + "px";
    const f = Math.round(t * T.fps), a = T.amp[f] || 0;
    const mouth = a < 0.12 ? "rest" : a < 0.34 ? "s" : a < 0.62 ? (hash(f >> 2) < 0.22 ? "o" : "m") : "w";
    const blink = f % 110 < 3 && hash(Math.floor(f / 110)) > 0.2;
    const speaking = a > 0.05 || (T.amp[f - 6] || 0) > 0.05;
    Neerja.pose(av, { mouth, blink, tilt: wave + Math.sin(t * 1.7) * (speaking ? 1.6 : 0.6), bob: Math.sin(t * 3.1) * (speaking ? 1.2 : 0.4), brow: a > 0.8 ? 1 : 0 });
    $("fade").style.opacity = t < 0.3 ? 1 - t / 0.3 : t > T.total - 1 ? (t - (T.total - 1)) : 0;
  };

  (async () => {
    await new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r)));
    await Promise.all([...document.images].map((im) => im.decode().catch(() => {})));
    await document.fonts.ready;
    window.renderAt(0);
    window.READY = true;
  })();
})();
