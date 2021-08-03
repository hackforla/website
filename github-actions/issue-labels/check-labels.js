// Importing modules
var fs = require("fs");

// Global variables
var github;
var context;

/**
 *
 * @param {Object} g - github object  
 * @param {Object} c - context object 
 * @returns {Boolean}
 */

function main({ g, c }) {
  github = g;
  context = c;
  return checkLabels();
}

function checkLabels() {
  const issueNum = context.issue.number
  const labels = context.labels
  console.log(issueNum)
  console.log(labels)
}