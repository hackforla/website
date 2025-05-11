// Import modules
const retrieveLabelDirectory = require('../../utils/retrieve-label-directory');

// Global variables
var github 
var context

// Label constants use labelKeys to retrieve current labelNames from directory
const RELEVANT_ROLES = [
    roleFrontEnd,
    roleBackEndDevOps,
    roleDesign,
    roleUserResearch
  ] = [
    "roleFrontEnd",
    "roleBackEndDevOps",
    "roleDesign",
    "roleUserResearch",
  ].map(retrieveLabelDirectory);

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
    // Compare whether a RELEVANT_ROLE is included in the existingLabels
    const roleFound = RELEVANT_ROLES.some(label => existingLabels.includes(label));
    console.log(roleFound ? '\nFound relevant role: Continue' : '\nMissing relevant role: Halt');
    return roleFound
  }

module.exports = main