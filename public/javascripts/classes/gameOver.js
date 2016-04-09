"use strict";
/**
 * Clase responsible for the end of game screen
 */
var GameOver = function(){
    var selector = "ending-screen";
    return {
        indicarGanador: displayWinner,
        selector: selector
    };
    function displayWinner(ganador) {
        var msg;
        if (ganador === Main.myTurn) msg = "Has ganado";
        else msg = "Has perdido, perdedor";
        $("#winner-name").text(msg);
    }
};