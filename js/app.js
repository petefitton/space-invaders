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
    default: "#A5DF89",
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
        iterator[1].sHandler.inputHandler(e.keyCode);
    }
}

// the main loop
var gameLoop = () =>{
    display.clear();
    display.context.fillStyle = colors.background;

    display.renderBackground(display.canvas, display.context);

    playerObj.sHandler.collide();
    enemyObj.sHandler.collide();

    enemyObj.doEachFrame();

    for (const iterator of renderSubscribers) {
        iterator[1].render(display.context);
    }
};

// blueprint for player object
function player(collisionDetecor) {
    this.sHandler = new shipHandler(colors.playerColor, display.canvas.height, `enplayer-ship`, this,10,3)
};

// shared between enemy and player
function shipHandler(color = colors.default, yLimit, prefix, parent, step, hitpoints = 1) {
    this.yLimit = yLimit,
    this.shipArray = [],
    this.prefix = prefix
    this.spaceShips = new Map(),
    this.parent = parent,
    this.color = color,
    this.step = step,
    this.hitpoints = hitpoints,
    this.inputHandler = function(inputLetter) {
        for (const item of this.spaceShips) {
            item[1].keyMap[inputLetter].call();
        }
    },
    this.render = () => {
        for (const ship of this.spaceShips) {
            ship.render();
        }
    },
    this.spawnShips = (rows) => {

        for (var i = 0; i < rows; i++) {
            let startX = display.centerWidth -  (0.5 * (rows - i) * spaceShipWidth + ((rows - i - 1) * spaceShipWidth));
            let startY = this.yLimit-spaceShipHeight-((rows - i) * spaceShipHeight);
            for (var j = 0; j < rows - i; j++) {
                var ship = new spaceShip(startX + ((3*j) * spaceShipWidth), startY + (spaceShipHeight * i), spaceShipWidth,spaceShipHeight,this.color, this.hitpoints, true, this.step);
                ship.init(this);
                ship.renderKey = `${this.prefix}-${renderSubscribers.size}`;
                this.spaceShips.set(ship.renderKey, ship);
                renderSubscribers.set(ship.renderKey ,ship);
                this.shipArray = [...this.spaceShips.keys()];
            }
        }

       
    },
    this.collide = () =>{
        this.parent.collisionDetecor.collide();
    },
    this.takeAction = () => {
        this.shoot[Math.floor(Math.random() * this.shoot.length)].call();
    },
    this.shoot = [
        () => {},
        () => {
            let shipIndex = Math.floor(Math.random()*this.shipArray.length);
            if (this.shipArray.length > 0) {
                this.spaceShips.get(this.shipArray[shipIndex]).aiShoot();
            }            
        }
    ],
    this.onDeath = (ship) => {
        renderSubscribers.delete(ship.renderKey);
        this.spaceShips.delete(ship.renderKey);
        this.shipArray = [...this.spaceShips.keys()];
        delete(ship);
        CheckForWin();
    }
};


