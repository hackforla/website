// Import modules
const fs = require('fs');
const retrieveLabelDirectory = require('../../utils/retrieve-label-directory');
const queryIssueInfo = require('../../utils/query-issue-info');
const findLinkedIssue = require('../../utils/find-linked-issue');
const getTimeline = require('../../utils/get-timeline');
const minimizeIssueComment = require('../../utils/hide-issue-comment');

// Global variables
var github;
var context;

// Use labelKeys to map current labelNames from label directory
const [
  statusUpdated,
  statusInactive1,
  statusInactive2,
  draft,
  er,
  epic,
  dependency,
] = [
  "statusUpdated",
  "statusInactive1",
  "statusInactive2",
  "draft",
  "er",
  "epic",
  "dependency"
].map(retrieveLabelDirectory);

const updatedByDays = 3;                // If last update update  3 days, the issue is considered updated
const commentByDays = 7;                // If last update between 7 to 14 days ago, issue is outdated and needs update
const inactiveUpdatedByDays = 14;       // If last update greater than 14 days ago, the issue is considered inactive

const threeDayCutoffTime = new Date();
threeDayCutoffTime.setDate(threeDayCutoffTime.getDate() - updatedByDays);
const sevenDayCutoffTime = new Date();
sevenDayCutoffTime.setDate(sevenDayCutoffTime.getDate() - commentByDays);
const fourteenDayCutoffTime = new Date();
fourteenDayCutoffTime.setDate(fourteenDayCutoffTime.getDate() - inactiveUpdatedByDays);



/**
 * The main function, which retrieves issues from a specific column in a specific project, before examining
 * the timeline of each issue for outdatedness. An update to an issue is either 1.) a comment by the assignee,
 * or 2.) assigning an assignee to the issue. If the last update was not between 7 to 14 days ago, apply the
 * appropriate label and request an update. However, if the assignee has submitted a PR that will fix the issue
 * regardless of when, all update-related labels should be removed.
 * @param {Object} g                   - GitHub object from actions/github-script
 * @param {Object} c                   - context object from actions/github-script
 * @param {String} projectBoardToken   - the Personal Access Token for the action
 */
async function main({ g, c }) {
  github = g;
  context = c;

  // Retrieve all issue numbers from a repo
  const issueNums = await getIssueNumsFromRepo();

  for await (let issueNum of issueNums) {
    const timeline = await getTimeline(issueNum, github, context);
    const assignees = await getAssignees(issueNum);
    // Error catching 
    if (assignees.length === 0) {
      console.log(`Issue #${issueNum}: Assignee not found, skipping`);
      continue;
    }

    // Add and remove labels as well as post comment if the issue's timeline indicates the issue is inactive, to be updated or up-to-date accordingly
    const responseObject = await isTimelineOutdated(timeline, issueNum, assignees);

    if (responseObject.result === true && responseObject.labels === statusInactive1) {   // 7-day outdated: add to be updated label, remove others
      await removeLabels(issueNum, statusUpdated, statusInactive2);
      await addLabels(issueNum, responseObject.labels);
      await postComment(issueNum, assignees, statusInactive1);
    } else if (responseObject.result === true && responseObject.labels === statusInactive2) {   // 14-day outdated: add inactive label, remove others
      await removeLabels(issueNum, statusInactive1, statusUpdated);
      await addLabels(issueNum, responseObject.labels);
      await postComment(issueNum, assignees, statusInactive2);
    } else if (responseObject.result === false && responseObject.labels === statusUpdated) {   // Updated within 3 days: retain up-to-date label if there is one
      await removeLabels(issueNum, statusInactive1, statusInactive2);
    } else if (responseObject.result === false && responseObject.labels === '') {   // Updated between 3 and 7 days, or recently assigned, or fixed by a PR by assignee, remove all three update-related labels
      await removeLabels(issueNum, statusInactive1, statusInactive2, statusUpdated);
    }
  }
}



/**
 * Finds issue numbers for all open & assigned issues, excluding issues labeled `Draft`, `ER`, `Epic`,
 * or `Dependency`, and returning issue numbers only if their status === "In progess (actively working"
 *
 * @returns {Promise<Array>} issueNums     - an array of open, assigned, and statused issue numbers
 */
async function getIssueNumsFromRepo() {
  const labelsToExclude = [draft, er, epic, dependency];
  let issueNums = [];
  let pageNum = 1;
  let result = [];

  while (true) {
    // https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#list-repository-issues
    const issueData = await github.request('GET /repos/{owner}/{repo}/issues', {
      owner: context.repo.owner,
      repo: context.repo.repo,
      assignee: '*',
      per_page: 100,
      page: pageNum,
    });
    
    if (!issueData.data.length) {
      break;
    } else {
      result = result.concat(issueData.data);
      pageNum++;
    }
  }
  
  for (let { number, labels, pull_request } of result) {
    if (!number) continue;

    // Exclude any pull requests that were found
    if (pull_request != undefined) continue;
  
    // Exclude any issues that have excluded labels
    const issueLabels = labels.map((label) => label.name);
    if (issueLabels.some((item) => labelsToExclude.includes(item))) continue;

    // For remaining issues, check if status === "In progress (actively working)"
    const { statusName } = await queryIssueInfo(github, context, number);
    if (statusName === "In progress (actively working)") {
      issueNums.push(number);
    }
  }
  return issueNums;
}



