"use strict";
/**
 * Class responsible for the end of game screen
 */
var GameOver = function(){
    var main,
        sockets;
    return {
        init: function(mainRef, socketsRef) {
            main = mainRef;
            sockets = socketsRef;
            logout();
        },
        selector: "ending-screen",
        displayRemainingTime: displayRemainingTime
    };

    function displayRemainingTime(remainingTime) {
        main.displayCountdown(remainingTime, $("#waiting-time"));
    }

    function logout() {
        $("#logout").on('click', function() {
            sockets.logout();
            $(this).fadeOut(function() {
                $(this).remove();
            });
        });
    }
};