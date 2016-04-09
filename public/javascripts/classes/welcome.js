/**
 * Class responsible for the welcome screen
 */
var Welcome = function() {
    var selector = "welcome-screen";
    return {
        init: function(main, game, sockets, waitingRoom) {
            var that = this;
            $("#play-button").on('click', function() {
                main.switchScreen(that, waitingRoom);
                sockets.send(sockets.messages.ADD_USER, new Date());
            });
        },
        selector: selector
    }
};