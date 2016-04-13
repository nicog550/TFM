"use strict";
/**
 * Class responsible for the sockets
 */
var Sockets = function() {
    var ioSocket = io(),
        game,
        loggedIn = false,
        messages = {
            ADD_USER: 'add user',
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
        init: function(mainRef, gameRef, waitingRoomRef) {
            main = mainRef;
            game = gameRef;
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
        ioSocket.on(messages.LOGIN, function (data) {
            console.log("RECEIVED LOGIN. Users:", data.numUsers)
            loggedIn = true;
            waitingRoom.checkNumUsers(data.numUsers);
            waitingRoom.displayRemainingTime(data.waitingTime);
        });

        ioSocket.on(messages.USER_JOINED, function (data) {
            console.log("RECEIVED USER JOINED")
            if (loggedIn) waitingRoom.checkNumUsers(data.numUsers);
        });

        ioSocket.on(messages.USER_LEFT, function (data) {
            console.log("RECEIVED USER LEFT")
            if (loggedIn) waitingRoom.checkNumUsers(data.numUsers);
        });

        ioSocket.on(messages.NEW_GAME, function(data) {
            console.log("RECEIVED NEW GAME")
            if (loggedIn) game.startGame(data.board, data.gameDuration / 1000, data.options, data.players);
        });
        ioSocket.on(messages.NEW_MOVE, function (data) {
            console.log("recibido", data.message);
            //TODO
        });

        ioSocket.on(messages.GAME_OVER, function(data) {
            console.log("RECEIVED GAME OVER")
            if (loggedIn && !$("#" + game.selector).hasClass('hidden')) game.finishGame(data.waitingTime / 1000);
        });
    }

    function login() {
        _send(messages.ADD_USER, main.username);
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
