"use strict";
/**
 * Class responsible for the game logic
 */
var Game = function() {
    var debugGame = false,
        gameOver,
        main,
        otherPlayersBoard = new OtherPlayersBoard(debugGame),
        playerBoard = new PlayerBoard(debugGame, _setPlayerConfig, otherPlayersBoard.getBoard()),
        playerConfig,
        sockets,
        waitingRoom;
    return {
        init: function(mainRef, socketsRef, gameOverRef, waitingRoomRef) {
            main = mainRef;
            sockets = socketsRef;
            gameOver = gameOverRef;
            waitingRoom = waitingRoomRef;
            playerBoard.listenToMoves(sockets);
            gameOver.init(main, socketsRef);
        },
        debug: function() { return debugGame; },
        selector: "game-screen",
        drawMove: otherPlayersBoard.drawMove,
        finishGame: finishGame,
        startGame: startGame
    };

    /**
     * Prepares the game over screen and switches to it
     * @param {number} waitingTime The amount of time until the next game starts
     */
    function finishGame(waitingTime) {
        if (debugGame) return [];
        gameOver.setup(waitingTime);
        main.toggleScreen(gameOver);
    }

    /**
     * Setter
     * @protected
     */
    function _setPlayerConfig(index, value) {
        playerConfig[index] = parseInt(value);
    }

    /**
     * Displays the current player's board as well as the ones of the other players
     * @param {array} board The initial configuration for the current player
     * @param {number} duration The game duration
     * @param {number} options The number of different choices available at the board for the player
     * @param {string} myName The current player's name
     * @param {object} otherPlayers The initial configuration for each of the other players
     * @param {number} showCodeTime The amount of time the code will be shown to the player
     */
    function startGame(board, duration, options, myName, otherPlayers, showCodeTime) {
        playerConfig = board;
        playerBoard.drawBoard(board, options, myName);
        otherPlayersBoard.displayBoards(otherPlayers);
        var $remainingTime = $(".remaining-time");
        $remainingTime.css('visibility', 'hidden');
        main.toggleScreen(this);
        main.displayCountdown(showCodeTime, $(".initial-countdown"));
        //When the initial countdown ends, allow the player to start moving
        setTimeout(function() {
            main.displayCountdown(duration, $("#game-time"));
            $remainingTime.css('visibility', 'visible');
            playerBoard.allowMoves();
        }, showCodeTime * 1000);
    }
};