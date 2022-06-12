import { Animated, View, StyleSheet, Easing, Text, Image} from "react-native"
import React, { useEffect, useRef, useState } from "react"
import { Segment } from './Paths'

import { NodeView } from "./Nodes"
import { Cursor } from './UserInput'
import Wheel from './Wheel'
import { point } from "../Utils"
import { clickProps } from "react-native-web/dist/cjs/modules/forwardedProps"

const GridView = ({board, afterUpdate, triggerPulser, currentColor,setEndPoint,currentNode}) => {

  // const rows = board.grid.map((row, i) => {
  //   return (
  //     <View style={styles.row} key={i}>
  //       {row.map((node, j) => <NodeView node={node}
  //         key={j}
  //         detectMatch = {detectMatch}
  //         triggerPulser = {triggerPulser}    
  //         />)}

  //     </View>
  //   )

  // })

  const nodeRows = board.grid.map((row, i) => {
    return (
        row.map((node, j) => <NodeView node={node}
          key={i*6+j}
          triggerPulser = {triggerPulser}  
          currentNode = {currentNode}  
          currentColor = {currentColor}
          />)

    )

  })
  const nodes = nodeRows.reduce((reducer, current)=> [...reducer, ...current],[])
  /*const rows = [0,2,4]
  const cols = [0,2]
  const wheels = rows.map(row=> {
    return (
      <View style={styles.row} key={row}>
        {cols.map(col => {
          return (<Wheel key={col}>
            {[[0, 0], [0, 1], [1, 0], [1, 1]].map((offset, i) => {
              const [rowOffset, colOffset] = offset
              const node = board.grid[rowOffset+row][colOffset + col]
    
              return <NodeView node={node}
                key={i}

                detectMatch = {detectMatch}
                triggerPulser = {triggerPulser}
                
              />

            })}
          </Wheel>
          )
        })}

      </View>
    )*/

  //} 


  return (
    <View style={styles.board2} >

      <View style={styles.grid}>
        {nodes}
      </View>

    </View>
    )
  }

  const styles = StyleSheet.create({

    board2: {
      flex: 9,
      width: '100%',
      height: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',

    }, 

    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'

    },

    row: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-evenly',
      alignItems: 'center', 
      alignSelf: 'center',
    }


  })
  export default GridView