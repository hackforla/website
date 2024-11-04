// Import modules
const fs = require('fs');
const getTeamMembers = require('../../utils/get-team-members');
const addTeamMember = require('../../utils/add-team-member');

// Global variables
var github;
var context;

const baseTeam = 'website';
const writeTeam = 'website-write';
const mergeTeam = 'website-merge';



/**
 * Takes results of `get-contributors-data.js` for finding all contributors active in the periods since the dates
 * of oneMonthAgo and twoMonthsAgo. Team members with no activity are removed as 'Inactive', with activity within 
 * twoMonthsAgo but not oneMonthAgo are notified, and with activity within the last month are 'Active'
 * @param {Object} g                     - github object from actions/github-script
 * @param {Object} c                     - context object from actions/github-script
 * @param {Object} recentContributors    - recentContributors since the dates[0] = recent cutoff
 * @param {Object} previousContributors  - previousContributors since the dates[1] = previous cutoff
 * @param {Object} inactiveWithOpenIssue - Inactive contributors that have open issues
 * @param {Object} dates                 - [recent, previous] dates of oneMonthAgo, twoMonthsAgo
 */
async function main({ g, c }, { recentContributors, previousContributors, inactiveWithOpenIssue, dates }) {
  github = g;
  context = c;
  
  const currentTeamMembers = await getTeamMembers(github, context, writeTeam);
  console.log(`-`.repeat(60));
  console.log('Current members of ' + writeTeam + ':');
  console.log(currentTeamMembers);

  const [removedContributors, cannotRemoveYet] = await removeInactiveMembers(previousContributors, inactiveWithOpenIssue, currentTeamMembers);
  console.log(`-`.repeat(60));
  console.log('Removed members from ' + writeTeam + ' inactive since ' + dates[1].slice(0, 10) + ':');
  console.log(removedContributors);

  console.log(`-`.repeat(60));
  console.log('Members inactive since ' + dates[1].slice(0, 10) + ' with open issues preventing removal:');
  console.log(cannotRemoveYet);

  // Repeat getTeamMembers() after removedContributors to compare with recentContributors
  const updatedTeamMembers = await getTeamMembers(github, context, writeTeam);
  const notifiedContributors = await notifyInactiveMembers(updatedTeamMembers, recentContributors);
  console.log(`-`.repeat(60));
  console.log('Notified members from ' + writeTeam + ' inactive since ' + dates[0].slice(0, 10) + ':');
  console.log(notifiedContributors);

  writeData(removedContributors, notifiedContributors, cannotRemoveYet);
};



/**
 * Remove contributors that were last active **before** the previous (twoMonthsAgo) date
 * @param {Object} previousContributors   - List of contributors active since previous date
 * @param {Object} inactiveWithOpenIssue  - Inactive members with open issues
 * @returns {Array} removedMembers        - List of members that were removed 
 * @returns {Object} cannotRemoveYet      - List of members that cannot be removed due to open issues
 */
async function removeInactiveMembers(previousContributors, inactiveWithOpenIssue, currentTeamMembers){
  const removedMembers = [];
  const cannotRemoveYet = {};
  const previouslyNotified = await readPreviousNotifyList();
  
  // Loop over team members and remove them from the team if they are not in previousContributors list
  for(const username in currentTeamMembers){
    if (!previousContributors[username]){
      // Prior to deletion, confirm that member is on the baseTeam
      await addTeamMember(github, context, baseTeam, username);
      // But if member has an open issue or was not on the previouslyNotified list, do not remove yet
      if(username in inactiveWithOpenIssue && inactiveWithOpenIssue[username][1] === false){
        cannotRemoveYet[username] = inactiveWithOpenIssue[username][0];
      } else if((previouslyNotified.length > 0) && !(previouslyNotified.includes(username))){
        console.log('Member was not on last month\'s \'Inactive Members\' list, do not remove: ' + username);
      } else {
        // Remove member from all teams (except baseTeam)
        const teams = [writeTeam, mergeTeam];
        for(const team of teams){
          // https://docs.github.com/en/rest/teams/members?apiVersion=2022-11-28#remove-team-membership-for-a-user
          await github.request('DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}', {
            org: context.repo.owner,
            team_slug: team,
            username: username,
          });
        }
        removedMembers.push(username);
        // After removal, close member's "Skills Issue", if open
        if(username in inactiveWithOpenIssue && inactiveWithOpenIssue[username][1] === true){
          closePrework(username, inactiveWithOpenIssue[username][0]);
        }
      }
    }
  }
  return [removedMembers, cannotRemoveYet];
}



