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
            LOGOUT: 'disconnect',
            NEW_GAME: 'new game',
            NEW_MESSAGE: 'new message',
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
            receive();
            disconnect();
        },
        messages: messages,
        send: send,
        sendLogout: sendLogout,
        sendMove: sendMove
    };

    /**
     * Connection to the room
     */
    function connect() {
        ioSocket.on(messages.LOGIN, function (data) {
            console.log("RECEIVED LOGIN")
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
            if (loggedIn) game.startGame(data.board, data.gameDuration / 1000);
        });

        ioSocket.on(messages.GAME_OVER, function(data) {
            console.log("RECEIVED GAME OVER")
            if (loggedIn) game.finishGame(data.waitingTime / 1000);
        });
    }

    function disconnect() {
        window.onbeforeunload = sendLogout();
    }
    
    function sendLogout() {
        send(messages.LOGOUT, {});
    }

    /**
     * Envía al otro participante el movimiento realizado por el jugador
     * @param {Array} tablero
     */
    function sendMove(tablero) {
        console.log("enviado", tablero.reduce(function(a, b) {return a + b;}));
        send(messages.NEW_MESSAGE, tablero);
    }

    /**
     * Recibe el mensaje de que se ha efectuado un nuevo movimiento
     */
    function receive() {
        ioSocket.on(messages.NEW_MESSAGE, function (data) {
            console.log("recibido", data.message);
            //TODO
        });
    }

    /**
     * Sends a message via socket
     * @param {string} code The code of the message to emit
     * @param {Object} message The message to emit
     */
    function send(code, message) {
        ioSocket.emit(code, message);
    }
};
