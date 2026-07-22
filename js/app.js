/* =========================================================
   STATE & STORAGE
   ========================================================= */
const STORAGE_KEY = "quetes-bourdon-v1";
const _memStore = {};
function safeGet(k) { try { const v = localStorage.getItem(k); if (v !== null) return v; } catch(e) {} return _memStore[k] !== undefined ? _memStore[k] : null; }
function safeSet(k, v) { try { localStorage.setItem(k, v); return; } catch(e) {} _memStore[k] = v; }
function safeRemove(k) { try { localStorage.removeItem(k); return; } catch(e) {} delete _memStore[k]; }

const TEAMS = {
  youinou: { name: "Team YOUINOU", emoji: "😤", color: "#2f6b3a" },
  bourdon:   { name: "Team BOURDON",   emoji: "🐝", color: "#2a91b8" }
};

const BALISES = [
  { id: 1, name: "Balise 1",  desc: "Accès à l plage des dames", pts: 10, icon: "📍", code: "14782" },
  { id: 2, name: "Balise 2",  desc: "Le Flimiou", pts: 10, icon: "📍", code: "25910" },
  { id: 3, name: "Balise 3",  desc: "Face au loups des mers", pts: 15, icon: "📍", code: "38471" },
  { id: 4, name: "Balise 4",  desc: "Cherche les filets Bleu.", pts: 10, icon: "📍", code: "41056" },
  { id: 5, name: "Balise 5",  desc: "Direction du den paoulig tu trouvera", pts: 15, icon: "📍", code: "52389" },
  { id: 6, name: "Balise 6",  desc: "....", pts: 10, icon: "📍", code: "63104" },
  { id: 7, name: "Balise 7",  desc: "Visible à marée basse seulement. Courage !", pts: 20, icon: "📍", code: "74820" },
  { id: 8, name: "Balise 8",  desc: "Commande un 'Kouign Amann' pour débloquer l'indice.", pts: 10, icon: "📍", code: "85631" },
  { id: 9, name: "Balise 9",  desc: "Là où l'on réparait les bateaux en bois.", pts: 10, icon: "📍", code: "96247" },
  { id:10, name: "Balise 10", desc: "La dernière balise. Le coffre est ouvert !", pts: 25, icon: "📍", code: "10938" }
];

let state = loadState();

function loadState() {
  try {
    const raw = safeGet(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (!s.photos) s.photos = {};
      return s;
    }
  } catch (e) {}
  return {
    team: null,
    scores: { youinou: 0, bourdon: 0 },
    validated: { youinou: [], bourdon: [] },
    photos: {}
  };
}
function saveState() { safeSet(STORAGE_KEY, JSON.stringify(state)); }

/* =========================================================
   PHOTO PATHS — charge depuis le dossier images/
   ========================================================= */
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

/* =========================================================
   NAVIGATION
   ========================================================= */
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav button");

function showScreen(id) {
  screens.forEach(s => s.classList.toggle("active", s.id === "screen-" + id));
  navButtons.forEach(b => b.classList.toggle("active", b.dataset.screen === id));
  if (id === "dashboard") renderDashboard();
  if (id === "balises") renderBalises();
  if (id === "indices") renderIndices();
  if (id === "settings") renderSettings();
  window.scrollTo(0, 0);
}

navButtons.forEach(b => b.addEventListener("click", () => {
  if (!state.team) { toast("Choisis d'abord ton équipe 🧐"); return; }
  showScreen(b.dataset.screen);
}));

/* =========================================================
   HOME / TEAM
   ========================================================= */
document.getElementById("btn-start").addEventListener("click", () => {
  if (state.team) showScreen("dashboard");
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
  state.team = pickedTeam;
  saveState();
  toast("Bienvenue dans l'équipe " + TEAMS[pickedTeam].name + " " + TEAMS[pickedTeam].emoji);
  showScreen("dashboard");
});

/* =========================================================
   DASHBOARD
   ========================================================= */
function renderDashboard() {
  const t = TEAMS[state.team];
  document.getElementById("dash-team-badge").textContent = t.emoji + " " + t.name;
  document.getElementById("dash-emoji").textContent = t.emoji;
  document.getElementById("dash-name").textContent = t.name;
  const validated = state.validated[state.team].length;
  document.getElementById("dash-balises").textContent = validated + " / 10 balises";
  document.getElementById("dash-score").textContent = state.scores[state.team];
  const pct = Math.round(validated / 10 * 100);
  document.getElementById("dash-progress").style.width = pct + "%";
  document.getElementById("dash-progress-label").textContent = "Progression : " + pct + "%";

  const ranking = Object.keys(TEAMS).map(k => ({ key: k, ...TEAMS[k], score: state.scores[k] })).sort((a,b) => b.score - a.score);
  const rankHtml = ranking.map((r, i) => `
    <div class="rank-row">
      <span class="pos">${i+1}.</span>
      <span class="name">${r.emoji} ${r.name}</span>
      <span class="pts">${r.score} pts</span>
    </div>`).join("");
  document.getElementById("rank-list").innerHTML = rankHtml;
}

