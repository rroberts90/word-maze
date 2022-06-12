import React, { useEffect, useRef, useState, createContext } from 'react'
import { View, StyleSheet, useWindowDimensions, Vibration } from 'react-native'

import { Pulse } from './Nodes'
import GridView from './Grid'
import { Cursor } from './UserInput'
import DemoCursor from './DemoCursor'
import { point, centerOnNode, logGridPos, rotateColors } from '../Utils'
import { UserPath, Segment } from './Paths'
import useInterval from '../custom-hooks/UseInterval.js'
import { levelUp, getItem, storeItem } from '../storage'
import useSound from '../custom-hooks/UseSound'
import { Arrows } from './Symbols'
import { InfoHeader } from './Header'
import ButtonsBar from './ButtonsBar'

import Globals from '../Globals'

import nextColor from '../nextColor'
import { CursorContext } from '../CursorContext'

const defaultBackground = Globals.backgroundColor

const findSegmentIndex = (lineSegments, currentNode, nextNode) => {
  return lineSegments.findIndex(seg=> 
    (seg.startNode === currentNode && seg.endNode === nextNode) || 
    (seg.startNode === nextNode && seg.endNode === currentNode) )
  
}

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

  const [endPoint, setEndPoint] = useState(null)
  const currentNode = useRef(null)

  const colors = useRef(nextColor()).current
  //const [segmentColor, setSegmentColor] = useState('rgba(255,255,255,1)')
  const segmentColor = useRef('rgba(255,255,255,1)')
   
  const addLineSegment = (node, next) => {
   
    const seg = {
      startNode: node,
      endNode: next,
      color: segmentColor.current
    }

    lineSegments.current = [...lineSegments.current, seg]
  }

  /** 
   Sets a new current node. 
   Adds segment to previous node
  */
  const updateNodeBundle = (next, node,color) => {

    const prevNode = node

    triggerPulser(currentValue => currentValue + 1)

    addLineSegment(prevNode, next, color)


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

  function detectMatch(node,point,color) {

    const candidate  = node.matchPoint(point) 

    if (candidate) {

      const { next, prev } = getBoard().visitNode(node,candidate)
      if (next) {
        updateNodeBundle(next, node,color)
        return next
      }
      else if (prev) {
        onUndo(node, prev)
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

  function onUndo( currentNode, nextNode) {

      //play(button ? 'button' : 'undo')
      console.log('undoing')
      const segIndex = findSegmentIndex(lineSegments.current,currentNode, nextNode)

      if(segIndex === -1 ) {
        throw new Error('Could not find segment. lineSegments and Board out of sync')
      }

      const seg = lineSegments.current.splice(segIndex,1)
      //fadeSegments.current.push(seg)
      resetCurrentNode()

  }

  function onRestart() {
    getBoard().restart()
    lineSegments.current = []
    resetCurrentNode()
    setWin(false)
  }

  function handleUserStringsOnNewTouch(node) {
    // ok some logic: 
    //if user just touched node with 0 connections, 
    //   -- set segment to new color
    //   -- no need to make new userString bc we'll create it on first connection
    // if user touched node with 1 connection, 
    //    -- set segment to color of the last segment in string
    //    -- set currentUserString to userString
    // if user touched node with 2 connections, 
    //    --  set segment to color of the last segment in most recently pressed string.
    //    -- set currentUserString to last segment in most recently pressed string
    
    if(node.paths.length === 0) {
      //setSegmentColor(colors())
      segmentColor.current = colors()

    }

    else if(node.paths.length === 1 ) {
      // find user string
      const userString = getBoard().findUserStringWithAdjacentNodes(node, node.paths[0])
      
      if(!userString) {
        throw new Error('Could not find userString for path')
      }

      const segIndex = findSegmentIndex(lineSegments.current, node, node.paths[0])
      
      //setSegmentColor(lineSegments.current[segIndex].color)
      segmentColor.current = lineSegments.current[segIndex].color

      getBoard().currentStringNdx = getBoard().userStrings.indexOf(userString)

    }

 
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
    <InfoHeader navigation={navigation} title={'Test Level'} />   
    <Segment startNode= {currentNode.current} endPoint={endPoint} originalNode={currentNode.current} color={segmentColor.current}/> 

      <UserPath segments={lineSegments.current} fades={fadeSegments.current} />
      <CursorContext.Provider value={{ setEndPoint: setEndPoint, 
                                       detectMatch: detectMatch,
                                       triggerPulser: triggerPulser,
                                       handleUserStringsOnNewTouch: handleUserStringsOnNewTouch,
                                      }}>
        <GridView board={getBoard()}
          height={height} won={win}
          triggerPulser={triggerPulser}
          currentNode={currentNode}
          currentColor = {segmentColor.current}

        />
      </CursorContext.Provider>
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