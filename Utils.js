const gridPos = (row, col) => {
    return {
      row:row, 
      col:col
    }
}

const point = (x,y) => {
    return {
      x:x,
      y:y
    }
}
const toDegrees = (angle) => {
  return angle * (180 / Math.PI)
}

/**
 * 
 * @param {*} point 
 * @param {*} topLeft 
 * @param {*} diameter 
 * @returns 
 */
 const pointInCircle = (point, topLeft, diameter) => {
    return pic(point, centerOnNode(topLeft, diameter), diameter/2)
}
// inside circle if distance^2 < radius^2
const pic = (point, center,r ) => {
    const d = distance(point.x - center.x, point.y - center.y)
    return Math.pow(d,2) <= Math.pow(r,2) ? true : false
}

  const centerOnNode = (pos, diameter) => {
      return { x: pos.x + diameter / 2, y: pos.y + diameter / 2 }
  }
  
  const centerOnNodeFlipped = (pos, diameter) => {
    return { x: pos.x - diameter / 4, y: pos.y - diameter / 4 }
}

const distance = (dx, dy) => {
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
  }

  const convertToLayout = (pos) => {
    return { left: pos.x, top: pos.y }
  }
  

const logPoint = (name,point) => {
    console.log(`${name}: ${point.x} ${point.y}`)
}

const logGridPos = (name,gPos) => {
    if(gPos){
    console.log(`${name}: ${gPos.row} ${gPos.col}`)
    }else {
        console.log('not a gPos')
    }
}

const makeWeightedList = (freqList) => {
  return freqList.map(freqObj=> {
      const {item,  freq} = freqObj
      return Array.from({length: freq},()=> item)
  }).reduce((r,c)=> [...r, ...c],[])
}

const compareGridPos = (gPos1, gPos2) => {
    return gPos1.row == gPos2.row && gPos1.col == gPos2.col
}

const rotateArray = (arr, rot) => {
    return arr.map((val, i) => {
      if (i + rot < 0) {
        return arr[arr.length - 1]
      }
      else {
        return arr[(i + rot) % 4]
      }
    })
  }

  const rotateLetters = (letters, rot) => {
    return letters.map((val, i) => {
      if (rot < 0) { // reverse case
        const rot2 = rot  % 4
        if (i + rot2 < 0) {// wrap around 
          return letters[letters.length + i + rot2]
        }
        else{  // no wrap
          return letters[i+rot2]
        }
      }
      else {
        return letters[(i + rot) % 4]
      }
    })
  }
const logColors  = (colors) => {
 //   logGridPos('    node', gridPos)
    console.log(`     top: ${colors[0]}`)
    console.log(`     right: ${colors[1]}`)
    console.log(`     bottom: ${colors[2]}`)
    console.log(`     left: ${colors[3]}`)



}

/**
 * 
 * @param {*} min - inclusive
 * @param {*} max - exclusive
 */
const randInt = (min,max)  => {
    return Math.floor(Math.random() * (max - min)) + min
}
const compressGridPos = (gridPos)=> {
  return [gridPos.row, gridPos.col]
}
const unCompressGridPos = (arr) => {
  return {row: arr[0], col: arr[1]}
}
const pointPastCircle = (point, start, end) => {

  if (start.gridPos.row === end.gridPos.row) { //horizontal
    const yTop = end.pos.y;
    const yBottom = yTop + end.diameter;

    if (point.y > yTop && point.y < yBottom) {
      if (start.gridPos.col < end.gridPos.col) { // going right
        if (point.x > end.pos.x) {
          return true;
        }
      } else { // going left
        if (point.x < end.pos.x + end.diameter) {
          return true;
        }
      }
    }
  }
  else {
    const xLeft = end.pos.x;
    const xRight = xLeft + end.diameter;
    if (point.x < xRight && point.x > xLeft) {
      if (start.gridPos.row < end.gridPos.row) { // going down
        if (point.y > end.pos.y) {
          return true;
        }
      }else { // going up
        if (point.y < end.pos.y + end.diameter) {
          return true;
        }
      }
    }
  }
  return false;
}
export {gridPos, point, distance, centerOnNode, pointInCircle, logPoint, logGridPos,compareGridPos, rotateArray, logColors, randInt, convertToLayout, rotateLetters as rotateLetters, unCompressGridPos, compressGridPos, pointPastCircle, makeWeightedList}