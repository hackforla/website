// Import modules
const postComment = require("../utils/post-issue-comment")

// Global variables
var github
var context

/**
 * @description - This function is the entry point into the javascript file, it leaves a comment on the prework issue
 * @param {Object} g - github object
 * @param {Object} c - context object
 * @param {Number} issueNumber - issue
 * @param {Object} activityDetail - details of the activity performed
 */
async function main({ g, c }, issueNumber, activityDetail) {
  github = g
  context = c
  const comment = await makeComment(activityDetail)
  if (comment !== null) {
    await postComment(issueNumber, comment, github, context)
  }
}

/**
 * @description  - This function makes the comment
 * @param {Object} activityDetail  - details of the activity performed
 * @returns {Promise<string>} - Comment to be posted with the issue label event actor's name
 */

async function makeComment(activityDetail) {
  const comment = `${activityDetail.activityObject} has been ${activityDetail.action} by @${activityDetail.contributor}
`
  return comment
}

module.exports = main
