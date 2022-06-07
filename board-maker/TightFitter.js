import { logGridPos } from '../Utils'
import { pickWord } from './WordPicker'

/**
 * Goes through whole board for paths that are open and include non symboled node
 * Basic idea: cycle through every node. For every node, find all open paths that include 1+ open node.
 * Create List of all paths, sorted by length. 
 * Go through each path and try to place word. 
 * If word is placed remove all paths with open nodes from list.
 * @param {Board} board 
 */
 let allPaths = []

 /**
  * removes paths with 0 open nodes
  */
 const removeRedudantPaths = () => {
        return allPaths.filter(path=> path.filter(node=> !node.symbol).length>0)
 }

 /**
  *  removes paths where connections aren't open anymore
  */
 const removeBlockedPaths = () => {
         return allPaths.filter(path=> {
                 const allOpen = path.reduce((prev,curr)=> {
                         if (prev === false) {
                                 return false
                         }
                         else {
                                 if (prev.isPathOpen(curr)) {
                                         return c
                                 }
                                 else {
                                         return false
                                 }
                         }    
                 })
                 return allOpen

         })
 }

const logPath = (path) => {    
                const string = path.map(node=> `${node.gridPos.row} ${node.gridPos.col}`).join(', ')
                console.log(`length: ${path.length}`)
                console.log(`   ${string}`)
}
const tightfit = (board) => { 
        allPaths = []
        console.log(`Open nodes at tightfitstart: ${board.countEmptyNodes()}`)
        for(let i = 0; i < board.grid.length; i++) {
                for(let j = 0; j < board.grid[0].length; j++) {
                        const current = board.grid[i][j]
                        board.userStrings[0] = [current]
                        if(current.getOpenNeighbors().length > 0) { // node has no possible paths
                                getAllPaths(board, current)
                        }
                }
        }

        // now filter allPaths to exclude paths with no open nodes. we don't care about those 
        allPaths = removeRedudantPaths()
       
        allPaths.forEach(path=> {
                const string = path.map(node=> `${node.gridPos.row} ${node.gridPos.col}`).join(', ')
                console.log(string)
        })
        // ok now go through allPaths and try to insert words 
        // go until either there are no more open nodes or we run out of open paths.
        while (allPaths.length > 0 && board.countEmptyNodes() > 0 && false) {
                let wordPlaced = false
                for (path of allPaths) {
                        const word = pickWord(path)
                        if(word) {
                                board.placeWord(word, path)
                                break
                        }

                }
                if( wordPlaced){ // remove all paths that don't work anymore
                        allPaths = removeRedudantPaths()
                        allPaths = removeBlockedPaths()
                }
        }

        if(board.countEmptyNodes() > 0){
                return false
        }else {
                return true
        }
}

// allPaths should be sorted by path length in descending order
const insertPath = (path) => {
        let ndx = 0

        for(i = 0;i< allPaths.length; i++){
                if(path.length >= allPaths[0].length) {
                        ndx = i
                        break
                }
        }

        allPaths.splice(ndx,0,path)

}

const getAllPaths = (board, node) => { 
        if(board.userStrings[0].length > 1) { 
                insertPath(board.userStrings[0].map(node=> node))
        }

        logGridPos('current node', node.gridPos)
        const openNeighbors = node.getOpenNeighbors()
        if(openNeighbors.length === 0) { // base case
                console.log(    'no open neighbors')
                return 

        } else {
                logPath(node.neighbors)
                for(neighbor of openNeighbors) {
                        console.log('   connecting to neighbor')
                        logGridPos('    neighbor: ', neighbor.gridPos)
                        console.log('\n')
                        node.connect(neighbor)
                        board.userStrings[0].push(neighbor)
                        getAllPaths(board,neighbor)
                        node.disconnect(neighbor)
                        board.userStrings[0].pop()
                }
        }
}

export default tightfit