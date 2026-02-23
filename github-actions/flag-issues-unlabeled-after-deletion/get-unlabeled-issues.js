/**
 * Function to return list of recently unlabeled issues
 * @param {Object} github           - github object from actions/github-script
 * @param {Object} context          - context opbject from actions/github-script
 * @returns {Array} recentUnlabels  - issues that were recently unlabeled
 */
async function getRecentlyUnlabeledIssues({ g: github, c: context }) {
  // Get the name of the label that was just deleted
  const deletedLabelName = context.payload.label.name;

  // Set the timeout for issue update querying
  let fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

  // Set query variables
  const variables = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    since: fiveMinutesAgo.toISOString(),
  };

  // Define GraphQL query. This query returns all issues that were updated within
  // the last 5 minutes, and the last 10 unlabeling events for those issues, but does
  // NOT ensure that the unlabeling events were within last 5 minutes or that the
  // unlabeling was with the most recently deleted label, so post-processing is required
  const query = `query ($owner: String!, $repo: String!, $since: DateTime!) {
      repository(owner: $owner, name: $repo) {
        issues(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}, filterBy: { since: $since }) {
          nodes {
            number
            timelineItems(itemTypes: [UNLABELED_EVENT], last: 10) {
              nodes {
                ... on UnlabeledEvent {
                  createdAt
                  label {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }`;

  try {
    // Execute query
    const result = await github.graphql(query, variables);

    // Process query results to find issues where the unlabeling events were
    // within the last 5 minutes and were from our deleted label
    const recentUnlabels = [];
    for (const issue of result.repository.issues.nodes) {
      // Each issues returned by query
      for (const event of issue.timelineItems.nodes) {
        // Each unlabeled event of the issue
        const eventTime = new Date(event.createdAt);
        if (
          eventTime >= fiveMinutesAgo &&
          event.label.name === deletedLabelName
        ) {
          // Unlabel event was with the target label and within the last 5 minutes
          recentUnlabels.push(issue);
        }
      }
    }

    console.log(
      `Found ${recentUnlabels.length} recently unlabeled issues with label "${deletedLabelName}"`,
    );
    console.log("Results:", JSON.stringify(recentUnlabels, null, 2));

    return recentUnlabels;
  } catch (error) {
    console.error("GraphQL query failed:", error);
    console.error("Query variables:", variables);
    console.error("Deleted label name:", deletedLabelName);
    throw error;
  }
}

module.exports = getRecentlyUnlabeledIssues;
