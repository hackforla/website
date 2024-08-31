/**
 * Function to return list of current team members
 * @param {Object} github      - github object from actions/github-script
 * @param {Object} context     - context object from actions/github-script
 * @param {String} team        - team from which to get member list
 * @returns {Array} allMembers - Current team members
 */
async function getTeamMembers(github, context, team) {
  let pageNum = 1;
  let teamResults = [];

  // Get all members of team. Note: if total members exceed 100, we need to 'flip' pages
  while (true) {
    // https://docs.github.com/en/rest/teams/members?apiVersion=2022-11-28#list-team-members
    const teamMembers = await github.request('GET /orgs/{org}/teams/{team_slug}/members', {
      org: context.repo.owner,
      team_slug: team,
      per_page: 100,
      page: pageNum,
    });
    if (!teamMembers.data.length) {
      break;
    } else {
      teamResults = teamResults.concat(teamMembers.data);
      pageNum++;
    }
  }
  const allMembers = {};
  for (const member of teamResults) {
    allMembers[member.login] = true;
  }
  return allMembers;
}

module.exports = getTeamMembers;
