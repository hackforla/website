const { Octokit } = require("@octokit/rest");
const trueContributorsMixin = require("true-github-contributors");

// Extend Octokit with new contributor endpoints and construct instance of class with Auth token 
Object.assign(Octokit.prototype, trueContributorsMixin);
const octokit = new Octokit({ auth: process.env.token });

// set variables to avoid hard-coding
const org = 'hackforla';
const repo = 'website';
const team = 'website-write';

// set a date limit for when to remove a contributor from the team 
const today = new Date();
let monthAgo = new Date(today.setMonth(today.getMonth() - 1));
monthAgo = monthAgo.toISOString();


(async function main(){
  const commentCommitIssueContributors = await fetchContributors();

  console.log('-------------------------------------------------------')
  console.log('List of active contributors since' + ' ⏰ ' + monthAgo.slice(0, 10) + ':');
  console.log(commentCommitIssueContributors);

  const removedContributors = await removeInactiveMembers(commentCommitIssueContributors);

  console.log('-------------------------------------------------------')
  console.log('Removed members: ')
  console.log(removedContributors);
})()


/**
 * Function to fetch comment/commit/issue contributors since 'date'
 * @return {Object}     [List of active contributors]
 */
async function fetchContributors(){
  const allContributorsSince = {}

  // fetch commit, comment, issues contirbutors;
  const APIs = ['GET /repos/{owner}/{repo}/commits', 'GET /repos/{owner}/{repo}/issues/comments', 'GET /repos/{owner}/{repo}/issues'];

  for(const api of APIs){
    let pageNum = 1;
    let result = [];

    // since Github only allows to fetch 100 items per request, we need to 'flip' pages
    while(true){
      // fetch 100 items from page number (pageNum)
      // monthAgo is a variable defined on top of the file
      const contributors = await octokit.request(api, {
        owner: org,
        repo: repo,
        since: monthAgo,
        per_page: 100,
        page: pageNum
      })

      // as soon as we get an empty array from API call, it means there 
      // is no data on that page => break the loop
      if(!contributors.data.length){
        break;

        // if we get data, we push it to 'result' and increase the page number (pageNum)
      } else {
        result = result.concat(contributors.data);
        pageNum++;
      }
    }

    // once we looked at all pages and collected all the data, we create key-value pairs of 
    // recent contributors and store them in 'allContributorsSince' object

    // the data that comes back from APIs is stored differently e.g. 
    // 'author.login' vs 'user.login', all we want is to extract the username of a contributor
    for(const contributorInfo of result){
      // check if username is stored in author.login
      if(contributorInfo.author){
        allContributorsSince[contributorInfo.author.login] = true;
      } else {
        allContributorsSince[contributorInfo.user.login] = true;

        // this check is done for issues API (3rd element in the APIs array). Sometimes a user who created
        // an issue is not the same who got assigned to that issue so we want to make sure that we count 
        // all assignees as active contributors as well.
        if(contributorInfo.assignees && contributorInfo.assignees.length){
          contributorInfo.assignees.forEach(user => allContributorsSince[user.login] = true);
        }
      }
    }
  }

  return allContributorsSince;
}


/**
 * Function to remove inactive members from a team
 * @param {Object} recentContributors     [List of active contributors]
 * @return {Array}     [removed members]
 */
async function removeInactiveMembers(recentContributors){
  const removedMembers = []

  // fetch all team members. Note: now we know that the total of members is 83, once 
  // we have over 100 members, code below need adjustments (see 'flip' pages above);
  const teamMembers = await octokit.request('GET /orgs/{org}/teams/{team_slug}/members', {
    org: org,
    team_slug: team, 
    per_page: 100
  })

  const allMembers = {}
  for(const members of teamMembers.data){
    allMembers[members.login] = true;
  }

  console.log('-------------------------------------------------------')
  console.log('Team Members of ' + team + ':')
  console.log(allMembers)

  // loop over team members and remove them from the team if they are not in recentContributors
  for(const member of teamMembers.data){
    const username = member.login
    if (!recentContributors[username]){
      // Remove contributor from a team if they don't pass additional checks in 'toRemove' function
      if(await toRemove(username)){
        // TODO Remove the commented out code after testing
        
        await octokit.request('DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}', {
          org: org,
          team_slug: team,
          username: username,
        })
        
        removedMembers.push(username)
      }
    }
  }
  return removedMembers;
}

/**
 * Function to check if a member is set for removal
 * @param {String} member     [member's username]
 * @return {Boolean}     [true/false]
 */
async function toRemove(member){
  // collect user's repos and see if they recently joined hackforla/website;
  // Note: user might have > 100 repos, the code below will need adjustment (see 'flip' pages);
  const repos = await octokit.request('GET /users/{username}/repos', {
    username: member,
    per_page: 100
  })

  // if a user recently cloned 'website' repo (within the last 30 days), they are 
  // not consider for removal as they are new;
  for(const repository of repos.data){
    // if repo is recently cloned, return 'false' or member is not be removed;
    if(repository.name === repo && repository.created_at > monthAgo){
      return false;
    }
  }

  // get user's membership status 
  const userMembership = await octokit.request('GET /orgs/{org}/teams/{team_slug}/memberships/{username}', {
    org: org,
    team_slug: team,
    username: member,
  })

  // if a user is the team's maintainer, return 'false'. We do not remove maintainers;
  if(userMembership.data.role === 'maintainer') return false;

  // else this user is an inactive member of the team thus remove;
  return true;
}



