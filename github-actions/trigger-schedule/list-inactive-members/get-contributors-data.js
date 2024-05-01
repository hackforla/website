// Import modules
const getTimeline = require('../../utils/get-timeline');
const getTeamMembers = require('../../utils/get-team-members');

// Global variables
var github;
var context;

const maintTeam = 'website-maintain';
const botMembers = ['elizabethhonest', 'hfla-website-checklist', 'HackforLABot'];

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
let dates = [oneMonthAgo, twoMonthsAgo];



/**
 * Main function
 * @param {Object} g         - github object from actions/github-script
 * @param {Object} c         - context object from actions/github-script
 * @return {Object} results  - object to use in `trim-inactive-members.js`
 */
async function main({ g, c }) {
  github = g;
  context = c;

  const [contributorsOneMonthAgo, contributorsTwoMonthsAgo, inactiveWithOpenIssue] = await fetchContributors(dates);
  console.log('-------------------------------------------------------');
  console.log('List of active contributors since ' + dates[0].slice(0, 10) + ':');
  console.log(contributorsOneMonthAgo);

  return {
    recentContributors: contributorsOneMonthAgo,
    previousContributors: contributorsTwoMonthsAgo,
    inactiveWithOpenIssue: inactiveWithOpenIssue,
    dates: dates,
  }; 
};



/**
 * Function to fetch list of contributors with comments/commits/issues since date
 * @returns {Object} allContributorsSinceOneMonthAgo  - List of active contributors since oneMonthAgo 
 * @returns {Object} allContributorsSinceTwoMonthsAgo - List of active contributors since twoMonthsAgo 
 */
async function fetchContributors(dates){
  let allContributorsSinceOneMonthAgo = {};
  let allContributorsSinceTwoMonthsAgo = {};
  let inactiveWithOpenIssue = {};

  // Members of 'website-maintain' team are considered permanent members
  const permanentMembers = await getTeamMembers(github, context, maintTeam);

  // Fetch all contributors with commit, comment, and issue (assignee) contributions
  const APIs = [
    'GET /repos/{owner}/{repo}/commits',                  // Gets list of member commits for dates
    'GET /repos/{owner}/{repo}/issues/comments',          // Gets list of member comments for dates
    'GET /repos/{owner}/{repo}/issues'                    // Gets list of member assignments for dates
  ];

  for (const date of dates){
    const allContributorsSince = {};
    for(const api of APIs){
      let pageNum = 1;
      let result = [];

      // Since Github only allows to fetch max 100 items per request, we need to 'flip' pages
      while(true){
        // Fetch 100 items per each page (`pageNum`)
        const contributors = await github.request(api, {
          owner: context.repo.owner,
          repo: context.repo.repo,
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
          const timeline = await getTimeline(issueNum, github, context);
          const assignee = contributorInfo.assignee.login;
          const responseObject = await isEventOutdated(date, timeline, assignee);
          // If timeline is not outdated, add member to `allContributorsSince`
          if(responseObject.result === false){
            allContributorsSince[assignee] = true;
          } 
          // If timeline is more than two months ago, add to open issues with inactive 
          // comments with flag = true if issue is "Pre-work Checklist", false otherwise
          else if(date === dates[1]){
            if(contributorInfo.title.includes("Pre-work Checklist")){
              inactiveWithOpenIssue[assignee] = [issueNum, true];
            } else {
              inactiveWithOpenIssue[assignee] = [issueNum, false];
            }
          }
        }
      }
    }
    // Add permanent members from 'website-maintain' team to list of active contributors
    for(let permanentMember in permanentMembers){
      allContributorsSince[permanentMember] = true;
    }
    // Add members of botMembers team to list of active contributors
    for(let i = 0; i < botMembers.length; i++){
      allContributorsSince[botMembers[i]] = true;
    }
    
    if(date === dates[0]){
      allContributorsSinceOneMonthAgo = allContributorsSince;
    } else {
      allContributorsSinceTwoMonthsAgo = allContributorsSince;
    }
  }   
  return [allContributorsSinceOneMonthAgo, allContributorsSinceTwoMonthsAgo, inactiveWithOpenIssue]; 
}



/**
 * Helper function for fetchContributors()
 * @param {String} date          - date: oneMonthAgo, twoMonthsAgo
 * @param {Object} timeline      - object issue event timeline
 * @param (String} assignee      - member assigned to issue
 * @returns {Boolean} true/false - whether event occurred after date
 */
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

module.exports = main;
