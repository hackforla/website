// Import modules
const fs = require('fs');
const getTeamMembers = require('../../utils/get-team-members');
const addTeamMember = require('../../utils/add-team-member');

// Global variables
var github;
var context;

// Set variables to avoid hard-coding
const org = 'hackforla';
const repo = 'website';
const baseTeam = 'website';
const writeTeam = 'website-write';
const mergeTeam = 'website-merge';
// const adminTeam = 'website-admins';   <-- Not used currently



/**
 * Main function
 * @param {Object} g        - github object from actions/github-script
 * @param {Object} c        - context object from actions/github-script
 * @param {Object} results  - results from `get-contributors-data.js`
 */
async function main({ g, c }, results) {
  github = g;
  context = c;

  const recentContributors = results["recentContributors"];                                 // recentContributors since the dates[0] = recent cutoff
  const previousContributors = results["previousContributors"];                             // previousContributors since the dates[1] = previous cutoff
  const inactiveWithOpenIssue = results["inactiveWithOpenIssue"];                           // Inactive contributors that have open issues
  const dates = results["dates"];                                                           // [recent, previous] dates of oneMonthAgo, twoMonthsAgo
  
  const currentTeamMembers = await getTeamMembers(github, context, writeTeam);
  console.log('-------------------------------------------------------');
  console.log('Current members of ' + writeTeam + ':');
  console.log(currentTeamMembers);

  const [removedContributors, cannotRemoveYet] = await removeInactiveMembers(previousContributors, inactiveWithOpenIssue);
  console.log('-------------------------------------------------------');
  console.log('Removed members from ' + writeTeam + ' inactive since ' + dates[1].slice(0, 10) + ':');
  console.log(removedContributors);

  console.log('-------------------------------------------------------');
  console.log('Members inactive since ' + dates[1].slice(0, 10) + ' with open issues preventing removal:');
  console.log(cannotRemoveYet);

  // Repeat getTeamMembers() after removedContributors to compare with recentContributors
  const updatedTeamMembers = await getTeamMembers(github, context, writeTeam);
  const notifiedContributors = await notifyInactiveMembers(updatedTeamMembers, recentContributors);
  console.log('-------------------------------------------------------');
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
async function removeInactiveMembers(previousContributors, inactiveWithOpenIssue){
  const removedMembers = [];
  const cannotRemoveYet = {};
  const previouslyNotified = await readPreviousNotifyList();
  const currentTeamMembers = await getTeamMembers(github, context, writeTeam);
  
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
          await github.request('DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}', {
            org: org,
            team_slug: team,
            username: username,
          });
        }
        removedMembers.push(username);
        // After removal, close member's "Pre-work checklist" if open
        if(username in inactiveWithOpenIssue && inactiveWithOpenIssue[username][1] === true){
          closePrework(username, inactiveWithOpenIssue[username][0]);
        }
      }
    }
  }
  return [removedMembers, cannotRemoveYet];
}



/**
 * Function to close a just-removed inactive member's "Pre-work checklist", if open, and add a comment
 * @param {String} member        - name of member whose "Pre-work checklist" will be closed
 * @param {Number} issueNum      - number of member's "Pre-work checklist"
 */
async function closePrework(member, issueNum){ 
  // Close the assignee's "Pre-work Checklist" and add comment
  await github.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
    owner: org,
    repo: repo,
    issue_number: issueNum,
    state: 'closed'
  });
  console.log('Closing "Pre-work Checklist" issue number ' + issueNum + ' for ' + member);
  // Add comment to issue
  await github.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
    owner: org,
    repo: repo,
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
 * Function to confirm that the member did not recently clone HfLA repo and thus is not new: otherwise they are new
 * @param {String} member       - Member's username 
 * @returns {Boolean}           - True if member is not new, False if member is new
 */
async function checkMemberIsNotNew(member){
  // Check if member cloned the HfLA repo within the last 30 days. If so, they are new members and they
  // may not have had time yet to get set up. Check the user's 10 most recent repos and see if any match 
  // "description":"Hack for LA's Website": if so then, check if "created_at" is less than 30 days.
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
 * @params {}                             - none
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
 * Function to save inactive members list to local for use in next job  
 * @param {Array} removedContributors  - List of contributors that were removed
 * @param {Array} notifiedContributors - List of contributors to be notified
 * @param {Array} cannotRemoveYet      - List of contributors that can't be removed yet
 * @returns {void}
 */
function writeData(removedContributors, notifiedContributors, cannotRemoveYet){
  
  // Combine removed, notified, and cannot remove contributor lists into one dict
  let inactiveMemberLists = {};
  inactiveMemberLists["removedContributors"] = removedContributors;
  inactiveMemberLists["notifiedContributors"] = notifiedContributors;
  inactiveMemberLists["cannotRemoveYet"] = cannotRemoveYet;

  const filepath = 'github-actions/utils/_data/inactive-members.json';
  fs.writeFile(filepath, JSON.stringify(inactiveMemberLists, null, 2), (err) => {
    if (err) throw err;
    console.log('-------------------------------------------------------');
    console.log("File 'inactive-members.json' saved successfully!");
   });
}

module.exports = main;
