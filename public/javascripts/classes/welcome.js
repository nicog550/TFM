/**
 * Class responsible for the welcome screen
 */
var Welcome = {
    selector: "welcome-screen",
    init: function(main) {
        var that = this;
        $("#play-button").on('click', function() {
            main.switchScreen(that, WaitingRoom);
            Sockets.send(Sockets.messages.ADD_USER, new Date());
        });
    }
};