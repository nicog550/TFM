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
        var word = [];
        for (var i = 0; i < constants.wordLength; i++) word.push(Math.floor(Math.random() * constants.optionsCount));
        var gameSettings = {
            board: word,
            gameDuration: constants.gameDuration,
            options: constants.optionsCount,
            players: Object.keys(sockets).length
        };
        _broadcastMessage('new game', gameSettings);
        timeout = setTimeout(_endGame, constants.gameDuration);
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
        console.log("adds", socket.id);
        sockets[socket.id] = socket;
        //Calculate the remaining game time in seconds
        var remaining = Math.floor((timeout._idleStart + timeout._idleTimeout - Date.now()) / 1000);
        //If the game is active, add to the remaining time the pause duration
        return gameActive ? remaining + constants.gamePause / 1000 : remaining;
    }
    
    function removeSocket(socket) {
        console.log("removes", socket.id);
        if (sockets.hasOwnProperty(socket.id)) {
            delete sockets[socket.id];
            return true;
        }
        return false;
    }
};

module.exports = gameGenerator;