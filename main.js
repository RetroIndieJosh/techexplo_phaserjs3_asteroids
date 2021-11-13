const LASER_MAX = 3;
const WORLD_WIDTH = 1280;
const WORLD_HEIGHT = 720;

var config = {
    type: Phaser.AUTO,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var asteroids = null;
var lasers = null;
var player = null;

var cursors = null;
var spacebar = null;

var playerspeed = 0;

function preload()
{
    const imgfolder = "img";
    for(let i = 1; i <= 4; i++)
        this.load.image('meteor' + i, imgfolder + '/bigmeteor' + i + ".png");
    for(let i = 1; i <= 2; i++)
        this.load.image('meteorpiece' + i, imgfolder + '/meteorpiece' + i + ".png");
    this.load.image('ship', imgfolder + "/ship.png");
    this.load.image('laser', imgfolder + "/laser.png");
}

function create()
{
    asteroids = this.physics.add.group({
        key: 'meteor1',
        repeat: 10,
        setXY: { x: 12, y: 0, stepX: 100}
    });
    player = this.physics.add.sprite(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'ship');
    player.setBounce(0.5);

    this.physics.add.overlap(player, asteroids, collide_player_asteroid)

    lasers = this.physics.add.group({
        key: 'laser',
        repeat: LASER_MAX - 1,
        setXY: { x: 0, y: 0}
    });
    for(let i = 0; i < lasers.children.entries.length; i++) 
        lasers.children.entries[i].setActive(false).setVisible(false);
    /*
    for(let i = 0; i < LASER_MAX; ++i) {
        let laser = this.physics.add.sprite(player.x, player.y, 'laser');
        laser.setActive(false).setVisible(false);
        lasers.push(laser);
    }
    this.physics.add.overlap(laser, asteroids, collide_laser_asteroid);
    */
    this.physics.add.overlap(lasers, asteroids, collide_laser_asteroid);

    cursors = this.input.keyboard.createCursorKeys();
    spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function add_asteroid()
{
    // TODO treat as objects? collision?
    let x = Math.random() * WORLD_WIDTH;
    let y = Math.random() * WORLD_HEIGHT;
    let imageindex = Math.floor(Math.random() * 4) + 1;

    let asteroid = game.physics.add.sprite(x, y, 'meteor' + imageindex);
    asteroids.add(asteroid);
    game.add.image(x, y, 'meteor' + imageindex);
}

function collide_laser_asteroid(laser, asteroid)
{
    laser.setActive(false).setVisible(false);
    asteroid.setActive(false).setVisible(false);
}

function collide_player_asteroid(player, asteroid)
{
    asteroid.setActive(false).setVisible(false);
    console.log("Player collide with asteroid");
    // TODO
}

function find_inactive_laser() {
    for(let i = 0; i < lasers.children.entries.length; i++) {
        if(!lasers.children.entries[i].active)
            return lasers.children.entries[i];
    }
    return null;
}

function update_lasers(game)
{
    for(let i = 0; i < lasers.children.entries.length; i++) {
        let x = lasers.children.entries[i].x;
        let y =  lasers.children.entries[i].y;
        if(x < 0 || x > WORLD_WIDTH || y < 0 || y > WORLD_HEIGHT)
            lasers.children.entries[i].setActive(false).setVisible(false);
    }

    const LASER_SPEED = 300

    if(Phaser.Input.Keyboard.JustDown(spacebar)) {
        let laser = find_inactive_laser();
        if(laser == null)
            console.log("No laser found");
        if(laser != null) {
            laser.x = player.x;
            laser.y = player.y;
            laser.setActive(true).setVisible(true);
            game.physics.velocityFromAngle(player.angle, LASER_SPEED, laser.body.velocity);
            laser.angle = player.angle;
            console.log("Pew pew");
        }
    }
}

function update_movement(game)
{
    const ROT_VEL_INC = 1;
    const ROT_MIN = 1;
    const ROT_MAX = 100;

    const SPEED_INC = 3;
    const SPEED_MAX = 280;

    if(cursors.left.isDown)
        player.body.angularVelocity -= ROT_VEL_INC;
    else if(cursors.right.isDown)
        player.body.angularVelocity += ROT_VEL_INC;
    else {
        if(player.body.angularVelocity < -ROT_MIN)
            player.body.angularVelocity += ROT_VEL_INC * 2;
        else if(player.body.angularVelocity > ROT_MIN)
            player.body.angularVelocity -= ROT_VEL_INC * 2;
        else
            player.body.angularVelocity = 0;
    }

    if(player.body.angularVelocity < -ROT_MAX)
        player.body.angularVelocity = -ROT_MAX;
    if(player.body.angularVelocity > ROT_MAX)
        player.body.angularVelocity = ROT_MAX;

    if(player.x < 0)
        player.x = WORLD_WIDTH;
    else if(player.x > WORLD_WIDTH)
        player.x = 0;

    if(player.y < 0)
        player.y = WORLD_HEIGHT;
    else if(player.y > WORLD_HEIGHT)
        player.y = 0;

    if(cursors.down.isDown)
        playerspeed -= SPEED_INC;
    else if(cursors.up.isDown)
        playerspeed += SPEED_INC;

    if(playerspeed < -SPEED_MAX)
        playerspeed = -SPEED_MAX;
    if(playerspeed > SPEED_MAX)
        playerspeed = SPEED_MAX;

    game.physics.velocityFromAngle(player.angle, playerspeed, player.body.velocity);
}

function update()
{
    // TODO spawn asteroids
    update_lasers(this);
    update_movement(this);
}