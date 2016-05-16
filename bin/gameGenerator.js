"use strict";

/**
 * Class responsible for the creation of new games
 * @constructor
 */
var GameGenerator = function() {
    var constants = require('./constants'),
        core = require('./game/core'),
        round = 0,
        /** Contains the score of each connected user */
        scores = {},
        updatedScores,
        /** Contains the socket of each connected user */
        sockets = [],
        timeout,
        /** The word of each game */
        word;
    return {
        init: function() {
            core.init(constants, getSockets, setWord);
        },
        addSocket: addSocket,
        checkResults: checkResults,
        generateGame: generateGame,
        removeSocket: removeSocket
    };

    /**
     * Getter
     */
    function getSockets() {
        return sockets;
    }

    /**
     * Setter
     */
    function setWord(newWord) {
        word = newWord;
    }

    /**
     * Checks the punctuation a player will receive
     * @param {string} player The player's name
     * @param {Array} finalBoard The players final game configuration
     * @param {Function} callback Function to be invoked if all scores have been updated for the last game
     */
    function checkResults(player, finalBoard, callback) {
        var result = Math.floor(Math.random() * 10); //TODO
        scores[player] += result;
        updatedScores++;
        if (updatedScores == Object.keys(scores).length) callback(sortScores()); //Sort the scores and return them

        function sortScores() {
            var orderedScores = [];
            for (var score in scores) {
                if (scores.hasOwnProperty(score)) orderedScores.push({username: score, score: scores[score]});
            }
            orderedScores.sort(function(a, b) {return b.score - a.score});
            return orderedScores;
        }
    }

    /**
     * Function responsible for the generation of a new game
     */
    function generateGame() {
        round++;
        core.createNewGame(constants.players);
        setTimeout(_endGame, constants.gameDuration * 1000);
    }

    /**
     * Sends the 'game over' message to all players
     * @private
     */
    function _endGame() {
        sockets.forEach(function(socket) {
            socket.emit('game over', {waitingTime: constants.gamePause});
        });
        timeout = setTimeout(generateGame, constants.gamePause * 1000);
    }

    /**
     * Appends the socket of a newly connected user to the list of existing sockets
     * @param socket The socket of the newly connected user
     * @returns {number} The number of remaining players necessary for the game to start
     */
    function addSocket(socket) {
        sockets.push(socket);
        scores[socket.username] = 0;
        return constants.players - sockets.length;
    }

    /**
     * Removes the socket of a disconnected user from the list of existing sockets
     * @param socket The socket of the disconnected user
     * @returns {boolean|number} The number of remaining players necessary for the game to start if the player was
     * already connected, false otherwise
     */
    function removeSocket(socket) {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i].username == socket.username) {
                sockets.splice(i, 1);
                delete scores[socket.username];
                return constants.players - sockets.length;
            }
        }
        return false;
    }
};

module.exports = new GameGenerator();