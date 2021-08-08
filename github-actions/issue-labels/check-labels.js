// Constant variables
const REQUIRED_LABELS = ['Size', 'role', 'Feature']
const LABEL_MISSING = ['size: missing', 'role missing', 'Feature Missing']

// Global variables
var github
var context

/**
 * @param {Object} g - github object  
 * @param {Object} c - context object 
 */

async function main({ g, c }) {
  github = g
  context = c
  const issueNum = context.payload.issue.number

  const labels = obtainLabels()
  const filteredLabels = filterLabels(labels)
  const labelsToAdd = checkLabels(filteredLabels)
  console.log('Labels to add: ', labelsToAdd)

  const result = await addLabels(labelsToAdd, filteredLabels)
  return {
    actionResult: result,
    addedLabels: labelsToAdd,
    issueNum: issueNum
  }
}

// Get labels from issue
function obtainLabels() {
  const labelsObject = context.payload.issue.labels
  const labels = labelsObject.map(label => label.name)
  return labels
}

/*
Ensure that the issue was not created with labels from LABEL_MISSING array.
If so, they will be filtered and dealt with under the addLabels function
*/
function filterLabels(labels) {
  return labels.filter(label => LABEL_MISSING.includes(label) === false)
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

// Add missing labels and remove labels under LABEL_MISSING if necessary
async function addLabels(labelsToAdd, currentLabels) {
  const issueNum = context.payload.issue.number
  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name

  // Use a flattened set to ensure each label is unique
  const labels = [...new Set([
    ...labelsToAdd,
    ...currentLabels
  ])]

  try {
    const results = await github.issues.setLabels({
      owner: owner,
      repo: repo,
      issue_number: issueNum,
      labels: labels
    })
    console.log('Succesfully added labels. Results:\n', results)
    return true
  }
  catch(err) {
    console.log('Error editing labels: ', err)
    return false
  }
}

module.exports = main