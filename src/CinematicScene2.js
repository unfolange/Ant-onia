export class CinematicScene2 extends Phaser.Scene {
    constructor() {
      super({ key: 'CinematicScene2' });
    }
  
    preload() {
      // Cargar el video
      this.load.video('Videolvl2', 'assets/Scene_02.mp4', 'loadeddata', false, true);
    }
  
    create() {
      // Crear el video en la escena
      const video = this.add.video(
        400,
        400,
        'Videolvl2'
      );
  
      // Obtener las dimensiones de la cámara y del video
      const cameraWidth = this.cameras.main.width;
      const cameraHeight = this.cameras.main.height;
  
      // Mantener la relación de aspecto al escalar
      const scaleX = cameraWidth / 480;
      const scaleY = cameraHeight / video.height;
      const scale = Math.max(scaleX, scaleY); // Escalar para cubrir toda la pantalla
  
      // Ajustar el tamaño y posición del video
      video.setOrigin(0.8, 0.2);
      video.setScale(1.2); // Escalar proporcionalmente
      video.setPosition(820, 200); // Centrar el video
  
      // Reproducir el video sin audio (en el inicio)
    video.setMute(true); // Mute al inicio
    video.play();

    // Desmutear el video después de 1 segundo
    this.time.delayedCall(1000, () => {
      video.setMute(false); // Desmutear el video después de 1 segundo
    });
  
      // Cuando el video termine, cambiar a la escena del juego
      video.on('complete', () => {
        this.scene.start('InfiniteBackgroundScene'); // Cambia 'gameScene' por el nombre de tu escena principal
      });
  
      // Opción para omitir la cinemática al presionar una tecla
      this.input.keyboard.once('keydown-SPACE', () => {
        video.stop(); // Detener el video
        this.scene.start('InfiniteBackgroundScene'); // Cambiar a la escena del juego
      });
  
      // Mostrar un texto para indicar cómo omitir la cinemática
      this.add
        .text(
          cameraWidth / 2,
          cameraHeight - 50,
          'Presiona ESPACIO para omitir',
          {
            font: '20px Arial',
            fill: '#ffffff',
          }
        )
        .setOrigin(0.5);
    }
  }
  
  export default CinematicScene2;
  