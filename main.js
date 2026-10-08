(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const LINKEDIN = "https://www.linkedin.com/in/gregoire-nkoussa-452097198/";

  /* ---------- logos (Simple Icons, tinted with the brand color) ---------- */
  const LOGOS = {
    java: ["openjdk", "#ED8B00"], spring: ["springboot", "#6DB33F"], springboot: ["springboot", "#6DB33F"], angular: ["angular", "#DD0031"],
    react: ["react", "#149ECA"], kotlin: ["kotlin", "#7F52FF"], typescript: ["typescript", "#3178C6"], node: ["nodedotjs", "#5FA04E"],
    kafka: ["apachekafka", null], rabbitmq: ["rabbitmq", "#FF6600"], postgresql: ["postgresql", "#4169E1"], mysql: ["mysql", "#4479A1"],
    mongodb: ["mongodb", "#47A248"], docker: ["docker", "#2496ED"], kubernetes: ["kubernetes", "#326CE5"], helm: ["helm", "#277A9F"],
    terraform: ["terraform", "#844FBA"], aws: ["amazonwebservices", "#FF9900"], azure: ["microsoftazure", "#0078D4"], gcp: ["googlecloud", "#4285F4"],
    gitlab: ["gitlab", "#FC6D26"], github: ["github", null], grafana: ["grafana", "#F46800"], elastic: ["elasticsearch", "#00BFB3"],
    opentelemetry: ["opentelemetry", "#7F8CF0"], git: ["git", "#F05032"], jira: ["jira", "#2684FF"], intellij: ["intellijidea", "#FE315D"],
    copilot: ["githubcopilot", null], claude: ["claude", "#D97757"], gemini: ["googlegemini", "#8E75B2"], liquibase: ["liquibase", "#2962FF"],
    cypress: ["cypress", "#69D3A7"], jest: ["jest", "#C21325"], swagger: ["swagger", "#85EA2D"], postman: ["postman", "#FF6C37"],
    junit: ["junit5", "#25A162"], android: ["android", "#3DDC84"], linkedin: ["linkedin", "#0A66C2"]
  };
  const NAME2LOGO = [["angular", "angular"], ["react", "react"], ["kotlin", "kotlin"], ["typescript", "typescript"], ["spring", "spring"], ["java", "java"],
    ["kafka", "kafka"], ["rabbit", "rabbitmq"], ["postgres", "postgresql"], ["mysql", "mysql"], ["mongo", "mongodb"], ["docker", "docker"],
    ["kubernetes", "kubernetes"], ["k8s", "kubernetes"], ["cronjob", "kubernetes"], ["helm", "helm"], ["terraform", "terraform"],
    ["aws", "aws"], ["lambda", "aws"], ["eventbridge", "aws"], ["cloudfront", "aws"], ["kinesis", "aws"], ["ecs", "aws"], ["s3 ", "aws"],
    ["azure", "azure"], ["gcp", "gcp"], ["gke", "gcp"], ["gitlab", "gitlab"], ["grafana", "grafana"], ["elk", "elastic"], ["elastic", "elastic"],
    ["opentelemetry", "opentelemetry"], ["jira", "jira"], ["liquibase", "liquibase"], ["cypress", "cypress"], ["jest", "jest"], ["swagger", "swagger"],
    ["junit", "junit"], ["claude", "claude"], ["gemini", "gemini"], ["junie", "intellij"], ["copilot", "copilot"], ["android", "android"],
    ["github", "github"], ["git", "git"]];
  const logoKey = (name) => { const n = name.toLowerCase() + " "; const hit = NAME2LOGO.find(([k]) => n.includes(k)); return hit ? hit[1] : null; };
  function paint(el, key) {
    const d = LOGOS[key]; if (!d) return;
    el.classList.add("lg");
    el.style.setProperty("--c", d[1] || "var(--fg)");
    const u = `url(assets/logos/${d[0]}.svg)`;
    el.style.setProperty("-webkit-mask-image", u); el.style.setProperty("mask-image", u);
  }
  const logoEl = (key) => { const i = document.createElement("i"); i.setAttribute("aria-hidden", "true"); paint(i, key); return i; };
  const paintAll = (root = document) => $$("[data-logo]", root).forEach((el) => paint(el, el.dataset.logo));

  /* ---------- i18n ---------- */
  const FR = {};
  $$("[data-i18n],[data-i18n-html]").forEach((el) => {
    const html = el.hasAttribute("data-i18n-html");
    FR[el.dataset.i18n || el.dataset.i18nHtml] = html ? el.innerHTML : el.textContent;
  });
  const UI = {
    fr: { theme: { auto: "Thème : automatique (système)", dark: "Thème : sombre", light: "Thème : clair" }, install: "Installer l'application",
          update: "Nouvelle version disponible", reload: "Recharger", offline: "Vous êtes hors ligne : le site reste consultable.", online: "De retour en ligne.", installed: "Application installée ✔" },
    en: { theme: { auto: "Theme: automatic (system)", dark: "Theme: dark", light: "Theme: light" }, install: "Install the app",
          update: "A new version is available", reload: "Reload", offline: "You're offline: the site stays available.", online: "Back online.", installed: "App installed ✔" }
  };
  let lang = (navigator.language || "fr").toLowerCase().startsWith("fr") ? "fr" : "en";
  try { const stored = localStorage.getItem("beaztcode-lang"); if (stored === "fr" || stored === "en") lang = stored; } catch (e) {}
  const D = () => DATA[lang];
  const T = () => UI[lang];

  function applyStatic() {
    document.documentElement.lang = lang;
    $$("[data-i18n],[data-i18n-html]").forEach((el) => {
      const html = el.hasAttribute("data-i18n-html");
      const key = el.dataset.i18n || el.dataset.i18nHtml;
      const v = lang === "fr" ? FR[key] : EN[key];
      if (v == null) return;
      if (html) el.innerHTML = v; else el.textContent = v;
    });
    document.title = D().title;
    $('meta[name="description"]').setAttribute("content", D().desc);
    $$(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    updateThemeBtn();
    const ib = $("#installBtn"); ib.title = T().install; ib.setAttribute("aria-label", T().install);
  }
  function setLang(l) {
    lang = l;
    try { localStorage.setItem("beaztcode-lang", l); } catch (e) {}
    applyStatic(); buildLayers(sel); buildTimeline(); buildAgents(); restartRot(); buildHeroStats(); buildWorks(); buildEmployers(); buildCerts();
  }
  $$(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

  /* ---------- theme (auto / dark / light) ---------- */
  const ICON = { auto: "◐", dark: "☾", light: "☀" };
  function updateThemeBtn() {
    const m = BeaztTheme.get(), b = $("#themeBtn");
    b.textContent = ICON[m]; b.title = T().theme[m]; b.setAttribute("aria-label", T().theme[m]);
  }
  $("#themeBtn").addEventListener("click", () => {
    const order = ["auto", "dark", "light"];
    BeaztTheme.set(order[(order.indexOf(BeaztTheme.get()) + 1) % 3]);
    updateThemeBtn();
  });
  matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => { if (BeaztTheme.get() === "auto") BeaztTheme.sync(); });
  BeaztTheme.sync();

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg, action, cb, ms = 4500) {
    const t = $("#toast"); t.textContent = ""; t.hidden = false;
    t.append(document.createTextNode(msg));
    if (action) { const b = document.createElement("button"); b.type = "button"; b.textContent = action; b.addEventListener("click", cb); t.append(b); }
    clearTimeout(toastTimer);
    if (ms) toastTimer = setTimeout(() => { t.hidden = true; }, ms);
  }

  /* ---------- rotating word ---------- */
  let rotTimer, rotI = 0;
  function restartRot() {
    clearTimeout(rotTimer); rotI = 0;
    const el = $("#rot"), words = D().rot;
    if (RM) { el.textContent = words[0]; return; }
    let txt = "", del = false;
    const tick = () => {
      const w = words[rotI % words.length];
      txt = del ? w.slice(0, txt.length - 1) : w.slice(0, txt.length + 1);
      el.textContent = txt;
      let delay = del ? 35 : 75;
      if (!del && txt === w) { del = true; delay = 1500; }
      else if (del && txt === "") { del = false; rotI++; delay = 300; }
      rotTimer = setTimeout(tick, delay);
    };
    tick();
  }

  /* ---------- background network ---------- */
  (() => {
    if (RM) return;
    const c = $("#bg"), ctx = c.getContext("2d");
    let w, h, pts = [], mx = -999, my = -999, ca, cb, running = true;
    const rc = () => { ca = css("--a"); cb = css("--b"); };
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(110, (w * h) / 16000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 }));
    };
    addEventListener("resize", resize);
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener("themechange", rc);
    document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) frame(); });
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      const light = BeaztTheme.effective() === "light";
      for (const p of pts) {
        const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
        if (d < 140) { p.vx += (dx / d) * .02; p.vy += (dy / d) * .02; }
        p.vx *= .995; p.vy *= .995;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 130) { ctx.globalAlpha = (1 - d / 130) * (light ? .28 : .35); ctx.strokeStyle = ca; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
        ctx.globalAlpha = light ? .6 : .8; ctx.fillStyle = i % 5 === 0 ? cb : ca; ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 7); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    rc(); resize(); frame();
  })();

  /* ---------- reveal, progress, counters ---------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
  $$(".reveal").forEach((el) => io.observe(el));
  addEventListener("scroll", () => {
    const h = document.documentElement;
    $("#progress").style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100 + "%";
  }, { passive: true });
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, suf = el.dataset.suffix || "";
    if (RM) { el.textContent = to + suf; return; }
    const t0 = performance.now();
    const step = (t) => { const k = Math.min((t - t0) / 1400, 1), v = Math.round(to * (1 - Math.pow(1 - k, 3))); el.textContent = v + suf; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  $$("[data-count]").forEach((el) => cio.observe(el));

  /* ---------- stack layers ---------- */
  let sel = 0, tour = null, userTouched = false, stackVisible = false;
  const layersEl = $("#layers"), panel = $("#panel");
  const packet = document.createElement("i"); packet.className = "packet"; packet.setAttribute("aria-hidden", "true");
  function buildLayers(keep) {
    layersEl.textContent = "";
    D().layers.forEach((L, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "layer"; b.setAttribute("role", "tab");
      const ic = document.createElement("span"); ic.className = "ic"; ic.textContent = L.icon;
      const tx = document.createElement("span"); const n = document.createElement("b"); n.textContent = L.name; const s = document.createElement("small"); s.textContent = L.tag;
      tx.append(n, s); b.append(ic, tx);
      b.addEventListener("click", () => { userTouched = true; select(i); });
      b.addEventListener("mouseenter", () => { userTouched = true; });
      layersEl.append(b);
    });
    layersEl.append(packet);
    select(keep || 0, true);
  }
  function select(i, quiet) {
    sel = i;
    const bs = $$(".layer", layersEl);
    bs.forEach((b, k) => { b.classList.toggle("on", k === i); b.setAttribute("aria-selected", String(k === i)); });
    const b = bs[i];
    packet.style.top = b.offsetTop + b.offsetHeight / 2 - 6 + "px";
    if (!quiet) { b.classList.remove("pulse"); void b.offsetWidth; b.classList.add("pulse"); }
    const L = D().layers[i];
    panel.textContent = "";
    const h = document.createElement("h3"); h.textContent = L.icon + " " + L.name;
    const tag = document.createElement("span"); tag.className = "tag"; tag.textContent = L.tag;
    const p = document.createElement("p"); p.textContent = L.text;
    const ul = document.createElement("ul"); L.pts.forEach((t) => { const li = document.createElement("li"); li.textContent = t; ul.append(li); });
    const tech = document.createElement("div"); tech.className = "tech";
    L.tech.forEach((t, k) => { const s = document.createElement("span"); const lk = logoKey(t); if (lk) s.append(logoEl(lk)); s.append(document.createTextNode(t)); s.style.animationDelay = k * 45 + "ms"; tech.append(s); });
    panel.append(h, tag, p, ul, tech);
  }
  new IntersectionObserver((es) => { stackVisible = es[0].isIntersecting; }, { threshold: .3 }).observe($("#stack"));
  tour = setInterval(() => { if (!userTouched && stackVisible && !RM) select((sel + 1) % D().layers.length); }, 2600);
  addEventListener("resize", () => select(sel, true));

  /* ---------- import simulation ---------- */
  const fmtBad = (m) => `${Math.floor(m / 60)} h ${String(Math.floor(m % 60)).padStart(2, "0")}`;
  function graph(cv, data, color) {
    const ctx = cv.getContext("2d"), W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(128,140,160,.25)"; ctx.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach((y) => { ctx.beginPath(); ctx.moveTo(0, H * y); ctx.lineTo(W, H * y); ctx.stroke(); });
    if (data.length < 2) return;
    ctx.beginPath();
    data.forEach((v, i) => { const x = (i / 119) * W, y = H - (v / 100) * (H - 4) - 2; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    ctx.lineTo(((data.length - 1) / 119) * W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.globalAlpha = .15; ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha = 1;
  }
  let simRunning = false;
  function runSim() {
    if (simRunning) return; simRunning = true;
    const DUR = RM ? 1500 : 8400, MIN_PER_MS = 120 / DUR, GOOD_DONE = 20 / MIN_PER_MS;
    const bad = [], good = []; let rst = 0, pBad = 0, lastOom = -1;
    const lane = $(".lane.bad"), btn = $("#runSim"); btn.disabled = true;
    $("#rst").textContent = "0";
    const oomAt = [0.34, 0.62, 0.86];
    const t0 = performance.now(); let lastS = 0, lastT = 0;
    const redBad = css("--red"), grn = css("--green");
    const frame = (now) => {
      const t = now - t0, k = Math.min(t / DUR, 1);
      // good lane
      const pGood = Math.min(t / GOOD_DONE, 1);
      $("#barGood").style.width = pGood * 100 + "%";
      $("#tGood").textContent = Math.round(Math.min(t * MIN_PER_MS, 20)) + " " + D().sim.min;
      // bad lane
      pBad = Math.min(pBad + (t - lastT) * (0.8 / DUR) * 1.15, 0.95); lastT = t;
      if (lastOom + 1 < oomAt.length && k >= oomAt[lastOom + 1]) { lastOom++; rst++; pBad *= 0.45; $("#rst").textContent = rst; lane.classList.remove("shake"); void lane.offsetWidth; lane.classList.add("shake"); }
      $("#barBad").style.width = pBad * 100 + "%";
      $("#tBad").textContent = fmtBad(t * MIN_PER_MS);
      // cpu graphs, sampled ~15/s
      if (t - lastS > 66) {
        lastS = t;
        const oomNow = lastOom >= 0 && k - oomAt[lastOom] < 0.015;
        const cpuB = oomNow ? 6 : Math.min(100, 30 + k * 85 + Math.random() * 14);
        const wave = pGood < 1 ? 36 + Math.sin(t / 130) * 9 + Math.random() * 6 : 4 + Math.random() * 3;
        bad.push(cpuB); good.push(wave); if (bad.length > 120) { bad.shift(); good.shift(); }
        $("#cpuBadV").textContent = Math.round(cpuB); $("#cpuGoodV").textContent = Math.round(wave);
        graph($("#cpuBad"), bad, redBad); graph($("#cpuGood"), good, grn);
      }
      if (k < 1) requestAnimationFrame(frame);
      else { simRunning = false; btn.disabled = false; toast(D().sim.note_done); }
    };
    requestAnimationFrame(frame);
  }
  $("#runSim").addEventListener("click", runSim);

  /* ---------- timeline ---------- */
  const openSet = new Set([0]);
  function buildTimeline() {
    const root = $("#timeline"); root.textContent = "";
    D().missions.forEach((m, i) => {
      const art = document.createElement("article"); art.className = "mission" + (openSet.has(i) ? " open" : "");
      const bt = document.createElement("button"); bt.type = "button"; bt.setAttribute("aria-expanded", String(openSet.has(i)));
      const tile = employerTile(m.who);
      const head = document.createElement("span");
      const when = document.createElement("span"); when.className = "when"; when.textContent = m.when;
      const h = document.createElement("h3"); h.textContent = m.role;
      const who = document.createElement("span"); who.className = "who"; who.textContent = m.who + " · " + m.sector;
      head.append(when, h, who);
      const left = document.createElement("span"); left.className = "mleft"; left.append(tile, head);
      const plus = document.createElement("span"); plus.className = "plus"; plus.textContent = "+"; plus.setAttribute("aria-hidden", "true");
      bt.append(left, plus);
      const body = document.createElement("div"); body.className = "body";
      const wrap = document.createElement("div"); const inner = document.createElement("div"); inner.className = "inner";
      const p = document.createElement("p"); p.textContent = m.sum;
      const ul = document.createElement("ul"); m.hi.forEach((t) => { const li = document.createElement("li"); li.textContent = t; ul.append(li); });
      const tech = document.createElement("div"); tech.className = "tech"; m.tech.forEach((t) => { const s = document.createElement("span"); const lk = logoKey(t); if (lk) s.append(logoEl(lk)); s.append(document.createTextNode(t)); tech.append(s); });
      inner.append(p, ul, tech); wrap.append(inner); body.append(wrap);
      art.append(bt, body); root.append(art);
      bt.addEventListener("click", () => {
        const o = !art.classList.contains("open");
        art.classList.toggle("open", o); bt.setAttribute("aria-expanded", String(o));
        o ? openSet.add(i) : openSet.delete(i);
      });
    });
  }

  /* ---------- BMAD agents ---------- */
  let agentI = 0, agentTimer;
  function buildAgents() {
    const ol = $("#agents"); ol.textContent = "";
    D().agents.forEach(([n, d]) => { const li = document.createElement("li"); const b = document.createElement("b"); b.textContent = n; const s = document.createElement("span"); s.textContent = d; li.append(b, s); ol.append(li); });
    clearInterval(agentTimer);
    if (!RM) agentTimer = setInterval(() => { const l = $$("li", ol); l.forEach((x, k) => x.classList.toggle("act", k === agentI % l.length)); agentI++; }, 1100);
  }

  /* ---------- matrix easter egg ---------- */
  let matrixOn = false, matrixTimer;
  function matrix(on) {
    const box = $("#matrix");
    if (on === matrixOn) return; matrixOn = on;
    box.classList.toggle("on", on); box.style.pointerEvents = on ? "auto" : "none";
    if (!on) { clearInterval(matrixTimer); box.textContent = ""; return; }
    const cv = document.createElement("canvas"); box.append(cv);
    const ctx = cv.getContext("2d"); cv.width = innerWidth; cv.height = innerHeight;
    const cols = Math.floor(cv.width / 16), drops = Array(cols).fill(0).map(() => Math.random() * -50);
    const chars = "ｱｲｳｴｵｶｷｸｹｺ01{}</>$#@Java=>K8s";
    matrixTimer = setInterval(() => {
      ctx.fillStyle = "rgba(0,0,0,.08)"; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = "#2ee6c5"; ctx.font = "16px monospace";
      drops.forEach((y, i) => { ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 16, y * 16); drops[i] = y * 16 > cv.height && Math.random() > .975 ? 0 : y + 1; });
    }, 45);
    toast(D().kon, null, null, 2500);
    setTimeout(() => matrix(false), 9000);
  }
  $("#matrix").addEventListener("click", () => matrix(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape") matrix(false); });
  $("#surprise").addEventListener("click", () => matrix(true));
  const KON = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]; let kp = 0;
  addEventListener("keydown", (e) => { kp = e.key === KON[kp] ? kp + 1 : (e.key === KON[0] ? 1 : 0); if (kp === KON.length) { kp = 0; matrix(true); } });

  /* ---------- terminal ---------- */
  (() => {
    const body = $("#tbody"), inp = $("#tin"), hist = []; let hi = 0;
    const out = (txt, cls) => { const d = document.createElement("div"); if (cls) d.className = cls; d.textContent = txt; body.append(d); body.scrollTop = body.scrollHeight; };
    const CMDS = ["help", "whoami", "skills", "stack", "missions", "ai", "lead", "contact", "linkedin", "lang", "theme", "matrix", "clear", "sudo"];
    const open = () => window.open(LINKEDIN, "_blank", "noopener");
    function run(line) {
      const raw = line.trim(); if (!raw) return;
      out("beaztcode@portfolio:~$ " + raw, "cmd");
      hist.push(raw); hi = hist.length;
      const [c, ...a] = raw.toLowerCase().split(/\s+/), t = D().term;
      switch (c) {
        case "clear": body.textContent = ""; break;
        case "lang": if (a[0] === "fr" || a[0] === "en") { setLang(a[0]); out("lang = " + a[0], "ok"); } else out("usage: lang fr|en", "err"); break;
        case "theme": if (["auto", "dark", "light"].includes(a[0])) { BeaztTheme.set(a[0]); updateThemeBtn(); out("theme = " + a[0], "ok"); } else out("usage: theme auto|dark|light", "err"); break;
        case "matrix": matrix(true); break;
        case "linkedin": out(t.linkedin, "ok"); open(); break;
        case "sudo": if (a.join(" ") === "hire beaztcode") { out(t.hire, "ok"); setTimeout(open, 700); } else out(t.sudo, "err"); break;
        default: if (t[c] && ["help", "whoami", "skills", "stack", "missions", "ai", "lead", "contact"].includes(c)) out(t[c]); else out(t.nf + c, "err");
      }
    }
    out(D().term.welcome, "ok");
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { run(inp.value); inp.value = ""; }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (hi > 0) inp.value = hist[--hi]; }
      else if (e.key === "ArrowDown") { e.preventDefault(); hi = Math.min(hi + 1, hist.length); inp.value = hist[hi] || ""; }
      else if (e.key === "Tab") { e.preventDefault(); const m = CMDS.filter((x) => x.startsWith(inp.value.toLowerCase())); if (m.length === 1) inp.value = m[0]; }
      else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); body.textContent = ""; }
    });
    $("#term").addEventListener("click", () => { if (!getSelection().toString()) inp.focus({ preventScroll: true }); });
  })();


  /* ---------- hero extras: avatar, orbit, stats, marquee ---------- */
  function buildHeroStats() {
    const box = $("#heroStats"); box.textContent = "";
    D().kpis.forEach(([n, l]) => { const d = document.createElement("div"); const b = document.createElement("b"); b.textContent = n; const sp = document.createElement("span"); sp.textContent = l; d.append(b, sp); box.append(d); });
  }
  (() => {
    const img = $("#avatarImg"), test = new Image();
    test.onload = () => { img.src = "assets/avatar.jpg"; }; test.src = "assets/avatar.jpg";   // drop a photo at assets/avatar.jpg to replace the monogram
    const orbit = $("#orbit"), keys = ["java", "angular", "kubernetes", "kafka", "terraform", "aws", "docker", "grafana"];
    keys.forEach((k, i) => {
      const a = document.createElement("span"); a.className = "ob"; a.style.setProperty("--a", (360 / keys.length) * i + "deg");
      const inner = document.createElement("span"); inner.append(logoEl(k)); a.append(inner); orbit.append(a);
    });
    const rows = [["java", "spring", "angular", "react", "kotlin", "typescript", "kafka", "rabbitmq", "postgresql", "mysql", "mongodb", "liquibase", "junit"],
                  ["docker", "kubernetes", "helm", "terraform", "aws", "azure", "gcp", "gitlab", "grafana", "opentelemetry", "elastic", "git", "claude", "gemini"]];
    const NAMES = { java: "Java", spring: "Spring Boot", angular: "Angular", react: "React", kotlin: "Kotlin", typescript: "TypeScript", kafka: "Kafka", rabbitmq: "RabbitMQ", postgresql: "PostgreSQL", mysql: "MySQL", mongodb: "MongoDB", liquibase: "Liquibase", junit: "JUnit", docker: "Docker", kubernetes: "Kubernetes", helm: "Helm", terraform: "Terraform", aws: "AWS", azure: "Azure", gcp: "Google Cloud", gitlab: "GitLab", grafana: "Grafana", opentelemetry: "OpenTelemetry", elastic: "Elastic", git: "Git", claude: "Claude Code", gemini: "Gemini CLI" };
    ["#mq1", "#mq2"].forEach((sel2, r) => {
      const box = $(sel2), track = document.createElement("div"); track.className = "track";
      for (let rep = 0; rep < 2; rep++) rows[r].forEach((k) => { const it = document.createElement("span"); it.className = "mqi"; it.append(logoEl(k), document.createTextNode(NAMES[k])); if (rep) it.setAttribute("aria-hidden", "true"); track.append(it); });
      box.append(track);
    });
  })();

  /* ---------- selected work (filterable cards) ---------- */
  let filter = "all";
  function buildWorks() {
    const f = $("#filters"); f.textContent = "";
    Object.entries(D().filters).forEach(([k, label]) => {
      const b = document.createElement("button"); b.type = "button"; b.textContent = label; b.setAttribute("aria-pressed", String(k === filter));
      b.addEventListener("click", () => { filter = k; $$("#filters button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); applyFilter(); });
      f.append(b);
    });
    const box = $("#cards"); box.textContent = "";
    D().works.forEach((w) => {
      const c = document.createElement(w.href ? "a" : "article"); c.className = "card"; c.dataset.cat = w.cat.join(" ");
      if (w.href) { c.href = w.href; c.target = "_blank"; c.rel = "noopener"; }
      const top = document.createElement("div"); top.className = "ctop";
      const ic = document.createElement("span"); ic.className = "cicon"; ic.append(logoEl(w.icon));
      const cl = document.createElement("span"); cl.className = "cclient"; cl.textContent = w.client;
      top.append(ic, cl);
      const h = document.createElement("h3"); h.textContent = w.title;
      const p = document.createElement("p"); p.textContent = w.text;
      const m = document.createElement("div"); m.className = "cmetric"; m.textContent = w.metric;
      const lg = document.createElement("div"); lg.className = "clogos"; w.logos.forEach((k) => lg.append(logoEl(k)));
      c.append(top, h, p, m, lg);
      if (w.href) { const l = document.createElement("span"); l.className = "clink"; l.textContent = D().openRepo; c.append(l); }
      box.append(c);
    });
    applyFilter();
  }
  function applyFilter() { $$("#cards .card").forEach((c) => { const show = filter === "all" || c.dataset.cat.split(" ").includes(filter); c.hidden = !show; }); }

  /* ---------- employers + certifications ---------- */
  const EMP_RX = [[/edf/i, "EDF"], [/michelin/i, "Michelin"], [/atos|keolis/i, "ATOS"], [/port/i, "Port de Douala"], [/quitus/i, "Quitus"], [/we-it/i, "We-IT"]];
  function employerTile(who) {
    const hit = EMP_RX.find(([rx]) => rx.test(who)); const e = hit && EMPLOYERS.find((x) => x.name === hit[1]);
    const t = document.createElement("span"); t.className = "etile"; t.setAttribute("aria-hidden", "true");
    t.textContent = e ? e.short : "IUT";
    t.style.setProperty("--c", e ? e.color : "#8b5cf6"); return t;
  }
  function buildEmployers() {
    const box = $("#employers"); box.textContent = "";
    EMPLOYERS.forEach((e) => {
      const d = document.createElement("div"); d.className = "emp";
      const t = document.createElement("span"); t.className = "etile"; t.textContent = e.short; t.style.setProperty("--c", e.color);
      const n = document.createElement("b"); n.textContent = e.name; const s = document.createElement("small"); s.textContent = e.sub[lang];
      const w = document.createElement("span"); w.append(n, s); d.append(t, w); box.append(d);
    });
  }
  function buildCerts() {
    const sec = $("#certs"), grid = $("#certGrid"); grid.textContent = "";
    const has = CERTS.length > 0; sec.hidden = !has; $("#navCerts").hidden = !has;
    $("#idxIa").textContent = has ? "06" : "05"; $("#idxLead").textContent = has ? "07" : "06"; $("#idxTerm").textContent = has ? "08" : "07";
    CERTS.forEach((c) => {
      const el = document.createElement(c.url ? "a" : "article"); el.className = "cert";
      if (c.url) { el.href = c.url; el.target = "_blank"; el.rel = "noopener"; }
      const ic = document.createElement("span"); ic.className = "cicon"; c.logo ? ic.append(logoEl(c.logo)) : (ic.textContent = "★");
      const b = document.createElement("b"); b.textContent = c.name; const s = document.createElement("small"); s.textContent = [c.issuer, c.year].filter(Boolean).join(" · ");
      const w = document.createElement("span"); w.append(b, s); el.append(ic, w); grid.append(el);
    });
  }

  /* ---------- spotlight hover ---------- */
  addEventListener("pointermove", (e) => {
    const t = e.target.closest && e.target.closest(".card,.stat,.tools article,.values article,.emp,.cert");
    if (!t) return; const r = t.getBoundingClientRect();
    t.style.setProperty("--mx", e.clientX - r.left + "px"); t.style.setProperty("--my", e.clientY - r.top + "px");
  }, { passive: true });


  /* ---------- scroll spy for the pill nav ---------- */
  (() => {
    const links = $$(".nl"), map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const so = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { links.forEach((a) => a.classList.remove("active")); const a = map.get(e.target.id); a && a.classList.add("active"); } }), { rootMargin: "-45% 0px -50% 0px" });
    [...map.keys()].forEach((id) => { const el = document.getElementById(id); el && so.observe(el); });
  })();

  /* ---------- PWA: install, update, offline ---------- */
  let deferred;
  addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; $("#installBtn").hidden = false; });
  $("#installBtn").addEventListener("click", async () => {
    if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $("#installBtn").hidden = true;
  });
  addEventListener("appinstalled", () => { $("#installBtn").hidden = true; toast(T().installed); });
  addEventListener("offline", () => toast(T().offline));
  addEventListener("online", () => toast(T().online));

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    const hadController = !!navigator.serviceWorker.controller;
    addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").then((reg) => {
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          nw && nw.addEventListener("statechange", () => {
            if (nw.state === "installed" && navigator.serviceWorker.controller) toast(T().update, T().reload, () => nw.postMessage("SKIP_WAITING"), 0);
          });
        });
      }).catch(() => {});
      // Reload only for a real update (a controller already existed), never on the very first install.
      let reloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => { if (hadController && !reloaded) { reloaded = true; location.reload(); } });
    });
  }

  /* ---------- init ---------- */
  paintAll(); applyStatic(); buildLayers(0); buildTimeline(); buildAgents(); restartRot(); buildHeroStats(); buildWorks(); buildEmployers(); buildCerts();
})();
