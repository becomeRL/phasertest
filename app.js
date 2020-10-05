//Dynamic Physics Group
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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
    medicines,
    cursors,
    viruses,
    maskedVirus,
    HP = 100,
    shakeCamera,
    bullets,
    timer,
    info,
    gameOver = false,
    game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', './assets/sky.png');
    this.load.image('ground', './assets/platform.png');
    this.load.image('medicine', './assets/medicine.png');
    this.load.spritesheet('dude', './assets/dude.png', { frameWidth: 32, frameHeight: 48});
    this.load.spritesheet('virus', './assets/virus.png', {frameWidth: 30, frameHeight: 30});
    this.load.spritesheet('maskedVirus', './assets/maskedVirus.png', {frameWidth: 30, frameHeight: 30});
    this.load.image('bullet', './assets/bullet.png');
    
}


function create ()
{
    

    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    
    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3}),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });
    
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8}),
        frameRate: 10,
        repeat: -1
    });
    
    cursors = this.input.keyboard.createCursorKeys();
    keySpace = this.input.keyboard.addKey('space');

    this.cameras.add(0, 0, 800, 600);

    shakeCamera = this.cameras.add(0, 0, 800, 600);

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

    for (var i = 0; i < 3; i++)
    {
        var x = Phaser.Math.Between(0, 750);
        var y = Phaser.Math.Between(0, 500);
        
        bullets = this.physics.add.group({
            key: 'bullet',
            visible: false,
            active: false,
            enable: true
            
        });
        bullets.create(800, 600, 'bullet')
        

        viruses = this.physics.add.sprite(x, y, 'virus');
        viruses.setInteractive();
        viruses.setBounce(1);
        viruses.setCollideWorldBounds(true);
        viruses.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
        this.physics.add.collider(viruses, platforms);
        this.physics.add.collider(player, viruses, hitVirus, null, this);
        this.physics.add.collider(bullets, viruses,  hitBullet, null, this);
    }

    medicines = this.physics.add.group();
    medicines.create(Phaser.Math.Between(0,800), 0, 'medicine');

    info = this.add.text(16, 16, '', { fontSize: '32px', fill: '#000'} )
    timer = this.time.addEvent({ delay: 10000, callback: gameTimeOver, callbackScope: this });
    
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(medicines, platforms);
    this.physics.add.overlap(player, medicines, getmedicine, null, this);
    
}


function update () {

    info.setText('HP: ' + HP + '\nTime: '+ Math.floor(10000 - timer.getElapsed()))
    if (HP == 0) {
        player.anims.play('turn');
        player.setTint(0xff0000);
        timer.paused = true;
        this.physics.pause();
        gameOver = true;
    }
    
    if (gameOver) {
        return;
    }

    if (cursors.left.isDown) {

        player.setVelocityX(-160);
        player.anims.play('left', true);
        this.input.keyboard.on('keydown_SPACE', function () {
            bullets.create(player.x, player.y, 'bullet')
            bullets.setVelocityX(-1000)
        })

    } else if (cursors.right.isDown) {

        player.setVelocityX(160);
        player.anims.play('right', true);
        this.input.keyboard.on('keydown_SPACE', function () {
            bullets.create(player.x, player.y, 'bullet')
            bullets.setVelocityX(1000)
        })
        

    } else {

        player.setVelocityX(0);
        player.anims.play('turn');

    }

    if (cursors.up.isDown && player.body.touching.down) {

        player.setVelocityY(-330);
    }
}


function reGenmedicine () {
    medicines.create(Phaser.Math.Between(0, 800), 0, 'medicine');
}

function getmedicine (player, medicine) {
    medicine.disableBody(true, true);
    if (HP == 100 ) {
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
    //HP += 100;
    //info.setText('HP: ' + HP);
    viruses.body.enable = false;
    player.anims.play('turn');
    timer.paused = true;
    this.physics.pause();
    gameOver = true;

}

function hitVirus (player) {
    /*
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    timer.paused = true;
    gameOver = true;
    */
    HP -= 10;
    info.setText('HP: ' + HP);
    shakeCamera.shake(50, 0.015);
}

function gameTimeOver () {
    this.physics.pause();
    player.anims.play('turn');
    gameOver = true;
}

