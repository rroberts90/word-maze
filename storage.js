import AsyncStorage from '@react-native-async-storage/async-storage'
const packInfo = require('./PremadeBoardStuff/Output/packInfo.json')

const clearAll = async () => {
    try {
      await AsyncStorage.clear()
    } catch(e) {
      // clear error
    }
  
    console.log('Done.')
  }

const storeItem = async (key,value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(`@${key}`, jsonValue)
    } catch (e) {
      // saving error
      console.log(e)
    }
  }

  const getItem = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(`@${key}`)
        return jsonValue != null ? JSON.parse(jsonValue) : null

    } catch(e) {
      // error reading value
      console.log(e)
    }
  }
  const getItems = async (key1, key2) => {
    try {
      const values = await AsyncStorage.multiGet([`@${key1}`, `@${key2}`])
      return values
    } catch(e) {
      // error reading value
      console.log(e)
    }
  }


  const levelUp = async ( board) => {
    console.log('leveling up')
    if(board.gameType === 'timed' || board.gameType === 'moves') {

      let itemName = `${board.gameType}Score`
      if(board.grid.length === 6) {
        itemName += '4x6'
      }else {
        itemName += '5x7'
      }

      getItem('currentScore').then(currentScore=> {
        storeItem('currentScore',  currentScore+1)


      })
    }
      getItem('level').then(level=> {

          storeItem('level', level+1)

        
        })

      
        if(board.gameType === 'puzzle'){
       /*  Doing this all in one in game now
        console.log('updating level progress')
        const levelProgress = await getItem('levelProgress')
        
        console.log(levelProgress)
        const currentPuzzle = await getItem('currentPuzzle')
        console.log(`currentPuzzle: ${currentPuzzle}`)

        const updatedProgress = levelProgress.map(level=> level)
        updatedProgress[currentPuzzle-1].progress++ //Level is index position +1
        storeItem('levelProgress',updatedProgress)*/
        

        }
  }

  const getSettings = async () => {
    let values
    try {

      const sound = await getItem('sound');
      const vibrate = await getItem('vibrate');
      return {sound, vibrate}
    } catch(e) {
      // read error
    }
  }

  const initialize = () => {


    storeItem('sound', true)
    storeItem('music', false)

    storeItem('vibrate', true)

    intializeLevelProgress()
  }
  const intializeLevelProgress = () => {
    const zeroProgress = packInfo.levels.map(level=> {return {progress:0, stars:[], visitedNodes: [], savedTime: 0}})

    storeItem('levelProgress',zeroProgress)

  }

  export {clearAll, storeItem, getItem, getItems, levelUp, initialize, getSettings, intializeLevelProgress}
