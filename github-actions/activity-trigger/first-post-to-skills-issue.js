// Import modules
const fs = require('fs');

const retrieveSkillsId = require('./retrieve-skills-id');
const postComment = require('../utils/post-issue-comment');
const checkTeamMembership = require('../utils/check-team-membership');
const statusFieldIds = require('../utils/_data/status-field-ids');
const mutateIssueStatus = require('../utils/mutate-issue-status');
const minimizeIssueComment = require('../utils/hide-issue-comment');
const getIssueComments = require('./get-issue-comments');

// Global variables
var github;
var context;

/**
 * Function to retrieve Skills Issue and add comments
 * @param {Object} github    - GitHub object 
 * @param {Object} context   - Context object
 * 
 */
async function firstPostToSkillsIssue({g, c}) {

    github = g;
    context = c;

    const owner = context.repo.owner;
    const repo = context.repo.repo;
    const team = 'website-write';


    try {
        const csvPath = 'github-actions/activity-trigger/member_activity_history_bot_22.csv';

        const csvContent = fs.readFileSync(csvPath, 'utf-8');

        // Parse CSV assuming
        const rows = csvContent
            .trim()
            .split('\n')
            .map(line => line.split(','));

        const processed = processCsvForSkillsIssue(rows);

        console.log(JSON.stringify(processed, null, 2)); // For testing only

        processed.forEach(async entry => {
            let username = entry.username;
            let skillsIssueNum = parseInt(entry.issueNum);
            let message = entry.postToSkillsIssue;
            const MARKER = '<!-- Skills Issue Activity Record -->'; 

            // Since we know this is the first run and no matching issue comments exist yet, we can post immediately
            const body = `${MARKER}\n## Activity Log: ${username}\n\n#####  ⚠ Important note: The bot updates this issue automatically - do not edit\n\n${message}`;
            await postComment(skillsIssueNum, body, github, context);

            // Perform cleanup of comments
            const commentIds = await getIssueComments(github, context, skillsIssueNum);
            for (const commentId of commentIds) {
                await minimizeIssueComment(github, commentId);
            }
            
            // Check whether eventActor is team member; if so open issue and move to "In progress"
            const isActiveMember = await checkTeamMembership(github, username, team);

            if (isActiveMember) {
                // If isActiveMember, make sure Skills Issue is open, and...
                await github.request('PATCH /repos/{owner}/{repo}/issues/{issueNum}', {
                    owner,
                    repo,
                    issueNum: skillsIssueNum,
                    state: "open",
                });
                // update issue's status to "In progress (actively working)"
                // Needs skillsIssueNodeId first.
                let skillsIssueNodeId = await retrieveSkillsId(github, context, skillsIssueNum);
                let statusValue = statusFieldIds('In_Progress');
                await mutateIssueStatus(github, context, skillsIssueNodeId, statusValue);
            }
        });

    } catch (error) {
        console.error('Error processing CSV:', error);
        process.exit(1);
    }
}

function processCsvForSkillsIssue(rows) {

  const results = [];
  let currentUser = null;
  let skillsIssueNum = null;
  let postToSkillsIssue = null;
  let collecting = false;

  for (const row of rows) {
    const username = row[0];
    const issueNum = row[1];
    const col3 = row[2];

    if (username !== currentUser) {
      if (collecting && postToSkillsIssue !== null) {
        results.push({ username: currentUser, issueNum: skillsIssueNum, postToSkillsIssue });
      }

      currentUser = username;

      if (col3 === "SKILLS ISSUE") {
        postToSkillsIssue = "";
        skillsIssueNum = issueNum;
        collecting = true;
      } else {
        postToSkillsIssue = null;
        collecting = false;
      }
    } else {
      if (collecting) {
        postToSkillsIssue += col3 + "\n";
      }
    }
  }

  if (collecting && postToSkillsIssue !== null) {
    results.push({ username: currentUser, issueNum: skillsIssueNum, postToSkillsIssue });
  }

  return results;
}

module.exports = firstPostToSkillsIssue;
