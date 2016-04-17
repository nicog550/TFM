"use strict";
/**
 * Class responsible for the end of game screen
 */
var GameOver = function(){
    var main,
        sockets,
        $finalScores = $("#final-scores"),
        $processingScores = $("#processing-scores");
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
    
    function displayFinalScores(scores) {
        var $template = $("#final-scores-template").find(".final-scores").clone(),
            $scoreTemplate = $template.find(".player-score").detach();
        for (var i = 0; i < scores.length; i++) {
            $template.append(
                _drawPlayerScore($scoreTemplate, i + 1, scores[i].username, scores[i].score)
            );
        }
        $finalScores.append($template);
        $finalScores.removeClass("hidden");
        $processingScores.addClass("hidden");
    }
    
    function _drawPlayerScore($template, position, name, score) {
        var $scoreTemplate = $template.clone();
        $scoreTemplate.find(".position").text(position);
        $scoreTemplate.find(".name").text(name);
        $scoreTemplate.find(".score").text(score);
        return $scoreTemplate;
    }

    function logout() {
        $("#logout").on('click', function() {
            sockets.logout();
            $(this).fadeOut(function() {
                $(this).remove();
            });
        });
    }

    function setup(remainingTime) {
        $finalScores.addClass("hidden");
        $processingScores.removeClass("hidden");
        main.displayCountdown(remainingTime, $("#waiting-time"));
        $finalScores.empty();
    }
};