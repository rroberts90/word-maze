
import * as Utils from '../Utils.js'
import Globals from '../Globals.js';
const Default_Node_Width = 0

const colorScheme = Globals.colorScheme;

class Node {

  constructor(savedNode) {
    if (savedNode) {
      this.loadSave(savedNode)
    }
    else {
      this.gridPos = Utils.gridPos(0, 0)
      this.pos = Utils.point(0, 0)
      this.rot = 0
      this.neighbors = [] // Adjacent Nodes 
      this.diameter = Default_Node_Width
      this.links = [] // If this node is reached these nodes will rotate.
      this.direction =  -1 // rotation direction
      this.fixed = false // if node is in visited nodes list can't rotate
      this.symbol = null
      this.frozen = 0

      this.usedInWord = [false,false,false,false]
    }
  }


  // if the node is rotatable (not in the line's path) change rotation + direction
  rotate(reverse) {
    const direction = reverse ? -this.direction : this.direction
    if (!this.fixed && this.frozen == 0) {
      this.rot += direction
    }
  }

  rotateLinked(reverse) {
    this.links.forEach(node => node.rotate(reverse))
  }


  // determines if point is inside of neighbor node and is also a match.
  // returns the matching node or null
  matchPoint(point) {
    const neighbor = this.insideNeighbor(point)
    if (neighbor) {

        return neighbor
      
    }
    else {
      return null
    }

  }

  insideNeighbor(point) {
    return this.neighbors.find(neighbor => Utils.pointPastCircle(point, this, neighbor));
  }

  isNeighbor(node) {
    return this.neighbors.find(neighbor => neighbor === node)
  }

  addLetter(node) {

    // get computed letters
    const matchNodeRotatedLetters = Utils.rotateLetters(node.letters, node.rot)

    if (node.gridPos.row > this.gridPos.row) {
      // below current node.
      return matchNodeRotatedLetters[0]
    }
    else if (node.gridPos.row < this.gridPos.row) {
      // above of current node. 
      return matchNodeRotatedLetters[2]
    }
    else if (node.gridPos.col > this.gridPos.col) {
      // right of current node. 
      return matchNodeRotatedLetters[3]
    }
    else if (node.gridPos.col < this.gridPos.col) {
      // left of current node. 
      return matchNodeRotatedLetters[4]
     }
    else {
      throw Error('No neighbor found')
    }
  }

  save() {
    const links = this.links.map(node => Utils.compressGridPos(node.gridPos))
    //const neighbors = this.neighbors.map(node => compressGridPos(node.gridPos))

    const saved = {
      g: Utils.compressGridPos(this.gridPos),
      lt: this.letters.map,
      l: links
    }

    if (this.symbol) {
      saved['s'] = this.symbol
    }
    if (this.special) {
      saved['sp'] = this.special
    }
    if (this.fixed) {
      saved['f'] = this.fixed
    }
    if (this.direction != -1) {
      saved['d'] = this.direction
    }
    if (this.rot != 0) {
      saved['r'] = this.rot
    }
    return saved
  }

  loadSave(savedNode) {
    this.gridPos = Utils.unCompressGridPos(savedNode.g);

    this.symbol = savedNode.s || null;
    this.special = savedNode.sp || null;


    if (savedNode.r && savedNode.r !== 0) {
      throw Error('node saved with rotation');
    }
    this.rot = savedNode.r || 0;

    this.direction = savedNode.d || -1;
    this.fixed = savedNode.f || false;

    this.pos = Utils.point(0, 0);

    this.links = savedNode.l.map(link => Utils.unCompressGridPos(link));

  }

  toString() {
    //return `Node: (row: ${this.gridPos.row}, col:${this.gridPos.col} )`
    return JSON.stringify({
      gridPos: this.gridPos,
      symbol: this.symbol,
      links: this.links.map(node => node.gridPos)

    })
  }
}

export default Node