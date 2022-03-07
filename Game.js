import React, { useState, useEffect, useRef } from 'react'
import {Animated, useWindowDimensions, Easing} from 'react-native'
import { Board } from './board/Board'

import GameBoard from './components/GameBoard'
import ButtonsBar from './components/ButtonsBar'

import { storeItem, getItem } from './Storage'

import {InfoHeader} from './components/Header'
import useSound from './custom-hooks/UseSound'

import buildBoard from './board-maker/BoardBuilder'

const Duration = 1500

const Game = ({ navigation, route }) => {

 //console.log = function() {}
 const gameType = route.name
 
  const {  gameId } = route.params

  const height = useWindowDimensions().height

  const undoEl = useRef(null)
  const restartEl = useRef(null)
  const hintEl = useRef(null)
 
  const board = useRef(null)

  const [saveLoaded, setSaveLoaded] = useState(false)

  const {play} = useSound()
  
  const getBoard = (ref) => {

    if (ref.current === null) {
      //board.current = new Board({gameType,gameId});
     
      // for testing
      const seedWords = ['irate', 'inert', 'firetruck']
      const seedWords2 = ['firetruck']
      const seedWords3 = ['cowboy', 'firetruck']
      const seedWords4 = ['cowboy','boy','range','howdy','partner']
      const seedWords5 = ['irate','interim','trim','grit','trist']

      ref.current = buildBoard(seedWords, 1);
    }

    return ref.current

  }

  useEffect(() => {

    console.log('---------\nnew game')
    getBoard(board)

  }, [])

  return (<>
      <GameBoard 
        getBoard={() => getBoard(board)}
        undoEl={undoEl}
        restartEl={restartEl}
        hintEl={hintEl}
        navigation = {navigation}
      />

  </>
  )

}

export default Game

