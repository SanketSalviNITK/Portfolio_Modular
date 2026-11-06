/* ============================================================
   RESEARCH and CONSULTING pages: each reads its content from
   data/research.json or data/consulting.json and renders it into
   <main data-page="research|consulting">. Edit the JSON to update
   the page; no change here is needed for new papers or services.
   ============================================================ */
(function(){
  const main = document.querySelector("main[data-page]");
  if(!main) return;
  const page = main.dataset.page;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const ext = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`;

  fetch(`data/${page}.json`, { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then(async (d) => {
      if (page === "research") {                              // the full publication list, generated from the workbook
        d.publications = await fetch("data/publications.json", { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
        d.videos = await fetch("data/videos.json", { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
      }
      main.innerHTML = page === "research" ? research(d) : consulting(d);
      wire(d);
      if (page !== "research" && location.hash) { try { document.querySelector(location.hash)?.scrollIntoView(); } catch (e) { /* not an id */ } }
      window.PAGE_DATA = d;                                   // research3d.js builds the 3D map from the same data
      document.dispatchEvent(new CustomEvent("page:ready", { detail: d }));
    })
    .catch(() => {
      main.innerHTML = `<section class="hero"><p class="lead">This page could not load its content. Please try again,
        or <a href="index.html">view the résumé</a> instead.</p></section>`;
    });

  // ---------- RESEARCH: hero + map, numbers, then one tab at a time ----------
  const TABS = [["pubs", "Publications"], ["patents", "Patents"], ["join", "Join"]];
  const TYPE = { "Journal": "journal", "Conference": "conf", "Book chapter": "chapter" };
  // a highlighted paper's area -> the topic tags used by the full list, so one topic filter covers both
  const AREA_TOPICS = { "IoT Systems": ["IoT"], "Healthcare IoT": ["Healthcare", "IoT"] };

  function research(d){
    const status = { Granted: "ok", Published: "", Filed: "" };
    const P = d.publications && d.publications.items ? d.publications : { items: [], counts: {} };
    const n = { active: (d.activeProjects || []).length, pubs: P.items.length || d.featured.length, patents: d.patents.length };
    return `
      <section class="hero hero-map">
        <div class="hero-text">
          <span class="stamp">CASE FILE 01 · RESEARCH</span>
          <h1>RESEARCH</h1>
          <p class="lead">${esc(d.intro)}</p>
          <div class="btns" style="margin-top:22px"><a class="btn primary" href="#tab=join" data-go="join">JOIN MY RESEARCH</a><a class="btn" href="#active" data-go="active">ACTIVE PROJECTS</a><a class="btn" href="#tab=pubs" data-go="pubs">PUBLICATIONS</a></div>
          <button class="play" type="button" id="story-open"><i aria-hidden="true">▶</i>WATCH THE STORY <small>75 s</small></button>
        </div>
        <div class="map3d" id="map3d" role="img" aria-label="Map of research areas with their active projects and papers. The same items are in the tabs below.">
          <div class="map-legend"><i class="a"></i>Area <i class="p"></i>Active project <i class="r"></i>Paper<span>drag to turn · click to open</span></div>
        </div>
      </section>
      <div class="metrics">${d.metrics.map((m) => `<div class="metric"><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join("")}</div>

      ${n.active ? `
      <section class="active-sec" id="active" aria-labelledby="active-h">
        <h2 id="active-h">Active research <span>${n.active} ongoing · open to new members</span></h2>
        ${active(d)}
        <div class="chips areas-row" aria-label="All research areas">${d.areas.map((a) => `<span class="chip" style="cursor:default">${esc(a)}</span>`).join("")}</div>
      </section>` : ""}

      <div class="tabs" role="tablist" aria-label="Research sections" id="tabs">${TABS.map(([k, label]) => `
        <button role="tab" id="tab-${k}" aria-controls="panel-${k}" aria-selected="false" data-tab="${k}">${label}${n[k] ? `<small>${n[k]}</small>` : ""}</button>`).join("")}
      </div>

      <section class="panel" role="tabpanel" id="panel-pubs" aria-labelledby="tab-pubs" data-panel="pubs" hidden>
        ${pubTools(d, P)}
        <div class="ngrid" id="pubgrid">${pubCards(d, P)}</div>
        <p class="nomatch" id="nomatch" hidden>No publications match. Try another topic or word.</p>
        <div class="more"><button class="btn" id="pub-more" type="button" hidden></button></div>
        <p class="note"><a href="assets/resume.pdf" target="_blank" rel="noopener">Full publication list (résumé, PDF) ↗</a></p>
      </section>

      <section class="panel" role="tabpanel" id="panel-patents" aria-labelledby="tab-patents" data-panel="patents" hidden>
        <div class="rows">${d.patents.map((p) => `
          <div class="row"><span class="pill ${status[p.status] || ""}">${esc(p.status)}</span><span>${esc(p.title)}</span><span class="where">${esc(p.where)} · ${esc(p.year)}</span></div>`).join("")}
        </div>
      </section>

      <dialog class="story" id="story" aria-label="Research story video">
        <button class="story-x" type="button" aria-label="Close">✕</button>
        <video controls playsinline preload="none" poster="assets/research-story.jpg" src="assets/research-story.mp4"></video>
      </dialog>
      <dialog class="story" id="yt" aria-label="Paper explainer video">
        <button class="story-x" type="button" aria-label="Close">✕</button>
        <div class="yt-frame"></div>
      </dialog>

      <section class="panel" role="tabpanel" id="panel-join" aria-labelledby="tab-join" data-panel="join" hidden>
        ${joinForm(d)}
        <div class="links">${d.profiles.filter((p) => p.url).map((p) => ext(p.url, p.label + " ↗")).join("")}</div>
      </section>`;
  }

  function pubTools(d, P){
    const nVideos = P.items.filter((x) => videoOf(d, x.title)).length;
    const kinds = [["hl", "★ Highlights", d.featured.length], ["", "All", P.items.length], ["video", "▶ Videos", nVideos],
      ...Object.keys(P.counts || {}).map((t) => [t, { "Journal": "Journals", "Conference": "Conferences", "Book chapter": "Book chapters" }[t] || t, P.counts[t]])];
    const topics = [...new Set([...P.items.flatMap((x) => x.topics || []), ...d.featured.flatMap((f) => AREA_TOPICS[f.area] || [f.area])])].sort();
    return `
      <div class="ptools">
        <div class="seg" role="group" aria-label="Type">${kinds.filter((k) => k[2]).map(([k, label, c], i) => `
          <button type="button" class="segb" data-type="${esc(k)}" aria-pressed="${i === 0}">${esc(label)} <small>${c}</small></button>`).join("")}
        </div>
        <input id="pub-q" type="search" placeholder="Search title, venue, co-author, year" aria-label="Search publications">
      </div>
      <div class="chips topics" role="group" aria-label="Topic">
        <button type="button" class="chip" data-topic="" aria-pressed="true">All topics</button>
        ${topics.map((t) => `<button type="button" class="chip" data-topic="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join("")}
      </div>
      <p class="note" id="pub-count" aria-live="polite"></p>`;
  }

  // one neon card per publication; the highlighted papers carry their plain-language summary
  // a Research Bytes episode for a paper, if there is one: data/videos.json matches it by a piece of the title
  const videoOf = (d, title) => ((d.videos && d.videos.items) || []).find((v) => v.youtube && v.match && title.toLowerCase().includes(v.match.toLowerCase()));

  function pubCards(d, P){
    const card = (x, hl) => {
      const v = videoOf(d, x.title);
      const topics = hl ? (AREA_TOPICS[x.area] || [x.area]) : (x.topics || []);
      const kind = hl ? "hl" : TYPE[x.type] || "conf";
      const people = x.authors || (x.with ? `with ${x.with}` : "");
      const text = [x.title, x.venue, x.with, x.authors, x.year, topics.join(" ")].join(" ").toLowerCase();
      return `<article class="ncard t-${kind}" ${hl ? `id="paper-${slug(x.title)}"` : ""} data-type="${hl ? "hl" : esc(x.type)}" data-topics="${esc(topics.join("|"))}" data-text="${esc(text)}">
        <div class="nc-top"><span class="nc-kind">${hl ? "★ Highlight" : esc(x.type)}</span><span class="nc-year">${esc(x.year)}</span></div>
        ${x.award ? `<span class="pill gold nc-award">${esc(x.award)}</span>` : ""}
        <h3>${x.link ? `<a href="${esc(x.link)}" target="_blank" rel="noopener">${esc(x.title)}</a>` : esc(x.title)}</h3>
        <div class="nc-venue">${esc(x.venue)}${x.indexed ? ` · ${esc(x.indexed)}` : ""}</div>
        ${hl && x.summary ? `<p class="nc-sum">${esc(x.summary)}</p>` : ""}
        ${people ? `<div class="nc-by">${esc(people)}</div>` : ""}
        ${v ? `<button type="button" class="nc-watch" data-yt="${esc(v.youtube)}" data-title="${esc(x.title)}">▶ WATCH${v.length ? ` · ${esc(v.length)}` : ""}</button>` : ""}
        <div class="nc-foot"><span class="nc-tags">${topics.map((t) => `<span>${esc(t)}</span>`).join("")}</span>${x.link ? `<span class="nc-open">OPEN ↗</span>` : ""}</div>
      </article>`;
    };
    return d.featured.map((f) => card(f, true)).join("") + P.items.map((x) => card(x, false)).join("");
  }

  // ongoing projects, each with who is wanted; hidden until data/research.json lists some
  function active(d){
    const list = d.activeProjects || [];
    if (!list.length) return "";
    return `
      <div class="grid">${list.map((p) => `
        <article class="card" id="proj-${slug(p.title)}" data-area="${esc(p.domain)}">
          <div class="meta"><span>${esc(p.domain)}</span>${p.status ? `<span class="pill ok">${esc(p.status)}</span>` : ""}</div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.summary)}</p>
          ${p.seeking ? `<div class="proof">Looking for: ${esc(p.seeking)}</div>` : ""}
          <div class="go-row">${p.link ? `<a class="go" href="${esc(p.link)}" target="_blank" rel="noopener">VIEW PROJECT ↗</a>` : ""}
            <a class="go" href="#tab=join" data-project="${esc(p.title)}">I'M INTERESTED ›</a></div>
        </article>`).join("")}
      </div>`;
  }

  function joinForm(d){
    const domains = [...new Set([...(d.activeProjects || []).map((p) => p.domain), ...d.areas])].filter(Boolean);
    const projects = (d.activeProjects || []).map((p) => p.title);
    return `
      <section class="cta join" id="join">
        <div>
          <h2 style="margin-top:0">Join my research</h2>
          <p>${esc(d.collaborate)} Tell me a little about yourself and I'll get back to you.</p>
        </div>
        <form id="join-form" novalidate>
          <div class="fields">
            <label>Name *<input name="name" required maxlength="120" autocomplete="name"></label>
            <label>Affiliation *<input name="affiliation" required maxlength="200" placeholder="University, institute or company" autocomplete="organization"></label>
            <label>Email *<input name="email" type="email" required maxlength="200" autocomplete="email"></label>
            <label>Phone<input name="phone" type="tel" maxlength="40" autocomplete="tel" placeholder="Optional"></label>
            <label>Interested domain *<select name="domain" required><option value="">Choose…</option>
              ${domains.map((a) => `<option>${esc(a)}</option>`).join("")}<option>Other</option></select></label>
            ${projects.length ? `<label>Project<select name="project"><option value="">Any / not sure yet</option>
              ${projects.map((t) => `<option>${esc(t)}</option>`).join("")}</select></label>` : ""}
            <label class="wide">Message<textarea name="message" rows="4" maxlength="2000" placeholder="Your background, what you'd like to work on, or questions"></textarea></label>
            <label class="hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
            <label class="check wide"><input type="checkbox" name="consent" required> I agree that these details are stored and used only to contact me about research. Ask any time and they will be deleted.</label>
          </div>
          <div class="btns"><button class="btn primary" type="submit">SEND</button><span class="form-msg" role="status"></span></div>
        </form>
      </section>`;
  }

  function consulting(d){
    const mail = `mailto:${esc(d.email)}?subject=${encodeURIComponent("Consultation request")}`;
    return `
      <section class="hero">
        <span class="stamp">CASE FILE 02 · CONSULTING</span>
        <h1>CONSULTING</h1>
        <p class="lead">${esc(d.intro)}</p>
        <div class="btns" style="margin-top:22px">
          ${d.bookingUrl ? `<a class="btn primary" href="${esc(d.bookingUrl)}" target="_blank" rel="noopener">BOOK A CALL</a>` : ""}
          <a class="btn ${d.bookingUrl ? "" : "primary"}" href="${mail}">EMAIL ME</a>
        </div>
      </section>

      <h2>What I can do for you</h2>
      <div class="grid">${d.services.map((s) => `
        <article class="card"><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p><div class="proof">${esc(s.proof)}</div></article>`).join("")}
      </div>

      <h2>Selected work</h2>
      <div class="grid">${d.cases.map((c) => `
        <article class="card">
          <div class="meta"><span class="pill gold">${esc(c.tag)}</span></div>
          <h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p>
          ${c.link ? `<a class="go" href="${esc(c.link)}" target="_blank" rel="noopener">SEE IT LIVE ↗</a>` : ""}
        </article>`).join("")}
      </div>

      <h2>How we would work</h2>
      <div class="steps">${d.process.map((p) => `<div class="step"><b>${esc(p.step)}</b><p>${esc(p.desc)}</p></div>`).join("")}</div>

      <section class="cta">
        <p>Have a problem in IoT, AI or education technology? Tell me about it.</p>
        <div class="btns">
          ${d.bookingUrl ? `<a class="btn primary" href="${esc(d.bookingUrl)}" target="_blank" rel="noopener">BOOK A CALL</a>` : ""}
          <a class="btn ${d.bookingUrl ? "" : "primary"}" href="${mail}">START A CONVERSATION</a>
          <a class="btn" href="research.html">SEE THE RESEARCH</a>
        </div>
      </section>`;
  }

  // the research-area filter, and the Join form
  function wire(d){
    const form = main.querySelector("#join-form");
    if (form) wireForm(form, d);
    main.querySelectorAll("[data-project]").forEach((a) => a.addEventListener("click", () => {
      const sel = form && form.elements.project;
      if (sel) sel.value = a.dataset.project;
    }));
    if (page === "research") wireResearch(d);
    const story = main.querySelector("#story");                 // the research story video, in a dialog
    if (story && story.showModal) {
      const video = story.querySelector("video");
      main.querySelector("#story-open").addEventListener("click", () => { story.showModal(); video.play().catch(() => {}); });
      story.querySelector(".story-x").addEventListener("click", () => story.close());
      story.addEventListener("click", (e) => { if (e.target === story) story.close(); });   // a click outside the video
      story.addEventListener("close", () => video.pause());
    } else if (story) {
      main.querySelector("#story-open").remove();
    }
    const yt = main.querySelector("#yt");                       // a paper's explainer: the YouTube player loads only on click
    if (yt && yt.showModal) {
      const frame = yt.querySelector(".yt-frame");
      main.querySelectorAll(".nc-watch").forEach((b) => b.addEventListener("click", () => {
        frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(b.dataset.yt)}?autoplay=1&rel=0&modestbranding=1"
          title="${esc(b.dataset.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
        yt.showModal();
      }));
      yt.querySelector(".story-x").addEventListener("click", () => yt.close());
      yt.addEventListener("click", (e) => { if (e.target === yt) yt.close(); });
      yt.addEventListener("close", () => { frame.innerHTML = ""; });   // stops the video
    } else main.querySelectorAll(".nc-watch").forEach((b) => b.remove());
  }

  // tabs, the publication filters and "show more"; window.ResearchUI lets the 3D map drive them
  function wireResearch(d){
    const tabs = [...main.querySelectorAll("[role=tab]")], bar = main.querySelector("#tabs");
    const sec = main.querySelector("#active");
    const show = (key, scroll) => {
      if (key === "active") { if (sec && scroll) sec.scrollIntoView({ behavior: "smooth", block: "start" }); return; }   // always on the page
      if (!main.querySelector(`[data-panel="${key}"]`)) key = tabs[0].dataset.tab;
      tabs.forEach((t) => { const on = t.dataset.tab === key; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
      main.querySelectorAll("[data-panel]").forEach((p) => { p.hidden = p.dataset.panel !== key; });
      history.replaceState(null, "", "#tab=" + key);
      if (scroll && bar.getBoundingClientRect().top < 0 || scroll === "always") bar.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => show(t.dataset.tab, true));
      t.addEventListener("keydown", (e) => {                 // arrow keys move between tabs
        const j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
        if (j === null) return;
        const next = tabs[(j + tabs.length) % tabs.length]; next.focus(); show(next.dataset.tab);
      });
    });
    main.querySelectorAll("[data-go]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); show(a.dataset.go, "always"); }));
    main.querySelectorAll("[data-project]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); show("join", "always"); }));

    // publications: type, topic and words narrow the cards; 12 at a time
    const grid = main.querySelector("#pubgrid"), cards = grid ? [...grid.querySelectorAll(".ncard")] : [];
    const more = main.querySelector("#pub-more"), count = main.querySelector("#pub-count"), q = main.querySelector("#pub-q");
    const PAGE = 12;
    let limit = PAGE;
    const pick = (sel) => main.querySelector(sel + '[aria-pressed="true"]');
    const apply = (keep) => {
      if (!grid) return;
      if (!keep) limit = PAGE;
      const type = pick(".segb").dataset.type, topic = pick(".chip[data-topic]").dataset.topic;
      const words = q.value.toLowerCase().split(/\s+/).filter(Boolean);
      const hits = cards.filter((c) => (type === "" ? c.dataset.type !== "hl" : type === "video" ? c.dataset.type !== "hl" && c.querySelector(".nc-watch") : c.dataset.type === type)
        && (!topic || c.dataset.topics.split("|").includes(topic)) && words.every((w) => c.dataset.text.includes(w)));
      cards.forEach((c) => { c.hidden = true; c.classList.remove("in"); });
      hits.slice(0, limit).forEach((c, i) => { c.hidden = false; c.style.setProperty("--i", Math.min(i, 11)); void c.offsetWidth; c.classList.add("in"); });
      const left = hits.length - Math.min(limit, hits.length);
      more.hidden = left <= 0;
      more.textContent = `SHOW ${Math.min(PAGE, left)} MORE · ${left} LEFT`;
      main.querySelector("#nomatch").hidden = hits.length > 0;
      count.textContent = hits.length ? `Showing ${Math.min(limit, hits.length)} of ${hits.length}${type === "hl" ? " highlighted papers" : ""}.` : "";
    };
    const segs = main.querySelectorAll(".segb"), tchips = main.querySelectorAll(".chip[data-topic]");
    const press = (list, b) => list.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    segs.forEach((b) => b.addEventListener("click", () => { press(segs, b); apply(); }));
    tchips.forEach((b) => b.addEventListener("click", () => { press(tchips, b); apply(); }));
    if (q) q.addEventListener("input", () => apply());
    if (more) more.addEventListener("click", () => { limit += PAGE; apply(true); });
    apply();

    const flash = (el) => { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); };
    window.ResearchUI = {
      show: (key) => show(key, "always"),
      topics: [...tchips].map((b) => b.dataset.topic).filter(Boolean),
      // the map's area: filter the publications by it when it is a topic, else point at its projects
      area(name) {
        const chip = [...tchips].find((b) => b.dataset.topic === name || (AREA_TOPICS[name] || []).includes(b.dataset.topic));
        const projects = main.querySelectorAll(`#active .card[data-area="${CSS.escape(name)}"]`);
        if (chip) { press(segs, [...segs].find((b) => b.dataset.type === "")); press(tchips, chip); q.value = ""; apply(); show("pubs", "always"); }
        else if (projects.length) { show("active", "always"); projects.forEach(flash); }
        else show("active", "always");
      },
      item(id) {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.classList.contains("ncard")) {
          press(segs, [...segs].find((b) => b.dataset.type === "hl")); press(tchips, tchips[0]); q.value = ""; apply(); show("pubs");
        } else show("active");
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        flash(el);
      },
    };

    // the address picks the tab: #tab=pubs, or the old section links (#join, #active, #all-pubs ...)
    const h = decodeURIComponent(location.hash.slice(1));
    const legacy = { join: "join", active: "active", "papers-sec": "pubs", "all-pubs": "pubs", patents: "patents", areas: "active" };
    const key = h.startsWith("tab=") ? h.slice(4) : legacy[h];
    show("pubs");                                            // a tab is always open
    if (key) show(key, "always");
  }

  function wireForm(form, d){
    const msg = form.querySelector(".form-msg"), btn = form.querySelector("button[type=submit]");
    const say = (text, bad) => { msg.textContent = text; msg.className = "form-msg" + (bad ? " bad" : " ok"); };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = form.elements;
      const data = { name: f.name.value.trim(), affiliation: f.affiliation.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(),
        domain: f.domain.value, project: f.project ? f.project.value : "", message: f.message.value.trim(), consent: f.consent.checked,
        website: f.website.value, page: location.href };
      if (!data.name || !data.affiliation || !data.domain) return say("Please fill in your name, affiliation and domain.", true);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return say("Please enter a valid email address.", true);
      if (!data.consent) return say("Please tick the box to agree to be contacted.", true);
      const mail = "mailto:sanketsalvi.salvi@gmail.com?subject=" + encodeURIComponent(`Research interest: ${data.domain}`) + "&body=" +
        encodeURIComponent(`Name: ${data.name}\nAffiliation: ${data.affiliation}\nEmail: ${data.email}\nPhone: ${data.phone || "-"}\n` +
          `Domain: ${data.domain}\nProject: ${data.project || "-"}\n\n${data.message}`);
      if (!d.interestFormUrl) {                        // no Sheet connected yet: hand the details to the visitor's email app
        location.href = mail;
        return say("Your email app should open with your details filled in. Just press send.");
      }
      btn.disabled = true; say("Sending…");
      try {
        // text/plain keeps this a simple request, which Apps Script answers without a CORS preflight
        const r = await fetch(d.interestFormUrl, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) });
        const out = await r.json();
        if (!out.ok) throw new Error(out.error || "");
        form.reset();
        say("Thank you! Your details have reached me, and I'll be in touch soon.");
      } catch (err) {
        say((err && err.message) || "That didn't go through.", true);
        msg.insertAdjacentHTML("beforeend", ` <a href="${mail}">Send it by email instead.</a>`);
      } finally {
        btn.disabled = false;
      }
    });
  }
})();
