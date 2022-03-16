import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, useWindowDimensions, Vibration } from 'react-native'

import { Pulse } from './Nodes'
import GridView from './Grid'
import { Cursor } from './UserInput'
import DemoCursor from './DemoCursor'
import { point, centerOnNode, logGridPos, rotateColors } from '../Utils'
import { UserPath } from './Paths'
import useInterval from '../custom-hooks/UseInterval.js'
import { levelUp, getItem, storeItem } from '../Storage'
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

  const [currentNode, setCurrentNode] = useState(() => getBoard().getCurrentNode())

  const lineSegments = useRef([])
  const fadeSegments = useRef([])
  const [pulser, triggerPulser] = useState(() => 0) // triggers pulse animation

  const intervalId = useRef(null)

  const [defaultPulser, setDefaultPulser] = useState(0)
  const [loading, toggleLoading] = useState(true)

  const { play } = useSound()

  const addLineSegment = (node, next) => {

    const seg = {
      startNode: node,
      endNode: next,
    }
    lineSegments.current = [...lineSegments.current, seg]
  }


  // sets the endPointto the CurrentNode position after it's position is measurable.
  const updateAfterLayout = () => {
    resetCurrentNode()

  }

  /** 
   Sets a new current node. 
   Adds segment to previous node
  */
  const updateNodeBundle = (next, node, hint) => {

    const prevNode = node
    setCurrentNode(next)

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
      play(hint ? 'button' : 'connect')

    }
  }

  function detectMatch(point) {

    const node = getBoard().getCurrentNode()

    const { candidate } = node.matchPoint(point)

    if (candidate) {

      const { next, prev } = getBoard().visitNode(candidate)
      if (next) {

        updateNodeBundle(next, node)
        return { newNode: next, prevPoint: null }
      }
      else if (prev) {
        onUndo()
        return { newNode: null, prevPoint: prev.pos }
      }
      else {
        return { newNode: null, prevPoint: null }

      }
    } else {

      return { newNode: null, prevPoint: null }
    }

  }

  const currPosF = currentNode?.pos 

  const currX = currentNode?.pos.x || 0
  const currY = currentNode?.pos.y || 0

  function resetCurrentNode(makePulseWait) {

    setCurrentNode(getBoard().getCurrentNode())

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

      <Pulse pos={currPosF} 
      colors={[Globals.defaultBorderColor,Globals.defaultBorderColor,Globals.defaultBorderColor,Globals.defaultBorderColor ]} 
      GOGOGO={pulser} 
      diameter={currentNode?.diameter || 0} />
   
      <Cursor node={currentNode} 
      currPoint={point(currX, currY)} 
      triggerPulser={triggerPulser} 
      detectMatch={detectMatch} 
      intervalId={intervalId} />

      <GridView board={getBoard()} 
      afterUpdate={updateAfterLayout} 
      height={height} won={win} 
      triggerPulser={triggerPulser} />

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