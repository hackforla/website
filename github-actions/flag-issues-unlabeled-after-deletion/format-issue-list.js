/**
 * Format a list of issues into a bullet-point string, e.g.:
 * - #123
 * - #456
 *
 * @param {Array>} issues -- Array of JS issues with a `number` field
 * @returns {string}      -- Formatted list of issues
 */
function formatIssueList(issues) {
  if (!Array.isArray(issues)) {
    throw new Error("Expected issues to be an array");
  }

  const issueItems = issues.map((issue) => `- #${issue.number}`);

  return issueItems.join("\n");
}

module.exports = formatIssueList;
