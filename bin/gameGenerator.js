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

    function _generateGameForPlayer() {
        var word = [];
        for (var i = 0; i < constants.wordLength; i++) word.push(Math.floor(Math.random() * constants.optionsCount));
        return word;
    }

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

    function _endGame() {
        gameActive = false;
        _broadcastMessage('game over', {waitingTime: constants.gamePause});
        timeout = setTimeout(_generateGame, constants.gamePause);
    }

    function _broadcastMessage(token, message) {
        for (var socket in sockets) {
            if (sockets.hasOwnProperty(socket)) {
                sockets[socket].emit(token, message);
            }
        }

    }

    function addSocket(socket) {
        sockets[socket.id] = socket;
        //Calculate the remaining game time in seconds
        var remaining = Math.floor((timeout._idleStart + timeout._idleTimeout - Date.now()) / 1000);
        //If the game is active, add to the remaining time the pause duration
        return gameActive ? remaining + constants.gamePause / 1000 : remaining;
    }
    
    function removeSocket(socket) {
        if (sockets.hasOwnProperty(socket.id)) {
            delete sockets[socket.id];
            return true;
        }
        return false;
    }
};

module.exports = gameGenerator;