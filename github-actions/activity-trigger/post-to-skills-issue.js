// Import modules
const retrieveLabelDirectory = require('../utils/retrieve-label-directory');
const querySkillsIssue = require('../utils/query-skills-issue');
const postComment = require('../utils/post-issue-comment');
const checkTeamMembership = require('../utils/check-team-membership');
const statusFieldIds = require('../utils/_data/status-field-ids');
const mutateIssueStatus = require('../utils/mutate-issue-status');

// Global variables
var github;
var context;

// `complexity0` refers `Complexity: Prework` label
const SKILLS_LABEL = retrieveLabelDirectory("complexity0");



/**
 * Function to get eventActor's Skills Issue and post message
 * @param {Object} github    - GitHub object 
 * @param {Object} context   - Context object
 * @param {Object} package  - eventActor and message 
 * 
 */
async function postToSkillsIssue({g, c}, activity) {

    github = g;
    context = c;

    const owner = context.repo.owner;
    const repo = context.repo.repo;
    const TEAM = 'website-write';

    const username = activity[0];
    const message = activity[1];
    const MARKER = '<!-- Skills Issue Activity Record -->';
    const IN_PROGRESS_ID = statusFieldIds('In_Progress');

    // Get eventActor's Skills Issue number, nodeId, current statusId (all null if no Skills Issue found)
    const skillsInfo = await querySkillsIssue(github, context, username, SKILLS_LABEL);
    const skillsIssueNum = skillsInfo.issueNum;
    const skillsIssueNodeId = skillsInfo.issueId;
    const skillsStatusId = skillsInfo.statusId;

    // Return immediately if Skills Issue not found
    if (skillsIssueNum) {
        console.log(`Found Skills Issue for ${username}: ${skillsIssueNum}`);
    } else {
        console.log(`Did not find Skills Issue for ${username}. Cannot post message.`);
        return;
    }

    // Get all comments from the Skills Issue
    // https://docs.github.com/en/rest/issues/comments?apiVersion=2022-11-28#list-issue-comments
    const commentData = await github.request('GET /repos/{owner}/{repo}/issues/{issueNum}/comments', {
        owner,
        repo,
        issueNum: skillsIssueNum,
    });

    // Find the comment that includes the MARKER text and append message
    const commentFound = commentData.data.find(comment => comment.body.includes(MARKER));
    const commentFoundId = commentFound ? commentFound.id : null;

    if (commentFound) {
        console.log(`Found comment with MARKER: ${MARKER}`);
        const commentId = commentFoundId;
        const originalBody = commentFound.body;
        const updatedBody = `${originalBody}\n${message}`;
        // https://docs.github.com/en/rest/issues/comments?apiVersion=2022-11-28#update-an-issue-comment
        await github.request('PATCH /repos/{owner}/{repo}/issues/comments/{commentId}', {
            owner,
            repo,
            commentId,
            body: updatedBody
        });
    } else {
        console.log(`MARKER not found in comments, creating new comment with MARKER...`);
        const body = `${MARKER}\n## Activity Log: ${username}\n### Repo: https://github.com/hackforla/website\n\n#####  ⚠ Important note: The bot updates this comment automatically - do not edit\n\n${message}`;
        await postComment(skillsIssueNum, body, github, context);
    }

    // If eventActor is team member, open issue and move to "In progress". Else, close issue
    const isActiveMember = await checkTeamMembership(github, username, TEAM);
    let skillsIssueState = "closed";

    if (isActiveMember) {
        skillsIssueState = "open";
        // Update item's status to "In progress (actively working)" if not already
        if (skillsStatusId != IN_PROGRESS_ID) {
            await mutateIssueStatus(github, context, skillsIssueNodeId, IN_PROGRESS_ID);
        }
    }
    await github.request('PATCH /repos/{owner}/{repo}/issues/{issueNum}', {
        owner,
        repo,
        issueNum: skillsIssueNum,
        state: skillsIssueState,
    });
}

module.exports = postToSkillsIssue;
