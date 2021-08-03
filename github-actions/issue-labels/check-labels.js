// Importing modules


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
/*   const issueNum = context.issue.number
  const labels = context.labels
  console.log(issueNum)
  console.log(labels) */
  console.log('test')
}

module.exports = main