// game loop timer
let gameTimer;

// enemy timer
let enemyTimer;

// size for space ships
let spaceShipWidth = 20;
let spaceShipHeight = 20;

// timer intervals 
let intervals = {
    gameTimerInterval : 16,
    enemyTimerInterval : 500,
    enemyTimerIntervalDefault : 500
};

// state 0 is not initialized, 1 is active, 2 is paused
let gameState = {
    states : [0,1,2],
    state : 0
};

// elements of the DOM in frequent use
let documentElements = {
    ButtonStartPause: '',
    ScoreText: '',
    LivesText: '',
    GameBoard: ''
};

// symbols for player lives in UI
let lives = {
    empty: '♡',
    full: '❤️'
}

// color values
const colors = {
    default: "#A5DF89",
    background: "#000000",
    playerColor: "#0000FF",
    enemyColor: "#FF0000",
    projectileColor: "#FFFF00"
};

// contains key value pairs of keys that the user pressed
// used by keyInputHandler
var pressedKeys = {};

// information of canvas
let display;

// players space ship
//let playerSpaceShip;

// players object
let playerObj;

// enemy object
let enemyObj;

// who is listening for input events
let inputSubscribers = new Map();

// used by Display which calls the subscribers render method
let renderSubscribers = new Map();