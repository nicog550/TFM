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
    scores: {
        pointsPerHit: 10,
        bonusOnCompletedWord: 20
    },
    //TODO: remove all these lines
    gameDuration: 2,
    gamePause: 600,
    players: 5,
    degree: 4,
    optionsCount: 4,
    rewiring: .5,
    wordLength: 10
};