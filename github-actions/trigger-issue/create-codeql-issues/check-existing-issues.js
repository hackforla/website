const fs = require('fs');

// Global variables
var github;
var context;

/**
 * Fetches existing issues for each alert and sets the output for alerts without existing issues.
 * @param {Object} options - The options object.
 * @param {string} options.g - The GitHub access token.
 * @param {Object} options.c - The context object.
 * @param {Array<Object>} options.alerts - The array of alerts to check.
 * @returns {Promise<Array<number>>} An array of alert IDs without existing issues.
 * @throws {Error} If the GET request fails.
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
    const searchResponse = await github.request('GET /search/issues', {
      q: `repo:${context.repo.owner}/${context.repo.repo}+state:open+"${alertId}"+in:title`,
    });

    // Check if the search request was successful
    if (searchResponse.status !== 200) {
      throw new Error(`Failed to search for issues: ${searchResponse.status} - ${searchResponse.statusText}`);
    }

    // Assign response data to variable for access
    const searchResult = searchResponse.data

    // If no existing issues are found, add the alertId to the array
    if (searchResult.items.length === 0) {
      alertIdsWithoutIssues.push(alertId);
    }
  }

  // Return the array of alertIds without existing issues
  return alertIdsWithoutIssues;
};

module.exports = checkExistingIssues
