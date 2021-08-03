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
  console.log('issue: ', issueNum)
  console.log('owner: ', owner)
  console.log('repo: ', repo)

  /*  Ensure that the issue was not already created with labels from LABEL_MISSING array.
      If so, remove that label to avoid redundancy
  */
  const filteredLabels = labels.map(label => {
    if (LABEL_MISSING.includes(label) === true){
      await github.issues.removeLabel({
        owner: owner,
        repo: repo,
        issue_number: issueNum,
        name: label
      })
    }
    return label
  })

  console.log(filteredLabels)
}

module.exports = main