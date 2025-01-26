export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  preload() {
    // Cargar recursos necesarios para el menú
    this.load.image("sky", "assets/Menu1.png");
    this.load.image("button", "assets/PlayB.png");
    this.load.audio("intro", "sounds/logo.mp3");
    this.load.audio("interface", "sounds/interface.mp3");
  }

  create() {
    // Lógica y elementos gráficos del menú
    this.intro = this.sound.add("intro");
    //  this.intro.play();
    this.intro.setVolume(0.05);

    this.add.image(500, 400, "sky").setScale(0.49);
    const playButton = this.add.image(240, 450, "button");

    playButton.setInteractive();
    
    playButton.on("pointerdown", () => {
      // Iniciar la escena del juego
      this.scene.start("CinematicScene");
      // Detener el sonido de intro si aún está reproduciéndose
      if (this.intro) {
          this.intro.stop();
      }
    });
  }
}

export default MenuScene;
