"use strict";

/**
 * Socket.io features
 * TODO: http://stackoverflow.com/a/10099325
 */
var ioSocketSetter = function() {
    var ioSocket,
        gameGenerator,
        usernames = {},
        numUsers = 0,
        constants = require('./constants');
    return {
        setup: socketSetup
    };
    function socketSetup(ioSocketRef, gameGeneratorRef) {
        gameGenerator = gameGeneratorRef;
        ioSocket = ioSocketRef;
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
            // we store the username in the socket session for this client
            socket.username = username;
            var remainingTime = gameGenerator.addSocket(socket);
            // add the client's username to the global list
            usernames[username] = username;
            ++numUsers;
            emitLogin(remainingTime);
            notifyOtherPlayers();
        });

        function emitLogin(remainingTime) {
            if (remainingTime > 0) sendLogin(remainingTime);
            //Else, wait for the "new game" message is sent before sending the "login" one in order to avoid the game to
            //start for the user immediately on login (while the "welcome" and the "waiting room" screens are being
            //switched
            else {
                var waitingTime = 1000;
                setTimeout(function() {
                    sendLogin((constants.gameDuration + constants.gamePause - waitingTime) / 1000);
                }, waitingTime);
            }
        }

        function sendLogin(remainingTime) {
            socket.isLoggedIn = true;
            socket.emit('login', {
                numUsers: numUsers,
                //If a new game starts just now, make the player wait for a whole turn passes
                waitingTime: remainingTime > 0 ? remainingTime : (constants.gameDuration + constants.gamePause) / 1000
            });
        }

        function notifyOtherPlayers() {
            // echo globally (all clients) that a person has connected
            socket.broadcast.emit('user joined', {
                username: socket.username,
                numUsers: numUsers
            });
        }
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
            // we tell the client to execute 'new message'
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
                delete usernames[socket.username];
                --numUsers;

                // echo globally that this client has left
                socket.broadcast.emit('user left', {
                    username: socket.username,
                    numUsers: numUsers
                });
            }
        }
    }
};
module.exports = ioSocketSetter;