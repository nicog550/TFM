"use strict";
/**
 * Class responsible for the waiting room screen
 */
var WaitingRoom = function() {
    var game = Game(),
        main,
        selector = "waiting-room-screen",
        $connectedUsers = $("#connected-users"),
        $excessiveUsers = $("#excessive-users"),
        $insufficientUsers = $("#insufficient-users"),
        $minUsers = $("#min-users"),
        $maxUsers = $("#max-users");
    return {
        init: function(mainRef) {
            main = mainRef;
        },
        selector: selector,
        checkNumUsers: checkNumUsers
    };

    /**
     * Checks whether the amount of connected users is within the room limits
     * @param numUsers Number of connected users
     */
    function checkNumUsers(numUsers) {
        if (numUsers < Constants.minUsers) _notifyInsufficientPlayers(numUsers);
        else if (numUsers <= Constants.maxUsers) _numberWithinLimits(this, numUsers);
        else _notifyExcessivePlayers(numUsers);

    }

    /**
     * Displays a message indicating to the user that the room is full
     */
    function _notifyExcessivePlayers(numUsers) {
        $connectedUsers.text(numUsers);
        $maxUsers.text(Constants.maxUsers);
        $insufficientUsers.hide();
        $excessiveUsers.show();
    }

    /**
     * Displays a message indicating to the user that there are not enough users connected yet
     */
    function _notifyInsufficientPlayers(numUsers) {
        $connectedUsers.text(numUsers);
        $minUsers.text(Constants.minUsers);
        $excessiveUsers.hide(Constants.maxUsers);
        $insufficientUsers.show();
    }

    /**
     * Starts the game
     */
    function _numberWithinLimits(waitingRoom, numUsers) {
        game.initGame();
        main.switchScreen(waitingRoom, game);
        main.myTurn = numUsers % 2; // Este valor puede ser mayor que 2, por lo que usamos el módulo
        if (main.myTurn === 0) main.myTurn = 2;
        $("#player-id").text(main.myTurn);
        game.changeTurn();
        //Force the current screen to be hidden, since the switchScreen() method performs a fadeOut() which is not
        //synchronized with a previous call to itself, and so, doesn't remove the current screen
        setTimeout(function() {
            $("#" + waitingRoom.selector).hide();
        }, 420); //400 is the delay of the fadeOut() function, so a higher value will work
    }
};