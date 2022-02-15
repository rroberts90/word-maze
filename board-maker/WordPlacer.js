import { rotateArray, randInt, rotateColors, logGridPos, gridPos } from '../Utils.js'
import Word from '../board/Word'

const MaxWordPackTries = 10

class WordPackError extends Error {
    constructor(message) {
        super(message)
        this.name = 'WordPackError'
    }
}

const addLinks = (board) => {
  
    const { alphabet } = createAlphabet()

    const alphabetDict = {}
    alphabet.forEach(letter => alphabetDict[letter] = [])


    // first pass fill frequency dict
    for (let i = 0; i < board.grid.length; i++) {
        for (let j = 0; j < board.grid[0].length; j++) {
            const node = board.grid[i][j]
            if (node.symbol) {

                alphabetDict[node.symbol] = [...alphabetDict[node.symbol], node]
            }

        }
    }

    for (let i = 0; i < board.grid.length; i++) {
        for (let j = 0; j < board.grid[0].length; j++) {
            // add links to node
            const node = board.grid[i][j]
            if(node.symbol) { 
            node.links = alphabetDict[node.symbol].filter(otherNode => node !== otherNode)
            }

        }
    }
}

// returns array and dict
const createAlphabet = () => {
    // 97 for lower case
    const characterCodes = Array.from(Array(26)).map((e, i) => i + 65)
    const alphabet = characterCodes.map((x) => String.fromCharCode(x))

    const alphabetDict = {}
    alphabet.forEach(letter => alphabetDict[letter] = [])

    return { alphabet, alphabetDict }
}

// adds letters to all unfixed nodes
// TODO: pick from frequency table
const fillWithLetters = (board) => {
    const { alphabet } = createAlphabet()

    for (let i = 0; i < board.grid.length; i++) {
        for (let j = 0; j < board.grid[0].length; j++) {
            const node = board.grid[i][j]
            if (!node.fixed || board.start === node) {
                const ndx = randInt(0, alphabet.length)
                const letter = alphabet[ndx]
                node.symbol = letter
            }
        }
    }
}

const getStart = (board, previousStarts, word) => {
    const possibleStarts = [];

    for (let i = 0; i < board.grid.length; i++) {
        for (let j = 0; j < board.grid[0].length; j++) {
            const node = board.grid[i][j]

            // node hasn't been checked yet
            if (!previousStarts.find(oldStartNode => node === oldStartNode)) {

                if (isCandidate(node, word[0])) {
                    possibleStarts.push(node)
                }
            }
        }
    }

    if (possibleStarts.length == 0) {
        return null // nowhere to put word. 
    } else {

        return possibleStarts[randInt(0, possibleStarts.length)]
    }
}

const addSeedWords = (board, seedWords) => {
    // idea: recusive algorithm wanders around & does its thing
    // what is its thing, you ask? 

    // start with longest word. 
    const sortedWords = seedWords.sort((word1, word2) => word2.length - word1.length).map(word=> word.toUpperCase())

    /* bop around the grid. start at random unfixed node
     if there is no way to fit the word into a candidate square
     (this will occur when all neighbors have fixed letters that do not match the next letter in word)
     reject and go back look for new candidate square.
     if all squares have been checked, get new start position.
     if all start positions have been checked, throw error 
     
     notes: can pack more words in faster if we try to use fixed squares with matching letters.
     * similiar recursive algorith to pathFinder, make sure to resit fixed nodes. using same property for both
     * use visitedNodes to store progress, reset after each word. this should work? it's possible that it will over pack and words will be unreachable.
     */
    placeWords(board, sortedWords, 0)

}

// throws WordPackError up if words don't fit in board
//call resetGrid at begining to keep node.fixed changes in place.
const placeWords = (board, seedWords, tries) => {
    try {
        board.resetGrid();
        board.words = [];
        for (let i = 0; i < seedWords.length; i++) {
            placeWord(board, seedWords[i])
        }

    } catch (err) {
        if (err instanceof WordPackError) {
            console.log('Couldn\'t fit words')
            if (tries < MaxWordPackTries) {
                placeWords(board, seedWords, tries++)
            } else {
                throw err
            }
        } else {
            throw err
        }
    }
}

const placeWord = (board, word) => {
    const previousStarts = []
    let placed = false

    while (!placed) {
        const start = getStart(board, previousStarts, word)

        if (start === null) {
            throw new WordPackError(`could not find starting node for word ${word}`)
        }

        previousStarts.push(start)
        board.visitedNodes = [start]
        placed = placeLetters(board, word)

    }

    // ok to get here word has to be placed or WordPackError would have thrown already
    // copy of visited nodes array. visited nodes as we create words contains just nodes comprising current word
    const nodes = board.visitedNodes.map(node => node)
    // don't know solution yet so pass [] to wordObj
    const wordObj = new Word(word, nodes, [])
    board.words.push(wordObj)
    
    // mark nodes
    nodes.forEach(node=> node.usedInWord = true)

}

// nodes are candidates if they are not fixed or are fixed and have a matching letter
const isCandidate = (node, letter) => {
    if (node.fixed && letter === node.symbol) {
        return true
    }
    else if (!node.fixed) { // open space
        return true
    } else {
        return false
    }
}

// // returns true if node is in the nodes list of one of the board already placed worded
// const nodeIsFixed = (board, node) => { 
//   //  !board.words.map(word => word.nodes).reduce((r, arr) => [...r, ...arr]).includes(current)
//   if(board.words.length === 0){ 
//       return false; // anything goes nothing added yet
//   }else{
//       const includes = board.words.map(word => word.nodes).reduce((r, arr) => [...r, ...arr]).includes(node)


//   }
// }

const placeLetters = (board, remainingLetters) => {
    const { visitedNodes } = board
    console.log(`\n`)
   
    const current = visitedNodes[visitedNodes.length - 1]

    logGridPos('current',current.gridPos )
    console.log(`remaining letters: ${remainingLetters}`)
    current.symbol = remainingLetters[0]
    current.fixed = true

    if (remainingLetters.length > 1) {


        let candidates = current.neighbors.filter(neighbor => isCandidate(neighbor, remainingLetters[1]))

        while (candidates.length > 0) {
            const candidate = candidates[randInt(0, candidates.length)]
            board.visitedNodes = [...visitedNodes, candidate]
            const isGoodCandidate = placeLetters(board, remainingLetters.slice(1))
            if (isGoodCandidate) {
                return true
            } else {
                candidates = candidates.filter(node => node !== candidate)

            }
        }

        // all candidates have been exhusted. Nowhere to put all letters in word from this position.

        // if node isn't part of previous words set fixed to false. 
        // it should be a candidate to be overwritten

        
        if (!current.usedInWord) {
            logGridPos('remove node', current.gridPos)
            console.log(`   letter: ${current.symbol}`)
            current.symbol = null
            current.fixed = false
        }
        visitedNodes.pop()

        return false
    } else if (remainingLetters.length === 1) {
        //base case. no more need to select candidates
        return true
    }else{
        throw Error('idk what is going on here. ngl')
    }

}

const logWordPositions = (board) => {
    board.words.forEach(word=> {
        console.log(word.letters)
        word.nodes.forEach(node=> {
            logGridPos(node.symbol || 'no letter', node.gridPos)
        })
        console.log('\n')
    })
}

const setupWords = (board, seedWords, criteria) => {

    addSeedWords(board, seedWords)


    fillWithLetters(board)

    logWordPositions(board)

    addLinks(board)

}





export default setupWords