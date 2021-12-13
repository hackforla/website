const obtainLabels = require('../utils/obtain-labels')

/**
 * Check the labels of an issue, and return the column the issue should be sorted into when closed
 * @param {Object} context - context object from actions/github-script
 * @returns - returns the appropriate column, which is passed on to the next action
 */
function main({ context }) {
  const doneColumn = "Done"
  const QAColumn = "QA"

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

  /** If issue includes hard labels there should be no visual changes - move to the Done column */
  if (issueLabels.some(isHardLabel)) {
    return doneColumn;
  }

  /** if issue does not include a hard label, but does contain an override label - move to UAT */
  if (issueLabels.some(isOverrideLabel)) {
    return QAColumn;
  }

  /** if issue includes soft labels (no hard or override) - move to Done */
  if (issueLabels.some(isSoftLabel)) {
    return doneColumn;
  }

  // all other issues go to UAT column
  return QAColumn;
}

module.exports = main;
