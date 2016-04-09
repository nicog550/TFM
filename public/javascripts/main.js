"use strict";
/**
 * Main class, application launcher
 */
var Main = function() {
    var game = Game(),
        sockets = Sockets(),
        waitingRoom = WaitingRoom(),
        welcomeScreen = Welcome();
    /**
     * Initial tasks
     */
    return {
        init: function() {
            sockets.init(this, game, waitingRoom);
            game.init(sockets);
            waitingRoom.init(this, game);
            welcomeScreen.init(this, game, sockets, waitingRoom);
            switchScreen(Loading(), welcomeScreen);
        },
        switchScreen: switchScreen
    };

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

window.onload = function() {
    Main().init();
};