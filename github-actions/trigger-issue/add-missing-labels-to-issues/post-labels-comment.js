var fs = require("fs")
const postComment = require('../../utils/post-issue-comment')
const formatComment = require('../../utils/format-comment')

// Constant variables
const LABELS_OBJ = {
  'Complexity: Missing': 'Complexity',
  'role missing': 'Role',
  'Feature Missing': 'Feature',
  'size: missing': 'Size'
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
    console.log('Previous gh-action failed. The current gh-action will end.');
    return
  }

  // If addedLabels === [], no new labels are needed
  if (addedLabels.length === 0) {
    console.log('All required labels have been included; the labels comment will not be posted.');
    return
  }

  console.log('Comment will be posted to issue regarding missing labels.');
  const instructions = makeComment(addedLabels)
  await postComment(issueNum, instructions, github, context)
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
  const commentWithIssueCreator = formatComment(commentObject, fs)

  // Replace the labels placeholder
  const labelsToAdd = labels.map(label => LABELS_OBJ[label]).join(', ')
  const labelsCommentObject = {
    replacementString: labelsToAdd,
    placeholderString: '${labels}',
    filePathToFormat: null,
    textToFormat: commentWithIssueCreator
  }
  return formatComment(labelsCommentObject, fs)
}

module.exports = main
