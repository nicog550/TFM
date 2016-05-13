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
        loginManager,
        that = this,
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
        loginManager = that.loginManager(gameGenerator, constants);
        ioSocket.on('connection', function(socket) {
            socket.isLoggedIn = false;
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
            if (loginManager.addUser(socket, username, usernames)) usernames.push(username);
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
            if (gameGenerator.removeSocket(socket)) { //If the user was already logged in
                usernames.splice(usernames.indexOf(socket.username), 1); //Remove it from the usernames list
                socket.disconnect(); //Finally, disconnect from the socket
            }
        }
    }
};

/**
 * Class responsible for the login actions
 * @param {object} gameGenerator Instance of GameGenerator
 * @param {object} constants Instance of Constants
 */
ioSocketSetter.prototype.loginManager = function(gameGenerator, constants) {
    return {
        addUser: addUser
    };

    /**
     * Checks if the name entered by the player already exists in the usernames list, and then:
     * - If it does exist, notifies the player about that
     * - Otherwise, gameLogs the player in and notifies the other players about this
     * @param {object} socket The player's socket
     * @param {string} username The name entered by the player
     * @param {Array} usernames The list of current players names
     * @returns {boolean} Whether the user has been logged in or not
     */
    function addUser(socket, username, usernames) {
        if (usernames.indexOf(username) !== -1) {
            socket.emit('invalid username', {});
            return false;
        }
        socket.username = username;
        socket.userId = usernames.length + 1;
        var remainingTime = gameGenerator.addSocket(socket);
        _emitLogin(socket, usernames, remainingTime);
        return true;
    }

    /**
     * Sends the login message immediately or, if a game is about to start at this exact moment, waits one second before
     * sending it
     * @param {object} socket The player's socket
     * @param {Array} usernames The list of current players names
     * @param {number} remainingTime The amount of time remaining until a new game starts
     * @private
     */
    function _emitLogin(socket, usernames, remainingTime) {
        if (remainingTime > 0) _sendLoginThroughSocket(socket, usernames, remainingTime);
        //Else, wait for the "new game" message is sent before sending the "login" one in order to avoid the game to
        //start for the user immediately on login (while the "welcome" and the "waiting room" screens are being
        //switched
        else {
            var waitingTime = 1;
            setTimeout(function() {
                _sendLoginThroughSocket(socket, usernames,
                                        constants.gameDuration + constants.gamePause - waitingTime);
            }, waitingTime * 1000);
        }
    }

    /**
     * Sends the login message through the socket
     * @param {object} socket The player's socket
     * @param {Array} usernames The list of current players names
     * @param {number} remainingTime The amount of the time remaining until a new game starts
     * @private
     */
    function _sendLoginThroughSocket(socket, usernames, remainingTime) {
        socket.isLoggedIn = true;
        socket.emit('login', {
            //Add 1 because the current player has not been appended to 'numUsers' yet
            numUsers: usernames.length + 1,
            //If a new game starts just now, make the player wait for a whole turn passes
            waitingTime: remainingTime > 0 ? remainingTime : (constants.gameDuration + constants.gamePause)
        });
    }
};

module.exports = new ioSocketSetter();