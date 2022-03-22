// Global variables
var github 
var context

/**
 * @param {Object} github //github object
 * @param {Object} context //context object
 * @returns {object} //An object deciding whether we need to post the comment in the next action or not
 */


function main({g, c})
{
    github = g
    context = c
    const issueNum = context.payload.issue.number
    //Find out what the existing labels in the issue are:-
    var existingLabels = obtainlabels()

    //With the existing labels we see if we are to post the comment or not(based on whether there exists a relevant role tag or not) and return it as a boolean
    var shouldPost = postcomment(existingLabels)

    return({shouldPost,issueNum})
}


/**
 * 
 * @returns {array} // return an array of just label names
 */
function obtainlabels(){
    var currentLabels = context.payload.issue.labels
    //from the labels we currently have we extract the name property of each of them and return it in an array
    var namesOfCurrentLabels = currentLabels.map(label => label.name)
    return namesOfCurrentLabels
}

/**
 * 
 * @param {array} existingLabels //takes in as an argument the array of role tags returned by filterlabels function
 * @returns //A boolean which tells whether we are supposed to post a preliminary update based on the given issue checks
 */
function postcomment(existingLabels)
{
    //issue states that we are to post the comment if--> there is a role: back end/devOps tag...(continued on next comment)
    if(existingLabels.includes("role: back end/devOps" )){
        return true
    }

    // or if there is a role: front end tag
    else if(existingLabels.includes("role: front end")){
        return true
    }

    //or if there is a role: design tag
    else if(existingLabels.includes("role: design" )){
        return true
    }

    //or if there is a role: user research
    else if(existingLabels.includes("role: user research")){
        return true
    }

    //otherwise we return a false
    return false
}

module.exports = main