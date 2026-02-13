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
const pointsPerLevel = 10; // chaque 10 points = +1 niveau

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
  obstacleSpeed = obstacleBaseSpeed + (level - 1) * 0.8; // +0.8 vitesse par niveau
  document.getElementById("level").textContent = level;
}

function startGame() {
  gameStarted = true;
  gameOver = false;
  score = 0;
  obstacles = [];
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

  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
  }

  document.getElementById("finalScore").textContent = score;
  document.getElementById("finalBest").textContent = bestScore;

  gameArea.classList.add("hidden");
  gameOverScreen.classList.remove("hidden");
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

  // Déplacement fluide (X + Y)
  if (keys.left) player.x = Math.max(0, player.x - player.speed);
  if (keys.right) player.x = Math.min(canvas.width - player.width, player.x + player.speed);
  if (keys.up) player.y = Math.max(0, player.y - player.speed);
  if (keys.down) player.y = Math.min(canvas.height - player.height, player.y + player.speed);

  // Niveau
  updateLevel();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "lime";
  ctx.fillRect(player.x, player.y, player.width, player.height);

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

  animationFrameId = requestAnimationFrame(update);
}

playBtn.addEventListener("click", startGame);
replayBtn.addEventListener("click", startGame);



