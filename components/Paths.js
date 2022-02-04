import React, { useEffect, useRef, useState } from 'react'
import {StyleSheet, View, Animated,Easing, useWindowDimensions} from 'react-native'

import { distance, centerOnNode,rotateColors,convertToLayout, point } from '../Utils';

import GlobalStyles from '../GlobalStyles'

const defaultFinishColor = GlobalStyles.defaultBackground.backgroundColor;

const toDegrees = (angle) =>{
    return angle * (180 / Math.PI);
  }


const calculateColor = (node, endPoint) => {
   
    const center = centerOnNode(node.pos, node.diameter);
   
    const hypo  = distance(endPoint.x - center.x, endPoint.y - center.y);
    const adj = distance(endPoint.x - center.x, 0);
    const angle = toDegrees(Math.acos(adj/ hypo));
 
    const xDir = Math.sign(endPoint.x - center.x);
    const yDir = Math.sign(endPoint.y - center.y)
   
    let color;
    const computedColors = rotateColors(node.colors, node.rot);
    
    
    if(xDir == 1 &&  angle < 45) {
      color = computedColors[1];
    }
    else if(xDir == -1 && angle < 45) {
      color = computedColors[3];
    }
    else if( yDir == -1 && angle >= 45) {
      color = computedColors[0];
    }
    else if(yDir == 1 && angle >= 45){
      color = computedColors[2];
    }
    else {
      color = "grey";
    }
  
    return color;
  }

const Fade = (props) => {
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(()=>{
    if(props.fade === true){
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.quad
    }).start(finished=>{
      props.onFade();
    });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[props.fadeOut]);
  return <Animated.View style= {{opacity:fadeAnim}}>
     {props.children}
    </Animated.View>
}


const Segment = ({startNode,endPoint, fixedColor}) => {

  if (startNode === null  || endPoint === null){
      return null;
    }

    const color = fixedColor || calculateColor(startNode, endPoint );
    
    const startPos = centerOnNode(startNode.pos,  startNode.diameter);
    const endPos  = endPoint; 
    
    const scaleX = distance(endPos.x - startPos.x, endPos.y - startPos.y);
    const scaleY = startNode.diameter / 5; // line width

    const opp = endPoint.y - startPos.y;
    const xDir = Math.sign(endPoint.x - startPos.x);
    const angle = xDir > 0 ? toDegrees(Math.asin(opp/ scaleX)) : 180 - toDegrees(Math.asin(opp/ scaleX)); // scaleX is also hypotenuse

    const rotate = `${angle}deg`;
    return (<View style={[styles.dot, 
                         convertToLayout(startPos),
                        { backgroundColor: color,
                         transform: [ 
                          { rotate: rotate },
                          { translateX: scaleX/2 },
                             { scaleX: scaleX }, 
                             { scaleY: scaleY },
                             ] }]}/>
                             



   );
}

const getFixedStyles = (startNode, endNode) => {
 const width = startNode.diameter/ 5;
 const rotatedColors = rotateColors(startNode.colors, startNode.rot);

  if(startNode.gridPos.row < endNode.gridPos.row){  // below
    const startPos1 = centerOnNode(startNode.pos,  startNode.diameter)
    const startPos = point(startPos1.x - width/2, startPos1.y)

    const length = Math.abs(endNode.pos.y - startNode.pos.y)
   
    return {
      backgroundColor: rotatedColors[2],
      top: startPos.y,
      left: startPos.x,
      width: width,
      height: length
    }
  }

  else if(startNode.gridPos.row > endNode.gridPos.row){ // above
    const startPos1 = centerOnNode(endNode.pos,  endNode.diameter)
    const startPos = point(startPos1.x - width/2, startPos1.y)
 
    const length = Math.abs(endNode.pos.y - startNode.pos.y)
    
    return {
      backgroundColor: rotatedColors[0],
      top: startPos.y,
      left: startPos.x,
      width: width,
      height: length
    }
  }
  else if(startNode.gridPos.col > endNode.gridPos.col){ // going left
    const startPos1 = centerOnNode(endNode.pos,  endNode.diameter)
    const startPos = point(startPos1.x, startPos1.y - width/2)

    const length = Math.abs(endNode.pos.x - startNode.pos.x)
    
    return {
      backgroundColor: rotatedColors[3],
      top: startPos.y,
      left: startPos.x,
      width: length,
      height: width
    }
  }
  else if(startNode.gridPos.col < endNode.gridPos.col){ // going right
    const startPos1 = centerOnNode(startNode.pos,  startNode.diameter)
    const startPos = point(startPos1.x, startPos1.y - width/2)

    const length = Math.abs(endNode.pos.x - startNode.pos.x)
    
    return {
      backgroundColor: rotatedColors[1],
      top: startPos.y,
      left: startPos.x,
      width: length,
      height: width
    }
  }
}
const getTransformStyles = (start , end, arrowWidth )=> { 
  if(start.row < end.row){
    return [{translateY: -arrowWidth/4},{rotate: '225deg'}]
  }
  if(start.row > end.row){//up
    return [{translateY: arrowWidth/4},{rotate: '45deg'}]
  }
  if(start.col > end.col) {
    return [{translateX: arrowWidth/4},{rotate: '-45deg'}]
  }
  else{
    return [{translateX: -arrowWidth/4},{rotate: '-225deg'}]
  }
}

