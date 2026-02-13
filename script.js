const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameArea = document.getElementById("gameArea");
const gameOverScreen = document.getElementById("gameOverScreen");

const playBtn = document.getElementById("playBtn");
const replayBtn = document.getElementById("replayBtn");

let player = { x: 180, y: 550, w: 40, h: 40, speed: 6 };
let obstacles = [];
let bonuses = [];
let particles = [];
let score = 0;
let level = 1;
let gameStarted = false;
let gameOver = false;

let keys = { left:false, right:false, up:false, down:false };

let bestScore = parseInt(localStorage.getItem("bestScore")) || 0;
document.getElementById("bestScore").textContent = bestScore;

// Bonus accumulables
let shieldCount = 0;

// Bonus immortel
let immortal = false;
let immortalEnd = 0;

// Bonus à chaque 20 points
let nextBonusAt = 20;

// DIFFICULTY
let obstacleSpawnRate = 1000;
let lastObstacleSpawn = 0;

document.addEventListener("keydown", e => {
  if (!gameStarted) return;
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
  if (e.key === "ArrowUp") keys.up = true;
  if (e.key === "ArrowDown") keys.down = true;
});
document.addEventListener("keyup", e => {
  if (!gameStarted) return;
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
  if (e.key === "ArrowUp") keys.up = false;
  if (e.key === "ArrowDown") keys.down = false;
});

function updateDifficulty() {
  level = Math.floor(score / 10) + 1;
  obstacleSpawnRate = Math.max(150, 1000 - score * 20);
  document.getElementById("level").textContent = level;
}

function spawnObstacle() {
  const size = 40;
  const count = Math.min(6, Math.floor(level / 2) + 1);

  for (let i = 0; i < count; i++) {
    obstacles.push({
      x: Math.random() * (canvas.width - size),
      y: -size,
      w: size,
      h: size,
      speed: 3 + level * 0.6 + Math.random() * 1.5
    });
  }
}

function spawnBonus() {
  const size = 25;
  const typeChance = Math.random();

  let type = 0;
  if (typeChance < 0.7) type = 0;       // 70% points
  else if (typeChance < 0.9) type = 1;  // 20% shield
  else type = 2;                        // 10% immortalité

  bonuses.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    w: size,
    h: size,
    speed: 2 + level * 0.4,
    type: type
  });
}

function updateHUD() {
  document.getElementById("score").textContent = score;
  document.getElementById("shieldCount").textContent = shieldCount;

  const immortalEl = document.getElementById("immortal");
  if (immortal) {
    immortalEl.textContent = "Immortel : " + Math.max(0, Math.ceil((immortalEnd - performance.now()) / 1000)) + "s";
  } else {
    immortalEl.textContent = "";
  }
}

function checkCollision(a,b){
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}

function startGame() {
  gameStarted = true;
  gameOver = false;
  score = 0;
  level = 1;
  obstacles = [];
  bonuses = [];
  particles = [];
  player.x = 180;
  player.y = 550;

  shieldCount = 0;
  immortal = false;
  immortalEnd = 0;
  nextBonusAt = 20;

  updateHUD();

  startScreen.classList.add("hidden");
  gameArea.classList.remove("hidden");
  gameOverScreen.classList.add("hidden");

  lastObstacleSpawn = performance.now();
  requestAnimationFrame(update);
}

function endGame() {
  gameOver = true;
  gameStarted = false;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
  }

  document.getElementById("finalScore").textContent = score;
  document.getElementById("finalBest").textContent = bestScore;

  gameArea.classList.add("hidden");
  gameOverScreen.classList.remove("hidden");
}

function applyBonus(bonus) {
  if (bonus.type === 0) {
    score += 1;
  }
  if (bonus.type === 1) {
    if (shieldCount < 3) shieldCount += 1;
  }
  if (bonus.type === 2) {
    immortal = true;
    immortalEnd = performance.now() + 5000; // 5 secondes
  }
  updateHUD();
}

function update(now) {
  if (gameOver) return;

  if (immortal && now >= immortalEnd) {
    immortal = false;
  }

  updateDifficulty();

  if (now - lastObstacleSpawn > obstacleSpawnRate) {
    spawnObstacle();
    lastObstacleSpawn = now;
  }

  if (keys.left) player.x = Math.max(0, player.x - player.speed);
  if (keys.right) player.x = Math.min(canvas.width - player.w, player.x + player.speed);
  if (keys.up) player.y = Math.max(0, player.y - player.speed);
  if (keys.down) player.y = Math.min(canvas.height - player.h, player.y + player.speed);

  if (score >= nextBonusAt) {
    spawnBonus();
    nextBonusAt += 20;
  }

  updateHUD();

  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = immortal ? "gold" : "lime";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = "red";
  obstacles.forEach((o,i)=>{
    o.y += o.speed;
    ctx.fillRect(o.x,o.y,o.w,o.h);

    if (checkCollision(player,o)) {
      if (immortal) {
        obstacles.splice(i,1);
      } else if (shieldCount > 0) {
        shieldCount--;
        obstacles.splice(i,1);
      } else {
        endGame();
      }
    }
    if (o.y > canvas.height) {
      obstacles.splice(i,1);
      score++;
    }
  });

  bonuses.forEach((b,i)=>{
    b.y += b.speed;

    if (b.type === 0) ctx.fillStyle = "yellow";
    if (b.type === 1) ctx.fillStyle = "cyan";
    if (b.type === 2) ctx.fillStyle = "orange";

    ctx.fillRect(b.x,b.y,b.w,b.h);

    if (checkCollision(player,b)) {
      applyBonus(b);
      bonuses.splice(i,1);
    }
    if (b.y > canvas.height) bonuses.splice(i,1);
  });

  requestAnimationFrame(update);
}

playBtn.addEventListener("click", startGame);
replayBtn.addEventListener("click", startGame);
