// Importing modules
var fs = require("fs")

// Constant variables
const LABELS_OBJ = {
  'size: missing': 'Size',
  'role missing': 'Role',
  'Feature missing': 'Feature'
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
  const formattedInstructions = formatComment(instructions)
  await postComment(issueNum, formattedInstructions)
}

// Create the comment based on the labels array
function makeComment(labels) {
  const issueCreator = context.payload.issue.user.login

  if (labels.length === 0) {
    return `Good job @${issueCreator} for adding the required labels to this issue.`
  }

  return `Hi @${issueCreator}. Please don't forget to add the proper labels to this issue.
  Currently, the labels for the following are missing:
  ${labels.map(label => ` ${LABELS_OBJ[label]} `)}
  To add a label, take a look at Github's documentation [here](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels#applying-a-label).
  Also, don't forget to remove the "missing labels" after you add the proper labels.
  To remove a label, the process is similar to adding a label, but you select a currently added label to remove it.`
}

// Format the comment to be posted
function formatComment(instructions) {
  const path = './github-actions/issue-labels/labels-instructions-template.md'
  const text = fs.readFileSync(path).toString('utf-8')
  const completedInstuctions = text.replace('${labelInstructions}', instructions)
  return completedInstuctions
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