import { Animated, View, StyleSheet, Easing, Text, Image, ImageBackground, useWindowDimensions } from "react-native"
import React, { useEffect, useRef, useState } from "react"

import { Letter } from './Symbols'


import Globals from '../Globals'
import { convertToLayout } from "../Utils"

const defaultNodeColor = Globals.defaultNodeColor

const measure = (ref, node, afterUpdate) => {
  if (ref.current) {
    ref.current.measureInWindow((x, y, width, height) => {
        
      node.pos = { x: x, y: y }
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

const dynamicNodeSizeNoPosition = (diameter) => {
  return {
    width: diameter,
    height: diameter,
    borderRadius: diameter / 2,
    borderWidth: Math.floor(diameter / 15)
  }
}

const NodeView = (props) => {

  //console.log(props.node.toString())
  const rotAnim = useRef(new Animated.Value(0)).current
  const measureRef = useRef(null)
 
  useEffect(() => {

    Animated.timing(rotAnim, {
      toValue: props.node.rot * -90,
      duration: 1000,
      useNativeDriver: true,

    }).start()
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.node.rot])


  const colorStyles = borderStyles(props.node.colors)

  const testLetters = ['A','C', 'R', 'P']
  return (
    <Animated.View 
    ref={measureRef} 
    
    style={[
      styles.nodeSize,
      borderSize(props.node.diameter),
      colorStyles,
      { backgroundColor: defaultNodeColor },
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
        measure(measureRef, props.node, props.afterUpdate)

      }}
    >
      <Letter letter={props.node.symbol}/>
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

const CenterCircle = ({node})=> {
  const [color, setColor] = useState(()=> ndxToColor(node.symbol))
  
  return <View style={[
    styles.centerCircle,
    {
      borderRadius: '50%',
      backgroundColor: color
    }]} />

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
  nodeSize: {
    height: '85%',
    aspectRatio: 1,
    backgroundColor: "rgb(220,220,220)",
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: '1%'
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
  centerCircle: {
    position: 'absolute',
    height: '30%',
    width: '30%'

  }
})

export { NodeView, Pulse, dynamicNodeSize, dynamicNodeSizeNoPosition }
