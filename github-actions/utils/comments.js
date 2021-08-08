// Functions that involve formatting and posting comments to github
var fs = require("fs")

/**
 * Formats the comment to be posted
 * @param {String} replacementString - the string to replace the placeholder in the md file
 * @param {String} placeholderString - the placeholder to be replaced in the md file
 * @param {String} path - the path of the md file to be formatted
 * @param {String} textToFormat - the text to be formatted. If null, use the md file provided in the path. If provided, format that text
 * @returns {String} - returns a formatted comment to be posted on github
 */
 function formatComment(replacementString, placeholderString, path, textToFormat) {
  const text = textToFormat === null ? fs.readFileSync(path).toString('utf-8') : textToFormat
  const commentToPost = text.replace(placeholderString, replacementString)
  return commentToPost
}

/**
 * Posts a comment on github
 * @param {Number} issueNum - the issue number where the comment should be posted
 * @param {String} comment - the comment to be posted
 */
 async function postComment(issueNum, comment) {
  try {
    await github.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNum,
      body: comment,
    })
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  formatComment,
  postComment
}