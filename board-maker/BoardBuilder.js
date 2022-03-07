import Board from '../board/Board.js';
import {  rotateArray, randInt, rotateColors, logGridPos, gridPos}  from '../Utils.js'
import getCriteria from './Criteria.js';
//import solutionChecker from './SolutionChecker'
import pathFinder from './SolutionFinder'
import setupWords from './WordPlacer'


const randomizeColors = (colors) => {
    const ndxArr = colors.map((val, ndx) => ndx)
    return colors.map(() => {
        //pick a random index, take it out of list
        const randNdx = Math.floor(Math.random() * ndxArr.length)
        const colorsNdx = ndxArr[randNdx]
       
        ndxArr.splice(randNdx, 1)
        
        return colors[colorsNdx]
    })
}



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

const randomizeBoard = (board) => {
    for (let i = 0 ;i < board.grid.length; i++) {
        for (let j = 0; j < board.grid[0].length; j++) {
            const node = board.grid[i][j]
              node.colors = randomizeColors(node.colors)
            
        }
    }
}


// call after setupWords
const setupLinkedNeighbors = (board, criteria) => {
    const outcomes = [1,1,1,2,2,3,4]; // number of links. fewer links more likely
    const dist = makeRandomDistribution(criteria.directLinks, outcomes );
    
    let counter = 0;
    board.grid.forEach((row) => row.forEach(node => {

        const linkCount = getRandomElement(dist);

        if(linkCount) {
            Array.from({length:linkCount}, (v,i)=> {
                // if link isn't already in list, add random link
                addLink(node, node.neighbors[randInt(0, node.neighbors.length)]);

            });
            counter++;
        }
  
      }));


}

// adds otherNode to node.links if otherNode !=== node  and it's not already in the list
const addLink = (node, otherNode) => {
    if(node !== otherNode && !node.links.includes(otherNode)) {
        node.links = [...node.links, otherNode]
    }
}



const keepTrying = (tries, maxTries, pathLength,criteria) => {
    if(tries < maxTries) {
        return true;
    }
    if(pathLength < criteria.minPathLength) {
        return true;
    }else {
    return false;
    }
}

const setStart = (board) =>{ 

    const numRow  = board.grid.length;
    const numCol  =  board.grid[0].length
    const randGridPos = gridPos(numRow-1,randInt(0,numCol))
    board.start = board.grid[randGridPos.row][randGridPos.col]
    board.start.fixed = true
    board.visitedNodes = [board.start]
}

const buildBoard = (seedWords, difficulty) => {

    const t1 = Date.now()
    const board = new Board()
    
    const criteria = getCriteria(difficulty)


    //setupSpecialNodes(board, criteria);
   
   let realCount = 0
   const MaxTries = 50
   let shortestSolution = 0
   
   let bestBoard = null
   let pathLength = 0
   while( realCount < 1) {//keepTrying(realCount,MaxTries, pathLength, criteria)){
   

        //criteria.falsePathsRemaining = criteria.falsePaths;

        setStart(board)
        board.resetGrid()
        board.resetWords()
        randomizeBoard(board)

        setupWords(board,seedWords, criteria)

        //setupLinkedNeighbors(board, criteria);

        board.grid.forEach((row) => row.forEach(node => {
            node.usedInWord = false 
          }))

        for(let i= 0;i< board.words.length;i++) {    
            board.resetGrid()
   
            board.currentWord = board.words[i]
            console.log(`current word: ${board.currentWord.letters}`)

            board.steps = 0
            criteria.mode  = 'goto'
            criteria.finish = board.currentWord.nodes[0]
            const finished = pathFinder(board, criteria)
            if(!finished) {  // if we can't get a solution to a word try again
                console.log('NO SOLUTION')
                break;
            }
            board.words[i].solution = board.visitedNodes.map(node=>node)
            // lock in place 
            board.words[i].nodes.forEach(node=> node.usedInWord=true)

        }
        realCount++

   }

    board.resetGrid()


    const t2 = Date.now()

    //console.log(`\ntotal time to setup: ${t2- t1} milliseconds`);
   return board
}

export default buildBoard