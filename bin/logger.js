"use strict";
/**
 * Class responsible for writing lines at the CSV logs
 * @constructor
 */
var Logger = function() {
    var fs = require('fs'),
        line,
        logFile;
    return {
        startGame: startGame,
        logAbandonment: logAbandonment,
        logMove: writeGameLine
    };

    /**
     * Logs the game settings and the game word plus each player's initial word
     * @param {number|string} round The current round
     * @param {string} word The game word
     * @param {Array} playersWords The initial words of all players
     * @param {string|number} players The number of players
     * @param {string|number} degree The small-world connection degree
     * @param {string|number} rewiring The rewiring probability
     * @param {string|number} letters The number of different letters
     * @param {string|number} wordLength The length of the word
     * @param {string|number} shownLetters The amount of letters shown to each player
     * @param {string|number} duration The duration of the game
     */
    function startGame(round, word, playersWords, players, degree, rewiring, letters, wordLength, shownLetters,
                       duration) {
        logFile = _createFileName(round);
        _writeGameParameters(players, degree, rewiring, letters, wordLength, shownLetters, duration);
        _writeColumnNames(true);
        writeGameLine(0, round, word);
        playersWords.forEach(function(current) { writeGameLine(current.userId, round, current.board); });
        _writeColumnNames(false);
        _logConnections(round, playersWords);
    }

    /**
     * Creates a filename for a new log
     * @param {string|number} round The current round
     * @returns {string}
     * @private
     */
    function _createFileName(round) {
        return 'gameLogs/' + _getDateTime() + ' - Round ' + round + '.csv';
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
     * Logs the game settings
     * @param {string|number} players The number of players
     * @param {string|number} degree The small-world connection degree
     * @param {string|number} rewiring The rewiring probability
     * @param {string|number} letters The number of different letters
     * @param {string|number} wordLength The length of the word
     * @param {string|number} shownLetters The amount of letters shown to each player
     * @param {string|number} duration The duration of the game
     * @private
     */
    function _writeGameParameters(players, degree, rewiring, letters, wordLength, shownLetters, duration) {
        fs.appendFileSync(logFile,
            ['Game setup: line#', 'Players', 'deg', 'pr', '#ofLetters', 'WordLength', '#LettersShown', 'SecondsOfGame']
                .join(',') + "\n" +
            [1, players, degree, rewiring, letters, wordLength, shownLetters, duration].join(',') + "\n");
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

    /**
     * Logs the connections between players in a separate log file
     * @param {string|number} round The current round
     * @param {Array} playersWords The initial words of all players
     * @private
     */
    function _logConnections(round, playersWords) {
        var csvContent = 'userID,round,connections\n';
        playersWords.forEach(function(current) {
            csvContent += ([current.userId, round].concat(current.connections)).join(',') + '\n';
        });
        fs.appendFileSync(logFile.replace('.', ': connections.'), csvContent);
    }

    /**
     * Logs the moment in which a player abandons the game
     * @param {string|number} round The current round
     * @param {string|number} userId The player's ID
     */
    function logAbandonment(round, userId) {
        fs.appendFileSync(logFile.replace('.', ': abandonments.'),
                          'userID,round,actiontime\n' + [userId, round, _getDateTime()].join(',') + '\n');
    }
};

module.exports = new Logger();