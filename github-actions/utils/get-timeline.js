/**
 * Function that returns the timeline of an issue.
 * @param {Number} issueNum the issue's number
 * @returns an Array of Objects containing the issue's timeline of events
 */
async function getTimeline(issueNum, github, context) {
    let arra = []
    let page = 1
    while (true) {
      try {
        const results = await github.rest.issues.listEventsForTimeline({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: issueNum,
          per_page: 100,
          page: page,
        });
        if (results.data.length) {
          arra = arra.concat(results.data);
        } else {
          break
        }
      } catch (err) {
        console.log(error);
        continue
      }
      finally {
        page++
      }
    }
    return arra
  }

  module.exports = getTimeline;