"use strict";
/**
 * Class responsible for the game logic
 */
var Game = function() {
    var gameBoard = document.getElementById("game-board"),
        gameOver = GameOver(),
        main,
        selector = "game-screen",
        sockets,
        waitingRoom;
    return {
        init: function(mainRef, socketsRef, waitingRoomRef) {
            main = mainRef;
            sockets = socketsRef;
            waitingRoom = waitingRoomRef;
            boardClick();
            gameOver.init(main, socketsRef);
        },
        selector: selector,
        finishGame: finishGame,
        startGame: startGame
    };

    function boardClick() {
        $("#test-btn").on('click', sockets.sendLogout);//TODO
        sockets.sendMove(null);
    }
    
    function finishGame(waitingTime) {
        main.toggleScreen(gameOver);
        gameOver.displayRemainingTime(waitingTime);
    }

    function startGame(board, duration) {
        _drawBoard(board);
        main.toggleScreen(this);
        main.displayCountdown(duration, $("#game-time"));
    }
    
    function _drawBoard(board) {
        while (gameBoard.firstChild) gameBoard.removeChild(gameBoard.firstChild); //Empty board
        for (var i = 0; i < board.length; i++) {
            var box = document.createElement('td');
            box.innerText = board[i];
            gameBoard.appendChild(box);
        }
    }
};