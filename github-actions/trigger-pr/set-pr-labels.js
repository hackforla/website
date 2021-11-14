const fs = require('fs');

// https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword
const LINKING_KEYWORDS = [
  'close',
  'closes',
  'closed',
  'fix',
  'fixes',
  'fixed',
  'resolve',
  'resolves',
  'resolved',
];

/** **************************************
 ** HELPER FUNCTIONS
 *************************************** */

/**
 * Returns the resulting Object from the GitHub API downloadArtifact call.
 * This function is a wrapper for the downloadArtifact method in the
 * octokit/rest.js client.
 * https://octokit.github.io/rest.js/v18#actions-download-artifact
 * @param {Object} packages.github - The octokit/rest.js client
 * @param {Object} packages.context - The context of the workflow run
 * @param {Object} artifact - The artifact
 * @returns {Object} The resulting Object
 */
async function _downloadArtifact({ github, context }, artifact) {
  const { owner, repo } = context.repo;
  const { id: artifact_id } = artifact;
  return await github.rest.actions.downloadArtifact({
    owner,
    repo,
    artifact_id,
    archive_format: 'zip',
  });
}

/**
 * Returns an Object of the matching substring and issue number capture.
 * While pull requests may be linked to issues outside of its repository, this
 * function only considers issues in the same repository.
 * https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword
 * @param {string} keyword - A keyword from LINKING_KEYWORDS
 * @param {string} text - The text to match against
 * @returns {Object} The resulting Object
 */
function _extractIssues(keyword, text) {
  const pattern = new RegExp(`${keyword} #(\\d+)`, 'gim');
  return [...text.matchAll(pattern)].map(([match, issue]) => ({
    match,
    issue,
  }));
}

/**
 * Returns an array of labels.
 * @param {Object[]|Object} res - An array of Objects or a single Object
 * @returns {string[]} The array of labels
 */
function _extractLabels(res) {
  const data = Array.isArray(res) ? res.map((r) => r.data).flat() : res.data;
  const labels = data.reduce((acc, label) => acc.add(label.name), new Set());
  return Array.from(labels);
}

/**
 * Returns the resulting Object from the GitHub API listWorkflowRunArtifacts
 * call.
 * This function is a wrapper for the listWorkflowRunArtifacts method in the
 * octokit/rest.js client.
 * https://octokit.github.io/rest.js/v18#actions-list-workflow-run-artifacts
 * @param {Object} packages.github - The octokit/rest.js client
 * @param {Object} packages.context - The context of the workflow run
 * @returns {Object} The resulting Object
 */
async function _listWorkflowRunArtifacts({ github, context }) {
  const { owner, repo } = context.repo;
  const { id: run_id } = context.payload.workflow_run;
  return await github.rest.actions.listWorkflowRunArtifacts({
    owner,
    repo,
    run_id,
  });
}

/**
 * Returns the resulting Object from the GitHub API listLabelsOnIssue call.
 * This function is a wrapper for the listLabelsOnIssue method in the
 * octokit/rest.js client.
 * https://octokit.github.io/rest.js/v18#issues-list-labels-on-issue
 * @param {Object} packages.github - The octokit/rest.js client
 * @param {Object} packages.context - The context of the workflow run
 * @returns {Object} The resulting Object
 */
async function _listLabelsOnIssue({ github, context }, issue) {
  const { owner, repo } = context.repo;
  return await github.rest.issues.listLabelsOnIssue({
    owner,
    repo,
    issue_number: issue,
  });
}

/**
 * Returns the resulting Object from the GitHub API setLabels call.
 * This function is a wrapper for the setLabels method in the
 * octokit/rest.js client.
 * https://octokit.github.io/rest.js/v18#issues-set-labels
 * @param {Object} packages.github - The octokit/rest.js client
 * @param {Object} packages.context - The context of the workflow run
 * @returns {Object} The resulting Object
 */
