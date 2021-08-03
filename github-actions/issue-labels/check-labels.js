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

async function main({ g, c }) {
  github = g
  context = c
  const labels = obtainLabels()
  const filteredLabels = await filterLabels(labels)
  console.log('Current labels: ', filteredLabels)

  const labelsToAdd = checkLabels(filteredLabels)
  console.log('Labels to add: ', labelsToAdd)

  const results = await addLabels(labelsToAdd, filterLabels)
  console.log(results)
  return results
}

// Get labels from issue
function obtainLabels() {
  const labelsObject = context.payload.issue.labels
  const labels = labelsObject.map(label => label.name)
  return labels
}

/*
Ensure that the issue was not created with labels from LABEL_MISSING array.
If so, remove the label(s) so the script can add them properly later, if needed.
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

// Check for missing labels
function checkLabels(labels) {
  let labelsToAdd = []

  REQUIRED_LABELS.forEach((requiredLabel, i) => {
    const regExp = new RegExp(`\\b${requiredLabel}\\b`, 'g')
    const isLabelPresent = labels.some(label => regExp.test(label))

    if (isLabelPresent === false){
      labelsToAdd.push(LABEL_MISSING[i])
    }
  })
  
  return labelsToAdd
}

// Add missing labels
async function addLabels(labelsToAdd, currentLabels) {
  const issueNum = context.payload.issue.number
  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name

  try {
    const results = await github.issues.setLabels({
      owner: owner,
      repo: repo,
      issue_number: issueNum,
      labels: currentLabels.concat(labelsToAdd)
    })
    return results
  }
  catch(err) {
    console.log('Error editing labels: ', err)
  }
}

module.exports = main