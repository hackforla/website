// Module imports
const statusFieldIds = require('../utils/_data/status-field-ids');
const queryIssueInfo = require('../utils/query-issue-info');
const mutateIssueStatus = require('../utils/mutate-issue-status');

/**
 * @description - Changes the closed 'status' of the issue based on `sort-closed-issues.js`
 * @param {Object} github  - GitHub object from actions/github-script
 * @param {Object} context - Context object from actions/github-script
 * @param {String} results - Status to which issue will be sorted from previous step
 */
async function main({ github, context }, results) {
  const issueNum = context.payload.issue.number;
  let statusValue = statusFieldIds(results);
  const itemInfo = await queryIssueInfo(github, context, issueNum);
  await mutateIssueStatus(github, context, itemInfo.id, statusValue);
}

module.exports = main;
