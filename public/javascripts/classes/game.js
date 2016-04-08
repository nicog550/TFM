"use strict";
/**
 * Class responsible for the game logic
 */
var Game = function(){
    /** Jugadas con las que se gana una partida */
    var $canvas = $("#game-canvas"),
        combinacionesGanadoras = [
            [0, 1, 2], [0, 3, 6], [0, 4, 8], [1, 4, 7], [2, 4, 6], [2, 5, 8], [3, 4, 5], [6, 7, 8]
        ],
        /** Valor tanto para el ancho como para el alto de una casilla */
        dimensionCasilla = 160,
        gameOver = GameOver(),
        graphicBoard = GraphicBoard(),
        imagenJugador1 = null,
        imagenJugador2 = null,
        /** Fichas colocadas por el jugador 1 */
        fichasJ1 = [0, 0, 0, 0, 0, 0, 0, 0, 0],
        /** Fichas colocadas por el jugador 2 */
        fichasJ2 = [0, 0, 0, 0, 0, 0, 0, 0, 0],
        /** Reference to the Main class */
        selector = "game-screen",
        sockets = Sockets(),
        /** Fichas colocadas sobre el tablero */
        tablero = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    return {
        init: function(main) {
            var that = this;
            graphicBoard.init(main);
            $canvas.on('click', function(e) {
                var posiciones = obtenerFilaYColumna(dimensionCasilla, this.obtenerCoordenadas(e));
                var casilla = obtenerCasilla(posiciones.fila, posiciones.columna);
                if (movimientoEsValido(casilla, main)) {
                    // Si se ha colocado una ficha nueva
                    if (graphicBoard.moverFicha(casilla, this, main.turn, tablero)) {
                        // Si el jugador ha ganado la partida, mostramos la pantalla final
                        if (haGanadoPartida(main.turn, tablero)) {
                            gameOver.indicarGanador(main.turn);
                            main.switchScreen(that, gameOver);
                            sockets.sendGameOver();
                        } else { // Si el jugador no ha ganado aún, el turn cambia
                            sockets.sendMovement(tablero);
                            changeTurn();
                        }
                    }
                }
            });
        },
        changeTurn: changeTurn,
        initGame: initGame,
        selector: selector,
        completeTurn: completeTurn
    };

    function changeTurn() {
        var textoTurno;
        if (this.turn === 1) this.turn = 2;
        else this.turn = 1;
        if (this.turn === this.miTurno) textoTurno = "Es tu turno";
        else textoTurno = "Turno del Jugador " + this.turn;
        $("#player-turn").text(textoTurno);
    }

    function completeTurn(newBoard) {
        tablero = newBoard;
        graphicBoard.repaintBoard($canvas[0]);
        changeTurn();
    }

    /**
     * Comprueba si el jugador ha ganado la partida
     * @param {int} jugador Jugador que ha realizado el movimiento
     * @param {Array} tablero Situación actual del tablero de juego
     */
    function haGanadoPartida(jugador, tablero) {
        var i = 0,
            haGanado = false;
        while (i < combinacionesGanadoras.length && !haGanado) {
            if (esCombinacionGanadora(combinacionesGanadoras[i])) haGanado = true;
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
    }

    /**
     * Prepara el canvas y el tablero para una nueva partida
     */
    function initGame() {
        var canvas = document.getElementById(canvasSelector),
            ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        tablero = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        imagenJugador1 = document.getElementById("avatar1");
        imagenJugador2 = document.getElementById("avatar2");
    }

    /**
     * Determina si el jugador puede mover y si la casilla en la que se intenta colocar una ficha está libre
     */
    function movimientoEsValido(casilla, main) {
        var valor = tablero[casilla];
        return main.turn === main.miTurno && (valor === 0 || valor === main.turn);
    }

    /**
     * Devuelve la casilla sobre la que el usuario ha pulsado
     * @param {int} fila
     * @param {int} columna
     */
    function obtenerCasilla(fila, columna) {
        return fila * 3 + columna;
    }

    /**
     * Devuelve la fila y la columna sobre las que el usuario ha pulsado
     * @param {int} dimension Dimensión de la casilla
     * @param {Object} coordenadas
     * @return Object
     */
    function obtenerFilaYColumna(dimension, coordenadas) {
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
    }
};