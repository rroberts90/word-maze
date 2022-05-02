
const wordFile = './10000.txt'
const fs = require('fs')


 fs.readFile(wordFile,'utf8',(err,words)=> {

        const start = '{\"words\": ['
        const end = ']}'
        const wordList = words.split(/\W/).filter(item => item.length > 0).map(word=> `\"${word.trim()}\"`).join(',')
        //const wordList = words.split
        const content = start + wordList + end
        fs.writeFile('./10000.json', content, err=> {
                if(err) {
                        console.error(err)
                        return
                }
        })

})


