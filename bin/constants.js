/**
 * Simple object containing main constant values
 */
var gameDuration = 5000;
module.exports = {
    gameDuration: gameDuration, //Game duration in milliseconds
    gameFrequency: gameDuration * 2, //Frequency for the creation of new games
    minUsers: 2,
    maxUsers: 4,
    optionsCount: 4, //Number of different options for each box at the game
    wordLength: 5 //Length of the word at each game
};