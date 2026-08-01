// Spider Seat Raffle — genuinely random, no rigging.
// Seats are shuffled once at the start using Fisher-Yates,
// then handed out one at a time as people spin.

const ALL_SEATS = ["D4", "D5", "D6", "D7", "D8", "D9"];

let remainingSeats = [];
let results = []; // { name, seat }

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
  remainingSeats = shuffle(ALL_SEATS);
  results = [];
  progressHint.textContent = `0 of ${ALL_SEATS.length} seats assigned`;
  nameInput.value = "";
  errorMsg.textContent = "";
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
  if (remainingSeats.length === 0) {
    errorMsg.textContent = "All seats are taken.";
    return;
  }

  errorMsg.textContent = "";
  showScreen("loading");

  setTimeout(() => {
    // Take the next seat off the pre-shuffled list — genuinely random,
    // no way to steer a specific seat to a specific person.
    const seat = remainingSeats.shift();
    results.push({ name, seat });

    personName.textContent = name;
    seatNumber.textContent = seat;

    flipCard.classList.remove("flipped");
    showScreen("reveal");

    // trigger flip after the card is visible
    requestAnimationFrame(() => {
      setTimeout(() => flipCard.classList.add("flipped"), 150);
    });

    continueBtn.classList.remove("hidden");
    continueBtn.textContent =
      remainingSeats.length > 0 ? "Next Person" : "See Final Results";
  }, 1600);
});

continueBtn.addEventListener("click", () => {
  progressHint.textContent = `${results.length} of ${ALL_SEATS.length} seats assigned`;

  if (remainingSeats.length === 0) {
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
  resetState();
  showScreen("landing");
});

spawnParticles();
