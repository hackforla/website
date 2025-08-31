/** 
* Checks whether user is on the specified project team
* @param {octokit} github - Octokit object used to access GitHub API 
* @param {String} username - The GitHub username of the user whose membership is to be checked.
* @param {String} team - The team the username's membership is checked against. Example: 'website-write'
* @returns {Boolean}
*/

async function isMemberOfTeam(github, context, username, team) {
  try {
    await github.rest.teams.getMembershipForUserInOrg({
      org: context.repo.owner,
      team_slug: team,
      username: username,
    });
    console.log(`User '${username}' is member of team '${team}'`);
    return true;
  } catch (verificationError) {
    if (verificationError.status === 404) {
      console.log(`User '${username}' is not a team member`);
      return false;
    } else {
      throw verificationError;
    }
  }
}
