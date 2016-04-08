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
            LOGIN: 'login',
            NEW_MESSAGE: 'new message',
            USER_LEFT: 'user left',
            USER_JOINED: 'user joined'
        },
        main,
        waitingRoom = WaitingRoom();
    return {
        init: function(mainRef, gameRef) {
            main = mainRef;
            game = gameRef;
            waitingRoom.init(main);
            connect();
            recibirMovimiento();
        },
        messages: messages,
        send: send,
        sendGameOver: sendGameOver,
        sendMovement: sendMovement
    };

    /**
     * Connection to the room
     */
    function connect() {
        // Whenever the server emits 'login', log the login message
        ioSocket.on(messages.LOGIN, function (data) {
            console.log("data", data);
            waitingRoom.checkNumUsers(data.numUsers);
        });

        // Whenever the server emits 'user joined', log it in the chat body
        ioSocket.on(messages.USER_JOINED, function (data) {
            waitingRoom.checkNumUsers(data.numUsers);
        });

        // Whenever the server emits 'user left', log it in the chat body
        ioSocket.on(messages.USER_LEFT, function (data) {
            waitingRoom.checkNumUsers(data.numUsers);
        });
    }

    /**
     * Indicates other players that the game has ended
     */
    function sendGameOver() {
        send(messages.NEW_MESSAGE, gameOver.gameOverToken);
    }

    /**
     * Env�a al otro participante el movimiento realizado por el jugador
     * @param {Array} tablero
     */
    function sendMovement(tablero) {
        console.log("enviado", tablero.reduce(function(a, b) {return a + b;}));
        send(messages.NEW_MESSAGE, tablero);
    }

    /**
     * Recibe el mensaje de que se ha efectuado un nuevo movimiento
     */
    function recibirMovimiento() {
        ioSocket.on(messages.NEW_MESSAGE, function (data) {
            console.log("recibido", data.message.reduce(function(a, b) {return a + b;}));
            if (data.message === gameOver.gameOverToken) {
                gameOver.indicarGanador(main.turn);
                main.switchScreen(game, gameOver);
            } else {
                game.completeTurn(data.message);
            }
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
