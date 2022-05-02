import { rotateArray, randInt, rotateLetters, logGridPos, gridPos } from '../Utils.js'
import Word from '../board/Word'
import { pickWord } from './WordPicker'
const MaxWordPackTries = 10

const MinWordLength = 3
const MaxWordLength = 9

/**
 * Outline:
 *  - add words
 * 
 *  - 'loose fit' stage: get open spaces, find words that fit. 
 *    Start with longer words here. Start at any space 
 *  - add 'PACK' coefficient: likelyhood reusing nodes.
 *  
 * - 'tight fit' stage: want to check all availble paths with open nodes to fill board up.
 *  - Get list of all available paths including open spaces. 
 *   - Get list of all words that fit open paths.
 *  - find list of >1 words that a) cover all open nodes and b) do not overlap on paths
 */

const LoosePack = .5
const TightPack = .2


const addWord = (board) => {
    console.log('Adding Placeholder Word')

    // ok how many unfixed nodes are there?
    let count = 0;
    board.grid.map(row => row.map(node => {
        if (node.getOpenNeighbors().length < 4) {
            count++
        }
    }))

    const length = randInt(5, 9)
    let placed = false
    board.currentStringNdx = 0

    let tries = 0
    const MaxTries = 10
    // try 10 times then give up 
    while (!placed && tries < MaxTries) {
        const start = getPlaceholderStart(board)

        start.useCount++ // rn useCount is only incremented in .connect

        board.userStrings[0] = [start]

        // randomly find a series of nodes to put a word in
        addPlaceholderLetters(board, length)

        if(board.userStrings[0].length === length) {
        const fixedLetters = board.userStrings[0].map((node, i) => {
            return { letter: node.symbol, position: i }
        }).filter(obj => obj.letter)

        const sameLetters = findReusedNodes(board.userStrings[0])
        const word = pickWord({ sameLetters, length, fixedLetters })

        console.log(`picked word: ${word}`)
        if(word) {
            console.log(`Word Length: ${word.length} Nodes Length: ${board.userStrings[0].length}`)
            placeWord(word, board.userStrings[0], board)
            placed = true
        } else {
            // do it again.
            start.useCount--
            tries++
        }
    }else {
        // do it again
        start.useCount--
        tries++
    }


    }

    if (placed) {
        return true
    } else {
        return false
    }




}

const findReusedNodes = (nodes) => {
    const dict = {}
    nodes.forEach(node => {
        dict[`${node.gridPos.row}${node.gridPos.col}`] = { count: 0, stringPosList: [] }
    })
    nodes.forEach((node, i) => {
        dict[`${node.gridPos.row}${node.gridPos.col}`].count++
        dict[`${node.gridPos.row}${node.gridPos.col}`].stringPosList.push(i)
    })
    return Object.entries(dict).filter(arr => arr[1].count > 1).map(arr => arr[1].stringPosList)

}

const placeWord = (word, nodes,board) => {
    if (word.length !== nodes.length) {
        throw new Error(`different # ofletters and nodes\nWord Length: ${word.length} Nodes Length: ${nodes.length}\nNodes: ${nodes.map(node => `${node.gridPos.row}-${node.gridPos.col}`).join(' ')}`)
    }else {
        console.log('no error')
    }

    nodes.forEach((node, i) => {
        const letter = word[i]
        node.symbol = letter

    })
    board.words.push(new Word(word, nodes))
    console.log('placed word')
}

const getPlaceholderStart = (board) => {
    const possibleStarts = [];

    for (let i = 0; i < board.grid.length; i++) {
        for (let j = 0; j < board.grid[0].length; j++) {
            const node = board.grid[i][j]

            if (node.paths.length < 4) {
                possibleStarts.push(node)
            }

        }
    }
    return possibleStarts[randInt(0, possibleStarts.length - 1)]
}

const addPlaceholderLetters = (board, numLettersRemaining) => {
    if (numLettersRemaining === 1) { // base case
        return true
    }

    const { userStrings } = board

    const current = board.getCurrentNode()

    logGridPos('current', current.gridPos)
    console.log(`numLettersRemaining: ${numLettersRemaining}`)

    let candidates = current.getOpenNeighbors()

    while (candidates.length > 0) {
        const candidate = candidates[randInt(0, candidates.length)]

        current.connect(candidate)
        board.userStrings[0].push(candidate)
        const isGoodCandidate = addPlaceholderLetters(board, numLettersRemaining - 1)

        if (isGoodCandidate) {
            return true
        } else {
            current.disconnect(candidate)
            board.userStrings[0].pop()
            candidates = candidates.filter(node => node !== candidate)
        }
    }
    console.log('nowhere to go')
    return false

}

const logWordPositions = (board) => {
    board.words.forEach(word => {
        console.log(word.letters)
        word.nodes.forEach(node => {
            logGridPos(node.symbol || 'no letter', node.gridPos)
        })
        //console.log('\n')
    })
}

const setupWords = (board, criteria) => {

    addWord(board)
    addWord(board)
    addWord(board)
    addWord(board)

    logWordPositions(board)

}






export default setupWords