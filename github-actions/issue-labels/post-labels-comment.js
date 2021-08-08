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

  const instructions = makeComment(addedLabels)
  console.log('initial comment: ', instructions)

  const path = './github-actions/issue-labels/labels-instructions-template.md'
  const instructionsPlaceholder = '${labelInstructions}'
  const formattedInstructions = formatComment(instructions, path, instructionsPlaceholder)
  console.log('final comment: ', formattedInstructions)
  await postComment(issueNum, formattedInstructions)
}

// Create the comment based on the labels array
function makeComment(labels) {
  const issueCreator = context.payload.issue.user.login

  if (labels.length === 0) {
    const path = './github-actions/issue-labels/no-labels-template.md'
    return formatComment(null, path, null)
  }

  const path = './github-actions/issue-labels/add-labels-template.md'
  const labelsPlaceholder = '${labels}'
  const labelsToAdd = labels.map(label => LABELS_OBJ[label]).join(', ')
  return formatComment(labelsToAdd, path, labelsPlaceholder)
}

// Format the comment to be posted
/* function formatComment(instructions) {
  const path = './github-actions/issue-labels/labels-instructions-template.md'
  const text = fs.readFileSync(path).toString('utf-8')
  const completedInstuctions = text.replace('${labelInstructions}', instructions)
  return completedInstuctions
} */

function formatComment(comment, path, placeholderString) {
  const text = fs.readFileSync(path).toString('utf-8')
  const commentToPost = text.replace(placeholderString, comment)
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