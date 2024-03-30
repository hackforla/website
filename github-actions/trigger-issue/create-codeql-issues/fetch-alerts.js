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
  const fetchAlertsResponse = await github.rest.codeScanning.listAlertsForRepo({
    owner: context.repo.owner,
    repo: context.repo.repo,
    state: 'open',
    per_page: 100,
    page: 1,
  });


  // Throw error if fetch fails
  if (!fetchAlertsResponse.ok) {
    throw new Error(`Failed to fetch alerts: ${fetchAlertsResponse.status} - ${fetchAlertsResponse.statusText}`);
  }

  // Convert response to JSON
  const alerts = await fetchAlertsResponse.json();
  console.log('alerts: ', alerts);

  return alerts;
};

module.exports = fetchAlerts
