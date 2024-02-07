const fs = require("fs");
const { Octokit } = require("@octokit/rest");

// Extend Octokit with new contributor endpoints and construct instance of class with Auth token 
Object.assign(Octokit.prototype);
const octokit = new Octokit({ auth: process.env.token });

// Set variables to avoid hard-coding
const org = 'hackforla';
const repo = 'website';
const team = 'website-write';
const baseTeam = 'website';
const maintTeam = 'website-maintain';

// Set date limits: we are sorting inactive members into groups to warn after 1 month and remove after 2 months.
// Since the website team takes off the month of December, the January 1st run is skipped (via `schedule-monthly.yml`). 
// The February 1st run keeps the 1 month inactive warning, but changes removal to 3 months inactive (skipping December).
let today = new Date();
let oneMonth = (today.getMonth() == 1) ? 2 : 1;            // If month is "February" == 1, then oneMonth = 2 months ago
let twoMonths = (today.getMonth() == 1) ? 3 : 2;           // If month is "February" == 1, then twoMonths = 3 months ago

let oneMonthAgo = new Date();                              // oneMonthAgo instantiated with date of "today"
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - oneMonth);   // then set oneMonthAgo from "today"
oneMonthAgo = oneMonthAgo.toISOString();
let twoMonthsAgo = new Date();                               // twoMonthsAgo instantiated with date of "today"
twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - twoMonths);  // then set twoMonthsAgo from "today"
twoMonthsAgo = twoMonthsAgo.toISOString();



/**
 * Main function, immediately invoked
 */
(async function main(){
  const [contributorsOneMonthAgo, contributorsTwoMonthsAgo, inactiveWithOpenIssue] = await fetchContributors();
  console.log('-------------------------------------------------------');
  console.log('List of active contributors since ' + oneMonthAgo.slice(0, 10) + ':');
  console.log(contributorsOneMonthAgo);

  const currentTeamMembers = await fetchTeamMembers(team);
  console.log('-------------------------------------------------------');
  console.log('Current members of ' + team + ':')
  console.log(currentTeamMembers)

  const [removedContributors, cannotRemoveYet] = await removeInactiveMembers(currentTeamMembers, contributorsTwoMonthsAgo, inactiveWithOpenIssue);
  console.log('-------------------------------------------------------');
  console.log('Removed members from ' + team + ' inactive since ' + twoMonthsAgo.slice(0, 10) + ':');
  console.log(removedContributors);

  console.log('-------------------------------------------------------');
  console.log('Members inactive since ' + twoMonthsAgo.slice(0, 10) + ' with open issues preventing removal:');
  console.log(cannotRemoveYet);
  
  const updatedTeamMembers = await fetchTeamMembers(team);
  const notifiedContributors = await notifyInactiveMembers(updatedTeamMembers, contributorsOneMonthAgo);
  console.log('-------------------------------------------------------');
  console.log('Notified members from ' + team + ' inactive since ' + oneMonthAgo.slice(0, 10) + ':');
  console.log(notifiedContributors);

  writeData(removedContributors, notifiedContributors);
})();



/**
 * Function to fetch list of contributors with comments/commits/issues since date
 * @returns {Object} allContributorsSinceOneMonthAgo - List of active contributors since one month ago 
 * @returns {Object} allContributorsSinceTwoMonthsAgo - List of active contributors since two months ago 
 */
