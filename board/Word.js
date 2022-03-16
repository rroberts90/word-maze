import { compressGridPos } from "../Utils"

// contains all pertanent data about word. Its letters, location nodes, solution nodes,
class Word {
    constructor(letters, nodes) {
        this.letters = letters
        this.nodes = nodes
    }

    save() {
        const save = {
            lt: this.letters,
            n: this.nodes.map(node=> compressGridPos(node.gridPos)),

        }
    }

    loadFromSave(savedWord){
        this.letters = savedWord.lt
    }
}

export default Word