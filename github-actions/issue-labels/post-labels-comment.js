// Importing modules
var fs = require("fs")

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
 * Formats the label instructions into a template, then posts it to the issue.
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
  const formattedInstructions = formatComment(instructions, instructionsPlaceholder, path, null)
  const instructionsWithIssueCreator = formatComment(issueCreator, issueCreatorPlaceholder, null, formattedInstructions)
  await postComment(issueNum, instructionsWithIssueCreator)
}

// Create the comment based on the labels array
function makeComment(labels) {
  if (labels.length === 0) {
    const path = './github-actions/issue-labels/no-labels-template.md'
    return formatComment(null, null, path, null)
  }

  const path = './github-actions/issue-labels/add-labels-template.md'
  const labelsPlaceholder = '${labels}'
  const labelsToAdd = labels.map(label => LABELS_OBJ[label]).join(', ')
  return formatComment(labelsToAdd, labelsPlaceholder, path, null)
}

// Format the comment to be posted
function formatComment(replacementString, placeholderString, path, textToFormat) {
  const text = textToFormat === null ? fs.readFileSync(path).toString('utf-8') : textToFormat
  const commentToPost = text.replace(placeholderString, replacementString)
  return commentToPost
}

// Post comment on the proper issue
async function postComment(issueNum, instructions) {
  try {
    await github.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNum,
      body: instructions,
    })
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = main