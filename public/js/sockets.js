"use strict";
/**
 * Class responsible for the sockets
 */
var Sockets = function() {
    var ioSocket = io(),
        didAbandonGame = false,
        game,
        gameOver,
        messages = {
            ADD_USER: 'add user',
            FINAL_SCORES: 'final scores',
            GAME_OVER: 'game over',
            INVALID_LOGIN: 'invalid login',
            LOGIN: 'login',
            LOGOUT: 'logout',
            NEW_GAME: 'new game',
            NEW_MOVE: 'new move',
            REMAINING_PLAYERS_CHANGE: 'remaining players'
        },
        main,
        waitingRoom,
        welcome;
    return {
        init: function(mainRef, gameRef, gameOverRef, waitingRoomRef, welcomeRef) {
            main = mainRef;
            game = gameRef;
            gameOver = gameOverRef;
            waitingRoom = waitingRoomRef;
            welcome = welcomeRef;
            connect();
        },
        login: login,
        logout: logout,
        newMove: sendMove
    };

    /**
     * Connection to the room
     */
    function connect() {
        ioSocket.on(messages.LOGIN, function(data) {
            main.toggleScreen(waitingRoom);
            if (data.remainingPlayers == -1) waitingRoom.displayWaitForNextGameMessage();
            else waitingRoom.displayRemainingPlayers(data.remainingPlayers);
        });

        ioSocket.on(messages.NEW_GAME, function(data) {
            if (!didAbandonGame && (!game.debug() || $("#" + game.selector).hasClass('hidden')))
                game.startGame(
                    data.board, data.gameDuration, data.options, data.myName, data.otherPlayers, data.showDuring
                );
        });

        ioSocket.on(messages.NEW_MOVE, function(data) {
            if (!didAbandonGame) game.drawMove(data.username, data.board);
        });

        ioSocket.on(messages.REMAINING_PLAYERS_CHANGE, function(data) {
            waitingRoom.displayRemainingPlayers(data.remainingPlayers);
        });

        ioSocket.on(messages.GAME_OVER, function(data) {
            if (!didAbandonGame && !game.debug() && !$("#" + game.selector).hasClass('hidden'))
                game.finishGame(data.waitingTime);
        });

        ioSocket.on(messages.FINAL_SCORES, function(data) {
            if (!didAbandonGame) gameOver.displayFinalScores(data);
        });

        ioSocket.on(messages.INVALID_LOGIN, function(data) {
            welcome.invalidLogin(data.reason);
        });
    }

    /**
     * Performs the player's login
     */
    function login() {
        _send(messages.ADD_USER, main.getUsername());
    }

    /**
     * Performs the player's logout
     */
    function logout() {
        didAbandonGame = true;
        _send(messages.LOGOUT, main.username);
    }

    /**
     * Sends a new move
     * @param {Array} board The player's board
     */
    function sendMove(board) {
        _send(messages.NEW_MOVE, board);
    }

    /**
     * Sends a message through the socket
     * @param {string} code The code of the message to emit
     * @param {object} message The message to be emitted
     * @private
     */
    function _send(code, message) {
        ioSocket.emit(code, message);
    }
};
