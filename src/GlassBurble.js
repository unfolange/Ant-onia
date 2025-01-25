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
  player.y -= 1;

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
  const coin = coins.create(x, 0, "coin").setScale(0.5);
  coin.setVelocityY(200); // Velocidad de caída

  // Eliminar monedas fuera de pantalla
  coin.checkWorldBounds = true;
  coin.outOfBoundsKill = true;
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
//   create() {
//     // A simple background for our game
//     // this.sound.stopAll();

//     this.christmas = this.sound.add("christmas", { loop: true });
//     this.inter = this.sound.add("inter");
//     this.hurt = this.sound.add("hurt");

//     this.christmas.play();
//     this.christmas.setVolume(0.05);

//     this.gameOver = false;
//     this.highScore = localStorage.getItem("highScore") || 0;
//     this.width = 800;
//     this.height = 500;
//     this.score = 0;

//     this.add.image(400, 300, "sky");

//     // The platforms group contains the ground and the 2 ledges we can jump on
//     this.platforms = this.physics.add.staticGroup();

//     // Create initial platforms
//     this.createInitialPlatforms();

//     // The player and its settings
//     this.player = this.physics.add.sprite(100, 450, "dude");
//     this.player.setBounce(0.2);
//     this.player.setCollideWorldBounds(true);

//     // Player animations
//     if (!this.anims.exists("left")) {
//       this.anims.create({
//         key: "left",
//         frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 7 }),
//         frameRate: 10,
//         repeat: -1,
//       });
//     }

//     if (!this.anims.exists("turn")) {
//       this.anims.create({
//         key: "turn",
//         frames: [{ key: "dude", frame: 8 }],
//         frameRate: 20,
//       });
//     }

//     if (!this.anims.exists("right")) {
//       this.anims.create({
//         key: "right",
//         frames: this.anims.generateFrameNumbers("dude", { start: 9, end: 16 }),
//         frameRate: 10,
//         repeat: -1,
//       });
//     }

//     // Input Events
//     this.cursors = this.input.keyboard.createCursorKeys();

//     // Stars, bombs, score, and collisions
//     this.stars = this.physics.add.group({
//       key: "star",
//       repeat: 11,
//       setXY: { x: 12, y: 0, stepX: 70 },
//     });

//     this.stars.children.iterate(function (child) {
//       child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
//     });

//     this.bombs = this.physics.add.group();

//     this.scoreText = this.add.text(16, 16, "Score: 0", {
//       fontSize: "32px",
//       fill: "#000",
//     });
//     this.highScoreText = this.add.text(
//       500,
//       16,
//       "High Score:" + this.highScore,
//       { fontSize: "32px", fill: "#000" }
//     );

//     this.physics.add.collider(this.player, this.platforms);
//     this.physics.add.collider(this.stars, this.platforms);
//     this.physics.add.collider(this.bombs, this.platforms);

//     this.physics.add.overlap(
//       this.player,
//       this.stars,
//       this.collectStar,
//       null,
//       this
//     );
//     this.physics.add.collider(
//       this.player,
//       this.bombs,
//       this.hitBomb,
//       null,
//       this
//     );
//   }

//   update() {
//     if (this.gameOver) {
//       return;
//     }

//     if (this.cursors.left.isDown) {
//       console.log("Playing left animation");
//       this.player.setVelocityX(-160);

//       this.player.anims.play("left", true);
//     } else if (this.cursors.right.isDown) {
//       console.log("Playing right animation");

//       this.player.setVelocityX(160);

//       this.player.anims.play("right", true);
//     } else {
//       this.player.setVelocityX(0);

//       this.player.anims.play("turn");
//     }

//     if (this.cursors.up.isDown && this.player.body.touching.down) {
//       this.player.setVelocityY(-330);
//     }
//     // console.log("🚀 ~ file: app.js:132 ~ this.width:", this.width)//768

//     if (this.player.x > this.width - 40 && this.cursors.right.isDown) {
//       console.log("🚀 ~ file: app.js:134 ~ this.player.x:", this.player.x); //824

//       this.player.x -= this.width;
//       console.log("🚀 ~ file: app.js:137 ~ this.player.x:", this.player.x); //24
//     } else if (this.player.x < 40 && this.cursors.left.isDown) {
//       console.log("🚀 ~ file: app.js:139 ~ this.player.x:", this.player.x);
//       // Adjust this.player position to wrap around1
//       this.player.x += this.width;
//       console.log("🚀 ~ file: app.js:142 ~ this.player.x:", this.player.x); //824
//     }
//   }

//   createInitialPlatforms() {
//     this.platforms.create(350, 568, "ground").setScale(3).refreshBody();
//     this.platforms.create(600, 400, "ground");
//     this.platforms.create(50, 250, "ground");
//     this.platforms.create(750, 220, "ground");
//   }

//   collectStar(player, star) {
//     star.disableBody(true, true);

//     //  Add and update the score
//     this.score += 10;
//     this.scoreText.setText("Score: " + this.score);
//     this.inter.play();
//     this.inter.setVolume(0.05);
//     // this.highScoreText.setText('High score: ' + this.highScore);

//     if (this.stars.countActive(true) === 0) {
//       //  A new batch of this.stars to collect
//       this.stars.children.iterate(function (child) {
//         child.enableBody(true, child.x, 0, true, true);
//       });

//       var x =
//         player.x < 400
//           ? Phaser.Math.Between(400, 800)
//           : Phaser.Math.Between(0, 400);

//       var bomb = this.bombs.create(x, 16, "bomb");
//       bomb.setBounce(1);
//       bomb.setCollideWorldBounds(true);
//       bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
//       bomb.allowGravity = false;
//     }
//   }

//   hitBomb(player) {
//     this.physics.pause();

//     player.setTint(0xff0000);

//     player.anims.play("turn");
//     this.hurt.play();
//     this.hurt.setVolume(0.2);
//     this.gameOver = true;
//     this.time.delayedCall(
//       3000,
//       function () {
//         this.scene.start("gameOver", { score: this.score });
//       },
//       [],
//       this
//     );
//   }

export default gameScene;
