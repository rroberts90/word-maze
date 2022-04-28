import { compressGridPos } from "../Utils"

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