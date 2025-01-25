export class gameScene extends Phaser.Scene {
  constructor() {
    super({ key: "gameScene" });

    // Referencias a objetos y variables necesarias
    this.backgroundTile = null;
    this.player = null;
    this.cursors = null;
    this.buble = null;
  }

  preload() {
    // Carga de imágenes

    this.load.image("background", "assets/Fondo1.png");
    this.load.image("ground", "assets/platform3.png");

    this.load.image("buble", "assets/buble.png");
    this.load.spritesheet("dude", "assets/image.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
  }

  create() {
    // Fondo infinito
    // this.add.image(400, 300, "background");
    this.add.image(510, 300, "background").setScale(1);

    this.platforms = this.physics.add.staticGroup();
    this.createInitialPlatforms();

    // this.platforms.create(350, 568, "ground").setScale(3).refreshBody();
    this.player = this.physics.add.sprite(100, 650, "dude");
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.buble = this.physics.add.sprite(200, 650, "buble");
    this.buble.setDisplaySize(50, 50);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 8 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 9, end: 16 }),
      frameRate: 10,
      repeat: -1,
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.burbles = this.physics.add.group();

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.burbles, this.platforms);

    this.physics.add.collider(this.buble, this.platforms);
    this.physics.add.collider(
      this.player,
      this.buble,
      this.pushBuble,
      null,
      this
    );
  }

  update() {
    // Movimiento del jugador
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);

      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);

      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);

      this.player.anims.play("turn");
    }
    if (this.buble.x <= 0 || this.buble.x >= 700) {
      // Límite izquierdo o derecho
      console.log("Buble ha tocado la esquina horizontal");
      this.scene.start("InfiniteBackgroundScene");

      // Aquí puedes cambiar de escena:
      // this.scene.start('otraEscena');
    }
  }

  pushBuble() {
    // Empujar buble cuando el jugador lo toque
    if (this.player.body.touching.right) {
      this.buble.setVelocityX(10); // Empuja hacia la derecha
    } else if (this.player.body.touching.left) {
      this.buble.setVelocityX(-200); // Empuja hacia la izquierda
    }
  }
  createInitialPlatforms() {
    this.platforms.create(500, 720, "ground").setScale(3).refreshBody();
  }

  // Reinicia la escena y variables
}

export default gameScene;
