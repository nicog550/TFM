/**
 * Class responsible for the welcome screen
 */
var Welcome = function() {
    var selector = "welcome-screen";
    return {
        init: function(main, game, sockets, waitingRoom) {
            $("#play-button").on('click', function() {
                main.toggleScreen(waitingRoom);
                sockets.login();
            });
        },
        selector: selector
    }
};