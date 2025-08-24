/**
 * @param {Object} github - GitHub client
 * @param {Object} context - context object from actions/github-script
 */
// - Need read:org permission to use this function. Lack of permission will result in a 403 error.
async function isMemberOfTeam(github, context, team, username) {
    try {
        await github.rest.teams.getMembershipForUserInOrg({
            org: context.repo.org,
            team_slug: team,
            username: githubUsername
        });
        console.log(`User '${githubUsername}' is member of team '${team}'`);
        return true;
    } catch (verificationError) {
        if (verificationError.status == 404) {
            console.log(`User '${githubUsername}' is not a team member`);
            return false;
        }
        else {
            throw verificationError;
        }
    }
}

module.exports = isMemberOfTeam;
