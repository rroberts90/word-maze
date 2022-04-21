import { Animated, View, StyleSheet, Easing, Text, Image, ImageBackground, useWindowDimensions } from "react-native"
import React, { useEffect, useRef, useState } from "react"

import { Letter } from './Symbols'

import Globals from '../Globals'
import { convertToLayout, point } from "../Utils"
import { dynamicNodeSizeNoPosition } from "../node-size"
import { Cursor } from './UserInput'
const defaultNodeColor = Globals.defaultNodeColor

const measure = (ref, node, afterUpdate) => {
  if (ref.current) {
    ref.current.measureInWindow((x, y, width, height) => {
        
      node.pos.x = x
      node.pos.y = y
      node.diameter = Math.floor(width)

      if (afterUpdate) {
        afterUpdate()
      }
    })

  } else {
    throw 'measure node error'
  }
}

const borderStyles = (colors) => {
  return {
    borderColor:  Globals.defaultBorderColor
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


const NodeView = ({node, afterUpdate, triggerPulser, detectMatch}) => {

  //console.log(props.node.toString())
  const rotAnim = useRef(new Animated.Value(0)).current
  const measureRef = useRef(null)
 
  useEffect(() => {

    Animated.timing(rotAnim, {
      toValue: node.rot * -90,
      duration: 1000,
      useNativeDriver: true,

    }).start()
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.rot])
  const currX = node.pos.x 
  const currY = node.pos.y
  return (
    <Animated.View 
    ref={measureRef} 
    
    style={[
      styles.node,
      { backgroundColor: defaultNodeColor,
        borderColor:  Globals.defaultBorderColor,
        borderRadius: Math.round(useWindowDimensions().width + useWindowDimensions().height) /2,
        width: useWindowDimensions().width * .2,
        height: useWindowDimensions().width * .2,
        borderWidth: 1,
      },
      {
        transform: [{
          rotate: rotAnim.interpolate({
            inputRange: [0, 360],
            outputRange: ['0deg', '360deg']
          })
        }]
      }
    ]}

      onLayout={(event) => {
        measure(measureRef, node, afterUpdate)

      }}
  >
      <Cursor node={node}
                  triggerPulser={triggerPulser}
                  detectMatch={detectMatch}
                  currPoint ={point(currX,currY)}
      />
      <View style={[styles.background]}/>
      <Letter letter={node.symbol}/>


    </Animated.View>
  )
}

const ndxToColor = (ndx) => {
  if(typeof(ndx) === 'number'){
  return Object.entries(Globals.colorScheme).map(entry=> entry[1])[ndx]
  }
  else {
    return 'grey'
  }
}



const Pulse = (props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const sizeAnim = useRef(new Animated.Value(1)).current


  const colorStyles = borderStyles(props.colors)
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
    backgroundColor: Globals.defaultBackground,
    borderRadius: 200
  },
  nodeBorder: {
  },

  pulse: {
    position: "absolute",
    backgroundColor: "darkgrey",
    zIndex: 0
  },

  textSymbol: {
    fontSize: 30
  },

  board: {
    flex: 1,
    justifyContent: "space-evenly",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    paddingHorizontal: 5
  },
  tutorial: {
    flex: 1
  },

  horizontalLine: {
    position: 'absolute',
    width: '100%'
  },
  lock: {
    position: 'absolute',

    width: '65%',
    height: '65%',
    alignSelf: 'center',
    top: '15%',
    opacity: 1,
  },

})

export { NodeView, Pulse, dynamicNodeSize, dynamicNodeSizeNoPosition }
