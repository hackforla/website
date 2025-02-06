// Import modules
const statusFieldIds = require('./_data/status-field-ids');

/**
 * Changes the 'Status' of an issue (with the corresponding itemId) to a newStatusValue
 * @param {String} itemId          -  GraphQL item Id for the issue
 * @param {String} newStatusValue  -  GraphQL Id value of the 'Status' field that the issue is moving to
 *
 */
async function mutateIssueStatus(
  github,
  context,
  itemId,
  newStatusValue
) {
  // Defaults for HfLA Website Project 86
  const PROJECT_ID = statusFieldIds("PROJECT_ID");
  const FIELD_ID = statusFieldIds("FIELD_ID");

  const mutation = `mutation($projectId: ID!, $fieldId: ID!, $itemId: ID!, $value: String!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $projectId,
      fieldId: $fieldId,
      itemId: $itemId,
      value: {
        singleSelectOptionId: $value
      }
    }) {
      projectV2Item {
        id
      }
    }
  }`;

  const variables = {
    projectId: PROJECT_ID,
    fieldId: FIELD_ID,
    itemId: itemId,
    value: newStatusValue,
  };

  try {
    await github.graphql(mutation, variables);
  } catch (error) {
    throw new Error('Error in mutateIssueStatus() function: ' + error);
  }
}

module.exports = mutateIssueStatus;
