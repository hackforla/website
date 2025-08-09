// Import modules
const fs = require('fs');
// const retrieveSkillsIssue = require('../utils/retrieve-skills-issue');
const postComment = require('../utils/post-issue-comment');
const checkTeamMembership = require('../utils/check-team-membership');
const statusFieldIds = require('../utils/_data/status-field-ids');
const mutateIssueStatus = require('../utils/mutate-issue-status');

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
        const csvPath = 'github-actions/utils/_data/member_copy.csv';  
        const csvContent = fs.readFileSync(csvPath, 'utf-8');

        // Parse CSV assuming tab-separated values
        const rows = csvContent
            .trim()
            .split('\n')
            .map(line => line.split(','));

        const processed = processCsvForSkillsIssue(rows);

        console.log(JSON.stringify(processed, null, 2));
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






/*


    const username = activity[0];
    const message = activity[1];
    const MARKER = '<!-- Skills Issue Activity Record -->';

    // Retrieve user's Skills Issue
    const { skillsIssueNum, skillsIssueNodeId } = await retrieveSkillsIssue(username);

    if (skillsIssueNum) {
        console.log(`Found Skills Issue for ${username}: ${skillsIssueNum}`);
    } else {
        console.log(`Did not find Skills Issue for ${username}. Cannot post message.`);
        return
    }

    // Retrieve all comments from the Skills Issue
    // https://docs.github.com/en/rest/issues/comments?apiVersion=2022-11-28#list-issue-comments
    const commentData = await github.request('GET /repos/{owner}/{repo}/issues/{issueNum}/comments', {
        owner,
        repo,
        issueNum: skillsIssueNum,
    });

    // Find the comment that included the MARKER text and append
    const commentFound = commentData.data.find(comment => comment.body.includes(MARKER))
    const commentFoundId = commentFound ? commentFound.id : null;
    // console.log(commentFound.id);
    // console.log(commentFound.body);
    if (commentFound) {
        const commentId = commentFoundId;
        const originalBody = commentFound.body;
        const updatedBody = `${originalBody}\n${message}`;
        // https://docs.github.com/en/rest/issues/comments?apiVersion=2022-11-28#update-an-issue-comment
        const patchSkillsIssue = await github.request('PATCH /repos/{owner}/{repo}/issues/comments/{commentId}', {
            owner,
            repo,
            commentId,
            body: updatedBody
        });
    } else {
        const body = `${MARKER}\n## Activity Log: ${username}\n${message}`;
        await postComment(github, context, skillsIssueNum, body);
    }

    // Check whether eventActor is team member; if so open issue and move to "In progress"
    const isActiveMember = await checkTeamMembership(github, context, username, team);

    if (isActiveMember) {
        // Make sure Skills Issue is open
        await github.request('PATCH /repos/{owner}/{repo}/issues/{issueNum}', {
            owner,
            repo,
            issueNum: skillsIssueNum,
            state: "open",
        });
        // Update item's status to "In progress (actively working)"
        let statusValue = statusFieldIds('In_Progress');
        await mutateIssueStatus(github, context, skillsIssueNodeId, statusValue);
    }
}
*/
module.exports = firstPostToSkillsIssue;
