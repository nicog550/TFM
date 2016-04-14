"use strict";
/**
 * Class responsible for the game logic
 */
var Game = function() {
    var debugGame =  false,
        gameOver = GameOver(),
        main,
        otherPlayersBoard = this.otherUsers(debugGame),
        playerBoard = this.player(debugGame, sockets),
        selector = "game-screen",
        sockets,
        waitingRoom;
    return {
        init: function(mainRef, socketsRef, waitingRoomRef) {
            main = mainRef;
            sockets = socketsRef;
            waitingRoom = waitingRoomRef;
            playerBoard.performMove(sockets);
            gameOver.init(main, socketsRef);
        },
        selector: selector,
        drawMove: otherPlayersBoard.drawMove,
        finishGame: finishGame,
        startGame: startGame
    };
    
    function finishGame(waitingTime) {
        if (debugGame) return;
        main.toggleScreen(gameOver);
        gameOver.displayRemainingTime(waitingTime);
    }

    function startGame(board, duration, options, otherPlayers) {
        playerBoard.drawBoard(board, options);
        otherPlayersBoard.displayBoards(otherPlayers);
        main.toggleScreen(this);
        main.displayCountdown(duration, $("#game-time"));
    }
};

/**
 * Class responsible for drawing the current player's board
 * @param {boolean} debugGame Game mode: debug or not
 * @returns {{drawBoard: drawBoard}}
 */
Game.prototype.player = function(debugGame) {
    var buttonsClass = 'game-button',
        choicesClass = 'choice',
        gameBoard = document.getElementById("game-board");
    return {
        drawBoard: drawBoard,
        performMove: performMove
    };

    /**
     * Empties the board if it was already populated and creates in it a structure like the following one:
     * <table id="own-game">
     *  <tbody>
     *      <tr id="game-board" class="dropdown">
     *         <td class="dropdown">
     *             <button class="game-button dropdown-toggle" data-position="0" data-toggle="dropdown" type="button">
     *                 3
     *             </button>
     *             <ul class="dropdown-menu">
     *                 <li>
     *                     <a href="#" class="choice" data-position="0">0</a>
     *                 </li>
     *                 ...
     *                 <li>
     *                     <a href="#" class="choice" data-position="n">3</a>
     *                 </li>
     *             </ul>
     *         </td>
     *         ...
     *         <td class="dropdown">
     *             ...
     *         </td>
     *     </tr>
     *  </tbody>
     * </table>
     * @param board The values for the player's board
     * @param options
     */
    function drawBoard(board, options) {
        if (debugGame && gameBoard.firstChild) return;
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

    function performMove(sockets) {
        $(document).on('click', '.' + choicesClass, function(e) {
            e.preventDefault();
            var newValue = $(this).text(),
                position = $(this).data('position');
            $("." + buttonsClass + "[data-position=" + position + "]").text(newValue);
            sockets.newMove(position, parseInt(newValue));
        });
    }
};

/**
 * Class responsible for drawing the other players boards
 * @param {boolean} debugGame Game mode: debug or not
 * @returns {{displayBoards: displayBoards, drawMove: drawMove}}
 */
Game.prototype.otherUsers = function(debugGame) {
    var otherPlayersBoard = document.getElementById('other-players');
    return {
        displayBoards: displayBoards,
        drawMove: drawMove
    };

    /**
     * Empties the board if it was already populated and creates in it a structure like the following one:
     * <table>
     *     <tbody id="other-players">
     *         <tr data-player="{{ player1Name }}">
     *             <td>{{player1Name}}</td>
     *             <td data-position="0">3</td>
     *             ...
     *             <td data-position="n">1</td>
     *         </tr>
     *         <tr class="spacer"></tr>
     *         ...
     *         <tr data-player="{{ playerNName }}">
     *             ...
     *         </tr>
     *     </tbody>
     * </table>
     * @param {Object} otherPlayers The other players boards
     */
    function displayBoards(otherPlayers) {
        if (debugGame && otherPlayersBoard.firstChild) return;
        while (otherPlayersBoard.firstChild) otherPlayersBoard.removeChild(otherPlayersBoard.firstChild); //Empty board
        for (var player in otherPlayers) {
            if (otherPlayers.hasOwnProperty(player)) {
                var row = document.createElement('tr');
                row.dataset['player'] = otherPlayers[player]['username'];
                var nameBox = document.createElement('td');
                nameBox.innerText = otherPlayers[player]['username'];
                row.appendChild(nameBox);
                for (var j = 0; j < otherPlayers[player]['board'].length; j++) {
                    var box = document.createElement('td');
                    box.innerText = otherPlayers[player]['board'][j];
                    box.dataset['position'] = j;
                    row.appendChild(box);
                }
                otherPlayersBoard.appendChild(row);
                var spacer = document.createElement('tr');
                spacer.className = 'spacer';
                otherPlayersBoard.appendChild(spacer);
            }
        }
    }

    /**
     * Displays the move another player has done
     * @param {string} player The player's name
     * @param {int|string} position The index of the changed value
     * @param {int|string} newValue The value that replaces the old one
     */
    function drawMove(player, position, newValue) {
        var $box = $("[data-player=" + player + "]").find("[data-position=" + position + "]"),
            intervalLapse = 400;
        $box.text(newValue);
        highlightBox(0);

        function highlightBox(index) {
            if (index < 2) {
                $box.addClass('updated');
                setTimeout(function() {
                    $box.removeClass('updated');
                    setTimeout(function() {
                        highlightBox(++index);
                    }, intervalLapse / 2);
                }, intervalLapse / 2);
            }
        }
    }
};