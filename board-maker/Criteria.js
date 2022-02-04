
const puzzle1 = { group: .5, 
    directLinks: .4, 
    freezer: .2, 
    rotateCC: .1,
     falsePaths: 7, 
     minLength: 15, 
     maxFalsePathLength: 15, 
     maxLength: 100, 
     circles: 2 
 }
 const endlessHard = { 
    gameType: 'endless' ,
    group: .5, 
    directLinks: .4, 
    freezer: .1, 
    rotateCC: .05,
     falsePaths: 8, 
     minLength: 14, 
     maxFalsePathLength: 14, 
     maxLength: 100, 
     circles: 2 ,
     minSymbols: 12
 }

// remember difficulty == false means hard 
const getCriteria = (gameType, difficulty, largeBoard,level) => {
    /*console.log(` Progress level: ${level}`)
    console.log(` Difficulty level: ${difficulty}`)*/

    //console.log(`criteria: largeBoard ${largeBoard}\n   difficulty: ${difficulty}`)

    if(gameType === 'endless' && !difficulty) {
 
         if(!largeBoard){
             return endlessHard
         }else{
            let hard = []
            Object.assign(hard, endlessHard)
            hard.minLength += 8
            hard.maxFalsePathLength += 4
            hard.falsePaths += 10
            return hard
         }
    }

    let criteria = {group: .4, 
                    directLinks: .1, 
                    freezer: 0, 
                    rotateCC: 0, 
                    falsePaths: 3,
                     minLength: 15, 
                     maxLength: 20, 
                     maxFalsePathLength: 5, 
                     circles:2,
                     gameType: gameType}
    if(level <= 5){
        // base criteria
        return criteria
    }
    else if(level > 5 && level<=10){
        criteria.directLinks = .2
        criteria.falsePaths =4
        criteria.maxFalsePathLength = 8

    }
    else if(level > 10 && level <= 20){
        criteria.directLinks = .2
        criteria.group = .5
        criteria.falsePaths =6

        criteria.maxFalsePathLength = 9
    }
    else{
        criteria.directLinks = .3
        criteria.group = .5
        criteria.maxFalsePathLength = 10
        criteria.falsePaths = 6
        criteria.freezer = .1
        criteria.minLength = 15
        criteria.circles = 2

    }
    if(largeBoard) {
        criteria.minLength += 3
        criteria.falsePaths += 3
    }
    return criteria
}
export default getCriteria