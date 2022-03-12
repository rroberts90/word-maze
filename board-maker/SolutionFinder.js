import {   randInt, rotateArray}  from '../Utils.js'

// rotates nextNode initial color position until computed(current) position is a match 
// between curr and nextNode.
const rotateUntilMatched = (curr, nextNode) => {
    
    while(!curr.isMatch(nextNode)) {
        nextNode.colors = rotateArray(nextNode.colors, 1)
    }
}

const neighboring = (row, col, node)=> {
    if(node.gridPos.row === row && node.gridPos.col === col){
        return true
    }
    return node.neighbors.find(neighbor=> neighbor.gridPos.row === row && neighbor.gridPos.col === col)

}

const isInGrid = (grid, row, col) => {
    if(row < 0 || col < 0){
        return false
    }
    else if(row >= grid.length || col >= grid[0].length) {
        return false
    }else{
        return true
    }
}

const visit = (board, visitedNodes, candidate, criteria) => {

    board.visitedNodes = [...visitedNodes, candidate]
    candidate.fixed = true
    if(candidate.special === 'freezer'){
        candidate.freezeLinks()

    }else {
        if(candidate.special === 'rotateCC') {
            board.grid.forEach((row) => row.forEach(node => {
                node.direction = 1
            }))

        }
        candidate.rotateLinked()
    }
    return pathFinder(board, criteria)
}

const selectCandidates = (curr, criteria, visitedNodes) => {
    let candidates //= [...curr.neighbors]
    let extras = []

    candidates = curr.neighbors.map(node => {
        return node
    })
    

    // if (criteria && criteria.circles) {
    //     const fixedNeighbors = curr.neighbors.filter(node => node.fixed)
    //     if (criteria.circles === 2) {

    //         extras = [...fixedNeighbors, ...fixedNeighbors, ...fixedNeighbors, ...fixedNeighbors]
    //     } else {
    //         extras = [...fixedNeighbors]

    //     }
    // }

    candidates = [...candidates, ...extras]
    // if on false path filter for finish 

    return candidates
}

const shouldStartFalsePath = (visitedNodes, criteria)=> {
    if(!criteria){
        return false
    }
    if(criteria.falsePathsRemaining  <=0 || criteria.onFalsePath) {
        return false
    }
    return randInt(1,3) === 1 ? true : false
  
}

// returns true if the pathing algorithm visited all the nodes in board's current word
const isWordPathed = (board) => {
    const {currentWord, visitedNodes}= board;
    if(visitedNodes.length < currentWord.letters.length) { 
        return false
    }

    for(let i = 0; i< currentWord.letters.length; i++){
        if(visitedNodes[visitedNodes.length - i - 1] !== currentWord.nodes[currentWord.nodes.length -1 - i]){
            return false
        }
    }
    return true
}

const pathFinder = (board, criteria) => {
    let { visitedNodes, finish, currentWord} = board
    let curr = visitedNodes[visitedNodes.length - 1]

    if (isWordPathed(board)) { // we are done here
        return true
    }

    // const createFalsePath = shouldStartFalsePath(visitedNodes, criteria)
    // if(createFalsePath) {
    //     criteria.onFalsePath = true
    //     criteria.falsePathsRemaining--

    //     //logGridPos('------\nstart of false path', curr.gridPos)
    //     criteria.falsePathLength =  randInt(criteria.maxFalsePathLength/2, criteria.maxFalsePathLength+1) +1
    //     //console.log(`falsePath Length: ${criteria.falsePathLength}`)
    //     criteria.steps = 0
    // }

    // else if(criteria && criteria.onFalsePath) {
    //     criteria.steps++
    //     if(criteria.steps > criteria.falsePathLength) {
    //         // go back
    //         Array.from({length:criteria.steps-1}, ()=> board.removeLast())
    //         curr = visitedNodes[visitedNodes.length-1]
    //         //logGridPos('returned to start of false Path', curr.gridPos)
    //         criteria.onFalsePath = false
    //         //console.log('-------')
    //     }
    // }


        let candidates = selectCandidates(curr, criteria,visitedNodes)
     
        // pick one neighbor to visit next
        while (candidates.length > 0) {
          
            const randomIndex = Math.floor(Math.random() * candidates.length)
            const candidate = candidates[randomIndex]
            if (board.isPathOpen(curr, candidate)) {

                // if candidate already matches, great. No need to meddle.
                if (curr.isMatch(candidate)) {

                    const isGoodCandidate = visit(board, visitedNodes, candidate, criteria)
                    if (!isGoodCandidate) {
                        candidates = candidates.filter(node => node !== candidate)
                    }
                    else {
                        return true
                    }
                }
                // the candidate can be mutated. Rotate the colors till it is a match
                else if (!candidate.fixed && candidate.frozen == 0 && !candidate.usedInWord) {

                    rotateUntilMatched(curr, candidate)

                    const isGoodCandidate = visit(board, visitedNodes, candidate, criteria)


                    if (!isGoodCandidate) {
                        candidates = candidates.filter(node => node !== candidate)
                    }
                    else {
                        return true
                    }
                }
                else { // the candidate can't be a match because it is fixed in place (on the path-algorithm's solution of the puzzle that is.)
                    candidates = candidates.filter(node => node !== candidate)
                }
            }
            else { // can't be a match bc path between node and candidate already exists
                candidates = candidates.filter(node => node !== candidate)
            }
        }
      
        // no candidates left and board not finished. 
        board.removeLast()
        return false
    
}

export default pathFinder   