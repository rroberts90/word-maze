
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
      this.neighbors = [] // Adjacent Nodes 
      this.diameter = Default_Node_Width
      this.links = [] // If this node is reached these nodes will rotate.
      this.fixed = false // if node is in visited nodes list can't rotate
      this.symbol = null
      this.paths = [] // list of neighbors where a path has been created a<=>b
      this.useCount = 0 // number of times node has been visited by word or string. 
    }
  }

  /**
   * 
   * @param {Node} node 
   * @returns {Boolean} true if no path exists from this <=> node
   */
  isPathOpen(node) {
    return this.paths.indexOf(node) === -1
  }

  /**
   * 
   * @returns {Array}  neighbors where no path exists from this <=> node
   */
  getOpenNeighbors() {
    return this.neighbors.filter(neighbor => this.paths.indexOf(neighbor) === -1)
  }

  connect(node){
    if(this.isPathOpen(node)) {
      node.useCount++
      this.paths.push(node)
      node.paths.push(this)
    }
  }

  disconnect(node) {
    const ndx1 = this.paths.indexOf(node)
    const ndx2 = node.paths.indexOf(this)
    if(ndx1 >= 0 && ndx2 >=0) {
      node.useCount--
      this.paths.splice(ndx1,1)
      node.paths.splice(ndx2,1)
    }else{
      throw new Error('could not find path to delete. Node.paths not synced')
    }
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