let config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
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
let slowObstacles;
let coins;
let score = 0;
let lives = 3;
let collectedCoins = 0;
let scoreText;
let livesText;
let timerText;
let backgroundTile;
let timer;
let timeLimit = 10;
let midTime;
let slowObstaclesCreated = false; // Asegurarse de que solo se creen una vez

function preload() {
  this.load.image("player", "ruta/dude.png");
  this.load.image("obstacle", "assets/star.png");
  this.load.image("slowObstacle", "assets/bomb.png");
  this.load.image("coin", "assets/gift.png");
  this.load.image("background", "assets/Fondo1.png");
}

function create() {
  midTime = Math.floor(timeLimit / 2);

  backgroundTile = this.add.tileSprite(0, 0, this.sys.canvas.width, this.sys.canvas.height, "background");
  backgroundTile.setOrigin(0, 0);

  player = this.physics.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "player").setScale(0.5);
  player.setCollideWorldBounds(true);

  obstacles = this.physics.add.group();
  slowObstacles = this.physics.add.group();
  coins = this.physics.add.group();

  cursors = this.input.keyboard.createCursorKeys();

  scoreText = this.add.text(10, 10, "Monedas: 0", { fontSize: "20px", fill: "#fff" });
  livesText = this.add.text(10, 40, "Vidas: 3", { fontSize: "20px", fill: "#fff" });

  timerText = this.add.text(300, 10, `Tiempo: ${timeLimit}`, { fontSize: "20px", fill: "#fff" });

  timer = this.time.addEvent({
    delay: 1000,
    callback: updateTimer,
    callbackScope: this,
    loop: true,
  });

  this.physics.add.collider(player, obstacles, hitObstacle, null, this);
  this.physics.add.collider(player, slowObstacles, hitObstacle, null, this);
  this.physics.add.overlap(player, coins, collectCoin, null, this);

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
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  player.y -= 0;
  backgroundTile.tilePositionY -= 0.2;

  if (player.y < 0) {
    if (score >= 10) {
      this.add.text(this.sys.canvas.width / 2 - 70, this.sys.canvas.height / 2, "¡Ganaste!", { fontSize: "32px", fill: "#0f0" });
      this.scene.pause();
    } else {
      this.add.text(this.sys.canvas.width / 2 - 70, this.sys.canvas.height / 2, "Perdiste", { fontSize: "32px", fill: "#f00" });
      this.scene.pause();
    }
  }
}

function spawnObstacle() {
  const x = Phaser.Math.Between(50, this.sys.canvas.width - 50);
  const obstacle = obstacles.create(x, 0, "obstacle").setScale(0.5);
  obstacle.setVelocityY(200);

  obstacle.checkWorldBounds = true;
  obstacle.outOfBoundsKill = true;
}

function spawnSlowObstacle() {
  /*
  if (!slowObstaclesCreated) {  // Solo crear obstáculos lentos una vez
    const x = Phaser.Math.Between(50, this.sys.canvas.width - 50);
    const slowObstacle = slowObstacles.create(x, 0, "slowObstacle").setScale(0.5);
    slowObstacle.setVelocityY(100); // Velocidad más lenta

    slowObstacle.checkWorldBounds = true;
    slowObstacle.outOfBoundsKill = true;

    //slowObstaclesCreated = true; // Marcar que los obstáculos lentos han sido creados
  //}
    */
}

function spawnCoin() {
  if (coins.countActive(true) <= 3) {
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, 1080);
      const y = Phaser.Math.Between(50, 300);

      const coin = coins.create(x, y, "coin").setScale(0.5);
      coin.setGravityY(20);
      coin.setDragY(15);
      coin.setBounce(0.3);
      coin.setCollideWorldBounds(true);
      coin.checkWorldBounds = true;
      coin.outOfBoundsKill = true;
    }
  }
}

function hitObstacle(player, obstacle) {
  // Elimina el obstáculo
  obstacle.destroy();

  // Reducir las vidas sin afectar la posición del jugador
  lives--; 
  livesText.setText("Vidas: " + lives);

  player.setVelocity(0);

  if (lives <= 0) {
    this.add.text(100, 250, "Perdiste", { fontSize: "32px", fill: "#f00" });
    this.scene.pause();
  }
}

function collectCoin(player, coin) {
  coin.destroy();
  collectedCoins++;
  score++;
  scoreText.setText("Monedas: " + score);
}

function updateTimer() {
  timeLimit--;
  timerText.setText(`Tiempo: ${timeLimit}`);

  if (timeLimit === midTime && !slowObstaclesCreated) {
    spawnSlowObstacle();
  }

  if (timeLimit <= 0) {
    this.time.removeAllEvents();
    if (collectedCoins >= 5) {
      this.add.text(100, 250, "¡Ganaste!", { fontSize: "32px", fill: "#0f0" });
    } else {
      this.add.text(100, 250, "¡Perdiste!", { fontSize: "32px", fill: "#f00" });
    }
    this.time.delayedCall(2000, resetGame, [], this);
  }
}

function resetGame() {
  collectedCoins = 0;
  timeLimit = 10;
  midTime = Math.floor(timeLimit / 2);
  slowObstaclesCreated = false; // Resetear la creación de obstáculos lentos
  score = 0;
  scoreText.setText("Monedas: 0");
  lives = 3;
  livesText.setText("Vidas: 3");

  timerText.setText(`Tiempo: ${timeLimit}`);
  timer.remove(false);
  timer = this.time.addEvent({
    delay: 1000,
    callback: updateTimer,
    callbackScope: this,
    loop: true,
  });

  this.scene.restart();
}

export default config;
