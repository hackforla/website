// Global variables
var github;
var context;



/**
 * This function parses the triggered event to determine the trigger eventName and eventAction
 * and from this information decide the eventActor (user who is credited for the event).
 * @param {Object} github    - GitHub object from function calling activity-trigger.js
 * @param {Object} context   - Context of the function calling activity-trigger.js
 * @returns {Object}         - An object containing the eventActor and a message
 */
async function activityTrigger({g, c}) {

    github = g;
    context = c;

    let issueNum = '';
    let assignee = '';
    let timeline = '';

    let eventName = context.eventName;
    let eventAction = context.payload.action;
    let eventActor = context.actor;
    let activity = [];

    // Exclude all bot actors from being recorded to prevent infinite loops
    const excludedActors = ['HackforLABot', 'elizabethhonest', 'github-actions', 'github-advanced-security', 'github-pages', 'dependabot[bot]', 'dependabot-preview[bot]', 'dependabot', 'dependabot-preview'];

    if (eventName === 'issues') {
        issueNum = context.payload.issue.number;
        eventUrl = context.payload.issue.html_url;
        timeline = context.payload.issue.updated_at;
        // If issue action is not opened and an assignee exists, then change
        // the eventActor to the issue assignee, else retain issue author
        assignee = context.payload.assignee?.login;
        if (eventAction != 'opened' && assignee != null ) {
            console.log(`Issue is ${eventAction}. Change eventActor => ${assignee}`);
            eventActor = assignee;
        } else {
            eventActor = context.payload.issue.user.login;
        }
        if (eventAction === 'closed') {
            let reason = context.payload.issue.state_reason;
            eventAction = reason;
        }
    } else if (eventName === 'issue_comment') {
        // Check if the comment is on an issue or a pull request
        let isPullRequest = context.payload.issue?.pull_request;
        if (isPullRequest) {
          eventName = 'pull_request_comment';
        }
        issueNum = context.payload.issue.number;
        eventUrl = context.payload.comment.html_url;
        timeline = context.payload.comment.updated_at;
    } else if (eventName === 'pull_request') {
        issueNum = context.payload.pull_request.number;
        eventUrl = context.payload.pull_request.html_url;
        timeline = context.payload.pull_request.updated_at;
        // If PR closed, check if merged and change eventActor to the original pr author
        if (eventAction === 'closed') {
            eventAction = context.payload.pull_request.merged ? 'merged' : 'closed';
            eventActor = context.payload.pull_request.user.login;
        }
    } else if (eventName === 'pull_request_review') {
        issueNum = context.payload.pull_request.number;
        eventUrl = context.payload.review.html_url;
        timeline = context.payload.review.updated_at;
    }

    // Following are for confirmation, can be removed
    console.log(`eventName = ${eventName}`);
    console.log(`eventAction = ${eventAction}`);
    console.log(`eventActor = ${eventActor}`);
    console.log(`issueNum = ${issueNum}`);
    console.log(`eventUrl = ${eventUrl}`);
    console.log(`eventTime = ${timeline}`);

    // Return immediately if the issueNum is a Skills Issue- to discourage
    // infinite loop (recording comment, recording the recording of comment, etc.)
    const isSkillsIssue = await checkIfSkillsIssue(issueNum);
    if (isSkillsIssue) {
        console.log(`issueNum: ${issueNum} identified as Skills Issue`);
        return activity;
    }
    // Return immediately if the eventActor is a bot- same reason
    if (eventActor in excludedActors) {
        return activity;
    }

    // Message templates to post on Skills Issue
    const actionMap = {
        'issues.opened': 'opened issue:',
        'issues.completed': 'closed issue as completed',
        'issues.not_planned': 'closed issue as not planned',
        'issues.duplicate': 'closed issue as duplicate',
        'issues.reopened': 'reopened issue',
        'issues.assigned': 'assigned to issue',
        'issues.unassigned': 'unassigned from issue',
        'issue_comment.created': 'commented on issue',
        'pull_request_review.created': 'submitted pull request review',
        'pull_request_comment.created': 'commented on pull request',
        'pull_request.opened': 'opened a pull request',
        'pull_request.closed': 'pull request closed w/o merging',
        'pull_request.merged': 'pull request merged',
        'pull_request.reopened': 'reopened pull request'
    };
    const action = actionMap[`${eventName}.${eventAction}`];
    let message = `@ ${eventActor} ${action}: #[${issueNum}](${eventUrl}) at ${timeline}`;
    console.log(message);

    activity = [eventActor, message];
    return activity;

  

    /**
     * Helper function to check if issueNum references a Skills Issue
     * @param {Number} issueNum   - issue number to check 
     * @returns {Boolean}         - true if Skills Issue, false if not
     */
    async function checkIfSkillsIssue(issueNum) {
        // https://docs.github.com/en/rest/issues/labels?apiVersion=2022-11-28#list-labels-for-an-issue
        const labelData = await github.request('GET /repos/{owner}/{repo}/issues/{issue_number}/labels', {
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: issueNum
        });
        const isSkillsIssue = labelData.data.some(label => label.name === "Complexity: Prework");

        return isSkillsIssue;
    }
}

module.exports = activityTrigger;
