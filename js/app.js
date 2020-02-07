// the main loop
var gameLoop = () => {    
    keyDownHandler.activate();
    display.redrawBackground();
    CalculateCollision();
    enemyObj.doEachFrame();
    display.render();
};

// called by gameLoop 
function CalculateCollision() {
    playerObj.shipHandler.collide();
    enemyObj.shipHandler.collide();
}

// called by initiateNewGame
function clearInputAndRenderSubscribers() {
    stopAllGameTimer();
    clearSubscribers();
    updatePlayerLivesUI();
}

// what has to happen to initialize the game lives here
let initializeGame = function() {
    display = new Display();
    playerObj = new player();
    playerObj.init();
    initiateNewGame();    
};

// is called by initializeGame, play next live and various button click events
let initiateNewGame = () => {
    // clear input and render subscribers
    clearInputAndRenderSubscribers();
    // create an enemy object so that it can be used for the players collision detector
    enemyObj = new enemy(playerObj.level);
    // Max level 15, then increase frequency and hitpoints of enemies
    enemyObj.shipHandler.spawnShips(playerObj.enemyRows);
    if (playerObj.level > 14) {
        enemyObj.shipHandler.shootStrategy = enemyObj.shipHandler.multiShoot;
    }
    enemyObj.collisionDetecor = new ProjectileCollisionDetector(playerObj);
    enemyObj.CollisionDetector = enemyObj.collisionDetecor;
    
    // prepare the player
    playerObj.prepareForNewGame();

    document.addEventListener("keydown", keyInputHandler);
    display.recalculate();
    display.renderBackground(display.canvas, display.context);

    startAllGameTimer();
    gameState.state = gameState.states[1];
};

// the player won the last level, keep score and current lives, but create a new challenge
let initiateNewLevel = () => {
    clearInputAndRenderSubscribers();
    playerObj.increaseLevel();
    initiateNewGame();
};

// removes all subscribers from the list of input and render subscribers
// is called by initiateNewGame
let clearSubscribers = () => {
    inputSubscribers.clear();
    renderSubscribers.clear();
};

// the player lost a live but has at least one left
let playNextLive = () => {
    clearInterval(gameTimer);
    enemyObj.cleanUp();
    gameState.state = gameState.states[1];
    initiateNewGame();
};

// stops the active game if player is game over
let StopActiveGame = () => {
    gameState.state = 3;
    updateStartOrPauseButtonText(0);
};

// checks if the player ran out of lives or won the current level
let CheckForWin = () => {
    if (gameState.state != 1) return;
    if (playerObj.shipHandler.spaceShips.size == 0) {
        playerObj.looseLife();
        if (playerObj.lives <= 0) {
            showGameOverMessage();
            StopActiveGame();
        }      
        else {
            clearInterval(enemyTimer);
            playNextLive();            
        }          
    }
    if (playerObj.shipHandler.spaceShips.size > 0 && enemyObj.shipHandler.spaceShips.size == 0) {
        showBoardClearedMessage();
    }
};

/*
    Timers
*/

let unpauseTheGame = () => {
    // listen to input again
    keyDownHandler.activate();
    startAllGameTimer();
};

let pauseTheGame = () => {
    // stop listening to input
    keyDownHandler.deactivate();
    stopAllGameTimer();
};

let startAllGameTimer = () => {
    gameTimer = null;
    enemyTimer = null;
    gameTimer = setInterval(gameLoop, intervals.gameTimerInterval);  
    enemyTimer = setInterval(enemyObj.takeAction, intervals.enemyTimerInterval);  
}

let stopAllGameTimer = () => {
    clearInterval(enemyTimer);
    clearInterval(gameTimer);
    gameTimer = null;
    enemyTimer = null;
};

// after the DOM content is loaded, prepare the document
document.addEventListener("DOMContentLoaded", prepareDocument);