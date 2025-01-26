export class gameOverWin extends Phaser.Scene {
    constructor() {
        super({ key: 'gameOverWin' });
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
        this.load.image('over', 'assets/Win.png');
        this.load.image('button_retry', 'assets/Retry.png');
    }

    create() {
        this.sound.stopAll();
        this.add.image(500, 360, 'over').setScale(0.5);

        this.add.text(150, 300, 'Score: ' + this.currentScore, {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        });

        this.add.text(700, 300, 'High Score: ' + this.storedHighScore, {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        });

        const playAgainText = this.add.image(500, 700, "button_retry");

        playAgainText.setInteractive();

        playAgainText.on('pointerdown', () => {
            // Reiniciar la escena del juego
            this.scene.stop('gameScene');  // Detener la escena actual
            this.scene.start('gameScene', { lives: 3, score: 0, highScore: this.storedHighScore });  // Reiniciar la escena con un nuevo objeto de datos
        });

        

    }
}

export default gameOverWin;
