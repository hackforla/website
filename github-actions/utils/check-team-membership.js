/** 
* @param {octokit} github - Octokit object used to access GitHub API 
* @param {String} githubUsername - The GitHub username of the user whose membership is to be checked.
* @param {String} team - The HFLA team the username's membership is checked against. Example: 'website-write'

- Returns true or false depending on whether the username is found on the passed team, 404 means the user passed wasn't 
found on the team passed. Any other type of error will be thrown.
- Need read:org permission to use this function, the least permissive token which contains this is the TEAMS token.
Lack of permission will result in a 403 error.
- The method of obtaining the GitHub username will vary depending on the contents of the context object. See GitHub action 
docs on printing context information into the log.
*/

async function isMemberOfTeam(github, githubUsername, team)
{
    try {
        await github.rest.teams.getMembershipForUserInOrg({
            org : 'hackforla',
            team_slug : team,
            username : githubUsername
        });
        return true;
    } catch (verificationError) {
        if (verificationError.status == 404) {
            return false;
        }
        else {
            throw verificationError;
        }
    }
}

module.exports = isMemberOfTeam;
