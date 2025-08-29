/**
 * @param {octokit} github - Octokit object used to access GitHub API
 * @param {Object} context - context object from actions/github-script
 * @param {String} githubUsername - The GitHub username of the user whose membership is to be checked.
 * @param {String} team - The HFLA team the username's membership is checked against. Example: 'website-write'
 *
 * Returns true or false depending on whether the username is found on the passed team, 404 means the user passed
 * wasn't found on the team passed. Any other type of error will be thrown.
 *
 * Need read:org permission to use this function. Lack of permission will result in a 403 error.
 *
 * The method of obtaining the GitHub username will vary depending on the contents of the context object. See GitHub
 * action docs on printing context information into the log.
 */
async function isMemberOfTeam(github, context, githubUsername, team) {
  try {
    await github.rest.teams.getMembershipForUserInOrg({
      org: context.repo.owner,
      team_slug: team,
      username: githubUsername
    });
    console.log(`User '${githubUsername}' is member of team '${team}'`);
    return true;
  } catch (verificationError) {
    if (verificationError.status === 404) {
      console.log(`User '${githubUsername}' is not a team member`);
      return false;
    } else {
      throw verificationError;
    }
  }
}

module.exports = isMemberOfTeam;

