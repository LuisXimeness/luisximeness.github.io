const slots = document.querySelectorAll(".slot");
const leverBall = document.querySelector(".lever-ball");
const resetButton = document.getElementById("resetButton");
const jackpotOverlay = document.getElementById("jackpotOverlay");
const forceSlotButton = document.getElementById("forceSlotButton");

let immortalRounds = 0;

/* ===== CONFIG ===== */
const SYMBOLS = [1, 2, 3, 4];
const JACKPOT_SYMBOL = 4;
const SYMBOL_HEIGHT = 220;

let lockedSlots = [false, false, false];
let lockedSymbols = [null, null, null];
let isSpinning = false;

/* ===== DUPLICAÇÃO INVISÍVEL DO REEL ===== */
slots.forEach((slot) => {
  const reel = slot.querySelector(".reel");
  const original = reel.innerHTML;
  reel.innerHTML += original;
  reel.style.transform = "translateY(0)";
});

/* ===== ALAVANCA ===== */
let isDragging = false;
let startY = 0;

const TOP_LIMIT = -26;
const BOTTOM_LIMIT = 160;
const FORCE_REQUIRED = 130;

leverBall.addEventListener("mousedown", (e) => {
  if (isSpinning) return;
  isDragging = true;
  startY = e.clientY;
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging || isSpinning) return;

  let delta = (e.clientY - startY) * 0.65;
  let newTop = TOP_LIMIT + delta;

  if (newTop < TOP_LIMIT) newTop = TOP_LIMIT;
  if (newTop > BOTTOM_LIMIT) newTop = BOTTOM_LIMIT;

  leverBall.style.top = `${newTop}px`;
});

document.addEventListener("mouseup", () => {
  if (!isDragging || isSpinning) return;
  isDragging = false;

  let pulled = parseInt(leverBall.style.top || TOP_LIMIT) - TOP_LIMIT;

  if (pulled >= FORCE_REQUIRED) {
    startSpin();
  } else {
    resetLever();
  }
});

/* ===== SPIN ===== */
function startSpin() {
  if (immortalRounds > 0) {
    immortalRounds--;
    console.log(
      "Merlin Sanchez está imortal por mais",
      immortalRounds,
      "rodadas",
    );
  }

  isSpinning = true;
  leverBall.style.top = `${BOTTOM_LIMIT}px`;

  slots.forEach((slot, index) => {
    if (lockedSlots[index]) return;
    spinReel(slot, index, 1200 + index * 600);
  });

  setTimeout(() => {
    resetLever();
    isSpinning = false;
    checkJackpot(); // verificação final segura
  }, 3500);
}

function spinReel(slot, index, duration) {
  const reel = slot.querySelector(".reel");

  const finalSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const finalIndex = SYMBOLS.indexOf(finalSymbol);

  const spins = 3;
  const targetIndex = spins * SYMBOLS.length + finalIndex;
  const finalOffset = -targetIndex * SYMBOL_HEIGHT;

  reel.style.transition = `transform ${duration}ms cubic-bezier(0.12, 0.6, 0.25, 1)`;
  reel.style.transform = `translateY(${finalOffset}px)`;

  setTimeout(() => {
    reel.style.transition = "none";
    reel.style.transform = `translateY(${-finalIndex * SYMBOL_HEIGHT}px)`;

    // 🔥 REGISTRO CORRETO DO SÍMBOLO FINAL
    if (finalSymbol === JACKPOT_SYMBOL) {
      lockSlot(slot, index, finalSymbol);
    }
  }, duration);
}

/* ===== BLOQUEIO ===== */
function lockSlot(slot, index, symbol) {
  if (lockedSlots[index]) return;

  lockedSlots[index] = true;
  lockedSymbols[index] = symbol;
  slot.classList.add("locked");

  document.body.classList.add("shake");
  setTimeout(() => document.body.classList.remove("shake"), 400);

  checkJackpot();
}

/* ===== JACKPOT ===== */
function checkJackpot() {
  const jackpot =
    lockedSlots.every((v) => v) &&
    lockedSymbols.every((s) => s === JACKPOT_SYMBOL);

  if (jackpot) {
    activateJackpot();
  }
}

function activateJackpot() {
  immortalRounds = 3;

  document.body.classList.add("mega-shake");
  jackpotOverlay.classList.add("active");

  setTimeout(() => {
    jackpotOverlay.classList.remove("active");
    document.body.classList.remove("mega-shake");
  }, 3000);
}

/* ===== RESET ===== */
function resetLever() {
  leverBall.style.transition = "top 0.4s ease-out";
  leverBall.style.top = `${TOP_LIMIT}px`;
  setTimeout(() => (leverBall.style.transition = "none"), 400);
}

resetButton.addEventListener("click", () => {
  lockedSlots = [false, false, false];
  lockedSymbols = [null, null, null];

  slots.forEach((slot) => {
    slot.classList.remove("locked");
    const reel = slot.querySelector(".reel");
    reel.style.transition = "none";
    reel.style.transform = "translateY(0)";
  });
});

/* ===== BOTÃO FORÇAR SLOT PARA JACKPOT ===== */
function forceNextSlotToJackpot() {
  if (isSpinning) return;

  for (let i = 0; i < slots.length; i++) {
    if (lockedSlots[i]) continue;

    const slot = slots[i];
    const reel = slot.querySelector(".reel");
    const finalIndex = SYMBOLS.indexOf(JACKPOT_SYMBOL);

    reel.style.transition = "none";
    reel.style.transform = `translateY(${-finalIndex * SYMBOL_HEIGHT}px)`;

    // 🔥 CORREÇÃO DEFINITIVA
    lockSlot(slot, i, JACKPOT_SYMBOL);
    break;
  }
}

forceSlotButton.addEventListener("click", forceNextSlotToJackpot);
