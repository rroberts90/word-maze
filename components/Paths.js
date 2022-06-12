import React, { useEffect, useRef, useState } from 'react'
import {StyleSheet, View, Animated,Easing, useWindowDimensions} from 'react-native'
import Globals from '../Globals'

import { distance, centerOnNode,rotateLetters,convertToLayout, point, logPoint, logGridPos, gridPos } from '../Utils'


const toDegrees = (angle) =>{
    return angle * (180 / Math.PI)
  }


const Fade = (props) => {
  
  const fadeAnim = useRef(new Animated.Value(1)).current
  useEffect(()=>{
    if(props.fade === true){
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.quad
    }).start(finished=>{
      props.onFade()
    })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[props.fadeOut])
  return <Animated.View style= {{opacity:fadeAnim}}>
     {props.children}
    </Animated.View>
}


const Segment = ({startNode,endPoint, color, originalNode}) => {


  if (startNode === null  || endPoint === null){
      return null
    }

  // need to add translation offset if the node has changed
  // const [offsetX, offsetY] = startNode === originalNode ? 
  // [0,0] : [originalNode.pos.x - startNode.pos.x, originalNode.pos.y - startNode.pos.y,]
  const [offsetX, offsetY] =  [startNode.pos.x, startNode.pos.y]

    
    const startPos = centerOnNode(startNode.pos,  startNode.diameter)
    const endPos  = endPoint 
    
    const scaleX = distance(endPos.x - startPos.x, endPos.y - startPos.y)
    const scaleY = startNode.diameter / 6 // line width

    const opp = endPoint.y - startPos.y
    const xDir = Math.sign(endPoint.x - startPos.x)
    const angle = xDir > 0 ? toDegrees(Math.asin(opp/ scaleX)) : 180 - toDegrees(Math.asin(opp/ scaleX)) // scaleX is also hypotenuse

    const rotate = `${angle}deg`
    // const topDiff = startNode.pos.y - originalNode.pos.y
    // const leftDiff = startNode.pos.x - originalNode.pos.x
    return (<View style={[styles.dot, 

                        { backgroundColor: color,
                          top: startNode.diameter / 2,
                          left: startNode.diameter /2,
                         transform: [ 
                           {translateX: offsetX},
                           {translateY: offsetY},
                          { rotate: rotate },
                          { translateX: scaleX/2 },
                             { scaleX: scaleX }, 
                             { scaleY: scaleY },
                             ] }]}/>
                             



   )
}

const getFixedStyles = (startNode, endNode, color) => {
 const width = startNode.diameter/ 6
 //const rotatedColors = rotateColors(startNode.colors, startNode.rot)

  if(startNode.gridPos.row < endNode.gridPos.row){  // below
    const startPos1 = centerOnNode(startNode.pos,  startNode.diameter)
    const startPos = point(startPos1.x - width/2, startPos1.y)

    const length = Math.abs(endNode.pos.y - startNode.pos.y)
   
    return {
      backgroundColor:  color,
      top: startPos.y - startNode.diameter,
      left: startPos.x,
      width: width,
      height: length
    }
  }

  else if(startNode.gridPos.row > endNode.gridPos.row){ // above
    const startPos1 = centerOnNode(endNode.pos,  endNode.diameter)
    const startPos = point(startPos1.x - width/2, startPos1.y)
 
    const length = Math.abs(endNode.pos.y - startNode.pos.y)
    
    return {
      backgroundColor:  color,
      top: startPos.y - startNode.diameter,
      left: startPos.x,
      width: width,
      height: length
    }
  }
  else if(startNode.gridPos.col > endNode.gridPos.col){ // going left
    const startPos1 = centerOnNode(endNode.pos,  endNode.diameter)
    const startPos = point(startPos1.x, startPos1.y - width/2)

    const length = Math.abs(endNode.pos.x - startNode.pos.x)
    return {
      backgroundColor:  color,
      top: startNode.pos.y -startNode.diameter/2 - width/2,
      left: startPos.x,
      width: length,
      height: width
    }
  }
  else if(startNode.gridPos.col < endNode.gridPos.col){ // going right
    const startPos1 = centerOnNode(startNode.pos,  startNode.diameter)
    const startPos = point(startPos1.x, startPos1.y - width/2)

    const length = Math.abs(endNode.pos.x - startNode.pos.x)
    
    return {
      backgroundColor:  color,
      top: startNode.pos.y -startNode.diameter/2 - width/2,
      left: startPos.x,
      width: length,
      height: width
    }
  }
}

const FixedSegment = ({startNode, endNode, color}) => {
    
    const fixedStyles = getFixedStyles(startNode, endNode, color)

    const isHorizontal = startNode.gridPos.row === endNode.gridPos.row 

    fixedStyles['position'] = 'absolute'

    const arrowWidth = startNode.diameter/5 / 1.5
    return (<View style={[fixedStyles]}>
    </View>
                             
   )
}
   
  const UserPath = ({segments, fades}) => {
    return (
      <View >
        {segments.map((seg,i) =>
            <FixedSegment startNode={seg.startNode} endNode={seg.endNode} color={seg.color} key={i}/>
        )}
        {fades.map((seg,i) =>
            <Fade fade={true} onFade={()=> fades.pop()}  key={i}>
            <FixedSegment startNode={seg.startNode} endNode={seg.endNode} color={seg.color}/>
            </Fade>
        )}
      </View>
    )
  }

const arrowStyles = (width, height, color) => {
  return {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: height,
    borderTopWidth:2,
    borderLeftWidth: 2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderColor: color,
    transform: [{rotate: '90deg'}],
    opacity: .8
  }
}



const animateArrow = (triangleAnim, distance ,start) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(triangleAnim, {
      toValue: -(distance),
      duration: 3000,
      easing: Easing.linear,
      delay: 0,
      isInteraction: false,
      useNativeDriver: true
    }),
    Animated.timing(triangleAnim, {
      toValue: 10,
      duration: 1,
      easing: Easing.linear,
      isInteraction: false,
      useNativeDriver: true
    }),
  
  ]))
}

const Arrow2 = ({moveAnim, width}) => {
  return <Animated.View style={[arrowStyles(width, width, 'black'),
      {
        transform: [{ translateY: moveAnim }, { rotate: '45deg' }] 
      }]}/>
}

  const styles  = StyleSheet.create({
    dot: {
        width:1,
        height:1,
        zIndex:0,
        top:0,
        left: 0,
        position: 'absolute',


      },
    lightener : { 
      zIndex:10,
      position: 'relative',
      margin:.5
        }
  })

  export {Segment, UserPath, Fade}

