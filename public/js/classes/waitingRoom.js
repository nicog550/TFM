"use strict";
/**
 * Class responsible for the waiting room screen
 */
var WaitingRoom = function() {
    var game,
        main,
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
        selector: "waiting-room-screen",
        checkNumUsers: checkNumUsers,
        displayRemainingTime: displayRemainingTime
    };

    /**
     * Checks whether the amount of connected users is within the room limits
     * @param {number} numUsers Currently connected users
     */
    function checkNumUsers(numUsers) {
        if (numUsers < Constants.minUsers) _notifyInsufficientPlayers(numUsers);
        else if (numUsers <= Constants.maxUsers) _numberWithinLimits();
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
    function _numberWithinLimits() {
        $("#correct-users").hide();
        $maxUsers.hide();
        $insufficientUsers.hide();
        $excessiveUsers.hide();
    }
    
    function displayRemainingTime(remainingTime) {
        main.displayCountdown(remainingTime, $("#remaining-time"));
    }
};