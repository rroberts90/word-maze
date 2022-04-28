import { Audio } from 'expo-av'
import React, { useState, useEffect } from 'react'
import { getItem } from '../storage'


const sounds = {
    'connect': require('../assets/sounds/tap2.wav'), 
    'win': require('../assets/sounds/win3.mp3'),
    'button': require('../assets/sounds/tap1.wav'),
    'undo': require('../assets/sounds/tap2.wav'),
    'gameOver':require('../assets/sounds/gameOver1.wav'),
    'packWin':require('../assets/sounds/puzzlePackWin.wav')

}

export default function useSound() {

    const [sound, setSound] = useState()

    async function playSound(key) {
        const soundAllowed = await getItem('sound')
        if(!soundAllowed) {
            return
        }

        const { sound } = await Audio.Sound.createAsync(
            sounds[key]
        )
        setSound(sound)
        
        if(key==='paper'){
            await sound.setPositionAsync(400)
        }
        if(key==='button') {
            await sound.setVolumeAsync(.5)
        }
        if(key ==='undo') {

           // await sound.setVolumeAsync(.5)

        }
        if(key === 'background') {
            await sound.setIsLoopingAsync(true)
        }

        await sound.playAsync()
    }



    useEffect(() => {

        return sound
            ? () => {
                sound.unloadAsync()
            }
            : undefined
    }, [sound])

    return {play: playSound}
}





/*function useNotes() {
    const root = './Sounds'

 
    const [sound, setSound] = useState()

    const ndx = useRef(0)

    async function playSound() {
        const nextNdx = getNextNoteNdx(ndx.current)
        ndx.current = nextNdx
        const { sound } = await Audio.Sound.createAsync(
            notes[nextNdx]
        )

        setSound(sound)

        //console.log('Playing Sound')
        await sound.playAsync()
    }

     const reset = () => {
        ndx.current = 0
    }

    useEffect(() => {

        return sound
            ? () => {
               // console.log('sound changed')

                sound.unloadAsync()


            }
            : undefined
    }, [sound])
    useEffect( () => {
        return sound ? ()=> {sound.unloadAsync()
        } : undefined
    }, [] )

    return {play: playSound, reset: reset}
}*/