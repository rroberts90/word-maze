
import React, { useState, useEffect } from 'react'

import { View, Text, Button, Image, Pressable, StyleSheet, ScrollView } from 'react-native'
import colorScheme from '../Gameplay/ColorSchemes'
import useSound from '../UseSound'

import { clearAll, storeItem, getSettings } from '../Storage'
import { InfoHeader } from './Header'

import { getGlyphSource, getAnimalSource, getSymbolSource, getImpossibleSource, getDogSource, getDog2Source, getScienceSource, getFoodSource, getDesertSource, getFlowerSource, getFruitSource, getCardSource } from './Symbols'

const Selector = ({ toggle, color, text1, text2, press1, press2 }) => {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Pressable style={[styles.toggle, styles.toggleLeft, { borderColor: color }]} onPress={press1}>
                <View style={toggle ? [styles.selected, { backgroundColor: color }] : null} />
                <Text style={styles.toggleText}>{text1}</Text>
            </Pressable>
            <Pressable style={[styles.toggle, styles.toggleRight, { borderColor: color }]} onPress={press2}>
                <View style={toggle ? null : [styles.selected, { backgroundColor: color }]} />

                <Text style={styles.toggleText}>{text2}</Text>
            </Pressable>
        </View>
    )
}

function SettingsScreen({ navigation, route }) {
    const color = colorScheme.four

    const [sound, toggleSound] = useState(null)
    const [vibrate, toggleVibrate] = useState(null)
    const { play } = useSound()

    useEffect(() => {
        getSettings().then(settings => {
 
            const {sound, vibrate} = settings;

            toggleSound(sound? true : false)
            toggleVibrate(vibrate ? true : false)

        }).catch(e => console.log(e))
    }, [])

    useEffect(() => {
        if (sound !== null) {
            storeItem('sound', sound)
        }
    }, [sound])

    useEffect(() => {
        if (vibrate !== null) {
            storeItem('vibrate', vibrate)
        }
    }, [vibrate])

    return (
        <>
            <View style={styles.container}>
                <InfoHeader navigation={navigation} title={'Settings'} />

                <View style={{ flexDirection: 'column',marginTop: '25%' }}>

                    <Text style={styles.headerText}>Sounds</Text>

                    <View style={styles.line}>
                        <Selector toggle={sound} 
                                  color={colorScheme.four} 
                                  text1={'on'} 
                                  text2={'off'} 
                                  press1={() => { toggleSound(true); play('connect') }} 
                                  press2={() => toggleSound(false)} />
                    </View>
                </View>

                <View style={styles.bar} />
               
                <View style={{ flexDirection: 'column' }}>

                    <Text style={styles.headerText}>Vibrate</Text>

                    <View style={styles.line}>
                        <Selector toggle={vibrate} 
                                  color={colorScheme.four} 
                                  text1={'on'} 
                                  text2={'off'} 
                                  press1={() => { toggleVibrate(true) ; play('connect') }} 
                                  press2={() => { toggleVibrate(false);  play('connect') }} />
                    </View>
                </View>

                <Button title='Clear User Data' style={{ marginTop: 100 }} onPress={() => clearAll()} />

            </View>
        </>
    )
}

const styles = StyleSheet.create({
    line: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignSelf: 'center',
        margin: 10

    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },

    headerText: {
        fontSize: 25,
        alignSelf: 'center',
    },
    toggle: {
        borderWidth: 0,
    },
    toggleLeft: {
        borderTopLeftRadius: 15,
        borderBottomLeftRadius: 15,
        borderRightWidth: 0
    },

    toggleRight: {
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,
        borderLeftWidth: 0,
    },
    toggleText: {
        fontSize: 20,
        padding: 5,
        color: 'black',
        alignSelf: 'center'

    },
    selected: {
        position: 'absolute',
        opacity: .5,
        width: '100%',
        height: '100%',
        borderRadius: 10
    },
    bar: {
        width: '70%',
        borderRadius: 20,
        height: 1,
        backgroundColor: 'black',
        opacity: .5,
        alignSelf: 'center',
        marginVertical: 10
    }


})

export default SettingsScreen