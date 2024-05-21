/**
 * Move Issue to In Progress Column
 * @param {String} issueCardId - the issue card ID
 * @param {String} projectColumnId - the project column ID
 */
async function updateIssueProjectCard(issueCardId, projectColumnId, github) {
  try {
    await github.graphql(mutation, {
      cardId: issueCardId,
      columnId: projectColumnId,
    })
  } catch (err) {
    throw new Error(err)
  }
}

/**
 * GraphQL query template to use to move project card to In Progress Column
 */
const mutation = `
mutation ($cardId: ID! $columnId: ID!) {
  moveProjectCard (input: {cardId: $cardId columnId: $columnId}) {
    cardEdge {
      node {
        resourcePath
      }
    }
  }
}
`

module.exports = updateIssueProjectCard
