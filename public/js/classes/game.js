"use strict";
/**
 * Class responsible for the game logic
 */
var Game = function() {
    var buttonsClass = 'game-button',
        choicesClass = 'choice',
        debugGame =  true,
        gameBoard = document.getElementById("game-board"),
        gameOver = GameOver(),
        main,
        otherPlayersBoard = document.getElementById('other-players'),
        selector = "game-screen",
        sockets,
        waitingRoom;
    return {
        init: function(mainRef, socketsRef, waitingRoomRef) {
            main = mainRef;
            sockets = socketsRef;
            waitingRoom = waitingRoomRef;
            _performMove();
            gameOver.init(main, socketsRef);
        },
        selector: selector,
        finishGame: finishGame,
        startGame: startGame
    };
    
    function finishGame(waitingTime) {
        if (debugGame) return;
        main.toggleScreen(gameOver);
        gameOver.displayRemainingTime(waitingTime);
    }

    function startGame(board, duration, options, players) {
        _drawBoard(board, options);
        _displayOtherPlayers(players, board.length, options);
        main.toggleScreen(this);
        main.displayCountdown(duration, $("#game-time"));
    }
    
    function _drawBoard(board, options) {
        if (debugGame && gameBoard.firstChild) return;
        while (gameBoard.firstChild) gameBoard.removeChild(gameBoard.firstChild); //Empty board
        for (var i = 0; i < board.length; i++) {
            gameBoard.appendChild(_createDropdown(board[i], i, options));
        }
    }

    function _displayOtherPlayers(count, wordLength, options) {
        if (debugGame && otherPlayersBoard.firstChild) return;
        while (otherPlayersBoard.firstChild) otherPlayersBoard.removeChild(otherPlayersBoard.firstChild); //Empty board
        for (var i = 0; i < count; i++) {
            var row = document.createElement('tr');
            for (var j = 0; j < wordLength; j++) {
                var box = document.createElement('td');
                box.innerText = parseInt(Math.random() * options);
                row.appendChild(box);
            }
            otherPlayersBoard.appendChild(row);
            var spacer = document.createElement('tr');
            spacer.className = 'spacer';
            otherPlayersBoard.appendChild(spacer);
        }
    }

    function _createDropdown(boardValue, boardPosition, options) {
        //Create the <td>
        var box = document.createElement('td');
        box.className = 'dropdown';
        box.appendChild(createButton());
        box.appendChild(createUl());
        return box;

        function createButton() {
            var button = document.createElement('button');
            button.className = buttonsClass + ' dropdown-toggle';
            button.dataset['position'] = boardPosition;
            button.dataset['toggle'] = 'dropdown';
            button.innerText = boardValue;
            button.type = 'button';
            return button;
        }

        function createUl() {
            var ul = document.createElement('ul');
            ul.className = 'dropdown-menu';
            for (var i = 0; i < options; i++) {
                //Create the <li><a></a><li> structure and append it to the <ul>
                var li = document.createElement('li'),
                    a = document.createElement('a');
                a.href = '#';
                a.className = choicesClass;
                a.innerText = i;
                a.dataset['position'] = boardPosition;
                li.appendChild(a);
                ul.appendChild(li);
            }
            return ul;
        }
    }

    function _performMove() {
        $(document).on('click', '.' + choicesClass, function(e) {
            e.preventDefault();
            var newValue = $(this).text(),
                position = $(this).data('position');
            $("." + buttonsClass + "[data-position=" + position + "]").text(newValue);
            sockets.newMove(position, parseInt(newValue));
        });
    }
};