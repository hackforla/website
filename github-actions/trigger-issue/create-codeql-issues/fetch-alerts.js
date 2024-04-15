// Global variables
var github;
var context;

/**
 * Fetches a list of open CodeQL alerts from the GitHub API.
 * @param {Object} params - The parameters for the fetch operation.
 * @param {Object} params.g - The GitHub object for making API requests.
 * @param {Object} params.c - The context object containing repository information.
 * @returns {Promise<Array>} A promise that resolves with an array of alerts when the fetch is successful.
 * @throws {Error} If the GET request fails.
 */
const fetchAlerts = async ({ g, c }) => {
  // Rename parameters
  github = g;
  context = c; 

  // Get a list of open CodeQL alerts
  const fetchAlertsResponse = await github.request('GET /repos/{owner}/{repo}/code-scanning/alerts', {
    owner: context.repo.owner,
    repo: context.repo.repo,
    state: 'open',
    per_page: 100,
    page: 1
  });

  // Throw error if GET request fails
  if (fetchAlertsResponse.status !== 200) {
    throw new Error(`Failed to fetch alerts: ${fetchAlertsResponse.status} - ${fetchAlertsResponse.statusText}`);
  }

  // Return alerts
  return fetchAlertsResponse.data
};

module.exports = fetchAlerts
