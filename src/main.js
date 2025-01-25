import MenuScene from "./menuScene";
import infiniteBackgroundScene from "./infiniteBackground";
import gameOver from "./gameOver";
import gameScene from "./gameScene"; // Cambia "gameSceneame" al nombre correcto

var config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [MenuScene, gameOver, infiniteBackgroundScene, gameScene], // Asegúrate de que todos los nombres sean correctos
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }, // Sin gravedad para InfiniteBackgroundScene
      debug: false,
    },
  },
};

var game = new Phaser.Game(config);
