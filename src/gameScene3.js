export class gameScene3 extends Phaser.Scene {
  constructor() {
    super({ key: "gameScene3" });

    this.backgroundTile = null;
    this.player = null;
    this.cursors = null;
    this.buble = null;
    this.bugs = null; // Grupo de mosquitos
  }

  preload() {
    // Carga de imágenes
    this.load.audio("hitSound", "sounds/Golpe.mp3"); // Sonido para golpe
    this.load.audio("muerte", "sounds/Muerte.mp3"); // Sonido para caundo muere
    this.load.image("heart", "assets/Face.png"); 
    this.load.image("backgroundt", "assets/Fondot.png");
    this.load.image("ground", "assets/piso.png");
    this.load.image("buble", "assets/buble.png");
    this.load.image("bug", "assets/mosquito.png"); // Carga el sprite del bicho
    this.load.spritesheet("dude", "assets/pushing.png", {
      frameWidth: 218.5,
      frameHeight: 220,
    });
    this.load.audio("forestSound", "sounds/cool.mp3"); // Asegúrate de usar la ruta correcta
  }

  init(data) {
    this.lives = data.lives || 0; // Asegúrate de manejar un valor por defecto
  }

  create() {
    this.sound.stopAll();
    this.hitSound = this.sound.add("hitSound");
    this.muerte = this.sound.add("muerte");

    // Configuración del fondo y física
    this.physics.world.gravity.y = 300;

    this.add.image(510, 300, "backgroundt").setScale(1.1, 1.3);

    // Verificar el valor de las vidas recibidas
    console.log("Vidas recibidas en gameScene3:", this.lives);

    // Crear los corazones basados en las vidas
    this.hearts = [];
    for (let i = 0; i < this.lives; i++) {
        const heart = this.add
            .image(10 + i * 40, 40, "heart") // Posición de cada corazón
            .setScale(0.07) // Escala del corazón
            .setOrigin(0, 0); // Establece el origen al borde superior izquierdo
        this.hearts.push(heart); // Añadir al array de corazones
    }

    // Configuración de plataformas
    this.platforms = this.physics.add.staticGroup();
    this.createInitialPlatforms();

    // Configuración del jugador
    this.player = this.physics.add.sprite(100, 550, "dude").setScale(0.5);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.physics.world.setBoundsCollision(true, true, true, true);

    // Configuración de burbujas e insectos
    this.buble = this.physics.add.sprite(290, 500, "buble");
    this.buble.setDisplaySize(150, 150);
    this.bugs = this.physics.add.group();
    this.time.addEvent({
        delay: 2300, // Cada 2.3 segundos
        callback: this.spawnBug,
        callbackScope: this,
        loop: true,
    });

    // Animaciones
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

    // Input del jugador
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.burbles = this.physics.add.group();

    // Colliders
    this.physics.add.collider(this.burbles, this.platforms);
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.buble, this.platforms);
    this.physics.add.collider(this.bugs, this.platforms);
    this.physics.add.collider(
        this.bugs,
        this.player,
        this.onPlayerCollision,
        null,
        this
    );
    this.physics.add.collider(this.buble, this.platforms);
    this.physics.add.collider(
      this.player,
      this.buble,
      this.pushBuble,
      null,
      this
    );

    // Reproduce el sonido de fondo
    this.forestSound = this.sound.add("forestSound", {
        loop: true,
        volume: 0.2,
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

    // Salto con flecha hacia arriba o espacio
    if (
      (this.cursors.up.isDown || this.spaceBar.isDown) &&
      this.player.body.blocked.down
    ) {
      this.player.setVelocityY(-300); // Ajusta la fuerza del salto
    }

    if (this.buble.body.velocity.x > 0) {
      this.buble.setVelocityX(this.buble.body.velocity.x * 0.98); // Desacelerar
    } else if (this.buble.body.velocity.x < 0) {
      this.buble.setVelocityX(this.buble.body.velocity.x * 0.98); // Desacelerar
    }
    if (this.buble.x >= 800) {
      // Límite izquierdo o derecho
      if (this.forestSound) {
        this.forestSound.stop();
      }
      if (this.buble.x <= 20) {
        // Verifica si la burbuja toca el lado izquierdo
        this.buble.setVelocityX(0); // Detén su movimiento horizontal
        this.buble.x = 0; // Asegúrate de que no atraviese el borde
      }
      console.log("Buble ha tocado la esquina horizontal");
      this.scene.start("CinematicScene2", { lives: this.lives });

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
  onPlayerCollision() {
    this.hitSound.play(); // Reproduce el sonido de golpe
    this.lives--;

    if (this.lives >= 0) {
      this.hearts[this.lives].destroy();
    }

    if (this.lives <= 0) {
      this.muerte.play();
      this.scene.start("gameOver", { resultado: "perdiste", score: 0 });
    }
  }
  createInitialPlatforms() {
    this.platforms.create(500, 800, "ground").setScale(3).refreshBody();
  }

  spawnBug() {
    const bug = this.bugs.create(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 300),
      "bug"
    );
    bug.setScale(0.1); // Reducir tamaño del insecto
    bug.setBounce(1); // Rebote total
    bug.setCollideWorldBounds(true); // Rebote en los bordes del canvas
    bug.setVelocity(
      Phaser.Math.Between(-200, 200), // Velocidad aleatoria en el eje X
      Phaser.Math.Between(-200, 200) // Velocidad aleatoria en el eje Y
    );
    bug.body.setAllowGravity(false); // Desactiva la gravedad para el insecto
  }

  // Reinicia la escena y variables
}

export default gameScene3;
