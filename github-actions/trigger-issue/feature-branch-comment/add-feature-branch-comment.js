// Import modules
var fs = require("fs")
const postComment = require("../../utils/post-issue-comment")
const formatComment = require("../../utils/format-comment")

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
  const issueNumber = context.payload.issue.number
  const instructions = await makeComment()
  if (instructions !== null) {
    // the actual creation of the comment in github
    await postComment(issueNumber, instructions, github, context)
  }
}

/**
 * @description - This function makes the comment with the label event actor's name github handle using the raw feature-branch-comment.md file
 * @returns {string} - Comment to be posted with the issue label event actor's name
 */
async function makeComment() {
  const commentObject = {
    replacementString: context.actor,
    placeholderString: "${actor}",
    filePathToFormat:
      "./github-actions/trigger-issue/feature-branch-comment/feature-branch-comment.md",
    textToFormat: null,
  }

  // creating the comment with label event actor's name and returning it!
  const commentWithEventActor = formatComment(commentObject, fs)
  return commentWithEventActor
}

module.exports = main
