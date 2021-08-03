// Importing modules
var fs = require("fs");

// Global variables
var github;
var context;

/**
 *
 * @param {Object} g - github object  
 * @param {Object} c - context object 
 * 
 */

function main({ g, c }) {
  github = g;
  context = c;
  const labels = obtainLabels();
  return checkLabels(labels);
}

function obtainLabels() {
  console.log('context:', context)
  const issueNum = context.payload.issue.number
  const labelsObject = context.payload.issue.labels
  const labels = labelsObject.map(label => label.name)
  console.log('issue number: ', issueNum)
  console.log('labels: ', labels)
  return labels
}

function checkLabels(labels) {
  const REQUIRED_LABELS = ['Size', 'role', 'Feature']
  const LABEL_MISSING = ['size: missing', 'role missing', 'Feature Missing']

  // Ensure that the issue was not already created with labels from LABEL_MISSING array
  const filteredLabels = labels.filter(label => {
    if (LABEL_MISSING.includes(label) === false) return label
  })

  console.log(filteredLabels)
}

module.exports = main