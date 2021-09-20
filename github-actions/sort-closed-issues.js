/**
 * Check the labels of an issue, and return the column the issue should be sorted into when closed
 * @param {Object} context - context object
 * @returns - returns an object with the action's result, which is passed on to the next action
 */
function main({ context }) {
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

  const includesHardLabel = item => hardLabels.includes(item);
  const includesSoftLabel = item => softLabels.includes(item);
  const includesOverrideLabel = item => overrideSoftLabels.includes(item);

  /** if issue includes hard labels there should be no visual changes - move to the Done column */
  if (issueLabels.some(includesHardLabel)) {
    return "Done";
  }

  /** if issue does not include a hard label, but does contain an override label - move to UAT */
  if (issueLabels.some(includesOverrideLabel)) {
    return "UAT";
  }

  /** if issue includes soft labels (no hard or override) - move to Done */
  if (issueLabels.some(includesSoftLabel)) {
    return "Done";
  }

  // all other issues go to UAT column
  return "UAT";
}

/**
 * Get all labels from the issue
 * @param {Object} context - context object
 * @return {Array} - returns an array of all the labels
 */
function obtainLabels(context) {
  const labelsObject = context.payload.issue.labels;
  const labels = labelsObject.map((label) => label.name);
  return labels;
}

module.exports = main;
