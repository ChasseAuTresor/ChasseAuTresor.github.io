/* =========================================================
   YOUINOU vs BOURDON — Chasse au trésor
   Supabase sync via REST API (lightweight, no build step)
   ========================================================= */

/* ---------- Config ---------- */
const SUPABASE_URL = "https://0ec90b57d6e95fcbda19832f.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw";
const REST_URL = SUPABASE_URL + "/rest/v1/validations";
const REST_HEADERS = {
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": "Bearer " + SUPABASE_ANON_KEY,
  "Content-Type": "application/json",
  "Prefer": "return=representation"
};

/* ---------- Local storage (team choice only) ---------- */
const TEAM_KEY = "yvb-team";
function getLocalTeam() { try { return localStorage.getItem(TEAM_KEY); } catch(e) { return null; } }
function setLocalTeam(t) { try { localStorage.setItem(TEAM_KEY, t); } catch(e) {} }
function removeLocalTeam() { try { localStorage.removeItem(TEAM_KEY); } catch(e) {} }

/* ---------- Teams ---------- */
const TEAMS = {
  youinou: { name: "Team YOUINOU", emoji: "🤬", color: "#2f6b3a" },
  bourdon: { name: "Team BOURDON", emoji: "🐝", color: "#2a91b8" }
};

/* ---------- Balises ---------- */
const BALISES = [
  { id: 1,  name: "Balise 1",  desc: "Accès à la plage des dames", pts: 10, icon: "📍", code: "14782" },
  { id: 2,  name: "Balise 2",  desc: "Le Flimiou", pts: 10, icon: "📍", code: "25910" },
  { id: 3,  name: "Balise 3",  desc: "Face au loup des mers", pts: 15, icon: "📍", code: "38471" },
  { id: 4,  name: "Balise 4",  desc: "Cherche les filets Bleu.", pts: 10, icon: "📍", code: "41056" },
  { id: 5,  name: "Balise 5",  desc: "Direction du Den Paoulig, tu trouveras", pts: 15, icon: "📍", code: "52389" },
  { id: 6,  name: "Balise 6",  desc: "....", pts: 10, icon: "📍", code: "63104" },
  { id: 7,  name: "Balise 7",  desc: "Visible à marée basse seulement. Courage !", pts: 20, icon: "📍", code: "74820" },
  { id: 8,  name: "Balise 8",  desc: "Commande un 'Kouign Amann' pour débloquer l'indice.", pts: 10, icon: "📍", code: "85631" },
  { id: 9,  name: "Balise 9",  desc: "Là où l'on réparait les bateaux en bois.", pts: 10, icon: "📍", code: "96247" },
  { id: 10, name: "Balise 10", desc: "La dernière balise. Le coffre est ouvert !", pts: 25, icon: "📍", code: "10938" }
];

/* ---------- Shared state (from Supabase) ---------- */
let remoteValidations = []; // array of { team, balise_id, pts }
let isOnline = false;
let pollTimer = null;

function teamScore(team) {
  return remoteValidations.filter(v => v.team === team).reduce((s, v) => s + v.pts, 0);
}
function teamValidatedIds(team) {
  return remoteValidations.filter(v => v.team === team).map(v => v.balise_id);
}
function teamValidatedCount(team) {
  return remoteValidations.filter(v => v.team === team).length;
}

