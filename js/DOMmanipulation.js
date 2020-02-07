/* 
    DOM manipulation
*/

// find elements in DOM and store them in documentElements
let prepareDocument = () => {
    documentElements.ButtonStartPause = document.querySelector(`.start-button`).querySelector(`.button`);
    documentElements.ScoreText = document.querySelector(`#score-text`);
    documentElements.LivesText = document.querySelector(`#lives-text`);
    documentElements.GameBoard = document.querySelector('.game-board');
    
    // set event listener
    documentElements.ButtonStartPause.addEventListener("click", startOrPauseButtonClicked);
    showStartPlayingMessage();
};

// updates the UI text for the pause button to the selected index
let updateStartOrPauseButtonText = (index) => {
    let buttonStates = ['Start', 'Pause'];
    documentElements.ButtonStartPause.textContent = buttonStates[index];
};

// is called by player object and updates the representation of lives in the UI
let updatePlayerLivesUI = () => {
    // how many symbols need to be printed
    let symbols = 3;
    let msg = ``;
    for (let i = 0 ; i < playerObj.lives; i++) {
        // decrement symbols, player has another live
        symbols--;
        msg += lives.full;
    }
    for (let i = 0 ; i < symbols; i++) {
        msg += lives.empty;
    }
    documentElements.LivesText.textContent = msg;
};

// is called by the player object and sets the score elements text to the value of its parameter
let updatePlayerScoreUI = (score) => {
    documentElements.ScoreText.textContent = `${score}`;
};

// shows a div element that informes the player of their lost game
let showGameOverMessage = () => {
    documentElements.GameBoard.appendChild(createMessageDiv('game-over-message', 'Game Over', ['New game'], [playAgainAfterGameOverButtonClicked]));
};

// shows a div element that informes the player if they win the current level
let showBoardClearedMessage = () => {    
    documentElements.GameBoard.appendChild(createMessageDiv('board-cleared-message', 'Board cleared',['Play again', 'Next level'], [playAgainButtonClicked, playNextLevelButtonClicked]));
};

// shows the initial message to start a game when there is no active game state
let showStartPlayingMessage = () => {
    let rawHTML = `
<div id="instructions">
    <h1>How to play</h1>
    <ul>
        <li>Press W or ↑ to shoot</li>
        <li>Press A or ← to move to the left</li>
        <li>Press D or → to move to the right</li>
    </ul> 
</div>`;
    documentElements.GameBoard.appendChild(createMessageDiv('board-cleared-message', 'Welcome', ['Start playing'], [startOrPauseButtonClicked], rawHTML));
}

// creates divs for the show message functions and sets their event listener
let createMessageDiv = (divName, headline, buttonText = ['Play again'], eventListener = [playAgainButtonClicked], rawHTML = '') => {
    var messageDiv = document.createElement('div');
    messageDiv.className = divName;
    messageDiv.classList.add('message');
     
    var headlineElement = document.createElement('h1');
    headlineElement.textContent = headline;
    messageDiv.appendChild(headlineElement);
    var i = 0;
    for (var btnText of buttonText) {
        var playAgainButtonDiv = document.createElement('div');
        playAgainButtonDiv.classList.add('button');
        playAgainButtonDiv.classList.add('antiquewhite');
    
        var playAgainButtonSpan = document.createElement('span');
        playAgainButtonSpan.className = 'play-again-button';
        playAgainButtonSpan.textContent = btnText;
        playAgainButtonDiv.addEventListener('click', eventListener[i]);
    
        playAgainButtonDiv.appendChild(playAgainButtonSpan);
        messageDiv.appendChild(playAgainButtonDiv);
        i++;
    }
    if (rawHTML.length > 0) {
        let newDiv = document.createElement('div');
        newDiv.innerHTML = rawHTML;
        messageDiv.appendChild(newDiv);
    }
    return messageDiv;
};

// is called by button click event listeners to remove message divs from the DOM
function removeMessagesFromUI() {
    removeElementFromGameBoard('.game-over-message');
    removeElementFromGameBoard('.board-cleared-message');    
};

// is called by removeMessagesFromUI to remove a specific element from the DOMs game board
function removeElementFromGameBoard(div) {
    var element = documentElements.GameBoard.querySelectorAll(div);
    if (element) {
        element.forEach(item => {
            item.parentNode.removeChild(item);
        });
    }
};