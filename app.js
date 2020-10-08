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
    cursors,
    viruses,
    maskedVirus,
    HP = 100,
    camera,
    bullets,
    timer,
    info,
    txt,
    gameOver = false,
    game = new Phaser.Game(config);

function preload ()
{
    this.load.image('bg', './assets/bg.png');
    this.load.image('ground', './assets/platform.png');
    this.load.image('medicine', './assets/medicine.png');
    this.load.spritesheet('dude', './assets/dude1.png', {frameWidth: 55, frameHeight: 55});
    this.load.spritesheet('shootRight', './assets/shootRight.png', {frameWidth: 73, frameHeight: 55});
    this.load.spritesheet('shootLeft', './assets/shootLeft.png', {frameWidth: 73, frameHeight: 55});
    this.load.spritesheet('dead', './assets/dead.png', {frameWidth: 55, frameHeight: 55});
    this.load.spritesheet('virus', './assets/virus.png', {frameWidth: 30, frameHeight: 30});
    this.load.spritesheet('maskedVirus', './assets/maskedVirus.png', {frameWidth: 30, frameHeight: 30});
    this.load.image('bullet', './assets/bullet.png');
    
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

    
    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 1, end: 8}),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'turnLeft',
        frames: [ { key: 'dude', frame: 8 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'turnRight',
        frames: [ { key: 'dude', frame: 9 } ],
        frameRate: 20
    });
    
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 9, end: 16}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'hitR',
        frames: [ { key: 'dude', frame: 17 } ],
        frameRate: 10
    });

    this.anims.create({
        key: 'hitL',
        frames: [ { key: 'dude', frame: 0 } ],
        frameRate: 10
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
    for (var i = 0; i < 5; i++)
    {
        var x = Phaser.Math.Between(0, 950);
        var y = Phaser.Math.Between(0, 700);
        
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
    medicines.create(Phaser.Math.Between(0,1000), Phaser.Math.Between(0,800), 'medicine');

    info = this.add.text(16, 16, '', { fontSize: '32px', fill: '#ffffff'} )
    timer = this.time.addEvent({ delay: 1000000, callback: gameTimeOver, callbackScope: this });

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(medicines, platforms);
    this.physics.add.overlap(player, medicines, getmedicine, null, this);
    
}


function update () {

    info.setText('HP: ' + HP + '\nTime: '+ Math.floor(1000000 - timer.getElapsed()))
    
    if (gameOver) {
        return;
    }

    if (cursors.left.isDown) {

        player.setVelocityX(-160);
        player.anims.play('left', true);
        this.input.keyboard.on('keydown_SPACE', function () {
            player.setTexture('shootLeft')
            bullets.create(player.x, player.y, 'bullet')
            bullets.setVelocityX(-1000)
        })
        this.input.keyboard.on('keyup', function (){
            player.setVelocityX(0);
            //player.anims.play('turnLeft');
        })

    } else if (cursors.right.isDown) {

        player.setVelocityX(160);
        player.anims.play('right', true);
        this.input.keyboard.on('keydown_SPACE', function () {
            player.setTexture('shootRight')
            bullets.create(player.x, player.y, 'bullet')
            bullets.setVelocityX(1000)
        })
        this.input.keyboard.on('keyup', function () {
            player.setVelocityX(0);
            //player.anims.play('turnRight');
            
        })
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }

    if (HP == 0) {
        gameOver = true;
        this.physics.pause();
        player.setTexture('dead');
        player.setTint(0xff0000);
        timer.paused = true;
    }
}

function reGenmedicine () {
    medicines.create(Phaser.Math.Between(0, 800), 0, 'medicine');
}

function getmedicine (player, medicine) {
    medicine.disableBody(true, true);
    if (HP == 100) {
        HP += 0;
        info.setText('HP: ' + HP);
    } else {
        HP += 10;
        info.setText('HP: ' + HP);
    }
    reGenmedicine();
}

function hitBullet(viruses) {
    
    viruses.setTexture('maskedVirus')
    //viruses.play('explode');
    viruses.body.enable = false;
    timer.paused = true;
    this.physics.pause();
    gameOver = true;
    camera.fade(2000);

}

function hitVirus (player) {

    player.anims.play('hitR')
    HP -= 10;
    info.setText('HP: ' + HP);
    camera.shake(50, 0.015);
    
}

function gameTimeOver () {
    player.anims.play('dead')
    this.physics.pause();
    gameOver = true;
}

