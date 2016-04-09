"use strict";
/**
 * Class responsible for the game logic
 */
var Game = function() {
    var gameBoard = document.getElementById("game-board"),
        gameOver = GameOver(),
        selector = "game-screen";
    return {
        init: function(sockets) {
        },
        drawBoard: drawBoard,
        selector: selector
    };

    function boardClick(sockets) {
        //TODO
        sockets.sendMovement(null);
    }
    
    function drawBoard(board) {
        _emptyBoard();
        for (var i = 0; i < board.length; i++) {
            var box = document.createElement('td');
            box.innerText = board[i];
            gameBoard.appendChild(box);
        }
    }

    function _emptyBoard() {
        while (gameBoard.firstChild) gameBoard.removeChild(gameBoard.firstChild);
    }
};