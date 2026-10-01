// Import modules
const fs = require('fs');
const postIssueComment = require('../utils/post-issue-comment');

// Global variables
// var github;
// var context;

/** **************************************
 ** HELPER FUNCTIONS
 *************************************** */

/**
 * Returns resulting Object from the GitHub API downloadArtifact call.
 * This function is a wrapper for the downloadArtifact method in the
 * octokit/rest.js client.
 * https://octokit.github.io/rest.js/v18#actions-download-artifact
 * @param {Object} packages.github - The octokit/rest.js client
 * @param {Object} packages.context - The context of the workflow run
 * @param {Object} artifact - The artifact
 * @returns {Object} The resulting Object
 */
async function _downloadArtifact({github, context}, artifact) {
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
 * Returns PR data containing the body, PR number, and owner
 * by retrieving data from context.payload
 * @param {Object} packages.context - The context of the workflow run
 * @param {Object} packages.core - The @actions/core package
 * @returns {Object} An object containing the pull request body, number and owner.
 */
function _retrievePRBody({ context, core }) {
  const prBody = context.payload.pull_request.body;
  const prNumber = context.payload.pull_request.number;
  const prOwner = context.payload.pull_request.user.login;

  core.info(`Found PR #${prNumber} authored by ${prOwner}`);


  return { body: prBody, number: prNumber, owner: prOwner };
}


/**
 * Returns the resulting Object from the GitHub API get issue call.
 * This function servers as a wrapper for the get issue method in the
 * octokit.rest.js client.
 * https://octokit.github.io/rest.js/v20#issues-get
 * @param {Object} packages.github - The octokit/rest.js client
 * @param {Object} packages.context - The context of the workflow run
 * @param {string} issueNum - The issue number to be looked up
 * @returns 
 */
async function _checkIssueExists({ github, context }, issueNum) {
  return await github.rest.issues.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNum,
  });
}

/** **************************************
 ** MAIN FUNCTIONS
 *************************************** */

 /**
  * Returns a PR comment if issue is not linked or linked issue could not be found. 
  * Otherwise, returns empty PR comment, indicating that the issue has been properly linked.
  * @param {Object} packages.github - The octokit/rest.js client
  * @param {Object} packages.context - The context of the workflow run
  * @param {Object} packages.core - The @actions/core package
  * @returns 
  */
async function checkForLinkedIssue({ github, context, core }) {
  const pr = _retrievePRBody({ context, core });

  // Search for GitHub keywords followed by 
  // '#' + number. Exclude any matches that are in a comment within the PR body.
  const regex = /(?!<!--)(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\s*#(\d+)(?![^<]*-->)/gi;
  const match = pr.body.match(regex); 

  let prComment = "";

  if (!match) {
    core.info('PR does not have a properly linked issue. Posting comment...');
    prComment = `@${pr.owner}, this Pull Request is not linked to a valid issue. Above, on the first line of your PR, please link the number of the issue that you worked on using the format of 'Fixes #' + issue number, for example:   **_Fixes #9876_**\n\nNote: Do **_not_** use the number of this PR.`;
  } else {
    core.info(match[0]);
    let [ keyword, linkNumber ] = match[0].replaceAll('#','').split(' ');

    core.info(`Found a keyword: \'${keyword}\'. Checking for legitimate linked issue...`);

    // Check if the linked issue exists in repo
    try {
      await _checkIssueExists({ github, context }, linkNumber);
      core.info(`Found an issue: \'#${linkNumber}\' in repo. Reference is a legitimate linked issue.`);
    }
    catch (error) {
      core.info(`Couldn\'t find issue: \'#${linkNumber}\' in repo. Posting comment...`);
      prComment = `@${pr.owner}, the issue number referenced above as "**${keyword}  #${linkNumber}**" is not found. Please replace with a valid issue number.`;
    }
  }

  return JSON.stringify({ prNumber: pr.number, prComment});
}

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
async function downloadPRCommentArtifact({ github, context }, artifactName) {
  const artifacts = _listWorkflowRunArtifacts({ github, context });
  const match = artifacts.data.artifacts.filter(
    ({ name }) => name === artifactName
  )[0];

  const download = await _downloadArtifact({github, context }, match);

  const filepath = `${process.env.GITHUB_WORKSPACE}/${artifactName}.zip`;
  fs.writeFileSync(filepath, Buffer.from(download.data));
  return filepath;
}

/**
 * Calls postIssueComment to post a comment to the PR on GitHub
 * This function us a wrapper for the postIssueComment method
 * and will only be called if prComment contains text.
 * @param {Object} packages.github - The octokit/rest.js client
 * @param {Object} packages.context - The context of the workflow run
 * @param {string} filepath - The path of the file
 */

async function postPRComment({ github, context, cor }, filepath) {
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const { prNumber, prComment } = data;

  if (prComment){
    core.info(`Posting PR comment...`)
    postIssueComment(prNumber, prComment, github, context);
    core.info(`Posted comment:`)
    core.info(JSON.stringify(prComment));
  } else {
    core.info(`No comment posted. Issue is properly linked.`)
  }
}

module.exports = {
  downloadPRCommentArtifact,
  checkForLinkedIssue,
  postPRComment,
};
