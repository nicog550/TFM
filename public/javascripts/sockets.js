"use strict";
/**
 * Class responsible for the sockets
 */
var Sockets = function() {
    var ioSocket = io(),
        game,
        gameOver = GameOver(),
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
        sendMovement: sendMovement
    };

    /**
     * Connection to the room
     */
    function connect() {
        ioSocket.on(messages.LOGIN, function (data) {
            waitingRoom.checkNumUsers(data.numUsers);
            main.myTurn = data.numUsers % 2; // Este valor puede ser mayor que 2, por lo que usamos el módulo
            if (main.myTurn === 0) main.myTurn = 2;
            $("#player-id").text(main.myTurn);
        });

        ioSocket.on(messages.USER_JOINED, function (data) {
            waitingRoom.checkNumUsers(data.numUsers);
        });

        ioSocket.on(messages.USER_LEFT, function (data) {
            waitingRoom.checkNumUsers(data.numUsers);
        });

        ioSocket.on(messages.NEW_GAME, function(data) {
            game.drawBoard(data['board']);
            // main.switchScreen(waitingRoom, game);
        });

        ioSocket.on(messages.GAME_OVER, function(data) {
            // main.switchScreen(game, gameOver);
        });
    }

    function disconnect() {
        window.onbeforeunload = function() {
            send(messages.LOGOUT, {});
        };
    }

    /**
     * Envía al otro participante el movimiento realizado por el jugador
     * @param {Array} tablero
     */
    function sendMovement(tablero) {
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
