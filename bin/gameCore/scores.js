"use strict";
var Scores = function() {
    var bonusOnCompletedWord,
        getWord,
        pointsPerHit,
        scores = {};
    return {
        init: function(constantsRef, getWordRef) {
            pointsPerHit = constantsRef.scores.pointsPerHit;
            bonusOnCompletedWord = constantsRef.scores.bonusOnCompletedWord;
            getWord = getWordRef;
        },
        addPlayer: addPlayer,
        calculateScores: calculateScores
    };

    /**
     * Adds a new player to the scores
     * @param {string} playerName The player's name
     */
    function addPlayer(playerName) {
        scores[playerName] = 0;
    }

    /**
     * Calculates the scores of all players and returns them sorted
     * @param {Array} word The current game's word
     * @param {Array} playersBoards The boards of all players in the following form:
     * [{player: str, board: []}, {player: str, board: []}, ...]
     * @returns {Array}
     */
    function calculateScores(word, playersBoards) {
        var missed,
            playerPoints,
            roundScores = [];
        playersBoards.forEach(function(current) {
            missed = false;
            playerPoints = 0;
            current.board.forEach(function(valueInBoard, index) {
                if (word[index] == valueInBoard) playerPoints += pointsPerHit;
                else missed = true;
            });
            if (!missed) playerPoints += bonusOnCompletedWord;
            scores[current.player] += playerPoints;
            roundScores.push({username:current.player, round: playerPoints, total: scores[current.player]});
        });
        return _sortScores(roundScores);
    }

    /**
     * Sorts the scores from the one with the highest total to the one with the lowest total
     * @param {Array} roundScores The scores at the current round
     * @returns {Array}
     * @private
     */
    function _sortScores(roundScores) {
        roundScores.sort(function(a, b) {return b.total - a.total});
        return roundScores;
    }

};

module.exports = new Scores();