/**
 * This function parses the triggered event to determine the trigger eventName and eventAction
 * and from this information decide the eventActor (user who is credited for the event).
 * @param {Object} github    - GitHub object from function calling activity-trigger.js
 * @param {Object} context   - Context of the function calling activity-trigger.js
 * @returns {Object}         - An object containing the eventActor and a message
 */
async function activityTrigger({github, context}) {

    let issueNum = '';
    let assignee = '';
    let timeline = '';

    let eventName = context.eventName;
    let eventAction = context.payload.action;
    let eventActor = context.actor;
    let eventPRAuthor = '';
    let activities = [];

    // Exclude all bot actors from being recorded as a guardrail against infinite loops
    const EXCLUDED_ACTORS = ['HackforLABot', 'elizabethhonest', 'github-actions', 'github-advanced-security', 'github-pages', 'dependabot[bot]', 'dependabot-preview[bot]', 'dependabot', 'dependabot-preview'];

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
            eventActor = context.payload.issue.user.login;
            eventAction = 'Closed-' + reason;
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
    } else if (eventName === 'pull_request_target') {
        issueNum = context.payload.pull_request.number;
        eventUrl = context.payload.pull_request.html_url;
        timeline = context.payload.pull_request.updated_at;
        // If PR closed, check if 'merged' and save 'eventActor' & 'eventPRAuthor'
        if (eventAction === 'closed') {
            eventAction = context.payload.pull_request.merged ? 'PRmerged' : 'PRclosed';
            eventActor = context.actor;
            eventPRAuthor = context.payload.pull_request.user.login;
        }
    } else if (eventName === 'pull_request_review') {
        issueNum = context.payload.pull_request.number;
        eventUrl = context.payload.review.html_url;
        timeline = context.payload.review.updated_at;
    }

    // Return immediately if the issueNum is a Skills Issue- to discourage
    // infinite loop (recording comment, recording the recording of comment, etc.)
    const isSkillsIssue = await checkIfSkillsIssue(issueNum);
    if (isSkillsIssue) {
        console.log(`- issueNum: ${issueNum} identified as Skills Issue`);
        // return activities; <-- confirm before uncommenting
    }

    // Message templates to post on Skills Issue
    const actionMap = {
        'issues.opened': 'opened',
        'issues.Closed-completed': 'closed as completed',
        'issues.Closed-not_planned': 'closed as not planned',
        'issues.Closed-duplicate': 'closed as duplicate',
        'issues.reopened': 'reopened',
        'issues.assigned': 'assigned',
        'issues.unassigned': 'unassigned',
        'issue_comment.created': 'commented',
        'pull_request_review.created': 'submitted review',
        'pull_request_comment.created': 'commented',
        'pull_request.opened': 'opened',
        'pull_request.PRclosed': 'closed',
        'pull_request.PRmerged': 'merged',
        'pull_request.reopened': 'reopened'
    };
    
    let localTime = getDateTime(timeline);
    let action = actionMap[`${eventName}.${eventAction}`];
    let message = `- ${eventActor} ${action}: ${eventUrl} at ${localTime}`;

    // Check to confirm the eventActor isn't a bot
    const isExcluded = (eventActor) => EXCLUDED_ACTORS.includes(eventActor);
    if (!isExcluded(eventActor)) {
        console.log(`Not a bot. Message to post:  ${message}`);
        activities.push([eventActor, message]);
    }

    // Only if issue is closed, and eventActor != assignee, return assignee and message
    if (eventAction.includes('Closed-') && (eventActor !== assignee)) {
        message = `- ${assignee} issue ${action}: ${eventUrl} at ${localTime}`;
        activities.push([assignee, message]);
    }
    // Only if PRclosed or PRmerged, and PRAuthor != eventActor, return PRAuthor and message
    if ((eventAction === 'PRclosed' || eventAction === 'PRmerged') && (eventActor != eventPRAuthor)) {
        let messagePRAuthor = `- ${eventPRAuthor} PR was ${action}: ${eventUrl} at ${localTime}`;
        if (!isExcluded(eventPRAuthor)) {
            console.log(`Not a bot. Message to post:  ${messagePRAuthor}`);
            activities.push([eventPRAuthor, messagePRAuthor]);
        }
    }

    return JSON.stringify(activities);



    /**
     * Helper function to check if issueNum (that triggered the event) is a Skills Issue
     * @param {Number} issueNum   - issueNum to check 
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



    /**
     * Helper function to get the date and time in a readable format
     * @param {String} timeline   - the date and time string from the event
     * @returns {String} dateTime - formatted date and time string  
     */
    function getDateTime(timeline) {
        const date = new Date(timeline);
        const options = { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short' };
        return date.toLocaleString('en-US', options);
    }

}

module.exports = activityTrigger;
