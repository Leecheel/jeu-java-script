const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameArea = document.getElementById("gameArea");
const gameOverScreen = document.getElementById("gameOverScreen");

const playBtn = document.getElementById("playBtn");
const replayBtn = document.getElementById("replayBtn");

let player = {
  x: 180,
  y: 550,
  width: 40,
  height: 40,
  speed: 6
};

let obstacles = [];
let particles = [];
let stars = [];
let score = 0;
let gameOver = false;
let gameStarted = false;

let keys = { left: false, right: false, up: false, down: false };

// Meilleur score
let bestScore = parseInt(localStorage.getItem("bestScore")) || 0;
document.getElementById("bestScore").textContent = bestScore;

let spawnInterval = null;
let animationFrameId = null;

// Niveau & vitesse
let level = 1;
let obstacleBaseSpeed = 3;
let obstacleSpeed = obstacleBaseSpeed;
const pointsPerLevel = 10;

// === input ===
document.addEventListener("keydown", (e) => {
  if (!gameStarted) return;
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
  if (e.key === "ArrowUp") keys.up = true;
  if (e.key === "ArrowDown") keys.down = true;
});

document.addEventListener("keyup", (e) => {
  if (!gameStarted) return;
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
  if (e.key === "ArrowUp") keys.up = false;
  if (e.key === "ArrowDown") keys.down = false;
});

// === stars background ===
for (let i = 0; i < 80; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 1,
    speed: Math.random() * 1 + 0.5
  });
}

function drawStars() {
  ctx.fillStyle = "white";
  stars.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
    s.y += s.speed + (level * 0.1);
    if (s.y > canvas.height) s.y = 0;
  });
}

// === particles ===
function createTrail(x, y) {
  particles.push({
    x,
    y,
    size: Math.random() * 3 + 2,
    alpha: 1,
    speedY: Math.random() * 1 + 0.5
  });
}

function createExplosion(x, y) {
  for (let i = 0; i < 30; i++) {
    particles.push({
      x,
      y,
      size: Math.random() * 4 + 2,
      alpha: 1,
      speedX: (Math.random() - 0.5) * 6,
      speedY: (Math.random() - 0.5) * 6
    });
  }
}

function drawParticles() {
  particles.forEach((p, i) => {
    p.x += p.speedX || 0;
    p.y += p.speedY || p.speedY || 0;
    p.alpha -= 0.02;

    if (p.alpha <= 0) particles.splice(i, 1);
    else {
      ctx.fillStyle = `rgba(0, 255, 0, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// === obstacles ===
function spawnObstacle() {
  const size = 40;
  const x = Math.random() * (canvas.width - size);
  obstacles.push({
    x,
    y: -size,
    width: size,
    height: size,
    speed: obstacleSpeed + Math.random() * 1.5
  });
}

function updateLevel() {
  level = Math.floor(score / pointsPerLevel) + 1;
  obstacleSpeed = obstacleBaseSpeed + (level - 1) * 0.8;
  document.getElementById("level").textContent = level;
}

// === game ===
function startGame() {
  gameStarted = true;
  gameOver = false;
  score = 0;
  obstacles = [];
  particles = [];
  player.x = 180;
  player.y = 550;

  level = 1;
  obstacleSpeed = obstacleBaseSpeed;

  document.getElementById("score").textContent = score;
  document.getElementById("bestScore").textContent = bestScore;
  document.getElementById("level").textContent = level;

  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  gameArea.classList.remove("hidden");

  if (spawnInterval) clearInterval(spawnInterval);
  spawnInterval = setInterval(spawnObstacle, 1000);

  update();
}

function endGame() {
  gameOver = true;
  gameStarted = false;

  clearInterval(spawnInterval);
  spawnInterval = null;

  createExplosion(player.x + player.width / 2, player.y + player.height / 2);

  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
  }

  document.getElementById("finalScore").textContent = score;
  document.getElementById("finalBest").textContent = bestScore;

  setTimeout(() => {
    gameArea.classList.add("hidden");
    gameOverScreen.classList.remove("hidden");
  }, 500);
}

function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function update() {
  if (gameOver) return;

  // déplacement
  if (keys.left) player.x = Math.max(0, player.x - player.speed);
  if (keys.right) player.x = Math.min(canvas.width - player.width, player.x + player.speed);
  if (keys.up) player.y = Math.max(0, player.y - player.speed);
  if (keys.down) player.y = Math.min(canvas.height - player.height, player.y + player.speed);

  // traînée
  createTrail(player.x + player.width / 2, player.y + player.height);

  // niveau
  updateLevel();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // décor étoilé
  drawStars();

  // joueur
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // obstacles
  ctx.fillStyle = "red";
  obstacles.forEach((obs, index) => {
    obs.y += obs.speed;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

    if (checkCollision(player, obs)) {
      endGame();
    }

    if (obs.y > canvas.height) {
      obstacles.splice(index, 1);
      score++;
      document.getElementById("score").textContent = score;
    }
  });

  drawParticles();

  animationFrameId = requestAnimationFrame(update);
}

playBtn.addEventListener("click", startGame);
replayBtn.addEventListener("click", startGame);
