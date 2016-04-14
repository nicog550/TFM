"use strict";
/**
 * Main class, application launcher
 */
var Main = function() {
    var game = new Game(),
        sockets = Sockets(),
        username = makeid(), //TODO
        waitingRoom = WaitingRoom(),
        welcomeScreen = Welcome();
    /**
     * Initial tasks
     */
    return {
        init: function() {
            sockets.init(this, game, waitingRoom);
            game.init(this, sockets, waitingRoom);
            waitingRoom.init(this, game);
            welcomeScreen.init(this, game, sockets, waitingRoom);
            toggleScreen(welcomeScreen);
        },
        displayCountdown: displayCountdown,
        toggleScreen: toggleScreen,
        username: username
    };

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    /**
     * Displays a countdown of seconds
     * @param startTime Timeout starting seconds
     * @param $target jQuery object where the timeout will be displayed
     */
    function displayCountdown(startTime, $target) {
        updateDOM();
        var interval = setInterval(function() {
            updateDOM();
            if (startTime < 0) clearInterval(interval);
        }, 1000);

        function updateDOM() {
            $target.text(startTime--);
        }
    }

    /**
     * Hides the currently visible screen and replaces it with another one
     * @param {Object} newOne Class from which to display the screen
     * @param {Function} [callback] (Optional) Callback to be called after switching screens
     */
    function toggleScreen(newOne, callback) {
        $(".screen:not(.hidden)").fadeOut(function() {
            $(this).addClass('hidden');
            $("#" + newOne.selector).removeClass('hidden').fadeIn();
        }, callback);
    }
};

$(document).ready(function() {
    Main().init();
    // setTimeout("$('#play-button').trigger('click');", 500); //TODO: remove this
});