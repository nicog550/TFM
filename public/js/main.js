"use strict";
/**
 * Main class, application launcher
 */
var Main = function() {
    var game = new Game(),
        gameOver = new GameOver(),
        sockets = new Sockets(),
        username,
        waitingRoom = new WaitingRoom(),
        welcomeScreen = new Welcome();
    /**
     * Initial tasks
     */
    return {
        init: function() {
            sockets.init(this, game, gameOver, waitingRoom);
            game.init(this, sockets, gameOver, waitingRoom);
            waitingRoom.init(this, game);
            welcomeScreen.init(this, game, sockets);
            toggleScreen(welcomeScreen, function() {
                $("#username").trigger("focus");
            });
        },
        displayCountdown: displayCountdown,
        setUsername: setUsername,
        toggleScreen: toggleScreen,
        getUsername: getUsername
    };
    
    function getUsername() {
        return username;
    }

    function setUsername(newName) {
        username = newName;
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
            if (callback) callback();
        });
    }
};

$(document).ready(function() {
    Main().init();
});