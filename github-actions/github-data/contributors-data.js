const core = require("@actions/core");
const { Octokit } = require("@octokit/rest");
const trueContributorsMixin = require("true-github-contributors");
const _ = require('lodash');


Object.assign(Octokit.prototype, trueContributorsMixin);
const octokit = new Octokit({ auth: process.env.token });


(async function main(){
  const today = new Date();
  const monthAgo = new Date(today.setMonth(today.getMonth() - 2));
  // const dayAgo = new Date(today.setDate(today.getDate() - 1));

  const commentCommitWikiContributors = await fetchContributors(monthAgo.toISOString());

  console.log('-------------------------------------------------------')
  console.log('List of active contributors since' + ' ⏰ ' + monthAgo.toISOString().slice(0, 10) + ':');
  console.log(commentCommitWikiContributors);

  const removedContributors = await removeInactiveMembers(commentCommitWikiContributors);

  console.log('-------------------------------------------------------')
  console.log('Removed members: ')
  console.log(removedContributors);
})()


/**
 * Function to fetch comment/commit/wiki contributors since 'date'
 * @param {String} date     [since]
 * @return {Object}     [List of active contributors since 'date']
 */
async function fetchContributors(date){
  const allContributorsSince = {}

  // fetch commit contirbutors;
  const commitContributorsList = await octokit.request('GET /repos/{owner}/{repo}/commits', {
    owner: 'hackforla',
    repo: 'website',
    since: date
  })
  for(const contributorInfo of commitContributorsList.data){
    allContributorsSince[contributorInfo.author.login] = true;
  }

  // fetch comments contributors
  const commentsContributorsList = await octokit.request('GET /repos/{owner}/{repo}/issues/comments', {
    owner: 'hackforla',
    repo: 'website',
    since: date
  })
  for(const contributorInfo of commentsContributorsList.data){
    allContributorsSince[contributorInfo.user.login] = true;
  }

  //how to fetch Wiki contributors?
  return allContributorsSince;
}


/**
 * Function to remove inactive members from a team
 * @param {Object} recentContributors     [List of active contributors]
 * @return {Array}     [removed members]
 */
async function removeInactiveMembers(recentContributors){
  const removedMembers = []

  //fetch all team members
  const teamMembers = await octokit.request('GET /orgs/{org}/teams/{team_slug}/members', {
    org: 'hackforla',
    team_slug: 'website-write'  //??
  })
  console.log(teamMembers.data)

  // loop over team members and remove them from team if they are not in recentContributors
  // for(const member of teamMembers.data){
  //   const username = member.login
  //   //if team member is not in recentContributors => remove
  //   if (!recentContributors[username]){
  //     await octokit.request('DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}', {
  //       org: 'actions-team-test', 
  //       team_slug: 'banana', 
  //       username: username
  //     })
  //     removedMembers.push(username)
  //     // break; //remove if approved
  //   }
  // }

  // --- TO TEST ---
  // add user back 
  // await octokit.request('PUT /orgs/{org}/teams/{team_slug}/memberships/{username}', {
  //   org: 'actions-team-test',
  //   team_slug: 'banana',
  //   username: 'bcdguz',
  //   role: 'member'
  // })
  // await octokit.request('PUT /orgs/{org}/teams/{team_slug}/memberships/{username}', {
  //   org: 'actions-team-test',
  //   team_slug: 'banana',
  //   username: 'EdwinHongCheng',
  //   role: 'member'
  // })

  return removedMembers;
}