/**
 * Assesses whether the timeline is outdated.
 * @param {Array} timeline      - a list of events in the timeline of an issue, retrieved from the issues API
 * @param {Number} issueNum     - the issue's number
 * @param {String} assignees    - a list of the issue's assignee's username
 * @returns true if timeline indicates the issue is outdated/inactive, false if not; also returns appropriate labels that should be retained or added to the issue
 */
function isTimelineOutdated(timeline, issueNum, assignees) { // assignees is an arrays of `login`'s
  let lastAssignedTimestamp = null;
  let lastCommentTimestamp = null;
  let commentsToBeMinimized = [];

  for (let i = timeline.length - 1; i >= 0; i--) {
    let eventObj = timeline[i];
    let eventType = eventObj.event;
    // isLinkedIssue checks if the 'body'(comment) of the event mentions fixes/resolves/closes this current issue
    let isOpenLinkedPullRequest = eventType === 'cross-referenced' && isLinkedIssue(eventObj, issueNum) && eventObj.source.issue.state === 'open';

    // if cross-referenced and fixed/resolved/closed by assignee and the pull
    // request is open, remove all update-related labels
    // Once a PR is opened, we remove labels because we focus on the PR not the issue.
    if (isOpenLinkedPullRequest && assignees.includes(eventObj.actor.login)) {
      console.log(`Issue #${issueNum}: Assignee fixes/resolves/closes issue with an open pull request, remove all update-related labels`);
      return { result: false, labels: '' };  // remove all three labels
    }

    // If the event is a linked PR and the PR is closed, it will continue through the
    // rest of the conditions to receive the appropriate label.
    else if(eventType === 'cross-referenced' && eventObj.source.issue.state === 'closed') {
      console.log(`Issue #${issueNum}: Linked pull request has been closed.`);
    }

    let eventTimestamp = eventObj.updated_at || eventObj.created_at;

    // update the lastCommentTimestamp if this is the last (most recent) comment by an assignee
    if (!lastCommentTimestamp && eventType === 'commented' && isCommentByAssignees(eventObj, assignees)) {
      lastCommentTimestamp = eventTimestamp;
    }

    // update the lastAssignedTimestamp if this is the last (most recent) time an assignee was assigned to the issue
    else if (!lastAssignedTimestamp && eventType === 'assigned' && assignees.includes(eventObj.assignee.login)) {
      lastAssignedTimestamp = eventTimestamp;
    }

    // If this event is more than 7 days old AND this event is a comment by the GitHub Actions Bot, then hide the comment as outdated.
    if (!isMomentRecent(eventObj.created_at, sevenDayCutoffTime) && eventType === 'commented' && isCommentByBot(eventObj)) { 
      console.log(`Comment ${eventObj.node_id} is outdated (i.e. > 7 days old) and will be minimized.`);
      commentsToBeMinimized.push(eventObj.node_id); // retain node id so its associated comment can be minimized later
    }
  }

  minimizeComments(commentsToBeMinimized);

  if (lastCommentTimestamp && isMomentRecent(lastCommentTimestamp, threeDayCutoffTime)) { // if commented by assignee within 3 days
    console.log(`Issue #${issueNum}: Commented by assignee within 3 days, retain '${statusUpdated}' label`);
    return { result: false, labels: statusUpdated } // retain (don't add) updated label, remove the other two
  }

  if (lastAssignedTimestamp && isMomentRecent(lastAssignedTimestamp, threeDayCutoffTime)) { // if an assignee was assigned within 3 days
    console.log(`Issue #${issueNum}: Assigned to assignee within 3 days, no update-related labels should be used`);
    return { result: false, labels: '' } // remove all three labels
  }

  if ((lastCommentTimestamp && isMomentRecent(lastCommentTimestamp, sevenDayCutoffTime)) || (lastAssignedTimestamp && isMomentRecent(lastAssignedTimestamp, sevenDayCutoffTime))) { // if updated within 7 days
    if ((lastCommentTimestamp && isMomentRecent(lastCommentTimestamp, sevenDayCutoffTime))) {
      console.log(`Issue #${issueNum}: Commented by assignee between 3 and 7 days, no update-related labels should be used; timestamp: ${lastCommentTimestamp}`)
    } else if (lastAssignedTimestamp && isMomentRecent(lastAssignedTimestamp, sevenDayCutoffTime)) {
      console.log(`Issue #${issueNum}: Assigned between 3 and 7 days, no update-related labels should be used; timestamp: ${lastAssignedTimestamp}`)
    }
    return { result: false, labels: '' } // remove all three labels
  }

  if ((lastCommentTimestamp && isMomentRecent(lastCommentTimestamp, fourteenDayCutoffTime)) || (lastAssignedTimestamp && isMomentRecent(lastAssignedTimestamp, fourteenDayCutoffTime))) { // if last comment was between 7-14 days, or no comment but an assginee was assigned during this period, issue is outdated and add needs update label
    if ((lastCommentTimestamp && isMomentRecent(lastCommentTimestamp, fourteenDayCutoffTime))) {
      console.log(`Issue #${issueNum}: Commented by assignee between 7 and 14 days, use '${statusInactive1}' label; timestamp: ${lastCommentTimestamp}`)
    } else if (lastAssignedTimestamp && isMomentRecent(lastAssignedTimestamp, fourteenDayCutoffTime)) {
      console.log(`Issue #${issueNum}: Assigned between 7 and 14 days, use '${statusInactive1}' label; timestamp: ${lastAssignedTimestamp}`)
    }
    return { result: true, labels: statusInactive1 } // outdated, add needs update label
  }

  // If no comment or assigning found within 14 days, issue is outdated and add inactive label
  console.log(`Issue #${issueNum}: No update within 14 days, use '${statusInactive2}' label`)
  return { result: true, labels: statusInactive2 }
}



