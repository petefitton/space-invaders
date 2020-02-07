let keyDownHandler = new KeyDownHandler();
/*
    Event listeners
*/

// listener for key down, inspired by
// https://stackoverflow.com/questions/5203407/how-to-detect-if-multiple-keys-are-pressed-at-once-using-javascript
var keyInputHandler = onkeyup = function(e) {
    // calls KeyDownHandler
    e = e || event; // to deal with IE
    pressedKeys[e.keyCode] = e.type == 'keydown';
    for (const key in pressedKeys) {
        if (pressedKeys.hasOwnProperty(key)) {
            const element = pressedKeys[key]; 
            if (element) {
                keyDownHandler.onKeyDown(key);  
            }
        }
    }
};

// globally accessable through keyDownHandler
// if activ it calls the input handler of a ship handler
// activated and deactivated by pause and unpause
function KeyDownHandler()  {
    this.onKeyDownActive = (keyCode) => {
        // call subscribers
        for (const iterator of inputSubscribers) {
            iterator[1].shipHandler.inputHandler(keyCode);
        }
    },
    this.onKeyDownInactive = (keyCode)  => {
    },
    this.activate = () => {
        this.onKeyDown = this.onKeyDownActive;
    },
    this.deactivate = () => {
        this.onKeyDown = this.onKeyDownInactive;
    },
    this.onKeyDown = () => {
    }
};
/*
    Click listeners
*/

// player won the current level and clicked the button to play it again
let playAgainButtonClicked = () => {
    initiateNewGame(); 
    removeMessagesFromUI();
};

// player is game over and clicked the button to start a new game
let playAgainAfterGameOverButtonClicked = () => {
    playerObj.init();
    initiateNewGame(); 
    removeMessagesFromUI();
};

// player won the current level and wants to play the next one
let playNextLevelButtonClicked = () => {
    initiateNewLevel(); 
    removeMessagesFromUI();
};

// listenes to a click event and pauses or unpauses the current game
let startOrPauseButtonClicked = () => {
    // is the game initialized?
    if (gameState.state == 0)
    {
        gameState.state = gameState.states[1];
        initializeGame();
        removeMessagesFromUI();
        updateStartOrPauseButtonText(1);
        return;
    }
    // is it active ?
    else if (gameState.state == gameState.states[1]) {
        gameState.state = gameState.states[2];
        // pause the game
        pauseTheGame();  
        updateStartOrPauseButtonText(0);     
    }
    // then it must be paused, so unpause it
    else {
        gameState.state = gameState.states[1];
        unpauseTheGame();
        updateStartOrPauseButtonText(1);  
    }
}