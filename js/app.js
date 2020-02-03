// game loop timer
let gameTimer;
// enemy timer
let enemyTimer;
// information of canvas
let display;
// players space ship
let playerSpaceShip;
// players object
let playerObj;
let playersCollisionDetector;
// enemy object
let enemyObj;
let enemyCollisionDetector;

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
    for (const iterator of inputSubscribers) {
        iterator[1].inputHandler(e.keyCode);
    }
    //enemyObj.takeAction();
}

// the main loop
var gameLoop = () =>{
    display.clear();
    display.context.fillStyle = colors.background;

    display.renderBackground(display.canvas, display.context);

    playerObj.collide();
    enemyObj.collide();

    for (const iterator of renderSubscribers) {
        iterator[1].render(display.context);
    }
};

// blueprint for player object
//function player (spaceShip, collisionDetecor) {
function player(collisionDetecor) {
    this.spaceShip,
    this.spaceShips = [],
    this.spaceShipMap = new Map();
    this.collisionDetecor = collisionDetecor,
    this.inputHandler = function(inputLetter) {
        this.spaceShip.keyMap[inputLetter].call();
    },
    this.render = function(context) {
        //this.spaceShip[0].render(context);
        for (const ship of this.spaceShips) {
            ship.render(display.context);
        }
    },
    this.collide = () =>{
        this.collisionDetecor.collide();
    },
    this.spawnShips = (num) => {
        var ship = new spaceShip(display.centerWidth-(spaceShipWidth/2), display.canvas.height-spaceShipHeight, spaceShipWidth,spaceShipHeight,colors.playerColor);
        ship.init(this);
        ship.renderKey = `player-ship-${renderSubscribers.size}`;
        this.spaceShipMap.set(ship.renderKey, ship);
        this.spaceShips.push(ship);
        renderSubscribers.set(ship.renderKey, ship);
        //this.spaceShip = this.spaceShips[0];
        this.spaceShip = ship;
    },
    this.onDeath = (ship) => {
        renderSubscribers.delete(ship.renderKey);

        console.log(`Player died`);
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
        enemyShip.init(this);
        enemyShip.renderKey = `enemy-ship-${renderSubscribers.size}`;
        this.spaceShips.push(enemyShip);
        renderSubscribers.set(enemyShip.renderKey ,enemyShip);
    },
    this.collide = () =>{
        this.collisionDetecor.collide();
    },
    this.takeAction = () => {
        //console.log(`${Math.floor(Math.random() * this.shoot.length)}`);
        this.shoot[Math.floor(Math.random() * this.shoot.length)].call();
        //this.shoot[1].call();
    },
    this.shoot = [
        () => {},
        () => {
            let shipIndex = Math.floor(Math.random()*this.spaceShips.length);
            this.spaceShips[shipIndex].aiShoot();
        }
    ],
    this.onDeath = (ship) => {
        renderSubscribers.delete(ship.renderKey);
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
    this.direction = () => {},
    this.render = (context) => {       
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
        this.direction();
    },
    this.shootUp = () => {
        this.direction = this.moveUp;
    },
    this.shootDown = () => {
        this.direction = this.moveDown;
    },
    this.moveUp = ()=>{
        this.y -= this.step;
        this.currentSteps++;
        if (this.currentSteps > this.maxSteps) {
            renderSubscribers.delete(this.renderKey);
        }
    },
    this.moveDown = ()=>{
        this.y += this.step;
        this.currentSteps++;
        if (this.currentSteps > this.maxSteps) {
            renderSubscribers.delete(this.renderKey);
        }
    }, 
    this.register = () => {
        this.renderKey = `projectile-${renderSubscribers.size}-${Math.floor(Math.random()*100)}`;
        renderSubscribers.set(this.renderKey ,this);
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
    this.parent,
    this.renderMethod = (context) => {},
    this.init = (parent) => {
        this.parent = parent;
        this.renderMethod = this.activeRender;
    }
    this.render = (context) => {
        //this.renderMethod.call(context);
        this.renderMethod(context); // (context);
    },
    this.moveLeft = ()=>{
        // console.log("Spaceship moves left");
        this.x -this.step < 0 ? this.x = 0 : this.x -= this.step;
    },
    this.moveRight = ()=>{
        // console.log("Spaceship moves right");
        this.x +this.step + this.width > game.width ? this.x = game.width - this.width : this.x += this.step;
    },
    this.shoot = ()=>{
        //console.log('spaceship is manually shooting');
        let shot = new projectile(this.x + this.width / 2, this.y - this.height, 3, 10, colors.projectileColor, display, 5, enemyCollisionDetector);
        shot.direction = shot.shootUp;
        shot.register();
    },
    this.aiShoot = () => {
        //console.log("AI is shooting");
        let shot = new projectile(this.x + this.width / 2, this.y+this.height+10, 3, 10, colors.projectileColor, display, 5, playersCollisionDetector);
        shot.direction = shot.shootDown;
        shot.register();
    },
    this.onCollision = (dmg) =>
    {
        console.log(`${this.renderKey} got hit by ${dmg} damage points`);
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
        this.parent.onDeath(this);
        //console.log(`dieing`);
    }
};

// what has to happen to initialize the game lives here
let initializeGame = function() {
    console.log("Initializing");
    display = new Display();

    enemyObj = new enemy();
    playersCollisionDetector = new PlayerCollisionDetector(enemyObj);
    //playerSpaceShip = new spaceShip(display.centerWidth-(20/2), display.canvas.height-20, 20,20,colors.playerColor);
    //playerSpaceShip.init();
    //playerObj = new player(playerSpaceShip, playersCollisionDetector);
    playerObj = new player(playersCollisionDetector);
    playerObj.spawnShips(1);
    //playerObj.spaceShips.push(playerSpaceShip);
    inputSubscribers.set("player", playerObj);
    //renderSubscribers.set('playerObj',playerObj);

    
    enemyObj.spawnShips(1);
    enemyObj.collisionDetecor = new PlayerCollisionDetector(playerObj);
    enemyCollisionDetector = enemyObj.collisionDetecor;

    document.addEventListener("keydown", keyInputHandler);
    display.canvas = document.getElementById("game");
    display.context = display.canvas.getContext("2d");
    display.recalculate();
    display.renderBackground(display.canvas, display.context);    
    
    gameTimer = setInterval(gameLoop, 16);  
    enemyTimer = setInterval(enemyObj.takeAction, 200);  
};

// knows projectiles and checks if they collide with anything 
// collision detection is not pixel perfect
function PlayerCollisionDetector(target) {
    this.target = target,
    this.rows = Math.ceil(display.canvas.width / spaceShipWidth)
    this.projectilesOfSource = new Map(),
    this.collide = () => {          
        if(this.projectilesOfSource.size == 0) return;
        //console.log('collision detection on');
        //console.log(this.target); 
        //console.log("---------------");
        for (const proj of this.projectilesOfSource) {
            let item = proj[1];
            if (!item.active) continue;
            
            //console.log(item);
            let itemColumn = Math.ceil(item.x / spaceShipWidth);
            let itemRow = Math.ceil(item.y / spaceShipHeight)
            //console.log("Checking Col ", itemColumn);
            //for (const enemyShip of this.target.collisionDetecor.target.spaceShips) {
            for (const enemyShip of this.target.collisionDetecor.target.spaceShips) {
                //console.log(this.target); 
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
        //console.log(`Adding pair ${pair}`);
        this.projectilesOfSource.set(pair[0], pair[1]);
    },
    this.remove = (item) => {
        this.projectilesOfSource.delete(item);
    }     
};

// function PlayerCollisionDetector() {
//     this.rows = Math.ceil(display.canvas.width / spaceShipWidth)
//     this.projectilesOfPlayer = new Map(),
//     this.collide = () => {
//         if(this.projectilesOfPlayer.size == 0) return;
//         // console.log('collision detection on');
//         for (const proj of this.projectilesOfPlayer) {
//             let item = proj[1];
//             if (!item.active) return;
//             // console.log(item);
//             let itemColumn = Math.ceil(item.x / spaceShipWidth);
//             let itemRow = Math.ceil(item.y / spaceShipHeight)
//             //console.log("Checking Col ", itemColumn);
//             for (const enemyShip of enemyObj.spaceShips) {
//                 let enemyShipColumn = Math.ceil(enemyShip.x / spaceShipWidth);
//                 let enemyShipRow = Math.ceil(enemyShip.y / spaceShipHeight);
//                 if (enemyShipColumn >= itemColumn-1 && enemyShipColumn <= itemColumn+1
//                     && enemyShipRow >= itemRow-1 && enemyShipRow <= itemRow + 1
//                     && item.x - enemyShip.x > 0
//                     && (enemyShip.x + enemyShip.width) - (item.x+item.width) > 0 ) {
//                         // inform the space ship about the hit
//                         enemyShip.onCollision(item.damage);
//                         // deactivate the projectile
//                         item.unregister();
//                    }                
//             }
//         }
//     },
//     this.add = (pair) => {
//         this.projectilesOfPlayer.set(pair[0], pair[1]);
//     },
//     this.remove = (item) => {
//         this.projectilesOfPlayer.delete(item);
//     }     
// };

let launchSomeProjectiles = () => {
    for (let i = 0; i < display.canvas.width / 20; i++)
    {
        let shot = new projectile(i + (i * 20), 0, 3, 20, colors.projectileColor, display, 10, enemyCollisionDetector);

        shot.direction = shot.shootDown;
        shot.register();
    }
};

document.addEventListener("DOMContentLoaded", initializeGame);