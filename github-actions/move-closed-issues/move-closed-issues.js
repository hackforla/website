// Module imports
const statusFieldIds = require('../utils/_data/status-field-ids');
const queryIssueInfo = require('../utils/query-issue-info');
const mutateIssueStatus = require('../utils/mutate-issue-status');

async function main({ github, context }, results) {
  const issueNum = context.payload.issue.number;

  let statusValue = statusFieldIds(results);
  const itemInfo = await queryIssueInfo(github, context, issueNum);
  await mutateIssueStatus(github, context, itemInfo.id, statusValue);
}

module.exports = main;