async function _setLabels({ github, context }, pr, labels) {
  const { owner, repo } = context.repo;
  return await github.rest.issues.setLabels({
    owner,
    repo,
    issue_number: pr,
    labels,
  });
}

/** **************************************
 ** MAIN FUNCTIONS
 *************************************** */

/**
 * Returns the file path of the downloaded artifact.
 * The function downloads the artifact and stores it in a pre-determined
 * location.
 * @param {Object} packages.github - The octokit/rest.js client
 * @param {Object} packages.context - The context of the workflow run
 * @param {Object} packages.core - The @actions/core package
 * @param {string} artifactName - The name of the artifact
 * @returns {string} The file path of the downloaded artifact
 */
async function downloadLabelsArtifact({ github, context }, artifactName) {
  const artifacts = await _listWorkflowRunArtifacts({ github, context });
  const match = artifacts.data.artifacts.filter(
    ({ name }) => name === artifactName
  )[0];
  const download = await _downloadArtifact({ github, context }, match);

  const filepath = `${process.env.GITHUB_WORKSPACE}/${artifactName}.zip`;
  fs.writeFileSync(filepath, Buffer.from(download.data));
  return filepath;
}

/**
 * Returns an array of issue numbers that are linked to the pull request.
 * This function will cause the action workflow to fail if there are no issues
 * linked to the pull request. If at least one issue exists, then the function
 * prints the number of linked issues and the list of issue numbers.
 * @param {Object} packages.github - The octokit/rest.js client
 * @param {Object} packages.context - The context of the workflow run
 * @param {Object} packages.core - The @actions/core package
 * @returns {string[]} An array of issue numbers
 */
function listIssuesFromPRBody({ context, core }) {
  const issues = LINKING_KEYWORDS.reduce((acc, keyword) => {
    const matches = _extractIssues(keyword, context.payload.pull_request.body);
    return acc.concat(matches);
  }, []);

  if (!issues.length) {
    core.setFailed('No linked issues.');
    return [];
  }

  core.info(`Found ${issues.length} issues:`);
  core.info(JSON.stringify(issues));
  return issues;
}

/**
 * Returns an array of labels that are applied to the issues linked to the pull
 * request.
 * This function will continue the action workflow even if there are no labels.
 * If at least one label exists, then the function prints the number of labels
 * and the list of labels.
 * @param {Object} packages.github - The octokit/rest.js client
 * @param {Object} packages.context - The context of the workflow run
 * @param {Object} packages.core - The @actions/core package
 * @param {Array} issues - The list of issue numbers
 * @returns {string} A stringified object of the pull request number and labels.
 */
async function listLabelsFromIssues({ github, context, core }, issues) {
  const res = await Promise.all(
    issues.map(({ issue }) => _listLabelsOnIssue({ github, context }, issue))
  );
  const labels = _extractLabels(res);

  if (!labels.length) {
    core.notice('Linked issues have no labels.');
    return JSON.stringify({});
  }

  core.info(`Found ${labels.length} labels:`);
  core.info(JSON.stringify(labels));

  return JSON.stringify({ pr: process.env.PR_NUMBER, labels });
}

/**
 * Sets labels on the pull request.
 * This function prints the expected number of labels to apply and the actual
 * number of labels that were applied.
 * @param {Object} packages.github - The octokit/rest.js client
 * @param {Object} packages.context - The context of the workflow run
 * @param {Object} packages.core - The @actions/core package
 * @param {string} filepath - The path of the file
 */
async function setLabelsOnPR({ github, context, core }, filepath) {
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const { pr, labels } = data;

  core.info(`Adding ${labels.length} labels.`);
  const res = await _setLabels({ github, context, core }, pr, labels);
  core.info(`==> Added ${res.data.length} labels.`);
}

module.exports = {
  downloadLabelsArtifact,
  listIssuesFromPRBody,
  listLabelsFromIssues,
  setLabelsOnPR,
};
