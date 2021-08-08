const comments = require("../utils/comments")

// Constant variables
const LABELS_OBJ = {
  'size: missing': 'Size',
  'role missing': 'Role',
  'Feature Missing': 'Feature'
}

// Global variables
var github
var context

/**
 * Format the label instructions into a template, then post it to the issue
 * @param {Object} g - github object  
 * @param {Object} c - context object 
 * @param {Boolean} actionResult - the previous gh-action's result
 * @param {Array} addedLabels - the labels added to the issue
 * @param {Number} issueNum - the number of the issue where the post will be made 
 */
async function main({ g, c }, { actionResult, addedLabels, issueNum }) {
  github = g
  context = c

  // If the previous action failed, stop here
  if (actionResult === false){
    console.log('Previous gh-action failed. The current gh-action will end.')
    return
  }

  const issueCreator = context.payload.issue.user.login
  const path = './github-actions/issue-labels/labels-instructions-template.md'
  const instructionsPlaceholder = '${labelInstructions}'
  const issueCreatorPlaceholder = '${issueCreator}'

  const instructions = makeComment(addedLabels)
  const formattedInstructions = comments.formatComment(instructions, instructionsPlaceholder, path, null)
  const instructionsWithIssueCreator = comments.formatComment(issueCreator, issueCreatorPlaceholder, null, formattedInstructions)
  await comments.postComment(github, context, issueNum, instructionsWithIssueCreator)
}

/**
 * Create the comment based on the labels array
 * @param {Array} labels - the labels added to the issue
 * @return {String} - returns a string of instructions to be used for the comment
 */
function makeComment(labels) {
  if (labels.length === 0) {
    const path = './github-actions/issue-labels/no-labels-template.md'
    return comments.formatComment(null, null, path, null)
  }

  const path = './github-actions/issue-labels/add-labels-template.md'
  const labelsPlaceholder = '${labels}'
  const labelsToAdd = labels.map(label => LABELS_OBJ[label]).join(', ')
  return comments.formatComment(labelsToAdd, labelsPlaceholder, path, null)
}

module.exports = main