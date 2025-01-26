export class InfiniteBackgroundScene extends Phaser.Scene {
  constructor() {
    super({ key: "InfiniteBackgroundScene" });

    // Referencias a objetos y variables necesarias
    this.backgroundTile = null;
    this.player = null;
    this.obstacles = null;
    this.slowObstacles = null; 
    this.leafObstacles = null;
    this.coins = null;
    this.cursors = null;

    // Variables de estado
    this.score = 0;
    this.scoreText = null;

    // Control del tiempo
    this.timer = null;         
    this.timerText = null;
    this.timeLimit = 60;       
    this.firstThird = Math.floor(this.timeLimit / 3);
    this.secondThird = Math.floor((2 * this.timeLimit) / 3);
    this.slowObstaclesCreated = false;
    this.secondMechanicActive = false;

    this.speedScreen = 0.2;
    this.maxCoins = 5;
    this.backgroundInfinite = null
  }

  preload() {
    // Carga de imágenes
    this.load.image("obstacle", "assets/Gota.png");
    this.load.image("coin", "assets/Bellota_Burbuja.png");
    this.load.image("background2", "assets/Fondo2.jpg");
    this.load.image("background3", "assets/Fondo3F.png");
    this.load.image("heart", "assets/Face.png"); 
    this.load.audio("audio_lvl_2", "sounds/sound-level2.mp3");
    this.load.audio("coinSound", "sounds/Itemcollectable.mp3"); // Sonido para recoger moneda
    this.load.audio("hitSound", "sounds/Golpe.mp3"); // Sonido para golpe
    this.load.audio("muerte", "sounds/Muerte.mp3"); // Sonido para caundo muere

    // Carga adicional para el obstáculo lento
    this.load.image("slowObstacle", "assets/Ramita.png");
    this.load.image("leafObstacle", "assets/Hoja.png");
    this.load.spritesheet("Fly_Antonia", "assets/Fly_Antonia.png", {
      frameWidth: 142,
      frameHeight: 300,
    });
  }

  init(data) {
    this.lives = data.lives || 0; // Asegúrate de manejar un valor por defecto
    console.log("Vidas recibidas en InfiniteBackgroundScene:", this.lives);
  }

  shutdown() {
    this.time.removeAllEvents(); // Detener todos los temporizadores
  }

  create() {
    this.sound.stopAll();
    // Música de fondo
    this.intro = this.sound.add("audio_lvl_2", { loop: true });
    this.intro.play();
    //Musica de interacciones
    this.coinSound = this.sound.add("coinSound");
    this.hitSound = this.sound.add("hitSound");
    this.muerte = this.sound.add("muerte");
    this.backgroundInfinite = "background2"
    // Fondo infinito
    this.backgroundTile = this.add.tileSprite(
      0,
      0,
      this.sys.canvas.width,
      this.sys.canvas.height,
      this.backgroundInfinite
    );
    this.backgroundTile.setOrigin(0, 0);

    // Animación de vuelo
    this.anims.create({
      key: "fly",
      frames: this.anims.generateFrameNumbers("Fly_Antonia", {
        start: 0,
        end: 14,
      }),
      frameRate: 6,
      repeat: -1,
    });
  
    // Jugador
    this.player = this.physics.add
      .sprite(this.sys.canvas.width / 2, this.sys.canvas.height - 200, "Fly_Antonia")
      .setScale(0.5);
    this.player.setCollideWorldBounds(true);
    this.player.play("fly", true);

    // Grupos de obstáculos y monedas
    this.obstacles = this.physics.add.group();
    this.slowObstacles = this.physics.add.group(); 
    this.leafObstacles = this.physics.add.group();
    this.coins = this.physics.add.group();

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();

    // Texto de puntaje
    this.scoreText = this.add.text(10, 10, "Frutos: 0", {
      fontSize: "20px",
      fill: "#fff",
    });

    // Mostrar corazones (vidas)
    this.hearts = [];
    for (let i = 0; i < this.lives; i++) {
      const heart = this.add
        .image(10 + i * 40, 40, "heart")
        .setScale(0.07)
        .setOrigin(0, 0);
      this.hearts.push(heart);
    }

    // Texto de tiempo
    this.timerText = this.add.text(300, 10, `Tiempo: ${this.timeLimit}`, {
      fontSize: "20px",
      fill: "#fff",
    });

    // Colisiones y solapamientos
    this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, null, this);
    this.physics.add.collider(this.player, this.slowObstacles, this.hitObstacle, null, this);
    this.physics.add.collider(this.player, this.leafObstacles, this.hitObstacle, null, this);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // Crea 3 monedas al inicio
    for (let i = 0; i < 3; i++) {
      this.spawnSingleCoin();
    }

    // Temporizador para validar la cantidad de monedas cada segundo
    this.time.addEvent({
      delay: 1000, // Cada segundo
      callback: this.checkAndSpawnCoins,
      callbackScope: this,
      loop: true,
    });

    // A los 4 segundos, crea 2 monedas más
    this.time.addEvent({
      delay: 4000,
      callback: () => {
        for (let i = 0; i < 2; i++) {
          this.spawnSingleCoin();
        }
      },
      callbackScope: this,
      loop: false,
    });

    // Temporizador para generar obstáculos
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
    });

    // Temporizador principal (cuenta atrás)
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    // Movimiento del jugador
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // Fondo infinito (movimiento vertical)
    this.backgroundTile.tilePositionY -= this.speedScreen;

    // Condición para ganar o perder si el jugador llega arriba (y < 0)
    if (this.player.y < 0) {
      if (this.score >= 10) {
        this.scene.stop("InfiniteBackgroundScene");
        this.scene.start("gameOver", { resultado: "ganaste", score: this.score });
      } else {
        this.scene.stop("InfiniteBackgroundScene");
        this.scene.start("gameOver", { resultado: "perdiste", score: this.score });
      }
    }
  }

  // Generar UNA sola moneda (y controlar que no superen 5)
  spawnSingleCoin() {
    if (this.coins.countActive(true) < 5) {
      const x = Phaser.Math.Between(50, this.sys.canvas.width - 50);
  
      const coin = this.coins.create(x, 0, "coin").setScale(0.5);
  
      coin.setVelocityY(Phaser.Math.Between(100, 150));
      coin.setCollideWorldBounds(false);
      coin.setBounce(0);
      coin.checkWorldBounds = true; // Permitir disparar eventos al salir del mundo
      coin.outOfBoundsKill = true; // Marca para eliminar automáticamente
  
      // Listener para eliminar monedas al salir de los límites
      coin.body.onWorldBounds = true;
      coin.setInteractive(); // Asegura que se pueda eliminar bien
      coin.on("worldbounds", () => {
        coin.destroy(); // Elimina la moneda
      });
    }
  }

  // Genera un obstáculo "normal"
  spawnObstacle() {
    const x = Phaser.Math.Between(50, this.sys.canvas.width - 50);
    const obstacle = this.obstacles.create(x, 0, "obstacle").setScale(0.5);
    obstacle.setVelocityY(200);
    obstacle.checkWorldBounds = true;
    obstacle.outOfBoundsKill = true;
  }

  // Generar obstáculos lentos
  spawnSlowObstacle() {
    const x = Phaser.Math.Between(50, this.sys.canvas.width - 50);
    const slowObstacle = this.slowObstacles.create(x, 0, "slowObstacle").setScale(0.5);

    // Velocidad más rápida para el "obstáculo lento" (parece irónico, pero ajusta a tu gusto)
    slowObstacle.setVelocityY(400);

    slowObstacle.checkWorldBounds = true;
    slowObstacle.outOfBoundsKill = true;
  }

  // Generar obstáculos tipo "hoja"
  spawnLeafObstacle() {
    const x = Phaser.Math.Between(50, this.sys.canvas.width - 50);
    const leaf = this.leafObstacles.create(x, 0, "leafObstacle").setScale(0.4);

    leaf.setVelocityY(60);
    leaf.checkWorldBounds = true;
    leaf.outOfBoundsKill = true;

    // Movimiento ondulante
    this.tweens.add({
      targets: leaf,
      x: {
        value: leaf.x + Phaser.Math.Between(-50, 50),
        duration: 1000,
        ease: "Sine.easeInOut",
      },
      repeat: -1,
      yoyo: true,
    });
  }

  // Al chocar con obstáculo
  hitObstacle(player, obstacle) {
    this.hitSound.play(); // Reproduce el sonido de golpe
    obstacle.destroy();
    this.lives--;
    player.setVelocity(0); 

    if (this.lives >= 0) {
      this.hearts[this.lives].destroy();
    }

    if (this.lives <= 0) {
      this.muerte.play();
      this.scene.stop("InfiniteBackgroundScene");
      this.scene.start("gameOver", { resultado: "perdiste", score: this.score });
    }
  }

  checkAndSpawnCoins() {
    const currentCoins = this.coins.countActive(true);
    if (currentCoins < this.maxCoins) {
      const coinsToSpawn = this.maxCoins - currentCoins;
      for (let i = 0; i < coinsToSpawn; i++) {
        this.spawnSingleCoin();
      }
    }
  
    // Revisión extra: eliminar monedas fuera de los límites (si es necesario)
    this.coins.getChildren().forEach((coin) => {
      if (coin.y > this.sys.canvas.height) {
        coin.destroy();
      }
    });
  }

  // Al recolectar moneda
  collectCoin(player, coin) {
    this.coinSound.play(); // Reproduce el sonido de recoger moneda
    coin.destroy();
    this.score++;
    this.scoreText.setText("Frutos: " + this.score);

    // Crea una moneda nueva (si no alcanzamos las 5)
    if (this.coins.countActive(true) < 5) {
      this.spawnSingleCoin();
    }
  }

  // Se llama cada segundo para reducir el tiempo
  updateTimer() {
    this.timeLimit--;
    this.timerText.setText(`Tiempo: ${this.timeLimit}`);

    // 1) Primer tercio
    if (this.timeLimit === this.firstThird && !this.slowObstaclesCreated) {
      this.speedScreen = 0.6;
      this.slowObstaclesCreated = true;
      this.time.addEvent({
        delay: 1500,
        callback: this.spawnLeafObstacle,
        callbackScope: this,
        loop: true,
      });
    }

    // 2) Segundo tercio
    if (this.timeLimit === this.secondThird && !this.secondMechanicActive) {
      this.secondMechanicActive = true;
      this.speedScreen = 1;
      this.time.addEvent({
        delay: 1500,
        callback: this.spawnSlowObstacle,
        callbackScope: this,
        loop: true,
      });
    }

    // Si el tiempo se acaba
    if (this.timeLimit <= 0) {
      this.time.removeAllEvents();

      if (this.score >= 10) {
        this.scene.stop("InfiniteBackgroundScene");
        this.scene.start("endGame", { resultado: "ganaste", score: this.score });
      } else {
        this.scene.stop("InfiniteBackgroundScene");
        this.scene.start("endGame", { resultado: "perdiste", score: this.score });
      }
    }
  }

  
  // Reinicia la escena y variables
  resetGame() {
    this.score = 0;
    this.scoreText.setText("Frutos: 0");
    this.lives = 3;
    this.speedScreen = 0.2;

    // Reiniciamos temporizador
    this.timeLimit = 10;
    this.firstThird = Math.floor(this.timeLimit / 3);
    this.secondThird = Math.floor((2 * this.timeLimit) / 3);

    // Reset de flags
    this.slowObstaclesCreated = false;
    this.secondMechanicActive = false;

    this.timerText.setText(`Tiempo: ${this.timeLimit}`);

    this.timer.remove(false);
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    this.scene.restart();
  }
}

export default InfiniteBackgroundScene;
