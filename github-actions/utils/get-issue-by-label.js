/**
 * Gets issue by label
 * @param {String} actor - the creator of the issue
 * @param {Array} labels - the labelS we want to filter by
 */
async function getIssueByLabel(actor, labels, github, context) {
  try {
    //   TODO - How to get owner and repo dynamically
    let results = await github.graphql(query, {
      actor: actor,
      labels: labels,
      owner: "partapparam",
      repository: "website",
    })

    let issue = results.repository.issues.nodes[0]
    return issue
  } catch (err) {
    console.error(err)
    throw new Error(err)
  }
}

/**
 * GraphQL query template to use to execute the search.
 */
const query = `
query ($actor: String!, $labels: [String!]!, $owner: String!, $repository: String!) {
  repository (owner: $owner, name: $repository) {
   issues (first: 10, filterBy: {createdBy: $actor labels: $labels}) {
     nodes {
       __typename
       ... on Issue {
         title
         closed
         number
         url
         id
         projectCards {
          nodes {
            id
          }
        }
      }
    }
  }
}
}
`

module.exports = getIssueByLabel
