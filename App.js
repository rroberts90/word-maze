import  React, {useState, useEffect} from 'react'
import { View, Text, Button, Image, TouchableOpacity, Pressable, StyleSheet, StatusBar, StatusBarStyle, SafeAreaView } from 'react-native'
import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import {getItem, initialize, storeItem} from './storage'

import Game from './Game'
import SettingsScreen from './components/Settings'
//import useSound from './Sounds'
import { PlayButton, IconButton } from './components/NavigationButtons'
import LevelPicker from './components/LevelPicker'

import Globals from './Globals'

const defaultBackground = Globals.defaultBackground
const colorScheme = Globals.colorScheme

function HomeScreen({ navigation }) {
    const [disabled, toggleDisabled]= useState(false)


    const {play}= useSound()

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}> WORD MAZE </Text>

            <PlayButton
            navigation = {navigation} 
            title={'daily'} 
            borderColor={colorScheme.one} 
            disabled={disabled} 
            toggleDisabled= {toggleDisabled}
            />



            <View style={[ styles.row]} >

                <IconButton 
                navigation={navigation} 
                title={'Settings'} 
                borderColor={'lightgrey'} 
                disabled={disabled} 
                toggleDisabled={toggleDisabled} 
                icon={require('./Icons/Settings.png')} />
            </View>
        </View>

    )
}


const Stack = createNativeStackNavigator()

const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: defaultBackground,
    },
  }

//console.log = function () {}

function App() {
    // eslint-disable react/display-name
    return (
        <NavigationContainer theme={MyTheme} >
            <Stack.Navigator screenOptions={{
                headerBackTitleVisible: false,
                
            }}
    >

                <Stack.Screen name="word-maze" component={HomeScreen} options={{
                    gestureEnabled: false,
                    headerShown: false
                }} />
                <Stack.Screen name="daily" component={Game} options={{
                    headerShown: false,
                    gestureEnabled: false
                }}

/>

                <Stack.Screen name="Settings" component={SettingsScreen} options={{
                    headerShown: false,
                    gestureEnabled: false
                }}/>



            </Stack.Navigator>
        </NavigationContainer>
    )
}

const styles = StyleSheet.create({
   container: {
     flex: 1, 
     alignItems: 'center', 
     justifyContent: 'center' 
   },
    loadingScreen: {
        backgroundColor: defaultBackground,
        width: '100%',
        height: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    defaultBackground: {backgroundColor:defaultBackground},
    row: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width:'60%',
        alignItems: 'stretch'
    }, 
    headerText: { 

        fontSize: 35,
        fontWeight: 'bold',
        letterSpacing: 1.25,
        marginVertical: '8%',
        color: 'rgba(30,30,30,.8)'
        

    },

})


export default App