"use strict";
var GraphicBoard = function() {
    var main;
    return {
        init: function(mainRef) {
            main = mainRef;
        },
        moverFicha: movePiece,
        repaintBoard: repaintBoard
    };

    /**
     * Implementa la lógica relacionada con el movimiento de una ficha
     * @param {int} casilla Casilla en la que se ha realizado el movimiento
     * @param {Object} canvas Canvas sobre el que dibujar
     * @param {int} jugador Jugador que ha realizado el movimiento
     * @param {Array} board The game board
     * @return {bool} Si la ficha ha sido puesta o quitada
     */
    function movePiece(casilla, canvas, jugador, board) {
        var fichaPuesta = _ponerFichaLogica(board, casilla, jugador);
        repaintBoard(canvas);
        return fichaPuesta;

    }
    /**
     * Almacena el movimiento realizado por el jugador
     */
    function _ponerFichaLogica(tablero, casilla, jugador) {
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

    function repaintBoard(canvas) {
        var juego = main.Juego,
            tablero = juego.tablero,
            dimension = juego.dimensionCasilla,
            ctx = canvas.getContext("2d"),
            fila,
            columna;

        // Vaciamos el tablero
        _borrarTablero(ctx, canvas);
        // Repintamos todas las casillas
        for (var i = 0; i < tablero.length; i++) {
            fila = parseInt(i / 3);
            columna = i % 3;
            _dibujar(tablero[i], fila, columna, dimension, juego, ctx);
        }


    }
    function _borrarTablero(ctx, canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function _dibujar(jugador, fila, columna, dimension, juego, ctx) {
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
};
