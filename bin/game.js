"use strict";

/**
 * Class responsible for the creation of new games
 * @constructor
 */
var Game = function() {
    var constants = require('./constants'),
        generator = require('./gameCore/generator'),
        playersBoards,
        round = 0,
        scores = require('./gameCore/scores'),
        sockets = [],
        timeout,
        word;
    return {
        init: function() {
            generator.init(constants, getSockets, setWord);
            scores.init(constants, getWord);
        },
        addPlayer: addPlayer,
        generateGame: generateGame,
        removePlayer: removePlayer,
        updatePlayerBoard: updatePlayerBoard
    };

    /** Getter */
    function getSockets() { return sockets; }

    /** Getter */
    function getWord() { return word; }

    /** Setter */
    function setWord(newWord) { word = newWord; }

    /**
     * Function responsible for the generation of a new game
     */
    function generateGame() {
        round++;
        playersBoards = generator.createGame();
        setTimeout(_endGame, constants.gameDuration * 1000);
    }

    /**
     * Sends the 'game over' message to all players
     * @private
     */
    function _endGame() {
        sockets.forEach(function(socket) { socket.emit('game over', {waitingTime: constants.gamePause}); });
        var newScores = scores.calculateScores(word, playersBoards);
        setTimeout(function() {
            sockets.forEach(function(socket) { socket.emit('final scores', newScores); });
            timeout = setTimeout(generateGame, constants.gamePause * 1000); //TODO: remove this
        }, 1000); //Display the 'processing scores' screen for at least one second
    }

    /**
     * Appends the socket of a newly connected player to the list of existing sockets
     * @param socket The socket of the newly connected user
     * @returns {number} The number of remaining players necessary for the game to start
     */
    function addPlayer(socket) {
        sockets.push(socket);
        scores.addPlayer(socket.username);
        return constants.players - sockets.length;
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

module.exports = new Game();