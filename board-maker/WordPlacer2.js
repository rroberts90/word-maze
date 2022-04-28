import { rotateArray, randInt, rotateLetters, logGridPos, gridPos } from '../Utils.js'
import Word from '../board/Word'
import {pickWord}  from './WordPicker'
const MaxWordPackTries = 10

const MinWordLength = 3
const MaxWordLength = 9

const addPlaceholderWord = (board )=> {
        // ok how many unfixed nodes are there?
        let count = 0;
        board.grid.map(row=> row.map(node=>{
            if(!node.fixed) {
                count++
            }
        }))
        const length = Math.min(randInt(MinWordLength, MaxWordLength+1), count)
    
        if(count === 1) { 
            throw new WordPackError('only 1 empty space. no implemented solution yet')
        }
    
        let placed = false
        const previousStarts = []
    
        while(!placed) {
            const start = getPlaceholderStart(board, previousStarts)
            previousStarts.push(start)
    
            addPlaceholderLetters(board, length)
        }
    
    
    }
    
    const getPlaceholderStart = (board, previousStarts) => {
        const possibleStarts = [];
    
        for (let i = 0; i < board.grid.length; i++) {
            for (let j = 0; j < board.grid[0].length; j++) {
                const node = board.grid[i][j]
    
                // node hasn't been checked yet
                if (!previousStarts.find(oldStartNode => node === oldStartNode)) {
    
                    if(node.hasUnfixedNeighbors()){
                        possibleStarts.push(node)
                    }
    
                }
            }
        }
    }
    
    const addPlaceholderLetters = (board, numLettersRemaining) => {
        
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
        const wordObj = new Word(word, nodes)
        board.words.push(wordObj)
        
    }
    

    const logWordPositions = (board) => {
        board.words.forEach(word=> {
            console.log(word.letters)
            word.nodes.forEach(node=> {
                logGridPos(node.symbol || 'no letter', node.gridPos)
            })
            //console.log('\n')
        })
    }
    
    const setupWords = (board, seedWords, criteria) => {

    
        addSeedWords(board, seedWords)
    
        logWordPositions(board)
    
    
    }
    
    
    
    

    
    export default setupWords