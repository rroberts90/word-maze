
import {gridPos, randInt, point, compressGridPos,unCompressGridPos} from '../Utils'

import Globals from '../Globals'
import Node from './Node'
import Word from './Word'

const colorScheme = Globals.colorScheme

const twoNodesAreAdjacentOnSamePath = (path,current,next) => {

  // goes through list looking for adjacent nodes
  const result = path.reduce((r,c,i)=> {
    if(r.result === 'adjacent'){
      return r
    } 
    else if(r === current && c === next)
    {
      return {result: 'adjacent', currentIndex: i-1, nextIndex: i  }
    }
    else if(r === next && c === current)
    {
      return {result: 'adjacent', currentIndex: i, nextIndex: i-1 }
    } 
    else{
      return c
  }})

  if(result.result === 'adjacent') {
    return result
  }else {
    return {}
  }

}

const getColors = (colorSet) => {
  return Object.entries(colorSet).map((arr)=> arr[1])
}

const createEmptyGrid = (numRow, numCol) =>{ 
    const grid = [] 
    let x
    let y
    for (let i = 0;i < numRow; i++) { 
      grid[i] = [] 
      for (let j = 0;j < numCol; j++) { 
        grid[i][j] = new Node() 
        grid[i][j].gridPos = gridPos(i,j)

      } 
    } 
    return grid
  }


const isInBounds = (gridPos, numRow, numCol) => {

    if(gridPos.row < 0 || gridPos.row > numRow-1 || 
        gridPos.col < 0 || gridPos.col > numCol-1 ) {
            return false
        }
    else {
        return true
    }
}





