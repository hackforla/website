var fs = require("fs")

// Constant variables
const LABELS_OBJ = {
  'Complexity: Missing': 'Complexity',
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

  const instructions = makeComment(addedLabels)
  if (instructions === null) {
    return
  }
  await postComment(issueNum, instructions)
}

/**
 * Create the comment based on the labels array
 * @param {Array} labels - the labels added to the issue
 * @return {String} - returns a string of instructions to be used for the comment
 */
function makeComment(labels) {
  const issueCreator = context.payload.issue.user.login

  if (labels.length === 0) {
    return;
  }
 
  // Replace the issue creator placeholder first
  const commentObject = {
    replacementString: issueCreator,
    placeholderString: '${issueCreator}',
    filePathToFormat: './github-actions/trigger-issue/add-missing-labels-to-issues/add-labels-template.md',
    textToFormat: null
  }
  const commentWithIssueCreator = formatComment(commentObject)

  // Replace the labels placeholder
  const labelsToAdd = labels.map(label => LABELS_OBJ[label]).join(', ')
  const labelsCommentObject = {
    replacementString: labelsToAdd,
    placeholderString: '${labels}',
    filePathToFormat: null,
    textToFormat: commentWithIssueCreator
  }
  return formatComment(labelsCommentObject)
}

/**
 * Formats the comment to be posted based on an object input
 * @param {String} replacementString - the string to replace the placeholder in the md file
 * @param {String} placeholderString - the placeholder to be replaced in the md file
 * @param {String} filePathToFormat - the path of the md file to be formatted
 * @param {String} textToFormat - the text to be formatted. If null, use the md file provided in the path. If provided, format that text
 * @returns {String} - returns a formatted comment to be posted on github
 */
 function formatComment({ replacementString, placeholderString, filePathToFormat, textToFormat }) {
  const text = textToFormat === null ? fs.readFileSync(filePathToFormat).toString('utf-8') : textToFormat
  const commentToPost = text.replace(placeholderString, replacementString)
  return commentToPost
}

/**
 * Posts a comment on github
 * @param {Number} issueNum - the issue number where the comment should be posted
 * @param {String} comment - the comment to be posted
 */
 async function postComment(issueNum, comment) {
  try {
    await github.rest.issues.createComment({
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
