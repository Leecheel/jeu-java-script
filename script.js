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

let keys = { left: false, right: false };

let bestScore = localStorage.getItem("bestScore") || 0;
document.getElementById("bestScore").textContent = bestScore;

// clavier
document.addEventListener("keydown", (e) => {
  if (!gameStarted) return;
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
});

function spawnObstacle() {
  const size = 40;
  const x = Math.random() * (canvas.width - size);
  obstacles.push({
    x: x,
    y: -size,
    width: size,
    height: size,
    speed: 3 + Math.random() * 2
  });
}

let spawnInterval;

function startGame() {
  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  gameArea.classList.remove("hidden");

  gameStarted = true;
  gameOver = false;
  score = 0;
  obstacles = [];
  player.x = 180;

  document.getElementById("score").textContent = score;

  spawnInterval = setInterval(spawnObstacle, 1000);
  update();
}

function endGame() {
  gameOver = true;
  clearInterval(spawnInterval);

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

  if (keys.left && player.x > 0) player.x -= player.speed;
  if (keys.right && player.x < canvas.width - player.width) player.x += player.speed;

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

  requestAnimationFrame(update);
}

playBtn.addEventListener("click", startGame);
replayBtn.addEventListener("click", startGame);




