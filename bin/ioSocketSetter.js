"use strict";

/**
 * Socket.io features
 */
var ioSocketSetter = function() {
    var gameGenerator,
        usernames = {},
        numUsers = 0,
        constants = require('./constants');
    return {
        setup: socketSetup
    };
    function socketSetup(ioSocket, gameGeneratorRef) {
        gameGenerator = gameGeneratorRef;
        ioSocket.on('connection', function (socket) {
            _receiveMove(socket);
            _addUser(socket);
            _removeUser(socket);
        });
    }

    function _addUser(socket) {
        socket.on('add user', function (username) {
            // we store the username in the socket session for this client
            socket.username = username;
            var remainingTime = gameGenerator.addSocket(socket);
            // add the client's username to the global list
            usernames[username] = username;
            ++numUsers;
            socket.emit('login', {
                numUsers: numUsers,
                //If a new game starts just now, make the player wait for a whole turn passes
                waitingTime: remainingTime > 0 ? remainingTime : constants.gameDuration + constants.gamePause
            });
            // echo globally (all clients) that a person has connected
            socket.broadcast.emit('user joined', {
                username: socket.username,
                numUsers: numUsers
            });
        });
    }

    function _receiveMove(socket) {
        socket.on('new move', function (data) {
            console.log("received move:", data)
            // we tell the client to execute 'new message'
            socket.broadcast.emit('new move', {
                username: socket.username,
                message: data
            });
        });
    }

    function _removeUser(socket) {
        socket.on('disconnect', function () {
            console.log("received logout");
            // remove the username from global usernames list
            gameGenerator.removeSocket(socket);
            delete usernames[socket.username];
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        });
    }
};
module.exports = ioSocketSetter;