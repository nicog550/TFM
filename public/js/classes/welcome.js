"use strict";
/**
 * Class responsible for the welcome screen
 */
var Welcome = function() {
    var $button = $("#play-button"),
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
        selector: "welcome-screen"
    };

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    function _logPlayerIn() {
        var username = $input.val();
        if (username == "") {
            if (game.debug()) username = makeid();
            else return;
        }
        $button.attr('disabled');
        $button.addClass('disabled', 'disabled');
        main.setUsername(username);
        sockets.login();
    }

    function _loginOnEnter() {
        $input.on("keyup", function(event) {
            if (event.which == 13 && $(this).val() !== '') _logPlayerIn();
        });
    }
};