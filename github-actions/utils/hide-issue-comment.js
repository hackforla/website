/**
 * Hide a comment as OUTDATED on github
 * @param {Number} nodeID - the comment to be marked as 'OUTDATED'
 */

async function hideComment(github, nodeID) {
  const reason = "OUTDATED"
  try {
    const resp = await github.graphql(`
      mutation {
        minimizeComment(input: {classifier: ${reason}, subjectId: "${nodeID}"}) {
          minimizedComment {
            isMinimized
          }
        }
      }
    `)
    if (resp.errors) {
      throw new Error(`${resp.errors[0].message}`)
    }
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = hideComment
