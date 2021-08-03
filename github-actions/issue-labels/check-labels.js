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
  const labels = context.payload.issue.labels
  const owner = context.payload.repository.owner
  const repo = context.payload.repository.full_name
  console.log(issueNum)
  console.log(labels)
  console.log(labels[0])
  console.log(owner)
  console.log(repo)
  console.log('####')

  const results = await github.issues.listLabelsOnIssue({
    owner: owner,
    repo: repo,
    issue_number: issueNum
  })
  const data = results.data
  console.log(data)
}

module.exports = main