"use strict";

var gameGenerator = function() {
    var constants = require('./constants'),
        gameActive = false,
        /** Contains the socket of each connected user */
        sockets = {},
        timeout;
    return {
        init: function() {
            _generateGame();
        },
        addSocket: addSocket,
        removeSocket: removeSocket
    };

    /**
     * Function responsible for the generation of a new game
     */
    function _generateGame() {
        gameActive = true;
        _sendGamesToPlayers(_generateGamesForPlayers());
        timeout = setTimeout(_endGame, constants.gameDuration);
    }

    /**
     * Generates the games for all players
     * @returns {Object}
     * <pre><code>
     * {
     *      socketId1: {board: [], username: string},
     *      ...
     *      socketIdN: {board: [], username: string}
     * }
     * </code></pre>
     * @private
     */
    function _generateGamesForPlayers() {
        var games = {};
        for (var socket in sockets) {
            if (sockets.hasOwnProperty(socket)) {
                for (var i = 0; i < Object.keys(sockets).length; i++)
                    games[socket] = {board: _generateGameForPlayer(), username: sockets[socket].username};
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
        for (var currentSocket in games) {
            if (games.hasOwnProperty(currentSocket)) {
                gameSettings['board'] = games[currentSocket]['board'];
                var otherBoards = {};
                for (var otherSocket in games) {
                    if (otherSocket != currentSocket && games.hasOwnProperty(otherSocket)) {
                        otherBoards[otherSocket] = games[otherSocket];
                    }
                }
                gameSettings['otherPlayers'] = otherBoards;
                sockets[currentSocket].emit('new game', gameSettings);
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
        sockets[socket.id] = socket;
        //Calculate the remaining game time in seconds
        var remaining = Math.floor((timeout._idleStart + timeout._idleTimeout - Date.now()) / 1000);
        //If the game is active, add to the remaining time the pause duration
        return gameActive ? remaining + constants.gamePause / 1000 : remaining;
    }

    /**
     * Removes the socket of a disconnected user from the list of existing sockets
     * @param socket The socket of the disconnected user
     * @returns {boolean} Whether the socket already existed or not
     */
    function removeSocket(socket) {
        if (sockets.hasOwnProperty(socket.id)) {
            delete sockets[socket.id];
            return true;
        }
        return false;
    }
};

module.exports = gameGenerator;