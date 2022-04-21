import React, {useRef, useState, useEffect } from "react"
import { Animated, PanResponder, StyleSheet} from "react-native"
import { dynamicNodeSizeNoPosition } from "../node-size"
import {  Segment } from "./Paths"
import * as MyMath from '../Utils'

const Cursor = ({node, triggerPulser, detectMatch}) => {

    // const [currX, setCurrX]= useState(()=>0)
    // const [currY, setCurrY]= useState(()=>0)

    const [endPoint, setEndPoint] = useState(null)
    const [currentNode, setCurrentNode] = useState(()=> node) 

    const pan = useRef(new Animated.ValueXY()).current

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => {
          return true
        },

        onMoveShouldSetPanResponder: () => true,
  
        onPanResponderGrant: (evt, gestureState) => {
          console.log('granting\n')

          const centeredEndPoint = MyMath.point(gestureState.x0, gestureState.y0) 
          setEndPoint(centeredEndPoint)
          
          triggerPulser(current=> current+1)

          pan.setOffset({
            x: pan.x._value,
            y: pan.y._value
          })
        },

        onPanResponderMove: (evt, gestureState) => {
       
          const point =  MyMath.point( gestureState.moveX,gestureState.moveY )
          setEndPoint(point)
         
          // check for intersections with other nodes
          const nextNode = detectMatch(currentNode,point)

          if(nextNode) {
            console.log('GOT NEXT NODE')

            setCurrentNode(nextNode)
          }
 
          return Animated.event(
            [
              null,
              { dx: pan.x, dy: pan.y }
            ],
            { useNativeDriver: false }
          )(evt, gestureState)
        },
        onPanResponderRelease: (evt, gestureState) => {
         
          setEndPoint(null)
          setCurrentNode(node)
          pan.setValue({ x: 0, y: 0 })
        }
      })
    ).current

    const segment =   node ? <Segment startNode= {currentNode} endPoint={endPoint}/>  : null

return (<>   
        <Animated.View
    style={[{
      transform: [{ translateX: pan.x }, { translateY: pan.y }],
      margin: 0,
      zIndex: 11
    }, dynamicNodeSizeNoPosition(), styles.cursorTest]}
    {...panResponder.panHandlers}
   >
    </Animated.View>
    {segment}

    </>

    )
  }

  const styles = StyleSheet.create({

    cursorTest: {
        backgroundColor: "rgba(10,50,10,.5)",
      },
    }
  )
  export {Cursor}