async function fetchContributors(){
  let allContributorsSinceOneMonthAgo = {};
  let allContributorsSinceTwoMonthsAgo = {};
  let inactiveWithOpenIssue = {};

  // Members on 'website-maintain' team considered permanent members
  const permanentMembers = await fetchTeamMembers(maintTeam);
  
  // Fetch all contributors with commit, comment, and issue (assignee) contributions
  const APIs = ['GET /repos/{owner}/{repo}/commits', 'GET /repos/{owner}/{repo}/issues/comments', 'GET /repos/{owner}/{repo}/issues'];
  const dates = [oneMonthAgo, twoMonthsAgo];

  for (const date of dates){
    const allContributorsSince = {};
    for(const api of APIs){
      let pageNum = 1;
      let result = [];
  
      // Since Github only allows to fetch max 100 items per request, we need to 'flip' pages
      while(true){
        // Fetch 100 items per each page (`pageNum`)
        const contributors = await octokit.request(api, {
          owner: org,
          repo: repo,
          since: date,
          per_page: 100,
          page: pageNum
        });
  
        // If the API call returns an empty array, break out of loop- there is no additional data.
        // Else if data is returned, push it to `result` and increase the page number (`pageNum`)
        if(!contributors.data.length){
          break;      
        } else {
          result = result.concat(contributors.data);
          pageNum++;
        }
      }
  
      // Once we have looked at all pages and collected all the data, we create key-value pairs of recent contributors and store 
      // them in the `allContributorsSince` object. The contributor data that comes back from each API are stored differently,  
      // i.e. `author.login` vs `user.login` vs `assignee.login`. We want to extract the contributors' usernames for each situation.
      for(const contributorInfo of result){
        // Check if username is stored in `author.login`
        if(contributorInfo.author){
          allContributorsSince[contributorInfo.author.login] = true;
        }
        // Check for username in `user.login`, but skip `user.login` covered by 3rd API 
        else if(contributorInfo.user  && api != 'GET /repos/{owner}/{repo}/issues'){
          allContributorsSince[contributorInfo.user.login] = true;
        }
        // This check is done for `/issues` (3rd) API. Sometimes a user who created an issue is not the same as the 
        // assignee on that issue- we want to make sure that we count all assignees as active contributors as well.
        // We only want to run this check if the assignee is not counted as an active contributor yet.
        else if((contributorInfo.assignee) && (contributorInfo.assignee.login in allContributorsSince === false)){
          const issueNum = contributorInfo.number;
          const timeline = await getEventTimeline(issueNum);
          const assignee = contributorInfo.assignee.login;
          const responseObject = await isEventOutdated(date, timeline, assignee);
          // If timeline is not outdated, add member to `allContributorsSince`
          if(responseObject.result === false){
            allContributorsSince[assignee] = true;
          } 
          // If timeline is more than two months ago, and the issue title does not include 
          // the words "Pre-work Checklist", add to open issues with inactive comments
          else {
            if(date == twoMonthsAgo && !contributorInfo.title.includes("Pre-work Checklist")){
              inactiveWithOpenIssue[assignee] = issueNum;
            }
          }
        }
      }
    }
    // Add permanent members from 'website-maintain' to list of active contributors
    for(const permanentMember in permanentMembers){
      allContributorsSince[permanentMember] = true;
    }
    if(date == oneMonthAgo){
      allContributorsSinceOneMonthAgo = allContributorsSince;
    } else {
      allContributorsSinceTwoMonthsAgo = allContributorsSince;
    }
  }   
  return [allContributorsSinceOneMonthAgo, allContributorsSinceTwoMonthsAgo, inactiveWithOpenIssue]; 
}


/* 
 * Helper functions for fetchContributors()
 *
 *
 */
async function getEventTimeline(issueNum) {
  let timelineArray = []
  let page = 1
  while (true) {
    try {
      const results = await octokit.rest.issues.listEventsForTimeline({
        owner: org,
        repo: repo,
        issue_number: issueNum,
        per_page: 100,
        page: page,
      });
      if (results.data.length) {
        timelineArray = timelineArray.concat(results.data);
      } else {
        break
      }
    } catch (err) {
      console.log(err);
      continue
    }
    finally {
      page++
    }
  }
  return timelineArray
}


function isEventOutdated(date, timeline, assignee) {
  let lastAssignedTimestamp = null;
  for (let i = timeline.length - 1; i >= 0; i--) {
    let eventObj = timeline[i];
    let eventType = eventObj.event;
    let eventTimestamp = eventObj.updated_at || eventObj.created_at;

    // update the lastAssignedTimestamp if this is the last (most recent) time an assignee was assigned to the issue
    if (!lastAssignedTimestamp && eventType === 'assigned' && assignee === (eventObj.assignee.login)) {
      lastAssignedTimestamp = eventTimestamp;
    }
  }
  // If the assignee was assigned later than the 'date', the issue is not outdated so return false
  if (lastAssignedTimestamp && (lastAssignedTimestamp >= date)) {
    return { result: false };
  } 
  return { result: true };
}



/**
 * Function to return list of current team members
 * @param {String} team_slug - default to 'website-write' team
 * @returns {Array} allMembers - Current team members 
 */
