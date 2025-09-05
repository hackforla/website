// Import modules
const retrieveLabelDirectory = require('../utils/retrieve-label-directory');
const querySkillsIssue = require('../utils/query-skills-issue');
const postComment = require('../utils/post-issue-comment');
const checkTeamMembership = require('../utils/check-team-membership');
const statusFieldIds = require('../utils/_data/status-field-ids');
const mutateIssueStatus = require('../utils/mutate-issue-status');

// `complexity0` refers `Complexity: Prework` label
const SKILLS_LABEL = retrieveLabelDirectory("complexity0");



/**
 * Function to get eventActor's Skills Issue and post message
 * @param {Object} github    - GitHub object 
 * @param {Object} context   - Context object
 * @param {Object} activity  - eventActor and message 
 * 
 */
async function postToSkillsIssue({github, context}, activity) {

    const owner = context.repo.owner;
    const repo = context.repo.repo;
    const TEAM = 'website-write';

    const [eventActor, message] = activity;
    const MARKER = '<!-- Skills Issue Activity Record -->';
    const IN_PROGRESS_ID = statusFieldIds('In_Progress');

    // If eventActor undefined, exit
    if (!eventActor) {
        console.log(`eventActor is undefined (likely a bot). Cannot post message.`);
        return;
    }
    
    // Get eventActor's Skills Issue number, nodeId, current statusId (all null if no Skills Issue found)
    const skillsInfo = await querySkillsIssue(github, context, eventActor, SKILLS_LABEL);
    const skillsIssueNum = skillsInfo.issueNum;
    const skillsIssueNodeId = skillsInfo.issueId;
    const skillsStatusId = skillsInfo.statusId;

    // Return immediately if Skills Issue not found
    if (skillsIssueNum) {
        console.log(`Found Skills Issue for ${eventActor}: #${skillsIssueNum}`);
    } else {
        console.log(`Did not find Skills Issue for ${eventActor}. Cannot post message.`);
        return;
    }

    // Get all comments from the Skills Issue
    let commentData;
    try {
        // https://docs.github.com/en/rest/issues/comments?apiVersion=2022-11-28#list-issue-comments
        commentData = await github.request('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
            owner,
            repo,
            per_page: 100,
            issue_number: skillsIssueNum,
        });
    } catch (err) {
        console.error(`GET comments failed for issue #${skillsIssueNum}:`, err);
        return;
    }

    // Find the comment that includes the MARKER text and append message
    const commentFound = commentData.data.find(comment => comment.body.includes(MARKER));
    const commentFoundId = commentFound ? commentFound.id : null;

    if (commentFound) {
        console.log(`Found comment with MARKER: ${MARKER}`);
        const commentId = commentFoundId;
        const originalBody = commentFound.body;
        const updatedBody = `${originalBody}\n${message}`;
        try {
            // https://docs.github.com/en/rest/issues/comments?apiVersion=2022-11-28#update-an-issue-comment
            await github.request('PATCH /repos/{owner}/{repo}/issues/comments/{commentId}', {
                owner,
                repo,
                commentId,
                body: updatedBody
            });
        } catch (err) {
            console.error(`Something went wrong updating comment:`, err);
        }
        
    } else {
        console.log(`MARKER not found in comments, creating new comment with MARKER...`);
        const body = `${MARKER}\n## Activity Log: ${eventActor}\n### Repo: https://github.com/hackforla/website\n\n#####  ⚠ Important note: The bot updates this comment automatically - do not edit\n\n${message}`;
        await postComment(skillsIssueNum, body, github, context);
    }

    // If eventActor is team member, open issue and move to "In progress". Else, close issue
    const isActiveMember = await checkTeamMembership(github, context, eventActor, TEAM);
    let skillsIssueState = "closed";

    if (isActiveMember) {
        skillsIssueState = "open";
        // Update item's status to "In progress (actively working)" if not already
        if (skillsIssueNodeId && skillsStatusId !== IN_PROGRESS_ID) {
            await mutateIssueStatus(github, context, skillsIssueNodeId, IN_PROGRESS_ID);
        }
    }
    try {
        await github.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
            owner,
            repo,
            issue_number: skillsIssueNum,
            state: skillsIssueState,
        });
    } catch (err) {
        console.error(`Failed to update issue #${skillsIssueNum} state:`, err);
    }
}

module.exports = postToSkillsIssue;
