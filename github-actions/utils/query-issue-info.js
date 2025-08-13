/**
 * @description - Get item info using its issue number
 * @param {Object} github    - GitHub object from function calling queryIssueInfo()
 * @params {Object} context  - Context of the function calling queryIssueInfo()
 * @returns {Object}         - An object containing the item ID and its status name
 */
async function queryIssueInfo(github, context, issueNum) {
  const repoOwner = context.repo.owner;
  const repoName = context.repo.repo;

  const query = `query($owner: String!, $repo: String!, $issueNum: Int!) {
    repository(owner: $owner, name: $repo) {
      issue(number: $issueNum) {
        id
        projectItems(first: 1) {
          nodes {
            id
            fieldValues(first: 10) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  optionId
                }
              }
            }
          }
        }
      }
    }
  }`;

  const variables = {
    owner: repoOwner,
    repo: repoName,
    issueNum: issueNum,
  };

  try {
    const response = await github.graphql(query, variables);

    // Extract the list of project items associated with the issue
    const projectData = response.repository.issue.projectItems.nodes;

    // Since there is always one item associated with the issue,
    // directly get the item's ID from the first index
    const id = projectData[0].id;
/*
    // Iterate through the field values of the first project item
    // and find the node that contains the 'name' property, then get its 'name' value
    const statusName = projectData[0].fieldValues.nodes.find((item) => 
      item.hasOwnProperty("name")).name;
    
    // Similarly, find node with 'optionId' property, then get is 'optionId' value
    const statusId = projectData[0].fieldValues.nodes.find((item) => 
      item.hasOwnProperty("optionId")).optionId;
*/
    // Iterate through the field values of the first project item and find the nodes
    // for 'name' and 'optionId' properties, then get 'statusName' and 'statusId'
    const fieldValues = projectData[0].fieldValues?.nodes || [];

    const statusNameNode = fieldValues.find((item) => item.hasOwnProperty("name"));
    const statusIdNode = fieldValues.find((item) => item.hasOwnProperty("optionId"));
    
    const statusName = statusNameNode?.name || 'Unknown Status';
    const statusId = statusIdNode?.optionId || null;
  
    return { id, statusName, statusId };
  } catch (error) {
    // If an error occurs, log it and return an object with null values
    console.error(`Error querying issue info for Issue #${issueNum}:`, error.message);
    return { 
      id: null, 
      statusName: 'Error', 
      statusId: null, 
      error: error.message,
      issueNumber: issueNum 
    };
  }
}

module.exports = queryIssueInfo;
