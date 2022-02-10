import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, useWindowDimensions, Vibration} from 'react-native'

import { Pulse} from './Nodes';
import GridView from './Grid';
import {Cursor} from './UserInput';
import DemoCursor from './DemoCursor';
import {point, centerOnNode,logGridPos,rotateColors} from '../Utils';
import { UserPath } from './Paths';
import useInterval from './useInterval.js';
import { levelUp, getItem, storeItem} from '../Storage';
import useSound from '../Sounds'
import {Arrows} from './Symbols'

import GlobalStyles from '../GlobalStyles'
const defaultBackground = GlobalStyles.defaultBackground.backgroundColor;


const Level = ({onWin, l, getBoard, current, hintEl, undoEl, restartEl, setMoves, setTime}) => {
  const windowWidth = useWindowDimensions().width; 
  const height = useWindowDimensions().height; 

  const [win, setWin] = useState(()=> false);

  const [currentNode, setCurrentNode] = useState(()=>{return getBoard().getCurrentNode()});

  const lineSegments = useRef([]);
  const fadeSegments = useRef([]);
  const [pulser, triggerPulser] = useState(()=>0); // triggers pulse animation

  const intervalId = useRef(null);

  const [defaultPulser, setDefaultPulser] = useState(0);
  const [loading, toggleLoading] = useState(true);

  const {play} = useSound();

  useEffect(()=>{

    if (l !== 0) {
    resetCurrentNode(1600);
    }


    setWin(false);
    setDefaultPulser(0);
    getBoard().restart();
    lineSegments.current = [];

    return () => {

  }
  },[l]);

  const addLineSegment = (node, next)=> {

    const seg = {
     startNode:node,
     endNode:next,
    };
     lineSegments.current  = [...lineSegments.current, seg];
  }

  useInterval(() => {
    
    if(getBoard().getCurrentNode() === getBoard().start){
    triggerPulser(currentValue=> currentValue+1);
    }
    setDefaultPulser(defaultPulser + 1);
    return ()=> {
      triggerPulser(0);
      setDefaultPulser(0);
    };
  }, 5000);
  
  // sets the endPointto the CurrentNode position after it's position is measurable.
  const updateAfterLayout = () => {


    resetCurrentNode(1);


    setTimeout(() => {
      if (loading) {
        if (lineSegments.current.length === 0 && getBoard().visitedNodes.length > 1) {
          // there are saved nodes, fire up some starter line segments
          getBoard().visitedNodes.reduce((prev, curr) => {
    
            addLineSegment(prev, curr);
            return curr;
          });
        }

        getBoard().grid.forEach((row) =>
          row.forEach((node) =>{  node.loaded = true}));
        toggleLoading(false);
      }
    }, 500);

  }

  /** 
   Sets a new current node. 
   Adds segment to previous node
  */
  const updateNodeBundle = (next,node, hint) => {


   const prevNode = node;
   setCurrentNode(next);

   addLineSegment(prevNode,next);


   triggerPulser(currentValue => currentValue+1);
  
   if(next === getBoard().finish ) {
     getBoard().score = l+1;
    levelUp(getBoard());  

    setWin(true); // triggers end line fade in 
    hintEl.current.onPress = null;
    setTimeout(()=>onWin(currentLevel=> currentLevel+1), 0);



    // check if vibrate is AOK with user
    getItem('vibrate').then(vibrate=> {
      if(vibrate){
        Vibration.vibrate();
      }

    });


   }else{
    play(hint ? 'button' : 'connect');

   }
   if(next.special === 'booster') {
    setMoves(moves=> moves- 5);
    setTime(time => time+5);
    next.special = null;
    setMoves(moves=> {
      return moves > 0 ? moves+1 : moves
    });
    

 }else{
  setMoves(moves=> moves+1);

 }

  };

  function detectMatch(point) {

  const node = getBoard().getCurrentNode();
  
   if(node === getBoard().finish || getBoard().forcedFinish) { // prevents glitch where user can trigger multiple game finishes
    return {newNode: null, prevPoint:null};

   }

   const {candidate} = node.matchPoint(point);
    
    if (candidate) {

      const { next, prev } = getBoard().visitNode(candidate);
      if (next) {

        updateNodeBundle(next, node);
        return {newNode: next, prevPoint: null};
      }
      else if (prev) {
        onUndo();
        return {newNode: null, prevPoint: prev.pos};
      }
      else{
        return {newNode: null, prevPoint: null};

      }
    } else {

      return {newNode: null, prevPoint:null};
    }

  }

  const currPosF =  currentNode.pos;

  const currX = currentNode.pos.x;
  const currY = currentNode.pos.y;

  function resetCurrentNode(makePulseWait){
    
    setCurrentNode(getBoard().getCurrentNode());

    if(!makePulseWait) {
        triggerPulser(currentValue => currentValue+1);
    }else{
        setTimeout( ()=>  {
          if( pulser) {
            triggerPulser(currentValue => currentValue+1)
          }
        }
        ,makePulseWait);
    }

  }

  function sleep(ms) {
    return new Promise(resolve=> setTimeout(resolve,ms));
  }
   
  async function onHint() {

    const board = getBoard();
    const {removeCount, nextNode}  = getBoard().hint();

    const duration = 300;
    for(var i =0; i< removeCount;i++){
        onUndo();
        await sleep(duration);
    }

     const prev = getBoard().getCurrentNode();
     const {next} = getBoard().visitNode(nextNode);

     if(next === null) {
       throw 'solution is not accurate';
     }
      updateNodeBundle(next, prev, true);
      return removeCount * duration + 500;
  }

  function onUndo(button) {

    if (getBoard().removeLast()) {
      play(button ? 'button' : 'undo');
      const seg = lineSegments.current.pop();
      fadeSegments.current.push(seg);
      resetCurrentNode();

    }
  }

  function onRestart() {
    getBoard().restart();
    lineSegments.current = [];
    resetCurrentNode();
    setWin(false);
  }

  useEffect(()=> {
    if(current) {
    hintEl.current.onPress = onHint;
    undoEl.current.onPress = onUndo;
    restartEl.current.onPress = onRestart;
    }
  }, [current]);

  const loadingWall = loading ? <View style={styles.loadingWall}/> : null;

  return ( 

    <View style={[styles.container]} >

<Arrows  grid={getBoard().grid}/>

      <UserPath segments={lineSegments.current} fades={fadeSegments.current} />
      {getBoard().gameType==='tutorial'  && l === 0? <DemoCursor node={getBoard().start} nextNode={getBoard().solution[1]} first={true} firstNode={getBoard().start}/>: null}

      <Pulse pos={currPosF} colors={rotateColors(currentNode.colors, currentNode.rot)} GOGOGO={pulser} diameter = {currentNode.diameter} isFinish={currentNode == getBoard().finish} />

      <Cursor node={currentNode} currPoint={point(currX, currY)} triggerPulser={triggerPulser} detectMatch = {detectMatch} intervalId={intervalId} />
      <GridView board={getBoard()} afterUpdate={updateAfterLayout} height={height} won={win} triggerPulser={triggerPulser}/>
      {getBoard().gameType==='tutorial' && l === 0? <DemoCursor node={getBoard().start} nextNode={getBoard().solution[1]}  firstNode={getBoard().start}/>: null}

      {loadingWall}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
  },
  loadingWall: {
    position: 'absolute',
     width:'100%', 
     height:'110%', 
     backgroundColor:defaultBackground, 
     zIndex: 20 }

});

export default Level;