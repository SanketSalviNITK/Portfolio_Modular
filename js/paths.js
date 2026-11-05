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
      }
      main.innerHTML = page === "research" ? research(d) : consulting(d);
      wire(d);
      if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
      window.PAGE_DATA = d;                                   // research3d.js builds the 3D map from the same data
      document.dispatchEvent(new CustomEvent("page:ready", { detail: d }));
    })
    .catch(() => {
      main.innerHTML = `<section class="hero"><p class="lead">This page could not load its content. Please try again,
        or <a href="index.html">view the résumé</a> instead.</p></section>`;
    });

  function research(d){
    const status = { Granted: "ok", Published: "", Filed: "" };
    return `
      <section class="hero hero-map">
        <div class="hero-text">
          <span class="stamp">CASE FILE 01 · RESEARCH</span>
          <h1>RESEARCH</h1>
          <p class="lead">${esc(d.intro)}</p>
          <div class="btns" style="margin-top:22px"><a class="btn primary" href="#join">JOIN MY RESEARCH</a><a class="btn" href="#active">ACTIVE PROJECTS</a></div>
        </div>
        <div class="map3d" id="map3d" role="img" aria-label="Map of research areas with their active projects and papers. The same items are listed below.">
          <div class="map-legend"><i class="a"></i>Area <i class="p"></i>Active project <i class="r"></i>Paper<span>drag to turn · click to open</span></div>
        </div>
      </section>
      <nav class="secnav" aria-label="Sections of this page">
        ${(d.activeProjects || []).length ? `<a href="#active">Active research</a>` : ""}<a href="#papers-sec">Papers</a>${d.publications ? `<a href="#all-pubs">All publications</a>` : ""}<a href="#patents">Patents</a><a href="#areas">Areas</a><a href="#join">Join</a>
      </nav>
      <div class="metrics">${d.metrics.map((m) => `<div class="metric"><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join("")}</div>

      ${active(d)}
      <h2 id="papers-sec">Selected papers <span>${d.featured.length} highlighted${d.publications ? " · the full list is below" : " · full list of 47+ in the résumé"}</span></h2>
      <div class="chips" role="group" aria-label="Filter by research area">
        <button class="chip" aria-pressed="true" data-area="">All</button>
        ${[...new Set(d.featured.map((p) => p.area))].map((a) => `<button class="chip" aria-pressed="false" data-area="${esc(a)}">${esc(a)}</button>`).join("")}
      </div>
      <div class="grid" id="papers">${d.featured.map((p) => `
        <article class="card" id="paper-${slug(p.title)}" data-area="${esc(p.area)}">
          <div class="meta"><span>${esc(p.year)}</span><span>·</span><span>${esc(p.area)}</span>${p.award ? `<span class="pill gold">${esc(p.award)}</span>` : ""}</div>
          <h3>${esc(p.title)}</h3>
          <div class="by">${esc(p.authors)} — <i>${esc(p.venue)}</i></div>
          <p>${esc(p.summary)}</p>
          ${p.link ? `<a class="go" href="${esc(p.link)}" target="_blank" rel="noopener">READ THE PAPER ↗</a>` : ""}
        </article>`).join("")}
      </div>

      ${allPubs(d.publications)}
      <h2 id="patents">Patents <span>${d.patents.length}</span></h2>
      <div class="rows">${d.patents.map((p) => `
        <div class="row"><span class="pill ${status[p.status] || ""}">${esc(p.status)}</span><span>${esc(p.title)}</span><span class="where">${esc(p.where)} · ${esc(p.year)}</span></div>`).join("")}
      </div>

      <h2 id="areas">Research areas</h2>
      <div class="chips">${d.areas.map((a) => `<span class="chip" style="cursor:default">${esc(a)}</span>`).join("")}</div>

      ${joinForm(d)}
      <p class="note" style="margin-top:18px"><a href="assets/resume.pdf" target="_blank" rel="noopener">Full publication list (résumé, PDF) ↗</a></p>
      <div class="links">${d.profiles.filter((p) => p.url).map((p) => ext(p.url, p.label + " ↗")).join("")}</div>`;
  }

  // every publication ticked "On Website" in the workbook: tabs by type, a topic filter and a search box
  function allPubs(P){
    if (!P || !P.items || !P.items.length) return "";
    const items = P.items, types = Object.keys(P.counts || {});
    const topics = [...new Set(items.flatMap((x) => x.topics || []))].sort();
    const short = { "Journal": "J", "Conference": "C", "Book chapter": "B" };
    const plural = { "Journal": "journal papers", "Conference": "conference papers", "Book chapter": "book chapters" };
    const years = [...new Set(items.map((x) => x.year || "—"))];
    return `
      <h2 id="all-pubs">All publications <span>${items.length} · ${types.map((t) => `${P.counts[t]} ${plural[t] || t}`).join(" · ")}</span></h2>
      <div class="pub-tools">
        <div class="chips" role="group" aria-label="Type of publication">
          <button class="chip" aria-pressed="true" data-type="">All ${items.length}</button>
          ${types.map((t) => `<button class="chip" aria-pressed="false" data-type="${esc(t)}">${esc(plural[t] ? plural[t][0].toUpperCase() + plural[t].slice(1) : t)} ${P.counts[t]}</button>`).join("")}
        </div>
        <div class="pub-find">
          <select id="pub-topic" aria-label="Topic"><option value="">All topics</option>
            ${topics.map((t) => `<option>${esc(t)}</option>`).join("")}</select>
          <input id="pub-q" type="search" placeholder="Search title, venue or co-author" aria-label="Search publications">
        </div>
      </div>
      <p class="note" id="pub-count" aria-live="polite"></p>
      <div class="pubs" id="pubs">${years.map((y) => `
        <section class="pub-year" data-year="${esc(y)}"><h3>${esc(y)}</h3>${items.filter((x) => (x.year || "—") === y).map((x) => {
          const people = x.authors || (x.with ? `with ${x.with}` : "");
          const meta = [x.venue, x.details, x.indexed, people, x.role].filter(Boolean).map(esc).join(" · ");
          const text = [x.title, x.venue, x.with, x.authors, x.year].join(" ").toLowerCase();
          return `<div class="pub" data-type="${esc(x.type)}" data-topics="${esc((x.topics || []).join("|"))}" data-text="${esc(text)}">
            <span class="pill" title="${esc(x.type)}">${short[x.type] || "•"}</span>
            <div><div class="pt">${x.link ? `<a href="${esc(x.link)}" target="_blank" rel="noopener">${esc(x.title)} ↗</a>` : esc(x.title)}</div>
              <div class="pm">${meta}</div></div>
            <div class="ptags">${(x.topics || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
          </div>`;
        }).join("")}</section>`).join("")}
      </div>`;
  }

  // ongoing projects, each with who is wanted; hidden until data/research.json lists some
  function active(d){
    const list = d.activeProjects || [];
    if (!list.length) return "";
    return `
      <h2 id="active">Active research <span>${list.length} ongoing · open to new members</span></h2>
      <div class="grid">${list.map((p) => `
        <article class="card" id="proj-${slug(p.title)}" data-area="${esc(p.domain)}">
          <div class="meta"><span>${esc(p.domain)}</span>${p.status ? `<span class="pill ok">${esc(p.status)}</span>` : ""}</div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.summary)}</p>
          ${p.seeking ? `<div class="proof">Looking for: ${esc(p.seeking)}</div>` : ""}
          <div class="go-row">${p.link ? `<a class="go" href="${esc(p.link)}" target="_blank" rel="noopener">VIEW PROJECT ↗</a>` : ""}
            <a class="go" href="#join" data-project="${esc(p.title)}">I'M INTERESTED ›</a></div>
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
    const pubs = main.querySelector("#pubs");
    if (pubs) {
      const typeChips = main.querySelectorAll(".chip[data-type]"), topic = main.querySelector("#pub-topic"), q = main.querySelector("#pub-q");
      const count = main.querySelector("#pub-count"), total = pubs.querySelectorAll(".pub").length;
      const apply = () => {
        const type = main.querySelector('.chip[data-type][aria-pressed="true"]').dataset.type, tp = topic.value;
        const words = q.value.toLowerCase().split(/\s+/).filter(Boolean);
        let shown = 0;
        pubs.querySelectorAll(".pub").forEach((row) => {
          const ok = (!type || row.dataset.type === type) && (!tp || row.dataset.topics.split("|").includes(tp))
            && words.every((w) => row.dataset.text.includes(w));
          row.hidden = !ok; if (ok) shown++;
        });
        pubs.querySelectorAll(".pub-year").forEach((y) => { y.hidden = !y.querySelector(".pub:not([hidden])"); });
        count.textContent = shown === total ? `Showing all ${total}.` : shown ? `Showing ${shown} of ${total}.` : "No publications match. Try another word or topic.";
      };
      typeChips.forEach((c) => c.addEventListener("click", () => { typeChips.forEach((x) => x.setAttribute("aria-pressed", String(x === c))); apply(); }));
      topic.addEventListener("change", apply);
      q.addEventListener("input", apply);
      apply();
    }
    const nav = main.querySelector(".secnav");
    if (nav && "IntersectionObserver" in window) {           // highlight the section in view
      const links = [...nav.querySelectorAll("a")];
      const spy = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) links.forEach((l) => l.classList.toggle("on", l.getAttribute("href") === "#" + e.target.id));
      }), { rootMargin: "-20% 0px -70% 0px" });
      links.forEach((l) => { const t = main.querySelector(l.getAttribute("href")); if (t) spy.observe(t); });
    }
    const chips = main.querySelectorAll(".chip[data-area]");
    chips.forEach((c) => c.addEventListener("click", () => {
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      main.querySelectorAll("#papers .card").forEach((card) => { card.hidden = !!c.dataset.area && card.dataset.area !== c.dataset.area; });
    }));
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
