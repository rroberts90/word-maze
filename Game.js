import React, { useState, useEffect, useRef } from 'react'
import {Animated, useWindowDimensions, Easing} from 'react-native'
import { Board } from './Gameplay/Board'

import GameBoard from './components/GameBoard'
import ButtonsBar from './components/ButtonsBar'

import { storeItem, getItem } from './storage'

import Header from './components/Header'
import useSound from './custom-hooks/UseSound'

import GlobalStyles from './GlobalStyles'

const Duration = 1500


const Game = ({ navigation, route }) => {

 //console.log = function() {}
 const gameType = route.name
  const {  level, 
    puzzle, 
    title, } = route.params

  const height = useWindowDimensions().height

  const undoEl = useRef(null)
  const restartEl = useRef(null)
  const hintEl = useRef(null)

  const [saveLoaded, setSaveLoaded] = useState(false)

  const {play} = useSound()
  const getBoard = (ref) => {

    if (ref.current === null) {
      ref.current = new Board(gameType, 0, null, boardSize, {puzzleNumber, initialProgress,theme})
    }

    return ref.current

  }

  const board0 = useRef(null)

  useEffect(() => {

    console.log('---------\nnew game')
    getBoard(board0)

  }, [])

  return (<>
      <GameBoard 
        getBoard={() => getBoard(board0)}
        undoEl={undoEl}
        restartEl={restartEl}
        hintEl={hintEl}
      />
    <ButtonsBar undoEl={undoEl} restartEl={restartEl} hintEl={hintEl} />
    <Header fontAnim={1} navigation={navigation}  />   
  </>
  )

}

export default Game

