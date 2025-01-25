export class gameScene extends Phaser.Scene{
    constructor(){
        super({key:'gameScene'});
    }
    
     preload() {
        this.load.image('sky', 'assets/BG_01.png');
        this.load.image('ground', 'assets/platform3.png');
        this.load.image('star', 'assets/gift.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude', 'assets/image.png', { frameWidth: 48, frameHeight: 48 });
        this.load.audio('christmas', 'sounds/christmas.mp3');
        this.load.audio('inter', 'sounds/interface.mp3');
        this.load.audio('hurt', 'sounds/hurt.mp3');
        
    }
    
    
     create() {
        // A simple background for our game
       // this.sound.stopAll();

        this.christmas= this.sound.add('christmas', { loop: true });
        this.inter= this.sound.add('inter');
        this.hurt= this.sound.add('hurt');

        this.christmas.play();
        this.christmas.setVolume(0.05);

        this.gameOver = false;
        this.highScore =  localStorage.getItem('highScore') || 0 ;
        this.width=800;
        this.height=500;
        this.score=0;

        this.add.image(400, 300, 'sky');
    
        // The platforms group contains the ground and the 2 ledges we can jump on
        this.platforms = this.physics.add.staticGroup();
    
        // Create initial platforms
        this.createInitialPlatforms();
    
        // The player and its settings
        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        
        // Player animations
          if (!this.anims.exists('left')) {
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
    }

    if (!this.anims.exists('turn')) {
        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 8 }],
            frameRate: 20
        });
    }

    if (!this.anims.exists('right')) {
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 9, end: 16 }),
            frameRate: 10,
            repeat: -1
        });
    }
    
        // Input Events
        this.cursors = this.input.keyboard.createCursorKeys();
    
        // Stars, bombs, score, and collisions
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });
    
        this.stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });
    
        this.bombs = this.physics.add.group();
    
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        this.highScoreText = this.add.text(500, 16, 'High Score:'+ this.highScore, { fontSize: '32px', fill: '#000' });
    
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);
    
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
    }
    
     update ()
    {
        if (this.gameOver)
        {
            return;
        }
        
        if (this.cursors.left.isDown)
        {
            console.log('Playing left animation');
            this.player.setVelocityX(-160);
    
            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown)
        {
            console.log('Playing right animation');

            this.player.setVelocityX(160);
    
            this.player.anims.play('right', true);
        }
        else
        {
            this.player.setVelocityX(0);
    
            this.player.anims.play('turn');
        }
    
        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-330);
        }
       // console.log("🚀 ~ file: app.js:132 ~ this.width:", this.width)//768
    
        if (this.player.x > this.width - 40  && (this.cursors.right.isDown)) {
            console.log("🚀 ~ file: app.js:134 ~ this.player.x:", this.player.x)//824
            
            this.player.x -= this.width;
            console.log("🚀 ~ file: app.js:137 ~ this.player.x:", this.player.x) //24
        }  
        
        else if (this.player.x < 40  && (this.cursors.left.isDown)) {
            console.log("🚀 ~ file: app.js:139 ~ this.player.x:", this.player.x)
            // Adjust this.player position to wrap around1
            this.player.x += this.width ;
            console.log("🚀 ~ file: app.js:142 ~ this.player.x:", this.player.x)//824
        }
       
    }
    
     createInitialPlatforms() {
        this.platforms.create(350, 568, 'ground').setScale(3).refreshBody();
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');
    }
    
     collectStar (player, star)
    {
        star.disableBody(true, true);
    
        //  Add and update the score
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        this.inter.play();
        this.inter.setVolume(0.05);
       // this.highScoreText.setText('High score: ' + this.highScore);
    
        if (this.stars.countActive(true) === 0)
        {
            //  A new batch of this.stars to collect
            this.stars.children.iterate(function (child) {
    
                child.enableBody(true, child.x, 0, true, true);
    
            });
    
            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    
            var bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;
    
        }
    }
    
     hitBomb (player)
    {
        this.physics.pause();
    
        player.setTint(0xff0000);
    
        player.anims.play('turn');
        this.hurt.play();
        this.hurt.setVolume(0.2);
        this.gameOver = true;
        this.time.delayedCall(3000, function() {
            this.scene.start('gameOver', { score: this.score });
        }, [], this);
        
    }

}

export default gameScene;