/**
 * Function to close a just-removed inactive member's "Skills Issue", if open, and add a comment
 * @param {String} member        - name of member whose "Skills Issue" will be closed
 * @param {Number} issueNum      - number of member's "Skills Issue"
 */
async function closePrework(member, issueNum){ 
  // https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#update-an-issue
  await github.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNum,
    state: 'closed'
  });
  console.log(`Closing "Skills Issue" issue number ${issueNum} for ${member}`);
  // https://docs.github.com/en/rest/issues/comments?apiVersion=2022-11-28#create-an-issue-comment
  await github.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNum,
    body: 'The Hack for LA Bot has closed this issue due to member inactivity.'
  });
}


/**
 * Returns list of contributors that were not removed for inactivity, but who were last active **before** recent date
 * @param {Array} updatedTeamMembers - List of updated team members
 * @param {Array} recentContributors - List of contributors active since recent date (since OneMonthAgo)
 * @returns {Array} notifiedMembers  - List of members to be notified (that they are on the list to be removed)
 */
async function notifyInactiveMembers(updatedTeamMembers, recentContributors){
  const notifiedMembers = [];
  
  // Loop over team members and add to notifiedMembers list if they are not in recentContributors
  for(const username in updatedTeamMembers){
    if (!recentContributors[username]){
      // Check whether member should be added to notifiedMembers list
      if(await checkMemberIsNotNew(username)){   
        notifiedMembers.push(username)
      }
    }
  }
  return notifiedMembers;
}



/**
 * Function to check if any of a member's 10 most recent repos match "description":"Hack for LA's Website" with "created_at" less
 * than 30 days. If so, they are new members and should be excluded from removal or notification since they might be setting up still
 * @param {String} member       - Member's username 
 * @returns {Boolean}           - True if member is not new, False if member is new
 */
async function checkMemberIsNotNew(member){

  try {
    const memberRepoResults = await github.request('GET /users/{username}/repos', {
      username: member,
      direction: 'asc',
      sort: 'created',
      per_page: 10,
    });
    for(const memberRepo of memberRepoResults.data){
      if(memberRepo.description === "Hack for LA's website" && memberRepo.created_at > dates[0]){
        console.log("Member created organization repo within last month: " + member);
        return false;
      }
    }
  } catch {}

  // Else this member is not new and should be notified or removed from team as appropriate
  return true;
}



/**
 * Function to find the previous month's "Review Inactive Team Members" issue and extract the raw notified members list
 * @returns {Array} notifiedMembers       - list of notified members from prev. month
 */
 async function readPreviousNotifyList(){

   try {
     // Retrieve previous month's inactive member list 
     const filepath = 'github-actions/utils/_data/inactive-members.json';
     const rawData = fs.readFileSync(filepath, 'utf8');
     const parsedData = JSON.parse(rawData);
     const notifiedMembers = parsedData['notifiedContributors'];

     return notifiedMembers;  

   } catch (err) {
     throw new Error(err);
   }
}



/**
 * Function to save inactive members list to local repo for use in next job  
 * @param {Array} removedContributors  - List of contributors that were removed
 * @param {Array} notifiedContributors - List of contributors to be notified
 * @param {Array} cannotRemoveYet      - List of contributors that can't be removed yet
 */
function writeData(removedContributors, notifiedContributors, cannotRemoveYet){
  
  const filepath = 'github-actions/utils/_data/inactive-members.json';
  const inactiveMemberLists = { removedContributors, notifiedContributors, cannotRemoveYet };

  fs.writeFile(filepath, JSON.stringify(inactiveMemberLists, null, 2), (err) => {
    if (err) throw err;
    console.log(`-`.repeat(60));
    console.log("File `inactive-members.json` saved successfully!");
   });
}

module.exports = main;
