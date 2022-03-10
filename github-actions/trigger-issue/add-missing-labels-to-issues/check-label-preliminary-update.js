// Global variables
var github 
var context

/**
 * @param {Object} github //github object
 * @param {Object} context //context object
 * @returns {object} //An object deciding whether we need to post the comment in the next action or not
 */


function main({g, c}){
github = g
context = c
const issueNum = context.payload.issue.number
//Find out what the existing labels in the issue are:-
var existinglabels = obtainlabels()

//We run checks on the exisiting label names to see if the checks of the issue match 
var filteredlabels = filterlabels(existinglabels)

//With the filtered role labels we see if we are to post the comment or not and return it as a boolean
var shouldpost = postcomment(filteredlabels)

return({shouldpost,issueNum})
}


/**
 * 
 * @returns {array} // return an array of just label names
 */
function obtainlabels(){
    var currentlabels = context.payload.issue.labels
    //from the labels we currently have we extract the name property of each of them and return it in an array
    var namesofcurrentlabels = currentlabels.map(label = label.name)
    return namesofcurrentlabels
}

/**
 * 
 * @param {array} labelsnamearray //contains the array of label names returned by obtainlabels
 * @returns {array} //an array of label containing the word "role"
 */
function filterlabels(labelsnamearray){
    var regexp = new RegExp(`\\brole\\b`, 'gi')
    let rolesarray = []
    labelsnamearray.foreach((label)=>{
        if(regexp.test(label)){
            rolesarray.push(label)
        }
    })
    return rolesarray
}


/**
 * 
 * @param {array} rolesarray //takes in as an argument the array of role tags returned by filterlabels function
 * @returns //A boolean which tells whether we are supposed to post a preliminary update based on the given issue checks
 */
function postcomment(rolesarray)
{
    //issue states that only if the roles contain back end/devOps ...(continued on next comment)
    if(rolesarray.contains("role: back end/devOps" )){
        return true
    }

    // or if the roles contain both front end and design are we supposed to post the comment
    else if(rolesarray.contains("role: front end") && rolesarray.contains("role: design" )){
        return true
    }

    return false
}

module.exports = main