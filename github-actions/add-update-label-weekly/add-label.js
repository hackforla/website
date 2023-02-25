// Import modules
const findLinkedIssue = require('../utils/find-linked-issue');
var fs = require("fs");
// Global variables
var github;
var context;
const statusUpdatedLabel = 'Status: Updated';
const toUpdateLabel = 'To Update !';
const inactiveLabel = '2 weeks inactive';
const updatedByDays = 3; // number of days ago to check for to update label
const inactiveUpdatedByDays = 14; // number of days ago to check for inactive label
const commentByDays = 7; // number of days ago to check for comment by assignee
const threeDayCutoffTime = new Date()
threeDayCutoffTime.setDate(threeDayCutoffTime.getDate() - updatedByDays)
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
		if (responseObject.result === true && responseObject.labels === toUpdateLabel) {
			console.log(`Going to ask for an update now for issue #${issueNum}`);
			await removeLabels(issueNum, statusUpdatedLabel, inactiveLabel);  
			await addLabels(issueNum, responseObject.labels); 
			await postComment(issueNum, assignees, toUpdateLabel);
		} else if (responseObject.result === true && responseObject.labels === statusUpdatedLabel) {
			await removeLabels(issueNum, toUpdateLabel, inactiveLabel);
			await addLabels(issueNum, responseObject.labels);
		} else if (responseObject.result === true && responseObject.labels === inactiveLabel) {
			console.log(`Going to ask for an update now for issue #${issueNum}`);
			await removeLabels(issueNum, toUpdateLabel, statusUpdatedLabel);
			await addLabels(issueNum, responseObject.labels);
			await postComment(issueNum, assignees, inactiveLabel);
		} else {
			console.log(`No updates needed for issue #${issueNum}`);
			await removeLabels(issueNum, toUpdateLabel, inactiveLabel);
			await addLabels(issueNum, responseObject.labels);
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
 * Note: Outdated means that the assignee did not make a linked PR or comment within the threedaycutoffTime (see global variables), while inactive is for 14 days
 */

async function isTimelineOutdated(timeline, issueNum, assignees) {
	for await (let [index, moment] of timeline.entries()) {
		if (isMomentRecent(moment.created_at, threeDayCutoffTime)) { // all the events of an issue within last three days will return true
			if (moment.event == 'cross-referenced' && isLinkedIssue(moment, issueNum)) { // checks if cross referenced within last three days 
				return {result: false, labels: statusUpdatedLabel}
			}
			else if (moment.event == 'commented' && isCommentByAssignees(moment, assignees)) { // checks if commented within last three days 
				return {result: false, labels: statusUpdatedLabel}
			}
			else if (index === timeline.length-1 && (Date.parse(timeline[0].created_at) < fourteenDayCutoffTime.valueOf())) { // returns true if issue was created before 14 days after comparing the two dates in millisecond format  
				return {result: true, labels: inactiveLabel}
			}
			else if (index === timeline.length-1 && (Date.parse(timeline[0].created_at) < threeDayCutoffTime.valueOf())) { // returns true if issue was created before 3 days
				return {result: true, labels: toUpdateLabel}
			}
			else if (index === timeline.length-1) { // returns true if above two else ifs are false meaning issue was created within last 3 days
				return {result: true, labels: statusUpdatedLabel}
			}
		}
		else if (isMomentRecent(moment.created_at, sevenDayCutoffTime)) { // all the events of an issue between three and seven days will return true
			if (moment.event == 'cross-referenced' && isLinkedIssue(moment, issueNum)) { // checks if cross referenced between 3 and 7 days
				console.log('between 3 and 7 cross referenced');
				return {result: false, labels: statusUpdatedLabel}
			}
			else if (moment.event == 'commented' && isCommentByAssignees(moment, assignees)) { // checks if commented between 3 and 7 days
				console.log('between 3 and 7 commented');
				return {result: false, labels: statusUpdatedLabel}
			}
			else if (index === timeline.length-1 && (Date.parse(timeline[0].created_at) < fourteenDayCutoffTime.valueOf())) { // returns true if issue was created before 14 days after comparing the two dates in millisecond format  
				return {result: true, labels: inactiveLabel}
			}
			else if (index === timeline.length-1) { // returns true if the latest event created is between 3 and 7 days  
				return {result: true, labels: toUpdateLabel}
			}
		}
		else if (isMomentRecent(moment.created_at, fourteenDayCutoffTime)) { // all the events of an issue between seven and fourteen days will return true
			if (moment.event == 'cross-referenced' && isLinkedIssue(moment, issueNum)) { // checks if cross referenced between 7 and 14 days
				console.log('between 7 and 14 cross referenced');
				return {result: false, labels: statusUpdatedLabel}
			}
			else if (index === timeline.length-1 && (Date.parse(timeline[0].created_at) < fourteenDayCutoffTime.valueOf())) { // returns true if issue was created before 14 days after comparing the two dates in millisecond format  
				return {result: true, labels: inactiveLabel}
			}
			else if (index === timeline.length-1) { // returns true if the latest event created is between 7 and 14 days  
				return {result: true, labels: toUpdateLabel}
			}
		}
		else    { // all the events of an issue older than fourteen days will be processed here
			if (moment.event == 'cross-referenced' && isLinkedIssue(moment, issueNum)) { // checks if cross referenced older than fourteen days
				console.log('14 day event cross referenced');
				return {result: false, labels: statusUpdatedLabel}
			}
			else if (index === timeline.length-1) { // returns true if the latest event created is older than 14 days  
				return {result: true, labels: inactiveLabel}
			}
		}
	}
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
  const path = './github-actions/add-update-label-weekly/update-instructions-template.md'
  const text = fs.readFileSync(path).toString('utf-8');
  const options = {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'short',
  }
  const cutoffTimeString = threeDayCutoffTime.toLocaleString('en-US', options);
  let completedInstuctions = text.replace('${assignees}', assignees).replace('${cutoffTime}', cutoffTimeString).replace('${label}', labelString);
  return completedInstuctions
}
		
module.exports = main