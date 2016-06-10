"use strict";
/**
 * Class responsible for the welcome screen
 * @constructor
 */
var Welcome = function() {
    var $button = $("#play-button"),
        $errorMessage = $("#invalid-login"),
        $form = $("#login-form"),
        $input = $("#username"),
        main,
        sockets;
    return {
        init: function(mainRef, socketsRef) {
            main = mainRef;
            sockets = socketsRef;
            _logPlayerIn();
        },
        selector: "welcome-screen",
        invalidLogin: invalidLogin
    };

    /**
     * Displays the "already used username" or "room full" messages
     * @param {string} message The message to display
     */
    function invalidLogin(message) {
        $errorMessage.text(message);
        $errorMessage.removeClass('hidden');
        $button.removeAttr('disabled');
        $button.removeClass('disabled');
    }

    /**
     * Checks if the player has inserted a name and, if so, notifies the socket to perform a login
     * @private
     */
    function _logPlayerIn() {
        $form.on('submit', function(event) {
            event.preventDefault(); //Prevent the form from being submitted, what would cause the page to refresh
            var username = $input.val();
            if (username == "") return;

            $errorMessage.addClass('hidden');
            $button.attr('disabled', 'disabled');
            $button.addClass('disabled');
            main.setUsername(username);
            sockets.login();
        });
    }
};