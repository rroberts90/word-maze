import React, { useEffect,useState, useRef } from 'react'
import {StyleSheet, View, Image, Text, Animated} from 'react-native'

import { point, convertToLayout } from '../Utils'

  const getArrowSource = (arrow) => { 
    let source = ''
    switch(arrow)  {
      case 0: 
        source = require('../assets/arrowUp7.png')
        break
      case 1:
        source = require('../assets/arrowRight7.png')
        break
      case 2:
          source = require('../assets/arrowDown7.png')
          break  
      case 3:
          source = require('../assets/arrowLeft7.png')
          break  
    }
    return source
  }
  


  const Letter = ({letter, rotAnim}) => {
    return <Animated.Text style={[styles.letter ,
      {
      transform: [{
        rotate: rotAnim.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '-360deg']
        })
      }]
    }]} allowFontScaling={true} >{letter}
    </Animated.Text>
  }
  
  const ArrowPadding = 1
  // absolutely positioned relative to parent (node)
 
  const positionArrow2 = (startNode, endNode, width, height) => {
    const radius = startNode.diameter /2
    const diameter = startNode.diameter
    let pos
    let type

    if(startNode.gridPos.row === endNode.gridPos.row) {

      if(startNode.gridPos.col < endNode.gridPos.col) {  // right arrow
            pos = point(diameter+ArrowPadding/2, radius - height/2)
            type = 1
        }else { // left arrow
            pos = point(-width - ArrowPadding/2 , radius-height/2)
            type = 3
        }
    } else {
        if(startNode.gridPos.row > endNode.gridPos.row) {  // down arrow
            pos = point(radius-width/2, -height - (ArrowPadding/2) )
            type = 0
        }else { // up arrow
            pos = point(radius-width/2, diameter + ArrowPadding/2  )
            type = 2
        }
    }
    return {pos, type}
  }

  const getArrowDims = (startNode, endNode, length) => {
    // two cases vertical  and horizontal
    let width
    let height
    let thickness = startNode.diameter / 5

    startNode.neighbors.forEach(neighbor=> {
      if(startNode.gridPos.row === neighbor.gridPos.row) {
        width = Math.abs(Math.abs(startNode.pos.x - neighbor.pos.x )- startNode.diameter) -ArrowPadding
        if (width > startNode.diameter * .25) {
          width = startNode.diameter * .25
        }
      }else {
        height =  Math.abs(Math.abs(startNode.pos.y - neighbor.pos.y)- startNode.diameter) -ArrowPadding
        if (height > startNode.diameter * .25) {
          height = startNode.diameter * .25
        }
      }
    })

    if(startNode.gridPos.row === endNode.gridPos.row) {
      height = thickness
      width = length
    }
    else{
      width = thickness
      height = length
    }
    return {width, height}
  }

const shouldAddArrow = (node, neighbor) => {
  if (node.links.includes(neighbor)) {
    // if link exists and node has no symbol always draw link. 
    if (!node.symbol) {
      return true
    }
    if (node.symbol !== neighbor.symbol) { // matches symbols already tells user nodes are linked.
      return true
    } else {
      return false
    }

  }
  else {
    return false
  }
}

  const FixedArrow = ({node, linkedNode, length}) => {
   let {width, height} = getArrowDims(node, linkedNode, length)
    
   let {pos, type} = positionArrow2(node, linkedNode,width,height)
    pos = point(pos.x + node.pos.x, pos.y + node.pos.y)
   
    

  const source = getArrowSource(type)


    return <Image style={[styles.arrow,  
      StyleSheet.absoluteFill,
      arrowStyles(width,height), 
      convertToLayout(pos)]} 
      source={source} /> 

  }

  const positionLetterInNode = (node) =>{
    return {top: node.pos.y - node.diameter/2 , 
      left: node.pos.x + node.diameter/2}
  }
  const FixedSymbols = ({grid}) => { 
    const nodes = grid.reduce((flat, row) => [...flat, ...row])

    return (<View style={{position:'absolute', height:'100%', width: '100%'}}> 

                {
          nodes.map((node, i)=> <View style={[{position: 'absolute'}, positionLetterInNode(node)]} key={i}><Letter letter={node.symbol} /></View>) 
        }
      </View>)
  }
  const Arrows = ({grid}) => {
    
      const flat = grid.reduce((flat, row) => [...flat, ...row])

      const length = Math.min(grid[1][0].pos.y - grid[0][0].pos.y - grid[0][0].diameter,grid[0][1].pos.x - grid[0][0].pos.x - grid[0][0].diameter   )
      const arrows = flat.reduce((arrowList, node) => {
        const arrowNeighbors = node.neighbors.filter(neighbor =>
          shouldAddArrow(node, neighbor))
        return [...arrowList, ...arrowNeighbors.map(neighbor => {
          return { node: node, neighbor: neighbor }
        })]
      }, [])

    return (<View style={{position:'absolute', height:'100%', width: '100%'}}> 

                {
          arrows.map((arrow, i)=> <FixedArrow node={arrow.node} linkedNode= {arrow.neighbor} key={i} length={length}/>) 
        }
      </View>)
  }
//.map((neighbor,i)=> <Arrow node={props.node} linkedNode= {neighbor} key={i} length={arrowNodes.length} />)}
  const arrowStyles = (width, height) => {
     return { 
         width: width,
         height: height,

         opacity: .7,
    }
  }


  const styles = StyleSheet.create({
 
      arrow: {
          opacity: 0,
          height:10,
          width:10,
          resizeMode:'stretch',
          tintColor: 'black'
      },
      arrowWrapper: {
          position:'absolute'
      }, 
      special: {
          position: 'absolute',
          height:'100%',
          width:'100%',
          opacity:.5
      },
      freezePattern: {
        opacity: .25
      },
      letter: {
        fontSize: 30,
        textDecorationLine: 'none'
      }

  })
  
  export { Letter,Arrows, FixedSymbols}