"use strict";
/**
 * Main class, application launcher
 */
var Main = function() {
    var myTurn = null,
        turn = 2, // Inicializamos a 2 porque al conectarse haremos un cambio de turno y se pondrá a 1
        game = Game(),
        sockets = Sockets(),
        welcomeScreen = Welcome();
    /**
     * Initial tasks
     */
    return {
        init: function() {
            sockets.init(this, game);
            switchScreen(Loading(), welcomeScreen);
            inicializarCanvas();
            welcomeScreen.init(this);
            game.init(this, sockets);
        },
        getGameReference: getGameReference,
        myTurn: myTurn,
        turn: turn,
        switchScreen: switchScreen
    };

    function getGameReference() {
        return game;
    }

    /**
     * Asigna al canvas la funcionalidad de obtener las coordenadas de un clic sobre él
     */
    function inicializarCanvas() {
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
    }

    /**
     * Hides a screen and replaces it with another one
     * @param {Object} oldOne Class from which to hide the screen
     * @param {Object} newOne Class from which to display the screen
     */
    function switchScreen(oldOne, newOne) {
        $("#" + oldOne.selector).fadeOut(function() {
            $("#" + newOne.selector).fadeIn();
        });
    }
};

$(window).on('load', function() {
    Main().init();
});