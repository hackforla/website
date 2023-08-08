const { Octokit } = require("@octokit/rest");
const trueContributorsMixin = require("true-github-contributors");

// Extend Octokit with new contributor endpoints and construct instance of class with Auth token 
Object.assign(Octokit.prototype, trueContributorsMixin);
const octokit = new Octokit({ auth: process.env.token });

// Set variables to avoid hard-coding
const org = 'hackforla';
const repo = 'website';
const team = 'website-write';

// Set date limits: at one month, warn contributor that they are 
// inactive, and at two months remove contributor from team(s)
const today = new Date();
let oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1)); // 1 month from today
let twoMonthsAgo = new Date(today.setMonth(today.getMonth() - 1)); // 1 month behind oneMonthAgo
oneMonthAgo = oneMonthAgo.toISOString();
twoMonthsAgo = twoMonthsAgo.toISOString();



/**
 * Main function, immediately invoked
 */
(async function main(){
  const [contributorsOneMonthAgo, contributorsTwoMonthsAgo] = await fetchContributors();
  console.log('-------------------------------------------------------');
  console.log('List of active contributors since' + ' ⏰ ' + oneMonthAgo.slice(0, 10) + ':');
  console.log(contributorsOneMonthAgo);

  const currentTeamMembers = await fetchTeamMembers();
  console.log('-------------------------------------------------------');
  console.log('Current members of ' + team + ':')
  console.log(currentTeamMembers)
  
  const removedContributors = await removeInactiveMembers(currentTeamMembers, contributorsTwoMonthsAgo);
  console.log('-------------------------------------------------------');
  console.log('Removed members from ' + team + ' inactive since ' + twoMonthsAgo.slice(0, 10) + ':');
  console.log(removedContributors);

  const updatedTeamMembers = await fetchTeamMembers();
  const notifiedContributors = await notifyInactiveMembers(updatedTeamMembers, contributorsOneMonthAgo);
  console.log('-------------------------------------------------------');
  console.log('Notified members from ' + team + ' inactive since ' + oneMonthAgo.slice(0, 10) + ':');
  console.log(notifiedContributors);

})();



/**
 * Function to fetch list of contributors with comments/commits/issues since date
 * @return {Object}     [List of active contributors]
 */
async function fetchContributors(){
  let allContributorsSinceOneMonthAgo = {};
  let allContributorsSinceTwoMonthsAgo = {};
  
  // Fetch all contributors with commit, comment, and issue contributions
  const APIs = ['GET /repos/{owner}/{repo}/commits', 'GET /repos/{owner}/{repo}/issues/comments', 'GET /repos/{owner}/{repo}/issues'];
  const dates = [oneMonthAgo, twoMonthsAgo]

  for (const date of dates){
    const allContributorsSince = {};
    for(const api of APIs){
      let pageNum = 1;
      let result = [];
  
      // Since Github only allows to fetch 100 items per request, we need to 'flip' pages
      while(true){
        // Fetch 100 items from page number (`pageNum`)
        // `oneMonthAgo` is a variable defined on top of the file
        const contributors = await octokit.request(api, {
          owner: org,
          repo: repo,
          since: date,
          per_page: 100,
          page: pageNum
        })
  
        // If the API call returns an empty array, break out of loop- there is no additional data on that page.
        // Else if data is returned, push it to `result` and increase the page number (`pageNum`)
        if(!contributors.data.length){
          break;      
        } else {
          result = result.concat(contributors.data);
          pageNum++;
        }
      }
  
      // Once we have looked at all pages and collected all the data, we create key-value pairs 
      // of recent contributors and store them in `allContributorsSince` object
  
      // The data that comes back from APIs is stored differently, i.e. `author.login` 
      // vs `user.login`, all we want is to extract the username of a contributor
      for(const contributorInfo of result){
        // check if username is stored in author.login
        if(contributorInfo.author){
          allContributorsSince[contributorInfo.author.login] = true;
        } else if(contributorInfo.user){
          allContributorsSince[contributorInfo.user.login] = true;
  
          // This check is done for "issues" API (3rd element in the APIs array). Sometimes a user who created
          // an issue is not the same as the user assigned to that issue- we want to make sure that we count 
          // all assignees as active contributors as well.
          if(contributorInfo.assignees && contributorInfo.assignees.length){
            contributorInfo.assignees.forEach(user => allContributorsSince[user.login] = true);
          } 
        } else {
          console.log('You should not be seeing this message...');
        }    // END if...else
      }    // END for(const contributorInfo of result)
    }    // END for(const api of APIs) 
    if(date == oneMonthAgo){
      allContributorsSinceOneMonthAgo = allContributorsSince;
    } else {
      allContributorsSinceTwoMonthsAgo = allContributorsSince;
    }
  }    // END for(date of dates)
  return [allContributorsSinceOneMonthAgo, allContributorsSinceTwoMonthsAgo]; 
}



/**
 * Function to return list of current team members
 * @return {Array}     [Current team members]
 */
async function fetchTeamMembers(){
    
  let pageNum = 1;
  let teamResults = [];
  
  while(true){
    // Fetch all members of team. Note: if total members exceed 100, we need to 'flip' pages 
    const teamMembers = await octokit.request('GET /orgs/{org}/teams/{team_slug}/members', {
      org: org,
      team_slug: team, 
      per_page: 100,
      page: pageNum
    })
    
    // If the API call returns an empty array, break out of loop- there is no additional data on that page.
    // Else if data is returned, push it to `result` and increase the page number (`pageNum`)
    if(!teamMembers.data.length){
      break;      
    } else {
      teamResults = teamResults.concat(teamMembers.data);
      pageNum++;
    }
  }
  const allMembers = {};
  for(const member of teamResults){
    allMembers[member.login] = true;
  }
  return allMembers;
}



/**
 * Function to return list of contributors that have been inactive since twoMonthsAgo
 * @param {Object} allMembers   [List of active team]
 * @param {Object} recentContributors     [List of active contributors]
 * @return {Array}     [removed members]
 */
async function removeInactiveMembers(currentTeamMembers, recentContributors){
  const removedMembers = [];
  
  // Loop over team members and remove them from the team if they are not in recentContributors
  for(const username in currentTeamMembers){
    if (!recentContributors[username]){
      // Remove contributor from a team if they don't pass additional checks in `toRemove` function
      if(await toRemove(username)){   
        await octokit.request('DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}', {
          org: org,
          team_slug: team,
          username: username,
        })
        removedMembers.push(username);
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
    if(repository.name === repo && repository.created_at > oneMonthAgo){
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



/**
 * Function to return list of contributors that have been inactive since twoMonthsAgo
 * @param {Object} teamMembers   [List of team members]
 * @param {Object} recentContributors     [List of active contributors]
 * @return {Array}     [removed members]
 */
async function notifyInactiveMembers(updatedTeamMembers, recentContributors){
  const notifiedMembers = [];
  
  // Loop over team members and add to "notify" list if they are not in recentContributors
  for(const username in updatedTeamMembers){
    if (!recentContributors[username]){
      // Remove contributor from a team if they don't pass additional checks in `toRemove` function
      if(await toRemove(username)){   
        notifiedMembers.push(username)
      }
    }
  }
  return notifiedMembers;
}
