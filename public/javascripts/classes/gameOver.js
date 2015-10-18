/**
 * Clase responsible for the end of game screen
 */
GameOver = {
    gameOverToken: "GAME_OVER",
    selector: "ending-screen",
    indicarGanador: function(ganador) {
        var msg;
        if (ganador === Main.miTurno) msg = "Has ganado";
        else msg = "Has perdido, perdedor";
        $("#winner-name").text(msg);
    }
};