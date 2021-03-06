import { Animated, View, StyleSheet, Easing, Text, Image, ImageBackground, useWindowDimensions } from "react-native"
import React, { useEffect, useRef, useState } from "react"

import { Letter } from './Symbols'

import Globals from '../Globals'
import { convertToLayout, logPoint, point } from "../Utils"
import { dynamicNodeSizeNoPosition } from "../node-size"
import { Cursor } from './UserInput'
const defaultNodeColor = Globals.defaultNodeColor

const measure = (ref, node, afterUpdate) => {
  if (ref.current) {
    ref.current.measureInWindow((x, y, width, height) => {
      node.pos.x = x
      node.pos.y = y
      node.diameter = Math.floor(width)
    })

  } else {
    throw 'measure node error'
  }
}

const borderStyles = (color) => {
  return {
    borderColor:  color ? color : Globals.defaultBorderColor
  }
}

const dynamicNodeSize = (diameter, tutorial) => {

  return {
    height: '80%',
    aspectRatio: 1,

    backgroundColor: "lightgrey",
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  }
}

const borderSize = (diameter) => {
  return {
    borderRadius: diameter / 2,
    borderWidth: Math.floor(diameter / 15) 
  }
}

const NodeView = ({node, triggerPulser, currentNode,currentColor}) => {

  const measureRef = useRef(null)
 
  const currX = node.pos.x 
  const currY = node.pos.y
  return (
    <View 
    ref={measureRef} 
    
    style={[
      styles.node,
      { backgroundColor: defaultNodeColor,
        borderColor:  Globals.defaultBorderColor,
        borderRadius: Math.round(useWindowDimensions().width + useWindowDimensions().height) /2,
        width: useWindowDimensions().width * .2,
        height: useWindowDimensions().width * .2,
        borderWidth: 1,
      }
    ]}

      onLayout={(event) => {
        setTimeout( ()=> measure(measureRef, node), 100)


      }}
  >

      <Cursor node={node}
                  triggerPulser={triggerPulser}
                  currPoint ={point(currX,currY)}
                  currentNode = {currentNode}
                  currentColor = {currentColor}
      />
      <View style={[styles.background]}/>
      <Letter letter={node.symbol}/>


    </View>
  )
}

const Pulse = (props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const sizeAnim = useRef(new Animated.Value(1)).current


  const colorStyles = borderStyles(props.color)
  useEffect(() => {
    if (props.GOGOGO > 0) {

      fadeAnim.setValue(1)
      sizeAnim.setValue(1)
      const scaleBy = 1.35 
      const duration = 500

      Animated.parallel([
     
        Animated.timing(sizeAnim, {
          toValue: scaleBy,
          duration: duration,
          useNativeDriver: true,
          isInteraction: false,
          easing: Easing.linear

        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
          isInteraction: false,
          easing: Easing.quad
        })
      ]).start(finished => {
        if (!finished) {
          // make sure that the pulse's opacity is 0 at end
          fadeAnim.setValue(0)

        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.GOGOGO])

  if(!props.pos) {
    return null
  }
  return <Animated.View
    style={[
      dynamicNodeSizeNoPosition(props.diameter),
      styles.pulse,
      colorStyles,
      convertToLayout(props.pos),
      {
        opacity: fadeAnim,
        borderWidth: props.diameter/2,
        transform: [{ scale: sizeAnim }]
      }]}

  />

}


const styles = StyleSheet.create({
  node: {

    justifyContent: 'center',
    alignItems: 'center',
    margin: '2%',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: Globals.defaultNodeColor,
    borderRadius: 200
  },
  pulse: {
    position: "absolute",
    backgroundColor: "darkgrey",
    zIndex: 0
  },



})

export { NodeView, Pulse, dynamicNodeSize, dynamicNodeSizeNoPosition }
