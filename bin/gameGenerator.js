"use strict";

/**
 * Class responsible for the creation of new games
 * @constructor
 */
var GameGenerator = function() {
    var constants = require('./constants'),
        // core = this.core(constants),
        gameActive = false,
        pendingToAppend = {},
        round = 0,
        /** Contains the score of each connected user */
        scores = {},
        updatedScores,
        /** Contains the socket of each connected user */
        sockets = {},
        timeout;
    return {
        init: function() {
            _generateGame();
        },
        addSocket: addSocket,
        checkResults: checkResults,
        removeSocket: removeSocket
    };

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
    function _generateGame() {
        gameActive = true;
        round++;
        _sendGamesToPlayers(_generateGamesForPlayers());
        timeout = setTimeout(_endGame, constants.gameDuration);
        updatedScores = 0;
        if (pendingToAppend.hasOwnProperty(round.toString())) {
            var pendingPlayersForThisRound = pendingToAppend[round.toString()];
            while (pendingPlayersForThisRound.length > 0) scores[pendingPlayersForThisRound.pop()] = 0;
            delete pendingToAppend[round.toString()];
        }
    }

    /**
     * Generates the games for all players
     * @returns {Object}
     * <pre><code>
     * {
     *      socket1.username: {board: [], username: string},
     *      ...
     *      socketN.username: {board: [], username: string}
     * }
     * </code></pre>
     * @private
     */
    function _generateGamesForPlayers() {
        var games = {};
        for (var socket in sockets) {
            if (sockets.hasOwnProperty(socket) && sockets[socket].isLoggedIn) {
                for (var i = 0; i < Object.keys(sockets).length; i++)
                    games[socket] = {board: _generateGameForPlayer(), username: socket};
            }
        }
        return games;
    }

    /**
     * Generates a game for one single player
     * @returns {Array} An array of <i>constants.wordLength</i> positions
     * @private
     */
    function _generateGameForPlayer() {
        var word = [];
        for (var i = 0; i < constants.wordLength; i++) word.push(Math.floor(Math.random() * constants.optionsCount));
        return word;
    }

    /**
     * Sends to each player their game plus the games of the other players. The used structure is the following one:
     * TODO: update documentation of message format
     * <pre><code>
     * {
     *      gameDuration: <i>constants.gameDuration</i>,
     *      options: <i>constants.optionsCount</i>,
     *      board: Array(<i>constants.wordLength</i>),
     *      otherPlayers: {
     *          socketId1: {
     *              board: Array(<i>constants.wordLength</i>),
     *              username: <i>socket1.username</i>
     *          },
     *          ...,
     *          socketIdN: {
     *              board: Array(<i>constants.wordLength</i>),
     *              username: <i>socketN.username</i>
     *          }
     *      }
     * }
     * </code></pre>
     * @param {Object} games All the generated games
     * @private
     */
    function _sendGamesToPlayers(games) {
        var gameSettings = {
            gameDuration: constants.gameDuration,
            options: constants.optionsCount
        };
        for (var currentPlayer in games) {
            if (games.hasOwnProperty(currentPlayer)) {
                gameSettings.board = games[currentPlayer].board;
                var otherBoards = {};
                for (var otherPlayer in games) {
                    if (otherPlayer != currentPlayer && games.hasOwnProperty(otherPlayer)) {
                        otherBoards[otherPlayer] = games[otherPlayer].board;
                    }
                }
                gameSettings.otherPlayers = otherBoards;
                sockets[currentPlayer].emit('new game', gameSettings);
            }
        }
    }

    /**
     * Sends the 'game over' message to all players
     * @private
     */
    function _endGame() {
        gameActive = false;
        for (var socket in sockets) {
            if (sockets.hasOwnProperty(socket)) {
                sockets[socket].emit('game over', {waitingTime: constants.gamePause});
            }
        }
        timeout = setTimeout(_generateGame, constants.gamePause);
    }

    /**
     * Appends the socket of a newly connected user to the list of existing sockets
     * @param socket The socket of the newly connected user
     * @returns {number} The remaining time until the next game starts
     */
    function addSocket(socket) {
        sockets[socket.username] = socket;
        //Calculate the remaining game time in seconds
        var remaining = Math.floor((timeout._idleStart + timeout._idleTimeout - Date.now()) / 1000),
            myFirstRound = remaining > 1 ? (round + 1).toString() : (round + 2).toString();
        if (pendingToAppend.hasOwnProperty(myFirstRound)) pendingToAppend[myFirstRound].append(socket.username);
        else {
            pendingToAppend[myFirstRound] = [];
            pendingToAppend[myFirstRound].push(socket.username);
        }
        //If the game is active, add to the remaining time the pause duration
        return gameActive ? remaining + constants.gamePause / 1000 : remaining;
    }

    /**
     * Removes the socket of a disconnected user from the list of existing sockets
     * @param socket The socket of the disconnected user
     * @returns {boolean} Whether the socket already existed or not
     */
    function removeSocket(socket) {
        if (sockets.hasOwnProperty(socket.username)) {
            delete sockets[socket.username];
            delete scores[socket.username];
            return true;
        }
        return false;
    }
};
//
// GameGenerator.prototype.core = function(constants) {
//     var wordLength = constants.wordLength;
//     return {
//         createNewGame: createNewGame
//     };
//
//     /**
//      * Algorithm for the creation of a new game
//      * @param {number} playersCount The number of currently active players
//      */
//     function createNewGame(playersCount) {
//         var word = _generateWord(),
//             shownLetters = Math.ceil(constants.optionsCount / playersCount),
//             array = new Array(wordLength),
//             players = new Array(playersCount),
//             generatedGames = {};
//         for (var i = 0; i < players.length; i++) {
//             generatedGames[i] = _generateGameForPlayer(shownLetters);
//         }
//     }
//
//     /**
//      * Generates a random code, which will be the word used at the new game
//      * @returns {Array} An array of <i>constants.wordLength</i> positions
//      */
//     function _generateWord() {
//         var word = [];
//         for (var i = 0; i < wordLength; i++) word.push(Math.floor(Math.random() * constants.optionsCount));
//         return word;
//     }
//
//     function _generateGameForPlayer(shownLetters) {
//         var game = new Array(wordLength),
//             k = wordLength;
//         for (var j = 0; j < shownLetters; j++) {
//             if (k > wordLength - 1) {
//                 game = _shuffleArray(game, 0, wordLength - j);
//                 game = _shuffleArray(game, wordLength - (shownLetters - j), wordLength);
//                 k = 0;
//             }
//         }
//     }
//
//     /**
//      * Shuffles an array from indexes <b>startAt</b> to <b>stopAt</b>. The rest of the array remains unchanged. E.g.:
//      * _shuffleArray([a, b, c, d, e, f], 2) would shuffle [a, b, c] but not [d, e, f].
//      * @param {Array} array The array to be shuffled
//      * @param {number} startAt The index at which to start shuffling
//      * @param {number} stopAt The index at which to stop shuffling
//      */
//     function _shuffleArray(array, startAt, stopAt) {
//         var clonedArray = array.slice(0),
//             newArray = clonedArray.splice(startAt, stopAt + 1);
//         return startAt == 0 ? clonedArray.concat(_knuthShuffle(newArray)) : _knuthShuffle(clonedArray).concat(newArray);
//     }
//
//     /**
//      * Array shuffling. Credits to http://stackoverflow.com/a/2450976
//      * @param {Array} array The array to be shuffled
//      * @returns {Array}
//      * @private
//      */
//     function _knuthShuffle(array) {
//         var currentIndex = array.length,
//             temp,
//             randomIndex;
//         while (currentIndex != 0) { //While there remain elements to shuffle
//             // Pick a remaining element
//             randomIndex = Math.floor(Math.random() * currentIndex);
//             currentIndex--;
//             // And swap it with the current element.
//             temp = array[currentIndex];
//             array[currentIndex] = array[randomIndex];
//             array[randomIndex] = temp;
//         }
//         return array;
//     }
//
// };

module.exports = new GameGenerator();