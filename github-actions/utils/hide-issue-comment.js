/**
 * Minimize issue comment as OUTDATED given the comment's node Id
 * @param {String} nodeId - node Id of comment to be marked as 'OUTDATED'
 * 
 */
async function minimizeIssueComment(github, nodeId) {

  const mutation = `mutation($nodeId: ID!) {
    minimizeComment(input: {classifier: OUTDATED, subjectId: $nodeId}) {
      clientMutationId
      minimizedComment {
        isMinimized
        minimizedReason
      }
    }
  }`;

  const variables = {
    nodeId: nodeId,
  };

  try {
    await github.graphql(mutation, variables);
  } catch (error) {
    throw new Error(`Error in minimizeIssueComment() function: ${error}`);
  }
}

module.exports = minimizeIssueComment;
