// Importing modules
var fs = require("fs")

// Constant variables
const REQUIRED_LABELS = ['Size', 'role', 'Feature']
const LABEL_MISSING = ['size: missing', 'role missing', 'Feature Missing']

// Global variables
var github
var context

/**
 *
 * @param {Object} g - github object  
 * @param {Object} c - context object 
 * 
 */

function main({ g, c }) {
  github = g
  context = c
  const labels = obtainLabels()
  const filteredLabels = filterLabels(labels)
  console.log('Current labels: ', filteredLabels)
  return checkLabels(labels)
}

// Get labels from issue
function obtainLabels() {
  const labelsObject = context.payload.issue.labels
  const labels = labelsObject.map(label => label.name)
  return labels
}

/*  Ensure that the issue was not created with labels from LABEL_MISSING array.
|   If so, remove the label(s) so the script can add them properly later, if needed.
*/
async function filterLabels(labels) {
  const issueNum = context.payload.issue.number
  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name

  const mappedLabels = await Promise.all(labels.map(async (label) => {
    if (LABEL_MISSING.includes(label) === true){
      console.log(`Detected unwanted label: ${label}. Removing...`)
      await github.issues.removeLabel({
        owner: owner,
        repo: repo,
        issue_number: issueNum,
        name: label
      })
    }
    else{
      return label
    }
  }))

  // After removing the unwanted labels, remove them from the array
  return mappedLabels.filter(label => label !== undefined)
}

  //todo: regex to check each label and ensure that the proper labels are there

  //if labels are not there, add labels labelled missing
async function checkLabels(labels) {
  console.log('here')
}

module.exports = main