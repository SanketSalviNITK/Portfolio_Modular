/* Research Bytes #1, IoTaaS: the visuals for each scene (the script is papers/iotaas.json).
   Visuals sit in the area left of Neerja and above the captions: x 140..1500, y 120..850. Numbers are from the paper's Table 4. */
(() => {
  const { W, clamp, lerp, seg, out3, sine, hash, esc, rise, pop, cs, count } = window.PV;
  const V = window.VIEWS;
  const CY = "#46e2ff", GR = "#5dffa8", AM = "#ffb35c", RD = "#ff6b8a", DIM = "#9aa7b4";
  const head = (lt, kick, text, color = CY) => `<div class="abs kick" style="left:150px;top:130px;color:${color};${rise(lt, 0.05)}">${kick}</div>
    <div class="abs h1" style="left:150px;top:175px;width:1300px;${rise(lt, 0.2)}">${text}</div>`;

  // a physical lab: 6 kits, 31 students crowding them, and a clock open 8 of 24 hours
  V.hook = (s, lt) => {
    let kits = "", people = "";
    for (let k = 0; k < 6; k++) kits += `<rect x="${60 + k * 150}" y="210" width="110" height="70" rx="8" fill="#0d1622" stroke="${CY}" stroke-width="3"/>
      <rect x="${78 + k * 150}" y="228" width="34" height="22" fill="${GR}" opacity=".7"/><circle cx="${140 + k * 150}" cy="240" r="7" fill="${AM}"/>`;
    const shown = Math.floor(count(lt, cs(s, 2), cs(s, 2) + 1.4, 31));
    for (let p = 0; p < 31; p++) {
      const k = p % 6, row = Math.floor(p / 6), x = 85 + k * 150 + (row % 2 ? 30 : 0) + (hash(p) - 0.5) * 30, y = 330 + row * 46;
      people += `<g opacity="${p < shown ? 1 : 0.08}"><circle cx="${x.toFixed(0)}" cy="${y}" r="13" fill="${DIM}"/><path d="M${(x - 18).toFixed(0)} ${y + 36} Q${x.toFixed(0)} ${y + 6} ${(x + 18).toFixed(0)} ${y + 36}Z" fill="${DIM}"/></g>`;
    }
    const open = 8 / 24, sweep = out3(seg(lt, cs(s, 1), cs(s, 1) + 1.5)) * open, a = sweep * Math.PI * 2 - Math.PI / 2;
    const arc = `M0 -140 A140 140 0 ${sweep > 0.5 ? 1 : 0} 1 ${(140 * Math.cos(a)).toFixed(1)} ${(140 * Math.sin(a)).toFixed(1)}`;
    return head(lt, "The problem", "Real IoT labs are scarce") + `
      <svg class="abs" style="left:150px;top:280px" width="980" height="620" viewBox="0 0 980 620">
        <text x="60" y="180" font-family="Courier New" font-weight="700" font-size="26" fill="${CY}" letter-spacing="4">6 KITS</text>${kits}${people}
        <text x="${60 + 5 * 150}" y="600" text-anchor="end" font-family="Courier New" font-weight="700" font-size="28" fill="${DIM}" letter-spacing="3" opacity="${shown ? 1 : 0}">${shown} STUDENTS</text>
      </svg>
      <svg class="abs" style="left:1130px;top:350px;${rise(lt, cs(s, 1))}" width="340" height="380" viewBox="-170 -170 340 380">
        <circle r="140" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="22"/>
        <path d="${arc}" fill="none" stroke="${AM}" stroke-width="22" stroke-linecap="round"/>
        <text y="12" text-anchor="middle" font-size="64" font-weight="700" fill="#fff">${Math.round(sweep * 24)}/24</text>
        <text y="200" text-anchor="middle" font-family="Courier New" font-size="22" fill="${DIM}" letter-spacing="3">HOURS OPEN</text></svg>`;
  };

  // the lab lifts into a cloud; phones and laptops connect to it from everywhere
  V.idea = (s, lt) => {
    const lift = out3(seg(lt, cs(s, 1), cs(s, 1) + 1.2));
    const devices = [["💻", 240, 640], ["📱", 520, 720], ["💻", 1000, 720], ["📱", 1250, 630], ["📱", 760, 760]];
    let links = "";
    devices.forEach(([icon, x, y], i) => {
      const k = out3(seg(lt, cs(s, 1) + 0.8 + i * 0.25, cs(s, 1) + 1.3 + i * 0.25)), cx = 760, cy = 470 - lift * 60;
      const p = ((lt * 0.6 + i * 0.2) % 1);
      links += `<line x1="${x}" y1="${y - 40}" x2="${cx}" y2="${cy + 60}" stroke="${CY}" stroke-width="2" stroke-dasharray="6 8" opacity="${(0.6 * k).toFixed(2)}"/>
        <circle cx="${lerp(x, cx, p).toFixed(0)}" cy="${lerp(y - 40, cy + 60, p).toFixed(0)}" r="6" fill="${GR}" opacity="${k}"/>
        <text x="${x}" y="${y + 30}" text-anchor="middle" font-size="96" opacity="${k}">${icon}</text>`;
    });
    const cloudY = 470 - lift * 60;
    return head(lt, "The idea", "IoT lab as a service") + `
      <svg class="abs" style="left:0;top:0" width="1600" height="900" viewBox="0 0 1600 900">${links}
        <g transform="translate(760 ${cloudY.toFixed(0)})" opacity="${(0.25 + 0.75 * lift).toFixed(2)}">
          <path d="M-190 60 Q-230 60 -230 20 Q-230 -30 -170 -30 Q-160 -100 -80 -100 Q-20 -150 50 -100 Q140 -120 160 -40 Q230 -40 230 15 Q230 60 180 60 Z" fill="rgba(70,226,255,.12)" stroke="${CY}" stroke-width="4" style="filter:drop-shadow(0 0 18px ${CY})"/>
          <rect x="-80" y="-40" width="160" height="70" rx="8" fill="#0d1622" stroke="${GR}" stroke-width="3"/><circle cx="-40" cy="-5" r="10" fill="${GR}"/><circle cx="0" cy="-5" r="10" fill="${AM}"/><circle cx="40" cy="-5" r="10" fill="${RD}"/>
        </g>
        <rect x="520" y="${(cloudY + 88).toFixed(0)}" width="480" height="48" fill="#04070c" opacity="${seg(lt, cs(s, 1) + 1, cs(s, 1) + 1.5)}"/><text x="760" y="${(cloudY + 122).toFixed(0)}" text-anchor="middle" font-family="Courier New" font-weight="700" font-size="26" letter-spacing="5" fill="${GR}" opacity="${seg(lt, cs(s, 1) + 1, cs(s, 1) + 1.5)}">OPEN 24 × 7 · ANY DEVICE</text>
      </svg>`;
  };

  // the architecture: a pipeline that lights up stage by stage, with packets flowing; the queue and the webcam beside it
  V.arch = (s, lt) => {
    const stages = [["🧑‍🎓", "Student", "browser · sign in"], ["⚙️", "Middleware", "Node.js · queue · MongoDB"], ["🔌", "WoT API", "WebSockets"], ["🍓", "Raspberry Pi", "runs the experiment"], ["🔧", "Arduino Uno", "serial"], ["💡", "LED · LDR · DHT11", "sensors & actuators"]];
    const at = [cs(s, 0), cs(s, 1), cs(s, 2), cs(s, 2) + 1.2, cs(s, 2) + 2.2, cs(s, 2) + 3.2];
    let g = "";
    stages.forEach(([icon, name, sub], i) => {
      const x = 10 + i * 222, k = out3(seg(lt, at[i], at[i] + 0.5)), hot = lt > at[i];
      g += `<g opacity="${(0.15 + 0.85 * k).toFixed(2)}" transform="translate(${x} 0)">
        <rect x="0" y="0" width="190" height="190" rx="14" fill="#0d1622" stroke="${hot ? CY : "rgba(255,255,255,.2)"}" stroke-width="3" ${hot ? `style="filter:drop-shadow(0 0 12px ${CY})"` : ""}/>
        <text x="95" y="90" text-anchor="middle" font-size="62">${icon}</text>
        <text x="95" y="140" text-anchor="middle" font-size="21" font-weight="700" fill="#fff">${esc(name)}</text>
        <text x="95" y="168" text-anchor="middle" font-family="Courier New" font-size="15" fill="${DIM}">${esc(sub)}</text></g>`;
      if (i < stages.length - 1) {
        const on = lt > at[i + 1];
        g += `<line x1="${x + 190}" y1="95" x2="${x + 222}" y2="95" stroke="${on ? CY : "rgba(255,255,255,.2)"}" stroke-width="4"/>`;
        if (on) { const p = (lt * 1.4 + i * 0.3) % 1; g += `<circle cx="${(x + 190 + 35 * p).toFixed(1)}" cy="95" r="6" fill="${GR}"/>`; }
      }
    });
    // the queue: students waiting, each with a timer; one at the hardware
    const qk = out3(seg(lt, cs(s, 1), cs(s, 1) + 0.6)), tick = Math.max(0, 300 - Math.floor((lt - cs(s, 1)) * 40));
    const queue = ["You", "Asha", "Ravi", "Meera"].map((n, i) => `<div style="display:flex;justify-content:space-between;padding:10px 14px;border:1.5px solid ${i ? "rgba(255,255,255,.18)" : GR};margin-top:8px;color:${i ? DIM : "#fff"}">
      <span>${i ? i + 1 : "▶"} · ${n}</span><span class="mono">${i ? `${i * 5}:00` : `${Math.floor(tick / 60)}:${String(tick % 60).padStart(2, "0")}`}</span></div>`).join("");
    // the live webcam view
    const cam = out3(seg(lt, cs(s, 3), cs(s, 3) + 0.6)), blink = Math.floor(lt * 2) % 2;
    return head(lt, "How it works", "From your click to a real LED") + `
      <svg class="abs" style="left:150px;top:320px" width="1360" height="200" viewBox="0 0 1360 200">${g}</svg>
      <div class="panel" style="left:150px;top:560px;width:520px;padding:18px 22px;font-size:22px;${`opacity:${qk}`}">
        <div class="mono" style="color:${GR};font-weight:700;letter-spacing:.2em;font-size:18px">QUEUE · ONE STUDENT AT A TIME</div>${queue}</div>
      <div class="panel" style="left:720px;top:560px;width:520px;height:290px;opacity:${cam};overflow:hidden">
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 60%,rgba(255,240,180,${(0.25 + 0.2 * sine((lt % 2) / 2)).toFixed(2)}),#05080d 70%)"></div>
        <div style="position:absolute;left:150px;top:140px;width:220px;height:90px;border:3px solid ${CY};border-radius:8px;background:#0d1622"></div>
        <div style="position:absolute;left:190px;top:165px;width:30px;height:30px;border-radius:50%;background:#fff6c8;box-shadow:0 0 30px 10px rgba(255,246,200,.7)"></div>
        <div style="position:absolute;left:300px;top:165px;width:30px;height:30px;border-radius:50%;background:#fff6c8;box-shadow:0 0 30px 10px rgba(255,246,200,.7)"></div>
        <div class="mono" style="position:absolute;left:16px;top:12px;color:${RD};font-weight:700;font-size:18px;letter-spacing:.15em">${blink ? "●" : "○"} LIVE · WEBCAM</div>
        <div class="mono" style="position:absolute;right:16px;bottom:12px;color:${DIM};font-size:16px">OLED: "You"</div></div>`;
  };

  // the light sensor experiment: two LED sliders go to 100 and the LDR reading climbs
  V.demo = (s, lt) => {
    const k = out3(seg(lt, cs(s, 1) + 0.3, cs(s, 1) + 2.4)), b = Math.round(100 * k), lux = Math.round(lerp(212, 846, k));
    const slider = (label, y) => `<div style="position:absolute;left:40px;top:${y}px;width:560px">
        <div class="mono" style="display:flex;justify-content:space-between;font-size:22px;color:#fff"><span>${label}</span><span style="color:${AM}">${b}</span></div>
        <div style="margin-top:12px;height:10px;background:rgba(255,255,255,.12)"><div style="height:100%;width:${b}%;background:${AM};box-shadow:0 0 14px ${AM}"></div></div></div>`;
    let spark = ""; for (let i = 0; i < 40; i++) { const kk = out3(seg(lt, cs(s, 1) + 0.3 + i * 0.05, cs(s, 1) + 1.0 + i * 0.05)); spark += `${30 + i * 13},${(210 - 160 * kk - 6 * hash(i)).toFixed(0)} `; }
    return head(lt, "The experiment", "Light-sensor (LDR) calibration") + `
      <div class="panel" style="left:150px;top:320px;width:640px;height:500px;${rise(lt, 0.4)}">
        <div class="mono" style="position:absolute;left:40px;top:30px;color:${CY};font-weight:700;letter-spacing:.2em;font-size:18px">CONTROLS</div>
        ${slider("LED 1 BRIGHTNESS", 90)}${slider("LED 2 BRIGHTNESS", 200)}
        <div class="mono" style="position:absolute;left:40px;top:330px;font-size:20px;color:${DIM}">LIGHT INTENSITY (LDR)</div>
        <div style="position:absolute;left:40px;top:365px;font-size:96px;font-weight:700;color:${GR};text-shadow:0 0 22px ${GR}">${lux}</div></div>
      <div class="panel" style="left:830px;top:320px;width:620px;height:500px;${rise(lt, 0.7)}">
        <div class="mono" style="position:absolute;left:30px;top:30px;color:${RD};font-weight:700;letter-spacing:.15em;font-size:18px">● LIVE</div>
        <div style="position:absolute;inset:60px 30px 250px;background:radial-gradient(circle at 50% 70%,rgba(255,240,180,${(0.08 + 0.6 * k).toFixed(2)}),#05080d 75%);border:1px solid rgba(255,255,255,.1)">
          <div style="position:absolute;left:35%;bottom:20px;width:26px;height:26px;border-radius:50%;background:${k > 0.05 ? "#fff6c8" : "#334"};box-shadow:0 0 ${(40 * k).toFixed(0)}px ${(14 * k).toFixed(0)}px rgba(255,246,200,.75)"></div>
          <div style="position:absolute;left:58%;bottom:20px;width:26px;height:26px;border-radius:50%;background:${k > 0.05 ? "#fff6c8" : "#334"};box-shadow:0 0 ${(40 * k).toFixed(0)}px ${(14 * k).toFixed(0)}px rgba(255,246,200,.75)"></div></div>
        <svg style="position:absolute;left:0;bottom:20px" width="620" height="230" viewBox="0 0 620 230">
          <polyline points="${spark}" fill="none" stroke="${GR}" stroke-width="4" style="filter:drop-shadow(0 0 6px ${GR})"/>
          <text x="30" y="225" font-family="Courier New" font-size="16" fill="${DIM}">LDR READING OVER TIME</text></svg></div>`;
  };

  // the study design: 51 students take a test; 20 low scorers try the virtual lab, 20 the physical one
  V.study = (s, lt) => {
    let dots = "";
    const split = out3(seg(lt, cs(s, 1) + 0.6, cs(s, 1) + 1.8));
    for (let i = 0; i < 51; i++) {
      const col = i % 17, row = Math.floor(i / 17), x0 = 380 + col * 46, y0 = 330 + row * 50;
      const grp = i < 20 ? 0 : i < 40 ? 1 : 2, gx = grp === 0 ? 260 + (i % 5) * 46 : grp === 1 ? 900 + ((i - 20) % 5) * 46 : x0, gy = grp < 2 ? 470 + Math.floor((i % 20) / 5) * 50 : y0;
      const x = grp < 2 ? lerp(x0, gx, split) : x0, y = grp < 2 ? lerp(y0, gy, split) : y0;
      const col2 = grp === 0 ? CY : grp === 1 ? AM : DIM, show = out3(seg(lt, cs(s, 0) + i * 0.02, cs(s, 0) + 0.4 + i * 0.02));
      dots += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="15" fill="${split > 0.1 ? col2 : DIM}" opacity="${(grp === 2 ? show * (1 - 0.75 * split) : show).toFixed(2)}"/>`;
    }
    return head(lt, "The study", "51 students · two labs · one week") + `
      <svg class="abs" style="left:0;top:0" width="1600" height="900" viewBox="0 0 1600 900">${dots}
        <text x="352" y="440" text-anchor="middle" font-family="Courier New" font-weight="700" font-size="24" fill="${CY}" opacity="${split}" letter-spacing="3">VIRTUAL LAB · 20</text>
        <text x="992" y="440" text-anchor="middle" font-family="Courier New" font-weight="700" font-size="24" fill="${AM}" opacity="${split}" letter-spacing="3">PHYSICAL LAB · 20</text>
      </svg>`;
  };

  // the results: four comparisons that build with the narration
  const bars = (lt, at, label, a, b, max, unit, fmt = (v) => v) => {
    const k = out3(seg(lt, at, at + 1.0)), wa = (520 * a / max) * k, wb = b == null ? 0 : (520 * b / max) * k;
    return `<div style="${rise(lt, at, 20, 0.4)};margin-bottom:34px">
      <div style="font-size:30px;font-weight:600;margin-bottom:10px">${label}</div>
      <div style="display:flex;align-items:center;gap:16px"><div style="width:${wa.toFixed(0)}px;height:30px;background:${CY};box-shadow:0 0 16px ${CY}"></div><span class="mono" style="font-size:26px;font-weight:700;color:${CY}">${fmt((a * k).toFixed(a % 1 ? 1 : 0))}${unit} virtual</span></div>
      ${b == null ? "" : `<div style="display:flex;align-items:center;gap:16px;margin-top:8px"><div style="width:${wb.toFixed(0)}px;height:30px;background:${AM}"></div><span class="mono" style="font-size:26px;color:${AM}">${fmt((b * k).toFixed(b % 1 ? 1 : 0))}${unit} physical</span></div>`}</div>`;
  };
  V.results = (s, lt) => head(lt, "The results", "The virtual lab came out ahead") + `
      <div class="abs" style="left:150px;top:300px;width:700px">${bars(lt, cs(s, 0) + 0.3, "Improvement in test scores", 25, 15, 30, "%")}${bars(lt, cs(s, 1), "Student satisfaction (out of 5)", 4.5, 3.8, 5, "")}</div>
      <div class="abs" style="left:850px;top:300px;width:700px">${bars(lt, cs(s, 2), "Minutes engaged per session", 30, 20, 36, " min")}${bars(lt, cs(s, 2) + 1.8, "Tasks completed", 90, null, 100, "%")}</div>`;

  // access and cost: big numbers
  V.access = (s, lt) => {
    const big = (x, at, v, unit, label, col, vs) => `<div class="abs" style="left:${x}px;top:330px;width:420px;${rise(lt, at, 30)}">
        <div style="font-size:120px;font-weight:700;line-height:1;color:${col};text-shadow:0 0 26px ${col}">${v}<span style="font-size:56px">${unit}</span></div>
        <div style="margin-top:14px;font-size:28px;font-weight:600">${label}</div>
        <div class="mono" style="margin-top:8px;font-size:22px;color:${DIM}">${vs}</div></div>`;
    return head(lt, "Access & cost", "A lab for every student") +
      big(150, cs(s, 0) + 0.2, count(lt, cs(s, 0) + 0.2, cs(s, 0) + 1.4, 100), "%", "students with their own access", GR, "vs 20% in the physical lab") +
      big(600, cs(s, 0) + 1.0, count(lt, cs(s, 0) + 1.0, cs(s, 0) + 2.2, 24), "h", "open every day", CY, "vs 8 hours in the physical lab") +
      big(1050, cs(s, 1) + 0.3, "₹" + count(lt, cs(s, 1) + 0.3, cs(s, 1) + 1.8, 43.5, 1), "", "per student (₹870 per kit)", AM, "vs ₹168 in the physical lab");
  };

  // the honest note: both labs side by side
  V.honest = (s, lt) => {
    const card = (x, at, col, title, items) => `<div class="panel" style="left:${x}px;top:320px;width:600px;padding:34px 38px;border-color:${col};${rise(lt, at)}">
        <div style="font-size:40px;font-weight:700;color:${col}">${title}</div>${items.map((it, i) => `<div style="margin-top:20px;font-size:28px;${rise(lt, at + 0.3 + i * 0.25, 12, 0.35)}">${it}</div>`).join("")}</div>`;
    return head(lt, "The balance", "Both labs have a place") +
      card(150, cs(s, 0), AM, "Physical lab", ["✓ Direct, hands-on work", "✓ High-fidelity experiments", "✓ Instructor right there"]) +
      card(820, cs(s, 1), CY, "IoTaaS virtual lab", ["✓ Open 24 × 7, anywhere", "✓ One student, one kit", "✓ Low cost per student"]);
  };

  // credits: the authors and the paper
  V.credits = (s, lt) => {
    const M = window.TIMELINE.meta;
    return `<div class="abs kick glow" style="left:150px;top:180px;${rise(lt, 0)}">The paper</div>
      <div class="abs h1" style="left:150px;top:230px;width:1300px;font-size:56px;${rise(lt, 0.2)}">${esc(M.title)}</div>
      <div class="abs" style="left:150px;top:430px;width:1300px">${M.authors.map((a, i) => `<span style="display:inline-block;margin:0 26px 18px 0;font-size:36px;font-weight:${a === "Sanket Salvi" ? 700 : 400};color:${a === "Sanket Salvi" ? CY : "#fff"};${pop(lt, 0.5 + i * 0.35, 0.35)}">${esc(a)}</span>`).join("")}</div>
      <div class="abs mono" style="left:150px;top:590px;font-size:24px;color:${DIM};letter-spacing:.06em;${rise(lt, 2.2)}">${esc(M.venue)}<br>${esc(M.publisher)}${M.doi ? ` · doi:${esc(M.doi)}` : ""}</div>
      <div class="abs" style="left:150px;top:690px;${pop(lt, 2.8, 0.4)}"><span class="chip" style="color:${AM}">★ Best Paper · AIR 2025</span></div>`;
  };
})();
