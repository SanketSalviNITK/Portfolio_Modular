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
  const ext = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`;

  fetch(`data/${page}.json`, { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((d) => { main.innerHTML = page === "research" ? research(d) : consulting(d); wire(d); })
    .catch(() => {
      main.innerHTML = `<section class="hero"><p class="lead">This page could not load its content. Please try again,
        or <a href="index.html">view the résumé</a> instead.</p></section>`;
    });

  function research(d){
    const status = { Granted: "ok", Published: "", Filed: "" };
    return `
      <section class="hero">
        <span class="stamp">CASE FILE 01 · RESEARCH</span>
        <h1>RESEARCH</h1>
        <p class="lead">${esc(d.intro)}</p>
      </section>
      <div class="metrics">${d.metrics.map((m) => `<div class="metric"><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join("")}</div>

      <h2>Selected papers <span>${d.featured.length} highlighted · full list of 47+ in the résumé</span></h2>
      <div class="chips" role="group" aria-label="Filter by research area">
        <button class="chip" aria-pressed="true" data-area="">All</button>
        ${[...new Set(d.featured.map((p) => p.area))].map((a) => `<button class="chip" aria-pressed="false" data-area="${esc(a)}">${esc(a)}</button>`).join("")}
      </div>
      <div class="grid" id="papers">${d.featured.map((p) => `
        <article class="card" data-area="${esc(p.area)}">
          <div class="meta"><span>${esc(p.year)}</span><span>·</span><span>${esc(p.area)}</span>${p.award ? `<span class="pill gold">${esc(p.award)}</span>` : ""}</div>
          <h3>${esc(p.title)}</h3>
          <div class="by">${esc(p.authors)} — <i>${esc(p.venue)}</i></div>
          <p>${esc(p.summary)}</p>
          ${p.link ? `<a class="go" href="${esc(p.link)}" target="_blank" rel="noopener">READ THE PAPER ↗</a>` : ""}
        </article>`).join("")}
      </div>

      <h2>Patents <span>${d.patents.length}</span></h2>
      <div class="rows">${d.patents.map((p) => `
        <div class="row"><span class="pill ${status[p.status] || ""}">${esc(p.status)}</span><span>${esc(p.title)}</span><span class="where">${esc(p.where)} · ${esc(p.year)}</span></div>`).join("")}
      </div>

      <h2>Research areas</h2>
      <div class="chips">${d.areas.map((a) => `<span class="chip" style="cursor:default">${esc(a)}</span>`).join("")}</div>

      <section class="cta">
        <p>${esc(d.collaborate)}</p>
        <div class="btns">
          <a class="btn primary" href="mailto:sanketsalvi.salvi@gmail.com?subject=Research%20collaboration">PROPOSE A COLLABORATION</a>
          <a class="btn" href="assets/resume.pdf" target="_blank" rel="noopener">FULL PUBLICATION LIST</a>
        </div>
      </section>
      <div class="links">${d.profiles.filter((p) => p.url).map((p) => ext(p.url, p.label + " ↗")).join("")}</div>`;
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

  // the research-area filter
  function wire(){
    const chips = main.querySelectorAll(".chip[data-area]");
    chips.forEach((c) => c.addEventListener("click", () => {
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      main.querySelectorAll("#papers .card").forEach((card) => { card.hidden = !!c.dataset.area && card.dataset.area !== c.dataset.area; });
    }));
  }
})();
