"use strict";
/**
 * Class responsible for writing lines at the CSV logs
 * @constructor
 */
var Logger = function() {
    var fs = require('fs'),
        line,
        logFile = _createFileName();
    return {
        writeInitialWords: writeInitialWords,
        writeMove: writeGameLine
    };

    /**
     * Creates a filename for a new log
     * @returns {string}
     * @private
     */
    function _createFileName() {
        return 'gameLogs/' + _getDateTime() + '.csv';
    }

    /**
     * Returns the current datetime as yyyy-mm-dd hh:mm:ss
     * @returns {string}
     * @private
     */
    function _getDateTime() {
        var now = new Date();
        return now.getFullYear() + '-' + _zeroPad(now.getMonth() + 1) + '-' + _zeroPad(now.getDate()) + ' ' +
            _zeroPad(now.getHours()) + ':' + _zeroPad(now.getMinutes()) + ':' + _zeroPad(now.getSeconds());

        /**
         * Adds a leading zero to a number if it has only one digit
         * @param {number} integer The number to use
         * @returns {string}
         * @private
         */
        function _zeroPad(integer) {
            return (integer < 10 ? '0' : '') + integer.toString();
        }
    }

    /**
     * Logs the game word plus each player's initial word
     * @param {number|string} round The current round
     * @param {string} word The game word
     * @param {Array} playersWords The initial words of all players
     */
    function writeInitialWords(round, word, playersWords) {
        _writeColumnNames(true);
        writeGameLine(0, round, word);
        playersWords.forEach(function(current) { writeGameLine(current.userId, round, current.board); });
        _writeColumnNames(false);
    }

    /**
     * Writes the column headers
     * @param {boolean} initial Whether the headers correspond to the initial configurations or to moves made by players
     * @private
     */
    function _writeColumnNames(initial) {
        fs.appendFileSync(logFile,
            ['Game ' + (initial ? 'initial code' : 'play') + ' line#',
                'userID', 'round', 'actiontime', 'word'].join(',') + "\n"
        );
        line = 0;
    }

    /**
     * Logs a row
     * @param {number|string} userId The player's ID
     * @param {number|string} round The current round
     * @param {Array} word The word to be logged
     */
    function writeGameLine(userId, round, word) {
        fs.appendFileSync(logFile, ([++line, userId, round, _getDateTime()].concat(word)).join(',') + '\n');
    }
};

module.exports = new Logger();