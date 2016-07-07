"use strict";
/**
 * Class responsible for drawing the other players boards
 * @param {boolean} debugGame Game mode: debug or not
 * @constructor
 */
var OtherPlayersBoard = function(debugGame) {
    var $otherPlayersBoard = $("#other-players-container");
    return {
        getBoard: function() { return $otherPlayersBoard; },
        displayBoards: displayBoards,
        drawMove: drawMove,
        hideInitialWords: hideInitialWords
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

    function hideInitialWords() {
        $otherPlayersBoard.find('.box').attr('data-background', '-1');
    }
};