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
  const formattedInstructions = formatComment(instructions, instructionsPlaceholder, path, null)
  const instructionsWithIssueCreator = formatComment(issueCreator, issueCreatorPlaceholder, null, formattedInstructions)
  await postComment(github, context, issueNum, instructionsWithIssueCreator)
}

/**
 * Create the comment based on the labels array
 * @param {Array} labels - the labels added to the issue
 * @return {String} - returns a string of instructions to be used for the comment
 */
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

/**
 * Formats the comment to be posted
 * @param {String} replacementString - the string to replace the placeholder in the md file
 * @param {String} placeholderString - the placeholder to be replaced in the md file
 * @param {String} path - the path of the md file to be formatted
 * @param {String} textToFormat - the text to be formatted. If null, use the md file provided in the path. If provided, format that text
 * @returns {String} - returns a formatted comment to be posted on github
 */
 function formatComment(replacementString, placeholderString, path, textToFormat) {
  const text = textToFormat === null ? fs.readFileSync(path).toString('utf-8') : textToFormat
  const commentToPost = text.replace(placeholderString, replacementString)
  return commentToPost
}

/**
 * Posts a comment on github
 * @param {Object} github - github object  
 * @param {Object} context - context object 
 * @param {Number} issueNum - the issue number where the comment should be posted
 * @param {String} comment - the comment to be posted
 */
 async function postComment(github, context, issueNum, comment) {
  try {
    await github.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNum,
      body: comment,
    })
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = main