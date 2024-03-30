const fs = require('fs');

// Global variables
var github;
var context;

/**
 * Fetches existing issues for each alert and sets the output for alerts without existing issues.
 * @returns {Promise<void>}
 */
const checkExistingIssues = async ({ g, c, alerts }) => {
  // Rename parameters
  github = g;
  context = c;

  // Array to store alertIds without existing issues
  let alertIdsWithoutIssues = [];

  // Loop through each alert
  for (const alert of alerts) {
    const alertId = alert.number;

    // Search for existing issues related to the alert
    const searchResponse = await fetch(`https://api.github.com/search/issues?q=repo:${context.repo.owner}/${context.repo.repo}+state:open+${encodeURIComponent(`"${alertId}"`)}+in:title`, {
      headers: {
        Authorization: `token ${github}`,
      },
    });

    // Check if the search request was successful
    if (!searchResponse.ok) {
      throw new Error(`Failed to search for issues: ${searchResponse.status} - ${searchResponse.statusText}`);
    }

    // Convert response to JSON
    const searchResult = await searchResponse.json();
    console.log('searchResult: ', searchResult);

    // If no existing issues are found, add the alertId to the array
    if (searchResult.items.length === 0) {
      alertIdsWithoutIssues.push(alertId);
    }
  }

  // Return the array of alertIds without existing issues
  return alertIdsWithoutIssues;
};

module.exports = checkExistingIssues
