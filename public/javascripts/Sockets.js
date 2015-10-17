/**
 * Created by yomesmo on 17/10/2015.
 */
var Sockets = {
    socket: undefined,
    init: function() {
        this.socket = io();
        this.conectarse();
        this.recibirMovimiento();

        // Whenever the server emits 'user joined', log it in the chat body
        /*socket.on('user joined', function (data) {
         });

         // Whenever the server emits 'user left', log it in the chat body
         socket.on('user left', function (data) {
         });*/
    },

    /**
     * Lógica al empezar la partida: asignación del turno del jugador
     */
    conectarse: function() {
        // Whenever the server emits 'login', log the login message
        this.socket.on('login', function (data) {
            Main.miTurno = data.numUsers % 2; // Este valor puede ser mayor que 2, por lo que usamos el módulo
            if (Main.miTurno === 0) Main.miTurno = 2;
            $("#player-id").text(Main.miTurno);
            Main.Juego.cambiarTurno();
        });
    },

    /**
     * Indica al otro jugador que la partida ha terminado
     */
    enviarFinDeJuego: function() {
        this.socket.emit('new message', Main.finDeJuego);
    },

    /**
     * Envía al otro participante el movimiento realizado por el jugador
     * @param {Array} tablero
     */
    enviarMovimiento: function(tablero) {
        console.log("enviado", tablero.reduce(function(a, b) {return a + b;}))
        this.socket.emit('new message', tablero);
    },

    /**
     * Recibe el mensaje de que se ha efectuado un nuevo movimiento
     */
    recibirMovimiento: function() {
        this.socket.on('new message', function (data) {
            console.log("recibido", data.message.reduce(function(a, b) {return a + b;}))
            if (data.message === Main.finDeJuego) {
                Main.FinDeJuego.indicarGanador(Main.turno);
                Main.cambiarPantalla(Main.Juego, Main.FinDeJuego);
            } else {
                Main.Juego.tablero = data.message;
                Main.Juego.repintarTablero();
                Main.Juego.cambiarTurno();
            }
        });
    }
}
