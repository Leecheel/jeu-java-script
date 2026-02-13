// ------------------------------------------------------------
// VARIABLES GLOBALES
// ------------------------------------------------------------
var imgPlayer, imgEnemy;
var player;
var enemies;
var score = 0;
var startTime;
var gameOver = false;

// ------------------------------------------------------------
// CHARGEMENT DES IMAGES
// ------------------------------------------------------------
function preload() {
  imgPlayer = loadImage("asset/smiley.png");
  imgEnemy  = loadImage("asset/smiley_blood.png");
}

// ------------------------------------------------------------
// INITIALISATION DU JEU
// ------------------------------------------------------------
function setup() {
  createCanvas(800, 300);
  textSize(24);

  // Enregistre le moment du début de la partie
  startTime = millis();

  // --- Création du joueur ---
  player = createSprite(400, 150);
  player.addImage(imgPlayer);

  // --- Création des ennemis ---
  enemies = new Group();
  for (var i = 0; i < 10; i++) {
    var e = createSprite(random(20, 780), random(20, 280));
    e.addImage(imgEnemy);
    e.setVelocity(random(-5, 5), random(-5, 5));
    enemies.add(e);
  }

  // --- Création des murs (bords) ---
  wallLeft   = createSprite(-5, 150, 10, 300);
  wallRight  = createSprite(805, 150, 10, 300);
  wallTop    = createSprite(400, -5, 800, 10);
  wallBottom = createSprite(400, 305, 800, 10);

  wallLeft.immovable = true;
  wallRight.immovable = true;
  wallTop.immovable = true;
  wallBottom.immovable = true;
}

// ------------------------------------------------------------
// BOUCLE PRINCIPALE DU JEU
// ------------------------------------------------------------
function draw() {
  background(240);

  if (!gameOver) {

    // --- Calcul du temps restant ---
    var elapsed   = millis() - startTime;
    var remaining = 8 - round(elapsed / 1000);

    if (remaining <= 0) {
      gameOver = true;
      remaining = 0;
    }

    // --- Déplacement du joueur ---
    if (keyIsDown(LEFT_ARROW))  player.position.x -= 5;
    if (keyIsDown(RIGHT_ARROW)) player.position.x += 5;
    if (keyIsDown(UP_ARROW))    player.position.y -= 5;
    if (keyIsDown(DOWN_ARROW))  player.position.y += 5;

    // Empêche le joueur de sortir de la fenêtre
    player.position.x = constrain(player.position.x, 20, width - 20);
    player.position.y = constrain(player.position.y, 20, height - 20);

    // --- Collisions des ennemis ---
    enemies.bounce(wallLeft);
    enemies.bounce(wallRight);
    enemies.bounce(wallTop);
    enemies.bounce(wallBottom);
    enemies.bounce(enemies);

    // --- Collision joueur / ennemis ---
    player.overlap(enemies, hitEnemy);

    // --- Affichage du score et du temps ---
    text("Score : " + score, 10, 30);
    text("Temps : " + remaining + "s", 10, 60);

  } else {
    // Fin de la partie : affichage du score au centre
    textAlign(CENTER);
    text("FIN ! Score : " + score, width / 2, height / 2);
  }

  drawSprites();
}

// ------------------------------------------------------------
// FONCTION APPELÉE QUAND LE JOUEUR ATTRAPE UN ENNEMI
// ------------------------------------------------------------
function hitEnemy(player, enemy) {
  enemy.remove();
  score++;
}
