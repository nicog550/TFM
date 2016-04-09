"use strict";

/**
 * Socket.io features
 */
// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;
var ioSocketSetter = function() {
    var gameGenerator;
    return {
        setup: socketSetup
    };
    function socketSetup(ioSocket, gameGeneratorRef) {
        gameGenerator = gameGeneratorRef;
        ioSocket.on('connection', function (socket) {
            var addedUser = false;

            // when the client emits 'new message', this listens and executes
            socket.on('new message', function (data) {
                // we tell the client to execute 'new message'
                socket.broadcast.emit('new message', {
                    username: socket.username,
                    message: data
                });
            });

            // when the client emits 'add user', this listens and executes
            socket.on('add user', function (username) {
                // we store the username in the socket session for this client
                socket.username = username;
                gameGenerator.addSocket(socket);
                // add the client's username to the global list
                usernames[username] = username;
                ++numUsers;
                addedUser = true;
                socket.emit('login', {
                    numUsers: numUsers
                });
                // echo globally (all clients) that a person has connected
                socket.broadcast.emit('user joined', {
                    username: socket.username,
                    numUsers: numUsers
                });
            });

            // when the user disconnects.. perform this
            socket.on('disconnect', function () {
                // remove the username from global usernames list
                if (addedUser) {
                    gameGenerator.removeSocket(socket);
                    delete usernames[socket.username];
                    --numUsers;

                    // echo globally that this client has left
                    socket.broadcast.emit('user left', {
                        username: socket.username,
                        numUsers: numUsers
                    });
                }
            });

            // // when the client emits 'typing', we broadcast it to others
            // socket.on('typing', function () {
            //   socket.broadcast.emit('typing', {
            //     username: socket.username
            //   });
            // });
            //
            // // when the client emits 'stop typing', we broadcast it to others
            // socket.on('stop typing', function () {
            //   socket.broadcast.emit('stop typing', {
            //     username: socket.username
            //   });
            // });
        });
    }
};
module.exports = ioSocketSetter;