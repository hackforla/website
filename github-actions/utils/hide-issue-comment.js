/**
 * Minimize issue comment as OUTDATED given the comment's node Id
 * @param {String} nodeID - node Id of comment to be marked as 'OUTDATED'
 * 
 */
async function minimizeIssueComment(github, nodeID) {

  const mutation = `mutation($nodeID: ID!) {
    minimizeComment(input: {classifier: OUTDATED, subjectId: $nodeID}) {
      clientMutationId
      minimizedComment {
        isMinimized
        minimizedReason
      }
    }
  }`;

  const variables = {
    nodeId: nodeID,
  };

  try {
    await github.graphql(mutation, variables);
  } catch (error) {
    throw new Error(`Error in minimizeIssueComment() function: ${error}`);
  }
}

module.exports = minimizeIssueComment;