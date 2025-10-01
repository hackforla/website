const path = require("path");
const populateTemplate = require("../utils/populate-template");
const postComment = require("../utils/post-issue-comment");
const createTemplatedIssue = require("../utils/create-templated-issue");
const formatIssueList = require("./format-issue-list");
const getLATimestamp = require("../utils/get-la-timestamp");
const retrieveLabelDirectory = require("../utils/retrieve-label-directory");

const STATIC_ISSUE_NUMS = require("../utils/_data/static-issue-nums.json");

const readyForPM = retrieveLabelDirectory("readyForPM");
const complexitySmall = retrieveLabelDirectory("complexity2");
const size05pt = retrieveLabelDirectory("size05pt");
const featureAdministrative = retrieveLabelDirectory("featureAdministrative");
const roleBackEndDevOps = retrieveLabelDirectory("roleBackEndDevOps");

/**
 * Creates new GitHub issue to notify PM team about label deletion
 * and request comment from the label deleter
 * @param {Object} github           - github object from actions/github-script
 * @param {Object} context          - context opbject from actions/github-script
 * @param {Array} unlabeledIssues   - Array of issue numbers affected by label deletion
 * @param {Number} notificationIssueNum - Number of the created notification issue
 */
async function postUnlabelNotificationToAgenda({
  g: github,
  c: context,
  unlabeledIssues,
  notificationIssueNum,
}) {
  // Get agenda comment text prior to comment. We will either
  // use it in the agenda comment or in the agenda missing issue
  const agendaComment = populateTemplate({
    templatePath: path.resolve(
      __dirname,
      "./templates/agenda-issue-comment.md",
    ),
    templateVars: {
      "${label-name}": context.payload.label.name,
      "${label-deleter}": context.payload.sender.login,
      "${affected-issues}": formatIssueList(unlabeledIssues),
      "${notification-issue-num}": notificationIssueNum,
    },
  });

  try {
    // Check the status of the agenda issue.
    const statusIssue =  await github.rest.issues.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: STATIC_ISSUE_NUMS.AGENDA});

    // If not open, throw error to create a status closed notification issue
    if (statusIssue["data"]["state"] !== "open") {
      throw new Error("Status issue has state:" + statusIssue["data"]["state"]);
    }

    // Post comment to agenda issue
    await postComment(STATIC_ISSUE_NUMS.AGENDA, agendaComment, github, context);

  } catch (err) {
    // There was an issue posting to the agenda -- either the agenda is missing or is closed.
    // Create a notification issue about this error
    const timestamp = getLATimestamp();
    const missingAgendaIssueNum = await createTemplatedIssue({
      title: `Review Needed - Error Posting to Agenda Issue #${STATIC_ISSUE_NUMS.AGENDA} for Label \`${context.payload.label.name}\` Deletion`,
      templatePath: path.resolve(
        __dirname,
        "./templates/agenda-error-issue-body.md",
      ),
      templateVars: {
        "${agenda-issue-num}": STATIC_ISSUE_NUMS.AGENDA,
        "${timestamp}": timestamp,
        "${script-name}": path.basename(__filename),
        "${agenda-comment}": agendaComment,
      },
      labels: [complexitySmall, size05pt, featureAdministrative, roleBackEndDevOps, readyForPM],
      github: github,
      context: context,
    });

    // Could elevate this to a new Error throw if we want workflow to fail
    console.log(
      `Agenda issue #${STATIC_ISSUE_NUMS.AGENDA} not open or not found. Notification issue #${missingAgendaIssueNum} created. Original error: ${err.message}`,
    );
  }
}

module.exports = postUnlabelNotificationToAgenda;
