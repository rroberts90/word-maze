import React, { useRef, useState, useEffect } from "react"
import { Animated, PanResponder, StyleSheet, View, Image } from "react-native"
import { dynamicNodeSizeNoPosition } from './Nodes'
import { Segment } from "./Paths"
import { centerOnNode } from '../Utils'


const DemoCursor = ({ node, nextNode, first, firstNode }) => {
    //const [endPoint, setEndpoint] = useState({x:0, y:0})
    const endPointAnim = useRef(new Animated.ValueXY(0, 0)).current
    const [endPoint, setEndPoint] = useState({ x: 0, y: 0 })
    const fadeAnim = useRef(new Animated.Value(1)).current

    const [showSegment, setSegment] = useState(true)
    useEffect(() => {
        endPointAnim.addListener((value) => { setEndPoint({ x: value.x, y: value.y }) })

        setTimeout(() => {
           
            const centeredEnd = centerOnNode(nextNode.pos, nextNode.diameter)
            const centeredStart = centerOnNode(node.pos, node.diameter)
            endPointAnim.setValue(centeredStart)
            fadeAnim.setValue(1)
            Animated.sequence([Animated.timing(endPointAnim, {
                delay: 1000,
                toValue: { x: nextNode.pos.x - 100, y: node.pos.y + 120 },
                duration: 1500,
                useNativeDriver: true
            }),
            Animated.timing(endPointAnim, {
                delay: 0,
                toValue: { x: nextNode.pos.x + 100, y: node.pos.y - 120 },
                duration: 1500,
                useNativeDriver: true
            }),
            Animated.timing(endPointAnim, {
                delay: 0,
                toValue: centeredEnd,
                duration: 1500,
                useNativeDriver: true
            })
            ]).start(finished => {
                endPointAnim.removeAllListeners()
                setTimeout(() => {
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true
                    }).start()

                }, 2000)

            })
        }, 1000)
    }, [])

    if (first && showSegment && endPoint.x !== 0 && node === firstNode) {
        return (<Animated.View style={{ opacity: fadeAnim }}>
            <Segment startNode={node} endPoint={endPoint} />
        </Animated.View>)
    }
    else if(node === firstNode) {
        return <Animated.Image source={require('../Icons/hand2.png')}
            style={{
                resizeMode: 'stretch',
                tintColor: 'black',
                opacity: .8,
                position: 'absolute',
                left: -25,
                top: 0,
                transform: endPointAnim.getTranslateTransform(),
                opacity: fadeAnim
            }} />
    }else {
        return null
    }

}

export default DemoCursor