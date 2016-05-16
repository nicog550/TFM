/**
 * Simple object containing main constant values
 */
module.exports = {
    games: [
        /*
        GAME FORMAT: TODO: update it if it changes
         {
             gameDuration: 10, //Game duration (in seconds)
             gamePause: 1, //Waiting time between games (in seconds)
             players: 2,
             optionsCount: 4, //Number of different options for each box at the game
             wordLength: 10 //Length of the word at each game
         }
         */
        {
            gameDuration: 10,
            gamePause: 1,
            players: 2,
            optionsCount: 4,
            wordLength: 10
        },
        {
            gameDuration: 10,
            gamePause: 1,
            players: 2,
            optionsCount: 4,
            wordLength: 10
        },
        {
            gameDuration: 10,
            gamePause: 1,
            players: 2,
            optionsCount: 4,
            wordLength: 10
        }
    ],
    //TODO: remove all these lines
    gameDuration: 1,
    gamePause: 600,
    players: 5,
    degree: 4,
    optionsCount: 4,
    pointsPerHit: 10,
    rewiring: .5,
    wordLength: 10
};