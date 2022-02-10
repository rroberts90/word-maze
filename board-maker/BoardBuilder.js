import Board from '../board/board.js';
import {  rotateArray, randInt, rotateColors, logGridPos, randInt, gridPos}  from '../Utils.js'
import getCriteria from './criteria.js';
//import solutionChecker from './SolutionChecker'
import pathFinder from './SolutionFinder'


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
            if (board.start !== node) {
                node.colors = randomizeColors(node.colors)
            }
        }
    }
}

const setupWords = (board, criteria) => {
   // dummy pass
   const characterCodes = Array.from(Array(26)).map((e, i) => i + 97);
   const alphabet = characterCodes.map((x) => String.fromCharCode(x));

   const alphabetDict = {}
   alphabet.forEach(letter=> alphabetDict[letter] = []);

   for(let i =0;i< board.grid.length;i++){
       for(let j = 0;j < board.grid[0].length;j++){
           const ndx = randInt(0, alphabet.length);
           const letter = alphabet[ndx]
           board.grid[i][j].symbol = letter;
            alphabetDict[letter] = [...alphabetDict[letter], board.grid[i][j]];

       }
   }

   // add links

   for(let i =0;i< board.grid.length;i++){
    for(let j = 0;j < board.grid[0].length;j++){
        // add links to node
        const node = board.grid[i][j];
        node.links = alphabetDict[node.symbol].filter(otherNode=> node !== otherNode );

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
        return false;
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

}

const buildBoard = (seedWords, difficulty) => {

    const t1 = Date.now();
    const board = new Board();
    
    const criteria = getCriteria(difficulty);
    setStart(board);
    setupWords(board, criteria);

    setupLinkedNeighbors(board, criteria);
    //setupSpecialNodes(board, criteria);
   
   let realCount = 0;
   const MaxTries = 50;
   let shortestSolution = 0;
   
   let bestBoard = null;
   let pathLength = 0;
   while(keepTrying(realCount,MaxTries, pathLength, criteria) && false){
        if(realCount % 10 === 0 ){
            randomizeBoard(board);
         }

        criteria.falsePathsRemaining = criteria.falsePaths;
       // pathFinder(board, criteria);

   }

    board.resetGrid();

    const t2 = Date.now();

    console.log(`\ntotal time to setup: ${t2- t1} milliseconds`);
   console.log(`Took ${realCount} tries to create path\nSolution Length: ${board.solution.length} \nTotal Path Length: ${board.totalPathLength}\n-----------`);
   return board;
}

export default buildBoard;