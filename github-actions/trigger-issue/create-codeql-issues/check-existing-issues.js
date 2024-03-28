const fs = require('fs');

// Global variables
var github;
var context;

/**
 * Fetches existing issues for each alert and sets the output for alerts without existing issues.
 * @returns {Promise<void>}
 */
const checkExistingIssues = async ({ g, c, core, token }) => {
  // Rename parameters
  github = g;
  context = c; 

  // Get alerts from the fetch-alerts step output
  const alerts = ${{ steps.fetch-alerts.outputs.alerts }};
  
  // Loop through each alert
  for (const alert of alerts) {
    const alertId = alert.number;

    // Search for existing issues related to the alert
    const searchResponse = await fetch(`https://api.github.com/search/issues?q=repo:${context.repo.owner}/${context.repo.repo}+state:open+${encodeURIComponent(`"${alertId}"`)}+in:title`, {
      headers: {
        Authorization: `token ${token}`
      }
    });

    // Check if the search request was successful
    if (!searchResponse.ok) {
      throw new Error(`Failed to search for issues: ${searchResponse.status} - ${searchResponse.statusText}`);
    }

    // Convert response to JSON
    const searchResult = await searchResponse.json();

    // If no existing issues are found, set the alertId output and exit the loop
    if (searchResult.items.length === 0) {
      core.setOutput("alertId", alertId);
      break; // Exit the loop after finding the first alert without an existing issue
    }
  }
};

module.exports = checkExistingIssues
