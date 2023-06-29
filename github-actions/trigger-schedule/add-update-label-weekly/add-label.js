// Import modules
const findLinkedIssue = require('../../utils/find-linked-issue');
var fs = require("fs");
// Global variables
var github;
var context;
const statusUpdatedLabel = 'Status: Updated';
const toUpdateLabel = 'To Update !';
const inactiveLabel = '2 weeks inactive';
const updatedByDays = 3; // If there is an update within 3 days, the issue is considered updated
const inactiveUpdatedByDays = 14; // If no update within 14 days, the issue is considered '2 weeks inactive'
const commentByDays = 7; // If there is an update within 14 days but no update within 7 days, the issue is considered outdated and the assignee needs 'To Update !' it
const threeDayCutoffTime = new Date()
threeDayCutoffTime.setDate(threeDayCutoffTime.getDate() - updatedByDays)
const sevenDayCutoffTime = new Date()
sevenDayCutoffTime.setDate(sevenDayCutoffTime.getDate() - commentByDays)
const fourteenDayCutoffTime = new Date()
fourteenDayCutoffTime.setDate(fourteenDayCutoffTime.getDate() - inactiveUpdatedByDays)

/**
 * The main function, which retrieves issues from a specific column in a specific project, before examining the timeline of each issue for outdatedness.
 * An update to an issue is either 1. a comment by the assignee, or 2. assigning an assignee to the issue. If the last update is not within 7 days or 14 days, apply the according outdate label, and request an update.
 * However, if the assignee has submitted a PR that fixed the issue regardless of when, all update-related labels should be removed.

 * @param {Object} g github object from actions/github-script
 * @param {Object} c context object from actions/github-script
 * @param {Number} columnId a number presenting a specific column to examine, supplied by GitHub secrets
 */
async function main({ g, c }, columnId) {
  github = g;
  context = c;
  // Retrieve all issue numbers from a column
  const issueNums = getIssueNumsFromColumn(columnId);
  for await (let issueNum of issueNums) {
    const timeline = await getTimeline(issueNum);
    const timelineArray = Array.from(timeline);
    const assignees = await getAssignees(issueNum);
    // Error catching.
    if (assignees.length === 0) {
      console.log(`Assignee not found, skipping issue #${issueNum}`)
      continue
    }

    // Add and remove labels as well as post comment if the issue's timeline indicates the issue is inactive, to be updated or up to date accordingly
    const responseObject = await isTimelineOutdated(timeline, issueNum, assignees)


    if (responseObject.result === true && responseObject.labels === toUpdateLabel) { // 7-day outdated, add 'To Update !' label
      console.log(`Going to ask for an update now for issue #${issueNum}`);
      await removeLabels(issueNum, statusUpdatedLabel, inactiveLabel);
      await addLabels(issueNum, responseObject.labels);
      await postComment(issueNum, assignees, toUpdateLabel);
    } else if (responseObject.result === true && responseObject.labels === inactiveLabel) { // 14-day outdated, add '2 Weeks Inactive' label
      console.log(`Going to ask for an update now for issue #${issueNum}`);
      await removeLabels(issueNum, toUpdateLabel, statusUpdatedLabel);
      await addLabels(issueNum, responseObject.labels);
      await postComment(issueNum, assignees, inactiveLabel);
    } else if (responseObject.result === false && responseObject.labels === statusUpdatedLabel) { // Updated within 3 days, retain 'Status: Updated' label if there is one
      console.log(`Updated within 3 days, retain updated label for issue #${issueNum}`);
      await removeLabels(issueNum, toUpdateLabel, inactiveLabel);
    } else if (responseObject.result === false && responseObject.labels === '') { // Updated between 3 and 7 days, or recently assigned, or fixed by a PR by assignee, remove all three update-related labels
      console.log(`No updates needed for issue #${issueNum}, will remove all labels`);
      await removeLabels(issueNum, toUpdateLabel, inactiveLabel, statusUpdatedLabel);
    }
  }
}

/**
 * Generator that returns issue numbers from cards in a column.
 * @param {Number} columnId the id of the column in GitHub's database
 * @returns an Array of issue numbers
 */