/* ---------- Supabase REST calls ---------- */
async function fetchValidations() {
  try {
    const res = await fetch(REST_URL + "?select=team,balise_id,pts&order=created_at.asc", {
      headers: REST_HEADERS
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    remoteValidations = Array.isArray(data) ? data : [];
    setOnline(true);
  } catch (e) {
    setOnline(false);
  }
}

async function insertValidation(team, baliseId, pts) {
  const res = await fetch(REST_URL, {
    method: "POST",
    headers: REST_HEADERS,
    body: JSON.stringify({ team, balise_id: baliseId, pts })
  });
  if (!res.ok && res.status !== 409) {
    const txt = await res.text().catch(() => "");
    throw new Error("Insert failed: " + res.status + " " + txt);
  }
  const data = await res.json().catch(() => []);
  return Array.isArray(data) ? data[0] : data;
}

async function deleteAllValidations() {
  const res = await fetch(REST_URL + "?team=neq.__placeholder__", {
    method: "DELETE",
    headers: { ...REST_HEADERS, "Prefer": "return=minimal" }
  });
  if (!res.ok) throw new Error("Delete failed: " + res.status);
}

/* ---------- Polling ---------- */
function startPolling() {
  stopPolling();
  pollTimer = setInterval(fetchValidations, 4000);
}
function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
}

function setOnline(status) {
  if (isOnline === status) return;
  isOnline = status;
  updateSyncBadges();
}

function updateSyncBadges() {
  document.querySelectorAll(".sync-badge").forEach(el => {
    el.classList.toggle("online", isOnline);
    el.classList.toggle("offline", !isOnline);
    const dot = el.querySelector(".dot");
    const text = el.childNodes[el.childNodes.length - 1];
    if (text && text.nodeType === Node.TEXT_NODE) {
      text.textContent = isOnline ? " Sync" : " Hors ligne";
    }
  });
}

/* ---------- Photo paths ---------- */
function getPhotoPath(baliseId) {
  return "images/balise" + baliseId + ".jpg";
}

async function checkPhotoExists(path) {
  try {
    const res = await fetch(path, { method: "HEAD" });
    return res.ok;
  } catch (e) {
    return false;
  }
}

/* ---------- Navigation ---------- */
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav button");
let currentScreen = "home";

function showScreen(id) {
  currentScreen = id;
  screens.forEach(s => s.classList.toggle("active", s.id === "screen-" + id));
  navButtons.forEach(b => b.classList.toggle("active", b.dataset.screen === id));
  if (id === "dashboard") renderDashboard();
  if (id === "balises") renderBalises();
  if (id === "indices") renderIndices();
  if (id === "settings") renderSettings();
  window.scrollTo(0, 0);
}

navButtons.forEach(b => b.addEventListener("click", () => {
  const team = getLocalTeam();
  if (!team) { toast("Choisis d'abord ton équipe 🧐"); return; }
  showScreen(b.dataset.screen);
}));

/* ---------- Home / Team ---------- */
const team = getLocalTeam();

document.getElementById("btn-start").addEventListener("click", () => {
  if (getLocalTeam()) showScreen("dashboard");
  else showScreen("team");
});

let pickedTeam = null;
document.querySelectorAll(".team-card").forEach(c => {
  c.addEventListener("click", () => {
    document.querySelectorAll(".team-card").forEach(x => x.classList.remove("selected"));
    c.classList.add("selected");
    pickedTeam = c.dataset.team;
    document.getElementById("btn-confirm-team").disabled = false;
  });
});

document.getElementById("btn-confirm-team").addEventListener("click", () => {
  if (!pickedTeam) return;
  setLocalTeam(pickedTeam);
  toast("Bienvenue dans l'équipe " + TEAMS[pickedTeam].name + " " + TEAMS[pickedTeam].emoji);
  showScreen("dashboard");
});

/* ---------- Dashboard ---------- */
function renderDashboard() {
  const t = TEAMS[getLocalTeam()];
  if (!t) return;
  document.getElementById("dash-team-badge").textContent = t.emoji + " " + t.name;
  document.getElementById("dash-emoji").textContent = t.emoji;
  document.getElementById("dash-name").textContent = t.name;

  const myTeam = getLocalTeam();
  const validated = teamValidatedCount(myTeam);
  document.getElementById("dash-balises").textContent = validated + " / 10 balises";
  document.getElementById("dash-score").textContent = teamScore(myTeam);
  const pct = Math.round(validated / 10 * 100);
  document.getElementById("dash-progress").style.width = pct + "%";
  document.getElementById("dash-progress-label").textContent = "Progression : " + pct + "%";

  const ranking = Object.keys(TEAMS).map(k => ({
    key: k, ...TEAMS[k], score: teamScore(k)
  })).sort((a, b) => b.score - a.score);

  const maxScore = Math.max(...ranking.map(r => r.score), 1);
  const rankHtml = ranking.map((r, i) => {
    const isWinner = i === 0 && r.score > 0;
    const barPct = Math.round(r.score / maxScore * 100);
    return `
      <div class="rank-row ${isWinner ? 'winner' : ''}">
        <span class="pos">${i + 1}.</span>
        <span class="name">${r.emoji} ${r.name}</span>
        <span class="pts">${r.score} pts</span>
      </div>`;
  }).join("");
  document.getElementById("rank-list").innerHTML = rankHtml;
}

/* ---------- Balises ---------- */
async function renderBalises() {
  const myTeam = getLocalTeam();
  if (!myTeam) return;
  const t = TEAMS[myTeam];
  document.getElementById("bal-team-badge").textContent = t.emoji + " " + t.name;
  const validatedIds = teamValidatedIds(myTeam);

  const photoChecks = await Promise.all(BALISES.map(b => checkPhotoExists(getPhotoPath(b.id))));
  const photoMap = {};
  BALISES.forEach((b, i) => { if (photoChecks[i]) photoMap[b.id] = true; });

  const html = BALISES.map(b => {
    const done = validatedIds.includes(b.id);
    const hasPhoto = photoMap[b.id];
    let actions;
    if (done) {
      actions = `<div class="balise-status done">✓ Validée — +${b.pts} points</div>`;
    } else {
      const hintBtn = hasPhoto
        ? `<button class="btn btn-ghost" data-hint="${b.id}">📷 Voir l'indice</button>`
        : "";
      actions = `<div class="balise-actions">${hintBtn}<button class="btn btn-green" data-validate="${b.id}">Valider la balise</button></div>`;
    }
    return `
      <div class="balise ${done ? 'done' : ''}" data-id="${b.id}">
        <div class="balise-head">
          <span class="ico">${b.icon}</span>
          <span class="name">${b.name}</span>
          <span class="pts">+${b.pts}</span>
        </div>
        <div class="balise-desc">${b.desc}</div>
        ${actions}
      </div>`;
  }).join("");
  document.getElementById("balise-list").innerHTML = html;

  document.querySelectorAll("[data-validate]").forEach(btn => {
    btn.addEventListener("click", () => validateBalise(parseInt(btn.dataset.validate)));
  });
  document.querySelectorAll("[data-hint]").forEach(btn => {
    btn.addEventListener("click", () => {
      openPhotoViewer(getPhotoPath(parseInt(btn.dataset.hint)));
    });
  });
}

async function validateBalise(id) {
  const myTeam = getLocalTeam();
  if (!myTeam) return;
  if (teamValidatedIds(myTeam).includes(id)) return;

  const balise = BALISES.find(b => b.id === id);
  const code = await promptModal(balise.icon, "Balise " + balise.id, "Entre le code à 5 chiffres affiché à la balise :", "Code à 5 chiffres");
  if (code === null) return;
  if (code !== balise.code) {
    toast("❌ Code incorrect");
    return;
  }

  try {
    await insertValidation(myTeam, balise.id, balise.pts);
    await fetchValidations();
    launchConfetti();
    showModal("🎉", "Bravo !", `+${balise.pts} points pour ${TEAMS[myTeam].name} !`);
    renderBalises();
    renderDashboard();
    bumpScore();
  } catch (e) {
    toast("Erreur de synchronisation — réessaie");
  }
}

function bumpScore() {
  const el = document.getElementById("dash-score");
  if (el) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
}

/* ---------- Indices (photos admin) ---------- */
function renderIndices() {
  const html = BALISES.map(b => {
    const photoPath = getPhotoPath(b.id);
    return `
      <div class="indice-row">
        <span class="num">${b.id}.</span>
        <div class="info">
          <div class="name">${b.name}</div>
          <div class="state" data-state="${b.id}">Vérification…</div>
        </div>
        <img class="thumb" data-thumb="${b.id}" src="${photoPath}" alt="" style="display:none;" onerror="this.style.display='none'" />
        <div class="thumb empty" data-thumb-empty="${b.id}">📷</div>
      </div>`;
  }).join("");
  document.getElementById("indice-list").innerHTML = html;

  BALISES.forEach(async b => {
    const exists = await checkPhotoExists(getPhotoPath(b.id));
    const stateEl = document.querySelector(`[data-state="${b.id}"]`);
    const thumb = document.querySelector(`[data-thumb="${b.id}"]`);
    const thumbEmpty = document.querySelector(`[data-thumb-empty="${b.id}"]`);
    if (exists) {
      if (stateEl) { stateEl.textContent = "✓ Photo indice présente"; stateEl.style.color = "var(--green-700)"; }
      if (thumb) thumb.style.display = "block";
      if (thumbEmpty) thumbEmpty.style.display = "none";
    } else {
      if (stateEl) { stateEl.textContent = "Aucune photo"; stateEl.style.color = "var(--ocean-700)"; }
    }
  });
}

/* ---------- Photo viewer ---------- */
const photoViewer = document.getElementById("photo-viewer");
const photoViewerImg = document.getElementById("photo-viewer-img");
function openPhotoViewer(src) {
  photoViewerImg.src = src;
  photoViewer.classList.add("show");
}
document.getElementById("photo-viewer-close").addEventListener("click", () => photoViewer.classList.remove("show"));
photoViewer.addEventListener("click", e => { if (e.target === photoViewer) photoViewer.classList.remove("show"); });

/* ---------- Settings ---------- */
document.getElementById("btn-reveal-reset").addEventListener("click", () => {
  document.getElementById("reset-zone").classList.toggle("hidden-reset");
});

document.getElementById("btn-reset").addEventListener("click", async () => {
  const ok = await confirmModal("Tout réinitialiser ? Toutes les validations des deux équipes seront effacées.");
  if (!ok) return;
  try {
    await deleteAllValidations();
    await fetchValidations();
  } catch (e) {
    toast("Erreur lors de la réinitialisation");
    return;
  }
  removeLocalTeam();
  toast("Partie réinitialisée");
  showScreen("home");
});

/* ---------- Modal & Toast ---------- */
const modal = document.getElementById("modal");
const modalInput = document.getElementById("modal-input");
const modalCancel = document.getElementById("modal-cancel");
let modalResolve = null;

function _setModal(emoji, title, text, okLabel, showInput, showCancel, placeholder) {
  document.getElementById("modal-emoji").textContent = emoji;
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-text").textContent = text;
  document.getElementById("modal-ok").textContent = okLabel;
  modalInput.style.display = showInput ? "block" : "none";
  modalInput.value = "";
  modalInput.placeholder = placeholder || "";
  modalCancel.style.display = showCancel ? "inline-flex" : "none";
  modal.classList.add("show");
  if (showInput) setTimeout(() => modalInput.focus(), 80);
  return new Promise(r => { modalResolve = r; });
}

function showModal(emoji, title, text) { return _setModal(emoji, title, text, "Super !", false, false); }
function confirmModal(text) { return _setModal("⚠️", "Confirmer", text, "Oui", false, true); }
function promptModal(emoji, title, text, placeholder) { return _setModal(emoji, title, text, "Valider", true, true, placeholder); }

document.getElementById("modal-ok").addEventListener("click", () => {
  modal.classList.remove("show");
  if (modalResolve) {
    if (modalInput.style.display !== "none") modalResolve(modalInput.value.trim());
    else modalResolve(true);
    modalResolve = null;
  }
});
modalCancel.addEventListener("click", () => {
  modal.classList.remove("show");
  if (modalResolve) { modalResolve(null); modalResolve = null; }
});

let toastTimer = null;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ---------- Confetti ---------- */
function launchConfetti() {
  const layer = document.getElementById("confetti");
  const colors = ["#e8b04b", "#2a91b8", "#4a9d57", "#fbf6ec", "#14698c"];
  for (let i = 0; i < 80; i++) {
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.style.left = Math.random() * 100 + "vw";
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = (1.8 + Math.random() * 1.5) + "s";
    p.style.animationDelay = (Math.random() * 0.4) + "s";
    p.style.width = (6 + Math.random() * 8) + "px";
    p.style.height = (10 + Math.random() * 10) + "px";
    p.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    layer.appendChild(p);
    setTimeout(() => p.remove(), 3500);
  }
}

/* ---------- Init ---------- */
async function init() {
  await fetchValidations();
  startPolling();

  if (getLocalTeam()) {
    showScreen("dashboard");
  } else {
    showScreen("home");
  }
}

init();
