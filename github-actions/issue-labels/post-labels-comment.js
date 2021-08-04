// Importing modules
var fs = require("fs")

// Global variables
var github
var context

/**
 * Formats the commandline instructions into a template, then posts it to the pull request.
 * @param {Object} g - github object  
 * @param {Object} c - context object 
 * @param {Boolean} actionResult - 
 * @param {Array} addedLabels -
 */

function main({ g, c }, { actionResult, addedLabels }) {
  github = g
  context = c
  console.log('added labels: ', addedLabels)

  // If the previous action failed, stop here
  if (actionResult === false){
    console.log('Previous gh-action failed. The current gh-action will end.')
    return
  }

  const issueCreator = context.payload.issue.user
  console.log('issue creator: ', issueCreator)
}

// Format the comment to be posted
function formatComment(instruction) {
  const path = './github-actions/issue-labels/labels-instructions-template.md'
  const text = fs.readFileSync(path).toString('utf-8')
  const completedInstuctions = text.replace('${labelInstructions}', instruction)
  return completedInstuctions
}

module.exports = main