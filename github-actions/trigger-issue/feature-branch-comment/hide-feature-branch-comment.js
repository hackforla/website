// Import modules to hide comment
const hideComment = require("../../utils/hide-issue-comment")

// Global variables
var github
var context

/**
 * @description - This function is the entry point into the javascript file, it formats the md file and posts the comment on the issue
 * @param {Object} g - github object
 * @param {Object} c - context object
 */
async function main({ g, c }) {
  github = g
  context = c
  const comment = await findComment(github, context)
  // if the comment exists, then we hide it
  if (comment && comment.node_id) {
    await hideComment(github, comment.node_id)
  }
}

/**
 * @description - fetch comments from GitHub issue
 * @returns array of comments, sorted in ascending order by date created
 */
async function fetchComments(github, context) {
  let owner = context.repo.owner
  let repo = context.repo.repo
  const issueNumber = context.payload.issue.number

  const response = await github.rest.issues.listComments({
    owner: owner,
    repo: repo,
    issue_number: issueNumber,
  })
  return response.data
}

/**
 * @description - Goes through an array of comments to find ones with matching  body, returns the most recent
 * @param {Array} comments array of comments to search through
 * @returns most recent comment made with matching `feature: feature branch`
 */
function findMatchingComment(comments) {
  const matchingComments = comments.filter((comment) =>
    comment.body.includes("Feature: Feature Branch")
  )
  const comment = matchingComments[matchingComments.length - 1]
  if (comment) {
    return comment
  }
  return undefined
}

/**
 * @description - Parent function, will find the most recent matching comment
 * @returns matching comment
 */
async function findComment(github, context) {
  const comments = await fetchComments(github, context)
  return findMatchingComment(comments)
}

module.exports = main
