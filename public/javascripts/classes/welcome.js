/**
 * Class responsible for the welcome screen
 */
var Welcome = function(){
    var selector = "welcome-screen";
    return {
        init: function(main) {
            var that = this,
                sockets = Sockets();
            $("#play-button").on('click', function() {
                main.switchScreen(that, WaitingRoom());
                sockets.send(sockets.messages.ADD_USER, new Date());
            });
        },
        selector: selector
    }
};