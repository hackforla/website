// Import modules
const findLinkedIssue = require('../utils/findLinkedIssue');
var fs = require("fs");

// Global variables
var github;
var context;
const statusUpdatedLabel = 'Status: Updated';
const toUpdateLabel = 'Test: Update Label';
const updatedByDays = 3; // number of days ago to check for updates
const cutoffTime = new Date()
cutoffTime.setDate(cutoffTime.getDate() - updatedByDays)

/**
 * The main function, which retrieves issues from a specific column in a specific project, before examining the timeline of each issue for outdatedness. If outdated, the old status label is removed, and an updated is requested.
 * @param {Object} g github object from actions/github-script 
 * @param {Object} c context object from actions/github-script 
 * @param {Number} columnId a number presenting a specific column to examine, supplied by GitHub secrets
 */
async function main({ g, c, columnId }) {
  github = g;
  context = c;

  // Retrieve all issue numbers from a column
  const issueNums = getIssueNumsFromColumn(columnId);

  for await (issueNum of issueNums) {
    const timeline = getTimeline(issueNum);
    const assignee = await getAssignee(issueNum);

    // Error catching.
    if (!assignee) {
      console.log(`Assignee not found, skipping issue #${issueNum}`)
      continue
    }

    // Adds label if the issue's timeline indicates the issue is outdated.
    if (await isTimelineOutdated(timeline, issueNum, assignee)) {
      console.log(`Going to ask for an update now for issue #${issueNum}`);
      await removeLabels(issueNum, statusUpdatedLabel, toUpdateLabel);
      await addLabels(issueNum, toUpdateLabel);
      // FOR TRIAL STAGE. SEE #2006
      await postComment(issueNum);
    } else {
      console.log(`No updates needed for issue #${issueNum}`);
      await removeLabels(issueNum, toUpdateLabel);
      await addLabels(issueNum, statusUpdatedLabel);
    }
  }
}

/**
 * Generator that returns issue numbers.
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
        for (card of results.data) {
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
 * Generator that returns a timeline.
 * @param {Number} issueNum the issue's number 
 * @returns an Array of Objects containing the issue's timeline of events
 */
async function* getTimeline(issueNum) {
  let page = 1
  while (page < 100) {
    try {
      const results = await github.issues.listEventsForTimeline({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNum,
        per_page: 100,
        page: page,
      });

      if (results.data.length) {
        yield* results.data
      } else {
        return
      }
    } catch {
      continue
    }
    finally {
      page++
    }
  }
}

/**
 * Assesses whether the timeline is outdated.
 * @param {Array} timeline a list of events of an issue, retrieved from the issues API
 * @param {Number} issueNum the issue's number
 * @param {String} assignee the issue's assignee's username
 * @returns true if timeline indicates the issue is outdated, false if not
 * Note: Outdated means that the assignee did not make a linked PR or comment within the last updateLimit (see global variables) days.
 */
async function isTimelineOutdated(timeline, issueNum, assignee) {
  for await (moment of timeline) {
    if (isMomentRecent(moment.created_at)) {
      if (moment.event == 'cross-referenced' && isLinkedIssue(moment, issueNum)) {
        return false
      } else if (moment.event == 'commented' && isCommentByAssignee(moment, assignee)) {
        return false
      }
    }
  }
  return true
}

/**
 * Removes labels from a specified issue
 * @param {Number} issueNum an issue's number
 * @param {Array} labels an array containing the labels to remove
 */
async function removeLabels(issueNum, ...labels) {
  for (label of labels) {
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
      console.error(`No "${label}" label to remove for issue #${issueNum}`);
    }
  }
}

/**
 * Adds labels to a specified issue
 * @param {Number} issueNum an issue's number
 * @param {Array} labels an array containing the labels to add
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
  } catch {
    console.error(`Could not add these labels for issue #${issueNum}: ${labels}`);
  }
}

/*************************************
*** PART OF TRIAL STAGE: MAIN CODE ***
*************************************/

async function postComment(issueNum) {
  try {
    const assignees = await createAssigneeString(issueNum);
    const instructions = formatComment(assignees);

    await github.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNum,
      body: instructions,
    });
  } catch (err) {
    console.error(`Could not post a comment for issue #${issueNum}`);
  }
}

/***********************
*** HELPER FUNCTIONS ***
***********************/

function isMomentRecent(dateString) {
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

function isCommentByAssignee(data, assignee) {
  return data.actor.login == assignee
}

async function getAssignee(issueNum) {
  try {
    const results = await github.issues.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNum,
    });
    return results.data.assignee.login
  } catch (err) {
    console.error(`Failed request to get assignee from issue: #${issueNum}`)
    return false
  }
}

/***********************************
*** PART OF TRIAL STAGE: HELPERS ***
***********************************/

async function createAssigneeString(issueNum) {
  try {
    const results = await github.rest.issues.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNum,
    });
    const assignees = []
    for (assignee of results.data.assignees) {
      assignees.push(`@${assignee.login}`);
    }
    return assignees.join(', ')
  } catch {
    console.error(`Could not find assignees for issue #${issueNum}`);
  }
}

function formatComment(assignees) {
  const path = './github-actions/add-update-label-weekly/update-instructions-template.md'
  const text = fs.readFileSync(path).toString('utf-8');
  const cutoffTimeString = cutoffTime.toLocaleString();
  let completedInstuctions = text.replace('${assignees}', assignees).replace('${cutoffTime}', cutoffTimeString);
  return completedInstuctions
}

module.exports = main