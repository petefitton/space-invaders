// game loop timer
let gameTimer;
// information of canvas
let display;
// players space ship
let playerSpaceShip;
// players object
let playerObj;
let playersCollisionDetector;
// enemy object
let enemyObj;

// size for space ships
let spaceShipWidth = 20;
let spaceShipHeight = 20;

// who is listening for events
let inputSubscribers = new Map();
let renderSubscribers = new Map();


// color values
const colors = {
    background: "#C0C0C0",
    playerColor: "#0000FF",
    enemyColor: "#FF0000",
    projectileColor: "#FFFF00"
};

// Display knows about the HTML 5 canvas
function Display() {
    this.canvas = document.getElementById("game"),
    this.centerWidth = this.canvas.width / 2,
    this.context = this.canvas.getContext("2d"),
    this.clear = function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    this.renderBackground = ()=>{
        this.context.fillStyle = colors.background;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },
    this.recalculate = function() {
        this.canvas = document.getElementById("game");
        this.centerWidth = this.canvas.width / 2;
    }
};

// listener for key down
var keyInputHandler = function(e) {
    console.log(`User pressed key: ${e.keyCode}`);
    for (const iterator of inputSubscribers) {
        iterator[1].inputHandler(e.keyCode);
    }
}

// the main loop
var gameLoop = () =>{
    display.clear();
    display.context.fillStyle = colors.background;

    display.renderBackground(display.canvas, display.context);

    playerObj.collide();

    for (const iterator of renderSubscribers) {
        iterator[1].render(display.context);
    }
};

// blueprint for player object
function player (spaceShip, collisionDetecor) {
    this.spaceShip = spaceShip,
    this.collisionDetecor = collisionDetecor,
    this.inputHandler = function(inputLetter) {
        this.spaceShip.keyMap[inputLetter].call();
    },
    this.render = function(context) {
        this.spaceShip.render(context);
    },
    this.collide = () =>{
        this.collisionDetecor.collide();
    }
};

// blueprint for enemy object
function enemy() {
    this.yLimit = Math.floor(display.canvas.height * 0.5);
    this.spaceShips = [],
    this.render = () => {
        for (const ship of this.spaceShips) {
            ship.render();
        }
    },
    this.spawnShips = (rows) => {        
        console.log(this.yLimit);
        var enemyShip = new spaceShip(display.centerWidth-(spaceShipWidth/2), this.yLimit-spaceShipHeight, spaceShipWidth,spaceShipHeight,colors.enemyColor);
        enemyShip.init();
        enemyShip.renderKey = `enemy-ship-${renderSubscribers.size}`;
        this.spaceShips.push(enemyShip);
        renderSubscribers.set(enemyShip.renderKey ,enemyShip);
    }
}

// blueprint for projectiles
function projectile(x, y, width, height, color, display, step, collisionDetecor, damage = 1) {
    this.active = true,
    this.x = x,
    this.y = y,
    this.width = width,
    this.height = height,
    this.color = color,
    this.step = step,
    this.maxSteps = display.canvas.height / this.step,
    this.currentSteps = 0,
    this.renderKey = '';
    this.collisionDetecor = collisionDetecor,
    this.damage = damage,
    this.render = (context) => {       
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
        this.moveUp();
    },
    this.moveUp = ()=>{
        console.log("Projectile moves up");
        this.y -= this.step;
        this.currentSteps++;
        if (this.currentSteps > this.maxSteps) {
            renderSubscribers.delete(this.renderKey);
        }
    },
    this.moveDown = ()=>{
        console.log("Projectile moves down");
        this.y +this.step + this.height > game.height ? this.y = game.height - this.height : this.y += this.step;
    }, 
    this.register = () => {
        this.renderKey = `player-projectile-${renderSubscribers.size}`;
        renderSubscribers.set(this.renderKey ,this);
        //this.collisionDetecor.projectilesOfPlayer.push(this);
        this.collisionDetecor.add([this.renderKey,this]);
    },
    this.unregister = () => {
        this.active = false;
        renderSubscribers.delete(this.renderKey ,this);
        this.collisionDetecor.remove([this.renderKey,this]);
    }
};

