import {  rotateArray, randInt, rotateColors, logGridPos}  from '../Utils.js'
import solutionChecker from './SolutionChecker'

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

// rotates nextNode initial color position until computed(current) position is a match 
// between curr and nextNode.
const rotateUntilMatched = (curr, nextNode) => {
    
    while(!curr.isMatch(nextNode)) {
        nextNode.colors = rotateArray(nextNode.colors, 1)
    }
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
   
}

// adds otherNode to node.links if otherNode !=== node  and it's not already in the list
const addLink = (node, otherNode) => {
    if(node !== otherNode && !node.links.includes(otherNode) && !otherNode.links.includes(node)) {
        node.links = [...node.links, otherNode]
    }
}

// call after setupWords
const setupLinkedNeighbors = (board, criteria) => {
    const outcomes = [1,1,1,2,2,3,4] // number of links. fewer links more likely
    const dist = makeRandomDistribution(criteria.directLinks, outcomes )
    
    let counter = 0
    board.grid.forEach((row) => row.forEach(node => {

        const linkCount = getRandomElement(dist)

        if(linkCount) {
            Array.from({length:linkCount}, (v,i)=> {
                // if link isn't already in list, add random link
                addLink(node, node.neighbors[randInt(0, node.neighbors.length)])

            })
            counter++
        }
  
      }))


}

const neighboring = (row, col, node)=> {
    if(node.gridPos.row === row && node.gridPos.col === col){
        return true
    }
    return node.neighbors.find(neighbor=> neighbor.gridPos.row === row && neighbor.gridPos.col === col)

}

// returns a random node !== to board.finish or its neighbors
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

const keepTrying = (solution, pathLength, criteria) => {
    if(solution > criteria.maxLength) {
        return true
    }
    if(solution < criteria.minLength){
        return true
    }
    if(criteria.minLength > 12 && pathLength < solution * 1.75) { // if we're beyond easy levels make the maze harder
        return true
    }
    return false
}

/**
 * Pathing rules: 
 * visit any neighboring node (left/right/ below/above)
 * only can form path with matching node (same colors)
 * can revisit nodes UNLESS if path exists from a > b then 
 * path a > b is closed. and vice versa.
 */
const setupGrid = (board, criteria) => {
    board.solution = []

    const t1 = Date.now()
   
    setupWords(board, criteria)
    setupLinkedNeighbors(board, criteria)
    setupSpecialNodes(board, criteria)
   
    mismatchLastNodes(board)

   let realCount = 0
   const MaxTries = 10
   let shortestSolution = 0
   let pathLength = 0
  while(keepTrying(shortestSolution, pathLength, criteria) && realCount < MaxTries){
        randomizeBoard(board)
        criteria.falsePathsRemaining = criteria.falsePaths
        pathFinder(board, criteria)

        if(board.visitedNodes.length>6 && board.visitedNodes[board.visitedNodes.length-1] === board.finish){

          // copy visited nodes and save it as solution 
          board.solution = board.visitedNodes.map(node=> node)
          board.finalColor = rotateColors(board.finish.colors, board.finish.rot)[0]
          const {minLength, total} = solutionChecker(board)
          shortestSolution = minLength
          pathLength = total
        
        
           board.shortestSolution = shortestSolution
           board.pathLength = pathLength
          if(shortestSolution > 0){
              realCount++
          }
        }
        board.resetGrid()
   }

    
    //setupFalsePaths(board, criteria)
    const {uniques, total, minLength} = solutionChecker(board)
    board.resetGrid()

    const t2 = Date.now()

   /* console.log(`Level:${board.level} \ntotal time to setup: ${t2- t1} milliseconds`)
   console.log(`Solution Length: ${minLength}`)
   console.log(`Took ${realCount} tries to create path\nUnique visits: ${uniques} \nTotal Path Length: ${total}\n-----------`)
*/
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

/**
 * Returns an array of nodes adjacent to curr.
 * Nodes will be randomly selected from array. Nodes that 
 * the criteria dictate should be more likely to visit 
 * eg nodes closer to finish, nodes fixed in position to create loops, etc
 * @param {Node} curr 
 * @param {*} criteria 
 * @param {Node} finish
 * @returns 
 */
const selectCandidates = (curr, criteria, finish, visitedNodes, solution) => {
    let candidates //= [...curr.neighbors]
    let extras = []

    const closestRow = Math.sign(finish.gridPos.row - curr.gridPos.row) + curr.gridPos.row 
    const closestCol = Math.sign(finish.gridPos.col - curr.gridPos.col ) + curr.gridPos.col
    
    candidates = curr.neighbors.map(node => {

        // more likely to visit these nodes.
        if(criteria && visitedNodes.length < criteria.minLength ) {

            if(node.gridPos.row < curr || (node.gridPos === curr.gridPos && curr.gridPos.row !== finish.gridPos.row)) {
                extras = [...extras, node, node, node, node, node, node]

            }
            if(node.gridPos.row !== closestRow && node.gridPos.col !== closestCol) {
                extras = [...extras, node, node, node, node, node, node]
            }               

        }

        return node


    })
    

    if(criteria && criteria.circles ) {
        const fixedNeighbors = curr.neighbors.filter(node=> node.fixed)
        if(criteria.circles === 2){

            extras = [...fixedNeighbors, ...fixedNeighbors, ...fixedNeighbors, ...fixedNeighbors]
        }else {
            extras = [ ...fixedNeighbors]

        }
    }

    candidates = [...candidates, ...extras]
    // if on false path filter for finish 

    if(criteria && criteria.onFalsePath) {
       candidates = candidates.filter(node=> 
        {     
            if (node === finish || node.isNeighbor(finish)) {
                return false
            }else{
                return true
            }
        })
        
    }
    return candidates
}

const mismatchLastNodes = (board) => {
    board.finish.neighbors.map(neighbor=> {
        if(neighbor.isMatch(board.finish)) {
            const tmpColor1 = neighbor.colors[0]
            const tmpColor2 = neighbor.colors[1]
            neighbor.colors[0] = neighbor.colors[2]
            neighbor.colors[1] = neighbor.colors[3]
            neighbor.colors[2] = tmpColor1
            neighbor.colors[3] = tmpColor2
        }
    })
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
const pathFinder = (board, criteria) => {
    let { visitedNodes, finish } = board
    let curr = visitedNodes[visitedNodes.length - 1]

    if (curr === finish) { // we are done here

        return true
    }

    const createFalsePath = shouldStartFalsePath(visitedNodes, criteria)
    if(createFalsePath) {
        criteria.onFalsePath = true
        criteria.falsePathsRemaining--

        //logGridPos('------\nstart of false path', curr.gridPos)
        criteria.falsePathLength =  randInt(criteria.maxFalsePathLength/2, criteria.maxFalsePathLength+1) +1
        //console.log(`falsePath Length: ${criteria.falsePathLength}`)
        criteria.steps = 0
    }

    else if(criteria && criteria.onFalsePath) {
        criteria.steps++
        if(criteria.steps > criteria.falsePathLength) {
            // go back
            Array.from({length:criteria.steps-1}, ()=> board.removeLast())
            curr = visitedNodes[visitedNodes.length-1]
            //logGridPos('returned to start of false Path', curr.gridPos)
            criteria.onFalsePath = false
            //console.log('-------')
        }
    }


        let candidates = selectCandidates(curr, criteria, finish, visitedNodes, board.solution)
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
                else if (!candidate.fixed && candidate.frozen == 0 && !board.solution.find(node=> node===candidate)) {

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

export default setupGrid   