// returns a 2d array. 
//Each element contains a list of the row/col positions of neighboring nodes. 
const getAllNeighbors = (numRow, numCol)  => {

    const grid = []
    for(let i = 0; i <numRow; i++) {
        grid[i] = []
        for(let j = 0; j< numCol; j++) {
            const potentials = [gridPos( i,j+1), //right
              gridPos( i,j-1), //left
              gridPos( i-1,j), // bottom
              gridPos(i+1,j)]// top
            grid[i][j] =  potentials.filter(neighbor => isInBounds(neighbor, numRow, numCol))
        }
    }

    return grid
}

  class Board {

    constructor(boardData) {
      
      if (boardData) {
        this.loadSave(boardData)

      }else{
        this.grid = createEmptyGrid(6,4)
       
        this.words = [] // the solution
        this.userStrings = [] // users current board
        this.currentStringNdx = -1 // ndx of string user is adding nodes to
        this.currentNode = null //
        this.setupNeighbors(this.grid.length, this.grid[0].length)

      }

    }
    
    setupNeighbors(numRow, numCol){
        const neighborGridPosArray2d = getAllNeighbors(numRow, numCol)
        
        this.grid.forEach((row,i)=> row.forEach((node,j)=> node.neighbors = this.getNodesFromGridPosArr(neighborGridPosArray2d[i][j])))
    }

    /**
    * Takes a list of node coordinaes in grid and returns a list of node objects
    * @param {[]} gridPosArr 
    */
    getNodesFromGridPosArr(gridPosArr) {
        return gridPosArr.map(gridPos => this.grid[gridPos.row][gridPos.col])
    }

     getCurrentNode(){
    
       if (this.currentStringNdx >= 0) {

         const lastNodeNdx = this.userStrings[this.currentStringNdx].length - 1
        
         return this.userStrings[this.currentStringNdx][lastNodeNdx]
       }
       else {

         return null
       }
    }
    

    // checks if touch hits any of the nodes
    pointInNode(pos) {

    }

    addUserString(node){
      const userString = [node]
      this.userStrings.push(userString)
      return userString
    }

    /**
     * Returns Array of userStrings containing all nodes enumerated in params
     * @param {[Node]} nodes
     */ 
    findUserStrings(nodes) {
      return this.userStrings.filter(path=> 
        nodes.every(node=> path.includes(node)))
    }


    /**
     * Returns userString where node1 and node2 are on string and are adjacent 
     * @param {Node} node1
     * @param {Node} node2
     */ 
     findUserStringWithAdjacentNodes(node1, node2) {
       // there should only be 1 userstring bc we can't have more than 1 path between nodes
       // if there are 2+ strings with same connection there is a problem
      return this.userStrings.find(path=> twoNodesAreAdjacentOnSamePath(path,node1,node2).result === 'adjacent')
    }


  


    /**
     * Creates/removes path from currentNode to nextNode
     * Either add nextNode to currentString or creates new string.
     * @param {Node} currentNode 
     * @param {Node} nextNode: neighbor of node
     * @returns {next: node if adding new node, prev: node if removing a node } 
     */
    visitNode(currentNode, nextNode) {

      if(currentNode === nextNode) {//can't visit myself

        throw new Error('node cannot visit itself')
      }

      // if path is open we're connecting, closed we're deleting
      if(currentNode.isPathOpen(nextNode)) {
        
        // new userString
          if(currentNode.paths.length === 0 || currentNode.paths.length > 1) { 
            const currentString = this.addUserString(currentNode)
            currentNode.connect(nextNode)
          
            currentString.push(nextNode)
            this.currentStringNdx = this.userStrings.length -1
            this.currentNode = nextNode

          }
          else{ // continue current string

            // here currentNode should be part of only 1 user string
            const currentString = this.findUserStrings([currentNode])[0]
            this.currentStringNdx = this.userStrings.indexOf(currentString)
            
            if(!currentString){
              throw new Error('User String Not Found')
            }

            currentNode.connect(nextNode)

            currentString.push(nextNode)

            this.currentNode = nextNode
          }
          return {next: nextNode, prev: null}

      }else {
        // path is closed unless we're removing nodes from a userString

        // check if currentNode and nextNode are connected and adjacent
        const currentString = this.userStrings[this.currentStringNdx]
        const adjacentNodesResult = twoNodesAreAdjacentOnSamePath(currentString,currentNode,nextNode)
    
        if(adjacentNodesResult.result === 'adjacent') {
           currentNode.disconnect(nextNode)
           currentString.splice(adjacentNodesResult.currentIndex,1) 
           console.log('removed node from currentString')
           //TODO: implement splitting userString if user severs list in half 
           return {next: null, prev: nextNode}        
        }

          return {next: null, prev: null}
      }
    }

    removeLast(){
      if(this.visitedNodes.length <= 1){
        return null
      }
      const current = this.visitedNodes.pop()
  
      // if current is not in visited list a second time,
      const isStillThere = this.visitedNodes.find(node=> node === current)
      current.fixed = (isStillThere) ? true : false

      return prev

    }
 
    restart(){

    this.resetGrid()

    }

    resetGrid() {
      this.grid.forEach((row) => row.forEach(node => {
        node.fixed = false 
        node.paths = []
      }))
    
      this.userStrings = []
    }

    resetWords() {
      this.grid.forEach((row) => row.forEach(node => {
        node.usedInWord = [false, false, false,false] 
      }))

      this.words = []
      this.currentWord = null
    }

    hint(){

    }
    
    countEmptyNodes() {
      const nodes =  this.grid.reduce((flat, row) => [...flat, ...row])

      return nodes.filter(node=> !node.symbol).length
    }

    placeWord(word, nodes) {
        if (word.length !== nodes.length) {
            throw new Error(`different # ofletters and nodes\nWord Length: ${word.length} Nodes Length: ${nodes.length}\nNodes: ${nodes.map(node => `${node.gridPos.row}-${node.gridPos.col}`).join(' ')}`)
        }
        nodes.forEach((node, i) => {
          const letter = word[i]

            if(node.symbol && node.symbol !== letter) {
              throw new Error(`Cannot overwrite letter with different letter`)
            }
            node.symbol = letter

            if(i < nodes.length-1) { // connect the nodes
              node.connect(nodes[i+1])
            }
    
        })
        this.words.push(new Word(word, nodes))
    
    }
    save(){
      //prevents cyclical refs
      //const userStrings = this.u.map(node=> compressGridPos(node.gridPos))
    
      return {
        grid:this.grid.map(row=>row.map(node => node.save())),
        words: this.words,
        pathLength: this.pathLength
      
      }

    }
    async loadSave(savedBoard) {

      this.grid = savedBoard.grid.map(row => row.map(savedNode => {
        return null;
      }));

      this.grid = savedBoard.grid.map(row => row.map(savedNode => {
        const node = new Node(); //  load save fills  empty node
        node.loadSave(savedNode);
        return node;
      }));
  

    
      this.setupNeighbors(this.grid.length, this.grid[0].length);
  

      //this.visitedNodes = savedBoard.visitedNodes.map(rawGridPos => this.getNodeFromGridPos(unCompressGridPos(rawGridPos)));
      
    }
  
  
     saveVisitedNodes (){ 
       //TODO: rewrite because the old way caused rendering bugs
       // saves visited Nodes in local storage
      
         /*console.log(`saveVisitedNodes: ${this.visitedNodes.length}`);
        getItem('levelProgress').then(levelProgress=> {
          
          const updatedProgress = levelProgress.map(level=> level);
          updatedProgress[this.puzzleNumber-1].visitedNodes = this.visitedNodes.map(node=> node.gridPos);

          storeItem('levelProgress',updatedProgress);
    
        });
      */
    }
    
    getNodeFromGridPos(gridPos) {
      return this.grid[gridPos.row][gridPos.col]
    }

    toString(){
      const nodes =  this.grid.reduce((flat, row) => [...flat, ...row])
      return nodes.map(node=>node.toString()).join(' ')

    }

}

  export default Board