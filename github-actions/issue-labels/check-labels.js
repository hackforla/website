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

function checkLabels() {
  console.log('context:', context)
  const issueNum = context.issue.number
  const labels = context.issue.labels
  console.log(issueNum)
  console.log(labels)
}

module.exports = main