async function* getIssueNumsFromColumn(columnId) {
  let page = 1;
  while (page < 100) {
    try {
      const results = await github.projects.listCards({
        column_id: columnId,
        per_page: 100,
        page: page
      });
      if (results.data.length) {
        for (let card of results.data) {
          if (card.hasOwnProperty('content_url')) {
            const arr = card.content_url.split('/');
            yield arr.pop()
          }
        }
      } else {
        return
      }
    } catch {
      continue
    } finally {
      page++;
    }
  }
}
/**
 * Function that returns the timeline of an issue.
 * @param {Number} issueNum the issue's number
 * @returns an Array of Objects containing the issue's timeline of events
 */

async function getTimeline(issueNum) {
  let arra = []
  let page = 1
  while (true) {
    try {
      const results = await github.issues.listEventsForTimeline({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNum,
        per_page: 100,
        page: page,
      });
      if (results.data.length) {
        arra = arra.concat(results.data);
      } else {
        break
      }
    } catch (err) {
      console.log(error);
      continue
    }
    finally {
      page++
    }
  }
  return arra
}

/**
 * Assesses whether the timeline is outdated.
 * @param {Array} timeline a list of events in the timeline of an issue, retrieved from the issues API
 * @param {Number} issueNum the issue's number
 * @param {String} assignees a list of the issue's assignee's username
 * @returns true if timeline indicates the issue is outdated/inactive, false if not; also returns appropriate labels that should be retained or added to the issue
 */

