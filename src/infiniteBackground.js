export class InfiniteBackgroundScene extends Phaser.Scene {
  constructor() {
    super({ key: "InfiniteBackgroundScene" });

    // Referencias a objetos y variables necesarias
    this.backgroundTile = null;
    this.player = null;
    this.obstacles = null;
    this.slowObstacles = null; // Grupo para los obstáculos lentos
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
    this.timeLimit = 10;       // Duración total del temporizador
    this.midTime = Math.floor(this.timeLimit / 2); // Momento para crear slowObstacles
    this.slowObstaclesCreated = false;
    this.speedScreen = 0.2
  }

  preload() {
    // Carga de imágenes
    this.load.image("player", "assets/dude.png"); // Ajusta la ruta
    this.load.image("obstacle", "assets/Gota.png");
    this.load.image("coin", "assets/bellota.png");
    this.load.image("background2", "assets/Fondo2.png");
    this.load.image("heart", "assets/Face.png"); 
    this.load.audio("audio_lvl_2", "sounds/sound-level2.mp3");

    // Carga adicional para el obstáculo lento
    this.load.image("slowObstacle", "assets/star.png");
    this.load.spritesheet("Fly_Antonia", "assets/Fly_Antonia.png", {
      frameWidth: 142, // ancho real de un cuadro
      frameHeight: 210, // alto real de un cuadro
    });
  }

  create() {
    this.intro = this.sound.add("audio_lvl_2");
    this.intro.play();
    // Fondo infinito
    this.backgroundTile = this.add.tileSprite(
      0,
      0,
      this.sys.canvas.width,
      this.sys.canvas.height,
      "background2"
    );
    this.backgroundTile.setOrigin(0, 0);

    /// Animación de vuelo
    this.anims.create({
      key: "fly",
      frames: this.anims.generateFrameNumbers("Fly_Antonia", {
        start: 0,
        end: 14, // prueba con menos cuadros
      }),
      frameRate: 6,
      repeat: -1,
    });

    // Jugador
    this.player = this.physics.add
    .sprite(
      this.sys.canvas.width / 2,
      this.sys.canvas.height - 200,
      "Fly_Antonia"
    )
    .setScale(0.5);
    this.player.setCollideWorldBounds(true);
    this.player.play("fly", true);

    // Grupos de obstáculos y monedas
    this.obstacles = this.physics.add.group();
    this.slowObstacles = this.physics.add.group(); // Grupo para obstáculos lentos
    this.coins = this.physics.add.group();

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();

    // Texto de puntaje y vidas
    this.scoreText = this.add.text(10, 10, "Frutos: 0", {
      fontSize: "20px",
      fill: "#fff",
    });

    this.hearts = [];

    // Mostramos tantos corazones como "this.lives"
    for (let i = 0; i < this.lives; i++) {
      // La posición X va cambiando para que no se superpongan
      const heart = this.add
        .image(10 + i * 40, 40, "heart")
        .setScale(0.07)   // Ajusta el tamaño según tu svg
        .setOrigin(0, 0);

      this.hearts.push(heart);
    }

    // Texto de tiempo
    this.timerText = this.add.text(300, 10, `Tiempo: ${this.timeLimit}`, {
      fontSize: "20px",
      fill: "#fff",
    });

    // Colisiones
    this.physics.add.collider(
      this.player,
      this.obstacles,
      this.hitObstacle,
      null,
      this
    );
    this.physics.add.collider(
      this.player,
      this.slowObstacles,
      this.hitObstacle,
      null,
      this
    );
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

    // Fondo infinito
    this.backgroundTile.tilePositionY -= this.speedScreen;

    // Generar monedas si hay menos de 3 activas (opcional, ya lo tenemos en spawnCoin)
    if (this.coins.countActive(true) <= 3) {
      this.spawnCoin();
    }

    // Condición para ganar o perder al traspasar la parte superior
    if (this.player.y < 0) {
      if (this.score >= 10) {
        this.add.text(
          this.sys.canvas.width / 2 - 70,
          this.sys.canvas.height / 2,
          "¡Ganaste!",
          { fontSize: "32px", fill: "#0f0" }
        );
        this.scene.pause();
      } else {
        this.add.text(
          this.sys.canvas.width / 2 - 70,
          this.sys.canvas.height / 2,
          "Perdiste",
          { fontSize: "32px", fill: "#f00" }
        );
        this.scene.pause();
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

  // Genera obstáculos lentos (solo una vez en el midpoint)
  spawnSlowObstacle() {
    const x = Phaser.Math.Between(50, this.sys.canvas.width - 50);
    const slowObstacle = this.slowObstacles
        .create(x, 0, "slowObstacle")
        .setScale(0.5);

    // Asigna una velocidad más lenta que la de los obstáculos normales
    slowObstacle.setVelocityY(400);

    slowObstacle.checkWorldBounds = true;
    slowObstacle.outOfBoundsKill = true;
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

  // Evento al chocar con obstáculo (normal o lento)
  hitObstacle(player, obstacle) {
    obstacle.destroy();
    this.lives--;
    player.setVelocity(0); // Detenemos al jugador momentáneamente

    if (this.lives >= 0) {
      this.hearts[this.lives].destroy();
    }

    if (this.lives <= 0) {
      this.add.text(100, 250, "Perdiste", { fontSize: "32px", fill: "#f00" });
      this.scene.pause();
    }
  }

  // Evento al recolectar moneda
  collectCoin(player, coin) {
    coin.destroy();
    this.score++;
    this.scoreText.setText("Frutos: " + this.score);
  }

  // Se llama cada segundo para reducir el tiempo
  updateTimer() {
    this.timeLimit--;
    this.timerText.setText(`Tiempo: ${this.timeLimit}`);

    if (this.timeLimit === this.midTime && !this.slowObstaclesCreated) {
      this.slowObstaclesCreated = true;

      // Inicia un temporizador para generar obstáculos lentos cada 5 segundos
      this.time.addEvent({
          delay: 1500, // Cada 5 segundos
          callback: this.spawnSlowObstacle,
          callbackScope: this,
          loop: true,
      });
    }

    // Si el tiempo se acaba, determinamos victoria o derrota
    if (this.timeLimit <= 0) {
      // Eliminamos todos los eventos de tiempo
      this.time.removeAllEvents();

      // Condición de victoria/derrota (aquí puedes ajustar la lógica)
      if (this.score >= 5) {
        this.add.text(100, 250, "¡Ganaste!", {
          fontSize: "32px",
          fill: "#0f0",
        });
      } else {
        this.add.text(100, 250, "¡Perdiste!", {
          fontSize: "32px",
          fill: "#f00",
        });
      }

      // Esperamos 2 segundos y reseteamos el juego
      this.time.delayedCall(2000, this.resetGame, [], this);
    }
  }

  // Reinicia la escena y variables
  resetGame() {
    this.score = 0;
    this.scoreText.setText("Frutos: 0");
    this.lives = 3;
    this.speedScreen = 0.2;
    // Reiniciamos temporizador
    this.timeLimit = 10;       // Duración total del temporizador
    this.midTime = Math.floor(this.timeLimit / 2);
    this.slowObstaclesCreated = false;
    this.timerText.setText(`Tiempo: ${this.timeLimit}`);

    // Reactivamos el temporizador
    this.timer.remove(false);
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // Reiniciamos la escena
    this.scene.restart();
  }
}

export default InfiniteBackgroundScene;
