/**
 * Main class, application launcher
 */
var Main = {
    miTurno: null,
    turno: 2, // Inicializamos a 2 porque al conectarse haremos un cambio de turno y se pondrá a 1
    /**
     * Initial tasks
     */
    init: function() {
        Sockets.init();
        this.switchScreen(Loading, Welcome);
        this.inicializarCanvas();
        Welcome.init(this);
        Game.init(this);
    },

    /**
     * Asigna al canvas la funcionalidad de obtener las coordenadas de un clic sobre él
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
     * Hides a screen and replaces it with another one
     * @param {Object} oldOne Class from which to hide the screen
     * @param {Object} newOne Class from which to display the screen
     */
    switchScreen: function(oldOne, newOne) {
        $("#" + oldOne.selector).fadeOut(function() {
            $("#" + newOne.selector).fadeIn();
        });
    }
};

$(window).on('load', function() {
    Main.init();
});