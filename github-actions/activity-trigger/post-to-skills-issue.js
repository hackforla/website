// Import modules
const getSkillsIssue = require('../utils/get-skills-issue');
const postComment = require('../utils/post-issue-comment');
const checkTeamMembership = require('../utils/check-team-membership');
const statusFieldIds = require('../utils/_data/status-field-ids');
const mutateIssueStatus = require('../utils/mutate-issue-status');



/**
 * Function to get eventActor's Skills Issue and post message
 * @param {Object} github    - GitHub object 
 * @param {Object} context   - Context object
 * @param {Object} activity  - eventActor and message 
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

    // Get eventActor's Skills Issue
    const { skillsIssueNum, skillsIssueNodeId } = await getSkillsIssue(username);
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
    const commentFound = commentData.data.find(comment => comment.body.includes(MARKER))
    const commentFoundId = commentFound ? commentFound.id : null;

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
    const isActiveMember = await checkTeamMembership(github, username, team);

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

module.exports = postToSkillsIssue;
