"use strict";
/**
 * Class responsible for the waiting room screen
 */
var WaitingRoom = function() {
    var game,
        main,
        selector = "waiting-room-screen",
        $connectedUsers = $("#connected-users"),
        $excessiveUsers = $("#excessive-users"),
        $insufficientUsers = $("#insufficient-users"),
        $minUsers = $("#min-users"),
        $maxUsers = $("#max-users");
    return {
        init: function(mainRef, gameRef) {
            main = mainRef;
            game = gameRef;
        },
        selector: selector,
        checkNumUsers: checkNumUsers,
        displayRemainingTime: displayRemainingTime
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
        // main.toggleScreen(waitingRoom, game);
    }
    
    function displayRemainingTime(remainingTime) {
        main.displayCountdown(remainingTime, $("#remaining-time"));
    }
};