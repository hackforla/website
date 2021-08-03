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
  return checkLabels();
}

async function checkLabels() {
  console.log('context:', context)
  const issueNum = context.payload.issue.number
  const labelsObject = context.payload.issue.labels
  const labels = labelsObject.map(label => label.name)
  console.log('issue number: ', issueNum)
  console.log('labels: ', labels)
  console.log('####')
}

module.exports = main