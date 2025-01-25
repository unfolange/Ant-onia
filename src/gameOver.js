import { gameScene } from './gameScene';

export class gameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'gameOver' });
    }

    init(data) {
        this.currentScore = data.score || 0;
        this.storedHighScore = localStorage.getItem('highScore') || 0;

        if (this.currentScore > this.storedHighScore) {
            localStorage.setItem('highScore', this.currentScore);
        }
        this.storedHighScore = localStorage.getItem('highScore') || 0;

    }

    preload() {
        this.load.image('over', 'assets/BG_03.png');
    }

    create() {
        this.sound.stopAll();
        this.add.image(400, 280, 'over');

        this.add.text(150, 300, 'Score: ' + this.currentScore, {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        });

        this.add.text(450, 300, 'High Score: ' + this.storedHighScore, {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        });

        const playAgainText = this.add.text(310, 400, 'Play Again', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        });

        playAgainText.setInteractive();

        playAgainText.on('pointerdown', () => {
            // Reiniciar la escena del juego
            this.scene.stop('gameScene');  // Detener la escena actual
            this.scene.start('gameScene', { score: 0, highScore: this.storedHighScore });  // Reiniciar la escena con un nuevo objeto de datos
        });

        

    }
}

export default gameOver;
