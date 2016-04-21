"use strict";

/**
 * Socket.io features
 * TODO: http://stackoverflow.com/a/10099325
 */
var ioSocketSetter = function() {
    var constants = require('./constants'),
        ioSocket,
        gameGenerator,
        loginManager,
        that = this,
        usernames = [];
    return {
        setup: socketSetup
    };
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

    function _addUser(socket) {
        socket.on('add user', function(username) {
            if (loginManager.addUser(socket, username, usernames)) usernames.push(username);
        });
    }
    
    function _receiveFinalBoards(socket) {
        socket.on('final board', function(data) {
            gameGenerator.checkResults(socket.username, data, broadcastScores);
        });
        
        function broadcastScores(scores) {
            //Broadcast final scores to all players
            ioSocket.emit('final scores', scores);
        }
    }

    function _receiveMoves(socket) {
        socket.on('new move', function(data) {
            socket.broadcast.emit('new move', {
                username: socket.username,
                message: data
            });
        });
    }

    function _removeUser(socket) {
        socket.on('logout', performLogout);
        socket.on('disconnect', performLogout);

        function performLogout() {
            // remove the username from global usernames list
            if (gameGenerator.removeSocket(socket)) {
                usernames.splice(usernames.indexOf(socket.username), 1);

                // echo globally that this client has left
                socket.broadcast.emit('user left', {
                    username: socket.username,
                    numUsers: usernames.length
                });
                socket.disconnect();
            }
        }
    }
};

ioSocketSetter.prototype.loginManager = function(gameGenerator, constants) {
    return {
        addUser: addUser
    };

    function addUser(socket, username, usernames) {
        if (usernames.indexOf(username) !== -1) {
            socket.emit('invalid username', {});
            return false;
        }
        // we store the username in the socket session for this client
        socket.username = username;
        var remainingTime = gameGenerator.addSocket(socket);
        _emitLogin(socket, usernames, remainingTime);
        _notifyOtherPlayers(socket, usernames);
        return true;
    }

    function _emitLogin(socket, usernames, remainingTime) {
        if (remainingTime > 0) _sendLoginThroughSocket(socket, usernames, remainingTime);
        //Else, wait for the "new game" message is sent before sending the "login" one in order to avoid the game to
        //start for the user immediately on login (while the "welcome" and the "waiting room" screens are being
        //switched
        else {
            var waitingTime = 1000;
            setTimeout(function() {
                _sendLoginThroughSocket(socket, usernames,
                                        (constants.gameDuration + constants.gamePause - waitingTime) / 1000);
            }, waitingTime);
        }
    }

    function _sendLoginThroughSocket(socket, usernames, remainingTime) {
        socket.isLoggedIn = true;
        socket.emit('login', {
            numUsers: usernames.length + 1, //Add 1 because the current player has not been appended to 'numUsers' yet
            //If a new game starts just now, make the player wait for a whole turn passes
            waitingTime: remainingTime > 0 ? remainingTime : (constants.gameDuration + constants.gamePause) / 1000
        });
    }

    function _notifyOtherPlayers(socket, usernames) {
        // echo globally (all players) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: usernames.length
        });
    }
};

module.exports = new ioSocketSetter();