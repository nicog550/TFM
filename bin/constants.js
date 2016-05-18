/**
 * Simple object containing main constant values
 */
module.exports = {
    games: [
        /*
        GAME FORMAT: TODO: update it if it changes
         {
             gameDuration: 10, //Game duration (in seconds)
             players: 2,
             optionsCount: 4, //Number of different options for each box at the game
             wordLength: 10 //Length of the word at each game
         }
         */
        {
            gameDuration: 10,
            players: 2,
            optionsCount: 4,
            wordLength: 10
        },
        {
            gameDuration: 10,
            players: 2,
            optionsCount: 4,
            wordLength: 10
        },
        {
            gameDuration: 10,
            players: 2,
            optionsCount: 4,
            wordLength: 10
        }
    ],
    intervalBetweenGames: 5,
    scores: {
        pointsPerHit: 10, //Points for each correct letter
        bonusOnCompletedWord: 20 //Bonus if the player guesses the whole word
    },
    //TODO: remove all these lines
    gameDuration: 5,
    players: 5,
    degree: 4,
    optionsCount: 4,
    rewiring: .5,
    wordLength: 10
};