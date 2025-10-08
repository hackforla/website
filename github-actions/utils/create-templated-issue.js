const populateTemplate = require("./populate-template.js");

/**
 * Creates a new GitHub issue based on a Markdown template,
 * replacing placeholders with provided values.
 *
 * @param {string} title                - Title of the GitHub issue to create
 * @param {string} templatePath         - File path to the Markdown template for issue body
 * @param {Object} templateVars         - Key-value pairs where keys correspond to placeholders
 *                                        in the template and values are the text to substitute
 * @param {Array<string>} [labels=[]]   - Optional array of labels to apply to the issue
 * @param {Object} github           - The `github` object from actions/github-script
 * @param {Object} context          - The `context` object from actions/github-script
 * @returns {Promise<number>}           - The number of the created GitHub issue
 */
async function createTemplatedIssue({
  title,
  templatePath,
  templateVars,
  labels = [],
  github,
  context,
}) {
  // Populate the template
  const issueBodyText = populateTemplate({
    templatePath,
    templateVars,
  });

  // Create the issue
  const issueResponse = await github.rest.issues.create({
    owner: context.repo.owner,
    repo: context.repo.repo,
    title: title,
    body: issueBodyText,
    labels: labels,
  });

  return issueResponse.data.number;
}

module.exports = createTemplatedIssue;
