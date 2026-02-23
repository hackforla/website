// Module imports
const statusFieldIds = require('../../utils/_data/status-field-ids');
const queryIssueInfo = require('../../utils/query-issue-info');
const mutateIssueStatus = require('../../utils/mutate-issue-status');
const retrieveLabelDirectory = require('../../utils/retrieve-label-directory');

// Use labelKeys to retrieve current labelNames from directory
const [
  sizeMissing,
  featureMissing,
  complexityMissing,
  roleMissing,
  complexity1,
  complexity2,
  readyForDevLead,
  featureAdministrative,
  size025pt,
  roleDevLeads
] = [
  "sizeMissing",
  "featureMissing",
  "complexityMissing",
  "roleMissing",
  "complexity1",
  "complexity2",
  "readyForDevLead",
  "featureAdministrative",
  "size025pt",
  "roleDevLeads"
].map(retrieveLabelDirectory);

// Constant variables
const REQUIRED_LABELS = ['complexity', 'role', 'feature', 'size'];
const LABEL_MISSING = [complexityMissing, roleMissing, featureMissing, sizeMissing];
// Exception for the `good first issue` label
const COMPLEXITY_EXCEPTIONS = [complexity1];

// SPECIAL_CASE is for issue created by reference with issue title "Hack for LA website bot"
// ("Review Inactive Team Members" from the "Schedule Monthly" workflow)
const SPECIAL_CASE = [readyForDevLead, featureAdministrative, size025pt, complexity2, roleDevLeads];

// Global variables
var github;
var context;

/**
 * Check the labels of an issue, and add/remove labels as necessary
 * @param {Object} g - GitHub object  
 * @param {Object} c - context object 
 * @returns - returns an object with the action's result, which is passed on to the next action
 */
async function main({ g, c }) {
  github = g;
  context = c;
  const issueNum = context.payload.issue.number;
  const issueTitle = context.payload.issue.title;

  const labels = obtainLabels();
  const filteredLabels = filterLabels(labels);
  let labelsToAdd = checkLabels(filteredLabels);

  // Labels for SPECIAL_CASE noted above, change issue status to "Questions / In Review"
  if (issueTitle.includes('Hack for LA website bot')) {
    labelsToAdd = SPECIAL_CASE;
    // Find GraphQL issue id and change status id, then change status
    const { id: itemId } = await queryIssueInfo(github, context, issueNum);
    const newStatusValue = statusFieldIds("Questions_In_Review");
    await mutateIssueStatus(github, context, itemId, newStatusValue);
  }

  if (labelsToAdd.length === 0) {
    console.log('All required labels are included; no labels to add.');
  } else {
    console.log('Labels to add: ', labelsToAdd);
  }

  const result = await addLabels(labelsToAdd, filteredLabels);
  return {
    actionResult: result,
    addedLabels: labelsToAdd,
    issueNum: issueNum
  };
}

/**
 * Get all labels from the issue
 * @return {Array} - returns an array of all the labels
 */
function obtainLabels() {
  const labelsObject = context.payload.issue.labels;
  const labels = labelsObject.map(label => label.name);
  return labels;
}

/**
 * Ensure that the issue was not created with labels from LABEL_MISSING array
 * If so, they will be filtered and dealt with under the addLabels function
 * @param {Array} labels - array of labels to filter
 * @return {Array} - returns a filtered array without the extraneous labels
 */
function filterLabels(labels) {
  return labels.filter(label => LABEL_MISSING.includes(label) === false);
}

/**
 * Check for missing labels
 * @param {Array} labels        - array of the labels to check
 * @return {Array} labelsToAdd  - array of the labels to add
 */
function checkLabels(labels) {
  let labelsToAdd = [];

  REQUIRED_LABELS.forEach((requiredLabel, i) => {
    const regExp = new RegExp(`\\b${requiredLabel}\\b`, 'gi');
    const isLabelPresent = labels.some(label => {
      // If the label is in the complexity exceptions array, it also fulfills the complexity requirements
      if (COMPLEXITY_EXCEPTIONS.includes(label) && requiredLabel === 'complexity') {
        return true;
      }

      return regExp.test(label);
    })

    if (isLabelPresent === false) {
      labelsToAdd.push(LABEL_MISSING[i]);
    }
  })

  return labelsToAdd;
}

/**
 * For the correct issue on github, add any missing labels and remove labels under LABEL_MISSING if necessary
 * @param {Array} labelsToAdd - array of labels to add
 * @param {Array} currentLabels- array of all current labels
 * @return {Boolean} - boolean that states if the function succeeds
 */
async function addLabels(labelsToAdd, currentLabels) {
  const issueNum = context.payload.issue.number;
  const owner = context.payload.repository.owner.login;
  const repo = context.payload.repository.name;

  // Use a flattened set to ensure each label is unique
  const labels = [...new Set([
    ...labelsToAdd,
    ...currentLabels
  ])];

  try {
    // https://octokit.github.io/rest.js/v20#issues-set-labels
    await github.rest.issues.setLabels({
      owner: owner,
      repo: repo,
      issue_number: issueNum,
      labels: labels
    });
    if (labelsToAdd.length > 0) {
      console.log(`Labels added successfully`);
    }
    return true;
  }
  catch(err) {
    console.log('Error editing labels: ', err)
    return false;
  }
}

module.exports = main;
