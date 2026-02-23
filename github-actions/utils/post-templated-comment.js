const populateTemplate = require("./populate-template.js");
const postIssueComment = require("./post-issue-comment.js")

/**
 * Posts a new GitHub issue comment based on a Markdown template,
 * replacing placeholders with provided values.
 *
 * @param {number} issueNum         - The number of the GitHub issue to comment on
 * @param {string} templatePath     - Path to the Markdown template for the comment body
 * @param {Object} templateVars     - Key-value pairs where keys match placeholders 
 *                                    in the template and values are the text to substitute
 * @param {Object} github           - The `github` object from actions/github-script
 * @param {Object} context          - The `context` object from actions/github-script
 * @returns {Promise<void>}         - Resolves when the comment is successfully created
 */
async function postTemplatedComment({
  issueNum,
  templatePath,
  templateVars,
  github,
  context,
}) {
  // Populate the template
  const comment = populateTemplate({
    templatePath,
    templateVars,
  });

  // Post the comment
  await postIssueComment(
    issueNum,
    comment,
    github,
    context,
  );
}

module.exports = postTemplatedComment;
