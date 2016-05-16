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
        displayRemainingPlayers: displayRemainingPlayers,
        displayRemainingTime: displayRemainingTime
    };

    /**
     * Displays the number of players still needed for the game to start
     * @param {number} remaining The remaining number of players
     */
    function displayRemainingPlayers(remaining) {
        $("#remaining-players").text(remaining);
    }

    /**
     * Displays the countdown until the next game starts
     * @param {number} remainingTime The remaining time in seconds
     */
    function displayRemainingTime(remainingTime) {
        main.displayCountdown(remainingTime, $("#remaining-time"));
    }
};