// Constant variables
const REQUIRED_LABELS = ['Complexity', 'role', 'Feature']
const LABEL_MISSING = ['Complexity: Missing', 'role missing', 'Feature Missing']
const COMPLEXITY_EXCEPTIONS = ['good first issue']

// Global variables
var github
var context

/**
 * Check the labels of an issue, and add/remove labels as necessary
 * @param {Object} g - github object  
 * @param {Object} c - context object 
 * @returns - returns an object with the action's result, which is passed on to the next action
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

/**
 * Get all labels from the issue
 * @return {Array} - returns an array of all the labels
 */
function obtainLabels() {
  const labelsObject = context.payload.issue.labels
  const labels = labelsObject.map(label => label.name)
  return labels
}

/**
 * Ensure that the issue was not created with labels from LABEL_MISSING array
 * If so, they will be filtered and dealt with under the addLabels function
 * @param {Array} labels - array of labels to filter
 * @return {Array} - returns a filtered array without the extraneous labels
 */
function filterLabels(labels) {
  return labels.filter(label => LABEL_MISSING.includes(label) === false)
}

/**
 * Check for missing labels
 * @param {Array} labels - array of labels to check
 * @return {Array} - returns an array of the labels to add
 */
function checkLabels(labels) {
  let labelsToAdd = []

  REQUIRED_LABELS.forEach((requiredLabel, i) => {
    const regExp = new RegExp(`\\b${requiredLabel}\\b`, 'gi')
    const isLabelPresent = labels.some(label => {
      // If the label is in the complexity exceptions array, it also fulfills the complexity requirements
      if (COMPLEXITY_EXCEPTIONS.includes(label) && requiredLabel === 'Complexity') {
        return true
      }

      return regExp.test(label)
    })

    if (isLabelPresent === false){
      labelsToAdd.push(LABEL_MISSING[i])
    }
  })
  
  return labelsToAdd
}

/**
 * For the correct issue on github, add any missing labels and remove labels under LABEL_MISSING if necessary
 * @param {Array} labelsToAdd - array of labels to add
 * @param {Array} currentLabels- array of all current labels
 * @return {Boolean} - boolean that states if the function succeeds
 */
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
    const results = await github.rest.issues.setLabels({
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
