/**
 * Class responsible for the sockets
 */
var Sockets = {
    messages: {
        ADD_USER: 'add user',
        LOGIN: 'login',
        NEW_MESSAGE: 'new message',
        USER_LEFT: 'user left',
        USER_JOINED: 'user joined'
    },
    socket: undefined,
    init: function() {
        this.socket = io();
        this.connect();
        this.recibirMovimiento();
    },

    /**
     * Connection to the room
     */
    connect: function() {
        // Whenever the server emits 'login', log the login message
        this.socket.on(this.messages.LOGIN, function (data) {
            WaitingRoom.checkNumUsers(data.numUsers);
            //Main.miTurno = data.numUsers % 2; // Este valor puede ser mayor que 2, por lo que usamos el módulo
            //if (Main.miTurno === 0) Main.miTurno = 2;
            //$("#player-id").text(Main.miTurno);
            //Game.cambiarTurno();
        });

        // Whenever the server emits 'user joined', log it in the chat body
        this.socket.on(this.messages.USER_JOINED, function (data) {
            WaitingRoom.checkNumUsers(data.numUsers);
        });

        // Whenever the server emits 'user left', log it in the chat body
        this.socket.on(this.messages.USER_LEFT, function (data) {
            WaitingRoom.checkNumUsers(data.numUsers);
        });
    },

    /**
     * Indica al otro jugador que la partida ha terminado
     */
    sendGameOver: function() {
        this.send(this.messages.NEW_MESSAGE, GameOver.gameOverToken);
    },

    /**
     * Envía al otro participante el movimiento realizado por el jugador
     * @param {Array} tablero
     */
    enviarMovimiento: function(tablero) {
        console.log("enviado", tablero.reduce(function(a, b) {return a + b;}))
        this.send(this.messages.NEW_MESSAGE, tablero);
    },

    /**
     * Recibe el mensaje de que se ha efectuado un nuevo movimiento
     */
    recibirMovimiento: function() {
        this.socket.on(this.messages.NEW_MESSAGE, function (data) {
            console.log("recibido", data.message.reduce(function(a, b) {return a + b;}))
            if (data.message === GameOver.gameOverToken) {
                GameOver.indicarGanador(Main.turno);
                Main.switchScreen(Game, GameOver);
            } else {
                Game.tablero = data.message;
                Game.repintarTablero();
                Game.cambiarTurno();
            }
        });
    },

    /**
     * Sends a message via socket
     * @param {string} code The code of the message to emit
     * @param {Object} message The message to emit
     */
    send: function(code, message) {
        this.socket.emit(code, message);
    }
};
