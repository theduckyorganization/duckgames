const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let soundOn = true;

function beep(frequency = 520, duration = 0.1) {
  if (!soundOn) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  } catch (_) {}
}

let toastTimer;
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1500);
}

const gameMeta = {
  happy: ["Tìm Vịt Vui", "2–5 TUỔI"],
  feed: ["Cho Vịt Ăn", "2–5 TUỔI"],
  count: ["Đếm Vịt Con", "2–5 TUỔI"],
  color: ["Ghép Màu", "2–5 TUỔI"],
  dress: ["Mặc Đồ Cho Vịt", "2–5 TUỔI"],
  bath: ["Tắm Cho Vịt", "2–5 TUỔI"],
  memory: ["Ghép Đôi Cảm Xúc", "5–14 TUỔI"],
  shoot: ["Lucky Duck Shoot", "6–14 TUỔI"],
  maze: ["Mê Cung Vịt", "5–14 TUỔI"],
  math: ["Toán Nhanh", "6–14 TUỔI"],
  typing: ["Đua Vịt Gõ Chữ", "7–14 TUỔI"],
  rhythm: ["Nhịp Điệu Quack", "5–14 TUỔI"],
};

function showGame(name) {
  $$(".game-panel").forEach((panel) =>
    panel.classList.toggle("active", panel.id === `game-${name}`),
  );
  $$(".game-link").forEach((link) =>
    link.classList.toggle("active", link.dataset.game === name),
  );
  $("#page-title").textContent = gameMeta[name][0];
  $("#age-badge").textContent = gameMeta[name][1];
  $("#sidebar").classList.remove("open");
  if (name !== "shoot") stopShoot();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$$(".game-link").forEach((link) =>
  link.addEventListener("click", () => showGame(link.dataset.game)),
);
$("#open-menu").addEventListener("click", () =>
  $("#sidebar").classList.add("open"),
);
$("#close-menu").addEventListener("click", () =>
  $("#sidebar").classList.remove("open"),
);
$("#sound-button").addEventListener("click", () => {
  soundOn = !soundOn;
  $("#sound-button").textContent = soundOn ? "🔊" : "🔇";
  toast(soundOn ? "Đã bật âm thanh" : "Đã tắt âm thanh");
});

// Game 1: Find the Happy Duck
const emotions = [
  { name: "VUI VẺ", sprite: 1 },
  { name: "YÊU THÍCH", sprite: 2 },
  { name: "TỨC GIẬN", sprite: 3 },
  { name: "BUỒN", sprite: 4 },
  { name: "NGẠC NHIÊN", sprite: 5 },
  { name: "NGẠI NGÙNG", sprite: 6 },
  { name: "BUỒN NGỦ", sprite: 7 },
  { name: "BỐI RỐI", sprite: 8 },
  { name: "NGẦU", sprite: 9 },
  { name: "LO LẮNG", sprite: 10 },
  { name: "HÀO HỨNG", sprite: 11 },
  { name: "SỢ HÃI", sprite: 12 },
];
let happyTarget;
let happyScore = 0;
let happyLocked = false;
function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}
function newHappyRound() {
  happyLocked = false;
  $("#happy-message").textContent = "";
  const choices = shuffle(emotions).slice(0, 4);
  happyTarget = choices[Math.floor(Math.random() * choices.length)];
  $("#happy-prompt").innerHTML =
    `🎯 Hãy tìm chú vịt đang <b>${happyTarget.name}</b>`;
  $("#happy-grid").innerHTML = choices
    .map(
      (item) =>
        `<button class="duck-choice" data-sprite="${item.sprite}" aria-label="Vịt ${item.name}"><span class="sprite s${item.sprite}"></span></button>`,
    )
    .join("");
  $$(".duck-choice", $("#happy-grid")).forEach((button) =>
    button.addEventListener("click", () => {
      if (happyLocked) return;
      if (+button.dataset.sprite === happyTarget.sprite) {
        happyLocked = true;
        button.classList.add("correct");
        happyScore++;
        $("#happy-score").textContent = happyScore;
        $("#happy-message").textContent = "🎉 Chính xác! Giỏi quá!";
        beep(760, 0.18);
      } else {
        button.classList.add("wrong");
        $("#happy-message").textContent = "Thử lại nhé!";
        beep(230, 0.12);
        setTimeout(() => button.classList.remove("wrong"), 420);
      }
    }),
  );
}
$("#happy-next").addEventListener("click", newHappyRound);
newHappyRound();

