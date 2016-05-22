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
        writeMove: writeMove
    };

    function _createFileName() {
        return 'gameLogs/' + _getDateTime() + '.csv';
    }

    function _getDateTime() {
        var now = new Date();
        return now.getFullYear() + '-' + _zeroPad(now.getMonth() + 1) + '-' + _zeroPad(now.getDate()) + ' ' +
            _zeroPad(now.getHours()) + ':' + _zeroPad(now.getMinutes()) + ':' + _zeroPad(now.getSeconds());

        function _zeroPad(integer) {
            return (integer < 10 ? '0' : '') + integer.toString();
        }
    }

    function writeInitialWords(round, word, playersWords) {
        _writeColumnNames(true);
        _writeGameLine(0, round, word);
        playersWords.forEach(function(current) { _writeGameLine(current.player, round, current.board); }); //TODO: use userID
        _writeColumnNames(false);
    }

    function writeMove(userID, round, word) {
        _writeGameLine(userID, round, word);
    }

    function _writeColumnNames(initial) {
        fs.appendFileSync(logFile,
            ['Game ' + (initial ? 'initial code' : 'play') + ' line#',
                'userID', 'round', 'actiontime', 'word'].join(',') + "\n"
        );
        line = 0;
    }

    function _writeGameLine(userID, round, word) {
        fs.appendFileSync(logFile, ([++line, userID, round, _getDateTime()].concat(word)).join(',') + '\n');
    }
};

module.exports = new Logger();