import React, {useRef, useState } from "react"
import { Animated, PanResponder, StyleSheet} from "react-native"
import {dynamicNodeSizeNoPosition} from './Nodes'
import {  Segment } from "./Paths"
import * as MyMath from '../Utils'

const Cursor = (props) => {
    const mostRecentPoint = useRef(null)
    const [endPoint, setEndPoint] = useState(null)

    const pan = useRef(new Animated.ValueXY()).current

    
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => {
          //pulseFlag.current = pulseFlag.current + 1
          return true
        },

        onMoveShouldSetPanResponder: () => true,
  
        onPanResponderGrant: (evt, gestureState) => {
          clearInterval(props.intervalId.current)
          const centeredEndPoint = MyMath.point(gestureState.x0, gestureState.y0)
          setEndPoint(centeredEndPoint)
          
          mostRecentPoint.current = centeredEndPoint
          props.triggerPulser(current=> current+1)

          pan.setOffset({
            x: pan.x._value,
            y: pan.y._value
          })
        },

        onPanResponderMove: (evt, gestureState) => {
       
          const point =  MyMath.point( gestureState.moveX,gestureState.moveY )
          setEndPoint(point)
         
          // check for intersections with other nodes
          const {newNode, prevPoint} = props.detectMatch(point)
          if(newNode){
            mostRecentPoint.current = point
            
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
         
          const centeredEndPoint = mostRecentPoint.current///MyMath.point(gestureState.x0, gestureState.y0) //MyMath.centerOnNode(MyMath.point(props.currX, props.currY), props.node.diameter )
          setEndPoint(null)

          pan.setValue({ x: 0, y: 0 })
        }
      })
    ).current

    const segment =   props.node ? <Segment startNode= {props.node} endPoint={endPoint}/>  : null
    return (<>   
      <Animated.View
    style={[{
      transform: [{ translateX: pan.x }, { translateY: pan.y }],
      position: "absolute",
      top: props.currPoint.y,
      left: props.currPoint.x,
      margin: 0,
      zIndex: 11
    }, dynamicNodeSizeNoPosition(props.node?.diameter || 0,0), styles.cursor]}
    {...panResponder.panHandlers}
   >
    </Animated.View>
    {segment}

    </>

    )
  }

  const styles = StyleSheet.create({
    cursor: {
        backgroundColor: "rgba(0,0,0,.5)",
        borderColor: "rgba(255,255,255,.5)",
        opacity:0
      },
    }
  )
  export {Cursor}
