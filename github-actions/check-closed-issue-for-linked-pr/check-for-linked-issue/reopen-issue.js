const queryIssueInfo = require('../../utils/query-issue-info');
const mutateIssueStatus = require('../../utils/mutate-issue-status');
const postComment = require('../../utils/post-issue-comment');

const statusFieldIds = require('../../utils/_data/status-field-ids');
const labelDirectory = require('../../utils/_data/label-directory.json');

// ==================================================

/**
 * Reopens an issue that does not have a linked PR or excusable labels.  Adds a
 * "ready for product" label, sets the project status to Questions / In Review",
 * and posts a comment to the issue.
 *
 * @param {{github: object, context: object}} actionsGithubScriptArgs -
 *  GitHub objects from actions/github-script
 */
async function reopenIssue({ github, context }) {
  const repoOwner = context.repo.owner;
  const repoName = context.repo.repo;
  const issueNumber = context.payload.issue.number;

  const labelsToAdd = [labelDirectory.readyForPM[0]];

  const newStatusFieldId = statusFieldIds('Questions_In_Review');

  const comment =
    'This issue was reopened because ' +
    `it did not have any of the following:
- A linked PR,
- An \`Ignore\` label
- A \`non-PR contribution\` label`;

  // --------------------------------------------------

  // Add the "ready for product" label.
  try {
    await github.rest.issues.addLabels({
      owner: repoOwner,
      repo: repoName,
      issue_number: issueNumber,
      labels: labelsToAdd,
    });
  } catch (err) {
    throw new Error(
      `Unable to add "ready for product" label to issue #${issueNumber}; ` +
        `error = ${err}`
    );
  }
  console.info(`Added "ready for product" label to issue #${issueNumber}.`);

  // Change the project status of the issue to "Questions / In Review".
  const issueInfo = await queryIssueInfo(github, context, issueNumber);
  await mutateIssueStatus(github, context, issueInfo.id, newStatusFieldId);
  console.info(
    `Changed project status to ` +
      `"Questions / In Review" in issue #${issueNumber}.`
  );

  // Post comment to the issue.
  await postComment(issueNumber, comment, github, context);
  console.info(`Posted comment to issue #${issueNumber}.`);

  // Re-opening the issue.
  try {
    await github.rest.issues.update({
      owner: repoOwner,
      repo: repoName,
      issue_number: issueNumber,
      state: 'open',
    });
  } catch (err) {
    throw new Error(`Unable to reopen issue #${issueNumber}; error = ${err}`);
  }
  console.info(`Reopened issue #${issueNumber}.`);
}

// ==================================================

module.exports = reopenIssue;