const FixedSegment = ({startNode, endNode}) => {
    
    const fixedStyles = getFixedStyles(startNode, endNode);

    const isHorizontal = startNode.gridPos.row === endNode.gridPos.row ;

    fixedStyles['position'] = 'absolute';
    fixedStyles['justifyContent'] = 'center';
    fixedStyles['alignItems'] = 'center';

    const arrowWidth = startNode.diameter/5 / 1.5;
    const transformStyles = getTransformStyles(startNode.gridPos, endNode.gridPos, arrowWidth);
    return (<View style={[fixedStyles, {flexDirection: isHorizontal ? 'row': 'column'}]}>
      <View style={[arrowStyles(arrowWidth, arrowWidth, 'rgba(255,255,255,.5)' ), styles.lightener,{transform: transformStyles}]} />
    </View>
                             

   );
}
   
  const UserPath = ({segments, fades}) => {
    return (
      <View >
        {segments.map((seg,i) =>
            <FixedSegment startNode={seg.startNode} endNode={seg.endNode} key={i}/>
        )}
        {fades.map((seg,i) =>
            <Fade fade={true} onFade={()=> fades.pop()}  key={i}>
            <FixedSegment startNode={seg.startNode} endNode={seg.endNode}/>
            </Fade>
        )}
      </View>
    );
  }

const arrowStyles = (width, height, color) => {
  return {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: height,
    borderTopWidth:2,
    borderLeftWidth: 2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderColor: color,
    transform: [{rotate: '90deg'}],
    opacity: .8
  }
}



const animateArrow = (triangleAnim, distance ,start) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(triangleAnim, {
      toValue: -(distance),
      duration: 3000,
      easing: Easing.linear,
      delay: 0,
      isInteraction: false,
      useNativeDriver: true
    }),
    Animated.timing(triangleAnim, {
      toValue: 10,
      duration: 1,
      easing: Easing.linear,
      isInteraction: false,
      useNativeDriver: true
    }),
  
  ]));
}

const Arrow2 = ({moveAnim, width}) => {
  return <Animated.View style={[arrowStyles(width, width, 'black'),
      {
        transform: [{ translateY: moveAnim }, { rotate: '45deg' }] 
      }]}/>;
}

const BridgeSegment=  ({color, width, end}) => {

  const positionStyles = end === 'start' ? {bottom: '-20%'}  : {top: '-20%'}
  
  return <Animated.View  style={[{
    position: 'absolute',    
    left: 0,
    width: width,
    height:  '50%',
    backgroundColor: color,
    borderTopEndRadius:width
  }, positionStyles]}
   />;
}

  const CapSegment = ({end,node, won}) => {

    let color;

    const fadeAnim = useRef(new Animated.Value(.65)).current;
    const triangleAnim1 = useRef(new Animated.Value(0)).current;
    const triangleAnim2 = useRef(new Animated.Value(0)).current;

    if(end === 'finish') {
     color = won ? rotateColors(node.colors, node.rot)[0] : defaultFinishColor;
    }else{
      color = node.colors[2];
    }


    useEffect(() => {
      if ((won === true && end === 'finish')) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          isInteraction: false,
          easing: Easing.Quad
        }).start(finished=> setTimeout(()=>fadeAnim.setValue(.65),3000))
      }
      if(end==='start'){
        fadeAnim.setValue(1);
      }
    }, [won]);

    const triangleOffset = Math.floor(node.pos.y /2);

    useEffect(()=> {
     if(won=== false && color== defaultFinishColor){
        Animated.stagger(1500, [animateArrow(triangleAnim1, 75),animateArrow(triangleAnim2, 75) ]).start();
        //animateArrowForever(triangleAnim1, triangleOffset);
      }
    },[won]);
 
    const width = end === 'start' || won ? node.diameter / 6 : node.diameter / 5;
    const border = color==defaultFinishColor ? 2: 0;

    const left = node.pos.x + node.diameter/2 - (width/2) ;


    const triangleWidth = node.diameter / 5 - 6;
  
    return <Animated.View style={{
      backgroundColor: color,
      width: width,
      height: '100%',
      left: left,
      opacity: fadeAnim,
      borderLeftWidth: border,
      borderRightWidth: border,
      borderColor: 'rgba(0,0,0,.7)',
      transform: [{ translateY: end === 'start' ? -node.diameter/4 : node.diameter/4 },
      ],
      
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      borderTopEndRadius:width
    }}>
      {
        end !== 'start' && color === defaultFinishColor ?
          [<Arrow2 width= {triangleWidth} moveAnim={triangleAnim1} key={1} />,
           <Arrow2 width= {triangleWidth} moveAnim={triangleAnim2} key={2} />,
          ]
          : null}
     <BridgeSegment color={color} width={width} end={end}/>
    </Animated.View>
  }

  const styles  = StyleSheet.create({
    dot: {
        width:1,
        height:1,
        zIndex:0,
        top:0,
        left: 0,
        position: 'absolute',


      },
    lightener : { 
      zIndex:10,
      position: 'relative',
      margin:.5
        }
  });

  export {Segment, UserPath, Fade, CapSegment, calculateColor}

