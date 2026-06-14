/* ============================================================
   PLAIN RÉSUMÉ VIEW — the "skip the story" door. (Path 1: data-driven)
   Content lives in resume-data.json (committed next to index.html);
   the site fetches it on load. DEFAULT_RESUME (baked in) is the
   fallback so the page NEVER breaks if the fetch fails (e.g. file://).
   ============================================================ */
(function(){
  const body = document.getElementById("resume-body");
  if(!body) return;

  /* ---- baked-in fallback (mirror of resume-data.json) ---- */
  const DEFAULT_RESUME = {"meta": {"lastUpdated": "2026-06-12", "changelog": [{"date": "2026-06-12", "what": "Initial r\u00e9sum\u00e9 data published (split from inline content).", "where": "All sections"}]}, "header": {"name": "Dr. Sanket Salvi", "title": "Assistant Professor (Level 11), MIT-WPU \u00b7 Ph.D. (IT, NIT Karnataka) \u00b7 IoT / Li-Fi / AI / Full-Stack", "location": "Pimpri-Chinchwad, Pune, India", "email": "sanketsalvi.salvi@gmail.com", "links": [{"label": "Website", "url": "https://onlysanket.in"}, {"label": "GitHub", "url": "https://github.com/SanketSalviNITK"}, {"label": "LinkedIn", "url": "https://www.linkedin.com/in/onlysanket"}, {"label": "Instagram", "url": "https://www.instagram.com/oneandonlysanket/"}]}, "summary": {"text": "Academician and technologist with 12 years spanning teaching and research (6 + 6). Ph.D. in Information Technology (NIT Karnataka), specializing in Visible Light Communication (Li-Fi) for indoor IoT. Work spans IoT systems, AI/ML, computer vision, AR/VR & digital twins, healthcare informatics, and full-stack development. 47+ peer-reviewed publications, 6 patents, and multiple best-paper and best-project awards.", "counts": [{"value": "7", "label": "Journals"}, {"value": "32", "label": "Conferences"}, {"value": "8", "label": "Book Chapters"}, {"value": "6", "label": "Patents"}, {"value": "11", "label": "h-index"}]}, "education": [{"title": "Ph.D., Information Technology", "org": "National Institute of Technology Karnataka", "when": "2017 \u2013 2023", "desc": "Thesis: efficient modulation techniques for VLC/Li-Fi in indoor IoT environments (advisor: Dr. Geetha V)."}, {"title": "M.Tech., Computer Network Engineering", "org": "Visvesvaraya Technological University (VTU)", "when": "2012 \u2013 2014", "desc": "Thesis: ECK (Encryption-Compression-Key) data-security framework for cloud IaaS."}, {"title": "B.E., Computer Science & Engineering", "org": "University of Pune", "when": "2007 \u2013 2012", "desc": "Thesis: word-set hierarchical clustering for large datasets."}], "experience": [{"role": "Assistant Professor (Level 11)", "org": "MIT World Peace University, Pune", "when": "01/2026 \u2013 present", "desc": "Teaching AR/VR; runs the Full-Stack (MERN) development lab."}, {"role": "Post-Doctoral Researcher", "org": "University of Central Florida, USA", "when": "01/2025 \u2013 10/2025", "desc": "Center for Decision Support Systems & Informatics \u2014 Healthcare IoT & AI (four journal papers, 2025)."}, {"role": "Assistant Professor", "org": "Symbiosis Institute of Technology, Pune", "when": "08/2024 \u2013 12/2024", "desc": "Member of the Departmental Examination and Research committees."}, {"role": "Assistant Professor", "org": "MIT World Peace University, Pune", "when": "10/2022 \u2013 07/2024", "desc": "DAA, C, Cloud & Blockchain for Data Analytics, AI & Expert Systems, IoT Lab, competitive coding."}, {"role": "Research Scholar (Ph.D.)", "org": "NIT Karnataka", "when": "07/2017 \u2013 10/2022", "desc": "Visible Light Communication / Li-Fi research."}, {"role": "Assistant Professor", "org": "Nitte Meenakshi Institute of Technology, Bengaluru", "when": "02/2015 \u2013 03/2022", "desc": "Led UNESCO/JNCASR/NGO-funded projects."}, {"role": "Assistant Professor & Asst. Director, R&D", "org": "MPSE, Nanded", "when": "07/2014 \u2013 02/2015", "desc": ""}], "publications": {"metrics": "Citation metrics \u2014 Google Scholar h-index 11 \u00b7 i10-index 13 \u00b7 Scopus h-index 8. Full list of 47+ in the downloadable r\u00e9sum\u00e9.", "items": ["Salvi & Geetha \u2014 <b>A Nested-Texture Image-Pattern Optical Camera Communication</b>, <i>IEEE Access</i> 2022. <a href=\"https://ieeexplore.ieee.org/document/9915602\" target=\"_blank\" rel=\"noopener\">ieee.org</a>", "Salvi & Vasantha \u2014 <b>Hybrid FSK + PWM Modulation for Li-Fi</b>, <i>Computation</i> 2022. <a href=\"https://www.mdpi.com/2079-3197/10/7/110\" target=\"_blank\" rel=\"noopener\">mdpi.com</a>", "Salvi et al. \u2014 <b>Digital Convergence in Dental Informatics: AI, IoT, Digital Twins & LLMs</b>, <i>Electronics</i> 2025. <a href=\"https://www.mdpi.com/2079-9292/14/16/3278\" target=\"_blank\" rel=\"noopener\">mdpi.com</a>", "Salvi, Garg, Gurupur \u2014 <b>Stage-Wise IoT Solutions for Alzheimer's Disease</b>, <i>Sensors</i> 2025. <a href=\"https://www.mdpi.com/1424-8220/25/17/5252\" target=\"_blank\" rel=\"noopener\">mdpi.com</a>", "<b>IoTaaS: An IoT-as-a-Service Framework for Virtual Experimentation</b> \u2014 <span class=\"r-pill g\">Best Paper</span> AIR 2025, Nazarbayev University (Springer).", "<b>Continuous Sign-Language Recognition with Leap Motion</b> \u2014 <span class=\"r-pill g\">Best Paper</span> IEEE AIC 2024. <a href=\"https://doi.org/10.1109/AIC61668.2024.10730854\" target=\"_blank\" rel=\"noopener\">doi</a>"]}, "patents": ["<span class=\"r-pill g\">Granted</span> Li-Fi for Secured Wi-Fi Access during On-Campus Online Exams \u2014 South Africa (CIPC) 2023/02929 (2023).", "<span class=\"r-pill g\">Granted</span> Li-Fi for Secured Wi-Fi Access during On-Campus Online Exams \u2014 India 202424013857 (2024).", "<span class=\"r-pill\">Published</span> Teleoperated Robotic System \u2014 India 202421097626 (2025).", "<span class=\"r-pill\">Published</span> AI-Powered Content Creation in Automated Marketing \u2014 India 202441025040 (2024).", "<span class=\"r-pill\">Published</span> Integrated Smart Water Management System \u2014 India 202441068913 (2024).", "<span class=\"r-pill\">Filed</span> Wireless Sensor-Based Railway Track Crack Detection (design) \u2014 India 464849-001 (2025)."], "awards": ["<b>Best Paper</b> \u2014 AIR 2025, Nazarbayev University, Kazakhstan (Springer).", "<b>Best Paper</b> \u2014 IEEE AIC 2024, India.", "<b>Best Paper</b> \u2014 AITA 2024, IFHE University, India.", "<b>Best Project</b> \u2014 Unisys Cloud 20/20, 2017 (<i>Advhan</i>, crowd-sourced road-health monitoring).", "<b>Best Project</b> \u2014 Aavishkar 2017, REVA University (<i>AgrOne</i>, computer-vision crop-health drone).", "<b>Funded</b> \u2014 UNESCO via KSCST: DIY Rainwater Harvesting Advisor, \u20b91,50,000 (2016)."], "skills": ["Full-Stack (MERN)", "IoT Systems", "Li-Fi / VLC", "Machine Learning", "Computer Vision", "AR / VR & Digital Twins", "Cloud Computing", "Python", "Java / J2EE", "Android", "Big Data / Data Science", "Blockchain", "MATLAB / Image Processing", "Technical Writing"], "research": ["AI / ML", "Digital Twins", "AR / VR", "Healthcare IoT", "Li-Fi / VLC", "Autonomous EVs", "Vehicle Platooning", "P2P Energy Trading", "Quantum Computing", "Blockchain"], "certifications": ["edX \u00b7 Applied Local LLMs", "Google \u00b7 Industrial IoT on GCP", "Google \u00b7 AR & ARCore", "Microsoft \u00b7 Data Science", "Microsoft+LinkedIn \u00b7 Copilot", "Wipro \u00b7 Global Java Trainer", "CloudXLab \u00b7 ML Specialization", "CITI \u00b7 Human Subjects Research", "DRPC \u00b7 Certified Drone Pilot", "LinkedIn \u00b7 Prompt Engineering (GenAI)", "WES \u00b7 Verified Intl. Qualifications"], "languages": ["Marathi \u2014 Native", "Hindi \u2014 Fluent", "English \u2014 C1"], "interests": ["Guitar & Tabla", "Dance", "Music Editing", "DIY Electronics", "Volunteering", "Cooking", "Surfing", "Travelling"]};

  let RESUME = DEFAULT_RESUME;
  let built = false;

  /* fetch the live data file; if unavailable, keep the baked-in default.
     Accepts BOTH shapes:
       (a) hand-authored resume-data.json  → has .header  (used directly)
       (b) Google-Sheet generator output    → has .items[] (normalized below) */
  (function load(){
    try{
      fetch("resume-data.json", {cache:"no-cache"})
        .then(r=> r.ok ? r.json() : Promise.reject())
        .then(d=>{
          const norm = adapt(d);
          if(norm && norm.header){ RESUME = norm; if(built){ built=false; build(); } }
        })
        .catch(()=>{});
    }catch(e){}
  })();

  /* ---- adapter: Sheet-generator JSON → renderable RESUME shape ---- */
  function adapt(d){
    if(!d) return null;
    if(d.header) return d;                 // already the authored shape
    if(!Array.isArray(d.items)) return null;

    const get = (c, keys) => { for(const k of keys){ if(c[k]!=null && String(c[k]).trim()!=="") return String(c[k]).trim(); } return ""; };
    const byCat = {};
    d.items.forEach(it => { (byCat[it.category] = byCat[it.category] || []).push(it); });
    const cat = n => byCat[n] || [];
    const linkPart = (label) => label ? ` <a href="${label}" target="_blank" rel="noopener">${label.replace(/^https?:\/\//,"").split("/")[0]}</a>` : "";

    // keep the baked-in header/summary scaffold; the Sheet's Profile tab (if present) overrides it
    const base = (typeof DEFAULT_RESUME==="object" && DEFAULT_RESUME) ? DEFAULT_RESUME : {};
    const prof = d.profile || {};
    const pH = prof.header || {};
    const pS = prof.summary || {};
    const nz = (v, fb) => (v!=null && String(v).trim()!=="") ? v : fb;
    const header = {
      name:     nz(pH.name,     (base.header||{}).name || "Dr. Sanket Salvi"),
      title:    nz(pH.title,    (base.header||{}).title || ""),
      location: nz(pH.location, (base.header||{}).location || ""),
      email:    nz(pH.email,    (base.header||{}).email || ""),
      links:    (pH.links && pH.links.length) ? pH.links : ((base.header||{}).links || [])
    };
    const summaryText = nz(pS.text, (base.summary||{}).text || "");
    const profCounts  = (pS.counts && pS.counts.length) ? pS.counts : null;
    const metricsLine = nz((prof.publications||{}).metrics, (base.publications||{}).metrics || "");
    const out = {
      meta: d.meta ? {lastUpdated: (d.meta.generated||"").slice(0,10), changelog: []} : (base.meta||{}),
      header: header,
      summary: { text: summaryText, counts: [] },
      education: [], experience: [], publications: {metrics: metricsLine, items:[]},
      patents: [], awards: [], skills: [], research: [], certifications: [], languages: [], interests: []
    };

    // Education
    out.education = cat("Education").map(it=>{ const c=it.content; return {
      title: get(c,["Degree","Degree / title"]) + (get(c,["Specialization"])?`, ${get(c,["Specialization"])}`:""),
      org: get(c,["Institution"]), when: get(c,["Year"]),
      desc: get(c,["Thesis Title"]) ? `Thesis: ${get(c,["Thesis Title"])}${get(c,["Supervisor"])?` (advisor: ${get(c,["Supervisor"])})`:""}.` : ""
    };});

    // Experience (teaching + industry/research, in listed order)
    const expRows = cat("Experience-Teaching").concat(cat("Experience-Industry-Research"));
    out.experience = expRows.map(it=>{ const c=it.content; return {
      role: get(c,["Designation","Designation/Role"]), org: get(c,["Organization"]),
      when: [get(c,["From"]), get(c,["To"])].filter(Boolean).join(" – "),
      desc: get(c,["Nature of Work"]) || ""
    };});

    // Publications: journals + conferences → HTML list items; metrics line already set above
    const jItems = cat("Publications-Journals").map(it=>{ const c=it.content;
      return `${get(c,["Title"])}${get(c,["Journal"])?`, <i>${get(c,["Journal"])}</i>`:""}${get(c,["Year"])?` ${get(c,["Year"])}`:""}.${linkPart(get(c,["DOI / Link"]))}`; });
    const cItems = cat("Publications-Conferences").map(it=>{ const c=it.content;
      return `${get(c,["Title"])}${get(c,["Conference"])?`, ${get(c,["Conference"])}`:""}${get(c,["Year"])?` (${get(c,["Year"])})`:""}.${linkPart(get(c,["DOI / Link"]))}`; });
    out.publications.items = jItems.concat(cItems);

    // Patents
    out.patents = cat("Patents").map(it=>{ const c=it.content;
      const st=get(c,["Status (Filed/Published/Granted)"]);
      const badge = st ? `<span class="r-pill${/grant/i.test(st)?" g":""}">${st}</span> ` : "";
      return `${badge}${get(c,["Patent Name"])} — ${get(c,["Country"])} ${get(c,["Registration No."])}${get(c,["Date"])?` (${get(c,["Date"])})`:""}.`; });

    // Awards
    out.awards = cat("Awards-Recognition").map(it=>{ const c=it.content;
      return `<b>${get(c,["Award/Honour"])}</b>${get(c,["Awarding Body"])?` — ${get(c,["Awarding Body"])}`:""}${get(c,["Year"])?` (${get(c,["Year"])})`:""}.`; });

    // Skills / Research / Languages / Interests from Skills-Interests by Kind
    const si = cat("Skills-Interests");
    const kind = k => si.filter(it=> new RegExp(k,"i").test(get(it.content,["Kind (Skill/Research-Interest/Language/Hobby)"])));
    out.skills = kind("^skill").map(it=>{ const c=it.content; const p=get(c,["Proficiency/Note"]); return get(c,["Item"])+(p?` (${p})`:""); });
    out.research = kind("research").map(it=>get(it.content,["Item"]));
    out.languages = kind("language").map(it=>{ const c=it.content; const p=get(c,["Proficiency/Note"]); return get(c,["Item"])+(p?` — ${p}`:""); });
    out.interests = kind("hobby").map(it=>get(it.content,["Item"]));

    // Certifications
    out.certifications = cat("Certifications").map(it=>{ const c=it.content; return get(c,["Certification"])+(get(c,["Issuer"])?` · ${get(c,["Issuer"])}`:""); });

    // Counts: prefer Sheet Profile counts, then baked summary counts, else derive
    out.summary.counts = profCounts ? profCounts : ((base.summary && base.summary.counts) ? base.summary.counts : [
      {value:String(cat("Publications-Journals").length), label:"Journals"},
      {value:String(cat("Publications-Conferences").length), label:"Conferences"},
      {value:String(cat("Books-Chapters").length), label:"Book Chapters"},
      {value:String(cat("Patents").length), label:"Patents"}
    ]);
    return out;
  }

  const esc = s => String(s==null?"":s);
  const L = (u,t)=>`<a href="${u}" target="_blank" rel="noopener">${esc(t)}</a>`;
  const pills = arr => (arr||[]).map(s=>`<span class="r-pill">${esc(s)}</span>`).join("");
  const liHTML = arr => `<div class="r-item"><ul>${(arr||[]).map(s=>`<li>${s}</li>`).join("")}</ul></div>`;

  function fmtDate(iso){
    if(!iso) return "";
    try{
      const d = new Date(iso + (iso.length<=10 ? "T00:00:00" : ""));
      return d.toLocaleDateString(undefined, {year:"numeric", month:"short", day:"numeric"});
    }catch(e){ return iso; }
  }

  function build(){
    if(built) return; built = true;
    const R = RESUME, H = R.header||{}, S = R.summary||{};
    const linkRow = (H.links||[]).map(l=>L(l.url, l.label)).join("\n");
    const counts = (S.counts||[]).map(c=>`<div class="r-count"><b>${esc(c.value)}</b><span>${esc(c.label)}</span></div>`).join("");
    const edu = (R.education||[]).map(e=>`
      <div class="r-item">
        <div class="r-row"><span class="r-role">${esc(e.title)}</span><span class="r-when">${esc(e.when)}</span></div>
        <div class="r-org">${esc(e.org)}</div>
        ${e.desc?`<div class="r-desc">${esc(e.desc)}</div>`:""}
      </div>`).join("");
    const exp = (R.experience||[]).map(e=>`
      <div class="r-item">
        <div class="r-row"><span class="r-role">${esc(e.role)}</span><span class="r-when">${esc(e.when)}</span></div>
        <div class="r-org">${esc(e.org)}</div>
        ${e.desc?`<div class="r-desc">${esc(e.desc)}</div>`:""}
      </div>`).join("");
    const updated = R.meta && R.meta.lastUpdated ? `<div class="r-updated">Last updated: ${fmtDate(R.meta.lastUpdated)}</div>` : "";

    body.innerHTML = `
      <h1 class="r-name">${esc(H.name)}</h1>
      <div class="r-title">${esc(H.title)}</div>
      <div class="r-contact">${esc(H.location)}${H.email?` &middot; ${L("mailto:"+H.email, H.email)}`:""}</div>
      <div class="r-links">${linkRow}</div>
      ${updated}

      <div class="r-sec">
        <h2>Summary</h2>
        <p class="r-sum">${esc(S.text)}</p>
        ${counts?`<div class="r-counts" style="margin-top:14px">${counts}</div>`:""}
      </div>

      <div class="r-sec"><h2>Education</h2>${edu}</div>
      <div class="r-sec"><h2>Experience</h2>${exp}</div>

      <div class="r-sec">
        <h2>Selected Publications</h2>
        ${R.publications&&R.publications.metrics?`<p class="r-desc" style="margin-bottom:10px">${esc(R.publications.metrics)}</p>`:""}
        ${liHTML(R.publications&&R.publications.items)}
      </div>

      <div class="r-sec"><h2>Patents</h2>${liHTML(R.patents)}</div>
      <div class="r-sec"><h2>Awards &amp; Recognition</h2>${liHTML(R.awards)}</div>

      <div class="r-grid">
        <div class="r-sec"><h2>Skills</h2><div>${pills(R.skills)}</div></div>
        <div class="r-sec"><h2>Research Interests</h2><div>${pills(R.research)}</div></div>
      </div>

      <div class="r-sec">
        <h2>Certifications <span style="font-weight:600;color:#8a939a;letter-spacing:0;text-transform:none">(selected from 25+)</span></h2>
        <div>${pills(R.certifications)}</div>
      </div>

      <div class="r-grid">
        <div class="r-sec"><h2>Languages</h2><div>${pills(R.languages)}</div></div>
        <div class="r-sec"><h2>Interests</h2><div>${pills(R.interests)}</div></div>
      </div>

      <div class="r-foot">Prefer the full experience? Tap &ldquo;Enter 3D Experience&rdquo; above to explore the interactive version.</div>
    `;
  }

  /* ---- open / close / navigation wiring ---- */
  const resumeEl = document.getElementById("resume");
  const introEl  = document.getElementById("intro");
  let cameFromIntro = false;

  function openResume(){
    build();
    const live = document.body.classList.contains("live");
    if(!live && introEl && introEl.style.display !== "none"){ cameFromIntro = true; introEl.style.display = "none"; }
    resumeEl.classList.add("on"); resumeEl.scrollTop = 0;
  }
  function closeResume(){
    resumeEl.classList.remove("on");
    if(cameFromIntro && !document.body.classList.contains("live") && introEl){ introEl.style.display = "flex"; }
    cameFromIntro = false;
  }
  function enter3D(){
    const live = document.body.classList.contains("live");
    resumeEl.classList.remove("on"); cameFromIntro = false;
    if(live) return;
    if(introEl) introEl.style.display = "flex";
    const sb = document.getElementById("start");
    if(sb && !sb.disabled) sb.click();
  }
  function downloadPDF(){
    try{
      const blob = new Blob([window.PDF_BUF], {type:"application/pdf"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "Dr_Sanket_Salvi_Resume.pdf";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 5000);
    }catch(e){ try{ window.open(URL.createObjectURL(new Blob([window.PDF_BUF],{type:"application/pdf"})), "_blank"); }catch(_){} }
  }

  const on = (id,fn)=>{ const el=document.getElementById(id); if(el) el.addEventListener("click", fn); };
  on("resume-open", openResume);
  on("resume-top",  openResume);
  on("r-back",      closeResume);
  on("r-enter",     enter3D);
  on("r-dl",        downloadPDF);
  addEventListener("keydown", e=>{ if(e.key==="Escape" && resumeEl.classList.contains("on")) closeResume(); });
})();
