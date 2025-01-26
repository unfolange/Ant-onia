export class InfiniteBackgroundScene extends Phaser.Scene {
  constructor() {
    super({ key: "InfiniteBackgroundScene" });

    // Referencias a objetos y variables necesarias
    this.backgroundTile = null;
    this.player = null;
    this.obstacles = null;
    this.slowObstacles = null; 
    this.leafObstacles = null; // Grupo para los obstáculos "tipo hoja"
    this.coins = null;
    this.cursors = null;

    // Variables de estado
    this.score = 0;
    this.lives = 3;
    this.scoreText = null;
    this.livesText = null;

    // Control del tiempo
    this.timer = null;         // Almacenará el evento de Phaser
    this.timerText = null;
    this.timeLimit = 60;       // Duración total del temporizador
    this.firstThird = Math.floor(this.timeLimit / 3);     // Primer tercio
    this.secondThird = Math.floor((2 * this.timeLimit) / 3); // Segundo tercio
    this.slowObstaclesCreated = false;
    this.secondMechanicActive = false;

    this.speedScreen = 0.2;
  }

  preload() {
    // Carga de imágenes
    this.load.image("player", "assets/dude.png"); // Ajusta la ruta
    this.load.image("obstacle", "assets/Gota.png");
    this.load.image("coin", "assets/Bellota_Burbuja.png");
    this.load.image("background2", "assets/Fondo2.jpg");
    this.load.image("heart", "assets/Face.png"); 
    this.load.audio("audio_lvl_2", "sounds/sound-level2.mp3");
    this.load.audio("coinSound", "sounds/Itemcollectable.mp3"); // Sonido para recoger moneda
    this.load.audio("hitSound", "sounds/Golpe.mp3"); // Sonido para golpe
    this.load.audio("muerte", "sounds/Muerte.mp3"); // Sonido para caundo muere

    // Carga adicional para el obstáculo lento
    this.load.image("slowObstacle", "assets/Ramita.png");
    this.load.image("leafObstacle", "assets/Hoja.png");
    this.load.spritesheet("Fly_Antonia", "assets/Fly_Antonia.png", {
      frameWidth: 142, // ancho real de un cuadro
      frameHeight: 300, // alto real de un cuadro
    });
  }

  create() {
    // Música de fondo
    this.intro = this.sound.add("audio_lvl_2", { loop: true });
    this.intro.play();
    //Musica de interacciones
    this.coinSound = this.sound.add("coinSound");
    this.hitSound = this.sound.add("hitSound");
    this.muerte = this.sound.add("muerte");

    // Fondo infinito
    this.backgroundTile = this.add.tileSprite(
      0,
      0,
      this.sys.canvas.width,
      this.sys.canvas.height,
      "background2"
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
    this.leafObstacles = this.physics.add.group(); // Grupo para "obstáculos-hoja"
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

    // Colisiones
    this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, null, this);
    this.physics.add.collider(this.player, this.slowObstacles, this.hitObstacle, null, this);
    this.physics.add.collider(this.player, this.leafObstacles, this.hitObstacle, null, this);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // Temporizadores para generar obstáculos y monedas
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
    });

    this.time.addEvent({
      delay: 1500,
      callback: this.spawnCoin,
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

    // Generar más monedas si hay pocas (opcional)
    if (this.coins.countActive(true) <= 3) {
      this.spawnCoin();
    }

    // Condición para ganar o perder si el jugador llega arriba (y < 0)
    if (this.player.y < 0) {
      // Ganar solo si score >= 10, en caso contrario pierde
      if (this.score >= 10) {
        // Escena de victoria (o "gameOver" si quieres usar la misma)
        this.scene.start("gameOver", { resultado: "ganaste", puntaje: this.score });
      } else {
        this.scene.start("gameOver", { resultado: "perdiste", puntaje: this.score });
      }
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

  // Genera obstáculos lentos
  spawnSlowObstacle() {
    const x = Phaser.Math.Between(50, this.sys.canvas.width - 50);
    const slowObstacle = this.slowObstacles.create(x, 0, "slowObstacle").setScale(0.5);

    // Velocidad más lenta que la de los obstáculos normales (o la que tú desees)
    slowObstacle.setVelocityY(400);

    slowObstacle.checkWorldBounds = true;
    slowObstacle.outOfBoundsKill = true;
  }

  // Genera obstáculos tipo "hoja" (con movimiento ondulante)
  spawnLeafObstacle() {
    const x = Phaser.Math.Between(50, this.sys.canvas.width - 50);
    // Cambia "leafObstacle" por la imagen que desees
    const leaf = this.leafObstacles.create(x, 0, "leafObstacle").setScale(0.4);

    // Velocidad de caída moderada
    leaf.setVelocityY(60);
    leaf.checkWorldBounds = true;
    leaf.outOfBoundsKill = true;

    // Simular vaivén como hoja con un tween en X
    this.tweens.add({
      targets: leaf,
      x: {
        value: leaf.x + Phaser.Math.Between(-50, 50), // Se mueve 50 px a izq/der
        duration: 1000,
        ease: "Sine.easeInOut",
      },
      repeat: -1, // Repetir infinitamente
      yoyo: true, // Regresar
    });
  }

  // Genera monedas
  spawnCoin() {
    if (this.coins.countActive(true) <= 3) {
      // Crear un grupo de 5 monedas
      for (let i = 0; i < 5; i++) {
        const x = Phaser.Math.Between(50, this.sys.canvas.width - 50);
        const y = Phaser.Math.Between(50, 300);

        const coin = this.coins.create(x, y, "coin").setScale(0.5);

        // Configurar la física de la moneda
        coin.setGravityY(20);
        coin.setDragY(15);
        coin.setBounce(0.3);
        coin.setCollideWorldBounds(true);
        coin.checkWorldBounds = true;
        coin.outOfBoundsKill = true;
      }
    }
  }

  // Al chocar con obstáculo
  hitObstacle(player, obstacle) {
    this.hitSound.play(); // Reproduce el sonido de golpe
    obstacle.destroy();
    this.lives--;
    player.setVelocity(0); // Detenemos al jugador momentáneamente

    if (this.lives >= 0) {
      this.hearts[this.lives].destroy();
    }

    if (this.lives <= 0) {
      this.muerte.play();
      this.add.text(100, 250, "Perdiste", { fontSize: "32px", fill: "#f00" });
      this.scene.pause();
      
    }
  }

  // Al recolectar moneda
  collectCoin(player, coin) {
    this.coinSound.play(); // Reproduce el sonido de recoger moneda
    coin.destroy();
    this.score++;
    this.scoreText.setText("Frutos: " + this.score);
  }

  // Se llama cada segundo para reducir el tiempo
  updateTimer() {
    this.timeLimit--;
    this.timerText.setText(`Tiempo: ${this.timeLimit}`);

    // 1) Cuando llega al primer tercio del tiempo, activamos los obstáculos lentos
    if (this.timeLimit === this.firstThird && !this.slowObstaclesCreated) {
      this.speedScreen = 0.6
      this.slowObstaclesCreated = true;
      // Generar obstáculos lentos cada cierto tiempo (ej: 1500 ms)
      this.time.addEvent({
        delay: 1500,
        callback: this.spawnLeafObstacle,
        callbackScope: this,
        loop: true,
      });
    }

    // 2) Cuando llega al segundo tercio, activamos la mecánica de "hoja"
    if (this.timeLimit === this.secondThird && !this.secondMechanicActive) {
      this.secondMechanicActive = true;
      this.speedScreen = 1
      // Generar obstáculos-hoja cada 2s
      this.time.addEvent({
        delay: 1500,
        callback: this.spawnSlowObstacle,
        callbackScope: this,
        loop: true,
      });
    }

    // Si el tiempo se acaba, determinamos victoria o derrota
    if (this.timeLimit <= 0) {
      // Eliminamos todos los eventos de tiempo
      this.time.removeAllEvents();

      // Condición de victoria/derrota (ajusta como gustes)
      if (this.score >= 5) {
        this.scene.start("gameOver", { resultado: "ganaste", puntaje: this.score });
      } else {
        this.scene.start("gameOver", { resultado: "perdiste", puntaje: this.score });
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
    // Recalculamos tercios
    this.firstThird = Math.floor(this.timeLimit / 3);
    this.secondThird = Math.floor((2 * this.timeLimit) / 3);

    // Reset de flags
    this.slowObstaclesCreated = false;
    this.secondMechanicActive = false;

    this.timerText.setText(`Tiempo: ${this.timeLimit}`);

    // Reactivamos el temporizador principal
    this.timer.remove(false);
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // Reiniciamos la escena para limpiar todo
    this.scene.restart();
  }
}

export default InfiniteBackgroundScene;
