/**
 * Class responsible for the waiting room screen
 */
var WaitingRoom = {
    selector: "waiting-room-screen",

    /**
     * Checks whether the amount of connected users is within the room limits
     * @param numUsers The current amount of connected users
     */
    checkNumUsers: function(numUsers) {
        if (numUsers < Constants.minUsers) notifyInsufficientPlayers();
        else if (numUsers <= Constants.maxUsers) numberWithinLimits(this);
        else notifyExcessivePlayers();

        /**
         * Displays a message indicating to the user that the room is full
         */
        function notifyExcessivePlayers() {
            $("#connected-users").text(numUsers);
            $("#max-users").text(Constants.maxUsers);
            $("#insufficient-users").hide();
            $("#excessive-users").show();
        }

        /**
         * Displays a message indicating to the user that there are not enough users connected yet
         */
        function notifyInsufficientPlayers() {
            $("#connected-users").text(numUsers);
            $("#min-users").text(Constants.minUsers);
            $("#excessive-users").hide(Constants.maxUsers);
            $("#insufficient-users").show();
        }

        /**
         * Starts the game
         */
        function numberWithinLimits(waitingRoom) {
            Game.inicializarJuego();
            Main.switchScreen(waitingRoom, Game);
            //Force the current screen to be hidden, since the switchScreen() method performs a fadeOut() which is not
            //synchronized with a previous call to itself, and so, doesn't remove the current screen
            setTimeout(function() {
                $("#" + waitingRoom.selector).hide();
            }, 420); //400 is the delay of the fadeOut() function, so a higher value will work
        }
    }
};