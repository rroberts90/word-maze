
import {rotateColors, compressGridPos} from '../Utils.js'

const Default_Node_Width = 80

/**
* 
* @param {} props 
*/
class Node {

  constructor(gridPos, point, colors, links, direction,diameter, savedNode) {
    if(savedNode) {
      this.loadSave(savedNode)
    }
    else { 
      this.gridPos = gridPos
    this.pos = point
    this.colors = colors
    this.rot = 0
    this.neighbors = [] // Adjacent Nodes 
    this.diameter = diameter || Default_Node_Width
    this.links = links || [] // If this node is reached these nodes will rotate.
    this.direction = direction || -1 // rotation direction
    this.fixed = false // if node is in visited nodes list can't rotate
    this.symbol = null
    this.special = null
    this.frozen = 0
    }
  }


  // if the node is rotatable (not in the line's path) change colors + direction
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
      //console.log(`inside neighbor:`)
      //console.log(` ${neighbor.pos.x} ${neighbor.pos.y}`)

      const matchColor = this.isMatch(neighbor)
      if (neighbor && matchColor) {
        return { candidate: neighbor, matchColor: matchColor }
      }
    }
    return { candidate: null, matchColor: null }

  }

  isNeighbor(node) {
    return this.neighbors.find(neighbor => neighbor === node)
  }

  isMatch(node) {
    let match = null

    // get computed colors
    const compNodeRotatedColors = rotateColors(node.colors, node.rot)
    const myNodeRotatedColors = rotateColors(this.colors, this.rot)

    // node is a neighbor. must be above/below/left/right
    if (node.gridPos.row > this.gridPos.row) {
      // below current node. bottom == top
      match = compNodeRotatedColors[0] == myNodeRotatedColors[2] ? myNodeRotatedColors[2] : null
    }
    else if (node.gridPos.row < this.gridPos.row) {
      // above of current node. top == bottom
      match = compNodeRotatedColors[2] == myNodeRotatedColors[0] ? myNodeRotatedColors[0] : null
    }
    else if (node.gridPos.col > this.gridPos.col) {
      // right of current node. left == right
      match = compNodeRotatedColors[3] == myNodeRotatedColors[1] ? myNodeRotatedColors[1] : null
    }
    else if (node.gridPos.col < this.gridPos.col) {
      // left of current node. right == left
      match = compNodeRotatedColors[1] == myNodeRotatedColors[3] ? myNodeRotatedColors[3] : null
    }
    return match
  }

  save() {
    const links = this.links.map(node => compressGridPos(node.gridPos))
    //const neighbors = this.neighbors.map(node => compressGridPos(node.gridPos))

    const saved = {
      g: compressGridPos(this.gridPos),
      c: this.colors.map(color=>color.replace('rgba','')),
      l: links
    }

    if(this.symbol){
      saved['s'] =  this.symbol
    }
    if(this.special){
      saved['sp'] = this.special
    }
    if(this.fixed) {
      saved['f'] = this.fixed
    }
    if(this.direction != -1) {
      saved['d'] = this.direction
    }
    if(this.rot != 0) {
      saved['r'] = this.rot
    }
    return saved
  }
  
  loadSave(savedNode) {
    this.gridPos = MyMath.unCompressGridPos(savedNode.g);
  
    this.symbol = savedNode.s || null;
    this.colors = savedNode.c.map(rawColor=> 'rgba' + rawColor);
    this.special = savedNode.sp || null;
   

    if(savedNode.r && savedNode.r !== 0 ){
      throw Error('node saved with rotation');
    }
    this.rot = savedNode.r || 0;
    
    this.direction = savedNode.d || -1;
    this.fixed = savedNode.f || false;
   
    this.pos = MyMath.point(0,0);
    
    this.links = savedNode.l.map(link=> MyMath.unCompressGridPos(link));

  }


  freezeLinks(){ 
    this.links.forEach(linkedNode =>{
        if(linkedNode.symbol === this.symbol){
            linkedNode.frozen++
        }
    })

  }
  
  unFreezeLinks(){ 
    this.links.forEach(linkedNode =>{
        if(linkedNode.symbol === this.symbol){
            linkedNode.frozen--
        }
    })

  }


toString(){
  //return `Node: (row: ${this.gridPos.row}, col:${this.gridPos.col} )`
  return JSON.stringify({
    gridPos: this.gridPos,
    symbol: this.symbol,
    colors: this.colors,
    links: this.links.map(node => node.gridPos)

  })//{
  // gridPos: JSON.stringify(this.gridPos),
  //  links: JSON.stringify(this.links)



  //})
}
  }

export default Node