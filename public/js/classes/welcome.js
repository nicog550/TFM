"use strict";
/**
 * Class responsible for the welcome screen
 */
var Welcome = function() {
    return {
        init: function(main, game, sockets, waitingRoom) {
            $("#play-button").on('click', function() {
                var username = $("#username").val();
                if (username == "") {
                    if (game.debug()) username = makeid();
                    else return;
                }
                main.setUsername(username);
                main.toggleScreen(waitingRoom);
                sockets.login();
            });
        },
        selector: "welcome-screen"
    };

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
};