function isTimelineOutdated(timeline, issueNum, assignees) { // assignees is an arrays of `login`'s
  let lastAssignedTimestamp = null;
  let lastCommentTimestamp = null;

  for (let i = timeline.length - 1; i >= 0; i--) {
    let eventObj = timeline[i];
    let eventType = eventObj.event;

    // if cross-referenced and fixed/resolved/closed by assignee, remove all update-related labels, remove all three labels
    if (eventType === 'cross-referenced' && isLinkedIssue(eventObj, issueNum) && assignees.includes(eventObj.actor.login)) { // isLinkedIssue checks if the 'body'(comment) of the event mentioned closing/fixing/resolving this current issue
      console.log(`Issue #${issueNum} fixed/resolved/closed by assignee, remove all update-related labels`);
      return { result: false, labels: '' } // remove all three labels
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
  }

  if (lastCommentTimestamp && isMomentRecent(lastCommentTimestamp, threeDayCutoffTime)) { // if commented by assignee within 3 days
    console.log(`Issue #${issueNum} commented by assignee within 3 days, retain 'Status: Updated' label`);
    return { result: false, labels: statusUpdatedLabel } // retain (don't add) updated label, remove the other two
  }

  if (lastAssignedTimestamp && isMomentRecent(lastAssignedTimestamp, threeDayCutoffTime)) { // if an assignee was assigned within 3 days
    console.log(`Issue #${issueNum} assigned to assignee within 3 days, no update-related labels should be used`);
    return { result: false, labels: '' } // remove all three labels
  }

  if ((lastCommentTimestamp && isMomentRecent(lastCommentTimestamp, sevenDayCutoffTime)) || (lastAssignedTimestamp && isMomentRecent(lastAssignedTimestamp, sevenDayCutoffTime))) { // if updated within 7 days
    if ((lastCommentTimestamp && isMomentRecent(lastCommentTimestamp, sevenDayCutoffTime))) {
      console.log(`Issue #${issueNum} commented by assignee between 3 and 7 days, no update-related labels should be used; timestamp: ${lastCommentTimestamp}`)
    } else if (lastAssignedTimestamp && isMomentRecent(lastAssignedTimestamp, sevenDayCutoffTime)) {
      console.log(`Issue #${issueNum} assigned between 3 and 7 days, no update-related labels should be used; timestamp: ${lastAssignedTimestamp}`)
    }
    return { result: false, labels: '' } // remove all three labels
  }

  if ((lastCommentTimestamp && isMomentRecent(lastCommentTimestamp, fourteenDayCutoffTime)) || (lastAssignedTimestamp && isMomentRecent(lastAssignedTimestamp, fourteenDayCutoffTime))) { // if last comment was between 7-14 days, or no comment but an assginee was assigned during this period, issue is outdated and add 'To Update !' label
    if ((lastCommentTimestamp && isMomentRecent(lastCommentTimestamp, fourteenDayCutoffTime))) {
      console.log(`Issue #${issueNum} commented by assignee between 7 and 14 days, use 'To Update !' label; timestamp: ${lastCommentTimestamp}`)
    } else if (lastAssignedTimestamp && isMomentRecent(lastAssignedTimestamp, fourteenDayCutoffTime)) {
      console.log(`Issue #${issueNum} assigned between 7 and 14 days, use 'To Update !' label; timestamp: ${lastAssignedTimestamp}`)
    }
    return { result: true, labels: toUpdateLabel } // outdated, add 'To Update!' label
  }

  // if no comment or assigning found within 14 days, issue is outdated and add '2 weeks inactive' label
  console.log(`Issue #${issueNum} has no update within 14 days, use '2 weeks inactive' label`)
  return { result: true, labels: inactiveLabel }
}

/**
 * Removes labels from a specified issue
 * @param {Number} issueNum an issue's number
 * @param {Array} labels an array containing the labels to remove (captures the rest of the parameters)
 */
async function removeLabels(issueNum, ...labels) {
  for (let label of labels) {
    try {
      // https://octokit.github.io/rest.js/v18#issues-remove-label
      await github.issues.removeLabel({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNum,
        name: label,
      });
      console.log(`Removed "${label}" from issue #${issueNum}`);
    } catch (err) {
      console.error(`Function failed to remove labels. Please refer to the error below: \n `, err);
    }
  }
}
/**
 * Adds labels to a specified issue
 * @param {Number} issueNum an issue's number
 * @param {Array} labels an array containing the labels to add (captures the rest of the parameters)
 */
async function addLabels(issueNum, ...labels) {
  try {
    // https://octokit.github.io/rest.js/v18#issues-add-labels
    await github.issues.addLabels({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNum,
      labels: labels,
    });
    console.log(`Added these labels to issue #${issueNum}: ${labels}`);
    // If an error is found, the rest of the script does not stop.
  } catch (err) {
    console.error(`Function failed to add labels. Please refer to the error below: \n `, err);
  }
}
async function postComment(issueNum, assignees, labelString) {
  try {
    const assigneeString = createAssigneeString(assignees);
    const instructions = formatComment(assigneeString, labelString);
    await github.issues.createComment({
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
    return true
  } else {
    return false
  }
}


function isLinkedIssue(data, issueNum) {
  return findLinkedIssue(data.source.issue.body) == issueNum
}
function isCommentByAssignees(data, assignees) {
  return assignees.includes(data.actor.login)
}
async function getAssignees(issueNum) {
  try {
    const results = await github.issues.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNum,
    });
    const assigneesData = results.data.assignees;
    assigneesLogins = filterForAssigneesLogins(assigneesData);
    return assigneesLogins
  } catch (err) {
    console.error(`Function failed to get assignees. Please refer to the error below: \n `, err);
    return null
  }
}
function filterForAssigneesLogins(data) {
  logins = [];
  for (let item of data) {
    logins.push(item.login);
  }
  return logins
}
function createAssigneeString(assignees) {
  const assigneeString = [];
  for (let assignee of assignees) {
    assigneeString.push(`@${assignee}`);
  }
  return assigneeString.join(', ')
}
function formatComment(assignees, labelString) {
  const path = './github-actions/trigger-schedule/add-update-label-weekly/update-instructions-template.md'
  const text = fs.readFileSync(path).toString('utf-8');
  const options = {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Los_Angeles',
  }
  const cutoffTimeString = threeDayCutoffTime.toLocaleString('en-US', options);
  let completedInstuctions = text.replace('${assignees}', assignees).replace('${cutoffTime}', cutoffTimeString).replace('${label}', labelString);
  return completedInstuctions
}

module.exports = main
