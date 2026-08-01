// Spider-Man Movie Seat Raffle — genuinely random, no rigging.
// One exception: D4 is reserved as an accessible seat for Hussain.
// That's disclosed on-screen (not hidden), and every other seat is
// still handed out via a fair Fisher-Yates shuffle.

const ALL_SEATS = ["D4", "D5", "D6", "D7", "D8", "D9"];
const ACCESSIBLE_SEAT = "D4";
const ACCESSIBLE_NAME = "hussain"; // matched case-insensitively

const STORAGE_KEY = "spiderSeatRaffle";

let remainingSeats = [];
let results = []; // { name, seat }

function saveToStorage() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ remainingSeats, results })
  );
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data.remainingSeats) && Array.isArray(data.results)) {
      remainingSeats = data.remainingSeats;
      results = data.results;
      return true;
    }
  } catch (e) {
    /* ignore corrupt data */
  }
  return false;
}

const screens = {
  landing: document.getElementById("landing"),
  app: document.getElementById("app"),
  loading: document.getElementById("loading"),
  reveal: document.getElementById("reveal"),
  summary: document.getElementById("summary"),
};

const nameInput = document.getElementById("nameInput");
const spinBtn = document.getElementById("spinBtn");
const startBtn = document.getElementById("startBtn");
const continueBtn = document.getElementById("continueBtn");
const restartBtn = document.getElementById("restartBtn");
const errorMsg = document.getElementById("errorMsg");
const progressHint = document.getElementById("progressHint");
const flipCard = document.getElementById("flipCard");
const personName = document.getElementById("personName");
const seatNumber = document.getElementById("seatNumber");
const summaryBody = document.getElementById("summaryBody");

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
}

// Fisher-Yates shuffle — unbiased, every permutation equally likely.
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function resetState() {
  // D4 is set aside for Hussain's accessible seat — it never enters
  // the shuffle pool, so it can't accidentally go to anyone else.
  remainingSeats = shuffle(ALL_SEATS.filter((s) => s !== ACCESSIBLE_SEAT));
  results = [];
  progressHint.textContent = `0 of ${ALL_SEATS.length} seats assigned`;
  nameInput.value = "";
  errorMsg.textContent = "";
  saveToStorage();
}

function spawnParticles() {
  const container = document.getElementById("particles");
  container.innerHTML = "";
  for (let i = 0; i < 30; i++) {
    const p = document.createElement("span");
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDuration = 6 + Math.random() * 8 + "s";
    p.style.animationDelay = Math.random() * 6 + "s";
    p.style.background = Math.random() > 0.5 ? "#e62429" : "#1b6bd8";
    container.appendChild(p);
  }
}

startBtn.addEventListener("click", () => {
  resetState();
  showScreen("app");
});

spinBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (!name) {
    errorMsg.textContent = "Enter a name first.";
    return;
  }
  if (results.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
    errorMsg.textContent = "That name already has a seat.";
    return;
  }

  const isAccessibleSeatHolder = name.toLowerCase() === ACCESSIBLE_NAME;

  if (!isAccessibleSeatHolder && remainingSeats.length === 0) {
    errorMsg.textContent = "All seats are taken.";
    return;
  }

  errorMsg.textContent = "";
  showScreen("loading");
  runCalculatingAnimation();

  setTimeout(() => {
    stopCalculatingAnimation();

    // Hussain always gets the accessible seat; everyone else draws the
    // next seat off the pre-shuffled list — genuinely random, no way
    // to steer a specific regular seat to a specific person.
    const seat = isAccessibleSeatHolder
      ? ACCESSIBLE_SEAT
      : remainingSeats.shift();
    results.push({ name, seat });
    saveToStorage();

    personName.textContent = name;
    seatNumber.textContent = seat;

    flipCard.classList.remove("flipped");
    showScreen("reveal");

    // trigger flip after the card is visible
    requestAnimationFrame(() => {
      setTimeout(() => flipCard.classList.add("flipped"), 150);
    });

    const seatsLeft = allSeatsAssigned() ? 0 : 1;
    continueBtn.classList.remove("hidden");
    continueBtn.textContent = seatsLeft > 0 ? "Next Person" : "See Final Results";
  }, 2200);
});

// Purely cosmetic "crunching numbers" text — the actual seat pick
// already happened via the shuffle in resetState(); this is just flavor.
const CALC_LINES = [
  "Calculating spatial coordinates...",
  "Cross-referencing dimensional seat matrix...",
  "Resolving probability entanglement...",
  "Running Fisher-Yates permutation...",
  "Stabilizing the multiverse...",
];

let calcInterval = null;
const loadingHeading = document.querySelector("#loading h2");

function runCalculatingAnimation() {
  let i = 0;
  loadingHeading.textContent = CALC_LINES[0];
  calcInterval = setInterval(() => {
    i = (i + 1) % CALC_LINES.length;
    loadingHeading.textContent = CALC_LINES[i];
  }, 450);
}

function stopCalculatingAnimation() {
  clearInterval(calcInterval);
}

function allSeatsAssigned() {
  const hussainDone = results.some(
    (r) => r.name.toLowerCase() === ACCESSIBLE_NAME
  );
  return remainingSeats.length === 0 && hussainDone;
}

continueBtn.addEventListener("click", () => {
  progressHint.textContent = `${results.length} of ${ALL_SEATS.length} seats assigned`;
  saveToStorage();

  if (allSeatsAssigned()) {
    renderSummary();
    showScreen("summary");
  } else {
    nameInput.value = "";
    showScreen("app");
  }
});

function renderSummary() {
  summaryBody.innerHTML = "";
  results.forEach(({ name, seat }) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${escapeHtml(name)}</td><td>${seat}</td>`;
    summaryBody.appendChild(tr);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

restartBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  resetState();
  showScreen("landing");
});

spawnParticles();

// On load: resume an in-progress raffle if one exists in storage.
(function init() {
  const hasSaved = loadFromStorage();
  if (hasSaved && results.length > 0) {
    progressHint.textContent = `${results.length} of ${ALL_SEATS.length} seats assigned`;
    if (allSeatsAssigned()) {
      renderSummary();
      showScreen("summary");
    } else {
      showScreen("app");
    }
  } else {
    resetState();
    showScreen("landing");
  }
})();