// Game 2: Feed the Duck
const foods = [
  { icon: "🌽", name: "ngô", good: true },
  { icon: "🥬", name: "rau", good: true },
  { icon: "🫛", name: "đậu", good: true },
  { icon: "🍎", name: "táo", good: true },
  { icon: "🌾", name: "hạt", good: true },
  { icon: "🪱", name: "giun", good: true },
  { icon: "🍟", name: "khoai chiên", good: false },
  { icon: "🍬", name: "kẹo", good: false },
  { icon: "🥤", name: "nước ngọt", good: false },
  { icon: "🧦", name: "tất", good: false },
  { icon: "🧴", name: "chai nhựa", good: false },
  { icon: "🔋", name: "pin", good: false },
];
let feedScore = 0;
function resetFeed() {
  feedScore = 0;
  $("#feed-score").textContent = 0;
  $("#feed-speech").textContent = "Mình đói rồi! 🥣";
  $("#feed-restart").classList.add("hidden");
  $("#food-grid").innerHTML = shuffle(foods)
    .map(
      (food, i) =>
        `<button class="food ${food.good ? "" : "bad"}" data-index="${foods.indexOf(food)}" aria-label="${food.name}">${food.icon}</button>`,
    )
    .join("");
  $$(".food").forEach((button) =>
    button.addEventListener("click", () => {
      const food = foods[+button.dataset.index];
      if (food.good) {
        feedScore++;
        button.disabled = true;
        button.style.visibility = "hidden";
        $("#feed-score").textContent = feedScore;
        $("#feed-speech").textContent = `Ngon quá! Mình thích ${food.name}! 😋`;
        beep(660, 0.12);
      } else {
        $("#feed-speech").textContent =
          `${food.icon} không phải thức ăn tốt cho vịt!`;
        button.animate(
          [
            { transform: "rotate(-6deg)" },
            { transform: "rotate(6deg)" },
            { transform: "rotate(0)" },
          ],
          { duration: 350 },
        );
        beep(220, 0.12);
      }
      if (feedScore >= 6) {
        $("#feed-speech").textContent = "No rồi! Cảm ơn bạn! 🎉";
        $("#feed-restart").classList.remove("hidden");
        toast("Hoàn thành trò Cho Vịt Ăn!");
      }
    }),
  );
}
$("#feed-restart").addEventListener("click", resetFeed);
resetFeed();

// Game 3: Memory Match
let memoryMoves = 0,
  memoryPairs = 0,
  firstCard = null,
  memoryBusy = false;
function resetMemory() {
  memoryMoves = 0;
  memoryPairs = 0;
  firstCard = null;
  memoryBusy = false;
  $("#memory-moves").textContent = 0;
  $("#memory-pairs").textContent = 0;
  const cards = shuffle([1, 2, 3, 5, 8, 11, 1, 2, 3, 5, 8, 11]);
  $("#memory-grid").innerHTML = cards
    .map(
      (sprite, i) =>
        `<button class="memory-card" data-sprite="${sprite}" data-id="${i}" aria-label="Thẻ vịt chưa lật"><span class="memory-inner"><span class="memory-front"></span><span class="memory-back"><span class="sprite s${sprite}"></span></span></span></button>`,
    )
    .join("");
  $$(".memory-card").forEach((card) =>
    card.addEventListener("click", () => flipMemory(card)),
  );
}
function flipMemory(card) {
  if (
    memoryBusy ||
    card.classList.contains("flipped") ||
    card.classList.contains("matched")
  )
    return;
  card.classList.add("flipped");
  beep(470, 0.07);
  if (!firstCard) {
    firstCard = card;
    return;
  }
  memoryMoves++;
  $("#memory-moves").textContent = memoryMoves;
  if (card.dataset.sprite === firstCard.dataset.sprite) {
    card.classList.add("matched");
    firstCard.classList.add("matched");
    card.classList.remove("flipped");
    firstCard.classList.remove("flipped");
    firstCard = null;
    memoryPairs++;
    $("#memory-pairs").textContent = memoryPairs;
    beep(780, 0.14);
    if (memoryPairs === 6)
      setTimeout(() => toast(`Bạn thắng sau ${memoryMoves} lượt! 🏆`), 250);
  } else {
    memoryBusy = true;
    const previous = firstCard;
    firstCard = null;
    setTimeout(() => {
      card.classList.remove("flipped");
      previous.classList.remove("flipped");
      memoryBusy = false;
    }, 760);
  }
}
$("#memory-restart").addEventListener("click", resetMemory);
resetMemory();

