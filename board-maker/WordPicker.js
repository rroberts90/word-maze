/**
 * 
 */

import dict1 from '../dictionary/10000.json'
import { randInt } from '../Utils'

const getDictionary = (name, length) =>{
        if(length === 2) {
                return twoLetterList
        }
        if(!name || name === '10000' ){ 
                return dict1
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


/**
 * returns a random word or null
 * @param {
 * dictionary: optional.  default-4000
 * length: required
 * fixedLetters: optional. array format [{letter: chr, position: int(0-length-1) }]
 * sameLetters: optional. format [[sameLetterPos1,sameLetterPos2], [sameLetterPos1,sameLetterPos2]]
 * 
 * } options 
 * 
 */
 const pickWord = (path) => {
        
        const fixedLetters = path.map((node, i) => {
                return { letter: node.symbol, position: i }
            }).filter(obj => obj.letter)

        const sameLetters = findReusedNodes(path)
 
        const dict = getDictionary('10000', path.length)

        // get all words of right length
        const pool = dict1.words.filter(word=> word.length === path.length)

        if(fixedLetters) {
                const filteredPool = getWordsThatFit(pool, fixedLetters, sameLetters)
                return pickRandomWord(filteredPool)
        }else{
           return pickRandomWord(pool)
        }


        
}

const getWordsThatFit =(pool, fixedLetters, sameLetters) => {
        const filteredPool = pool.filter(word=> { // filter for words with fixed letters

                const checked = fixedLetters
                .filter(letterObj => word[letterObj.position] === letterObj.letter)

                if(checked.length === fixedLetters.length){
                        return true
                }else {
                        return false
                }
        })
        .filter(word=> { // filter for words with the same letters in multiple positions
                const checked = sameLetters.filter(letterArr=> word[letterArr[0]] === word[letterArr[1]])

                if(checked.length === sameLetters.length) {
                        return true
                }else{
                        return false
                }
                
        })
        return filteredPool
}

const pickRandomWord = (words) => {
        if (words.length > 0) {
                return words[randInt(0, words.length)]
        } else {
                return null
        }
}

// hard coded bc we're going to use these a bunch. Also no offball rare two letter words. 
const twoLetterList = ["IN", 	"OF",
        "TO",	"IS",
        "IT",	"ON",
        "NO",	"US",
        "AT",
        "GO", "	AN",
        "MY",	"UP",
        "ME",	"AS",
        "HE",	"WE",
        "SO",	"BE",
        "BY",	"OR",
        "DO",	"IF" ,
        "HI",	
        "EX",	"OK", "GO"
]


// binary search 
const binarySearch = (arr, val) =>{
        let start = 0
        let end = arr.length - 1

        while (start <= end) {
                let mid = Math.floor((start + end) / 2)

                if (arr[mid] === val) {
                        return mid
                }

                if (val < arr[mid]) {
                        end = mid - 1
                } else {
                        start = mid + 1
                }
        }
        return -1
}
export {pickWord}