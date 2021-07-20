const core = require("@actions/core");
const { Octokit } = require("@octokit/rest");
const trueContributorsMixin = require("true-github-contributors");
const _ = require('lodash');


Object.assign(Octokit.prototype, trueContributorsMixin);
const octokit = new Octokit({ auth: process.env.token });


(async function main(){
  const today = new Date();
  let monthAgo = new Date(today.setMonth(today.getMonth() - 1));
  monthAgo = monthAgo.toISOString();

  const commentCommitWikiContributors = await fetchContributors(monthAgo);

  console.log('-------------------------------------------------------')
  console.log('List of active contributors since' + ' ⏰ ' + monthAgo.slice(0, 10) + ':');
  console.log(commentCommitWikiContributors);

  const removedContributors = await removeInactiveMembers(commentCommitWikiContributors, monthAgo);

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

  // fetch commit, comment, issues contirbutors;
  const APIs = [['GET /repos/{owner}/{repo}/commits', 0], ['GET /repos/{owner}/{repo}/issues/comments', 1], ['GET /repos/{owner}/{repo}/issues', 2]];

  for(const api of APIs){
    let pageNum = 1;
    let result = [];

    while(true){
      const contributors = await octokit.request(api[0], {
        owner: 'hackforla',
        repo: 'website',
        since: date,
        per_page: 100,
        page: pageNum
      })

      result.concat(contributors.data);

      if(!contributors.data.length){
        break;
      } else {
        pageNum++;
      }
    }
    console.log(result)
    for(const contributorInfo of result){
      if(api[1] === 0){
        allContributorsSince[contributorInfo.author.login] = true;
      } else if (api[1] === 1){
        allContributorsSince[contributorInfo.user.login] = true;
      } else {
        allContributorsSince[contributorInfo.user.login] = true;
        if(contributorInfo.assignees.length){
          contributorInfo.assignees.forEach(user => allContributorsSince[user.login] = true);
        }
      }
    }

  }
  //how to fetch Wiki contributors?
  return allContributorsSince;
}


/**
 * Function to remove inactive members from a team
 * @param {Object} recentContributors     [List of active contributors]
 * @return {Array}     [removed members]
 */
async function removeInactiveMembers(recentContributors, date){
  const removedMembers = []

  //fetch all team members (now we know that the total of members is 83, once passed code below need adjustments);

  const teamMembers = await octokit.request('GET /orgs/{org}/teams/{team_slug}/members', {
    org: 'hackforla',
    team_slug: 'website-write', 
    per_page: 100
  })

  const allMembers = {}
  for(const members of teamMembers.data){
    allMembers[members.login] = true;
  }

  console.log('---------------------------------------')
  console.log('Team Members of website-write:')
  console.log(allMembers)

  // loop over team members and remove them from team if they are not in recentContributors
  for(const member of teamMembers.data){
    const username = member.login

    if (!recentContributors[username]){
      // check user repos and see if they joined hackforla/website recently
      // user might have > 100 repos (this will need adjustment)
      const repos = await octokit.request('GET /users/{username}/repos', {
        username: username,
        per_page: 100
      })
      //if user joined a team within last 30 days, they are not consider for removal since they are new
      for(const repo of repos.data){
        if(repo.name === 'website'){
          if(repo.created_at > date) {
            console.log(username + ' is new member and not consideren for removal')
            break;
          }
        }
      }

      // esle this user is a member of a team for more than 1 month and without contributions
      // => remove
      // await octokit.request('DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}', {
      //   org: 'actions-team-test', 
      //   team_slug: 'banana', 
      //   username: username
      // })
      // removedMembers.push(username)
      // break; //remove if approved
    }
  }

  return removedMembers;
}