// blueprint for space ships
function spaceShip(x, y, width, height, color, hitpoints = 3, active = true) {
    this.x = x,
    this.y = y,
    this.width = width,
    this.height = height,
    this.color = color,
    this.renderKey = '',
    this.step = 20,
    this.hitpoints = hitpoints,
    this.active = active,
    this.renderMethod = (context) => {},
    this.init = () => {
        this.renderMethod = this.activeRender;
    }
    this.render = (context) => {
        //this.renderMethod.call(context);
        this.renderMethod(context); // (context);
    },
    this.moveLeft = ()=>{
        console.log("Spaceship moves left");
        this.x -this.step < 0 ? this.x = 0 : this.x -= this.step;
    },
    this.moveRight = ()=>{
        console.log("Spaceship moves right");
        this.x +this.step + this.width > game.width ? this.x = game.width - this.width : this.x += this.step;
    },
    this.shoot = ()=>{
        let shot = new projectile(this.x + this.width / 2, this.y, 3, 10, colors.projectileColor, display, 10, playersCollisionDetector);
        shot.register();
    },
    this.onCollision = (dmg) =>
    {
        console.log(`I got hit by ${dmg} damage points`);
        this.hitpoints -= dmg;
        if (this.hitpoints <= 0) {
            this.die();
        }
    },
    this.keyMap = {
        "65": this.moveLeft,
        "68": this.moveRight,
        "87": this.shoot
    },
    this.activeRender = function(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
    this.deathRender = (context) => {
        
    },
    this.die = () =>{
        this.activeRender = this.deathRender;
        renderSubscribers.delete(this.renderKey);
    }
};

// what has to happen to initialize the game lives here
let initializeGame = function() {
    console.log("Initializing");
    display = new Display();

    playersCollisionDetector = new PlayerCollisionDetector();
    playerSpaceShip = new spaceShip(display.centerWidth-(20/2), display.canvas.height-20, 20,20,colors.playerColor);
    playerSpaceShip.init();
    playerObj = new player(playerSpaceShip, playersCollisionDetector);
    inputSubscribers.set("player", playerObj);
    renderSubscribers.set('playerObj',playerObj);

    enemyObj = new enemy();
    enemyObj.spawnShips(1);

    document.addEventListener("keydown", keyInputHandler);
    display.canvas = document.getElementById("game");
    display.context = display.canvas.getContext("2d");
    display.recalculate();
    display.renderBackground(display.canvas, display.context);    
    
    gameTimer = setInterval(gameLoop, 10);    
};

// knows projectiles and checks if they collide with anything 
// collision detection is not pixel perfect
function PlayerCollisionDetector() {
    this.rows = Math.ceil(display.canvas.width / spaceShipWidth)
    this.projectilesOfPlayer = new Map(),
    this.collide = () => {
        if(this.projectilesOfPlayer.size == 0) return;
        // console.log('collision detection on');
        for (const proj of this.projectilesOfPlayer) {
            let item = proj[1];
            if (!item.active) return;
            // console.log(item);
            let itemColumn = Math.ceil(item.x / spaceShipWidth);
            let itemRow = Math.ceil(item.y / spaceShipHeight)
            //console.log("Checking Col ", itemColumn);
            for (const enemyShip of enemyObj.spaceShips) {
                let enemyShipColumn = Math.ceil(enemyShip.x / spaceShipWidth);
                let enemyShipRow = Math.ceil(enemyShip.y / spaceShipHeight);
                if (enemyShipColumn >= itemColumn-1 && enemyShipColumn <= itemColumn+1
                    && enemyShipRow >= itemRow-1 && enemyShipRow <= itemRow + 1
                    && item.x - enemyShip.x > 0
                    && (enemyShip.x + enemyShip.width) - (item.x+item.width) > 0 ) {
                        // inform the space ship about the hit
                        enemyShip.onCollision(item.damage);
                        // deactivate the projectile
                        item.unregister();
                   }                
            }
        }
    },
    this.add = (pair) => {
        this.projectilesOfPlayer.set(pair[0], pair[1]);
    },
    this.remove = (item) => {
        this.projectilesOfPlayer.delete(item);
    }     
};

document.addEventListener("DOMContentLoaded", initializeGame);