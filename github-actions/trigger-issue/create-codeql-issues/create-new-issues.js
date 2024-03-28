const fs = require('fs');

// Global variables
var github;
var context;

/**
 * Creates new GitHub issues for each alert that doesn't have an existing issue.
 * @returns {Promise<void>}
 */
const createNewIssues = async ({ g, c }) => {
  // Rename parameters
  github = g;
  context = c; 

  // Get the alertId from the check-existing-issues step output
  const alertId = ${{ steps.check-existing-issues.outputs.alertId }};

  // Create the issue title
  const issueTitle = `Resolve CodeQL query #${alertId} - generated by GHA`;

  // Read the issue body template file
  const issueBodyTemplatePath = 'github-actions/trigger-issue/create-codeql-issues/issue-body.md';
  let issueBodyTemplate = fs.readFileSync(issueBodyTemplatePath, 'utf8');

  // Replace placeholders with actual values in the issue body template
  issueBodyTemplate = issueBodyTemplate.replace(/\${alertId}/g, alertId);

  // Use the modified content as the issue body
  const issueBody = issueBodyTemplate;

  // Create a new GitHub issue
  const createIssueResponse = await fetch(`https://api.github.com/repos/${context.repo.owner}/${context.repo.repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `token ${{secrets.GITHUB_TOKEN}}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: issueTitle,
      body: issueBody,
      labels: ['ready for dev lead']
    })
  });

  /*
  if (!createIssueResponse.ok) {
    throw new Error(`Failed to create issue for alert ${alertId}: ${createIssueResponse.status} - ${createIssueResponse.statusText}`);
  }
  */
};

module.exports = createNewIssues

