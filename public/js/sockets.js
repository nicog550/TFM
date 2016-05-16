"use strict";
/**
 * Class responsible for the sockets
 */
var Sockets = function() {
    var ioSocket = io(),
        game,
        gameOver,
        loggedIn = false,
        messages = {
            ADD_USER: 'add user',
            FINAL_BOARD: 'final board',
            FINAL_SCORES: 'final scores',
            GAME_OVER: 'game over',
            INVALID_USERNAME: 'invalid username',
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
            loggedIn = true;
            main.toggleScreen(waitingRoom);
            waitingRoom.displayRemainingPlayers(data.remainingPlayers);
        });

        ioSocket.on(messages.NEW_GAME, function(data) {
            console.log("NEW GAME:", data)
            if (loggedIn && (!game.debug() || $("#" + game.selector).hasClass('hidden')))
                game.startGame(data.board, data.gameDuration, data.options, data.otherPlayers);
        });

        ioSocket.on(messages.NEW_MOVE, function(data) {
            if (loggedIn) game.drawMove(data.username, data.board);
        });

        ioSocket.on(messages.REMAINING_PLAYERS_CHANGE, function(data) {
            waitingRoom.displayRemainingPlayers(data.remainingPlayers);
        });

        ioSocket.on(messages.GAME_OVER, function(data) {
            if (loggedIn && !game.debug() && !$("#" + game.selector).hasClass('hidden')) {
                var playerConfig = game.finishGame(data.waitingTime);
                _send(messages.FINAL_BOARD, playerConfig);
            }
        });

        ioSocket.on(messages.FINAL_SCORES, function(data) {
            console.log("RECEIVED FINAL SCORES:", data)
            if (loggedIn) gameOver.displayFinalScores(data);
        });

        ioSocket.on(messages.INVALID_USERNAME, function() {
            welcome.invalidLogin();
        });
    }

    function login() {
        _send(messages.ADD_USER, main.getUsername());
    }

    function logout() {
        loggedIn = false;
        _send(messages.LOGOUT, main.username);
    }

    /**
     * Sends a new move
     * @param {Array} board The player's board
     */
    function sendMove(board) {
        console.log("sends", board.reduce(function(a, b) { return a + "(" + b[0] + ": " + b[1] + "), "; }, ""));
        _send(messages.NEW_MOVE, board);
    }

    /**
     * Sends a message through the socket
     * @param {string} code The code of the message to emit
     * @param {object} message The message to emit
     * @private
     */
    function _send(code, message) {
        ioSocket.emit(code, message);
    }
};
