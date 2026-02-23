const retrieveLabelDirectory = require('../../utils/retrieve-label-directory');

// Use labelKeys to retrieve current labelNames from directory
const [
  nonPrContribution
] = [
  'NEW-nonPrContribution'
].map(retrieveLabelDirectory);

// ==================================================

/**
 * Checks whether a closed issue has a linked PR or one of the labels to excuse
 * this GitHub Actions workflow.
 *
 * @param {{github: object, context: object}} actionsGithubScriptArgs - GitHub
 *  objects from actions/github-script
 * @returns {boolean} False if the issue does not have a linked PR, a "non-PR
 *  contribution" label, or an "Ignore..." label.
 */
async function hasLinkedPrOrExcusableLabel({ github, context }) {
  const repoOwner = context.repo.owner;
  const repoName = context.repo.repo;
  const issueNumber = context.payload.issue.number;

  const labels = context.payload.issue.labels.map((label) => label.name);

  const consoleMessageAllowClose =
    `Issue #${issueNumber} is allowed to be closed.`;

  // --------------------------------------------------

  // Check if the issue has the labels that will avoid re-opening it.
  if (
    labels.some(
      (label) =>
        label === nonPrContribution || label.toLowerCase().includes('ignore')
    )
  ) {
    console.info(consoleMessageAllowClose);
    return true;
  }

  console.info(
    `Issue #${issueNumber} does not have ` +
      `the necessary labels to excuse reopening it.`
  );

  // Use GitHub's GraphQL's closedByPullRequestsReferences to more reliably
  // determine if there is a linked PR.
  const query = `query($owner: String!, $repo: String!, $issue: Int!) {
    repository(owner: $owner, name: $repo) {
      issue(number: $issue) {
        closedByPullRequestsReferences(includeClosedPrs: true, first: 1) {
          totalCount
        }
      }
    }
  }`;

  const variables = {
    owner: repoOwner,
    repo: repoName,
    issue: issueNumber,
  };

  // Determine if there is a linked PR.
  try {
    const response = await github.graphql(query, variables);

    const numLinkedPrs =
      response.repository.issue.closedByPullRequestsReferences.totalCount;

    console.debug(`Number of linked PRs found: ${numLinkedPrs}.`);

    if (numLinkedPrs > 0) {
      console.info(consoleMessageAllowClose);
      return true;
    }
  } catch (err) {
    throw new Error(
      `Can not find issue #${issueNumber} or its PR count; error = ${err}`
    );
  }
  console.info(`Issue #${issueNumber} does not have a linked PR.`);

  // If the issue does not have a linked PR or any of the excusable labels.
  console.info(`Issue #${issueNumber} is not allowed to be closed.`);
  return false;
}

// ==================================================

module.exports = hasLinkedPrOrExcusableLabel;
