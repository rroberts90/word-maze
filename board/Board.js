
import {gridPos, randInt, point, compressGridPos,unCompressGridPos} from '../Utils'

import Globals from '../Globals'
import Node from './Node'
import Word from './Word'
const colorScheme = Globals.colorScheme;

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
        if(this.currentStringNdx >= 0) {
          const lastNodeNdx = this.userStrings[this.currentStringNdx].length-1
          return this.userStrings[this.currentStringNdx][lastNodeNdx]
        }else {
        return null
        }
    }
    

    // checks if touch hits any of the nodes
    pointInNode(pos) {

    }

    /**
     * Creates a path from currentNode to nextNode
     * Either add nextNode to currentString or creates new string.
     * Create new string if - currentNode is has 0 paths,
     * TODO add more logic
     * @param {Node} currentNode 
     * @param {Node} nextNode: neighbor of node
     * @returns {next: node if adding new node, prev: node if removing a node } null: no visiting possible 
     */
    visitNode(currentNode, nextNode) {

      if(curr === nextNode) {//can't visit myself

        throw new Error('node can not visit itself')
      }

      // if path is open we're connecting, closed we're deleting
      if(currentNode.isPathOpen(nextNode)) {
          // is this the start of a new string? 
              // no paths on currentNode
              // 2 connections on current node part of different userString
              // the previous string is also a complete word.
          // is this a continuation of a current string? 
            // 1 > paths to node 
            // either end of a userString connected to currentNode
            // if multiple strings qualify to continue, pick one most likely to be word NOTE: UNSURE ON THIS EDGE CASE
      }else {
        // path is closed unless we're removing nodes from a userString
        // check if currentNode and nextNode are on same userString
            // check if currentNode and nextNode are at either end of string
              // horray! we can do an undo
          // else : return null nothing to be done
            
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
  
    while(this.visitedNodes.length > 1){
      this.removeLast()
    }
    this.resetGrid()

    }

    resetGrid() {
      this.grid.forEach((row) => row.forEach(node => {
        node.fixed = false 
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