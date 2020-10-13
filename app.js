var config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 800,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }  
};

var platforms,
    player,
    medicines,
    shields,
    mask,
    emitter,
    cursors,
    viruses,
    maskedVirus,
    bullets,
    camera,
    info,
    timer,
    HP = 100,
    protect = false,
    gameOver = false,
    game = new Phaser.Game(config);

function preload ()
{
    this.load.image('bg', './assets/bg.png');
    this.load.image('ground', './assets/platform.png');
    this.load.image('medicine', './assets/medicine.png');
    this.load.image('shield', './assets/shield.png');
    this.load.image('mask', './assets/mask.png');
    this.load.spritesheet('dude', './assets/dude.png', {frameWidth: 55, frameHeight: 55});
    this.load.spritesheet('shootRight', './assets/shootRight.png', {frameWidth: 73, frameHeight: 55});
    this.load.spritesheet('shootLeft', './assets/shootLeft.png', {frameWidth: 73, frameHeight: 55});
    this.load.spritesheet('hit', './assets/hit.png', {frameWidth: 55, frameHeight: 55});
    this.load.spritesheet('dead', './assets/dead.png', {frameWidth: 55, frameHeight: 55});
    this.load.spritesheet('virus', './assets/3.png', {frameWidth: 60, frameHeight: 60});
    this.load.spritesheet('maskedVirus', './assets/maskedVirus.png', {frameWidth: 30, frameHeight: 30});
    this.load.image('bullet', './assets/bullet.png');
    this.load.image('gameover', './assets/gameover.png');
    this.load.image('gameclear', './assets/gameclear.png');
}

function create ()
{
    this.add.image(500, 400, 'bg');

    platforms = this.physics.add.staticGroup();
    platforms.create(500, 768, 'ground').setScale(2).refreshBody();
    platforms.create(800, 270, 'ground').setScale(0.5).refreshBody();
    platforms.create(810, 600, 'ground').setScale(0.5).refreshBody();
    platforms.create(150, 300, 'ground').setScale(0.5).refreshBody();
    platforms.create(190, 550, 'ground').setScale(0.5).refreshBody();
    platforms.create(500, 150, 'ground').setScale(0.5).refreshBody();
    platforms.create(500, 450, 'ground').setScale(0.5).refreshBody();

    player = this.physics.add.sprite(500, 0, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 7}),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'turnLeft',
        frames: [ { key: 'dude', frame: 7 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'turnRight',
        frames: [ { key: 'dude', frame: 8 } ],
        frameRate: 20
    });
    
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 8, end: 15}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'dead',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 1}),
        frameRate: 10
    });
    
    cursors = this.input.keyboard.createCursorKeys();

    this.cameras.add(0, 0, 1000, 800);
    camera = this.cameras.add(0, 0, 1000, 800);

    /*
    var config1 = {
        key: 'move',
        frames: 'virus',
        frameRate: 4,
        repeat: -1
    };

    var config2 = {
        key: 'explode',
        frames: 'maskedVirus',
        hideOnComplete: true
    };

    this.anims.create(config1);
    this.anims.create(config2);
    */

    for (var i = 0; i < 7; i++)
    {
        var x = Phaser.Math.Between(0, 950);
        var y = Phaser.Math.Between(0, 650);
        
        bullets = this.physics.add.group({
            key: 'bullet',
            visible: false,
            active: false,
            enable: true
            
        });

        viruses = this.physics.add.sprite(x, y, 'virus');
        viruses.setInteractive();
        viruses.setBounce(1);
        viruses.setCollideWorldBounds(true);
        viruses.setVelocity(Phaser.Math.Between(-200, 200), 0);
        this.physics.add.collider(viruses, platforms);
        this.physics.add.collider(player, viruses, hitVirus, null, this);
        this.physics.add.collider(bullets, viruses,  hitBullet, null, this);
    }

    medicines = this.physics.add.group();
    medicines.create(Phaser.Math.Between(0,1000), Phaser.Math.Between(0,650), 'medicine');
    shields = this.physics.add.group();
    shields.create(Phaser.Math.Between(0,1000), Phaser.Math.Between(0,650), 'shield');

    mask = this.add.particles('mask');
    emitter = mask.createEmitter({
        lifespan: 1,
        scale: 1,
        visible: false,
    });

    info = this.add.text(16, 16, '', { fontSize: '32px', fill: '#ffffff'} );
    timer = this.time.addEvent({ delay: 1000000, callback: gameTimeOver, callbackScope: this });

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(medicines, platforms);
    this.physics.add.collider(shields, platforms);
    this.physics.add.overlap(player, medicines, getMedicine, null, this);
    this.physics.add.overlap(player, shields, getShield, null, this);
    
}


function update () {

    info.setText('HP: ' + HP + ' / PROTECT: ' + protect + '\nTime: '+ Math.floor(1000000 - timer.getElapsed()));
    
    if (gameOver) {
        return;
    }

    if (cursors.left.isDown) {

        player.setVelocityX(-160);
        player.anims.play('left', true);
        this.input.keyboard.on('keydown_SPACE', function () {
            player.setTexture('shootLeft');
            bullets.create(player.x, player.y, 'bullet');
            bullets.setVelocityX(-1000);
        })
        this.input.keyboard.on('keyup', function (){
            player.setVelocityX(0);
            player.anims.play('turnLeft');
        })

    } else if (cursors.right.isDown) {

        player.setVelocityX(160);
        player.anims.play('right', true);
        this.input.keyboard.on('keydown_SPACE', function () {
            player.setTexture('shootRight');
            bullets.create(player.x, player.y, 'bullet');
            bullets.setVelocityX(1000);
        })
        this.input.keyboard.on('keyup', function () {
            player.setVelocityX(0);
            player.anims.play('turnRight');
        })
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }

    if (HP == 0) {
        player.setTexture('dead');
        this.physics.pause();
        gameOver = true;
        timer.paused = true;
        player.setTint(0xff0000);
        camera.fade(2000);
        this.add.image(500, 400, 'gameover');
    }
}

function regenMedicine () {
    medicines.create(Phaser.Math.Between(0, 950), Phaser.Math.Between(0, 650), 'medicine');
}

function regenShield() {
    shields.create(Phaser.Math.Between(0, 950), Phaser.Math.Between(0, 650), 'shield');
}

function getMedicine (player, medicine) {
    medicine.disableBody(true, true);
    if (HP == 100) {
        HP += 0;
        info.setText('HP: ' + HP);
    } else {
        HP += 10;
        info.setText('HP: ' + HP);
    }
    regenMedicine();
}

function getShield (player, shield) {
    shield.disableBody(true, true);
    emitter.setVisible(true);
    emitter.startFollow(player);
    protect = true;
    setTimeout(function(){
        emitter.stopFollow();
        protect = false;
        emitter.setVisible(false);
    }, 10000);
    regenShield();
}

function hitBullet(viruses) {
    
    viruses.setTexture('maskedVirus');
    //viruses.play('explode');
    viruses.body.enable = false;
    timer.paused = true;
    this.physics.pause();
    gameOver = true;
    this.add.image(500, 400, 'gameclear');
    camera.fade(2000);
}

function hitVirus (player) {
    if (protect == true) {
        HP -= 0;
        info.setText('HP: ' + HP);
    } else {
        player.setTexture('hit');
        HP -= 10;
        info.setText('HP: ' + HP);
        camera.shake(50, 0.015);
    }
    
}

function gameTimeOver () {
    player.setTexture('dead');
    this.physics.pause();
    gameOver = true;
    camera.fade(2000);
    this.add.image(500, 400, 'gameover');
}

