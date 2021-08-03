// Importing modules
var fs = require("fs")

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
  return checkLabels(labels)
}

// Get labels from issue
function obtainLabels() {
  const labelsObject = context.payload.issue.labels
  const labels = labelsObject.map(label => label.name)
  return labels
}

async function checkLabels(labels) {
  const REQUIRED_LABELS = ['Size', 'role', 'Feature']
  const LABEL_MISSING = ['size: missing', 'role missing', 'Feature Missing']
  const issueNum = context.payload.issue.number
  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name

  /*  Ensure that the issue was not created with labels from LABEL_MISSING array.
      If so, remove the label(s) so the script can add them properly later, if needed.
  */
  const filteredLabels = await Promise.all(labels.filter(async (label) => {
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

  console.log('Current labels: ', filteredLabels)
}

module.exports = main