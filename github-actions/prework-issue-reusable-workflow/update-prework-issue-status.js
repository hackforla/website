// Import modules
var reopenIssue = require("../utils/reopen-issue")

// Global variables
var github
var context

/**
 * @description - This function is the entry point into the javascript file, it will reopen the issue
 * @param {Object} g - github object
 * @param {Object} c - context object
 * @param {Object} issue - the issue to update
 */
async function main({ g, c }, issue) {
  github = g
  context = c

  // TODO value is hardcoded
  // Project Number =1 , for HFLA project number = 7
  console.log(issue)
  if (issue.closed == true) {
    const result = await reopenIssue(issue.id, github)
    console.log(result)
    return result.reopenIssue.issue
  }
  return false
}

module.exports = main
