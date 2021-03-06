"use strict";
/**
 * Class responsible for the end of game screen
 * @constructor
 */
var GameOver = function(){
    var main,
        sockets,
        $finalScores = $("#final-scores"),
        $logoutButton = $("#logout"),
        $processingScores = $("#processing-scores"),
        $waitingTime = $("#game-over-waiting-time");
    return {
        init: function(mainRef, socketsRef) {
            main = mainRef;
            sockets = socketsRef;
            logout();
        },
        selector: "ending-screen",
        displayFinalScores: displayFinalScores,
        setup: setup
    };

    /**
     * Displays the scoreboard after a game finishes
     * @param {array} scores The scores of all players, ordered from higher to lower
     */
    function displayFinalScores(scores) {
        var $template = $("#final-scores-template").find(".final-scores").clone(),
            $scoreTemplate = $template.find(".player-score").detach();
        for (var i = 0; i < scores.length; i++) {
            $template.append(
                _drawPlayerScore($scoreTemplate, i + 1, scores[i].username, scores[i].round, scores[i].total)
            );
        }
        $finalScores.append($template);
        $finalScores.removeClass("hidden");
        $processingScores.addClass("hidden");
    }

    /**
     * Displays the score of one specific player
     * @param {jQuery} $template The template to be used to display the score
     * @param {number|string} position The position of the player at the scoreboard
     * @param {string} name The player's name
     * @param {number|string} roundScore The player's score at the last round
     * @param {number|string} totalScore The player's total score
     * @returns {jQuery}
     * @private
     */
    function _drawPlayerScore($template, position, name, roundScore, totalScore) {
        var $scoreTemplate = $template.clone();
        $scoreTemplate.find(".position").text(position);
        $scoreTemplate.find(".name").text(name);
        $scoreTemplate.find(".round").text(roundScore);
        $scoreTemplate.find(".total").text(totalScore);
        return $scoreTemplate;
    }

    /**
     * Notifies the socket to send the logout message after the player presses the logout button. After that, hides and
     * removes the button and the remaining time message
     */
    function logout() {
        $logoutButton.on('click', function() {
            sockets.logout();
            $(this).fadeOut(function() {
                $(this).remove();
            });
            $waitingTime.fadeOut();
        });
    }

    /**
     * Prepares the game over screen to display the "processing results" message while the final scores are waiting to
     * be received
     * @param {number} remainingTime The remaining time until a new game starts
     */
    function setup(remainingTime) {
        $finalScores.addClass("hidden");
        $processingScores.removeClass("hidden");
        if (remainingTime > 0) main.displayCountdown(remainingTime, $("#waiting-time"));
        else {
            $logoutButton.remove();
            $waitingTime.text('No more games remaining');
        }
        $finalScores.empty();
    }
};