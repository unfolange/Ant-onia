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
    this.load.spritesheet("dude", "assets/pushing.png", {
      frameWidth: 218.5,
      frameHeight: 220,
    });
    this.load.audio("forestSound", "sounds/cool.mp3"); // Asegúrate de usar la ruta correcta
  }

  create() {
    // Fondo infinito
    // this.add.image(400, 300, "background");
    this.add.image(510, 400, "background").setScale(1);

    this.platforms = this.physics.add.staticGroup();
    //this.createInitialPlatforms();

    // this.platforms.create(350, 568, "ground").setScale(3).refreshBody();
    this.player = this.physics.add.sprite(100, 550, "dude");
    this.player.setScale(0.5);

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.buble = this.physics.add.sprite(290, 550, "buble");
    this.buble.setDisplaySize(150, 150);

    this.anims.create({
      key: "right",
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
      key: "left",
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

    // Reproduce el sonido de fondo en loop
    this.forestSound = this.sound.add("forestSound", {
      loop: true,
      volume: 0.1,
    });
    this.forestSound.play();
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
    if (this.buble.body.velocity.x > 0) {
      this.buble.setVelocityX(this.buble.body.velocity.x * 0.98); // Desacelerar
    } else if (this.buble.body.velocity.x < 0) {
      this.buble.setVelocityX(this.buble.body.velocity.x * 0.98); // Desacelerar
    }
    if (this.buble.x >= 780) {
      // Límite izquierdo o derecho
      if (this.forestSound) {
        this.forestSound.stop();
      }
      console.log("Buble ha tocado la esquina horizontal");
      this.scene.start("CinematicScene2");

      // Aquí puedes cambiar de escena:
      // this.scene.start('otraEscena');
    }
  }

  pushBuble() {
    // Empujar buble cuando el jugador lo toque
    if (this.player.body.touching.right && this.buble.body.touching.left) {
      this.buble.setVelocityX(10); // Empuja hacia la derecha
    } else if (
      this.player.body.touching.left &&
      this.buble.body.touching.right
    ) {
      this.buble.setVelocityX(-200); // Empuja hacia la izquierda
    }
  }
  createInitialPlatforms() {
    this.platforms.create(500, 720, "ground").setScale(3).refreshBody();
  }

  // Reinicia la escena y variables
}

export default gameScene;