// Game 4: Lucky Duck Shoot
let shootScore = 0,
  shootTime = 30,
  shootShots = 10,
  shootPlaying = false,
  shootTimer,
  shootSpawner;
function updateShoot() {
  $("#shoot-score").textContent = shootScore;
  $("#shoot-time").textContent = shootTime;
  $("#shoot-shots").textContent = shootShots;
}
function spawnTarget() {
  if (!shootPlaying) return;
  const lane = $$(".shoot-lane")[Math.floor(Math.random() * 3)];
  const target = document.createElement("button");
  const rare = Math.random() > 0.77,
    reverse = Math.random() > 0.5,
    value = rare ? 20 : 10,
    sprite = rare ? 2 : Math.random() > 0.5 ? 1 : 13;
  target.className = `target-duck${reverse ? " reverse" : ""}`;
  target.style.animationDuration = `${4.1 + Math.random() * 2.4}s`;
  target.innerHTML = `<span class="sprite s${sprite}"></span><b>+${value}</b>`;
  target.setAttribute("aria-label", `Bắn vịt đồ chơi ${value} điểm`);
  lane.appendChild(target);
  target.addEventListener("animationend", () => target.remove());
  target.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!shootPlaying || shootShots < 1) return;
    shootShots--;
    shootScore += value;
    target.remove();
    updateShoot();
    beep(820, 0.08);
    toast(`+${value} điểm`);
    if (!shootShots) endShoot();
  });
}
function startShoot() {
  stopShoot();
  shootScore = 0;
  shootTime = 30;
  shootShots = 10;
  shootPlaying = true;
  updateShoot();
  $("#shoot-overlay").classList.add("hidden");
  spawnTarget();
  shootSpawner = setInterval(spawnTarget, 700);
  shootTimer = setInterval(() => {
    shootTime--;
    updateShoot();
    if (shootTime <= 0) endShoot();
  }, 1000);
}
function stopShoot() {
  shootPlaying = false;
  clearInterval(shootTimer);
  clearInterval(shootSpawner);
  $$(".target-duck").forEach((el) => el.remove());
}
function endShoot() {
  stopShoot();
  $("#shoot-end-title").textContent = "Hết lượt!";
  $("#shoot-end-score").textContent = `Bạn đạt ${shootScore} điểm`;
  $("#shoot-start").textContent = "CHƠI LẠI";
  $("#shoot-overlay").classList.remove("hidden");
}
$("#shoot-start").addEventListener("click", startShoot);
$("#shoot-stage").addEventListener("click", (event) => {
  if (
    !shootPlaying ||
    event.target.closest(".target-duck") ||
    event.target.closest(".shoot-overlay")
  )
    return;
  shootShots--;
  updateShoot();
  beep(180, 0.08);
  if (!shootShots) endShoot();
});

// Game 5: Count the Ducklings
let countScore = 0,
  countAnswer = 1;
