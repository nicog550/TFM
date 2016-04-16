"use strict";
/**
 * Class responsible for the game logic
 */
var Game = function() {
    var debugGame = false,
        gameOver = GameOver(),
        main,
        otherPlayersBoard = this.otherUsers(debugGame),
        playerBoard = this.player(debugGame),
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
        debug: function() {return debugGame;},
        selector: "game-screen",
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
    var $gameBoardContainer = $("#own-game-container");
    return {
        drawBoard: drawBoard,
        performMove: performMove
    };

    /**
     * Empties the board if it already had content and populates it again
     * @param board The values for the player's board
     * @param options
     */
    function drawBoard(board, options) {
        if (debugGame && $gameBoardContainer.children().length > 0) return;
        $gameBoardContainer.empty();
        var $boardTemplate = $("#board-template").find(".own-game").clone(),
            $rowTemplate = $boardTemplate.find(".game-board"),
            $boxTemplate = $rowTemplate.find(".box").detach();
        for (var i = 0; i < board.length; i++) {
            $rowTemplate.append(_createDropdown($boxTemplate, board[i], i, options));
        }
        $gameBoardContainer.append($boardTemplate);
    }

    function _createDropdown($baseTemplate, boardValue, boardPosition, options) {
        var $template = $baseTemplate.clone(true);
        createButton();
        createList();
        return $template;

        function createButton() {
            var $button = $template.find("button");
            $button.text(boardValue);
            $button[0].dataset['position'] = boardPosition; //jQuery data() not working here...
        }

        function createList() {
            var $ul = $template.find(".dropdown-menu"),
                $li = $ul.find(".dropdown-option").detach();
            for (var i = 0; i < options; i++) {
                var $newLi = $li.clone(),
                    $a = $newLi.find(".choice");
                $a.text(i);
                $a.data('position', boardPosition);
                $ul.append($newLi);
            }
        }
    }

    function performMove(sockets) {
        $("body").on('click', '.choice', function(e) {
            e.preventDefault();
            var newValue = $(this).text(),
                position = $(this).data('position');
            $(".game-button[data-position=" + position + "]").text(newValue);
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
    var $otherPlayersBoard = $("#other-players-container");
    return {
        displayBoards: displayBoards,
        drawMove: drawMove
    };

    /**
     * Empties the other players boards if they already had content and populates them again
     * @param {Object} otherPlayers The other players boards
     */
    function displayBoards(otherPlayers) {
        if (debugGame && $otherPlayersBoard.children().length > 0) return;
        $otherPlayersBoard.empty();
        var $boardTemplate = $("#other-boards-template").find(".other-players-game").clone(),
            $playerTemplate = $boardTemplate.find(".other-players").detach();
        for (var player in otherPlayers) {
            if (otherPlayers.hasOwnProperty(player)) {
                $boardTemplate.append(_createPlayerBoard($playerTemplate, player, otherPlayers[player]));
            }
        }
        $otherPlayersBoard.append($boardTemplate);
    }

    function _createPlayerBoard($baseTemplate, playerName, playerBoard) {
        var $player = $baseTemplate.clone(),
            $playerRow = $player.find(".player-data");
        $playerRow[0].dataset.player = playerName;
        $playerRow.find(".name").text(playerName);
        var $valueTemplate = $playerRow.find(".value-box").detach();
        fillPlayerData();
        return $player;

        function fillPlayerData() {
            for (var j = 0; j < playerBoard.length; j++) {
                var $box = $valueTemplate.clone();
                $box.text(playerBoard[j]);
                $box[0].dataset.position = j;
                $playerRow.append($box);
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
        var $box = $("[data-player='" + player + "']").find("[data-position=" + position + "]"),
            intervalLapse = 400;
        $box.text(newValue);
        highlightBox(0);

        function highlightBox(index) {
            if (index < 2) {
                $box.addClass('updated');
                setTimeout(function() {
                    $box.removeClass('updated');
                    setTimeout(function() {
                        highlightBox(index + 1);
                    }, intervalLapse / 2);
                }, intervalLapse / 2);
            }
        }
    }
};