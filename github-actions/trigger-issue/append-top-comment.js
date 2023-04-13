// Octokit.js
// https://github.com/octokit/core.js#readme
const {Octokit} = require('@octokit/rest');
/**
 * @description
 * @param {Object} github
 * @param {Object} context
 */

const octokit = new Octokit({
  auth: "YOUR-TOKEN"
});

await octokit.request("PATCH /repos/{owner}/{repo}/issues/{issue_number}", {
  owner: "OWNER",
  repo: "REPO",
  issue_number: "ISSUE_NUMBER",
  title: "Found a bug",
  body: "I'm having a problem with this.",
  state: "open",
  headers: {
    "X-GitHub-Api-Version": "2022-11-28"
  }
});
