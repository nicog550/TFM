/**
 * L�gica de la aplicaci�n
 */
var Main = {
    miTurno: null,
    turno: 2, // Inicializamos a 2 porque al conectarse haremos un cambio de turno y se pondr� a 1
    finDeJuego: "FIN_DE_JUEGO",
    /**
     * Tareas iniciales
     */
    init: function() {
        Sockets.init();
        this.cambiarPantalla(this.Cargando, this.Bienvenida);
        this.inicializarCanvas();
        this.Bienvenida.setup(this);
        this.Juego.setup(this);
    },

    /**
     * Oculta una pantalla y muestra otra en funci�n de sus clases contenedoras
     * @param {Object} antigua Clase de la que ocultar la pantalla
     * @param {Object} nueva Clase de la que mostrar la pantalla
     */
    cambiarPantalla: function(antigua, nueva) {
        $("#" + antigua.selector).fadeOut(function() {
            $("#" + nueva.selector).fadeIn();
        });
    },

    /**
     * Asigna al canvas la funcionalidad de obtener las coordenadas de un clic sobre �l
     */
    inicializarCanvas: function() {
        function obtenerCoordenadas(event){
            var totalOffsetX = 0, totalOffsetY = 0, canvasX, canvasY, currentElement = this;

            do {
                totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
                totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
            } while(currentElement = currentElement.offsetParent);

            canvasX = event.pageX - totalOffsetX;
            canvasY = event.pageY - totalOffsetY;

            return {x: canvasX, y: canvasY}
        }
        HTMLCanvasElement.prototype.obtenerCoordenadas = obtenerCoordenadas;
    },

    /**
     * Clase encargada de la pantalla de bienvenida
     */
    Bienvenida: {
        selector: "welcome-screen",
        setup: function(aplicacion) {
            var that = this;
            $(".play-button").on('click', function() {
                aplicacion.Juego.inicializarJuego(aplicacion.Juego);
                aplicacion.cambiarPantalla(that, aplicacion.Juego);
                Sockets.socket.emit('add user', new Date());
            });
        }
    },

    /**
     * Clase encargada de la pantalla de carga
     */
    Cargando: {
        selector: "loading-screen"
    },

    /**
     * Clase encargada de la pantalla de fin de juego
     */
    FinDeJuego: {
        selector: "ending-screen",
        indicarGanador: function(ganador) {
            var msg;
            if (ganador === Main.miTurno) msg = "Has ganado";
            else msg = "Has perdido, perdedor";
            $("#winner-name").text(msg);
        }
    },

    /**
     * Clase encargada de la l�gica del juego en s�
     */
    Juego: {
        /** Jugadas con las que se gana una partida */
        combinacionesGanadoras: [
            [0, 1, 2], [0, 3, 6], [0, 4, 8], [1, 4, 7], [2, 4, 6], [2, 5, 8], [3, 4, 5], [6, 7, 8]
        ],
        /** Valor tanto para el ancho como para el alto de una casilla */
        dimensionCasilla: 160,
        imagenJugador1: null,
        imagenJugador2: null,
        /** Fichas colocadas por el jugador 1 */
        fichasJ1: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        /** Fichas colocadas por el jugador 2 */
        fichasJ2: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        selector: "game-screen",
        selectorCanvas : "game-canvas",
        /** Fichas colocadas sobre el tablero */
        tablero: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        setup: function() {
            var that = this;
            $("#" + this.selectorCanvas).on('click', function(e) {
                var posiciones = that.obtenerFilaYColumna(that.dimensionCasilla, this.obtenerCoordenadas(e));
                var casilla = that.obtenerCasilla(posiciones.fila, posiciones.columna);
                if (that.movimientoEsValido(casilla, Main.turno)) {
                    // Si se ha colocado una ficha nueva
                    if (that.moverFicha(casilla, this, Main.turno, that)) {
                        // Si el jugador ha ganado la partida, mostramos la pantalla final
                        if (that.haGanadoPartida(Main.turno, that.combinacionesGanadoras, that.tablero)) {
                            Main.FinDeJuego.indicarGanador(Main.turno);
                            Main.cambiarPantalla(that, Main.FinDeJuego);
                            Sockets.enviarFinDeJuego();
                        } else { // Si el jugador no ha ganado a�n, el turno cambia
                            Sockets.enviarMovimiento(that.tablero);
                            that.cambiarTurno();
                        }
                    }
                }
            });
        },

        cambiarTurno: function() {
            if (Main.turno === 1) Main.turno = 2;
            else Main.turno = 1;
            var textoTurno;
            if (Main.turno === Main.miTurno) textoTurno = "Es tu turno";
            else textoTurno = "Turno del Jugador " + Main.turno;
            $("#player-turn").text(textoTurno);
        },

        /**
         * Comprueba si el jugador ha ganado la partida
         * @param {int} jugador Jugador que ha realizado el movimiento
         * @param {Array} combinaciones Combinaciones ganadoras
         * @param {Array} tablero Situaci�n actual del tablero de juego
         */
        haGanadoPartida: function(jugador, combinaciones, tablero) {
            var i = 0,
                haGanado = false;
            while (i < combinaciones.length && !haGanado) {
                if (esCombinacionGanadora(combinaciones[i])) haGanado = true;
                else i++;
            }
            return haGanado;

            function esCombinacionGanadora(combinacion) {
                var i = 0,
                    hayCoincidencia = true;
                while (i < combinacion.length && hayCoincidencia) {
                    if (tablero[combinacion[i]] !== jugador) hayCoincidencia = false;
                    else i++;
                }
                return hayCoincidencia;
            }
        },

        /**
         * Prepara el canvas y el tablero para una nueva partida
         * @param {Object} juego
         */
        inicializarJuego: function(juego) {
            juego.turno = 1;
            var canvas = document.getElementById(juego.selectorCanvas),
                ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            juego.tablero = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            juego.imagenJugador1 = document.getElementById("avatar1");
            juego.imagenJugador2 = document.getElementById("avatar2");
        },

        /**
         * Implementa la l�gica relacionada con el movimiento de una ficha
         * @param {int} casilla Casilla en la que se ha realizado el movimiento
         * @param {Object} canvas Canvas sobre el que dibujar
         * @param {int} jugador Jugador que ha realizado el movimiento
         * @param {Object} juego
         * @return {bool} Si la ficha ha sido puesta o quitada
         */
        moverFicha: function(casilla, canvas, jugador, juego) {
            var tablero = juego.tablero,
                fichaPuesta = _ponerFichaLogica();
            juego.repintarTablero();
            return fichaPuesta;

            /**
             * Almacena el movimiento realizado por el jugador
             */
            function _ponerFichaLogica() {
                var esQuitar;
                if (tablero[casilla] === 0) {
                    tablero[casilla] = jugador;
                    esQuitar = false;
                } else {
                    tablero[casilla] = 0;
                    esQuitar = true;
                }
                return !esQuitar;
            }
        },

        /**
         * Determina si el jugador puede mover y si la casilla en la que se intenta colocar una ficha est� libre
         */
        movimientoEsValido: function(casilla, jugador) {
            var valor = this.tablero[casilla];
            return Main.turno === Main.miTurno && (valor === 0 || valor === jugador);
        },

        /**
         * Devuelve la casilla sobre la que el usuario ha pulsado
         * @param {int} fila
         * @param {int} columna
         */
        obtenerCasilla: function(fila, columna) {
            return fila * 3 + columna;
        },

        /**
         * Devuelve la fila y la columna sobre las que el usuario ha pulsado
         * @param {int} dimension Dimensi�n de la casilla
         * @param {Object} coordenadas
         * @return Object
         */
        obtenerFilaYColumna: function(dimension, coordenadas) {
            var columna = _iterarSobreCoordenada(coordenadas.x);
            var fila = _iterarSobreCoordenada(coordenadas.y);
            return {'columna': columna, 'fila': fila};

            function _iterarSobreCoordenada(coordenada) {
                var variableAfectada = 0;
                while ((coordenada - dimension) > 0) {
                    coordenada -= dimension;
                    variableAfectada++;
                }
                return variableAfectada;
            }
        },

        repintarTablero: function() {
            var juego = Main.Juego,
                tablero = juego.tablero,
                dimension = juego.dimensionCasilla,
                canvas = document.getElementById(Main.Juego.selectorCanvas),
                ctx = canvas.getContext("2d"),
                fila,
                columna;

            // Vaciamos el tablero
            __borrarTablero();
            // Repintamos todas las casillas
            for (var i = 0; i < tablero.length; i++) {
                fila = parseInt(i / 3);
                columna = i % 3;
                __dibujar(tablero[i]);
            }


            function __borrarTablero() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            function __dibujar(jugador) {
                if (jugador !== 0) {
                    var altura = dimension - 40,
                        x = columna * (dimension + 20) + (columna * 2 + 1) * 20,
                        y = fila * dimension + 20,
                        imagen;
                    if (jugador === 1) imagen = juego.imagenJugador1;
                    else imagen = juego.imagenJugador2;
                    ctx.drawImage(imagen, x, y, dimension, altura);
                }
            }
        }
    }
};

$(window).on('load', function() {
    Main.init();
});