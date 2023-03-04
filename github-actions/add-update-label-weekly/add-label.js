// Import modules
const findLinkedIssue = require('../utils/find-linked-issue');
var fs = require("fs");
// Global variables
var github;
var context;
const statusUpdatedLabel = 'Status: Updated'; // If an issue has been cross-referenced or commented on by the assignee within the past 7 days, it's considered updated and should have the 'Status: Updated' label
const toUpdateLabel = 'To Update !'; // If the last time an issue was cross-referenced or commented on by the assignee was 7 days ago, but within the past 14 days, add the 'To Update !' label; if the issue has never been commented on by the assignee, check the date when the contributor was (self-)assigned, and add this label if they were assigned 7 days ago
const inactiveLabel = '2 weeks inactive'; // If the last time an issue was cross-referenced or commented on by the assignee was 14 days ago, add the '2 weeks inactive' label; if the issue has never been commented on by the assignee, check the date when the contributor was (self-)assigned, and add this label if they were assigned 14 days ago


/* 
Note: The team discussed and decided to use only the sevenDayCutoffTime to check for updated/outdated, so I'm commenting out the 3-day variables  
*/
// const updatedByDays = 3; // number of days ago to check for to update label
const inactiveUpdatedByDays = 14; // number of days ago to check for inactive label
const commentByDays = 7; // number of days ago to check for comment by assignee
// const threeDayCutoffTime = new Date()
// threeDayCutoffTime.setDate(threeDayCutoffTime.getDate() - updatedByDays)
const sevenDayCutoffTime = new Date()
sevenDayCutoffTime.setDate(sevenDayCutoffTime.getDate() - commentByDays)
const fourteenDayCutoffTime = new Date()
fourteenDayCutoffTime.setDate(fourteenDayCutoffTime.getDate() - inactiveUpdatedByDays)

/**
 * The main function, which retrieves issues from a specific column in a specific project, before examining the timeline of each issue for outdatedness. If outdated, the old status label is removed, and an updated is requested. Otherwise, the issue is labeled as updated.
 * @param {Object} g github object from actions/github-script 
 * @param {Object} c context object from actions/github-script 
 * @param {Number} columnId a number presenting a specific column to examine, supplied by GitHub secrets
 */

