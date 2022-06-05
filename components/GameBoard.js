import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, useWindowDimensions, Vibration } from 'react-native'

import { Pulse } from './Nodes'
import GridView from './Grid'
import { Cursor } from './UserInput'
import DemoCursor from './DemoCursor'
import { point, centerOnNode, logGridPos, rotateColors } from '../Utils'
import { UserPath } from './Paths'
import useInterval from '../custom-hooks/UseInterval.js'
import { levelUp, getItem, storeItem } from '../storage'
import useSound from '../custom-hooks/UseSound'
import { Arrows } from './Symbols'
import { InfoHeader } from './Header'
import ButtonsBar from './ButtonsBar'

import Globals from '../Globals'
const defaultBackground = Globals.backgroundColor


const GameBoard = ({ getBoard, hintEl, undoEl, restartEl, navigation }) => {

  const height = useWindowDimensions().height

  const [win, setWin] = useState(() => false)
//  console.log(getBoard().getCurrentNode().toString())


  const lineSegments = useRef([])
  const fadeSegments = useRef([])
  const [pulser, triggerPulser] = useState(() => 0) // triggers pulse animation

  const intervalId = useRef(null)

  const [loading, toggleLoading] = useState(true)

  const { play } = useSound()

  const addLineSegment = (node, next) => {

    const seg = {
      startNode: node,
      endNode: next,
    }
    lineSegments.current = [...lineSegments.current, seg]
  }

  /** 
   Sets a new current node. 
   Adds segment to previous node
  */
  const updateNodeBundle = (next, node) => {

    const prevNode = node

    addLineSegment(prevNode, next)

    triggerPulser(currentValue => currentValue + 1)

    if (false) { //TODO PUT FINISH CONDITION HERE

      levelUp(getBoard())

      setWin(true) // triggers end line fade in 
      hintEl.current.onPress = null

      play('win')

      // check if vibrate is AOK with user
      getItem('vibrate').then(vibrate => {
        if (vibrate) {
          Vibration.vibrate()
        }

      })


    } else {
      play('connect')

    }
  }

  function detectMatch(currentNode,point) {


    const candidate  = currentNode.matchPoint(point) 

    if (candidate) {

      const { next, prev } = getBoard().vistNode(currentNode,candidate)
      if (next) {
        updateNodeBundle(next, currentNode)
        return next
      }
      else if (prev) {
        onUndo()
        return prev
      }else {
        return null
      }

  }
}

  function resetCurrentNode(makePulseWait) {


    if (!makePulseWait) {
      triggerPulser(currentValue => currentValue + 1)
    } else {
      setTimeout(() => {
        if (pulser) {
          triggerPulser(currentValue => currentValue + 1)
        }
      }
        , makePulseWait)
    }

  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async function onHint() {

    return null
  }

  function onUndo(button) {

    if (getBoard().removeLast()) {
      play(button ? 'button' : 'undo')
      const seg = lineSegments.current.pop()
      fadeSegments.current.push(seg)
      resetCurrentNode()

    }
  }

  function onRestart() {
    getBoard().restart()
    lineSegments.current = []
    resetCurrentNode()
    setWin(false)
  }

  useEffect(() => {
      hintEl.current.onPress = onHint
      undoEl.current.onPress = onUndo
      restartEl.current.onPress = onRestart
    }
  )

  const loadingWall = loading ? <View style={styles.loadingWall} /> : null

  return (

    <View style={[styles.container]} >
    <InfoHeader navigation={navigation} title={'The Daily'} />   

      <UserPath segments={lineSegments.current} fades={fadeSegments.current} />

      <GridView board={getBoard()} 
      height={height} won={win} 
      triggerPulser={triggerPulser} 
      detectMatch={detectMatch}
      
      />

      <ButtonsBar undoEl={undoEl} restartEl={restartEl} hintEl={hintEl} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
  },
  loadingWall: {
    position: 'absolute',
    width: '100%',
    height: '110%',
    backgroundColor: defaultBackground,
    zIndex: 20
  }

})

export default GameBoard

/*  <Pulse pos={currPosF} 
      colors={[Globals.defaultBorderColor,Globals.defaultBorderColor,Globals.defaultBorderColor,Globals.defaultBorderColor ]} 
      GOGOGO={pulser} 
      diameter={currentNode?.diameter || 0} />
    */