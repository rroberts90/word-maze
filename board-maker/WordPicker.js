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
/**
 * returns a random word or null
 * @param {
 * dictionary: optional.  default-4000
 * length: required
 * fixedLetters: optional. array format [{letter: chr, position: int(0-length-1) }]
 * 
 * } options 
 * 
 */
 const pickWord = (options) => {

        if(!options.length){
                throw Error(`Word Length Not Specified`)
        }
        if(options.length === 1) {
                return null
        } 
 
        const dict = getDictionary(options.dictionary, options.length)

        // get all words of right length
        const pool = dict1.words.filter(word=> word.length === options.length)

        if(options.fixedLetters) {
                const filteredPool = getWordsThatFit(pool, options.fixedLetters)
                return pickRandomWord(filteredPool)
        }else{
           return pickRandomWord(pool)
        }


        
}

const getWordsThatFit =(pool, fixedLetters) => {
        const filteredPool = pool.filter(word=> {

                const checked = fixedLetters
                .filter(letterObj => word[letterObj.position] === letterObj.letter)

                if(checked.length === fixedLetters.length){
                        return true
                }else {
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
const twoLetterList = ["in", 	"of",
        "to",	"is",
        "it",	"on",
        "no",	"us",
        "at",	"un",
        "go", "	an",
        "my",	"up",
        "me",	"as",
        "he",	"we",
        "so",	"be",
        "by",	"or",
        "do",	"if" ,
        "hi",	
        "ex",	"ok",
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