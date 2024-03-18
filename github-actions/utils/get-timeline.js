/**
 * Function that returns the timeline of an issue
 * @param {Object} github                 - github object from actions/github-script
 * @param {Object} context                - context object from actions/github-script
 * @param {Number} issueNum               - the issue number
 * @returns {Object} timelineArray        - an array containing the timeline of issue events
 */
async function getTimeline(issueNum, github, context) {
  let timelineArray = [];
  let page = 1;
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
        timelineArray = timelineArray.concat(results.data);
      } else {
        break;
      }
    } catch (err) {
      console.log(err);
      continue;
    } finally {
      page++;
    }
  }
  return timelineArray;
}

module.exports = getTimeline;
