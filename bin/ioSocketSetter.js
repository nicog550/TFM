"use strict";

/**
 * Socket.io features
 */
var ioSocketSetter = function() {
    /* Socket broadcasting options: http://stackoverflow.com/a/10099325 */
    var constants = require('./constants'),
        logger = require('./logger'),
        ioSocket,
        gameGenerator,
        usernames = [];
    return {
        setup: socketSetup
    };

    /**
     * @constructor
     * @param ioSocketRef
     * @param gameGeneratorRef
     */
    function socketSetup(ioSocketRef, gameGeneratorRef) {
        gameGenerator = gameGeneratorRef;
        ioSocket = ioSocketRef;
        ioSocket.on('connection', function(socket) {
            _receiveMoves(socket);
            _receiveFinalBoards(socket);
            _addUser(socket);
            _removeUser(socket);
        });
    }

    /**
     * Listener for the "login" message
     * @param {object} socket The player's socket
     * @private
     */
    function _addUser(socket) {
        socket.on('add user', function(username) {
            if (usernames.indexOf(username) !== -1) { //If the name entered by the player already exists
                socket.emit('invalid username', {});
                return;
            }
            //Log the player in
            socket.username = username;
            socket.userId = usernames.length + 1;
            usernames.push(username);
            var remainingPlayers = gameGenerator.addSocket(socket);
            socket.emit('login', {remainingPlayers: remainingPlayers});
            //Notify the other players
            if (remainingPlayers > 0) socket.broadcast.emit('remaining players', {remainingPlayers: remainingPlayers});
            else gameGenerator.generateGame();
        });
    }

    /**
     * Listener for the "scores" message
     * @param {object} socket The player's socket
     * @private
     */
    function _receiveFinalBoards(socket) {
        socket.on('final board', function(data) {
            gameGenerator.checkResults(socket.username, data, broadcastScores);
        });

        /**
         * Broadcast the final scores to all players
         * @callback broadcastScores
         * @param {Array} scores
         */
        function broadcastScores(scores) {
            ioSocket.emit('final scores', scores);
        }
    }

    /**
     * Listener for the "new move" message
     * @param {object} socket The player's socket
     * @private
     */
    function _receiveMoves(socket) {
        //Send the new move to all other players
        socket.on('new move', function(data) {
            logger.addMove({
                userID: socket.userId,
                move: data
            });
            socket.broadcast.emit('new move', {
                username: socket.username,
                board: data
            });
        });
    }

    /**
     * Listener for the "logout" and "disconnect" messages.
     * - The "logout" message is a custom one, triggered manually from the client
     * - The "disconnect" message can only be triggered when the user closes the browser or refreshes the page
     * @param {object} socket The player's socket
     * @private
     */
    function _removeUser(socket) {
        socket.on('logout', performLogout);
        socket.on('disconnect', performLogout);

        /**
         * Actual user disconnection
         */
        function performLogout() {
            var remainingPlayers = gameGenerator.removeSocket(socket);
            if (remainingPlayers !== false) { //If the user was already logged in
                usernames.splice(usernames.indexOf(socket.username), 1); //Remove it from the usernames list
                socket.disconnect(); //Finally, disconnect from the socket
                socket.broadcast.emit('remaining players', {remainingPlayers: remainingPlayers});
            }
        }
    }
};

module.exports = new ioSocketSetter();