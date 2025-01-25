let config = {
  type: Phaser.AUTO,
  width: 400,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }, // Sin gravedad
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

let player;
let cursors;
let obstacles;
let coins;
let score = 0;
let lives = 3;
let scoreText;
let livesText;

function preload() {
  // Cargar recursos
  this.load.image("player", "ruta/dude.png"); // Reemplaza con la ruta a la imagen del jugador
  this.load.image("obstacle", "assets/bomb.png"); // Reemplaza con la ruta del obstáculo
  this.load.image("coin", "assets/gift.png"); // Reemplaza con la ruta de la moneda
  this.load.image("background", "assets/BG_01.png"); // Fondo
}

function create() {
  // Fondo
  this.add.image(200, 300, "background").setScale(2);

  // Jugador
  player = this.physics.add.sprite(200, 550, "player").setScale(0.5);
  player.setCollideWorldBounds(true);

  // Grupos de obstáculos y monedas
  obstacles = this.physics.add.group();
  coins = this.physics.add.group();

  // Controles
  cursors = this.input.keyboard.createCursorKeys();

  // Texto de puntaje y vidas
  scoreText = this.add.text(10, 10, "Monedas: 0", {
    fontSize: "20px",
    fill: "#fff",
  });
  livesText = this.add.text(10, 40, "Vidas: 3", {
    fontSize: "20px",
    fill: "#fff",
  });

  // Colisiones
  this.physics.add.collider(player, obstacles, hitObstacle, null, this);
  this.physics.add.overlap(player, coins, collectCoin, null, this);

  // Temporizadores para generar obstáculos y monedas
  this.time.addEvent({
    delay: 1000,
    callback: spawnObstacle,
    callbackScope: this,
    loop: true,
  });

  this.time.addEvent({
    delay: 1500,
    callback: spawnCoin,
    callbackScope: this,
    loop: true,
  });
}

function update() {
  // Movimiento del jugador
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  // El jugador siempre asciende
  player.y -= 0.2;

  // Fin del juego
  if (player.y < 0) {
    if (score >= 10) {
      this.add.text(100, 250, "¡Ganaste!", { fontSize: "32px", fill: "#0f0" });
      this.scene.pause();
    } else {
      this.add.text(100, 250, "Perdiste", { fontSize: "32px", fill: "#f00" });
      this.scene.pause();
    }
  }
}

// Función para generar obstáculos
function spawnObstacle() {
  const x = Phaser.Math.Between(50, 350);
  const obstacle = obstacles.create(x, 0, "obstacle").setScale(0.5);
  obstacle.setVelocityY(200); // Velocidad de caída

  // Eliminar obstáculos fuera de pantalla
  obstacle.checkWorldBounds = true;
  obstacle.outOfBoundsKill = true;
}

// Función para generar monedas
function spawnCoin() {
  const x = Phaser.Math.Between(50, 350);
  const coin = coins.create(x, Phaser.Math.Between(50, 300), "coin").setScale(0.5);

  // Desactivar gravedad para las monedas
  coin.body.allowGravity = false;

  // Añadir flotación sinusoidal
  this.tweens.add({
    targets: coin,
    y: coin.y + 20, // Amplitud del movimiento
    duration: 2000, // Duración del movimiento (ms)
    yoyo: true, // Regresar al punto inicial
    repeat: -1, // Repetir indefinidamente
    ease: "Sine.easeInOut", // Movimiento suave
  });
}

// Colisión con un obstáculo
function hitObstacle(player, obstacle) {
  obstacle.destroy();
  lives--;
  livesText.setText("Vidas: " + lives);

  if (lives <= 0) {
    this.add.text(100, 250, "Perdiste", { fontSize: "32px", fill: "#f00" });
    this.scene.pause();
  }
}

// Recolección de monedas
function collectCoin(player, coin) {
  coin.destroy();
  score++;
  scoreText.setText("Monedas: " + score);
}


export default gameScene;
