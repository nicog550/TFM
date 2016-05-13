"use strict";
/**
 * Class responsible for the waiting room screen
 */
var WaitingRoom = function() {
    var game,
        main;
    return {
        init: function(mainRef, gameRef) {
            main = mainRef;
            game = gameRef;
        },
        selector: "waiting-room-screen",
        displayRemainingTime: displayRemainingTime
    };

    /**
     * Displays the countdown until the next game starts
     * @param {number} remainingTime The remaining time in seconds
     */
    function displayRemainingTime(remainingTime) {
        main.displayCountdown(remainingTime, $("#remaining-time"));
    }
};