/* =========================================================
   BALISES
   ========================================================= */
async function renderBalises() {
  const t = TEAMS[state.team];
  document.getElementById("bal-team-badge").textContent = t.emoji + " " + t.name;
  const validated = state.validated[state.team];

  // Vérifie quelles balises ont une photo indice dans le dossier images/
  const photoChecks = await Promise.all(BALISES.map(b => checkPhotoExists(getPhotoPath(b.id))));
  const photoMap = {};
  BALISES.forEach((b, i) => { if (photoChecks[i]) photoMap[b.id] = true; });

  const html = BALISES.map(b => {
    const done = validated.includes(b.id);
    const hasPhoto = photoMap[b.id];
    return `
      <div class="balise ${done ? 'done' : ''}" data-id="${b.id}">
        <div class="balise-head">
          <span class="ico">${b.icon}</span>
          <span class="name">${b.name}</span>
          <span class="pts">+${b.pts}</span>
        </div>
        <div class="balise-desc">${b.desc}</div>
        ${done
          ? `<div class="balise-status done">✓ Validée — +${b.pts} points</div>`
          : (hasPhoto
              ? `<button class="btn btn-ghost" data-hint="${b.id}" style="margin-bottom:10px;">📷 Voir l'indice</button><button class="btn btn-green" data-validate="${b.id}">Valider la balise</button>`
              : `<button class="btn btn-green" data-validate="${b.id}">Valider la balise</button>`)}
      </div>`;
  }).join("");
  document.getElementById("balise-list").innerHTML = html;

  document.querySelectorAll("[data-validate]").forEach(btn => {
    btn.addEventListener("click", () => validateBalise(parseInt(btn.dataset.validate)));
  });
  document.querySelectorAll("[data-hint]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.hint);
      openPhotoViewer(getPhotoPath(id));
    });
  });
}

async function validateBalise(id) {
  if (state.validated[state.team].includes(id)) return;
  const balise = BALISES.find(b => b.id === id);
  const code = await promptModal(balise.icon, "Balise " + balise.id, "Entre le code à 5 chiffres affiché à la balise :", "Code à 5 chiffres");
  if (code === null) return;
  if (code !== balise.code) {
    toast("❌ Code incorrect");
    return;
  }
  state.validated[state.team].push(id);
  state.scores[state.team] += balise.pts;
  saveState();

  launchConfetti();
  showModal("🎉", "Bravo !", `+${balise.pts} points pour ${TEAMS[state.team].name} !`);

  renderBalises();
  bumpScore();
}

function bumpScore() {
  const el = document.getElementById("dash-score");
  if (el) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
}

/* =========================================================
   INDICES (photos admin)
   ========================================================= */
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

  // Vérifie chaque photo et met à jour l'affichage
  BALISES.forEach(async b => {
    const exists = await checkPhotoExists(getPhotoPath(b.id));
    const stateEl = document.querySelector(`[data-state="${b.id}"]`);
    const thumb = document.querySelector(`[data-thumb="${b.id}"]`);
    const thumbEmpty = document.querySelector(`[data-thumb-empty="${b.id}"]`);
    if (exists) {
      if (stateEl) stateEl.textContent = "✓ Photo indice présente";
      if (stateEl) stateEl.style.color = "var(--green-700)";
      if (thumb) thumb.style.display = "block";
      if (thumbEmpty) thumbEmpty.style.display = "none";
    } else {
      if (stateEl) stateEl.textContent = "Aucune photo";
      if (stateEl) stateEl.style.color = "var(--ocean-700)";
    }
  });
}

/* =========================================================
   PHOTO VIEWER
   ========================================================= */
const photoViewer = document.getElementById("photo-viewer");
const photoViewerImg = document.getElementById("photo-viewer-img");
function openPhotoViewer(src) {
  photoViewerImg.src = src;
  photoViewer.classList.add("show");
}
document.getElementById("photo-viewer-close").addEventListener("click", () => photoViewer.classList.remove("show"));
photoViewer.addEventListener("click", e => { if (e.target === photoViewer) photoViewer.classList.remove("show"); });

/* =========================================================
   SETTINGS
   ========================================================= */
document.getElementById("btn-reveal-reset").addEventListener("click", () => {
  document.getElementById("reset-zone").classList.toggle("hidden-reset");
});

document.getElementById("btn-reset").addEventListener("click", async () => {
  const ok = await confirmModal("Tout réinitialiser ? Équipe, score et balises seront effacés.");
  if (!ok) return;
  safeRemove(STORAGE_KEY);
  state = loadState();
  toast("Partie réinitialisée");
  showScreen("home");
});

/* =========================================================
   MODAL & TOAST
   ========================================================= */
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

/* =========================================================
   CONFETTI
   ========================================================= */
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

/* =========================================================
   INIT
   ========================================================= */
if (state.team) {
  showScreen("dashboard");
} else {
  showScreen("home");
}
