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
            LOGIN: 'login',
            LOGOUT: 'logout',
            NEW_GAME: 'new game',
            NEW_MOVE: 'new move',
            USER_LEFT: 'user left',
            USER_JOINED: 'user joined'
        },
        main,
        waitingRoom;
    return {
        init: function(mainRef, gameRef, gameOverRef, waitingRoomRef) {
            main = mainRef;
            game = gameRef;
            gameOver = gameOverRef;
            waitingRoom = waitingRoomRef;
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
            waitingRoom.checkNumUsers(data.numUsers);
            waitingRoom.displayRemainingTime(data.waitingTime);
        });

        ioSocket.on(messages.USER_JOINED, function(data) {
            if (loggedIn) waitingRoom.checkNumUsers(data.numUsers);
        });

        ioSocket.on(messages.USER_LEFT, function(data) {
            if (loggedIn) waitingRoom.checkNumUsers(data.numUsers);
        });

        ioSocket.on(messages.NEW_GAME, function(data) {
            console.log("NEW GAME:", data)
            if (loggedIn) game.startGame(data.board, data.gameDuration / 1000, data.options, data.otherPlayers);
        });
        ioSocket.on(messages.NEW_MOVE, function(data) {
            if (loggedIn) game.drawMove(data.username, data.message.position, data.message.value);
        });

        ioSocket.on(messages.GAME_OVER, function(data) {
            if (loggedIn && !game.debug() && !$("#" + game.selector).hasClass('hidden')) {
                var playerConfig = game.finishGame(data.waitingTime / 1000);
                _send(messages.FINAL_BOARD, playerConfig);
            }
        });

        ioSocket.on(messages.FINAL_SCORES, function(data) {
            console.log("RECEIVED FINAL SCORES:", data)
            if (loggedIn) gameOver.displayFinalScores(data);
        })
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
     * @param {int} position The position at the board
     * @param {int} value The new value
     */
    function sendMove(position, value) {
        console.log("sends", position, value);
        _send(messages.NEW_MOVE, {position: position, value: value});
    }

    /**
     * Sends a message via socket
     * @param {string} code The code of the message to emit
     * @param {Object} message The message to emit
     * @private
     */
    function _send(code, message) {
        ioSocket.emit(code, message);
    }
};
