import Globals from './Globals'

// closure to get next color
export default nextColor = () => {
        const colors = Globals.pathColors
        let curr = 0
        return ()=>
        {

                const color = colors[curr % colors.length]
                curr++
                return color
        }
}
