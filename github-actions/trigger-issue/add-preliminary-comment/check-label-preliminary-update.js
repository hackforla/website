// Global variables
var github 
var context

/**
 * @description - entry point of the whole javascript file, finds out whether we need to post the comment or not and returns in the boolean variable shouldpost.
 * @param {Object} github - github object
 * @param {Object} context - context object
 * @returns {object} - An object deciding whether we need to post the comment in the next action or not
 */

function main({g, c}){
    github = g
    context = c
    const issueNum = context.payload.issue.number
    //Find out what the existing labels in the issue are:-
    var existingLabels = obtainLabels()
    
    //With the existing labels we see if we are to post the comment or not(based on whether there exists a relevant role tag or not) and return it as a boolean
    var shouldPost = postComment(existingLabels)

    return({shouldPost,issueNum})
}

/**
 * @description - this function gets the current label names and returns it in the array nameOfCurrentLabels
 * @returns {array} - return an array of just label names
 */

function obtainLabels(){
    var currentLabels = context.payload.issue.labels
    //from the labels we currently have we extract the name property of each of them and return it in an array
    var namesOfCurrentLabels = currentLabels.map(label => label.name)
    return namesOfCurrentLabels
}


/**
 * @description - this function returns a boolean depending on whether the existing labels contain a relevant role tag 
 * @param {array} existingLabels - takes in as an argument the array of role tags returned by obtainLabels function
 * @returns - A boolean which tells whether we are supposed to post a preliminary update based on the given issue checks
 */

function postComment(existingLabels){
    //issue states that we are to post the comment if--> there is a role: back end/devOps tag...(continued on next comment)
    if(existingLabels.includes("role: back end/devOps")){
        return true
    }

    // or if there is a role: front end tag
    else if(existingLabels.includes("role: front end")){
        return true
    }

    //or if there is a role: design tag
    else if(existingLabels.includes("role: design")){
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