import Board from '../board/Board.js';
import {  rotateArray, randInt, rotateLetters, logGridPos, gridPos}  from '../Utils.js'
import getCriteria from './Criteria.js';
//import solutionChecker from './SolutionChecker'
import pathFinder from './SolutionFinder'
import setupWords from './WordPlacer2'


// returns an array where  if a random element is chosen,
// there is is chance% that element will be a randomly selected element of outcomes
// or null
const makeRandomDistribution = (chance, outcomes) => {
    const numOutcomes = Math.floor(chance * 100)
    const numNonOutcomes = Math.floor((1-chance) * 100)
    
    const outcomesDist = Array.from({length: numOutcomes}, (v,i)=> {
        const randomOutcome = outcomes[randInt(0, outcomes.length)]
        return randomOutcome
    })

    const nonOutcomesDist = Array.from({length: numNonOutcomes},(v,i)=> null)
    
    return [...outcomesDist, ...nonOutcomesDist]
}

const getRandomElement = (randomDist) => {
    return randomDist[randInt(0,randomDist.length-1)]
}



const buildBoard = (difficulty) => {
        const t1 = Date.now()
    const board = new Board()
    const criteria = getCriteria(difficulty)

    setupWords(board, criteria)
    const t2 = Date.now()
    console.info(`\ntotal time to setup: ${t2- t1} milliseconds`)
    return board
}

export default buildBoard