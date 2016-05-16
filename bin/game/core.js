"use strict";
/**
 * TODO: update this JSDoc
 * Class responsible for the creation of a new game
 * @param constants
 * @param getSockets
 * @param setWord
 * @returns {{createNewGame: createNewGame}}
 */
var Core = function() {
    var constants,
        getSockets,
        setWord,
        wordLength,
        graphGenerator = require('randomgraph');
    return {
        init: function(constantsRef, getSocketsRef, setWordRef) {
            constants = constantsRef;
            getSockets = getSocketsRef;
            setWord = setWordRef;
            wordLength = constants.wordLength;
        },
        createNewGame: createNewGame
    };

    /**
     * Algorithm for the creation of a new game
     */
    function createNewGame() {
        var gameWord = _generateWord(),
            /** Number of correct letters that each player will see */
            shownLetters = Math.ceil(wordLength / constants.players),
            generatedGames = [],
            connections = _generateConnectionsBetweenPlayers(constants.players, constants.degree, constants.rewiring);
        for (var i = 0; i < constants.players; i++) {
            generatedGames.push(_generateGameForPlayer(gameWord.slice(), shownLetters));
        }
        _sendGamesToPlayers(generatedGames, connections);
    }

    /**
     * Generates a random code, which will be the word used at the new game
     * @returns {Array} An array of <i>constants.wordLength</i> positions
     */
    function _generateWord() {
        var word = [];
        for (var i = 0; i < wordLength; i++) word.push(Math.floor(Math.random() * constants.optionsCount));
        setWord(word);
        return word;
    }

    /**
     * Generates the graph which represents the players that each player will see. E.g.:
     * [
     *  [1, 5, 6],
     *  [2, 7, 8],
     *  [0, 1, 4]
     *  ...
     * ]
     * Each position in the array represents a player, so, in the given example, the third player is the one that will
     * see 0, 1 and 4.
     * @param {number} numberOfPlayers The number of players for the new game
     * @param {number} degree The number of players that each player will see
     * @param {number} rewiring The rewiring probability
     * @returns {Array}
     * @private
     */
    function _generateConnectionsBetweenPlayers(numberOfPlayers, degree, rewiring) {
        var connections = graphGenerator.WattsStrogatz.beta(numberOfPlayers, degree, rewiring),
            formattedConnections = [];
        connections.edges.forEach(function(edge) {
            if (formattedConnections[edge.source] === undefined) formattedConnections[edge.source] = [];
            formattedConnections[edge.source].push(edge.target);
        });
        return formattedConnections;
    }

    function _generateGameForPlayer(gameWord, lettersToShow) {
        var positionsThatPlayerWillSee = _setPositionsToShow(gameWord.length, lettersToShow);
        gameWord.forEach(function(element, index) {
            if (positionsThatPlayerWillSee.indexOf(index) === -1) gameWord[index] = -1;
        });
        //if (k > wordLength - 1) {
        //    gameWord = _shuffleArray(gameWord, 0, wordLength - j);
        //    gameWord = _shuffleArray(gameWord, wordLength - (shownLetters - j), wordLength);
        //    k = 0;
        //}
        return gameWord;
    }

    /**
     * Chooses the random positions of the game word that the player will see
     * @param {number} length The length of the game word
     * @param {number} lettersToShow The number of positions that the player will see
     * @returns {Array}
     * @private
     */
    function _setPositionsToShow(length, lettersToShow) {
        var positions = [],
            choice;
        while (positions.length < lettersToShow) {
            choice = Math.floor(Math.random() * (length - 1));
            //If the choice wasn't already in 'positions', append it
            if (positions.indexOf(choice) === -1) positions.push(choice);
        }
        return positions;
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
    function _sendGamesToPlayers(generatedGames, connections) {
        var sockets = getSockets();
        sockets.forEach(function(socket, index) {
            socket.emit('new game', {
                gameDuration: constants.gameDuration,
                options: constants.optionsCount,
                board: generatedGames[index],
                myName: socket.username,
                otherPlayers: getOtherPlayerBoard(connections[index])
            });
        });

        function getOtherPlayerBoard(playerConnections) {
            var board = {};
            playerConnections.forEach(function(player) {
                board[sockets[player].username] = generatedGames[player];
            });
            return board;
        }
    }
    //
    ///**
    // * Shuffles an array from indexes <b>startAt</b> to <b>stopAt</b>. The rest of the array remains unchanged. E.g.:
    // * _shuffleArray([a, b, c, d, e, f], 2) would shuffle [a, b, c] but not [d, e, f].
    // * @param {Array} array The array to be shuffled
    // * @param {number} startAt The index at which to start shuffling
    // * @param {number} stopAt The index at which to stop shuffling
    // */
    //function _shuffleArray(array, startAt, stopAt) {
    //    var clonedArray = array.slice(0),
    //        newArray = clonedArray.splice(startAt, stopAt + 1);
    //    return startAt == 0 ? clonedArray.concat(_knuthShuffle(newArray)) : _knuthShuffle(clonedArray).concat(newArray);
    //}
    //
    ///**
    // * Array shuffling. Credits to http://stackoverflow.com/a/2450976
    // * @param {Array} array The array to be shuffled
    // * @returns {Array}
    // * @private
    // */
    //function _knuthShuffle(array) {
    //    var currentIndex = array.length,
    //        temp,
    //        randomIndex;
    //    while (currentIndex != 0) { //While there remain elements to shuffle
    //        // Pick a remaining element
    //        randomIndex = Math.floor(Math.random() * currentIndex);
    //        currentIndex--;
    //        // And swap it with the current element.
    //        temp = array[currentIndex];
    //        array[currentIndex] = array[randomIndex];
    //        array[randomIndex] = temp;
    //    }
    //    return array;
    //}
};

module.exports = new Core();