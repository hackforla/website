// Import modules
var fs = require("fs")

// Global variables
var github
var context

/**
 * @description - This function is the entry point into the javascript file,
 * It will determine the eventName and return the proper activity detail
 * @param {Object} g - github object
 * @param {Object} c - context object
 */
async function main({ g, c }) {
  github = g
  context = c

  switch (context.eventName) {
    case "issue_comment":
      return await getIssueCommentEventType(context)
    case "issues":
      return await getIssueEventType(context)
    case "pull_request":
      return await getPullRequestEventType(context)
    case "pull_request_review":
      return await getPullRequestReviewEventType(context)
    case "pull_request_review_comment":
      return await getPullRequestReviewCommentEventType(context)
    default:
      // Handle cases where eventName doesn't match any known event type
      console.log(`Unknown event name: ${context.eventName}`)
  }
}

/**
 * Retrieves detailed information about an issue event based on the action performed.
 * @param {*} context
 * @returns - An object containing the activity detail:
 * - contributor
 * - action
 * - object the activity was performed on (issue, issue_comment, pr, pr_comment, pr_review)
 *
 */
async function getIssueEventType(context) {
  const activityDetail = {
    contributor: "",
    action: context.payload.action,
    activityObject: `Issue #${context.payload.issue.number}`,
  }
  if (context.payload.action == "opened") {
    activityDetail.contributor = context.payload.issue.user.login
  } else if (context.payload.action == "closed") {
    //   NOTE: context.payload.issue.assignee.login can be null if issue is not assigned and marked closed
    activityDetail.contributor = context.payload.issue.assignee.login
  } else {
    //   on unassigned event, the `issue.assignee` is null.
    activityDetail.contributor = context.payload.assignee.login
  }
  return activityDetail
}

/**
 * Retrieves detailed information about an issue event based on the action performed.
 * @param {*} context
 * @returns - An object containing the activity detail:
 * - contributor
 * - action
 * - object the activity was performed on (issue, issue_comment, pr, pr_comment, pr_review)
 *
 */
async function getIssueCommentEventType(context) {
  const activityDetail = {
    contributor: context.payload.comment.user.login,
    action: context.payload.action,
    activityObject: context.payload.comment.url,
  }
  return activityDetail
}

/**
 * Retrieves detailed information about an issue event based on the action performed.
 * @param {*} context
 * @returns - An object containing the activity detail:
 * - contributor
 * - action
 * - object the activity was performed on (issue, issue_comment, pr, pr_comment, pr_review)
 *
 */
async function getPullRequestEventType(context) {
  const activityDetail = {
    contributor: context.payload.pull_request.user.login,
    action: context.payload.action,
    activityObject: `PR #${context.payload.pull_request.number}`,
  }
  return activityDetail
}

/**
 * Retrieves detailed information about an issue event based on the action performed.
 * @param {*} context
 * @returns - An object containing the activity detail:
 * - contributor
 * - action
 * - object the activity was performed on (issue, issue_comment, pr, pr_comment, pr_review)
 *
 */
async function getPullRequestReviewEventType(context) {
  // also achievable by the context.sender - user who did this event
  const activityDetail = {
    contributor: context.payload.review.user.login,
    action: context.payload.action,
    activityObject: `PR #${context.payload.pull_request.number}`,
  }
  return activityDetail
}

/**
 * Retrieves detailed information about an issue event based on the action performed.
 * @param {*} context
 * @returns - An object containing the activity detail:
 * - contributor
 * - action
 * - object the activity was performed on (issue, issue_comment, pr, pr_comment, pr_review)
 *
 */
async function getPullRequestReviewCommentEventType(context) {
  // also achievable by the context.sender - user who did this event
  const activityDetail = {
    contributor: context.payload.comment.user.login,
    action: context.payload.action,
    activityObject: `${context.payload.comment.url}`,
  }
  return activityDetail
}

module.exports = main
