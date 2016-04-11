"use strict";

var gameGenerator = function() {
    var constants = require('./constants'),
        /** Contains the socket of each connected user */
        sockets = {};
    return {
        init: function() {
            _generateGame();
            setInterval(_generateGame, constants.gameFrequency);
        },
        addSocket: addSocket,
        removeSocket: removeSocket
    };

    /**
     * Function responsible for the generation of a new game
     */
    function _generateGame() {
        var word = [];
        for (var i = 0; i < constants.wordLength; i++) word.push(Math.floor(Math.random() * constants.optionsCount));
        var gameSettings = {
            board: word,
            options: constants.optionsCount
        };
        _broadcastMessage('new game', gameSettings);
        setTimeout(_endGame, constants.gameDuration);
    }

    function _endGame() {
        _broadcastMessage('game over', {});
    }

    function _broadcastMessage(token, message) {
        for (var socket in sockets) {
            if (sockets.hasOwnProperty(socket)) {
                sockets[socket].broadcast.emit(token, message);
            }
        }

    }

    function addSocket(socketRef) {
        sockets[socketRef.id] = socketRef;
    }
    
    function removeSocket(socketRef) {
        delete sockets[socketRef.id];
    }
};

module.exports = gameGenerator;