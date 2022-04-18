import { Animated, View, StyleSheet, Easing, Text, Image, ImageBackground, useWindowDimensions } from "react-native"
import React, { useEffect, useRef, useState } from "react"



import Globals from '../Globals'
import { convertToLayout } from "../Utils"
import { backgroundColor } from "react-native/Libraries/Components/View/ReactNativeStyleAttributes"


const Wheel = ({nodes, color, children}) => {
    return (
        <View style ={{
            borderRadius: Math.round(useWindowDimensions().width + useWindowDimensions().height) /2,
            width: useWindowDimensions().width * .5,
            aspectRatio:1,
            backgroundColor: 'rgba(220,220,220,.5)',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-evenly',
            alignContent: 'space-around',
        }}>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
  wheel: {

  },
  centerCircle: {
    position: 'absolute',
    height: '30%',
    width: '30%'

  }
})

export default Wheel