"use strict";
/**
 * Class responsible for the game logic
 */
var Game = function() {
    /** Jugadas con las que se gana una partida */
    var canvas = document.getElementById("game-canvas"),
        combinacionesGanadoras = [
            [0, 1, 2], [0, 3, 6], [0, 4, 8], [1, 4, 7], [2, 4, 6], [2, 5, 8], [3, 4, 5], [6, 7, 8]
        ],
        /** Valor tanto para el ancho como para el alto de una casilla */
        dimensionCasilla = 160,
        gameOver = GameOver(),
        graphicBoard = GraphicBoard(),
        imagenJugador1 = document.getElementById("avatar1"),
        imagenJugador2 = document.getElementById("avatar2"),
        /** Fichas colocadas por el jugador 1 */
        fichasJ1 = [0, 0, 0, 0, 0, 0, 0, 0, 0],
        /** Fichas colocadas por el jugador 2 */
        fichasJ2 = [0, 0, 0, 0, 0, 0, 0, 0, 0],
        /** Reference to the Main class */
        main,
        selector = "game-screen",
        /** Fichas colocadas sobre el tablero */
        logicBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    return {
        init: function(mainRef, sockets) {
            var that = this;
            main = mainRef;
            graphicBoard.init(main, this);
            canvas.onclick = function(e) {
                boardClick(main, sockets, e, that, this);
            };
        },
        tablero: logicBoard,
        changeTurn: changeTurn,
        imagenJugador1: imagenJugador1,
        imagenJugador2: imagenJugador2,
        initGame: initGame,
        selector: selector,
        completeTurn: completeTurn
    };

    function boardClick(main, sockets, event, game, canvas) {
        var posiciones = obtenerFilaYColumna(dimensionCasilla, canvas.obtenerCoordenadas(event));
        var casilla = obtenerCasilla(posiciones.fila, posiciones.columna);
        if (movimientoEsValido(casilla, main)) {
            // Si se ha colocado una ficha nueva
            if (graphicBoard.moverFicha(casilla, canvas, main.turn, logicBoard)) {
                // Si el jugador ha ganado la partida, mostramos la pantalla final
                if (haGanadoPartida(main.turn, logicBoard)) {
                    gameOver.indicarGanador(main.turn);
                    main.switchScreen(game, gameOver);
                    sockets.sendGameOver();
                } else { // Si el jugador no ha ganado aún, el turn cambia
                    sockets.sendMovement(logicBoard);
                    changeTurn();
                }
            }
        }
    }

    function changeTurn() {
        var textoTurno;
        console.log("main:", main)
        if (main.turn === 1) main.turn = 2;
        else main.turn = 1;
        if (main.turn === main.myTurn) textoTurno = "Es tu turno";
        else textoTurno = "Turno del Jugador " + main.turn;
        $("#player-turn").text(textoTurno);
    }

    function completeTurn(newBoard) {
        logicBoard = newBoard;
        graphicBoard.repaintBoard(canvas);
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
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        logicBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    /**
     * Determina si el jugador puede mover y si la casilla en la que se intenta colocar una ficha está libre
     */
    function movimientoEsValido(casilla, main) {
        var valor = logicBoard[casilla];
        return main.turn === main.myTurn && (valor === 0 || valor === main.turn);
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