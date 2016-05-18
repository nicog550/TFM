"use strict";
/**
 * Class responsible for drawing the current player's board
 * @param {boolean} debugGame Game mode: debug or not
 * @param {function} setPlayerConfig Reference to the setter of the playerConfig variable
 * @param {jQuery} $otherPlayersBoard The container of the other players boards
 */
var PlayerBoard = function(debugGame, setPlayerConfig, $otherPlayersBoard) {
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
     * @param {string} myName The player's name
     */
    function drawBoard(board, options, myName) {
        if (debugGame && $gameBoardContainer.children().length > 0) return;
        $gameBoardContainer.empty();
        var $boardTemplate = $("#board-template").find(".own-game").clone(),
            $rowTemplate = $boardTemplate.find(".game-board"),
            $boxTemplate = $rowTemplate.find(".box").detach();
        $boardTemplate.find(".name").text(myName);
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
            $gameBoardContainer.find(".game-button[data-position=" + position + "]").attr('data-background', newValue);
            var $boxes = $gameBoardContainer.find(".game-button"),
                foundEmptyBox = false;
            for (var i = 0; i < $boxes.length; i++) {
                if ($($boxes[i]).attr('data-background') == '-1') {
                    foundEmptyBox = true;
                    break;
                }
            }
            if (!foundEmptyBox) $(".submit-move").removeClass('disabled').removeAttr('disabled');
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