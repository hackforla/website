// Import modules
const findLinkedIssue = require('../utils/findLinkedIssue');

// Global variables
var github;
var context;
const statusUpdatedLabel = 'Status: Updated';
const toUpdateLabel = 'To Update !';
const updatedByDays = 3; // number of days ago to check for updates

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

  for await (num of issueNums) {
    const timeline = getTimeline(num);
    const assignee = await getAssignee(num);

    // Error catching.
    if (!assignee) {
      console.log(`Assignee not found, skipping issue #${num}`)
      continue
    }

    // Adds label if the issue's timeline indicates the issue is outdated.
    if (await isTimelineOutdated(timeline, num, assignee)) {
      console.log(`Going to ask for an update now for issue #${num}`);
      await removeLabels(num, statusUpdatedLabel, toUpdateLabel);
      await addLabels(num, toUpdateLabel);
    } else {
      console.log(`No updates needed for issue #${num}`);
      await removeLabels(num, toUpdateLabel);
      await addLabels(num, statusUpdatedLabel);
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
    if (isMomentRecent(moment.created_at, updatedByDays)) {
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
      console.log(`Removed "${label}" from issue #${num}`);
    } catch (err) {
      console.error(`No "${label}" label to remove for issue #${num}`);
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
    console.log(`Added these labels to issue #${num}: ${labels}`);
    // If an error is found, the rest of the script does not stop.
  } catch {
    console.error(`Could not add these labels for issue #${num}: ${labels}`);
  }
}

/***********************
*** HELPER FUNCTIONS ***
***********************/

function isMomentRecent(dateString, limit) {
  const dateStringObj = new Date(dateString);
  const dateWeekBefore = new Date()
  dateWeekBefore.setDate(dateWeekBefore.getDate() - limit)

  if (dateStringObj >= dateWeekBefore) {
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

module.exports = main