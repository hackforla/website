const obtainLabels = require('../utils/obtain-labels')

/**
 * Check the labels of an issue, and return the 'status' the issue should be sorted into when closed
 * @param {Object} context - context object from actions/github-script
 * @returns - returns the appropriate 'status', which is passed on to the next action
 */
function main({ context }) {

  // Using Projects Beta 'status'
  const doneStatus = "Done"
  const QAStatus = "QA"

  const hardLabels = [
    "Feature: Refactor CSS",
    "Feature: Refactor HTML",
    "Feature: Refactor JS / Liquid",
    "Feature: Refactor GHA",
  ];

  const softLabels = [
    "role: back end/devOps",
    "Feature: Analytics",
  ];

  const overrideSoftLabels = ["role: front end"]

  const issueLabels = obtainLabels(context);

  // checks if label is a hard label
  const isHardLabel = label => hardLabels.includes(label);
  // checks if label is a soft label
  const isSoftLabel = label => softLabels.includes(label);
  // checks if label is an override label
  const isOverrideLabel = label => overrideSoftLabels.includes(label);

  /** If issue includes hard labels there should be no visual changes - move to the Done status */
  if (issueLabels.some(isHardLabel)) {
    console.log("Found hard label- sort to 'Done' status.");
    return doneStatus;
  }

  /** if issue does not include a hard label, but does contain an override label - move to QA status */
  if (issueLabels.some(isOverrideLabel)) {
    console.log("Found override label- sort to 'QA' status.");
    return QAStatus;
  }

  /** if issue includes soft labels (no hard or override) - move to Done status */
  if (issueLabels.some(isSoftLabel)) {
    console.log("Found soft label- sort to 'Done' status.");
    return doneStatus;
  }

  // all other issues go to QA status
  console.log("Didn't find hard or soft label- sort to 'QA' status.");
  return QAStatus;
}

module.exports = main;
