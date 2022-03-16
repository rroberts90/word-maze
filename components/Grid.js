import { Animated, View, StyleSheet, Easing, Text, Image} from "react-native"
import React, { useEffect, useRef, useState } from "react"
import { Segment } from './Paths'

import { NodeView } from "./Nodes"
import { point } from "../Utils"

const GridView = ({board, won, afterUpdate, triggerPulser}) => {

  const rows = board.grid.map((row, i) => {
    return (
      <View style={styles.row} key={i}>
        {row.map((node, j) => <NodeView node={node}
          key={j}
          afterUpdate={i === 5 && j === 3 ? afterUpdate : null}
    />)}
      </View>
    )

  })

  return (
    <Animated.View style={styles.board2} onStartShouldSetResponder={()=> true} onResponderGrant={()=>triggerPulser(pulser=> pulser+1)}>

      <View style={styles.grid}>
        {rows}
      </View>


    </Animated.View>
    )
  }

  const styles = StyleSheet.create({

    board2: {
      flex: 9,
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',

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