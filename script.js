const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameArea = document.getElementById("gameArea");
const gameOverScreen = document.getElementById("gameOverScreen");

const playBtn = document.getElementById("playBtn");
const replayBtn = document.getElementById("replayBtn");

let player = { x: 180, y: 550, w: 40, h: 40, speed: 6 };
let obstacles = [];
let particles = [];
let score = 0;
let level = 1;
let gameStarted = false;
let gameOver = false;

let keys = { left:false, right:false, up:false, down:false };

let bestScore = parseInt(localStorage.getItem("bestScore")) || 0;
document.getElementById("bestScore").textContent = bestScore;

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

function spawnObstacle() {
  const size = 40;
  obstacles.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    w: size,
    h: size,
    speed: 3 + level * 0.5
  });
}

function updateLevel() {
  level = Math.floor(score / 10) + 1;
  document.getElementById("level").textContent = level;
}

function createTrail(x,y) {
  particles.push({x,y,size:Math.random()*3+2,alpha:1});
}

function drawParticles() {
  for (let i = particles.length-1; i>=0; i--) {
    const p = particles[i];
    p.alpha -= 0.02;
    p.y += 1;
    if (p.alpha <= 0) particles.splice(i,1);
    else {
      ctx.fillStyle = `rgba(0,255,0,${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      ctx.fill();
    }
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
  particles = [];
  player.x = 180;
  player.y = 550;

  document.getElementById("score").textContent = score;
  document.getElementById("level").textContent = level;

  startScreen.classList.add("hidden");
  gameArea.classList.remove("hidden");
  gameOverScreen.classList.add("hidden");

  setInterval(spawnObstacle, 1000);
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

function update() {
  if (gameOver) return;

  if (keys.left) player.x = Math.max(0, player.x - player.speed);
  if (keys.right) player.x = Math.min(canvas.width - player.w, player.x + player.speed);
  if (keys.up) player.y = Math.max(0, player.y - player.speed);
  if (keys.down) player.y = Math.min(canvas.height - player.h, player.y + player.speed);

  createTrail(player.x + player.w/2, player.y + player.h);

  updateLevel();

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Player
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // Obstacles
  ctx.fillStyle = "red";
  obstacles.forEach((o,i)=>{
    o.y += o.speed;
    ctx.fillRect(o.x,o.y,o.w,o.h);
    if (checkCollision(player,o)) endGame();
    if (o.y > canvas.height) {
      obstacles.splice(i,1);
      score++;
      document.getElementById("score").textContent = score;
    }
  });

  drawParticles();

  requestAnimationFrame(update);
}

playBtn.addEventListener("click", startGame);
replayBtn.addEventListener("click", startGame);

