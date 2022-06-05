import React, { useEffect,useState, useRef } from 'react'
import {StyleSheet, View, Image, Text} from 'react-native'


  const Letter = ({letter}) => {
    return <Text style={styles.letter} allowFontScaling={true}>{letter}</Text>
  }
  


  const styles = StyleSheet.create({

      letter: {
        position:'absolute',
        fontSize: 33,
        fontFamily: 'Avenir-Book'
        
      }

  })
  
  export { Letter}