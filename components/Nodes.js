import { Animated, View, StyleSheet, Easing, Text, Image, ImageBackground, useWindowDimensions } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { convertToLayout, point } from '../Utils';
import { Symbol, Special } from './Symbols'

const Node_Width = 60;

import GlobalStyles from '../GlobalStyles'

const defaultNodeColor = GlobalStyles.defaultNodeColor.backgroundColor;

const measure = (ref, node, afterUpdate) => {
  if (ref.current) {
    ref.current.measureInWindow((x, y, width, height) => {
      if(y > 0) {
        node.pos = { x: x, y: y };
      }
      node.diameter = Math.floor(width);
      if (afterUpdate) {
        afterUpdate();
      }
    });

  } else {
    throw 'measure node error'
  }
}

const borderStyles = (colors) => {
  return {
    borderTopColor: colors[0],
    borderRightColor: colors[1],
    borderBottomColor: colors[2],
    borderLeftColor: colors[3],
  }
}

const dynamicNodeSize = (diameter, tutorial) => {

  return {
    height: '80%',
    aspectRatio: 1,

    backgroundColor: "lightgrey",
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  };
}

const borderSize = (diameter) => {
  return {
    borderRadius: diameter / 2,
    borderWidth: Math.floor(diameter / 6) + .5
  }
}

const dynamicNodeSizeNoPosition = (diameter) => {
  return {
    width: diameter,
    height: diameter,
    borderRadius: diameter / 2,
    borderWidth: Math.floor(diameter / 6) + .5
  };
}

const Frozen = ({ node, rotAnim }) => {

  const width = (node.diameter - node.diameter / 12 - 10) / 2;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (node.frozen === 0) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.Quad
      }).start();
    }
    else if (node.frozen > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.Quad
      }).start();
    }
  }, [node.frozen]);

  return (
    <Animated.View style={{
      position: 'absolute', opacity: fadeAnim, transform: [{
        rotate: rotAnim.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '-360deg']
        })
      }]
    }}>


      <Image style={styles.lock} source={require('../Icons/Lock1.png')} />

      <View style={{
        backgroundColor: node.special === 'freezer' ? 'white' : 'dimgrey',
        opacity: .2,
        width: node.diameter + 1,
        height: node.diameter + 1,
        borderWidth: node.diameter / 6,
        borderRadius: node.diameter / 2,
        borderColor: node.special === 'freezer' ? 'white' : 'dimgrey'
      }}>

      </View>

    </Animated.View>);
}

const NodeView = (props) => {

  const rotAnim = useRef(new Animated.Value(0)).current;
  const measureRef = useRef(null);
  useEffect(() => {

    Animated.timing(rotAnim, {
      toValue: props.node.rot * -90,
      duration: props.node.loaded ? 1000 : 0,
      useNativeDriver: true,

    }).start();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.node.rot]);


  const colorStyles = borderStyles(props.node.colors);

  return (
    <Animated.View ref={measureRef} style={[
      styles.nodeSize,
      borderSize(props.node.diameter),
      colorStyles,
      { backgroundColor: props.node.special === 'freezer' ? 'rgb(80,80,80)' : defaultNodeColor },
      {
        transform: [{
          rotate: rotAnim.interpolate({
            inputRange: [0, 360],
            outputRange: ['0deg', '360deg']
          })
        }]
      }
    ]}

      onLayout={(event) => {
        measure(measureRef, props.node, props.afterUpdate);
        //props.node.pos = {x:event.nativeEvent.layout.x,y:event.nativeEvent.layout.y};
        //console.log(`layout x: ${event.nativeEvent.layout.x}`);

      }}
    >

      <Image source={require('../Icons/nodeTexture4.png')} style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: props.node.diameter / 2, opacity: .35 }} />

      <Special node={props.node} gameType={props.gameType} />

      <Symbol group={props.node.symbol} diameter={props.node.diameter} frozen={props.node.frozen} freezer={props.node.special === 'freezer'} theme={props.node.theme}/>

      <Frozen node={props.node} rotAnim={rotAnim} />

    </Animated.View>
  );
}


const Pulse = (props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sizeAnim = useRef(new Animated.Value(1)).current;


  const colorStyles = borderStyles(props.colors);
  useEffect(() => {
    if (props.GOGOGO > 0) {

      //console.log("pulsing");
      fadeAnim.setValue(1);
      sizeAnim.setValue(1);
      const scaleBy = 1.35 //props.isFinish? 1.35 :  1.35;
      const duration = 500//props.isFinish ? 500 * (1.95 / 1.35) : 500;

      Animated.parallel([
     
        Animated.timing(sizeAnim, {
          toValue: scaleBy,
          duration: duration,
          useNativeDriver: true,
          isInteraction: false,
          easing: Easing.linear

        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
          isInteraction: false,
          easing: Easing.quad
        })
      ]).start(finished => {
        if (!finished) {
          // make sure that the pulse's opacity is 0 at end
          fadeAnim.setValue(0);

        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.GOGOGO]);

  return <Animated.View
    style={[
      dynamicNodeSizeNoPosition(props.diameter),
      styles.pulse,
      colorStyles,
      convertToLayout(props.pos),
      {
        opacity: fadeAnim,
        borderWidth: props.diameter/2,
        transform: [{ scale: sizeAnim }]
      }]}

  />

}




const styles = StyleSheet.create({
  nodeSize: {
    height: '80%',
    aspectRatio: 1,
    backgroundColor: "rgb(220,220,220)",
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },

  nodeBorder: {
  },

  pulse: {
    position: "absolute",
    backgroundColor: "darkgrey",
    zIndex: 0
  },

  textSymbol: {
    fontSize: 30
  },

  board: {
    flex: 1,
    justifyContent: "space-evenly",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    paddingHorizontal: 5
  },
  tutorial: {
    flex: 1
  },

  horizontalLine: {
    position: 'absolute',
    width: '100%'
  },
  lock: {
    position: 'absolute',

    width: '65%',
    height: '65%',
    alignSelf: 'center',
    top: '15%',
    opacity: 1,
  }
});

export { NodeView, Pulse, dynamicNodeSize, dynamicNodeSizeNoPosition };

//      <View style={{ alignSelf: 'flex-end', width: width - 1, height: 2, backgroundColor: 'rgb(36,36,36)', position: 'absolute', top: '55%', right: 1, borderRadius: 2 }} />

// //      <View style={{
//   width: width - 1, height: 2, backgroundColor: 'rgb(36,36,36)', position: 'absolute', alignSelf:
//   'flex-start', top: '55%', left: 1, borderRadius: 5
// }} />