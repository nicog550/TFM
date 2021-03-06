"use strict";

/**
 * Socket.io features<br>
 * Socket broadcasting options: {@link http://stackoverflow.com/a/10099325}
 * @constructor
 */
var ioSocketSetter = function() {
    var experiment,
        ioSocket,
        usernames = [];
    return {
        init: init
    };

    /**
     * @param {object} ioSocketRef The socket.io module
     * @param {object} experimentRef The game generator module
     * @constructs
     */
    function init(ioSocketRef, experimentRef) {
        experiment = experimentRef;
        ioSocket = ioSocketRef;
        ioSocket.on('connection', function(socket) {
            _receiveMoves(socket);
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
            if (usernames.indexOf(username) !== -1) { //The name entered by the player already exists
                socket.emit('invalid login', {reason: 'That username is already in use'});
                return;
            }
            //Log the player in
            socket.username = username;
            socket.userId = usernames.length + 1;
            var remainingPlayers = experiment.addPlayer(socket);
            if (remainingPlayers === false) { //The player cannot join the experiment
                socket.emit('invalid login', {reason: 'You cannot join the game'});
                return;
            }

            usernames.push(username);
            if (remainingPlayers === true) { //The player has joined the experiment after it has started
                socket.emit('login', {remainingPlayers: -1});
                return;
            }

            if (remainingPlayers > 0) {
                socket.emit('login', {remainingPlayers: remainingPlayers});
                //Notify the other players
                socket.broadcast.emit('remaining players', {remainingPlayers: remainingPlayers});
            } //else: a new game will be sent to all players
        });
    }

    /**
     * Listener for the "new move" message
     * @param {object} socket The player's socket
     * @private
     */
    function _receiveMoves(socket) {
        //Send the new move to all other players
        socket.on('new move', function(data) {
            experiment.updatePlayerBoard(socket.username, data);
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
            var remainingPlayers = experiment.removePlayer(socket);
            if (remainingPlayers !== false) { //If the user was already logged in
                usernames.splice(usernames.indexOf(socket.username), 1); //Remove it from the usernames list
                socket.disconnect(); //Finally, disconnect from the socket
                socket.broadcast.emit('remaining players', {remainingPlayers: remainingPlayers});
            }
        }
    }
};

module.exports = new ioSocketSetter();