function newCountRound() {
  countAnswer = 1 + Math.floor(Math.random() * 8);
  $("#count-message").textContent = "";
  $("#count-pond").innerHTML = Array.from(
    { length: countAnswer },
    (_, i) => `<span class="count-duck sprite s${i % 2 ? 1 : 11}"></span>`,
  ).join("");
  const choices = new Set([countAnswer]);
  while (choices.size < 3) choices.add(1 + Math.floor(Math.random() * 9));
  $("#number-choices").innerHTML = shuffle([...choices])
    .map((n) => `<button data-number="${n}">${n}</button>`)
    .join("");
  $$("#number-choices button").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (+btn.dataset.number === countAnswer) {
        countScore++;
        $("#count-score").textContent = countScore;
        $("#count-message").textContent = "🎉 Đúng rồi!";
        beep(760, 0.15);
      } else {
        $("#count-message").textContent = "Đếm lại một lần nữa nhé!";
        beep(220, 0.1);
      }
    }),
  );
}
$("#count-next").addEventListener("click", newCountRound);
newCountRound();

// Game 6: Match Colors
const colors = [
  { name: "ĐỎ", hex: "#ff5d74" },
  { name: "VÀNG", hex: "#ffc83d" },
  { name: "XANH LÁ", hex: "#41c98c" },
  { name: "XANH DƯƠNG", hex: "#4b9cff" },
  { name: "TÍM", hex: "#8b69e8" },
  { name: "CAM", hex: "#ff8c42" },
];
let colorTarget,
  colorScore = 0;
function newColorRound() {
  colorTarget = colors[Math.floor(Math.random() * colors.length)];
  $("#color-question").textContent = `Hãy tìm màu ${colorTarget.name}`;
  $("#color-message").textContent = "";
  $("#color-choices").innerHTML = shuffle(colors)
    .map(
      (c) =>
        `<button class="color-choice" data-name="${c.name}" style="background:${c.hex}" aria-label="Màu ${c.name}"></button>`,
    )
    .join("");
  $$(".color-choice").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (btn.dataset.name === colorTarget.name) {
        colorScore++;
        $("#color-score").textContent = colorScore;
        $("#color-message").textContent = "🌈 Chính xác!";
        beep(740, 0.14);
      } else {
        $("#color-message").textContent = "Chưa đúng, thử màu khác!";
        beep(210, 0.1);
      }
    }),
  );
}
$("#color-next").addEventListener("click", newColorRound);
newColorRound();

// Game 7: Dress Up Duck
$$(".dress-options button").forEach((btn) =>
  btn.addEventListener("click", () => {
    $(`#${btn.dataset.layer}-layer`).textContent = btn.dataset.item;
    beep(520, 0.06);
  }),
);
$("#dress-random").addEventListener("click", () => {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  $("#hat-layer").textContent = pick(["🎩", "👑", "🧢", ""]);
  $("#glasses-layer").textContent = pick(["🕶️", "👓", "🥽", ""]);
  $("#accessory-layer").textContent = pick(["🎀", "🌸", "⭐", ""]);
  beep(800, 0.14);
});

// Game 8: Duck Bath
function resetBath() {
  let remaining = 12;
  $("#bubble-count").textContent = remaining;
  $("#bath-message").textContent = "";
  $("#bubbles").innerHTML = "";
  for (let i = 0; i < 12; i++) {
    const bubble = document.createElement("button");
    const size = 35 + Math.random() * 45;
    bubble.className = "bubble";
    bubble.style.cssText = `width:${size}px;height:${size}px;left:${5 + Math.random() * 85}%;top:${8 + Math.random() * 75}%`;
    bubble.setAttribute("aria-label", "Làm vỡ bong bóng");
    bubble.addEventListener("click", () => {
      if (bubble.classList.contains("pop")) return;
      bubble.classList.add("pop");
      remaining--;
      $("#bubble-count").textContent = remaining;
      beep(500 + Math.random() * 250, 0.06);
      setTimeout(() => bubble.remove(), 200);
      if (!remaining) {
        $("#bath-message").textContent = "✨ Sạch bóng rồi!";
        toast("Chú vịt đã sạch sẽ!");
      }
    });
    $("#bubbles").appendChild(bubble);
  }
}
$("#bath-restart").addEventListener("click", resetBath);
resetBath();

