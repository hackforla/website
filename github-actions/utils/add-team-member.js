/**
 * Function to return list of current team members
 * @param {Object} github      - github object from actions/github-script
 * @param {Object} context     - context object from actions/github-script
 * @param {String} team        - team to check for member
 * @param {String} username    - member to check for team membership
 */
async function addTeamMember(github, context, team, username){

  const baseMember = await github.request('GET /orgs/{org}/teams/{team_slug}/memberships/{username}', {
      org: context.repo.owner,
      team_slug: team,
      username: username,
    });
    // If response status is not 200, need to add member to baseTeam
    if(baseMember.status != 200){
      await github.request('PUT /orgs/{org}/teams/{team_slug}/memberships/{username}', {
        org: context.repo.owner,
        team_slug: team,
        username: username,
        role: 'member',
      });
      console.log('Member added to \'' + team + '\' team: ' + username);
    } 
}

module.exports = addTeamMember;
