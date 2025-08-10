const tenDaysAgo = new Date();
tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);


async function getIssueComments(github, context, issueNum) {

  const owner = context.repo.owner;
  const repo = context.repo.repo;


  const query = `query($owner: String!, $repo: String!, $issueNum: Int!) {
    repository(owner: $owner, name: $repo) {
      issue(number: $issueNum) {
        comments(first: 100) {
          nodes {
            id
            author { login }
            createdAt
            isMinimized
            minimizedReason
          }
        }
      }
    }
  }`;

  const variables = {
    owner: owner,
    repo: repo,
    issueNum: issueNum,
  };


  let commentIds = [];
  let botNames = ["github-actions[bot]", "HackforLABot"];

  try {
    const response = await github.graphql(query, variables);

    let comments = response.repository.issue.comments.nodes || [];

    for (let comment of comments) {
      let created = new Date(comment.createdAt);
    
      if (
        botNames.includes(comment.author?.login) &&
        created < tenDaysAgo &&
        !comment.isMinimized
      ) {
        commentIds.push(comment.id); 
      }
    }
  } catch (error) {
    throw new Error(`Error retrieving comments for issue #${issueNum}: ${error}`);
  }

  return commentIds;
}

