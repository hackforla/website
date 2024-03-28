const fs = require('fs');

// Global variables
var github;
var context;

/**
 * Fetches a list of open CodeQL alerts from the GitHub API.
 * @returns {Promise<void>} A promise that resolves when the alerts are fetched.
 */
const fetchAlerts = async ({ g, c }) => {
  // Rename parameters
  github = g;
  context = c; 

  // Get a list of open CodeQL alerts
  const response = await fetch(`https://api.github.com/repos/${context.repo.owner}/${context.repo.repo}/code-scanning/alerts?state=active`, {
    headers: {
      Authorization: `token ${{secrets.GITHUB_TOKEN}}`
    }
  });

  // Throw error if fetch fails
  if (!response.ok) {
    throw new Error(`Failed to fetch alerts: ${response.status} - ${response.statusText}`);
  }

  // Convert response to JSON
  const alerts = await response.json();

  // Set output for future scripts in workflow
  core.setOutput("alerts", alerts);
};

module.exports = fetchAlerts
