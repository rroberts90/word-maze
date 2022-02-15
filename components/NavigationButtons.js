import React, { useState, useEffect, useRef } from 'react'
import { TouchableOpacity, Image, StyleSheet, Text, View } from 'react-native'

import { storeItem } from '../Storage'
import Globals from '../Globals'

import useSound from '../custom-hooks/UseSound'


const defaultBackground = Globals.defaultBackground
const buttonBackground = defaultBackground
const colorScheme = Globals.colorScheme

const PlayButton = ({ navigation, title, disabled, toggleDisabled, borderColor, text, boardSize }) => {
    const { play } = useSound()
    return (
        <TouchableOpacity
            style={[styles.menuButton, { borderColor: borderColor }]}
            onPress={() => {
                storeItem('currentScore',  0)

                toggleDisabled(true)
                boardSize !== null ? navigation.push(title, { boardSize: true }) : navigation.push(title)
                setTimeout(() => toggleDisabled(false), 500)

            }}
            disabled={disabled}
        >
            <View style={{
                height: '60%', aspectRatio: 1, marginHorizontal: 5
            }}>
                <Image style={[styles.play,
                { tintColor: borderColor, opacity: .8 }]}
                    source={ require('../assets/play1.png')} />
            </View>
            <Text style={[styles.buttonText, text ? { fontSize: 30 } : {}]}>{text ? text : title} </Text>
        </TouchableOpacity>
    )
}
const IconButton = ({ navigation, title, disabled, toggleDisabled, borderColor, icon }) => {
    const { play } = useSound()

    return (
        <TouchableOpacity
            style={[styles.iconButton, { borderColor: borderColor }]}
            onPress={() => {
                toggleDisabled(true)
                navigation.navigate(title)
                setTimeout(() => toggleDisabled(false), 500)

            }}
            disabled={disabled}
        >
            <Image style={styles.icon} source={icon} />
        </TouchableOpacity>
    )
}

const BackButton = ({ navigation,  board }) => {
    return (

        <TouchableOpacity
            style={styles.backbutton}
            onPress={() => {
                if(board){
                    board.current.saveVisitedNodes(time)

                }
                navigation.navigate('word-maze')
            }}
        >
            <Image style={{ height: '100%', width: '100%', opacity: .7 }} source={require('../assets/backArrow2.png')} />
        </TouchableOpacity>

    )

}

const mapDifficultyToColor = (difficulty) => {
    if (difficulty === 'easy') {
        return colorScheme.four
    }
    else if (difficulty === 'moderate') {
        return colorScheme.three
    } else {
        return colorScheme.one
    }
}

const PuzzleButton = ({ navigation, disabled, toggleDisabled, info }) => {
    const name = `${info.title}`

    const progress = Math.min(info.initialProgress,info.mazeCount)
    const progressStr = `${info.initialProgress}/${info.mazeCount}`

    const puzzleCompleted = info.initialProgress >= info.mazeCount
    const source = !puzzleCompleted ? require('../assets/play1.png') : require('../assets/check1.png')
    return (
        <TouchableOpacity
            style={[styles.menuButton, styles.puzzleButton]}
            onPress={() => {
                toggleDisabled(true)
                if (!puzzleCompleted) {
                    storeItem('currentPuzzle', info.level)
                    navigation.push('puzzle', info)
                } else {
                    navigation.push('afterPuzzle', { puzzleNumber: info.level, title:info.title, difficulty:info.difficulty })

                }
                setTimeout(() => toggleDisabled(false), 500)

            }}
            disabled={disabled}
        >
            <View style={{ flexDirection: 'row', flex: 1.5, alignItems: 'center' }}>

                <View>
                    <Image style={[styles.play,
                    { tintColor: mapDifficultyToColor(info.difficulty), opacity: .8 },
                    {
                        height: '60%', aspectRatio: 1, marginHorizontal: 5
                    }]}
                        source={source} />
                </View>

                <Text style={[styles.puzzleText, styles.level]} > {name}</Text>
            </View>

            <Text style={[styles.puzzleText, styles.progress]}> {progressStr}</Text>


            <Text style={[styles.puzzleText, styles.difficulty]}>{info.difficulty}</Text>

        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    menuButton: {
        width: '75%',
        height: '10%',
        borderWidth: 5,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginVertical: 15,
        padding: 0,
        marginHorizontal: 0,
        borderRadius: 3,
        flexDirection: 'row',
        backgroundColor: buttonBackground

    },
    puzzleButton: {
        width: '95%',
        height: 60,
        borderWidth: 0,
        justifyContent: 'flex-start',
    },
    puzzleText: {
        fontSize: 20,
        flex: 1,
        textAlign: 'center',

    },

    buttonText: {
        flex: 1.6,
        color: 'black',
        fontSize: 35,
        letterSpacing: 1.5,
        alignSelf: 'center',
        opacity: .8,
        marginLeft: '5%'
    },
    iconButton: {
        borderRadius: 0,
        borderWidth: 0,
        alignSelf: 'stretch',
        marginHorizontal: 10,
        marginVertical: 20,
        padding: 5,
        backgroundColor: buttonBackground
    },
    icon: {
        height: 45,
        width: 45,
        alignSelf: 'center',
        tintColor: 'black',
        opacity: .65
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '60%',
        alignItems: 'stretch'

    },
    play2: {
        width: '70%',
        height: '70%',
        aspectRatio: 1,

    },
    play: {
        width: '100%',
        height: '100%',
        aspectRatio: 1,

    },
    headerText: {
        fontSize: 30
    },
    toggle: {
        borderRadius: 2,
        borderWidth: 7,
        borderColor: colorScheme.four,

    },
    toggleText: {
        fontSize: 30,
        padding: 10,
        color: 'black',

    },
    backbutton: {
        height: 40,
        width: 40,
        position: 'absolute',
        left: 1,
        bottom: 0,
        opacity: .8,
        zIndex: 10

    },
    backbuttonwrapper: {
        flex: 1
    },
    row2: {
        flexDirection: 'column',
        flex: 1,

    },
    boardSize: {
        fontSize: 25,
        color: 'black',
        opacity: .8,
        paddingVertical: 0,
        paddingHorizontal: 8,
        textAlign: 'center'

    }
})
export { BackButton, PlayButton, IconButton, PuzzleButton }