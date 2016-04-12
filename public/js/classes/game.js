"use strict";
/**
 * Class responsible for the game logic
 */
var Game = function() {
    var buttonsClass = 'game-button',
        choicesClass = 'choice',
        gameBoard = document.getElementById("game-board"),
        gameOver = GameOver(),
        main,
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
            $("#test-btn").on('click', sockets.sendLogout)
        },
        selector: selector,
        finishGame: finishGame,
        startGame: startGame
    };
    
    function finishGame(waitingTime) {
        //TODO: uncomment the following lines
        // main.toggleScreen(gameOver);
        // gameOver.displayRemainingTime(waitingTime);
    }

    function startGame(board, duration, options) {
        _drawBoard(board, options);
        main.toggleScreen(this);
        main.displayCountdown(duration, $("#game-time"));
    }
    
    function _drawBoard(board, options) {
        if (gameBoard.firstChild) return; //TODO: remove this line
        while (gameBoard.firstChild) gameBoard.removeChild(gameBoard.firstChild); //Empty board
        for (var i = 0; i < board.length; i++) {
            gameBoard.appendChild(_createDropdown(board[i], i, options));
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
            sockets.sendMove(position, parseInt(newValue));
        });
    }
};