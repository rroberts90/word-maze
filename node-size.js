import { useWindowDimensions } from "react-native"

const dynamicNodeSizeNoPosition = () => {
    return {
      borderRadius: Math.round(useWindowDimensions().width + useWindowDimensions().height) /2,
      width: useWindowDimensions().width * .2,
      height: useWindowDimensions().width * .2
    }
  }
  
  export {dynamicNodeSizeNoPosition}