/**
 * Removes labels from a specified issue
 * @param {Number} issueNum    - an issue's number
 * @param {Array} labels       - an array containing the labels to remove (captures the rest of the parameters)
 */
async function removeLabels(issueNum, ...labels) {
  for (let label of labels) {
    try {
      // https://docs.github.com/en/rest/issues/labels?apiVersion=2022-11-28#remove-a-label-from-an-issue
      await github.request('DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}', {
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNum,
        name: label,
      });
      console.log(` '${label}' label has been removed`);
    } catch (err) {
      if (err.status === 404) {
        console.log(` '${label}' label not found, no need to remove`);
      } else {
        console.error(`Function failed to remove labels. Please refer to the error below: \n `, err);
      }
    }
  }
}



/**
 * Adds labels to a specified issue
 * @param {Number} issueNum   -an issue's number
 * @param {Array} labels      -an array containing the labels to add (captures the rest of the parameters)
 */
async function addLabels(issueNum, ...labels) {
  try {
    // https://octokit.github.io/rest.js/v20#issues-add-labels
    await github.rest.issues.addLabels({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNum,
      labels: labels,
    });
    console.log(` '${labels}' label has been added`);
    // If an error is found, the rest of the script does not stop.
  } catch (err) {
    console.error(`Function failed to add labels. Please refer to the error below: \n `, err);
  }
}



async function postComment(issueNum, assignees, labelString) {
  try {
    const assigneeString = createAssigneeString(assignees);
    const instructions = formatComment(assigneeString, labelString);
    // https://octokit.github.io/rest.js/v20/#issues-create-comment
    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNum,
      body: instructions,
    });
  } catch (err) {
    console.error(`Function failed to post comments. Please refer to the error below: \n `, err);
  }
}



/***********************
*** HELPER FUNCTIONS ***
***********************/
function isMomentRecent(dateString, cutoffTime) {
  const dateStringObj = new Date(dateString);
  if (dateStringObj >= cutoffTime) {
    return true;
  } else {
    return false;
  }
}

function isLinkedIssue(data, issueNum) {
  return findLinkedIssue(data.source.issue.body) == issueNum
}

function isCommentByAssignees(data, assignees) {
  return assignees.includes(data.actor.login);
}

async function getAssignees(issueNum) {
  try {
    const results = await github.rest.issues.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNum,
    });
    const assigneesData = results.data.assignees;
    const assigneesLogins = filterForAssigneesLogins(assigneesData);
    return assigneesLogins;
  } catch (err) {
    console.error(`Function failed to get assignees. Please refer to the error below: \n `, err);
    return null;
  }
}

function filterForAssigneesLogins(data) {
  const logins = [];
  for (let item of data) {
    logins.push(item.login);
  }
  return logins;
}

function createAssigneeString(assignees) {
  const assigneeString = [];
  for (let assignee of assignees) {
    assigneeString.push(`@${assignee}`);
  }
  return assigneeString.join(', ');
}

function formatComment(assignees, labelString) {
  const path = './github-actions/trigger-schedule/add-update-label-weekly/update-instructions-template.md';
  const text = fs.readFileSync(path).toString('utf-8');
  const options = {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Los_Angeles',
  };
  const cutoffTimeString = threeDayCutoffTime.toLocaleString('en-US', options);
  let completedInstuctions = text.replace('${assignees}', assignees).replace('${cutoffTime}', cutoffTimeString).replace('${label}', labelString);
  return completedInstuctions;
}

function isCommentByBot(data) {
  let botLogin = "github-actions[bot]";
  let hflaBotLogin = "HackforLABot";
  return data.actor.login === botLogin || data.actor.login === hflaBotLogin;
}

// asynchronously minimize all the comments that are outdated (> 1 week old)
async function minimizeComments(comment_node_ids) {
  for (const node_id of comment_node_ids) {
    await new Promise((resolve) => { setTimeout(resolve, 1000); }); // wait for 1000ms before doing the GraphQL mutation
    await minimizeIssueComment(github, node_id);
  }
}

module.exports = main;
