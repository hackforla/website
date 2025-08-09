/**
 * @description - Get item info using its issue number
 * @param {Object} github    - GitHub object from function calling queryIssueInfo()
 * @params {Object} context  - Context of the function calling queryIssueInfo()
 * @returns {Object}         - An object containing the item ID and its status name
 */
async function retrieveSkillsId(github, context, issueNum) {
  const repoOwner = context.repo.owner;
  const repoName = context.repo.repo;

  const query = `query($owner: String!, $repo: String!, $issueNum: Int!) {
    repository(owner: $owner, name: $repo) {
      issue(number: $issueNum) {
        id
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

    // Extract the issue id
    const id = response.repository.issue.id;

    return { id };
  } catch (error) {
    throw new Error(`Error finding NodeId for issue #${issueNum}; error = ${error}`);
  }
}

module.exports = retrieveSkillsId;