// Game 9: Duck Maze
const mazeMap = [
  [0, 1, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 1, 0, 0, 0, 0],
  [1, 1, 0, 1, 0, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
];
let mazePlayer = { r: 0, c: 0 },
  mazeSteps = 0;
function drawMaze() {
  const grid = $("#maze-grid");
  grid.innerHTML = "";
  mazeMap.forEach((row, r) =>
    row.forEach((cell, c) => {
      const el = document.createElement("div");
      el.className = `maze-cell ${cell ? "wall" : "path"}${r === 5 && c === 7 ? " goal" : ""}`;
      if (r === 5 && c === 7) el.textContent = "🌊";
      if (r === mazePlayer.r && c === mazePlayer.c)
        el.innerHTML = '<span class="maze-player sprite s13"></span>';
      grid.appendChild(el);
    }),
  );
}
function resetMaze() {
  mazePlayer = { r: 0, c: 0 };
  mazeSteps = 0;
  $("#maze-steps").textContent = 0;
  drawMaze();
}
function moveMaze(dir) {
  const delta = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }[
      dir
    ],
    r = mazePlayer.r + delta[0],
    c = mazePlayer.c + delta[1];
  if (r < 0 || r >= 6 || c < 0 || c >= 8 || mazeMap[r][c]) {
    beep(190, 0.08);
    return;
  }
  mazePlayer = { r, c };
  mazeSteps++;
  $("#maze-steps").textContent = mazeSteps;
  drawMaze();
  beep(480, 0.05);
  if (r === 5 && c === 7) toast(`Về đến ao sau ${mazeSteps} bước! 🏆`);
}
$$(".maze-controls button").forEach((btn) =>
  btn.addEventListener("click", () => moveMaze(btn.dataset.move)),
);
$("#maze-restart").addEventListener("click", resetMaze);
resetMaze();
document.addEventListener("keydown", (e) => {
  if (!$("#game-maze").classList.contains("active")) return;
  const keys = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
  };
  if (keys[e.key]) {
    e.preventDefault();
    moveMaze(keys[e.key]);
  }
});

// Game 10: Quick Math
let mathScore = 0,
  mathTime = 30,
  mathRunning = false,
  mathTimer,
  mathAnswer = 0;
function newMathQuestion() {
  const a = 1 + Math.floor(Math.random() * 12),
    b = 1 + Math.floor(Math.random() * 12),
    plus = Math.random() > 0.35;
  mathAnswer = plus ? a + b : Math.max(a, b) - Math.min(a, b);
  $("#math-question").textContent = plus
    ? `${a} + ${b} = ?`
    : `${Math.max(a, b)} − ${Math.min(a, b)} = ?`;
  const set = new Set([mathAnswer]);
  while (set.size < 3)
    set.add(Math.max(0, mathAnswer - 3 + Math.floor(Math.random() * 7)));
  $("#math-choices").innerHTML = shuffle([...set])
    .map((n) => `<button data-answer="${n}">${n}</button>`)
    .join("");
  $$("#math-choices button").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (!mathRunning) return;
      if (+btn.dataset.answer === mathAnswer) {
        mathScore++;
        $("#math-score").textContent = mathScore;
        beep(760, 0.1);
        newMathQuestion();
      } else {
        beep(200, 0.1);
      }
    }),
  );
}
function startMath() {
  clearInterval(mathTimer);
  mathScore = 0;
  mathTime = 30;
  mathRunning = true;
  $("#math-score").textContent = 0;
  $("#math-time").textContent = 30;
  $("#math-start").textContent = "ĐANG CHƠI…";
  newMathQuestion();
  mathTimer = setInterval(() => {
    mathTime--;
    $("#math-time").textContent = mathTime;
    if (!mathTime) {
      clearInterval(mathTimer);
      mathRunning = false;
      $("#math-start").textContent = "CHƠI LẠI";
      toast(`Hết giờ: ${mathScore} câu đúng!`);
    }
  }, 1000);
}
$("#math-start").addEventListener("click", startMath);

