// Import modules
const retrieveLabelDirectory = require('../utils/retrieve-label-directory');
const querySkillsIssue = require('../utils/query-skills-issue');
const postComment = require('../utils/post-issue-comment');
const checkTeamMembership = require('../utils/check-team-membership');
const statusFieldIds = require('../utils/_data/status-field-ids');
const mutateIssueStatus = require('../utils/mutate-issue-status');
const { lookupSkillsDirectory, updateSkillsDirectory } = require('../utils/skills-directory'); 

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
        console.log(`eventActor is undefined (likely a bot). Cannot post message...`);
        return;
    }

    // Step 1: Try local directory lookup first
    let needsUpdate = false;
    let skillsInfo = lookupSkillsDirectory(eventActor);

    if (!skillsInfo) {
        console.log(`No cached Skills Issue found for ${eventActor}, querying GitHub...`);

        // Step 2: Fallback to GitHub API
        skillsInfo = await querySkillsIssue(github, context, eventActor, SKILLS_LABEL);

        // Step 3: Save result to local directory if found
        if (skillsInfo && skillsInfo.issueNum) {
            needsUpdate = true
        } else {
          console.log(` ⮡  No Skills Issue found for ${eventActor}. Cannot post message.`);
          return;   
        }
    }
    // Get eventActor's Skills Issue number, nodeId, current statusId (all null if no Skills Issue found) 
    //const skillsIssueNum = skillsInfo.issueNum;
    const skillsIssueNum = 17;
    const skillsIssueNodeId = skillsInfo.issueId;
    const skillsStatusId = skillsInfo?.statusId || 'unknown';
    const isArchived = skillsInfo?.isArchived || false;
    const commentIdCached = skillsInfo?.commentId || null;   // not used currently
    
 console.log(`skillsIssueNum: ${skillsIssueNum}, skillsIssueNodeId: ${skillsIssueNodeId}, skillsStatusId: ${skillsStatusId}, isArchived: ${isArchived}`);  // only for debugging 
    
    // Return immediately if Skills Issue not found
    if (!skillsIssueNum) {
        console.log(` ⮡  Did not find Skills Issue for ${eventActor}. Cannot post message.`);
        return;
    }
    console.log(` ⮡  Found Skills Issue for ${eventActor}: #${skillsIssueNum}`);

    let commentIdToUse = commentIdCached;
    let commentFound = null;

    // Try cached comment ID first
    if (commentIdCached) {
        console.log(` ⮡  Found cached comment ID for ${eventActor}: ${commentIdCached}`);
        try {
            const { data: cachedComment } = await github.request(
                'GET /repos/{owner}/{repo}/issues/comments/{comment_id}',
                {
                    owner,
                    repo,
                    comment_id: commentIdCached,
                }
            );

            if (cachedComment && cachedComment.body.includes(MARKER)) {
                const updatedBody = `${cachedComment.body}\n${message}`;
                await github.request('PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}', {
                    owner,
                    repo,
                    comment_id: commentIdCached,
                    body: updatedBody,
                });
                console.log(` ⮡  Updated cached comment #${commentIdCached}`);
               
            } else {
                commentIdToUse = null;
            }
        } catch (err) {
            console.warn(` ⮡  Cached comment invalid or not found. Falling back to search.`, err);
            commentIdToUse = null; // Force fallback path
        }
    }

    // Fallback — search for MARKER or create new comment
    if (!commentIdToUse) {
        console.log(` ⮡  Searching for activity comment marker...`);
        let commentData;
        try {
            commentData = await github.request(
                'GET /repos/{owner}/{repo}/issues/{issue_number}/comments',
                {
                    owner,
                    repo,
                    per_page: 100,
                    issue_number: skillsIssueNum,
                }
            );
        } catch (err) {
            console.error(` ⮡  GET comments failed for issue #${skillsIssueNum}:`, err);
            return;
        }

        commentFound = commentData.data.find((comment) => comment.body.includes(MARKER));

        if (commentFound) {
            console.log(` ⮡  Found comment with MARKER...`);
            const comment_id = commentFound.id;
            const originalBody = commentFound.body;
            const updatedBody = `${originalBody}\n${message}`;
            try {
                await github.request('PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}', {
                    owner,
                    repo,
                    comment_id,
                    body: updatedBody,
                });
                console.log(` ⮡  Entry posted to Skills Issue #${skillsIssueNum}`);
                // Cache this comment ID
                updateSkillsDirectory(eventActor, { commentId: comment_id });
            } catch (err) {
                console.error(` ⮡  Something went wrong posting entry to #${skillsIssueNum}:`, err);
            }
        } else {
            console.log(` ⮡  MARKER not found, creating new comment entry with MARKER...`);
            const body = `${MARKER}\n## Activity Log: ${eventActor}\n### Repo: https://github.com/hackforla/website\n\n##### ⚠ Important note: The bot updates this comment automatically - do not edit\n\n${message}`;
            try {
                const { data: newComment } = await github.request(
                    'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
                    {
                        owner,
                        repo,
                        issue_number: skillsIssueNum,
                        body,
                    }
                );
                console.log(` ⮡  Entry posted to Skills Issue #${skillsIssueNum}`);
                // Cache new comment ID
               // updateSkillsDirectory(eventActor, { commentId: newComment.id });
            } catch (err) {
                console.error(` ⮡  Failed to create new comment for issue #${skillsIssueNum}:`, err);
            }
        }
    }
      if (needsUpdate) {
         console.log(` ⮡  Updating Skills Directory for ${eventActor}...`);
         updateSkillsDirectory(eventActor, skillsIssueNum, skillsIssueNodeId, commentIdFound);
      };


    // Only proceed if Skills Issue message does not include: 'closed', 'assigned', or isArchived 
    if (!(message.includes('closed') || message.includes('assigned') || isArchived)) {

        // If eventActor is team member, open issue and move to "In progress"
       //const isActiveMember = await checkTeamMembership(github, context, eventActor, TEAM);
       const isActiveMember = true;
        if (isActiveMember) {
            try {
                await github.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
                    owner,
                    repo,
                    issue_number: skillsIssueNum,
                    state: "open",
                });
                console.log(` ⮡  Re-opened issue #${skillsIssueNum}`);
                // Update item's status to "In progress (actively working)" if not already
                if (skillsIssueNodeId && skillsStatusId !== IN_PROGRESS_ID) {
                    const statusMutated = await mutateIssueStatus(github, context, skillsIssueNodeId, IN_PROGRESS_ID);
                    if (statusMutated) console.log(` ⮡  Changed issue #${skillsIssueNum} to "In progress"`);
                }
            } catch (err) {
                console.error(` ⮡  Failed to update issue #${skillsIssueNum} state:`, err);
            }
        }
    }

}

module.exports = postToSkillsIssue;
