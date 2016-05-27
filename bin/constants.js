/**
 * Simple object containing main constant values
 */
module.exports = {
    games: [
        /*
        GAME FORMAT:
         {
             duration: number, //Duration of the game (in seconds)
             degree: number, //Number of connections of each player
             options: number, //Number of different options for each box at the game
             rewiring: number, //Rewiring probability
             wordLength: number //Length of the word at each game
         }
         */
        {
            duration: 3,
            degree: 4,
            options: 4,
            rewiring: .5,
            wordLength: 10
        },
        {
            duration: 5,
            degree: 4,
            options: 4,
            rewiring: .5,
            wordLength: 10
        },
        {
            duration: 20,
            degree: 4,
            options: 4,
            rewiring: .5,
            wordLength: 10
        }
    ],
    intervalBetweenGames: 3, //Time lapse between a game ends and the following one starts (in seconds),
    players: 5, //Number of players needed for the game
    scores: {
        pointsPerHit: 10, //Points for each correct letter
        bonusOnCompletedWord: 20 //Bonus if the player guesses the whole word
    }
};