"use strict";
/**
 * Class responsible for the game logic
 */
var Game = function() {
    var debugGame = false,
        gameOver,
        main,
        otherPlayersBoard = this.otherUsers(debugGame),
        playerBoard = this.player(debugGame, _setPlayerConfig),
        playerConfig,
        sockets,
        waitingRoom;
    return {
        init: function(mainRef, socketsRef, gameOverRef, waitingRoomRef) {
            main = mainRef;
            sockets = socketsRef;
            gameOver = gameOverRef;
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
 */
Game.prototype.player = function(debugGame, setPlayerConfig) {
    var $gameBoardContainer = $("#own-game-container");
    return {
        drawBoard: drawBoard,
        performMove: performMove
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
            $button[0].dataset.background = boardValue;
            $button[0].dataset.position = boardPosition; //jQuery data() not working here...
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
                $a[0].dataset.background = i;
                $a[0].dataset.position = boardPosition; //jQuery data() not working here...
                $ul.append($newLi);
            }
        }
    }

    /**
     * Listens for a player clicking on a choice, updates the value at the corresponding box and sends the new value to
     * the other players
     * @param {object} sockets Instance of Sockets
     */
    function performMove(sockets) {
        $("body").on('click', '.choice', function(e) {
            e.preventDefault();
            var newValue = $(this).data('background'),
                position = $(this).data('position');
            setPlayerConfig(position, newValue);
            $(".game-button[data-position=" + position + "]")[0].dataset.background = newValue;
            sockets.newMove(position, parseInt(newValue));
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
        $playerRow[0].dataset.player = playerName;
        $player.find(".name").text(playerName);
        var $valueTemplate = $playerRow.find(".box").detach();
        fillPlayerData();
        return $player;

        function fillPlayerData() {
            for (var j = 0; j < playerBoard.length; j++) {
                var $box = $valueTemplate.clone();
                $box[0].dataset.background = playerBoard[j];
                $box[0].dataset.position = j;
                $playerRow.append($box);
            }

        }
    }

    /**
     * Displays the move another player has done
     * @param {string} player The player's name
     * @param {number|string} position The index of the changed value
     * @param {number|string} newValue The value that replaces the old one
     */
    function drawMove(player, position, newValue) {
        $("[data-player='" + player + "']").find("[data-position=" + position + "]")[0].dataset.background = newValue;
    }
};