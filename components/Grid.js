import { Animated, View, StyleSheet, Easing, Text, Image, useWindowDimensions} from "react-native"
import React, { useEffect, useRef, useState } from "react"
import { Segment, CapSegment } from './Paths'

import { NodeView } from "./Nodes"

const GridView = ({board, won, afterUpdate, triggerPulser}) => {

  const rows = board.grid.map((row, i) => {

    return (
      <View style={styles.row} key={i}>
        {row.map((node, j) => <NodeView node={node}
          key={j}
          afterUpdate={board.getCurrentNode() === node ? afterUpdate : null}
          gameType = {board.gameType}
    />)}
      </View>
    )

  })

  return (
    <Animated.View style={styles.board2} onStartShouldSetResponder={()=> true} onResponderGrant={()=>triggerPulser(pulser=> pulser+1)}>


     <View style={styles.cap}>
       
        <CapSegment
          end={'finish'}
          node={board.finish}
          won={won} />        
      </View>

      <View style={styles.grid}>
        {rows}
      </View>
    
      <View style={styles.cap}>
        <CapSegment
          end={'start'}
          node={board.start}
          won={won} />      
      </View>

    </Animated.View>)
  }

  const styles = StyleSheet.create({
    board: {
        flex: 1,
        justifyContent: "space-evenly",
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        paddingHorizontal: 5
          },
    board2: {
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',

    }, 
    cap: {
      flex: 2,
      width: '100%',
      height: '100%'
    },
    grid: {
      flex: 9,
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    row: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-evenly',
      alignItems: 'center', 
      alignSelf: 'center',
      flex: 1,
    }


  })
  export default GridView