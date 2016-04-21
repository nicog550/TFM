"use strict";
/**
 * Class responsible for the welcome screen
 */
var Welcome = function() {
    var $button = $("#play-button"),
        $errorMessage = $("#invalid-login"),
        $input = $("#username"),
        main,
        game,
        sockets;
    return {
        init: function(mainRef, gameRef, socketsRef) {
            main = mainRef;
            game = gameRef;
            sockets = socketsRef;
            $button.on('click', _logPlayerIn);
            _loginOnEnter();
        },
        selector: "welcome-screen",
        invalidLogin: invalidLogin
    };

    /**
     * Displays the "already used username" message
     */
    function invalidLogin() {
        $errorMessage.removeClass('hidden');
        $button.removeAttr('disabled');
        $button.removeClass('disabled');
    }

    /**
     * Creates a random username
     * @returns {string}
     */
    function createUsername() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    /**
     * Checks if the player has inserted a name and, if so, notifies the socket to perform a login
     * @private
     */
    function _logPlayerIn() {
        var username = $input.val();
        if (username == "") {
            if (game.debug()) username = createUsername();
            else return;
        }
        $errorMessage.addClass('hidden');
        $button.attr('disabled', 'disabled');
        $button.addClass('disabled');
        main.setUsername(username);
        sockets.login();
    }

    /**
     * Triggers the _logPlayerIn function when the player presses enter at the username input
     * @private
     */
    function _loginOnEnter() {
        $input.on("keyup", function(event) {
            if (event.which == 13 && $(this).val() !== '') _logPlayerIn();
        });
    }
};