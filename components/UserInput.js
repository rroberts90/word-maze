import React, {useRef, useState, useEffect, useContext } from "react"
import { Animated, PanResponder, StyleSheet} from "react-native"
import { dynamicNodeSizeNoPosition } from "../node-size"
import {  Segment } from "./Paths"
import * as MyMath from '../Utils'
import Board from "../board/Board"

import { CursorContext } from "../CursorContext"
/**
 * handles user touch on nodes. Fixed to one node, will follow users uninterupted touch to 
 * other nodes, reverts to original on release
 *  */
const Cursor = ({node, triggerPulser, currentNode,currentColor}) => {


    const gameBoard = useContext(CursorContext)
    const pan = useRef(new Animated.ValueXY()).current

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => {
          return true
        },

        onMoveShouldSetPanResponder: () => true,
  
        onPanResponderGrant: (evt, gestureState) => {
          console.log('granting\n')
          currentNode.current = node
          
          gameBoard.handleUserStringsOnNewTouch(node)

          const centeredEndPoint = MyMath.point(gestureState.x0, gestureState.y0) 
          gameBoard.setEndPoint(centeredEndPoint)
          
          
          triggerPulser(current=> current+1)

          pan.setOffset({
            x: pan.x._value,
            y: pan.y._value
          })
        },

        onPanResponderMove: (evt, gestureState) => {
       
          const point =  MyMath.point( gestureState.moveX,gestureState.moveY )
          gameBoard.setEndPoint(point)

          const nextNode = gameBoard.detectMatch(currentNode.current,point)
          

          if(nextNode) {
            console.log('GOT NEXT NODE')

            currentNode.current = nextNode
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
         
          gameBoard.setEndPoint(null)
          currentNode.current = null
          pan.setValue({ x: 0, y: 0 })
        }
      })
    ).current

 
return (  
        <Animated.View
    style={[{
      transform: [{ translateX: pan.x }, { translateY: pan.y }],
      margin: 0,
      zIndex: 11
    }, dynamicNodeSizeNoPosition(), styles.cursorTest]}
    {...panResponder.panHandlers}
   >
    </Animated.View>

    )
  }

  const styles = StyleSheet.create({

    cursorTest: {
        backgroundColor: "rgba(10,50,10,0)",
      },
    }
  )
  export {Cursor}