// Game 11: Duck Typing Race
const typingWords = [
  "DUCK",
  "POND",
  "QUACK",
  "WATER",
  "HAPPY",
  "YELLOW",
  "SWIM",
  "BREAD",
  "FEATHER",
  "WINGS",
];
let typingScore = 0,
  typingPlaying = false,
  currentWord = "";
function nextTyping() {
  currentWord = typingWords[typingScore];
  $("#typing-word").textContent = currentWord;
  $("#typing-input").value = "";
  $("#typing-input").focus();
}
function startTyping() {
  typingScore = 0;
  typingPlaying = true;
  $("#typing-score").textContent = 0;
  $("#race-duck").style.left = "0%";
  $("#typing-message").textContent = "Gõ đúng từ phía trên";
  $("#typing-start").textContent = "CHƠI LẠI";
  nextTyping();
}
$("#typing-input").addEventListener("input", (e) => {
  if (!typingPlaying) return;
  if (e.target.value.trim().toUpperCase() === currentWord) {
    typingScore++;
    $("#typing-score").textContent = typingScore;
    $("#race-duck").style.left =
      `calc(${typingScore * 9}% - ${typingScore * 2}px)`;
    beep(720, 0.08);
    if (typingScore === 10) {
      typingPlaying = false;
      $("#typing-word").textContent = "YOU WIN!";
      $("#typing-message").textContent = "🏆 Chú vịt đã về đích!";
      toast("Bạn đã thắng cuộc đua!");
    } else nextTyping();
  }
});
$("#typing-start").addEventListener("click", startTyping);

// Game 12: Quack Rhythm
let rhythmSequence = [],
  rhythmInput = [],
  rhythmPlaying = false;
const pads = $$(".pad");
function flashPad(index, delay = 0) {
  setTimeout(() => {
    pads[index].classList.add("lit");
    beep([320, 420, 520, 620][index], 0.16);
    setTimeout(() => pads[index].classList.remove("lit"), 280);
  }, delay);
}
function playRhythm() {
  rhythmPlaying = false;
  $("#rhythm-message").textContent = "Hãy ghi nhớ…";
  rhythmSequence.forEach((pad, i) => flashPad(pad, i * 550));
  setTimeout(
    () => {
      rhythmInput = [];
      rhythmPlaying = true;
      $("#rhythm-message").textContent = "Đến lượt bạn!";
    },
    rhythmSequence.length * 550 + 250,
  );
}
function nextRhythm() {
  rhythmSequence.push(Math.floor(Math.random() * 4));
  $("#rhythm-level").textContent = rhythmSequence.length;
  setTimeout(playRhythm, 500);
}
function startRhythm() {
  rhythmSequence = [];
  rhythmInput = [];
  $("#rhythm-level").textContent = 0;
  $("#rhythm-start").textContent = "CHƠI LẠI";
  nextRhythm();
}
pads.forEach((pad, index) =>
  pad.addEventListener("click", () => {
    if (!rhythmPlaying) return;
    flashPad(index);
    rhythmInput.push(index);
    const pos = rhythmInput.length - 1;
    if (rhythmInput[pos] !== rhythmSequence[pos]) {
      rhythmPlaying = false;
      $("#rhythm-message").textContent =
        `Sai rồi! Bạn đạt cấp ${rhythmSequence.length}`;
      beep(180, 0.25);
      return;
    }
    if (rhythmInput.length === rhythmSequence.length) {
      rhythmPlaying = false;
      $("#rhythm-message").textContent = "Chính xác! Chuỗi dài hơn nhé…";
      beep(820, 0.18);
      nextRhythm();
    }
  }),
);
$("#rhythm-start").addEventListener("click", startRhythm);

window.addEventListener("resize", () => {
  if (innerWidth > 900) $("#sidebar").classList.remove("open");
});
