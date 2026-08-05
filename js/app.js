/* =========================================================
   YOUINOU vs BOURDON — Chasse au trésor
   Supabase sync via REST API (lightweight, no build step)
   ========================================================= */

/* ---------- Config ---------- */
const SUPABASE_URL = "https://vggojodlewoufmewpqut.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnZ29qb2RsZXdvdWZtZXdwcXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MDUxMzcsImV4cCI6MjEwMDI4MTEzN30.-zrxYK8f7SysKKLOkzwF4RTIsRuFu-E1YHIN0627GzU";
const REST_URL = SUPABASE_URL + "/rest/v1/validations";
const REST_HEADERS = {
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": "Bearer " + SUPABASE_ANON_KEY,
  "Content-Type": "application/json"
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
  { id: 1,  name: "Balise 1",  desc: "Les débuts", pts: 10, icon: "📍", code: "14782",
    anecdote: "L'appartement de Romain a été le théâtre de nombreuses soirées mémorables entre amis. L'immeuble, lui, avait un peu moins de charme… Il y avait régulièrement du trafic dans le quartier. Un jour, alors que Laetitia était seule dans l'appartement, impossible de sortir : deux hommes étaient en train de se disputer dans le hall en se menaçant avec un couteau. 😬 Un souvenir un peu insolite… dont on préfère rire aujourd'hui !" },
  { id: 2,  name: "Balise 2",  desc: "Rien à voir avec le lieu", pts: 10, icon: "📍", code: "25910",
    anecdote: "Comme ennoncé, rien à voir avec le lieu mais juste l'anecdote. Notre première rencontre, notre premier baiser… c'était au Mylor, le soir où je fêtais mes 25 ans. Une soirée que je n'oublierai jamais, sans imaginer une seconde qu'elle marquerait le début de notre histoire. Le lendemain, alors que je me préparais à accueillir toute ma famille pour un grand repas, voilà qu'il débarque chez moi. Il sonne à la porte, habillé en short, en sandales et avec une veste en cuir… un look plutôt inattendu qui me fait encore sourire aujourd'hui ! Le timing était parfait… ou presque. 😆.En réalité, il savait déjà où j'habitais, puisque son meilleur ami était tout simplement mon voisin. Ce qui est drôle, c'est qu'avant cette fameuse soirée, on s'était déjà croisés plusieurs fois sans vraiment se connaître. Comme quoi, il fallait juste le bon moment pour que nos chemins se croisent vraiment." },
  { id: 3,  name: "Balise 3",  desc: "Histoire Insolite...", pts: 15, icon: "📍", code: "38471",
    anecdote: "Notre premier restaurant, c'était à L'Insolite. Un moment qu'on imaginait sûrement un peu romantique… jusqu'à ce qu'il commande un demi-homard ! Pour l'occasion, le serveur lui apporte un immense bavoir à enfiler avant de commencer son repas. Autant dire que pour un premier resto en amoureux, ce n'était pas vraiment le look le plus glamour ! 😆 On a éclaté de rire en le voyant avec son bavoir, et cette scène est restée gravée dans nos souvenirs. Finalement, ce sont souvent ces petits moments imprévus et un peu ridicules qui rendent une histoire encore plus belle." },
  { id: 4,  name: "Balise 4",  desc: "l'adolescence", pts: 10, icon: "📍", code: "41056",
    anecdote: "Avant de se connaître, ils avaient déjà un point commun sans vraiment le savoir : ils ont tous les deux été a Saint-Blaise. À l'époque, leurs chemins ne se sont pourtant jamais croisés… ou du moins, ils ne s'en souviennent pas. Il aura fallu attendre quelques années de plus pour que leurs routes se rejoignent enfin et que leur histoire commence. Un joli clin d'œil au destin, qui avait déjà semé quelques indices bien avant leur première rencontre." },
  { id: 5,  name: "Balise 5",  desc: "Direction du bolomig, tu trouveras", pts: 15, icon: "📍", code: "52389",
    anecdote: "Cette petite statue en a vu passer du monde au fil des Gras ! Chaque année, il assiste au défilé des costumes les plus farfelus, aux chorégraphies improvisées et à quelques retours un peu hésitants en fin de soirée. S'il pouvait parler, il aurait certainement des centaines d'anecdotes à raconter… ah ben tiens voici quelques photos",
    photos: [
      "https://images.pexels.com/photos/36743804/pexels-photo-36743804.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/11421472/pexels-photo-11421472.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/335691/pexels-photo-335691.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/15750871/pexels-photo-15750871.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/20812188/pexels-photo-20812188.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ] },
  { id: 6,  name: "Balise 6",  desc: "à la pêche au moule", pts: 10, icon: "📍", code: "63104",
    anecdote: "Bon ben là... vas y trouver des idées, aparement Mr YOUINOU R (pout ne pas confondre avec Christophe) était amateur de pêche, donc j'espèe que vous avez bien marché pour cette anecdote pas très utile, je sais même pas si c'était ici, il faudra demandé à l'interressé... mais bravo pour la balise trouvée" },
  { id: 7,  name: "Balise 7",  desc: "....", pts: 20, icon: "📍", code: "74820",
    anecdote: "à remplir " },
  { id: 8,  name: "Balise 8",  desc: "....", pts: 10, icon: "📍", code: "85631",
    anecdote: "à remplir " },
  { id: 9,  name: "Balise 9",  desc: "....", pts: 10, icon: "📍", code: "96247",
    anecdote: "à remplir " },
  { id: 10, name: "Balise 10", desc: "....", pts: 25, icon: "📍", code: "10938",
    anecdote: "à remplir " }
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
    throw new Error("Insert failed (" + res.status + "): " + txt);
  }
  return null;
}

async function deleteAllValidations() {
  const res = await fetch(REST_URL + "?team=neq.__placeholder__", {
    method: "DELETE",
    headers: { ...REST_HEADERS }
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
        ? `<button class="btn btn-ghost" data-hint="${b.id}">📷 Indice</button>`
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
    const wantAnecdote = await showModal("🎉", "Bravo !", `+${balise.pts} points pour ${TEAMS[myTeam].name} !`, "Anecdotes sur Romain et Laetitia");
    if (wantAnecdote) {
      showModal("📖", `Anecdote — ${balise.name}`, balise.anecdote, "Fermer", balise.photos);
    }
    renderBalises();
    renderDashboard();
    bumpScore();
  } catch (e) {
    toast("Erreur de sync: " + e.message);
  }
}

function bumpScore() {
  const el = document.getElementById("dash-score");
  if (el) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
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

function _setModal(emoji, title, text, okLabel, showInput, showCancel, placeholder, photos) {
  document.getElementById("modal-emoji").textContent = emoji;
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-text").textContent = text;
  document.getElementById("modal-ok").textContent = okLabel;
  const photosContainer = document.getElementById("modal-photos");
  photosContainer.innerHTML = "";
  if (photos && photos.length) {
    photos.forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.className = "modal-photo";
      img.loading = "lazy";
      img.alt = "Photo " + (i + 1);
      img.addEventListener("click", () => openPhotoViewer(src));
      photosContainer.appendChild(img);
    });
  }
  modalInput.style.display = showInput ? "block" : "none";
  modalInput.value = "";
  modalInput.placeholder = placeholder || "";
  modalCancel.style.display = showCancel ? "inline-flex" : "none";
  modal.classList.add("show");
  if (showInput) setTimeout(() => modalInput.focus(), 80);
  return new Promise(r => { modalResolve = r; });
}

function showModal(emoji, title, text, okLabel, photos) { return _setModal(emoji, title, text, okLabel || "Super !", false, false, null, photos); }
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
