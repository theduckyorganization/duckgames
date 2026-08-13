const scoreEl = document.querySelector('#score');
const timeEl = document.querySelector('#time');
const shotsEl = document.querySelector('#shots');
const overlay = document.querySelector('#overlay');
const overlayLabel = document.querySelector('#overlay-label');
const overlayScore = document.querySelector('#overlay-score');
const startButton = document.querySelector('#start-button');
const gallery = document.querySelector('#gallery');
const hitMessage = document.querySelector('#hit-message');
const lanes = [...document.querySelectorAll('.lane')];
const dialog = document.querySelector('#how-dialog');

let score = 0;
let time = 30;
let shots = 10;
let playing = false;
let timerId;
let spawnId;
let bestScore = Number(localStorage.getItem('luckyDuckBest') || 0);

function updateBoard() {
  scoreEl.textContent = String(score).padStart(4, '0');
  timeEl.textContent = time;
  const live = '●'.repeat(shots);
  const spent = `<span class="spent">${'○'.repeat(10 - shots)}</span>`;
  shotsEl.innerHTML = live + spent;
  shotsEl.setAttribute('aria-label', `${shots} shots remaining`);
}

function makeDuck() {
  if (!playing) return;
  const duck = document.createElement('button');
  const rare = Math.random() > 0.76;
  const isBlue = !rare && Math.random() > 0.5;
  const value = rare ? 20 : 10;
  const reverse = Math.random() > 0.5;
  duck.type = 'button';
  duck.className = `duck ${rare ? 'pink' : isBlue ? 'blue' : 'yellow'}${reverse ? ' reverse' : ''}`;
  duck.style.animationDuration = `${4.1 + Math.random() * 2.5}s`;
  duck.setAttribute('aria-label', `Shoot ${value}-point toy duck`);
  duck.innerHTML = `<span class="wing"></span><span class="eye"></span><b>+${value}</b>`;
  duck.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!playing || shots < 1 || duck.classList.contains('hit')) return;
    shots -= 1;
    score += value;
    duck.classList.add('hit');
    showHit(`+${value}`);
    updateBoard();
    setTimeout(() => duck.remove(), 240);
    if (shots === 0) endGame();
  });
  duck.addEventListener('animationend', () => duck.remove());
  lanes[Math.floor(Math.random() * lanes.length)].appendChild(duck);
}

function showHit(text) {
  hitMessage.textContent = text;
  hitMessage.classList.add('show');
  setTimeout(() => hitMessage.classList.remove('show'), 260);
}

function clearDucks() {
  document.querySelectorAll('.duck').forEach((duck) => duck.remove());
}

function startGame() {
  clearInterval(timerId);
  clearInterval(spawnId);
  clearDucks();
  score = 0; time = 30; shots = 10; playing = true;
  updateBoard();
  overlay.classList.add('hidden');
  makeDuck();
  spawnId = setInterval(makeDuck, 680);
  timerId = setInterval(() => {
    time -= 1;
    updateBoard();
    if (time <= 0) endGame();
  }, 1000);
}

function endGame() {
  if (!playing) return;
  playing = false;
  clearInterval(timerId);
  clearInterval(spawnId);
  clearDucks();
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('luckyDuckBest', String(bestScore));
  }
  overlayLabel.textContent = score === bestScore && score > 0 ? 'NEW HIGH SCORE!' : 'ROUND OVER';
  overlayScore.textContent = `${score} POINTS • BEST ${bestScore}`;
  startButton.textContent = 'PLAY AGAIN';
  overlay.classList.remove('hidden');
}

gallery.addEventListener('click', (event) => {
  if (!playing || shots < 1 || event.target.closest('.duck')) return;
  shots -= 1;
  showHit('MISS!');
  updateBoard();
  if (shots === 0) endGame();
});

startButton.addEventListener('click', (event) => { event.stopPropagation(); startGame(); });
document.querySelector('.how-button').addEventListener('click', () => dialog.showModal());
document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
document.querySelector('.dialog-play').addEventListener('click', () => { dialog.close(); startGame(); });
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && dialog.open) dialog.close(); });

updateBoard();
