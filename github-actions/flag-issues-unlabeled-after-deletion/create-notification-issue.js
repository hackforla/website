const path = require("path");
const getLATimestamp = require("../utils/get-la-timestamp");
const retrieveLabelDirectory = require("../utils/retrieve-label-directory");
const formatIssueList = require("./format-issue-list");
const createTemplatedIssue = require("../utils/create-templated-issue");
const postTemplatedComment = require("../utils/post-templated-comment");

const complexitySmall = retrieveLabelDirectory("complexity2");
const size05pt = retrieveLabelDirectory("size05pt");
const featureAdministrative = retrieveLabelDirectory("featureAdministrative");
const roleBackEndDevOps = retrieveLabelDirectory("roleBackEndDevOps");
const readyForPM = retrieveLabelDirectory("readyForPM");

/**
 * Creates new GitHub issue to notify PM team about label deletion
 * and request comment from the label deleter
 * @param {Object} github           - github object from actions/github-script
 * @param {Object} context          - context opbject from actions/github-script
 * @param {Array} unlabeledIssues   - Array of issue numbers affected by label deletion
 */
async function createUnlabelNotificationIssue({
  g: github,
  c: context,
  unlabeledIssues,
}) {
  // Extract payload data and capture timestamp
  const {
    name: labelName,
    color: labelColor,
    description: labelDesc,
    id: labelId,
  } = context.payload.label;
  const labelDeleter = context.payload.sender.login;
  const timestamp = getLATimestamp();

  // Create the notification issue
  const notificationIssueNum = await createTemplatedIssue({
    title: `Review Needed - Label \`${labelName}\` Deleted`,
    templatePath: path.resolve(
      __dirname,
      "./templates/notification-issue-body.md",
    ),
    templateVars: {
      "${label-name}": labelName,
      "${timestamp}": timestamp,
      "${deleter}": labelDeleter,
      "${label-color}": labelColor,
      "${label-description}": labelDesc,
      "${label-id}": labelId,
      "${affected-issues}": formatIssueList(unlabeledIssues),
    },
    labels: [complexitySmall, size05pt, featureAdministrative, roleBackEndDevOps, readyForPM],
    github: github,
    context: context,
  });
  console.log(`Deleted label issue #${notificationIssueNum} created`);

  // Create a comment on the issue to ping the deleter
  await postTemplatedComment({
    issueNum: notificationIssueNum,
    templatePath: path.resolve(
      __dirname,
      "./templates/notification-issue-comment.md",
    ),
    templateVars: {
      "${deleter}": labelDeleter,
      "${label-name}": labelName,
      "${timestamp}": timestamp,
    },
    github: github,
    context: context,
  });

  // Return the notification issue number
  return notificationIssueNum;
}

module.exports = createUnlabelNotificationIssue;
