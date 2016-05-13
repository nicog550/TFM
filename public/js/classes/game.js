"use strict";
/**
 * Class responsible for the game logic
 */
var Game = function() {
    var debugGame = false,
        gameOver,
        main,
        otherPlayersBoard = this.otherUsers(debugGame),
        playerBoard = this.player(debugGame, _setPlayerConfig, otherPlayersBoard.getBoard()),
        playerConfig,
        sockets,
        waitingRoom;
    return {
        init: function(mainRef, socketsRef, gameOverRef, waitingRoomRef) {
            main = mainRef;
            sockets = socketsRef;
            gameOver = gameOverRef;
            waitingRoom = waitingRoomRef;
            playerBoard.listenToMoves(sockets);
            gameOver.init(main, socketsRef);
        },
        debug: function() { return debugGame; },
        selector: "game-screen",
        drawMove: otherPlayersBoard.drawMove,
        finishGame: finishGame,
        startGame: startGame
    };

    /**
     * Prepares the game over screen and switches to it
     * @param {number} waitingTime The amount of time until the next game starts
     * @returns {Array} The player's final game configuration
     */
    function finishGame(waitingTime) {
        if (debugGame) return [];
        gameOver.setup(waitingTime);
        main.toggleScreen(gameOver);
        return playerConfig;
    }

    /**
     * Setter
     * @protected
     */
    function _setPlayerConfig(index, value) {
        playerConfig[index] = parseInt(value);
    }

    /**
     * Displays the current player's board as well as the ones of the other players and starts the game countdown
     * @param {array} board The initial configuration for the current player
     * @param {number} duration The game duration
     * @param {number} options The number of different choices available at the board for the player
     * @param {object} otherPlayers The initial configuration for each of the other players
     */
    function startGame(board, duration, options, otherPlayers) {
        playerConfig = board;
        playerBoard.drawBoard(board, options);
        otherPlayersBoard.displayBoards(otherPlayers);
        main.toggleScreen(this);
        main.displayCountdown(duration, $("#game-time"));
    }
};

/**
 * Class responsible for drawing the current player's board
 * @param {boolean} debugGame Game mode: debug or not
 * @param {function} setPlayerConfig Reference to the setter of the playerConfig variable
 * @param {jQuery} $otherPlayersBoard The container of the other players boards
 */
Game.prototype.player = function(debugGame, setPlayerConfig, $otherPlayersBoard) {
    var $gameBoardContainer = $("#own-game-container");
    return {
        drawBoard: drawBoard,
        listenToMoves: function(sockets) {
            performMove();
            submitMove(sockets);
        }
    };

    /**
     * Empties the board if it already had content and populates it again
     * @param {Array} board The values for the player's board (initial configuration)
     * @param {number} options The number of different choices available at the board for the player
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

    /**
     * Creates the list of choices for the player
     * @param {jQuery} $baseTemplate The template for creating a box with value plus the available choices
     * @param {number} boardValue The value for the current box
     * @param {number} boardPosition The position of the current box at the board
     * @param {number} options The number of different choices available at the board for the player
     * @returns {jQuery}
     * @private
     */
    function _createDropdown($baseTemplate, boardValue, boardPosition, options) {
        var $template = $baseTemplate.clone(true);
        createButton();
        createList();
        return $template;

        /**
         * Creates a box to be placed at the board
         */
        function createButton() {
            var $button = $template.find("button");
            $button.attr('data-background', boardValue);
            $button.attr('data-position', boardPosition);
        }

        /**
         * Creates the list of available options for the player to be placed at the board after every button
         */
        function createList() {
            var $ul = $template.find(".dropdown-menu"),
                $li = $ul.find(".dropdown-option").detach();
            for (var i = 0; i < options; i++) {
                var $newLi = $li.clone(),
                    $a = $newLi.find(".choice");
                $a.attr('data-background', i);
                $a.attr('data-position', boardPosition);
                $ul.append($newLi);
            }
        }
    }

    /**
     * Listens for a player clicking on a choice and updates the value at the corresponding box
     */
    function performMove() {
        $("body").on('click', '.choice', function(e) {
            e.preventDefault();
            var newValue = $(this).data('background'),
                position = $(this).data('position');
            setPlayerConfig(position, newValue);
            $(".game-button[data-position=" + position + "]").attr('data-background', newValue);
        });
    }

    /**
     * Submits the player's board to the other players
     * @param {object} sockets Instance of Sockets
     */
    function submitMove(sockets) {
        $("body").on('click', '.submit-move', function(e) {
            e.preventDefault();
            var board = [];
            $gameBoardContainer.find(".game-button").each(function() {
                board.push([$(this).attr('data-position'), parseInt($(this).attr('data-background'))]);
            });
            sockets.newMove(board);
            $otherPlayersBoard.find(".box.transparent").removeClass('transparent'); //Show the other players boards
        });
    }
};

/**
 * Class responsible for drawing the other players boards
 * @param {boolean} debugGame Game mode: debug or not
 */
Game.prototype.otherUsers = function(debugGame) {
    var $otherPlayersBoard = $("#other-players-container");
    return {
        getBoard: function() { return $otherPlayersBoard; },
        displayBoards: displayBoards,
        drawMove: drawMove
    };

    /**
     * Empties the other players boards if they already had content and populates them again
     * @param {object} otherPlayers The other players boards
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

    /**
     * Creates a board for one of the other players
     * @param {jQuery} $baseTemplate The template to be used for drawing the board
     * @param {string} playerName The name of the player
     * @param {Array} playerBoard The board of the player
     * @returns {jQuery}
     * @private
     */
    function _createPlayerBoard($baseTemplate, playerName, playerBoard) {
        var $player = $baseTemplate.clone(),
            $playerRow = $player.find(".player-data");
        $playerRow.attr('data-player', playerName);
        $player.find(".name").text(playerName);
        var $valueTemplate = $playerRow.find(".box").detach();
        fillPlayerData();
        return $player;

        function fillPlayerData() {
            for (var j = 0; j < playerBoard.length; j++) {
                var $box = $valueTemplate.clone();
                $box.attr('data-background', playerBoard[j]);
                $box.attr('data-position', j);
                $playerRow.append($box);
            }

        }
    }

    /**
     * Displays the move another player has done
     * @param {string} player The player's name
     * @param {Array} board The player's full board
     */
    function drawMove(player, board) {
        var $playerBoard = $("[data-player='" + player + "']");
        board.forEach(function(element) {
            $playerBoard.find("[data-position=" + element[0] + "]").attr('data-background', element[1]);
        });
    }
};