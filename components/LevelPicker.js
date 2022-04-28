import  React, {useState, useEffect} from 'react'
import {ScrollView, View, StyleSheet } from 'react-native'
import { InfoHeader } from './Header'

import { PuzzleButton } from './NavigationButtons'
import { getItem,intializeLevelProgress } from '../storage'

const packInfo = {}
const getNextPuzzle = (currentLevel, levelProgress)=> {
    let foundPuzzle = null
    let current = currentLevel
    while(current+1 < levelProgress.length && !foundPuzzle) {
        current = current+1
        if(levelProgress[current].progress < levelProgress[current].mazeCount){
            foundPuzzle = current
        }
    }
    return foundPuzzle
}

const LevelPicker = ({navigation, route}) => {
    const [disabled, toggleDisabled]= useState(false)
    const [progress, setProgress]  = useState([])
    const [renderOnArrival, setROA]  = useState(0)

    if(route.params.updateProgress) {
        route.params.updateProgress = false
        setROA(count=> count+1)

    }

    useEffect(()=> {
        getItem('levelProgress').then(levelProgress=>{
            if(levelProgress){
            setProgress(levelProgress)
            const tmp = progress.map(level=> level)
            }else{
                // not initialized
                //intializeLevelProgress()
            }
        })

    },[renderOnArrival])

    //setupPuzzles()

    return (<View style={styles.container}>
        <InfoHeader title={'Puzzle Packs'} navigation= {navigation}/>
        <ScrollView style={styles.list}>
        {Array.from({length: count}, (_, ndx)=>ndx).map(number=>  {
            const puzzleProgress = progress[number] ? progress[number].progress : 0
            const savedTime = progress[number] && progress[number].savedTime  ? progress[number].savedTime : 0
            return <PuzzleButton navigation= {navigation} title={'puzzle'} info={{...packInfo.levels[number], initialProgress: puzzleProgress, savedTime: savedTime}} disabled = {disabled} toggleDisabled={toggleDisabled} key={number}/>
            } 
        )}
        </ScrollView>
    </View>)

}

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        flexDirection: 'column',
         paddingTop: '25%'
},
 list:{
     flex:1,
     height: '100%'
 }
    
})

export default LevelPicker