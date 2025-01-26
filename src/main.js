import MenuScene from "./menuScene.js";
import infiniteBackgroundScene from "./infiniteBackground.js";
import gameOver from "./gameOver.js";
import gameOverWin from "./gameOverWin.js";
import gameScene from "./gameScene.js"; // Cambia "gameSceneame" al nombre correcto
import gameScene2 from "./gameScene2.js"; // Cambia "gameSceneame" al nombre correcto
import gameScene3 from "./gameScene3.js"; // Cambia "gameSceneame" al nombre correcto
import CinematicScene from "./CinematicScene.js"; // Cambia "gameSceneame" al nombre correcto
import CinematicScene2 from "./CinematicScene2.js"; // Cambia "gameSceneame" al nombre correcto
import endGame from "./endGame.js"; // Cambia "gameSceneame" al nombre correcto

var config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    MenuScene,
    gameOver,
    infiniteBackgroundScene,
    gameScene,
    gameScene2,
    gameScene3,
    CinematicScene,
    CinematicScene2,
    endGame,
    gameOverWin,
  ], // Asegúrate de que todos los nombres sean correctos
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }, // Sin gravedad para InfiniteBackgroundScene
      debug: false,
    },
  },
};

var game = new Phaser.Game(config);
