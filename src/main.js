import MenuScene from './menuScene';
import gameSceneame from './gameScene';
import gameOver from './gameOver';

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MenuScene, gameOver, gameSceneame ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
}

var game = new Phaser.Game(config);