// blueprint for enemy object
function enemy() {
    this.sHandler = new shipHandler(colors.enemyColor,Math.floor(display.canvas.height * 0.5), `enemy-ship`, this, 3, 1),
    this.intervalHorizontal = 0,
    this.moveHorizontally = () => {
        if (this.intervalHorizontal >= spaceShipWidth) {
            this.intervalHorizontal = -spaceShipWidth;
            this.horizontalMovingDirection = !this.horizontalMovingDirection;
        }
        for (item of this.sHandler.spaceShips) {
            item[1][this.horizontalDirections(this.horizontalMovingDirection)].call();            
        }
        this.intervalHorizontal++;

    },
    this.takeAction = () => {
        this.sHandler.takeAction();
    },
    this.doEachFrame = () => {
        this.moveHorizontally();
    },
    this.horizontalMovingDirection = false,
    this.horizontalDirections = (which) => {
        return which? 'moveRight' : 'moveLeft';
    }
};

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
function spaceShip(x, y, width, height, color, hitpoints = 1, active = true, step=2) {
    this.x = x,
    this.y = y,
    this.width = width,
    this.height = height,
    this.color = color,
    this.renderKey = '',
    this.step = step,
    this.hitpoints = hitpoints,
    this.active = active,
    this.parent,
    this.renderMethod = (context) => {},
    this.init = (parent) => {
        this.parent = parent;
        this.renderMethod = this.activeRender;
    }
    this.render = (context) => {
        this.renderMethod(context);
    },
    this.moveLeft = ()=>{
        this.x -this.step < 0 ? this.x = 0 : this.x -= this.step;
    },
    this.moveRight = ()=>{
        this.x +this.step + this.width > game.width ? this.x = game.width - this.width : this.x += this.step;
    },
    this.shoot = ()=>{
        let shot = new projectile(this.x + this.width / 2, this.y - this.height, 3, 10, colors.projectileColor, display, 5, enemyCollisionDetector);
        shot.direction = shot.shootUp;
        shot.register();
    },
    this.aiShoot = () => {
        let shot = new projectile(this.x + this.width / 2, this.y+this.height+10, 3, 10, colors.projectileColor, display, 5, playersCollisionDetector);
        shot.direction = shot.shootDown;
        shot.register();
    },
    this.onCollision = (dmg) =>
    {
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
    }
};

// what has to happen to initialize the game lives here
let initializeGame = function() {
    display = new Display();

    // create an enemy object so that it can be used for the players collision detector
    enemyObj = new enemy();
    
    // create the player
    playersCollisionDetector = new PlayerCollisionDetector(enemyObj);
    playerObj = new player();
    playerObj.collisionDetecor = playersCollisionDetector;
    playerObj.sHandler.spawnShips(1);

    inputSubscribers.set("player", playerObj);

    // continue creating the enemy
    enemyObj.sHandler.spawnShips(5);
    enemyObj.collisionDetecor = new PlayerCollisionDetector(playerObj);
    enemyCollisionDetector = enemyObj.collisionDetecor;


    document.addEventListener("keydown", keyInputHandler);
    display.canvas = document.getElementById("game");
    display.context = display.canvas.getContext("2d");
    display.recalculate();
    display.renderBackground(display.canvas, display.context);    
    
    // set the timer for the game loop and enemy decision
    gameTimer = setInterval(gameLoop, 16);  
    enemyTimer = setInterval(enemyObj.takeAction, 1000);  
};

// knows projectiles and checks if they collide with anything 
// collision detection is not pixel perfect
function PlayerCollisionDetector(target) {
    this.target = target,
    this.rows = Math.ceil(display.canvas.width / spaceShipWidth)
    this.projectilesOfSource = new Map(),
    this.collide = () => {   
        // if there are no projectiles, don't bother     
        if(this.projectilesOfSource.size == 0) return;

        // loop through the known projectiles
        for (const proj of this.projectilesOfSource) {
            let item = proj[1];
            // continue if projectile is not active
            if (!item.active) continue;

            // divide the canvas logical in rows and columns
            let itemColumn = Math.ceil(item.x / spaceShipWidth);
            let itemRow = Math.ceil(item.y / spaceShipHeight)

            for (const enemyShipItem of this.target.collisionDetecor.target.sHandler.spaceShips) {
                // select the value of enemyShipItem
                enemyShip = enemyShipItem[1];
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
        this.projectilesOfSource.set(pair[0], pair[1]);
    },
    this.remove = (item) => {
        this.projectilesOfSource.delete(item);
    }     
};

let CheckForWin = () => {
    if (playerObj.sHandler.spaceShips.size == 0) {
        console.log('Game over');
        StopActiveGame();
    }
    if (playerObj.sHandler.spaceShips.size > 0 && enemyObj.sHandler.spaceShips.size == 0) {
        console.log("Board cleared");
        StopActiveGame();
    }
};

let StopActiveGame = () => {
    clearInterval(enemyTimer);
}

document.addEventListener("DOMContentLoaded", initializeGame);