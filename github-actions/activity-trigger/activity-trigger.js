/**
 * This function parses the triggered event to determine the trigger eventName and eventAction
 * and from this information decide the eventActor (user who is credited for the event).
 * @param {Object} github    - GitHub object from function calling activity-trigger.js
 * @param {Object} context   - Context of the function calling activity-trigger.js
 * @returns {Object}         - An object containing the eventActor and a message
 */
async function activityTrigger({github, context}) {

    let issueNum = '';
    let timeline = '';
    let eventUrl = '';

    let eventName = context.eventName;
    let eventAction = context.payload.action;
    let eventActor = context.actor;

    let eventObserver = '';
    let eventPRAuthor = '';
    let activities = [];

    // Exclude all bot actors from being recorded as a guardrail against infinite loops
    const EXCLUDED_ACTORS = [
        "HackforLABot",
        "elizabethhonest",
        "dependabot",
        "dependabot[bot]",
        "github-actions",
        "github-actions[bot]",
        "github-advanced-security",
        "github-advanced-security[bot]"
    ];

    if (eventName === 'issues') {
        issueNum = context.payload.issue.number;
        eventUrl = context.payload.issue.html_url;
        timeline = context.payload.issue.updated_at;
        // eventActor is the actor that directly causes or performs the eventAction
        // eventObserver is the actor whose issue is being acted upon
        if (eventAction === 'closed') {
            // eventObserver is the assignee if exists, else is the issueAuthor
            if (context.payload.issue.assignees?.length > 0) {
                eventObserver = context.payload.issue.assignees[0].login; // aka assignee (first)
            } else {
                eventObserver = context.payload.issue.user.login;         // aka issueAuthor
            }
            let reason = context.payload.issue.state_reason;
            eventAction = 'Closed-' + reason;
        // eventActor is the assignee when eventAction is assigned/unassigned (not context.actor) 
        } else if (eventAction === 'assigned' || eventAction === 'unassigned') {
            eventActor = context.payload.assignee.login;
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
        eventActor = context.payload.review.user.login;
    } else if (eventName === 'pull_request_review_comment') {
        issueNum = context.payload.pull_request.number;
        eventUrl = context.payload.comment.html_url;
        timeline = context.payload.comment.updated_at;
    }

    // Return immediately if the issueNum is a Skills Issue- to discourage
    // infinite loop (recording comment, recording the recording of comment, etc.)
    if (eventName === 'issues' || eventName === 'issue_comment') {
        const isSkillsIssue = await checkIfSkillsIssue(issueNum);
        if (isSkillsIssue) {
            console.log(`- issueNum: ${issueNum} identified as Skills Issue`);
            // return activities; <-- do not uncomment yet; continue to capture logs
        }
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
        'pull_request_review.submitted': 'submitted review',
        'pull_request_review_comment.created': 'commented',
        'pull_request_comment.created': 'commented',
        'pull_request_target.opened': 'opened',
        'pull_request_target.PRclosed': 'closed',
        'pull_request_target.PRmerged': 'merged',
        'pull_request_target.reopened': 'reopened'
    };
    
    let localTime = getDateTime(timeline);
    let action = actionMap[`${eventName}.${eventAction}`];

    // Check to confirm the eventActor isn't a bot
    if (!checkIfBot(eventActor)) {
        composeAndPushMessage(eventActor, action, eventUrl, localTime);
    } 
    // Only if issue is closed, eventObserver !== eventActor, and eventObserver not a bot
    if (eventAction.includes('Closed-') && (eventActor !== eventObserver) && (!checkIfBot(eventObserver))) {
        composeAndPushMessage(eventObserver, `issue was ${action}`, eventUrl, localTime);
    }
    // Only if PRclosed or PRmerged, and PRAuthor != eventActor, return PRAuthor and message
    if (eventAction.includes('PR') && (eventActor != eventPRAuthor) && (!checkIfBot(eventPRAuthor))) {
        composeAndPushMessage(eventPRAuthor, `PR was ${action}`, eventUrl, localTime);
    }

    return activities;



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

    /**
     * Helper function to check if eventActor is a bot
     * @param {String} eventActor   - the eventActor to check
     * @returns {Boolean}           - true if bot, false if not
     */
    function checkIfBot(eventActor) {
        let isBot = EXCLUDED_ACTORS.includes(eventActor);
        if (isBot) console.log(`eventActor: ${eventActor} likely a bot. Do not post`); 
        return isBot;
    }

    /**
     * Helper function to create message and push to activities array
     * @param {String} actor    - the eventActor
     * @param {String} action   - the action performed by the eventActor
     * @param {String} url      - the URL of the issue or PR
     * @param {String} time     - the date and time of the event
     */
    function composeAndPushMessage(actor, action, url, time) {
        let message =  `- ${actor} ${action}: ${url} at ${time}`;
        console.log(`Message to post:  "${message}"`);
        activities.push([actor, message]);
    }

}

module.exports = activityTrigger;