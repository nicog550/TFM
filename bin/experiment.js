"use strict";

/**
 * Class responsible for the creation of new games
 * @constructor
 */
var Experiment = function() {
    var constants = require('./constants'),
        currentGame,
        generator = require('./gameCore/generator'),
        playersBoards,
        round = 0,
        scores = require('./gameCore/scores'),
        sockets = [],
        word;
    return {
        init: function() {
            generator.init(getCurrentGame, getSockets, setWord, constants.players);
            scores.init(constants.scores.pointsPerHit, constants.scores.bonusOnCompletedWord, getWord);
            currentGame = constants.games[round];
        },
        addPlayer: addPlayer,
        removePlayer: removePlayer,
        updatePlayerBoard: updatePlayerBoard
    };

    /** Getter */
    function getCurrentGame() { return currentGame; }

    /** Getter */
    function getSockets() { return sockets; }

    /** Getter */
    function getWord() { return word; }

    /** Setter */
    function setWord(newWord) { word = newWord; }

    /**
     * Function responsible for the generation of a new game
     */
    function _generateGame() {
        playersBoards = generator.createGame();
        setTimeout(_endGame, currentGame.duration * 1000);
    }

    /**
     * Sends the 'game over' message to all players
     * @private
     */
    function _endGame() {
        var allExperimentsDone = round + 1 == constants.games.length;
        sockets.forEach(function(socket) {
            socket.emit('game over', {waitingTime: (allExperimentsDone ? 0 : constants.intervalBetweenGames)});
        });
        var newScores = scores.calculateScores(word, playersBoards);
        sockets.forEach(function(socket) { socket.emit('final scores', newScores); });
        if (!allExperimentsDone) {
            currentGame = constants.games[++round];
            setTimeout(_generateGame, constants.intervalBetweenGames * 1000);
        }
    }

    /**
     * Appends the socket of a newly connected player to the list of existing sockets
     * @param socket The socket of the newly connected user
     * @returns {number|boolean} False if no more players can be added or the experiment has ended, otherwise the number
     * of remaining players necessary for the game to start
     */
    function addPlayer(socket) {
        if (sockets.length == constants.players || round + 1 == constants.games.length) return false;
        sockets.push(socket);
        scores.addPlayer(socket.username);
        var remainingNeededPlayers = constants.players - sockets.length;
        if (remainingNeededPlayers == 0) _generateGame();
        return remainingNeededPlayers;
    }

    /**
     * Removes the socket of a disconnected player from the list of existing sockets
     * @param socket The socket of the disconnected user
     * @returns {boolean|number} The number of remaining players necessary for the game to start if the player was
     * already connected, false otherwise
     */
    function removePlayer(socket) {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i].username == socket.username) {
                sockets.splice(i, 1);
                return constants.players - sockets.length;
            }
        }
        return false;
    }

    /**
     * Updates a player's board
     * @param {string} player The player's username
     * @param {Array} board The player's board
     */
    function updatePlayerBoard(player, board) {
        for (var i = 0; i < playersBoards.length; i++) {
            if (playersBoards[i].player == player) {
                board.forEach(function(positionAndValue, index) {
                    playersBoards[i].board[index] = positionAndValue[1];
                });
                break;
            }
        }
    }
};

module.exports = new Experiment();