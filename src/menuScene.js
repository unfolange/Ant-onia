export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Cargar recursos necesarios para el menú
        this.load.image('sky', 'assets/BG_02.png');
        this.load.image('button', 'assets/button.png');
        this.load.audio('intro', 'sounds/logo.mp3');
    }

    create() {
        // Lógica y elementos gráficos del menú
        this.intro= this.sound.add('intro');
        this.intro.play();
        this.intro.setVolume(0.05);

        this.add.image(400, 500, 'sky');
        const playButton = this.add.image(370, 300, 'button');
        
        playButton.setInteractive();

        playButton.on('pointerdown', () => {
            // Iniciar la escena del juego
            this.scene.start('gameScene');
           // this.intro.stop();
        });
    }
}

export default MenuScene;
