/* ZenBuddy · Zenfresh ON Desk — static web app (no build step, no API keys). */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem("zb_" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("zb_" + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };
  const toast = (msg) => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600); };
  const todayKey = () => new Date().toISOString().slice(0, 10);
  const bnNum = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

  /* ---------------- ROUTER ---------------- */
  const views = ["home", "viva", "planner", "forecast", "volunteer", "camps"];
  function route() {
    const id = (location.hash || "#home").slice(1);
    const v = views.includes(id) ? id : "home";
    views.forEach((x) => { const el = document.getElementById(x); if (el) el.hidden = x !== v; });
    $$(".links a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + v));
    $("#links").classList.remove("open");
    window.scrollTo(0, 0);
    if (v === "planner") renderSlots();
    reveal();
  }
  window.addEventListener("hashchange", route);
  $("#menuBtn").addEventListener("click", () => $("#links").classList.toggle("open"));

  /* ---------------- HOME ---------------- */
  const lines = ["বারো ঘণ্টা, ফ্রেশনেস একদম ON!", "জ্যামে ২ ঘণ্টা? ফ্রেশনেস আরো ১০।", "কারেন্ট যায়, ফ্রেশনেস যায় না।", "ইনিংস ৫০ ওভার, ফ্রেশনেস ১২ ঘণ্টা।", "রেজাল্ট যা-ই হোক, হাসিটা ফ্রেশ রাখো।", "এক ব্রাশে, সারাদিন সবার জন্য রেডি"];
  $("#marquee").innerHTML = [...lines, ...lines].map((l) => `<span>${l}</span><i>●</i>`).join("");
  const tools = [
    ["#viva", "🎤", "Viva Coach", "Mock job or admission viva in Bangla or English, with instant feedback.", "Youth", "#E3F5EA"],
    ["#planner", "🕖", "7-to-7 Planner", "Plan your 12-hour day, focus timer, 7 pm check-in streak.", "Youth", "#FFF1CC"],
    ["#forecast", "🌦", "Fresh Forecast", "Today's heat, rain and wind, turned into your freshness plan.", "Everyone", "#D8F3FA"],
    ["#volunteer", "🤝", "ভালো কাজ Board", "Join verified drives, earn hours and a CV certificate.", "Youth", "#FBE3EC"],
    ["#camps", "😁", "Smile Camp", "Free family check-ups in 16 upazilas. Find the one near you.", "Family", "#E3F5EA"],
  ];
  $("#toolGrid").innerHTML = tools.map(([h, e, t, d, tag, bg]) => `<a class="tcard reveal" href="${h}"><span class="tag">${tag}</span><div class="ic" style="background:${bg}">${e}</div><h3 class="bn">${t}</h3><p>${d}</p><span class="go">Open →</span></a>`).join("");

  function tickRing() {
    const n = new Date(), mins = (n.getHours() - 7) * 60 + n.getMinutes();
    const p = Math.max(0, Math.min(1, mins / 720)), circ = 2 * Math.PI * 86;
    const ring = $("#ringProg"); ring.style.strokeDasharray = circ; ring.style.strokeDashoffset = circ * (1 - p);
    if (mins < 0) { $("#ringTime").textContent = "7:00"; $("#ringNote").textContent = "your day starts at 7 am"; }
    else if (mins >= 720) { $("#ringTime").textContent = "12h"; $("#ringNote").textContent = "done. এখনো ফ্রেশ?"; }
    else { $("#ringTime").textContent = `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`; $("#ringNote").textContent = "of 12 hours ON"; }
  }
  tickRing(); setInterval(tickRing, 30000);

  function reveal() {
    const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 }) : null;
    $$(".reveal:not(.in)").forEach((el) => io ? io.observe(el) : el.classList.add("in"));
  }

  /* streak */
  const streak = () => store.get("streak", { n: 0, last: null });
  const showStreak = () => { $("#streakN").textContent = streak().n; };
  showStreak();

  /* ---------------- VIVA COACH ---------------- */
  const Q = {
    job: { en: ["Tell us about yourself.", "Why do you want to work here?", "Tell us about a time you solved a problem under pressure.", "What is your biggest weakness?", "Where do you see yourself in three years?"],
      bn: ["নিজের সম্পর্কে কিছু বলুন।", "আপনি কেন এই চাকরিটা চান?", "চাপের মধ্যে কোনো সমস্যা সমাধান করেছেন, এমন একটা উদাহরণ দিন।", "আপনার সবচেয়ে বড় দুর্বলতা কী?", "তিন বছর পর নিজেকে কোথায় দেখতে চান?"] },
    admission: { en: ["Why did you choose this subject?", "What did you read or watch recently that changed how you think?", "How will you handle living away from home?", "Which problem in Bangladesh would you like to solve?", "Tell us about one achievement you are proud of."],
      bn: ["এই বিষয়টা কেন বেছে নিলে?", "সম্প্রতি কী পড়েছ বা দেখেছ যা তোমার ভাবনা বদলেছে?", "বাড়ি থেকে দূরে থাকলে কীভাবে মানিয়ে নেবে?", "বাংলাদেশের কোন সমস্যাটা সমাধান করতে চাও?", "তোমার একটা অর্জনের কথা বলো যেটা নিয়ে তুমি গর্বিত।"] },
    thesis: { en: ["Summarise your project in one minute.", "What was your research method and why?", "What is the main limitation of your work?", "How is your work useful in the real world?", "If you started again, what would you change?"],
      bn: ["এক মিনিটে তোমার প্রজেক্টটা বলো।", "তোমার গবেষণা পদ্ধতি কী এবং কেন?", "তোমার কাজের প্রধান সীমাবদ্ধতা কী?", "বাস্তবে তোমার কাজ কীভাবে কাজে লাগবে?", "আবার শুরু করলে কী বদলাতে?"] },
  };
  const FILL = { en: ["um", "uh", "like", "actually", "basically", "you know", "kind of", "sort of"], bn: ["মানে", "আসলে", "ইয়ে", "উম", "আচ্ছা", "তো"] };
  let viva = { qs: [], i: 0, scores: [], t: null, left: 90 };

  $("#vivaStart").addEventListener("click", () => {
    const type = $("#vivaType").value, lang = $("#vivaLang").value;
    viva = { qs: [...Q[type][lang]], i: 0, scores: [], t: null, left: 90, lang };
    $("#vivaBox").hidden = false; $("#vivaSummary").hidden = true; showQ();
  });
  function showQ() {
    $("#qCount").textContent = `Question ${viva.i + 1} of ${viva.qs.length}`;
    $("#vivaQ").textContent = viva.qs[viva.i]; $("#vivaQ").classList.toggle("bn", viva.lang === "bn");
    $("#vivaA").value = ""; $("#vivaFb").hidden = true; $("#vivaSubmit").textContent = "Get feedback";
    clearInterval(viva.t); viva.left = 90; $("#vivaTimer").textContent = 90; $("#vivaTimer").classList.remove("low");
    viva.t = setInterval(() => { viva.left--; $("#vivaTimer").textContent = Math.max(0, viva.left); if (viva.left <= 15) $("#vivaTimer").classList.add("low"); if (viva.left <= 0) { clearInterval(viva.t); toast("Time! Wrap up your answer."); } }, 1000);
  }
  function scoreAnswer(text, lang) {
    const t = text.trim(), words = t ? t.split(/\s+/).length : 0, low = t.toLowerCase();
    let fillers = 0; [...new Set(FILL[lang].concat(FILL.en))].forEach((f) => { const m = low.match(new RegExp(`(^|[\\s,.।])${f}(?=[\\s,.।]|$)`, "g")); if (m) fillers += m.length; });
    const example = /\d|for example|for instance|e\.g\.|যেমন|উদাহরণ/.test(low);
    const sentences = t.split(/[.!?।]+/).filter((s) => s.trim().length > 3).length;
    const action = /\b(i (led|built|managed|organised|organized|created|solved|started|learned))\b|আমি .*(করেছি|শিখেছি|দিয়েছি)/.test(low);
    let s = words < 15 ? 1 : words < 35 ? 2.5 : words <= 170 ? 4 : 3;
    s += Math.max(0, 2 - fillers * 0.5); s += example ? 2 : 0.5; s += sentences >= 3 ? 1 : 0.3; s += action ? 1 : 0.2;
    s = Math.min(10, Math.round(s * 10) / 10);
    const good = [], bad = [];
    (words >= 35 && words <= 170) ? good.push(`Good length · ${words} words`) : bad.push(words < 35 ? `Too short · ${words} words` : `Too long · ${words} words`);
    fillers ? bad.push(`${fillers} filler word${fillers > 1 ? "s" : ""}`) : good.push("No filler words");
    example ? good.push("Gave a specific example") : bad.push("Add one real example or number");
    action ? good.push("Shows what YOU did") : bad.push("Say what you did: “I led…”");
    sentences >= 3 ? good.push("Clear structure") : bad.push("Use 3 short points");
    const tip = !example ? "Pick one real story: the situation, what you did, and the result with a number." : fillers > 1 ? "Pause instead of saying filler words. A 1-second silence sounds confident." : words < 35 ? "Add a second point and finish with why it matters for this role." : "Strong. Now say it out loud once more, a little slower.";
    return { s, good, bad, tip };
  }
  $("#vivaSubmit").addEventListener("click", () => {
    if (!$("#vivaFb").hidden) { viva.i++; if (viva.i >= viva.qs.length) return finishViva(); return showQ(); }
    const a = $("#vivaA").value; if (a.trim().length < 3) return toast("Answer first: type or tap the mic.");
    clearInterval(viva.t); const r = scoreAnswer(a, viva.lang); viva.scores.push(r.s);
    $("#vivaFb").innerHTML = `<div class="score" style="--s:${r.s}"><b>${r.s}</b><span>out of 10</span></div><div><div class="chips">${r.good.map((g) => `<span class="chip good">✓ ${g}</span>`).join("")}${r.bad.map((g) => `<span class="chip bad">! ${g}</span>`).join("")}</div><p><b>Try this:</b> ${r.tip}</p></div>`;
    $("#vivaFb").hidden = false; $("#vivaSubmit").textContent = viva.i + 1 < viva.qs.length ? "Next question →" : "See my summary";
  });
  function finishViva() {
    const avg = (viva.scores.reduce((a, b) => a + b, 0) / viva.scores.length).toFixed(1);
    $("#vivaBox").hidden = true; const sm = $("#vivaSummary"); sm.hidden = false;
    sm.innerHTML = `<h3>Session done · average ${avg}/10</h3><p>${avg >= 7 ? "You're ready to show up. Do one more round tomorrow morning." : "Good start. Run it again tonight and focus on one real example per answer."}</p><div class="row" style="margin-top:12px"><button class="btn gold" id="vivaAgain">Practise again</button><a class="btn ghost" href="#planner">Add viva to my 7-to-7 plan</a></div>`;
    $("#vivaAgain").addEventListener("click", () => $("#vivaStart").click());
    const h = store.get("vivaSessions", 0) + 1; store.set("vivaSessions", h);
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition; let rec = null;
  $("#micBtn").addEventListener("click", () => {
    if (!SR) return toast("Voice works in Chrome. You can type instead.");
    if (rec) { rec.stop(); return; }
    rec = new SR(); rec.lang = viva.lang === "bn" ? "bn-BD" : "en-US"; rec.interimResults = false; rec.continuous = true;
    rec.onresult = (e) => { for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) $("#vivaA").value += (($("#vivaA").value ? " " : "") + e.results[i][0].transcript); };
    rec.onend = () => { rec = null; $("#micBtn").textContent = "🎙 Speak"; };
    rec.onerror = () => toast("Mic not available. Type your answer.");
    rec.start(); $("#micBtn").textContent = "■ Stop";
  });

  /* ---------------- PLANNER ---------------- */
  function renderSlots() {
    const data = store.get("plan_" + todayKey(), {}), now = new Date().getHours();
    const defaults = { 7: "Brush · Day ON", 19: "এখনো ফ্রেশ? check-in" };
    $("#slots").innerHTML = Array.from({ length: 13 }, (_, i) => i + 7).map((h) => {
      const d = data[h] || { t: defaults[h] || "", done: false }, lab = `${h > 12 ? h - 12 : h}:00 ${h < 12 ? "am" : "pm"}`;
      return `<div class="slot ${d.done ? "done" : ""} ${h === now ? "now" : ""}" data-h="${h}"><time>${lab}</time><input value="${(d.t || "").replace(/"/g, "&quot;")}" placeholder="Add a plan…"><button title="Done">✓</button></div>`;
    }).join("");
    $$(".slot").forEach((el) => {
      const h = el.dataset.h, save = () => { const all = store.get("plan_" + todayKey(), {}); all[h] = { t: $("input", el).value, done: el.classList.contains("done") }; store.set("plan_" + todayKey(), all); dayProgress(); };
      $("input", el).addEventListener("change", save);
      $("button", el).addEventListener("click", () => { el.classList.toggle("done"); save(); });
    });
    dayProgress();
  }
  function dayProgress() {
    const d = store.get("plan_" + todayKey(), {}), planned = Object.values(d).filter((x) => x.t), done = planned.filter((x) => x.done);
    const p = planned.length ? Math.round((done.length / planned.length) * 100) : 0;
    $("#dayBar").style.width = p + "%"; $("#dayNote").textContent = planned.length ? `${done.length} of ${planned.length} plans done (${p}%)` : "Add your first plan to start.";
  }
  let focus = { left: 1500, t: null };
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  $("#focusGo").addEventListener("click", () => {
    if (focus.t) { clearInterval(focus.t); focus.t = null; $("#focusGo").textContent = "Resume"; return; }
    $("#focusGo").textContent = "Pause";
    focus.t = setInterval(() => { focus.left--; $("#focusT").textContent = fmt(focus.left); if (focus.left <= 0) { clearInterval(focus.t); focus.t = null; focus.left = 1500; $("#focusGo").textContent = "Start"; toast("25 minutes done. Take 5. 💧"); } }, 1000);
  });
  $("#focusReset").addEventListener("click", () => { clearInterval(focus.t); focus = { left: 1500, t: null }; $("#focusT").textContent = "25:00"; $("#focusGo").textContent = "Start"; });
  $("#checkIn").addEventListener("click", () => {
    const st = streak(), today = todayKey(), y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    if (st.last === today) { $("#checkMsg").textContent = "Already checked in today. See you tomorrow at 7."; return; }
    const n = st.last === y ? st.n + 1 : 1; store.set("streak", { n, last: today }); showStreak();
    $("#checkMsg").textContent = `Streak: ${n} day${n > 1 ? "s" : ""}. ${n % 28 === 0 ? "Day 28: time for a refill pack!" : "Brush before bed, see you at 7 am."}`;
    toast(`এখনো ফ্রেশ! ${bnNum(n)} দিনের স্ট্রিক`);
  });

  /* ---------------- FORECAST ---------------- */
  const CITIES = { Dhaka: [23.81, 90.41], Chattogram: [22.36, 91.78], Sylhet: [24.89, 91.87], Rajshahi: [24.37, 88.6], Khulna: [22.85, 89.54], Barishal: [22.7, 90.35], Rangpur: [25.74, 89.25], Mymensingh: [24.75, 90.41], Cumilla: [23.46, 91.18], Bogura: [24.85, 89.37], "Cox's Bazar": [21.43, 92.0], Jashore: [23.17, 89.21] };
  $("#city").innerHTML = Object.keys(CITIES).map((c) => `<option>${c}</option>`).join("");
  $("#city").value = store.get("city", "Dhaka");
  $("#fcGo").addEventListener("click", async () => {
    const c = $("#city").value, [lat, lon] = CITIES[c]; store.set("city", c);
    $("#fcGo").disabled = true; $("#fcGo").textContent = "Checking the sky…";
    let w;
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,precipitation_probability_max&timezone=Asia%2FDhaka&forecast_days=1`);
      const j = await r.json();
      w = { t: Math.round(j.current.temperature_2m), h: j.current.relative_humidity_2m, rain: j.daily.precipitation_probability_max[0], max: Math.round(j.daily.temperature_2m_max[0]), wind: Math.round(j.current.wind_speed_10m), live: true };
    } catch { w = { t: 31, h: 78, rain: 40, max: 33, wind: 9, live: false }; }
    $("#fcGo").disabled = false; $("#fcGo").textContent = "Get today's forecast";
    const line = w.rain >= 60 ? "বৃষ্টি নামে, ফ্রেশনেস থামে না।" : w.max >= 33 ? `গরম ${bnNum(w.max)}°? ফ্রেশনেস তবু ১২ ঘণ্টা।` : w.h >= 80 ? "ভ্যাপসা দিন, তবু কথা হোক কাছে থেকে।" : w.t <= 18 ? "শীতের সকাল, ব্রাশ ডান, দিন ON।" : "আজকের দিন একদম ON।";
    const tips = [[w.rain >= 50 ? "☔" : "🧢", w.rain >= 50 ? `Rain chance ${w.rain}%: carry an umbrella, leave 20 min early.` : `Rain chance ${w.rain}%: a cap and water bottle are enough.`],
      ["💧", w.max >= 32 ? `Up to ${w.max}°C: drink water every hour.` : `Up to ${w.max}°C: a comfortable day to be out.`],
      ["🕖", "Brush at 7 am, check in at 7 pm on ZenBuddy."], ["🌙", "Brush again before bed to start tomorrow fresh."]];
    $("#fcOut").innerHTML = `<div class="fc-big"><small>${c} · ${w.live ? "live now" : "sample (offline)"}</small><div class="t">${w.t}°C</div><div>Humidity ${w.h}% · wind ${w.wind} km/h · rain ${w.rain}%</div><div class="line">${line}</div></div><div class="fc-tips">${tips.map(([e, t]) => `<div class="fc-tip"><span class="e">${e}</span><span>${t}</span></div>`).join("")}</div>`;
    $("#fcOut").hidden = false;
  });

  /* ---------------- VOLUNTEER ---------------- */
  const DRIVES = [
    { id: 1, div: "Rangpur", t: "Winter blanket drive", org: "Sabuj Haat Youth Group", date: "12 Dec", hrs: 6, slots: 40 },
    { id: 2, div: "Rajshahi", t: "Cold-wave relief packing", org: "Padma Shapla Volunteers", date: "19 Dec", hrs: 5, slots: 30 },
    { id: 3, div: "Dhaka", t: "Kids' brushing game · Smile Camp, Savar", org: "ZenBuddy Campus Club", date: "24 Sep", hrs: 6, slots: 20 },
    { id: 4, div: "Sylhet", t: "Flood relief packing", org: "Surma Youth Network", date: "On alert", hrs: 4, slots: 50 },
    { id: 5, div: "Chattogram", t: "Beach clean-up", org: "Karnaphuli Green Team", date: "16 Jan", hrs: 4, slots: 60 },
    { id: 6, div: "Khulna", t: "Eid food packs for families", org: "Rupsha Seba Shongho", date: "Eid week", hrs: 5, slots: 35 },
    { id: 7, div: "Barishal", t: "School library painting", org: "Kirtankhola Readers", date: "6 Feb", hrs: 6, slots: 25 },
    { id: 8, div: "Mymensingh", t: "Kids' brushing game · Smile Camp, Muktagachha", org: "ZenBuddy Campus Club", date: "12 Nov", hrs: 6, slots: 20 },
  ];
  const vState = () => store.get("vol", {});
  $("#vDiv").innerHTML += [...new Set(DRIVES.map((d) => d.div))].map((d) => `<option>${d}</option>`).join("");
  $("#vDiv").addEventListener("change", renderDrives);
  function renderDrives() {
    const st = vState(), f = $("#vDiv").value;
    $("#drives").innerHTML = DRIVES.filter((d) => f === "all" || d.div === f).map((d) => {
      const s = st[d.id];
      const badge = s === "ok" ? `<span class="badge ok">✓ ${d.hrs} h verified</span>` : s === "pend" ? `<span class="badge pend">Joined · awaiting check-in</span>` : `<span class="badge">${d.slots} slots</span>`;
      const act = s === "ok" ? "" : s === "pend" ? `<div class="row" style="margin:6px 0 0"><input placeholder="Lead's code" class="code" style="width:130px;padding:8px 10px"><button class="btn primary verify">Check in</button></div><span class="muted small" style="margin:0">Demo code: ON2026</span>` : `<button class="btn primary join">Join drive</button>`;
      return `<div class="drive" data-id="${d.id}">${badge}<h4>${d.t}</h4><div class="meta">${d.org} · ${d.div}</div><div class="meta">📅 ${d.date} · ⏱ ${d.hrs} hours</div>${act}</div>`;
    }).join("");
    $$(".drive").forEach((el) => {
      const id = el.dataset.id, s = vState();
      $(".join", el)?.addEventListener("click", () => { s[id] = "pend"; store.set("vol", s); renderDrives(); toast("Joined! Show your phone to the group lead on the day."); });
      $(".verify", el)?.addEventListener("click", () => { if ($(".code", el).value.trim().toUpperCase() !== "ON2026") return toast("Code not right. Ask your group lead."); s[id] = "ok"; store.set("vol", s); renderDrives(); toast("Hours verified. You showed up! 🙌"); });
    });
    const s = vState(), hrs = DRIVES.filter((d) => s[d.id] === "ok").reduce((a, d) => a + d.hrs, 0);
    $("#vHours").textContent = hrs; $("#vDrives").textContent = Object.keys(s).length; $("#vPending").textContent = Object.values(s).filter((x) => x === "pend").length;
  }
  renderDrives();
  const logo = new Image(); logo.src = "assets/logo-white.png";
  $("#certGo").addEventListener("click", () => {
    const name = $("#certName").value.trim(); if (!name) return toast("Type your name first.");
    const s = vState(), done = DRIVES.filter((d) => s[d.id] === "ok"), hrs = done.reduce((a, d) => a + d.hrs, 0);
    if (!hrs) return toast("Verify at least one drive to get a certificate.");
    const cv = $("#certCanvas"), x = cv.getContext("2d"), W = cv.width, H = cv.height;
    x.fillStyle = "#063D22"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#fff"; roundRect(x, 40, 40, W - 80, H - 80, 36); x.fill();
    x.strokeStyle = "#FFC83D"; x.lineWidth = 10; roundRect(x, 70, 70, W - 140, H - 140, 28); x.stroke();
    x.fillStyle = "#0E8A43"; roundRect(x, W / 2 - 150, 110, 300, 90, 20); x.fill();
    try { x.drawImage(logo, W / 2 - 120, 125, 240, 240 * logo.height / logo.width); } catch { /* logo not loaded */ }
    x.textAlign = "center"; x.fillStyle = "#063D22"; x.font = "700 54px Poppins";
    x.fillText("Certificate of Service", W / 2, 290);
    x.fillStyle = "#5E6E65"; x.font = "400 26px Poppins"; x.fillText("This certifies that", W / 2, 350);
    x.fillStyle = "#0E8A43"; x.font = "700 64px Poppins"; x.fillText(name, W / 2, 430);
    x.fillStyle = "#13231A"; x.font = "500 28px Poppins"; x.fillText(`gave ${hrs} verified hours across ${done.length} drive${done.length > 1 ? "s" : ""}:`, W / 2, 500);
    x.fillStyle = "#5E6E65"; x.font = "400 22px Poppins"; done.slice(0, 3).forEach((d, i) => x.fillText(`${d.t} · ${d.org}`, W / 2, 545 + i * 34));
    x.fillStyle = "#063D22"; x.font = "600 24px Poppins"; x.fillText(`Issued ${new Date().toLocaleDateString("en-GB")} · ZB-${Date.now().toString(36).toUpperCase().slice(-6)}`, W / 2, 700);
    x.fillStyle = "#0E8A43"; x.font = "700 26px 'Noto Sans Bengali'"; x.fillText("সারাদিন সবার জন্য রেডি", W / 2, 745);
    cv.hidden = false; const dl = $("#certDl"); dl.href = cv.toDataURL("image/png"); dl.hidden = false; toast("Certificate ready!");
  });
  function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  /* ---------------- SMILE CAMPS ---------------- */
  const CAMP = [["Dhaka", "Savar", "2027-09-24"], ["Dhaka", "Narsingdi Sadar", "2027-09-25"], ["Chattogram", "Hathazari", "2027-10-01"], ["Chattogram", "Cumilla Sadar Dakshin", "2027-10-02"], ["Rajshahi", "Paba", "2027-10-08"], ["Rajshahi", "Sherpur, Bogura", "2027-10-09"], ["Khulna", "Jhikargacha", "2027-10-15"], ["Khulna", "Kushtia Sadar", "2027-10-16"], ["Barishal", "Bakerganj", "2027-10-22"], ["Barishal", "Patuakhali Sadar", "2027-10-23"], ["Sylhet", "Beanibazar", "2027-10-29"], ["Sylhet", "Moulvibazar Sadar", "2027-10-30"], ["Rangpur", "Mithapukur", "2027-11-05"], ["Rangpur", "Saidpur", "2027-11-06"], ["Mymensingh", "Muktagachha", "2027-11-12"], ["Mymensingh", "Jamalpur Sadar", "2027-11-13"]];
  $("#cDiv").innerHTML = `<option value="all">All divisions</option>` + [...new Set(CAMP.map((c) => c[0]))].map((d) => `<option>${d}</option>`).join("");
  $("#cDiv").addEventListener("change", renderCamps);
  function renderCamps() {
    const f = $("#cDiv").value;
    $("#campList").innerHTML = CAMP.map((c, i) => [c, i]).filter(([c]) => f === "all" || c[0] === f).map(([[d, u, date], i]) => {
      const dt = new Date(date + "T09:00:00"), nice = dt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
      return `<div class="camp"><span class="badge">${d}</span><h4>${u} Upazila</h4><div class="meta">📅 ${nice} · 9 am – 4 pm</div><div class="meta">Free check-up · kids' brushing game · family kit</div><div class="row" style="margin:6px 0 0"><button class="btn primary ics" data-i="${i}">Add to calendar</button><button class="btn ghost share" data-i="${i}">Share</button></div></div>`;
    }).join("");
    $$(".ics").forEach((b) => b.addEventListener("click", () => {
      const [d, u, date] = CAMP[b.dataset.i], ymd = date.replace(/-/g, "");
      const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ZenBuddy//Smile Camp//EN", "BEGIN:VEVENT", `UID:zb-${ymd}-${b.dataset.i}@zenbuddy`, `DTSTAMP:${ymd}T000000Z`, `DTSTART;TZID=Asia/Dhaka:${ymd}T090000`, `DTEND;TZID=Asia/Dhaka:${ymd}T160000`, `SUMMARY:Zenfresh Smile Camp · ${u}`, `LOCATION:${u} Upazila, ${d}`, "DESCRIPTION:Free oral check-up for the whole family by a partner dental team.", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = `smile-camp-${u.replace(/\W+/g, "-")}.ics`; a.click(); toast("Saved to calendar file.");
    }));
    $$(".share").forEach((b) => b.addEventListener("click", async () => {
      const [, u, date] = CAMP[b.dataset.i], text = `Free family dental check-up at the Zenfresh Smile Camp, ${u} Upazila, ${date}, 9 am–4 pm.`;
      if (navigator.share) { try { await navigator.share({ title: "Smile Camp", text, url: location.href }); } catch { /* cancelled */ } }
      else window.open("https://wa.me/?text=" + encodeURIComponent(text + " " + location.href), "_blank");
    }));
  }
  renderCamps();

  route();
})();
