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

  // Initialize empty array to store alertIds
  let alertIdsWithoutIssues = [];

  // Batch alerts into groups of 5 for each request to avoid rate limit
  const batchedAlertIds = alerts.reduce((acc, alert, index) => {
    // For indexes 0 to 4, batchIndex == 0
    // For indexes 5 to 9, batchIndex == 1
    // For indexes 10 to 14, batchIndex == 2
    // Etc.
    const batchIndex = Math.floor(index / 5);
    // if acc[batchIndex] == undefined, a new array is created before pushing the alert number
    acc[batchIndex] = acc[batchIndex] || [];
    // Push alert.number to inner array
    acc[batchIndex].push(alert.number);
    // Returns array of arrays
    return acc;
  }, []);

  // Loop through each batch of alerts
  for (const fiveAlertIds of batchedAlertIds) {
    // Creates one query for multiple alertIds
    const q = fiveAlertIds.map(alertId => `repo:${context.repo.owner}/${context.repo.repo}+state:open+"${alertId}"+in:title`).join('+OR+');

    // Query GitHub API in batches
    const searchResponse = await github.request('GET /search/issues', { q });

    // Throw error if GET request fails
    if (searchResponse.status !== 200) {
      throw new Error(`Failed to search for issues: ${searchResponse.status} - ${searchResponse.statusText}`);
    }

    // Store the response data in a variable for easy access
    const searchResult = searchResponse.data;

    // Push alertIds that do not have existing issues in searchResult to output array
    alertIdsWithoutIssues.push(...fiveAlertIds.filter(alertId => !searchResult.items.some(item => item.title.includes(alertId))));
  };

  // Return flat array of alertIds that do not have issues
  console.log('alertIds without issues: ', alertIdsWithoutIssues);
  return alertIdsWithoutIssues;
};

module.exports = checkExistingIssues
