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


//With the existing labels we see if we are to post the comment or not(based on whether there exists a role:Backend/devOps tag or not) and return it as a boolean
var shouldpost = postcomment(existinglabels)

return({shouldpost,issueNum})
}


/**
 * 
 * @returns {array} // return an array of just label names
 */
function obtainlabels(){
    var currentlabels = context.payload.issue.labels
    //from the labels we currently have we extract the name property of each of them and return it in an array
    var namesofcurrentlabels = currentlabels.map(label => label.name)
    return namesofcurrentlabels
}

/**
 * 
 * @param {array} namesarray //takes in as an argument the array of role tags returned by filterlabels function
 * @returns //A boolean which tells whether we are supposed to post a preliminary update based on the given issue checks
 */
function postcomment(namesarray)
{
    //issue states that only if the roles contain back end/devOps ...(continued on next comment)
    if(namesarray.includes("role: back end/devOps" )){
        return true
    }

    // or if the roles contain both front end and design are we supposed to post the comment
    else if(namesarray.includes("role: front end")){
        return true
    }

    else if(namesarray.includes("role: design" )){
        return true
    }

    else if(namesarray.includes("role: user research")){
        return true
    }

    return false
}

module.exports = main