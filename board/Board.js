
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
        this.loadSave(boardData);
      }else{
        this.grid = createEmptyGrid(6,4);
        this.visitedNodes = [];
        this.words = [];
        this.solutions = [];
        this.setupNeighbors(this.grid.length, this.grid[0].length);

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
        return this.visitedNodes[this.visitedNodes.length-1]
    }

    // checks if touch hits any of the nodes
    pointInNode(pos) {

    }

    // Checks if a line between two nodes already exists.
    // If two nodes are adjacent in visitedNodes a line exists.
    isPathOpen(curr, next){
      let prevNode
     
      const results = this.visitedNodes.filter((node,ndx) => {
        if(ndx === 0) {
          prevNode = node
        }
        else {
          if((curr === prevNode && next === node) || ((curr === node && next === prevNode) )) {
            // this path is closed!
            return true
          }
          prevNode = node
        }
      })

      if(results.length > 0) {
        return false
      }else{
        return true
      }
    }
    
    connect(nextNode, visitedNodes) { // core logic to rotate nodes. 
      this.visitedNodes = [...this.visitedNodes, nextNode]
      nextNode.fixed = true 

      if(!nextNode.special || nextNode.special==='booster') {
        nextNode.rotateLinked()
      } else if (nextNode.special === 'freezer'){
        nextNode.freezeLinks()

      } else if (nextNode.special === 'rotateCC') {
        this.grid.forEach((row) => row.forEach(node => {
          node.direction = 1
      }))
                nextNode.rotateLinked()
      }
    }

    visitNode(nextNode) {
      const curr = this.visitedNodes[this.visitedNodes.length-1]
      if(curr === nextNode) {//can't visit myself

        return null
      }
      if(this.isPathOpen(curr, nextNode)) {

        this.connect(nextNode);
        return {next: nextNode, prev: null}
      } 
      else {
        return {next: null, prev: nextNode}
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

      // if node is a freeze-node, and it is not in visitedNodes list a second time, 
      // remove a freeze from its links
      if(current.special == 'freezer'  ) {
        current.unFreezeLinks()
        
      } else if(current.special !== 'freezer') {  // don't reverse rotate linked nodes if node is a freeze

        current.rotateLinked(true) // reverse rotate

      } 
      const ccRemaining = this.visitedNodes.find(node=> node.special==='rotateCC')
      if(current.special === 'rotateCC' && !ccRemaining ){
        // change direction, after rotating
        this.grid.forEach((row) => row.forEach(node => {
          node.direction = -1
      }))        
      }
      const prev = this.visitedNodes[this.visitedNodes.length-1]
      

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
        node.rot = 0
      }))
      this.visitedNodes = [this.start]
      
      this.start.fixed = true
  
      this.grid.forEach((row) => row.forEach(node =>  {
          node.frozen = 0
          node.direction=-1}
          ))
    }

    /**
     * user requests hint. 
     * compare visitedNodes to solution. 
     * when visitedNodes[i] !== solution[i]. stop. 
     * remove all nodes after i from visitedNodes. Add solution[i] to visited nodes
     */
    hint(){
      let ndx = 0
      //const solution = this.solution.map(node=>node.toString()).join('\n')
      //const visitedNodes = this.visitedNodes.map(node=>node.toString()).join('\n')

      while(this.visitedNodes[ndx] === this.solution[ndx]) {
        ndx++
      }

      const removeCount = this.visitedNodes.filter((node, i)=> i>=ndx).length

      const nextNode = this.solution[ndx]

      return {removeCount, nextNode}

    }

    save(){
      //prevents cyclical refs
      const visitedNodes = this.visitedNodes.map(node=> compressGridPos(node.gridPos))
      const solutions = this.solutions.map(node=> compressGridPos(node.gridPos))
    
      return {
        grid:this.grid.map(row=>row.map(node => node.save())),
        start: this.start.gridPos,
        visitedNodes: visitedNodes,
        solutions: solutions,
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
  
  
      // now that we have proper refs to every node , unpack links
      this.grid.map(row => row.map(node => {
        node.links = node.links.map(gridPos => this.getNodeFromGridPos(gridPos));
  
      }));
      
      this.setupNeighbors(this.grid.length, this.grid[0].length);
  
      this.start = this.getNodeFromGridPos(savedBoard.start);

      this.visitedNodes = savedBoard.visitedNodes.map(rawGridPos => this.getNodeFromGridPos(unCompressGridPos(rawGridPos)));
      this.solutions = savedBoard.solutions.map(rawGridPos => this.getNodeFromGridPos(unCompressGridPos(rawGridPos)));
      
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