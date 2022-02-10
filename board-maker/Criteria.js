
 const basic = { 
    group: .5, 
    directLinks: .4, 
    freezer: .1, 
    rotateCC: .05,
     falsePaths: 8, 
     maxFalsePathLength: 14, 
     maxLength: 100, 
     circles: 2 ,
     minPathLength: 20
 }

// remember difficulty == false means hard 
const getCriteria = (difficulty) => {

    return basic;
}
export default getCriteria