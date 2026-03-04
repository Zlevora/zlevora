const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));

const splash = $("#splash");
const app = $("#app");

const sheet = $("#sheet");
const sheetBackdrop = $("#sheetBackdrop");
const menuBtn = $("#menuBtn");
const closeMenu = $("#closeMenu");

function openSheet(){
  sheet.classList.remove("hidden");
  sheetBackdrop.classList.remove("hidden");
}
function closeSheet(){
  sheet.classList.add("hidden");
  sheetBackdrop.classList.add("hidden");
}

menuBtn.addEventListener("click", openSheet);
closeMenu.addEventListener("click", closeSheet);
sheetBackdrop.addEventListener("click", closeSheet);

function showPage(page){
  // hide all pages
  $$("[data-page]").forEach(el => {
    if(el.dataset.page === "home") return; // dashboard always visible when home
    el.classList.add("hidden");
  });

  // dashboard (home)
  const dash = document.querySelector('[data-page="home"]');
  if(page === "home"){
    dash.classList.remove("hidden");
  } else {
    dash.classList.add("hidden");
    const target = document.querySelector([data-page="${page}"]);
    if(target) target.classList.remove("hidden");
  }

  // bottom nav active
  $$(".nav").forEach(b => b.classList.toggle("active", b.dataset.nav === page));

  closeSheet();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function runSplash(){
  splash.classList.remove("hidden");
  app.classList.add("hidden");
  setTimeout(() => {
    splash.classList.add("hidden");
    app.classList.remove("hidden");
    showPage("home");
    localStorage.setItem("zlevora_seen_splash", "1");
  }, 1400);
}

function initTheme(){
  // default light (nude)
  const saved = localStorage.getItem("zlevora_theme");
  if(saved) document.documentElement.setAttribute("data-theme", saved);
}
$("#toggleTheme").addEventListener("click", () => {
  const cur = document.documentElement.getAttribute("data-theme") || "light";
  const next = (cur === "light") ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("zlevora_theme", next);
});
$("#resetSplash").addEventListener("click", () => {
  localStorage.removeItem("zlevora_seen_splash");
  runSplash();
});

function wireNav(){
  // any element with data-nav
  $$("[data-nav]").forEach(el => {
    el.addEventListener("click", () => showPage(el.dataset.nav));
  });
  // sheet items
  $$(".sheetItem").forEach(el => {
    el.addEventListener("click", () => showPage(el.dataset.nav));
  });
}
wireNav();

/* Weekly storage (local) */
function nowStamp(){
  const d = new Date();
  return d.toLocaleString();
}
function keyForWeek(start, name){
  return zlevora_week_${start || "unknown"}_${(name||"anon").trim().toLowerCase()};
}
function loadWeeksIndex(){
  try{ return JSON.parse(localStorage.getItem("zlevora_weeks_index") || "[]"); }
  catch{ return []; }
}
function saveWeeksIndex(list){
  localStorage.setItem("zlevora_weeks_index", JSON.stringify(list));
}
function renderWeeksList(){
  const box = $("#weeksList");
  box.innerHTML = "";
  const idx = loadWeeksIndex().sort((a,b)=> (b.savedAt||"").localeCompare(a.savedAt||""));
  if(idx.length === 0){
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = <div class="itemT">No weeks saved yet</div><div class="itemS">Save your first weekly report.</div>;
    box.appendChild(div);
    return;
  }

  idx.forEach(meta => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div class="itemT">${meta.name || "Mother"} • ${meta.weekStart || "—"} → ${meta.weekEnd || "—"}</div>
      <div class="itemS">Saved: ${meta.savedAt || "—"}</div>
    `;
    div.addEventListener("click", () => {
      const data = JSON.parse(localStorage.getItem(meta.key) || "{}");
      fillWeekly(data);
      $("#savedAt").textContent = meta.savedAt || "—";
      showPage("weekly");
    });
    box.appendChild(div);
  });
}

function readWeekly(){
  return {
    weekStart: $("#weekStart").value,
    weekEnd: $("#weekEnd").value,
    motherName: $("#motherName").value,
    highlights: $("#weeklyHighlights").value,
    concerns: $("#weeklyConcerns").value,
    days: {
      mon: $("#dMon").value,
      tue: $("#dTue").value,
      wed: $("#dWed").value,
      thu: $("#dThu").value,
      fri: $("#dFri").value,
      sat: $("#dSat").value,
      sun: $("#dSun").value
    }
  };
}
function fillWeekly(d){
  $("#weekStart").value = d.weekStart || "";
  $("#weekEnd").value = d.weekEnd || "";
  $("#motherName").value = d.motherName || "";
  $("#weeklyHighlights").value = d.highlights || "";
  $("#weeklyConcerns").value = d.concerns || "";
  $("#dMon").value = d.days?.mon || "";
  $("#dTue").value = d.days?.tue || "";
  $("#dWed").value = d.days?.wed || "";
  $("#dThu").value = d.days?.thu || "";
  $("#dFri").value = d.days?.fri || "";
  $("#dSat").value = d.days?.sat || "";
  $("#dSun").value = d.days?.sun || "";
}

$("#saveWeekly").addEventListener("click", () => {
  const data = readWeekly();
  const key = keyForWeek(data.weekStart, data.motherName);
  const savedAt = nowStamp();
  localStorage.setItem(key, JSON.stringify(data));

  // index
  const idx = loadWeeksIndex().filter(x => x.key !== key);
  idx.unshift({
    key,
    weekStart: data.weekStart,
    weekEnd: data.weekEnd,
    name: data.motherName,
    savedAt
  });
  saveWeeksIndex(idx);

  $("#savedAt").textContent = savedAt;
  renderWeeksList();
});

$("#newWeekly").addEventListener("click", () => {
  fillWeekly({});
  $("#savedAt").textContent = "—";
});

/* AI mock */
const chatLog = $("#chatLog");
function addBubble(text, who="bot"){
  const div = document.createElement("div");
  div.className = bubble ${who === "me" ? "me" : "bot"};
  div.textContent = text;
  chatLog.appendChild(div);
  div.scrollIntoView({behavior:"smooth", block:"end"});
}
function reply(q){
  const t = q.toLowerCase();
  if(t.includes("sleep")) return "Sleep plan: same bedtime routine, dim lights, wake windows, track 3 days then adjust gently.";
  if(t.includes("colic")) return "Colic steps: paced feeding, burp mid-feed, warm tummy, log triggers. Seek doctor if fever/poor feeding.";
  if(t.includes("stress")) return "60-sec calm: inhale 4, hold 2, exhale 6 (x5). Then pick ONE tiny task only.";
  if(t.includes("pdf") || t.includes("translate")) return "In future: you can upload a PDF locally and I summarize/translate without sharing.";
  return "Tell me age + what happened + what you tried, and I’ll organize steps safely.";
}
$("#chatSend").addEventListener("click", () => {
  const inp = $("#chatInput");
  const q = inp.value.trim();
  if(!q) return;
  addBubble(q, "me");
  inp.value = "";
  setTimeout(() => addBubble(reply(q), "bot"), 250);
});

/* Boot */
function boot(){
  initTheme();
  renderWeeksList();

  const seen = localStorage.getItem("zlevora_seen_splash");
  if(seen === "1"){
    splash.classList.add("hidden");
    app.classList.remove("hidden");
    showPage("home");
  } else {
    runSplash();
  }
}
boot();