// when called, this function loops through all issues in the `In Progress` column of the Project Board
async function main({ g, c }, columnId) {
	github = g;
	context = c;
	// Retrieve all issue numbers from a column
	const issueNums = getIssueNumsFromColumn(columnId);
	for await (let issueNum of issueNums) {
		const assignees = await getAssignees(issueNum);
		// Error catching.
		if (assignees.length === 0) {
		  console.log(`Assignee not found, skipping issue #${issueNum}`)
		  continue
		}
    // get events timeline of the issue
    const timeline = await getTimeline(issueNum);
		
		// Add and remove labels as well as post comment if the issue's timeline indicates the issue is inactive, to be updated or up to date accordingly 
    // responseObject has two properties: {result: true/false, labels: [string]}
		const responseObject = isTimelineOutdated(timeline, issueNum, assignees)

		if (responseObject.result === true && responseObject.labels === toUpdateLabel) { // Outdated, add toUpdateLabel
			console.log(`Going to ask for an update now for issue #${issueNum}`);
			await removeLabels(issueNum, statusUpdatedLabel, inactiveLabel);  
			await addLabels(issueNum, responseObject.labels); 
			await postComment(issueNum, assignees, toUpdateLabel);
		} else if (responseObject.result === false && responseObject.labels === statusUpdatedLabel) { // Not outdated, add statusUpdatedLabel
			await removeLabels(issueNum, toUpdateLabel, inactiveLabel);
			await addLabels(issueNum, responseObject.labels);
		} else if (responseObject.result === true && responseObject.labels === inactiveLabel) { // Outdated, add inactiveLabel
			console.log(`Going to ask for an update now for issue #${issueNum}`);
			await removeLabels(issueNum, toUpdateLabel, statusUpdatedLabel);
			await addLabels(issueNum, responseObject.labels);
			await postComment(issueNum, assignees, inactiveLabel);
		} else if (responseObject.result === false && responseObject.labels === '') { // Not outdated, but not updated either, remove all update-related labels
			console.log(`No updates needed for issue #${issueNum}`);
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
 * @returns true if timeline indicates the issue is outdated and inactive, false if not; also returns appropriate labels
 * Note: Outdated means that the assignee did not make a linked PR or comment within the sevendaycutoffTime (see global variables), while inactive is for 14 days
 */

// assignees is an arrays of `login`'s
function isTimelineOutdated(timeline, issueNum, assignees) {
  // track the most recent event that assigned one of the assignees
  let lastAssignedTimestamp = null;
  let lastCommentOutdated = false;
  
  // loop through the timeline array from the end--checking the most recent events first and look for a comment by an assignee or a cross-reference
  for (let i = timeline.length - 1; i >= 0; i--) {
    const issueEvent = timeline[i];
    // each event object has a property of 'event' that has the value of the event type
    const issueEventType = issueEvent.event;

    if (issueEventType === 'cross-referenced' || (issueEventType === 'commented' && isCommentByAssignees(issueEvent, assignees))) {
      // if such event is found, check how recent it is
      // each event object has a 'created_at' property and an 'updated_at' property, set the timestamp to the most recent one
      const eventTimestamp = issueEvent.updated_at ? issueEvent.updated_at : issueEvent.created_at;
      // when a recent comment or cross-reference is found, immediately return 
      if (isMomentRecent(eventTimestamp, sevenDayCutoffTime)) {
        return {result: false, labels: statusUpdatedLabel}
      }
      // when a relatively recent comment or cross-reference is found, immediately return
      else if (isMomentRecent(eventTimestamp, fourteenDayCutoffTime)) {
        return {result: true, labels: toUpdateLabel}
      }
      // when a comment or cross-reference is found and it's outdated, set lastCommentOutdated to true, and continue the loop
      else {
        lastCommentOutdated = true;
      }
    }

    // store the most recent time when an assignee got assigned
    if (lastAssignedTimestamp === null && (issueEventType === 'assigned' && assignees.includes(issueEvent.assignee.login))) {
      lastAssignedTimestamp = issueEvent.updated_at ? issueEvent.updated_at : issueEvent.created_at;
    }
  }

  // the code below gets executed if the loop above exits without returning, which means no 'cross-referenced' or 'commented' by an assignee was found within 14 days, so first check when issue was most recently assigned to one of the assignees
  // if lastAssignedTimestamp !== null, check the time when assignee was assigned against the cutoff times
  if (lastAssignedTimestamp) {
    // if assigned within 7 days, no label is needed 
    if (isMomentRecent(lastAssignedTimestamp, sevenDayCutoffTime)) {
      return {result: false, labels: ''}
    }
    // if assigned within 14 days yet no recent comment, add `To Update !` label
    else if (isMomentRecent(lastAssignedTimestamp, fourteenDayCutoffTime)) {
      return {result: true, labels: toUpdateLabel}
    }
  }
  
  // the code below gets executed if the previous conditions are not met, it's because lastAssignedTimestamp was 14 days ago, and no comment or cross-reference was found within 14 days
  return {result: true, labels: inactiveLabel}
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
  } catch (err){
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

/*
I can't reason the function below, and couldn't find documentation on the event.source.issue.body property being an issue number. (Bitian Zhang 3/3/23)
*/
// function isLinkedIssue(data, issueNum) {
//   return findLinkedIssue(data.source.issue.body) == issueNum
// }
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
  const path = './github-actions/add-update-label-weekly/update-instructions-template.md'
  const text = fs.readFileSync(path).toString('utf-8');
  const options = {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'short',
  }
  const cutoffTimeString = sevenDayCutoffTime.toLocaleString('en-US', options);
  let completedInstuctions = text.replace('${assignees}', assignees).replace('${cutoffTime}', cutoffTimeString).replace('${label}', labelString);
  return completedInstuctions
}
		
module.exports = main