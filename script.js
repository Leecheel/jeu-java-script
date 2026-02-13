const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameArea = document.getElementById("gameArea");
const playBtn = document.getElementById("playBtn");

let player = {
  x: 180,
  y: 550,
  width: 40,
  height: 40,
  speed: 10
};

let obstacles = [];
let score = 0;
let gameOver = false;
let gameStarted = false;

// Clavier
let keys = {
  left: false,
  right: false
};

// Meilleur score
let bestScore = localStorage.getItem("bestScore") || 0;
document.getElementById("bestScore").textContent = bestScore;

// Gestion clavier
document.addEventListener("keydown", (e) => {
  if (!gameStarted) return;

  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
});

// Générer obstacles
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

// Démarrer le jeu
function startGame() {
  startScreen.style.display = "none";
  gameArea.style.display = "block";
  gameStarted = true;

  spawnInterval = setInterval(spawnObstacle, 1000);
  update();
}

// Collision
function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Boucle de jeu
function update() {
  if (gameOver) return;

  // Déplacement fluide
  if (keys.left && player.x > 0) player.x -= player.speed;
  if (keys.right && player.x < canvas.width - player.width) player.x += player.speed;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Joueur
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Obstacles
  ctx.fillStyle = "red";
  obstacles.forEach((obs, index) => {
    obs.y += obs.speed;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

    if (checkCollision(player, obs)) {
      gameOver = true;
      clearInterval(spawnInterval);

      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
      }

      alert("Game Over ! Score: " + score + "\nMeilleur score: " + bestScore);
      location.reload();
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



