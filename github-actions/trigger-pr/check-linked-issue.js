// Import modules
const fs = require('fs');
const postIssueComment = require('../utils/post-issue-comment');

// Global variables
var github;
var context;

async function main({ g, c }) {
  github = g;
  context = c;

  // Retrieve body of context.payload and search for GitHub keywords followed by 
  // '#' + number. Exclude any matches that are in a comment within the PR body
  const prBody = context.payload.pull_request.body;
  const prNumber = context.payload.pull_request.number;
  const prOwner = context.payload.pull_request.user.login;
  const regex = /(?!<!--)(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\s*#(\d+)(?![^<]*-->)/gi;
  const match = prBody.match(regex);
  
  let prComment;

  if (!match) {
    console.log('PR does not have a properly linked issue. Posting comment...');
    prComment = `@${prOwner}, this Pull Request is not linked to a valid issue. Above, on the first line of your PR, please link the number of the issue that you worked on using the format of 'Fixes #' + issue number, for example:   **_Fixes #9876_**\n\nNote: Do **_not_** use the number of this PR.`;
  }
  
  else {
    console.log(match[0]);
    let [ keyword, linkNumber ] = match[0].replaceAll('#','').split(' ');
    console.log(`Found a keyword: \'${keyword}\'. Checking for legitimate linked issue...`);

    // Check if the linked issue exists in repo
    try {
      const response = await github.rest.issues.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: linkNumber,
      });
      console.log(`Found an issue: \'#${linkNumber}\' in repo. Reference is a legitimate linked issue.`);
    }
    catch (error) {
      console.log(`Couldn\'t find issue: \'#${linkNumber}\' in repo. Posting comment...`);
    prComment = `@${prOwner}, the issue number referenced above as "**${keyword}  #${linkNumber}**" is not found. Please replace with a valid issue number.`;
    }
  }

  // If the prComment was given text, then post the comment to the PR
  if (prComment) {
    postIssueComment(prNumber, prComment, github, context);
  }
}

module.exports = main;
