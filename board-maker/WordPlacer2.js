import { rotateArray, randInt, rotateLetters, logGridPos, gridPos, makeWeightedList } from '../Utils.js'
import Word from '../board/Word'
import { pickWord } from './WordPicker'
import tightfit from './TightFitter.js'
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


const addWord = (board, minLength, maxLength, mode) => {
    const length = randInt(minLength, maxLength)

    if(mode === 'tightfit') {
       // console.log(`adding tight fit word length: ${length}`)
    }

    let placed = false
    board.currentStringNdx = 0

    let tries = 0
    const MaxTries = 20
    const nodesTried = []
    while (!placed && tries < MaxTries) {
        const start = getPlaceholderStart(board, mode)


        start.useCount++ 

        board.userStrings[0] = [start]

        // randomly find a series of nodes to put a word in
        const added = addPlaceholderLetters(board, length, mode)
        if(mode === 'tightfit') {
           // logGridPos('tight fit start: ', start.gridPos)
          //  console.log(`   addPlaceholder returned true?: ${added}`)
        }
        if (added) {

            const word = pickWord(board.userStrings[0])
            
            if (word) {
                board.placeWord(word, board.userStrings[0])
                placed = true
            } else {
                // do it again.
                start.useCount--
                tries++
               // console.log('   could not place word at attempt')
               removePlaceholderLetters(board,board.userStrings[0])
            }
        } else {
            // do it again
            start.useCount--
            tries++
            removePlaceholderLetters(board,board.userStrings[0])

        }


    }

    if (placed) {
        return true
    } else {
        return false
    }
}




const getPlaceholderStart = (board, mode) => {
    let possibleStarts = [];
    for(let i = 0; i < board.grid.length; i++) {
        for(let j = 0; j < board.grid[0].length; j++) {
            const node = board.grid[i][j]

            if (node.paths.length < 4) {
                if (mode !== 'tightfit') {
                    possibleStarts.push(node)
                }
                else {

                    if(!node.symbol || node.neighbors.find(neighbor=> !neighbor.symbol)) {
                        possibleStarts.push(node)

                    }

                }
            }

        }
    }
    return possibleStarts[randInt(0, possibleStarts.length - 1)]
    //                possibleStarts.push({item: node, freq: score })

   // const weightedStartList = makeWeightedList(possibleStarts)
       //const output = weightedStartList.map(obj=> obj.item.toString()).join('\n')
        //w
        //console.log(weightedStartList.map(obj=> `${obj.freq}`).join('\n'))
      //  console.log(weightedStartList[0])
        //console.log('-----------')
    
   // return weightedStartList[randInt(0, weightedStartList.length - 1)]
}

const removePlaceholderLetters = (board, nodes) => {
    nodes.forEach((node,i)=> {
        if(i < nodes.length-1) {
            node.disconnect(nodes[i+1])
        }
    })
}
const addPlaceholderLetters = (board, numLettersRemaining, mode) => {
   
    if (numLettersRemaining === 1) { // base case
        return true
    }

    const current = board.getCurrentNode()

    // logGridPos('current', current.gridPos)
    // console.log(`numLettersRemaining: ${numLettersRemaining}`)

    let candidates = current.getOpenNeighbors()

    const emptyCandidates = current.getOpenNeighbors().filter(neighbor=> !neighbor.symbol)
    let weightedCandidates = [...candidates, ...emptyCandidates ] 
   
    if(mode === 'tightfit' && emptyCandidates.length > 0) {
        
        weightedCandidates = emptyCandidates
    }

    while (weightedCandidates.length > 0) {
        const candidate = weightedCandidates[randInt(0, weightedCandidates.length)]

        current.connect(candidate)
        board.userStrings[0].push(candidate)
        const isGoodCandidate = addPlaceholderLetters(board, numLettersRemaining - 1, mode)

        if (isGoodCandidate) {
            return true
        } else {
            current.disconnect(candidate)
            board.userStrings[0].pop()
            weightedCandidates = weightedCandidates.filter(node => node !== candidate)
        }
    }
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

    let minLength = 6
    let maxLength = 9

    const strict = 'tightfit'

    for(let i = 0; i< 80;i++) {
        addWord(board, minLength, maxLength)
    }
    minLength = 4
    maxLength = 6

    for(let i = 0; i< 100;i++) {
        addWord(board, minLength, maxLength)
    }

    minLength = 3
    maxLength = 4

    for(let i = 0; i< 100;i++) {
        addWord(board, minLength, maxLength)
    }

    //tightfit(board)

    logWordPositions(board)

}


export default setupWords

// 

// for(let i = 0; i < board.grid.length; i++) {
//     for(let j = 0; j < board.grid[0].length; j++) {
//             const current = board.grid[i][j]
//             logGridPos('current: ', current.gridPos)
//             console.log(`     ${current.getOpenNeighbors().length}`)
//     }
// }