async function fetchTeamMembers(fetchTeam){
    
  let pageNum = 1;
  let teamResults = [];

  // Fetch all members of team. Note: if total members exceed 100, we need to 'flip' pages 
  while(true){
    const teamMembers = await octokit.request('GET /orgs/{org}/teams/{team_slug}/members', {
      org: org,
      team_slug: fetchTeam,
      per_page: 100,
      page: pageNum
    })
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
 * @param {Object} currentTeamMembers - List of active team members
 * @param {Object} recentContributors - List of active contributors 
 * @returns {Array} removed members - List of members that were removed 
 */
async function removeInactiveMembers(currentTeamMembers, recentContributors, inactiveWithOpenIssue){
  const removedMembers = [];
  const cannotRemoveYet = {};
  
  // Loop over team members and remove them from the team if they are not in recentContributors
  for(const username in currentTeamMembers){
    if (!recentContributors[username]){
      // Prior to deletion, confirm that member is on the 'base' === 'website' team
      const baseMember = await octokit.request('GET /orgs/{org}/teams/{team_slug}/memberships/{username}', {
        org: org,
        team_slug: baseTeam,
        username: username,
      })
      // If response status is not 200, need to add member to 'base' team before deleting
      if(baseMember.status != 200){
        await octokit.request('PUT /orgs/{org}/teams/{team_slug}/memberships/{username}', {
          org: org,
          team_slug: baseTeam,
          username: username,
          role: 'member',
        })
        console.log('Member added to \'website\' team: ' + username);
      } 
      // Remove member from the team if they don't pass additional checks in `shouldRemoveOrNotify` function
      if(await shouldRemoveOrNotify(username)){
        // But if member has an open issue, don't remove
        if(username in inactiveWithOpenIssue){
          cannotRemoveYet[username] = inactiveWithOpenIssue[username];
        } else {
          await octokit.request('DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}', {
            org: org,
            team_slug: team,
            username: username,
          })
          removedMembers.push(username);
        }
      } 
    }
  }
  return [removedMembers, cannotRemoveYet];
}



/**
 * Function to check if a member is set for removal
 * @param {String} member - Member's username 
 * @returns {Boolean} - true/false 
 */
async function shouldRemoveOrNotify(member){
  
  // Get member's membership status: if member is a team 'Maintainer', return false- we don't remove maintainers
  const membershipStatus = await octokit.request('GET /orgs/{org}/teams/{team_slug}/memberships/{username}', {
    org: org,
    team_slug: team,
    username: member,
  })
  if(membershipStatus.data.role === 'maintainer'){
    console.log("This inactive member is a 'Maintainer': " + member);
    return false;
  }

  // Run check to see if member cloned the 'website' repo within the last 30 days. If so do not notify  
  // because they are new members. (This will not catch new members who did not name their repos 'website'.)
  try {
    const repoData = await octokit.request('GET /repos/{username}/{repo}', {
      username: member,
      repo: repo,
    });
    if(repoData.created_at > oneMonthAgo){ 
      return false;
    }
  } catch {}

  // Else this member is inactive and should be notified or removed from team
  return true;
}



/**
 * Function to return list of contributors that have been inactive since oneMonthAgo
 * @param {Array} updatedTeamMembers - List of updated team members
 * @param {Array} recentContributors - List of recent contributors
 * @returns {Array} - List of members to be notified (that they are on the list to be removed)
 */
async function notifyInactiveMembers(updatedTeamMembers, recentContributors){
  const notifiedMembers = [];
  
  // Loop over team members and add to "notify" list if they are not in recentContributors
  for(const username in updatedTeamMembers){
    if (!recentContributors[username]){
      // Check whether member should be added to notifiedMembers list
      if(await shouldRemoveOrNotify(username)){   
        notifiedMembers.push(username)
      }
    }
  }
  return notifiedMembers;
}



/**
 * Function to save inactive members list to local for use in next job  
 * @param {Array} removedContributors - List of removed contributors 
 * @param {Array} notifiedContributors - List of contributors to be notified 
 * @returns {void}
 */
function writeData(removedContributors, notifiedContributors){
  
  // Combine removed and notified contributor lists into one dict
  let inactiveMemberLists = {};
  inactiveMemberLists["removedContributors"] = removedContributors;
  inactiveMemberLists["notifiedContributors"] = notifiedContributors;
  
  fs.writeFile('inactive-Members.json', JSON.stringify(inactiveMemberLists, null, 2), (err) => {
    if (err) throw err;
    console.log('-------------------------------------------------------');
    console.log("File 'inactive-Members.json' saved successfully!");
   });
  
}
