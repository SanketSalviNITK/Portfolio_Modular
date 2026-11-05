/* ============================================================
   RESEARCH MAP — the 3D constellation in the Research hero.
   Research areas are the bright nodes; active projects (green) and
   papers (cyan) orbit the area they belong to. Drag to turn it,
   hover for a title, click to jump to that item on the page.
   Built from the same data/research.json as the page (js/paths.js
   fires "page:ready"). No WebGL, no three.js or reduced motion: the
   page simply keeps the legend and the lists below.
   ============================================================ */
(function(){
  const start = (d) => { try { build(d); } catch (e) { /* the lists below carry the same content */ } };
  if (window.PAGE_DATA) start(window.PAGE_DATA);
  else document.addEventListener("page:ready", (e) => start(e.detail), { once: true });

  function build(d){
    const box = document.getElementById("map3d");
    if (!box || !window.THREE) return;
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl") || probe.getContext("experimental-webgl"))) return;
    const T = window.THREE;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;   // no spin; the map is still clickable
    const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const COL = { area: 0x46e2ff, project: 0x5dffa8, paper: 0xbfeeff, core: 0xffb35c };

    // ---------- the graph: areas, and the projects and papers in each ----------
    const items = [
      ...(d.activeProjects || []).map((p) => ({ type: "project", title: p.title, area: p.domain, id: "proj-" + slug(p.title) })),
      ...(d.featured || []).map((p) => ({ type: "paper", title: p.title, area: p.area, id: "paper-" + slug(p.title), year: p.year })),
    ];
    const names = [...new Set([...items.map((i) => i.area), ...(d.areas || [])])].filter(Boolean);
    const areas = names.map((name) => ({ type: "area", title: name, items: items.filter((i) => i.area === name) }));

    // ---------- scene ----------
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    box.prepend(renderer.domElement);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 10.5);
    const world = new T.Group();
    scene.add(world);

    const glowTex = (() => {                                  // a soft round glow, drawn once
      const c = document.createElement("canvas"); c.width = c.height = 64;
      const g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.25, "rgba(255,255,255,.55)"); r.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = r; g.fillRect(0, 0, 64, 64);
      return new T.CanvasTexture(c);
    })();
    const glow = (color, size) => {
      const s = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
      s.scale.set(size, size, 1);
      return s;
    };

    // the core: the lab itself
    const core = new T.Mesh(new T.IcosahedronGeometry(0.55, 1), new T.MeshBasicMaterial({ color: COL.core, wireframe: true, transparent: true, opacity: 0.75 }));
    world.add(core, glow(COL.core, 2.2));

    // areas spread evenly over a sphere (Fibonacci), items in a small shell around their area
    const hits = [], labels = [];
    const linePos = [];
    const R = 3.3, n = areas.length;
    areas.forEach((a, k) => {
      const y = 1 - (k + 0.5) / n * 2, rr = Math.sqrt(1 - y * y), th = k * 2.399963;
      const pos = new T.Vector3(Math.cos(th) * rr * R, y * R * 0.82, Math.sin(th) * rr * R);
      const busy = a.items.length > 0;
      const node = new T.Mesh(new T.SphereGeometry(busy ? 0.17 : 0.1, 20, 14), new T.MeshBasicMaterial({ color: COL.area, transparent: true, opacity: busy ? 1 : 0.55 }));
      node.position.copy(pos);
      const halo = glow(COL.area, busy ? 1.3 : 0.7);
      halo.position.copy(pos);
      world.add(node, halo);
      linePos.push(0, 0, 0, pos.x, pos.y, pos.z);
      a.node = node; a.halo = halo; a.base = busy ? 1.3 : 0.7;
      hits.push({ obj: node, info: a, r: busy ? 0.42 : 0.3 });
      if (busy) labels.push({ el: label(a.title), pos, info: a });   // quiet areas show their name on hover

      // items: around the area, pushed outwards so they don't crowd the core
      const out = pos.clone().normalize();
      const side = new T.Vector3(0, 1, 0).cross(out).normalize();
      if (side.lengthSq() < 0.01) side.set(1, 0, 0);
      const up = out.clone().cross(side).normalize();
      a.items.forEach((it, j) => {
        const ang = (j / a.items.length) * Math.PI * 2 + k;
        const p = pos.clone().addScaledVector(out, 0.55).addScaledVector(side, Math.cos(ang) * 0.85).addScaledVector(up, Math.sin(ang) * 0.85);
        const color = it.type === "project" ? COL.project : COL.paper;
        const m = new T.Mesh(new T.SphereGeometry(it.type === "project" ? 0.1 : 0.075, 14, 10), new T.MeshBasicMaterial({ color }));
        m.position.copy(p);
        const h = glow(color, 0.55);
        h.position.copy(p);
        world.add(m, h);
        linePos.push(pos.x, pos.y, pos.z, p.x, p.y, p.z);
        it.node = m; it.halo = h; it.base = 0.55;
        hits.push({ obj: m, info: it, r: 0.3 });
      });
    });
    const lines = new T.BufferGeometry();
    lines.setAttribute("position", new T.Float32BufferAttribute(linePos, 3));
    world.add(new T.LineSegments(lines, new T.LineBasicMaterial({ color: COL.area, transparent: true, opacity: 0.22 })));

    // dust in the background
    const dust = new T.BufferGeometry(), dp = [];
    for (let i = 0; i < 380; i++) {
      const v = new T.Vector3().randomDirection ? new T.Vector3().randomDirection() : new T.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      v.multiplyScalar(5 + Math.random() * 9);
      dp.push(v.x, v.y, v.z);
    }
    dust.setAttribute("position", new T.Float32BufferAttribute(dp, 3));
    scene.add(new T.Points(dust, new T.PointsMaterial({ color: 0x7fa7c9, size: 0.035, transparent: true, opacity: 0.6 })));

    // ---------- labels and tooltip (HTML over the canvas) ----------
    function label(text){
      const el = document.createElement("div");
      el.className = "m-lbl";
      el.textContent = text;
      box.appendChild(el);
      return el;
    }
    const tip = document.createElement("div");
    tip.className = "m-tip"; tip.hidden = true;
    box.appendChild(tip);

    // ---------- interaction: drag to turn, hover, click ----------
    let rotY = 0.4, rotX = 0.18, velY = still ? 0 : 0.0016, velX = 0, dragging = false, moved = 0, last = null, hover = null;
    const ray = new T.Raycaster(), mouse = new T.Vector2();
    const el = renderer.domElement;
    el.style.touchAction = "pan-y";
    el.addEventListener("pointerdown", (e) => { dragging = true; moved = 0; last = [e.clientX, e.clientY]; el.setPointerCapture(e.pointerId); });
    el.addEventListener("pointermove", (e) => {
      if (dragging && last) {
        const dx = e.clientX - last[0], dy = e.clientY - last[1];
        moved += Math.abs(dx) + Math.abs(dy);
        velY = dx * 0.005; velX = dy * 0.004;
        rotY += velY; rotX = Math.max(-0.9, Math.min(0.9, rotX + velX));
        last = [e.clientX, e.clientY];
      }
      pick(e);
      if (still) draw();
    });
    el.addEventListener("pointerup", (e) => {
      dragging = false;
      if (moved < 6) { pick(e); if (hover) open(hover.info); }
      if (!still) { velY = Math.sign(velY || 1) * Math.max(Math.abs(velY), 0.0016); }
    });
    el.addEventListener("pointerleave", () => { if (!dragging) setHover(null); });

    function pick(e){
      const r = el.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(mouse, camera);
      let best = null, bestD = Infinity;
      const wp = new T.Vector3();
      for (const h of hits) {                               // nearest node whose (generous) hit radius the ray passes through
        h.obj.getWorldPosition(wp);
        const dist = ray.ray.distanceSqToPoint(wp);
        if (dist < h.r * h.r) { const z = wp.distanceTo(camera.position); if (z < bestD) { bestD = z; best = h; } }
      }
      setHover(best);
      if (best) {
        const i = best.info, kind = i.type === "area" ? `Area · ${i.items.length} item${i.items.length === 1 ? "" : "s"}` : i.type === "project" ? "Active project" : `Paper · ${i.year}`;
        tip.innerHTML = `<small>${kind}</small>${i.title.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))}`;
        tip.style.left = Math.min(e.clientX - r.left + 14, r.width - 230) + "px";
        tip.style.top = (e.clientY - r.top + 14) + "px";
      }
    }
    function setHover(h){
      if (hover === h) return;
      if (hover) hover.info.halo.scale.setScalar(hover.info.base);
      hover = h;
      tip.hidden = !h;
      el.style.cursor = h ? "pointer" : "grab";
      if (h) h.info.halo.scale.setScalar(h.info.base * 1.8);
    }

    // a click: an area filters the publications (or points at its projects); an item opens its tab and card
    function open(i){
      const ui = window.ResearchUI;
      if (!ui) return;
      if (i.type === "area") ui.area(i.title);
      else ui.item(i.id);
    }

    // ---------- size, visibility, loop ----------
    function resize(){
      const w = box.clientWidth, h = box.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w < 520 ? 10.4 : 8.6;
      camera.updateProjectionMatrix();
      draw();
    }
    new ResizeObserver(resize).observe(box);
    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); }).observe(box);

    const v = new T.Vector3();
    function draw(){
      world.rotation.y = rotY; world.rotation.x = rotX;
      core.rotation.y = -rotY * 1.6; core.rotation.x = rotX * 1.4;
      renderer.render(scene, camera);
      const w = box.clientWidth, h = box.clientHeight;
      // area names next to their nodes: nearest first, and a name that would cover a nearer one is left out
      for (const l of labels) {
        v.copy(l.pos).applyMatrix4(world.matrixWorld);
        l.depth = (v.z + R) / (2 * R);
        v.project(camera);
        l.lw = l.lw || l.el.offsetWidth || 80;
        l.x = Math.max(4, Math.min((v.x + 1) / 2 * w + 10, w - l.lw - 4));
        l.y = (1 - v.y) / 2 * h - 22;
      }
      const placed = [];
      for (const l of [...labels].sort((a, b) => b.depth - a.depth)) {
        const clash = placed.some((o) => l.x < o.x + o.lw + 6 && o.x < l.x + l.lw + 6 && Math.abs(l.y - o.y) < 15);
        l.el.style.visibility = clash ? "hidden" : "visible";
        if (!clash) placed.push(l);
        l.el.style.transform = `translate(${l.x.toFixed(1)}px,${l.y.toFixed(1)}px)`;
        l.el.style.opacity = (0.3 + 0.7 * l.depth).toFixed(2);
      }
    }
    let raf = 0;
    function loop(){
      cancelAnimationFrame(raf);
      if (still) { draw(); return; }
      const tick = () => {
        if (!visible || document.hidden) return;
        if (!dragging) {
          rotY += velY;
          velY += (Math.sign(velY || 1) * 0.0016 - velY) * 0.02;   // ease back to the idle spin after a flick
          rotX += (0.18 - rotX) * 0.01;
        }
        draw();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    document.addEventListener("visibilitychange", () => { if (!document.hidden && visible) loop(); });
    box.classList.add("live");
    resize();
    loop();
  }
})();
