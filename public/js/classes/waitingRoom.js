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
        displayWaitForNextGameMessage: displayWaitForNextGameMessage
    };

    /**
     * Displays the number of players still needed for the game to start
     * @param {number} remaining The remaining number of players
     */
    function displayRemainingPlayers(remaining) {
        $("#remaining-players-count").text(remaining);
    }

    /**
     * Notifies the players that they have entered the experiment after it has already started and that they will have
     * to wait until the next game starts to join it
     */
    function displayWaitForNextGameMessage() {
        $("#remaining-players").addClass('hidden');
        $("#wait-for-next-game").removeClass('hidden');
    }
};