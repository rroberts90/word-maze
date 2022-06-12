// butttons bar
import React, {useState, useRef, useEffect} from 'react'

import { View, StyleSheet, Button, TouchableOpacity, Image, SafeAreaView} from 'react-native'

import useSound from '../custom-hooks/UseSound'
import Globals  from '../Globals'
const defaultBackground = Globals.defaultBackground

const ButtonsBar = ({ undoEl, restartEl, hintEl}) => {
    const [disabled, toggleDisabled]= useState(false)
    const {play}= useSound()

    function handleOnHint() {
        if (disabled || hintEl.current.onPress === null) {
            return
        }

        toggleDisabled(true)
       hintEl.current.onPress()
       .then(waitTime=> {
        setTimeout(()=> toggleDisabled(false), 500)

       })
       .catch(error=> {
           console.log(error)
       })

        //toggleDisabled(false)
    }

    return (
        <View style={[styles.buttonsBar]}>
            <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-start', alignItems: 'center'}}>
             <View style={styles.bar}/>        
            </View>
            <TouchableOpacity ref={undoEl} style={styles.button} onPress={()=>{ undoEl.current.onPress(true)}} >
                <Image style={styles.icon} source={require('../assets/undo2.png')} />
            </TouchableOpacity>
            <TouchableOpacity ref={restartEl} style={[styles.button]} onPress={()=> {play('button'); restartEl.current.onPress()}} >
                <Image style={styles.icon} source={require('../assets/restart2.png')} />
            </TouchableOpacity>
            <TouchableOpacity ref={hintEl} style={[styles.button, styles.lightbulb, {opacity: disabled? .5: .8 }]} onPress={handleOnHint} disabled={disabled}>
                <Image style={[styles.icon, styles.lightbulbIcon]} source={require('../assets/lightbulb.png')} />
            </TouchableOpacity>
        </View>

    )
}

const styles = StyleSheet.create({
    buttonsBar: {
        flex:1,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        
    },
    icon: {
        height: '100%',
        aspectRatio: 1,
        alignSelf: 'center',
        
        opacity: .8

        },
    lightbulbIcon: {
        height: '95s%'
    },
    button: {
        width: '13.5%',
        aspectRatio: 1,
        paddingHorizontal: 5,
        paddingTop: 10,
        borderRadius: 10
      },
    lightbulb: {
        opacity: .8
    }, 
    bar: {
        width: '95%',
        borderRadius:10,
        height:2,
        backgroundColor:'black',
        opacity: .5
    }
})
export default ButtonsBar