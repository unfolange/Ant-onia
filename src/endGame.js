export class endGame extends Phaser.Scene {
    constructor() {
        super({ key: 'endGame' });
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
        this.load.image('endgame', 'assets/Fondo3F.png');
        this.load.spritesheet("Fly_Antonia", "assets/Fly_Antonia.png", {
            frameWidth: 142,
            frameHeight: 300,
        });
    }

    create() {
        this.sound.stopAll();
        this.add.image(500, 360, 'endgame').setScale(1);

        this.timer = this.time.addEvent({
            delay: 2000,
            callback: this.changeBackground,
            callbackScope: this,
            loop: true,
          });

            // Animación de vuelo
        this.anims.create({
            key: "fly",
            frames: this.anims.generateFrameNumbers("Fly_Antonia", {
            start: 0,
            end: 14,
            }),
            frameRate: 6,
            repeat: -1,
        });
    
        // Jugador
        this.player = this.physics.add
            .sprite(this.sys.canvas.width / 2, this.sys.canvas.height - 200, "Fly_Antonia")
            .setScale(0.5);
        this.player.setCollideWorldBounds(true);
        this.player.play("fly", true);
    }

    changeBackground(){
        if (this.currentScore > 10) {
            this.scene.start("gameOverWin", { score: this.currentScore });
        }else{
            this.scene.start("gameOver", { score: this.currentScore });
        }
    }
}

export default endGame;
