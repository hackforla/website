// Import modules
const findLinkedIssue = require('../utils/findLinkedIssue');
const { paginatePage } = require('../utils/paginateAPI');

// Global variables
var github;
var context;
const removeLabels = 'Status: Updated' // label to remove
const addLabels = ['To Update !']; // labels to add
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
  const issueNums = await getIssueNumsFromColumn(columnId);

  for (num of issueNums) {
    const timeline = await getTimeline(num);
    const assignee = await getAssignee(num);

    // Error catching.
    if (!assignee) {
      console.log(`Assignee not found, skipping issue #${num}`)
      continue
    }

    // Adds label if the issue's timeline indicates the issue is outdated.
    if (isTimelineOutdated(timeline, num, assignee)) {
      addUpdateLabel(num)
      console.log(`Going to ask for an update now for issue #${num}`);
    } else {
      console.log(`No updates needed for issue #${num}`);
    }
  }
}

/**
 * Get all the issue numbers from a specific column.
 * @param {Number} columnId the id of the column in GitHub's database
 * @returns an Array of issue numbers
 */
async function getIssueNumsFromColumn(columnId) {
  const payload = {
    column_id: columnId,
    per_page: 100,
  }

  // Processes results of every page of an api call.
  function processor(results) {
    if (results.data.length) {
      let urls = [];
      for (card of results.data) {
        if (card.hasOwnProperty('content_url')) {
          // Isolates the issue number from the rest of the url
          const arr = card.content_url.split('/');
          // Pushes the last item in arr, which is the issue number
          urls.push(arr.pop());
        }
      }
      return urls;
    } else {
      return false;
    }
  }

  // Paginate through an api to retrieve all of its data.
  const results = await paginatePage({
    // https://octokit.github.io/rest.js/v18#projects-list-cards
    apicall: github.projects.listCards,
    payload: payload,
    processor: processor,
  })

  // Collects the results of every page into a single array.
  return collectPages(results);
}

/**
 * Returns the timeline for an issue.
 * @param {Number} issueNum the issue's number 
 * @returns an Array of Objects containing the issue's timeline of events
 */
async function getTimeline(issueNum) {
  const payload = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNum,
    per_page: 100,
  }

  function processor(results) {
    if (results.data.length) {
      return results.data;
    } else {
      return false;
    }
  }

  const timeline = await paginatePage({
    // https://octokit.github.io/rest.js/v18#issues-list-events-for-timeline
    apicall: github.issues.listEventsForTimeline,
    payload: payload,
    processor: processor,
    failure: err => {
      console.error(`Could not retrieve timeline for #${issueNum}`);
      return true;
    }
  })

  return collectPages(timeline);
}

/**
 * Assesses whether the timeline is outdated.
 * @param {Array} timeline a list of events of an issue, retrieved from the issues API
 * @param {Number} issueNum the issue's number
 * @param {String} assignee the issue's assignee's username
 * @returns true if timeline indicates the issue is outdated, false if not
 * Note: Outdated means that the assignee did not make a linked PR or comment within the last updateLimit (see global variables) days.
 */
function isTimelineOutdated(timeline, issueNum, assignee) {
  for (moment of timeline) {
    if (isMomentRecent(moment.created_at, updatedByDays)) {
      if (moment.event == 'cross-referenced' && isLinkedIssue(moment, issueNum)) {
        return false;
      } else if (moment.event == 'commented' && isCommentByAssignee(moment, assignee)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Removes the outdated status labels (if there), then adds the to update label to the specified issue
 * @param {Number} issueNum an issue's number
 */
async function addUpdateLabel(issueNum) {
  try {
    // https://octokit.github.io/rest.js/v18#issues-remove-label
    await github.issues.removeLabel({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNum,
      name: removeLabels,
    });
  } catch (err) {
    console.error(`No labels to remove for issue #${num}`);
  } finally {
    try {
      // https://octokit.github.io/rest.js/v18#issues-add-labels
      await github.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNum,
        labels: addLabels,
      });
    } catch {
      console.error(`Could not add label for issue #${num}`);
      console.error(err);
    }
  }
}

/***********************
*** HELPER FUNCTIONS ***
***********************/

function collectPages(results) {
  let collection = []
  for (page of results) {
    collection.push(...page.result);
  }
  return collection
}

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
    results = await github.issues.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNum,
    });
    return results.data.assignee.login
  } catch (err) {
    console.error(`Failed request to get assignee from issue: #${issueNum}`)
    return false;
  }
}

module.exports = main