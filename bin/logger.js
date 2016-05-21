"use strict";
/**
 * Class responsible for writing lines at the CSV logs
 * @constructor
 */
var Logger = function() {
    var converter = require('json2csv'),
        fs = require('fs'),
        fields = ['line', 'actiontime', 'userID', 'move'],
        line = 0,
        logFile = _createFileName();
    return {
        addMove: addMove
    };

    function _createFileName() {
        var today = new Date();
        return 'gameLogs/' + today.getFullYear() + '-' + _zeroPad(today.getMonth() + 1) + '-' +
                _zeroPad(today.getDate()) + '.csv';
    }

    function addMove(data) {
        _addLine(data);
    }

    function _addLine(data) {
        data['line'] = ++line;
        data['actiontime'] = getDateTime();
        converter({data: data, fields: fields}, function(err, csv) {
            if (err) console.log(err);
            fs.appendFileSync(logFile, csv);
        });
        
        function getDateTime() {
            var now = new Date();
            return now.getFullYear() + '-' + _zeroPad(now.getMonth() + 1) + '-' + _zeroPad(now.getDate()) + ' ' +
                _zeroPad(now.getHours()) + ':' + _zeroPad(now.getMinutes()) + ':' + _zeroPad(now.getSeconds());
        }
    }

    function _zeroPad(integer) {
        return (integer < 10 ? '0' : '') + integer.toString();
    }
};

module.exports = new Logger();