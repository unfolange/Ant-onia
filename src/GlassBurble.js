let config = {
  type: Phaser.AUTO,
  // Ajustamos a tamaño de la ventana.
  width: window.innerWidth,
  height: window.innerHeight,
  // Opcionalmente, puedes usar en lugar de lo anterior:
  /*
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  */
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
// Variable para el tileSprite de fondo
let backgroundTile;

function preload() {
  // Cargar recursos
  this.load.image("player", "ruta/dude.png");       // Reemplaza con la ruta a la imagen del jugador
  this.load.image("obstacle", "assets/bomb.png");   // Reemplaza con la ruta del obstáculo
  this.load.image("coin", "assets/gift.png");       // Reemplaza con la ruta de la moneda
  this.load.image("background", "assets/BG_01.png"); // Fondo
}

function create() {
  // Creamos el tileSprite para el fondo
  // El tileSprite ocupa todo el ancho y alto del canvas
  backgroundTile = this.add.tileSprite(
    0,
    0,
    this.sys.canvas.width,
    this.sys.canvas.height,
    "background"
  );
  backgroundTile.setOrigin(0, 0);

  // Jugador
  player = this.physics.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height/2, "player").setScale(0.5);
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
  player.y -= 0;

  //verifica que las monedas par aspwnearlas
  // Verificar cuántas monedas hay en pantalla
  if (coins.countActive(true) <= 4) {
    spawnCoin(); // Generar monedas si quedan 3 o menos
  }

  // Mover el fondo para que parezca infinito verticalmente
  // Si el jugador "sube", podemos desplazar la posición del tile hacia abajo
  // Ajusta la velocidad a tu gusto
  backgroundTile.tilePositionY -= 0.2;

  // Fin del juego
  if (player.y < 0) {
    if (score >= 10) {
      this.add.text(this.sys.canvas.width / 2 - 70, this.sys.canvas.height / 2, "¡Ganaste!", {
        fontSize: "32px",
        fill: "#0f0",
      });
      this.scene.pause();
    } else {
      this.add.text(this.sys.canvas.width / 2 - 70, this.sys.canvas.height / 2, "Perdiste", {
        fontSize: "32px",
        fill: "#f00",
      });
      this.scene.pause();
    }
  }
}

// Función para generar obstáculos
function spawnObstacle() {
  const x = Phaser.Math.Between(50, this.sys.canvas.width - 50);
  const obstacle = obstacles.create(x, 0, "obstacle").setScale(0.5);
  obstacle.setVelocityY(200); // Velocidad de caída

  // Eliminar obstáculos fuera de pantalla
  obstacle.checkWorldBounds = true;
  obstacle.outOfBoundsKill = true;
}

// Función para generar monedas
function spawnCoin() {
  if (coins.countActive(true) <= 3) { // Generar monedas solo si quedan 3 o menos
    for (let i = 0; i < 5; i++) { // Crear un grupo de 5 monedas
      const x = Phaser.Math.Between(50, 1080); // Posición X aleatoria dentro de límites
      const y = Phaser.Math.Between(50, 300); // Posición Y aleatoria en la mitad superior

      const coin = coins.create(x, y, "coin").setScale(0.5);

      // Configurar el efecto de gravedad personalizada
      coin.setGravityY(20); // Gravedad leve para caída suave
      coin.setDragY(15); // Resistencia al movimiento
      coin.setBounce(0.3); // Rebote ligero al tocar el suelo (opcional)

      // Configurar límites para las monedas
      coin.setCollideWorldBounds(true);
      coin.onWorldBounds = true;
      coin.checkWorldBounds = true;
      coin.outOfBoundsKill = true;
    }
  }
}

// Colisión con un obstáculo
function hitObstacle(player, obstacle) {
  // Elimina el obstáculo
  obstacle.destroy();

  // Reducir las vidas sin afectar la posición del jugador
  lives--; 
  livesText.setText("Vidas: " + lives);

  // No mover al jugador ni cambiar su velocidad, solo pierde vida
  player.setVelocity(0);  // Detener cualquier movimiento accidental

  // Si se acaban las vidas, termina el juego
  if (lives <= 0) {
    this.add.text(100, 250, "Perdiste", { fontSize: "32px", fill: "#f00" });
    this.scene.pause();
  }
}

// Recolección de monedas
function collectCoin(player, coin) {
  coin.destroy();
  score++;
  scoreText.setText("Monedas: " + score);
}

// Si necesitas exportar la escena (depende de tu setup con webpack, parcel, etc.)
export default config;
