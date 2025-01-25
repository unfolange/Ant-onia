class CinematicScene extends Phaser.Scene {
    constructor() {
      super({ key: 'CinematicScene' });
    }
  
    preload() {
      // Cargar el video
      this.load.video('introVideo', 'assets/cinematic.mp4', 'loadeddata', false, true);
    }
  
    create() {
      // Crear el video en la escena
      const video = this.add.video(this.cameras.main.width / 2, this.cameras.main.height / 2, 'introVideo');
  
      // Ajustar el tamaño del video para que se adapte a la pantalla
      video.setOrigin(0.5, 0.5);
      video.setScale(
        this.cameras.main.width / video.width,
        this.cameras.main.height / video.height
      );
  
      // Reproducir el video
      video.play();
  
      // Cuando el video termine, cambiar a la escena del juego
      video.on('complete', () => {
        this.scene.start('GameScene'); // Cambia 'GameScene' por el nombre de tu escena principal
      });
  
      // Opción para omitir la cinemática al presionar una tecla
      this.input.keyboard.once('keydown-SPACE', () => {
        video.stop(); // Detener el video
        this.scene.start('GameScene'); // Cambiar a la escena del juego
      });
  
      // Mostrar un texto para indicar cómo omitir la cinemática
      this.add
        .text(
          this.cameras.main.width / 2,
          this.cameras.main.height - 50,
          'Presiona ESPACIO para omitir',
          {
            font: '20px Arial',
            fill: '#ffffff',
          }
        )
        .setOrigin(0.5);
    }
  }
  