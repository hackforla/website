// Import modules
var getIssueByLabel = require("../utils/get-issue-by-label")

// Global variables
var github
var context

/**
 * @description - This function is the entry point into the javascript file,
 * it will find the prework issue
 *
 * @param {Object} g - github object
 * @param {Object} c - context object
 * @param {Object} activityDetail - person who triggered the workflow
 */
async function main({ g, c }, activityDetail) {
  github = g
  context = c
  let labels = ["Complexity: Prework"]
  const issue = await getIssueByLabel(
    activityDetail.contributor,
    labels,
    github,
    context
  )
  return issue
}

module.exports = main
