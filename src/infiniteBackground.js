export class InfiniteBackgroundScene extends Phaser.Scene{
    
  constructor() {
      super({ key: "InfiniteBackgroundScene" });
      this.backgroundTile = null;
      this.player = null;
      this.obstacles = null;
      this.coins = null;
      this.cursors = null;
      this.score = 0;
      this.lives = 3;
      this.scoreText = null;
      this.livesText = null;
  }

  preload() {
      this.load.image("player", "ruta/dude.png");       // Asegúrate de que la ruta sea válida
      this.load.image("obstacle", "assets/bomb.png");
      this.load.image("coin", "assets/gift.png");
      this.load.image("background", "assets/BG_01.png");
  }

  // El resto del código de InfiniteBackgroundScene queda igual

  create() {
    // Fondo infinito
    this.backgroundTile = this.add.tileSprite(
        0,
        0,
        this.sys.canvas.width,
        this.sys.canvas.height,
        "background"
    );
    this.backgroundTile.setOrigin(0, 0);

    // Jugador
    this.player = this.physics.add.sprite(
        this.sys.canvas.width / 2,
        this.sys.canvas.height / 2,
        "player"
    ).setScale(0.5);
    this.player.setCollideWorldBounds(true);

    // Grupos de obstáculos y monedas
    this.obstacles = this.physics.add.group();
    this.coins = this.physics.add.group();

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();

    // Texto de puntaje y vidas
    this.scoreText = this.add.text(10, 10, "Monedas: 0", {
        fontSize: "20px",
        fill: "#fff",
    });
    this.livesText = this.add.text(10, 40, "Vidas: 3", {
        fontSize: "20px",
        fill: "#fff",
    });

    // Colisiones
    this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, null, this);
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
    this.backgroundTile.tilePositionY -= 0.2;

    // Generar monedas si hay menos de 3 activas
    if (this.coins.countActive(true) <= 3) {
        this.spawnCoin();
    }

    // Condición para ganar o perder
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


  spawnObstacle() {
    const x = Phaser.Math.Between(50, this.sys.canvas.width - 50);
    const obstacle = this.obstacles.create(x, 0, "obstacle").setScale(0.5);
    obstacle.setVelocityY(200);
    obstacle.checkWorldBounds = true;
    obstacle.outOfBoundsKill = true;
  }

  spawnCoin() {
    if (this.coins.countActive(true) <= 3) { // Generar monedas solo si quedan 3 o menos
        for (let i = 0; i < 5; i++) { // Crear un grupo de 5 monedas
            const x = Phaser.Math.Between(50, this.sys.canvas.width - 50); // Posición X aleatoria dentro de límites
            const y = Phaser.Math.Between(50, 300); // Posición Y aleatoria en la mitad superior

            const coin = this.coins.create(x, y, "coin").setScale(0.5);

            // Configurar el efecto de gravedad personalizada
            coin.setGravityY(20); // Gravedad leve para caída suave
            coin.setDragY(15); // Resistencia al movimiento
            coin.setBounce(0.3); // Rebote ligero al tocar el suelo

            // Configurar límites para las monedas
            coin.setCollideWorldBounds(true);
            coin.checkWorldBounds = true;
            coin.outOfBoundsKill = true;
        }
    }
  }

  hitObstacle(player, obstacle) {
    obstacle.destroy();
    this.lives--;
    this.livesText.setText("Vidas: " + this.lives);
    player.setVelocity(0);  // Detener cualquier movimiento accidental

    if (this.lives <= 0) {
        this.add.text(100, 250, "Perdiste", { fontSize: "32px", fill: "#f00" });
        this.scene.pause();
    }
  }

  collectCoin(player, coin) {
    coin.destroy();
    this.score++;
    this.scoreText.setText("Monedas: " + this.score);
  }
}

export default InfiniteBackgroundScene;