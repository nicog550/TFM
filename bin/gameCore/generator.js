"use strict";
/**
 * Class responsible for the creation of a new game
 * @constructor
 */
var Generator = function() {
    var game,
        getCurrentGame,
        getSockets,
        graphGenerator = require('randomgraph'),
        logger,
        players,
        setWord;
    return {
        init: function(getCurrentGameRef, getSocketsRef, setWordRef, playersVal, loggerRef) {
            getCurrentGame = getCurrentGameRef;
            getSockets = getSocketsRef;
            setWord = setWordRef;
            players = playersVal;
            logger = loggerRef;
        },
        createGame: createGame
    };

    /**
     * Algorithm for the creation of a new game
     * @param {string|number} round The current round
     * @returns {Array} Each player's game. The structure looks like
     * [{player: str, userId: str, board: []}, {player: str, userId: str, board: []}, ...]
     */
    function createGame(round) {
        game = getCurrentGame();
        var wordLength = game.wordLength,
            gameWord = _generateWord(wordLength),
            shownLetters = Math.ceil(wordLength / players), //Number of correct letters that each player will see
            generatedGames = [],
            connections = _generateConnectionsBetweenPlayers(players, game.degree, game.rewiring);
        for (var i = 0; i < players; i++) {
            generatedGames.push(_generateGameForPlayer(gameWord.slice(), shownLetters));
        }
        var css = _generateGameColors(game.options),
            playersWords = _sendGamesToPlayers(generatedGames, connections, css);
        logger.startGame(round + 1, gameWord, playersWords, players, game.degree, game.rewiring, game.options,
                         wordLength, shownLetters, game.duration, game.showCodeTime);
        return playersWords;
    }

    /**
     * Generates a random code, which will be the word used at the new game
     * @param {number} wordLength The length of the word to be generated
     * @returns {Array} An array of <i>constants.wordLength</i> positions
     */
    function _generateWord(wordLength) {
        var word = [];
        for (var i = 0; i < wordLength; i++) word.push(Math.floor(Math.random() * game.options));
        setWord(word);
        return word;
    }

    /**
     * Generates the graph which represents the players that each player will see. Each position in the array represents
     * a player, so, in the following example, the third player is the one that will see 0, 1 and 4.
     * [[1, 5, 6], [2, 7, 8], [0, 1, 4], ...]
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

    /**
     * Generates the word that will contain the real letters the player will see
     * @param {Array} gameWord The game's word
     * @param {number} lettersToShow The number of positions that the player will see
     * @returns {*}
     * @private
     */
    function _generateGameForPlayer(gameWord, lettersToShow) {
        var positionsThatPlayerWillSee = setPositionsToShow();
        gameWord.forEach(function(letter, position) {
            if (positionsThatPlayerWillSee.indexOf(position) === -1) gameWord[position] = -1;
        });
        return gameWord;

        /**
         * Chooses the random positions of the game word that the player will see
         * @returns {Array}
         */
        function setPositionsToShow() {
            var positions = [],
                choice;
            while (positions.length < lettersToShow) {
                choice = Math.floor(Math.random() * (gameWord.length - 1));
                //If the choice wasn't already in 'positions', append it
                if (positions.indexOf(choice) === -1) positions.push(choice);
            }
            return positions;
        }
    }

    /**
     * Generates the CSS sheet with the colors that players will see for each choice
     * @param {number} options The number of different choices
     * @private
     */
    function _generateGameColors(options) {
        var colors = [],
            values = ['0', '5', 'B', 'F'];
        values.forEach(function(val1) {
            values.forEach(function(val2) {
                values.forEach(function(val3) {
                    colors.push('#' + val1 + val2 + val3);
                });
            });
        });
        colors.shift(); //Remove the first element (#000), which would be confused with the background color
        var finalValues = [];
        for (var i = 0; i < options; i++) {
            finalValues.push(colors.splice(Math.floor(Math.random() * colors.length), 1));
        }
        return finalValues.reduce(function(accum, current, index) {
            return accum +
                '[data-background="' + index + '"], [data-background="' + index + '"]:hover {' +
                'background-color: ' + current + ';' +
                '}\n';
        }, '');
    }

    /**
     * Sends to each player their game plus the games of the other players. The used structure is the following one:
     * <pre><code>
     * {
     *      gameDuration: number,
     *      options: number,
     *      board: [...],
     *      myName: string,
     *      otherPlayers: {username1: [...], username2: [...], ...},
     *      showDuring: number,
     *      css: string
     * }
     * </code></pre>
     * @private
     * @param {Array} generatedGames The games generated for all players
     * @param {Array} connections The connections generated for all players
     * @return {Array} The games generated for each player, indexed by their name
     * @param {string} css The CSS sheet with the colors for each option
     */
    function _sendGamesToPlayers(generatedGames, connections, css) {
        var sockets = getSockets(),
            initialGames = [];
        sockets.forEach(function(socket, index) {
            socket.emit('new game', {
                gameDuration: game.duration,
                options: game.options,
                board: generatedGames[index],
                myName: socket.username,
                otherPlayers: getOtherPlayersBoards(connections[index]),
                showDuring: game.showCodeTime,
                css: css
            });
            initialGames.push({
                player: socket.username,
                userId: socket.userId,
                board: generatedGames[index],
                connections: connections[index]
            });
        });
        return initialGames;

        function getOtherPlayersBoards(playerConnections) {
            var board = {};
            playerConnections.forEach(function(player) {
                board[sockets[player].username] = generatedGames[player];
            });
            return board;
        }
    }
};

module.exports = new Generator();