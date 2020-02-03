let gameTimer;
let display;
let playerSpaceShip;
let playerObj;

let inputSubscribers = new Map();
let renderSubscribers = new Map();

const colors = {
    background: "#C0C0C0",
    playerColor: "#0000FF",
    enemyColor: "#FF0000",
    projectileColor: "#FFFF00"
};

function gameScreen() {
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

let initializeGame = function() {
    console.log("Initializing");
    display = new gameScreen();
    playerSpaceShip = new spaceShip(display.centerWidth-(20/2), display.canvas.height-20, 20,20,colors.playerColor);
    playerObj = new player(playerSpaceShip);
    inputSubscribers.set("player", playerObj);
    renderSubscribers.set('playerObj',playerObj);

    document.addEventListener("keydown", keyInputHandler);
    display.canvas = document.getElementById("game");
    display.context = display.canvas.getContext("2d");
    display.recalculate();
    display.renderBackground(display.canvas, display.context);
    
    gameTimer = setInterval(gameLoop, 10);
    
};

document.addEventListener("DOMContentLoaded", initializeGame);

var keyInputHandler = function(e) {
    console.log(`User pressed key: ${e.keyCode}`);
    for (const iterator of inputSubscribers) {
        iterator[1].inputHandler(e.keyCode);
    }
}

var gameLoop = () =>{
    display.clear();
    display.context.fillStyle = colors.background;
    
    display.renderBackground(display.canvas, display.context);
    for (const iterator of renderSubscribers) {
        iterator[1].render(display.context);
    }
};

function player (spaceShip) {
    this.spaceShip = spaceShip,
    this.inputHandler = function(inputLetter) {
        this.spaceShip.keyMap[inputLetter].call();
    },
    this.render = function(context) {
        this.spaceShip.render(context);
    }
};

function projectile(x, y, width, height, color, display, step) {
    this.x = x,
    this.y = y,
    this.width = width,
    this.height = height,
    this.color = color,
    this.step = step,
    this.maxSteps = display.canvas.height / this.step,
    this.currentSteps = 0,
    this.renderKey = '';
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
    }
};

function spaceShip(x, y, width, height, color) {
    this.x = x,
    this.y = y,
    this.width = width,
    this.height = height,
    this.color = color,
    this.step = 20,
    this.render = (context) => {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);

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
        let shot = new projectile(this.x + this.width / 2, this.y, 3, 10, colors.projectileColor, display, 10);
        
        shot.renderKey = renderSubscribers.size;
        renderSubscribers.set(shot.renderKey ,shot);
    },
    this.keyMap = {
        "65": this.moveLeft,
        "68": this.moveRight,
        "87": this.shoot
    }
};