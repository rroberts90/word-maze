import React, { useEffect, useState, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Easing } from 'react-native'
import { BackButton } from './NavigationButtons'
import Globals from '../Globals'
import { getItem } from '../storage'
const defaultBackground = Globals.backgroundColor

const Header = ({ title1, item1, title2, item2, fontAnim, navigation }) => {
    return (
        <View style={styles.box2}>
            <BackButton navigation={navigation} />
            <View style={styles.duo}>
                <Text style={styles.header}>{title1} </Text>
                <Animated.View style={[styles.timetext, { transform: [{ scale: fontAnim }] }]}>
                    <Text style={styles.timetext}>{item1} </Text>
                </Animated.View>
            </View>
            <View style={[styles.duo]}>
                <Text style={styles.header}>{title2} </Text>
                <Text style={styles.timetext}>{item2}</Text>
            </View>
            <View style={{ position: 'absolute', left: 0, bottom: 0, justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
                <View style={styles.bar} />
            </View>

        </View>
    )
}

const InfoHeader = ({ navigation, title, overrideDestination }) => {

    return (
        <View style={styles.box3}>
            <BackButton navigation={navigation} overrideDestination={overrideDestination} />
            <Text style={styles.title}>{title} </Text>
            <View style={{ position: 'absolute', left: 0, bottom: 0, justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
                <View style={styles.bar} />
            </View>
        </View>
    )
}

const PuzzleHeader = ({ navigation, time, info, getGoalInfo, level, levelDisplay, board }) => {
    const goalInfo = getGoalInfo(time, info.difficulty)
    //                <Text style={[styles.timetext, {alignSelf:'flex-end'}]}> {goalInfo.time} s</Text>
    const sizeAnim = useRef(new Animated.Value(0)).current
    const fadeAnim = useRef(new Animated.Value(1)).current

    const [puzzleTimer, togglePuzzleTimer] = useState(true)

    useEffect(() => {
        getItem('puzzleTimer').then(pT => togglePuzzleTimer(pT))
    }, [])

    useEffect(() => {
        if (level > 0 && goalInfo.color != defaultBackground) {
            Animated.sequence([
                Animated.timing(sizeAnim, {
                    toValue: 1.25,
                    isInteraction: false,
                    useNativeDriver: true,
                    duration: 1000,
                    easing: Easing.in(Easing.quad)
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    isInteraction: false,
                    useNativeDriver: true,
                    duration: 3000,
                    easing: Easing.cubic
                })
            ]).start(onFinish => {
                sizeAnim.setValue(0)
                fadeAnim.setValue(1)
            })

        }
    }, [level])

    return (
        <View style={styles.box3}>

            <BackButton navigation={navigation} board={board} time={time} />

            <View style={{ position: 'absolute', left: 0, bottom: 0, justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
                <View style={styles.bar} />
            </View>
            <View style={styles.duo}>
                <Text style={styles.header}>#</Text>
                <Text style={styles.timetext}>{levelDisplay} </Text>
            </View>

            <View style={styles.duo}>
                {puzzleTimer ? <Text style={styles.timetext}>{time} s</Text> : null}
            </View>


        </View>
    )
}

const styles = StyleSheet.create({
    duo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'

    },
    box2: {
        position: 'absolute',
        width: '100%',
        height: '10%',
        top: 0,
        backgroundColor: defaultBackground,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'flex-end',
        paddingBottom: 5
    },
    box3: {

        flex: 1,
        width: '100%',
        backgroundColor: defaultBackground,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: 5,

    },
    header: {
        fontSize: 16,
        letterSpacing: 1,
        opacity: .6,


    },
    timetext: {
        fontSize: 23,
        opacity: .7,

    },
    bar: {
        width: '95%',
        borderRadius: 10,
        height: 2,
        backgroundColor: 'black',
        opacity: .5,
        alignSelf: 'center'
    },
    title: {
        fontSize: 25,
        opacity: .8
    },
    star: {
        height: 40,
        width: 40,
        zIndex: 40
    }

})
export { InfoHeader, PuzzleHeader }
export default Header