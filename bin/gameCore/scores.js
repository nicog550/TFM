"use strict";
var Scores = function() {
    var bonusOnCompletedWord,
        getWord,
        pointsPerHit,
        scores = {};
    return {
        init: function(pointsPerHitVal, bonusOnCompletedWordVal, getWordRef) {
            pointsPerHit = pointsPerHitVal;
            bonusOnCompletedWord = bonusOnCompletedWordVal;
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
            roundScores.push({username: current.player, round: playerPoints, total: scores[current.player]});
        });
        return _sortScores(_includeScoresOfPlayersThatAbandonedTheGame(roundScores));
    }

    /**
     * Checks if exist scores of players which have abandoned the game and appends them to the final scores of the
     * current round
     * @param {Array} currentScores The final scores of the current round
     * @returns {Array}
     * @private
     */
    function _includeScoresOfPlayersThatAbandonedTheGame(currentScores) {
        var i, found, scoresOfOldPlayers = [];
        for (var player in scores) {
            if (scores.hasOwnProperty(player)) {
                found = false;
                for (i = 0; i < currentScores.length; i++) {
                    if (currentScores[i].username == player) {
                        found = true;
                        break;
                    }
                }
                if (!found) scoresOfOldPlayers.push({username: player, round: 0, total: scores[player]});
            }
        }
        return currentScores.concat(scoresOfOldPlayers);
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