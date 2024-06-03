var fs = require("fs")
const postComment = require('../../utils/post-issue-comment')
const formatComment = require('../../utils/format-comment')
const getTimeline = require('../../utils/get-timeline');

// Global variables
var github
var context
var assignee

/**
 * @description - This function is the entry point into the javascript file, it formats the md file based on the result of the previous step and then posts it to the issue
 * @param {Object} g - github object  
 * @param {Object} c - context object 
 * @param {Boolean} actionResult - the previous gh-action's result
 * @param {Number} issueNum - the number of the issue where the post will be made 
 */

async function main({ g, c }, { shouldPost, issueNum }){
  github = g
  context = c
  assignee = context.actor

  console.log(assignee)

  // If the previous action returns a false, stop here
  if(shouldPost === false){
    console.log('No need to post comment.')
    return
  }
  //Else we make the comment with the issuecreator's github handle instead of the placeholder.
  else{
    const instructions = await makeComment()
    if(instructions !== null){
      // the actual creation of the comment in github
      await postComment(issueNum, instructions, github, context)
    }
  }

  const isAdminOrMerge = await assigneeeInAdminOrMergeTeam();
  const isAssignedToAnotherIssues = await assigneeeInAdminOrMergeTeam();

  console.log(isAdminOrMerge, isAssignedToAnotherIssues);
}

/**
 * @description - This function makes the comment with the issue assignee's github handle using the raw preliminary.md file
 * @returns {string} - Comment to be posted with the issue assignee's name in it!!!
 */

async function makeComment(){
  // Setting all the variables which formatComment is to be called with
  let issueAssignee = context.payload.issue.assignee.login
  let filename = 'preliminary-update.md';
  const eventdescriptions = await getTimeline(context.payload.issue.number, github, context)

  //adding the code to find out the latest person assigned the issue
  for(var i = eventdescriptions.length - 1 ; i>=0; i-=1){
    if(eventdescriptions[i].event == 'assigned'){
      issueAssignee = eventdescriptions[i].assignee.login
      break
    }
  }

  // Getting the issue's Project Board column name
  const queryColumn = `query($owner:String!, $name:String!, $number:Int!) {
    repository(owner:$owner, name:$name) {
      issue(number:$number) {
        projectCards { nodes { column { name } } }
      }
    }
  }`;
  const variables = {
    owner: context.repo.owner,
    name: context.repo.repo,
    number: context.payload.issue.number
  };
  const resColumn = await github.graphql(queryColumn, variables);
  const columnName = resColumn.repository.issue.projectCards.nodes[0].column.name;
  const isPrework = context.payload.issue.labels.find((label) => label.name == 'Complexity: Prework') ? true : false;
  const isDraft = context.payload.issue.labels.find((label) => label.name == 'Draft') ? true : false;

  if (columnName == 'New Issue Approval' && !isDraft && !isPrework) {
    // If author = assignee, remind them to add draft label, otherwise unnasign and comment
    if (context.payload.issue.user.login == issueAssignee) {
      filename = 'draft-label-reminder.md';
    } else {
      filename = 'unassign-from-NIA.md';

      await github.rest.issues.removeAssignees({
        owner: variables.owner,
        repo: variables.name,
        issue_number: variables.number,
        assignees: [issueAssignee],
      });
    }
  }

  let filePathToFormat = './github-actions/trigger-issue/add-preliminary-comment/' + filename;
  const commentObject = {
    replacementString: issueAssignee,
    placeholderString: '${issueAssignee}',
    filePathToFormat: filePathToFormat,
    textToFormat: null
  }

  // creating the comment with issue assignee's name and returning it!
  const commentWithIssueAssignee = formatComment(commentObject, fs)
  return commentWithIssueAssignee
}




// Check if assignee is in the Admin or Merge Team
async function assigneeeInAdminOrMergeTeam() {
  try {

    // Get the list of members in Admin Team
    const websiteAdminsMembers = (await github.rest.teams.listMembersInOrg({
      team_slug: "website-merge",
      org: "hackforla"
    })).data.map(member => member.login);
  
    // Get the list of members in Merge Team
    const websiteMergeMembers = (await github.rest.teams.listMembersInOrg({
      team_slug: "website-merge",
      org: "hackforla"
    })).data.map(member => member.login);
  
    // Return true if assignee is a member of the Admin or Merge Teams
    if(websiteAdminsMembers.includes(assignee) || websiteMergeMembers.includes(assignee))
      return true;

    // Otherwise return false
    return false;

  } catch (error) {
    console.log(error);
  }
}

// Check whether developer is assigned to another issue
async function assignedToAnotherIssue() {
  let issues = (await github.rest.issues.listForRepo({
    owner: "hackforla",
    repo: "website",
    assignee: assignee,
    state: "open",
  })).data;

  issues.map(issue => { console.log(issue.html_url) });
  console.log(issues.length);
  console.log("----------------------------------------------");

  // Get all cards in Emergent Request Column
  const emergentRequestCards = (await github.rest.projects.listCards({
      column_id: 19403960 //Emergent Request Column Id
  })).data.map(card => card.content_url);

  // Get all cards in New Issue Approval Column
  const newIssueApprovalCards = (await github.rest.projects.listCards({
      column_id: 15235217 //New Issue Approval Column Id
  })).data.map(card => card.content_url);

  let diffs = [];
  // Exclude other issues
  issues = issues.filter(issue => {
    // Check is it's an agendas issue
    const isAgendaIssue = issue.labels.some(label => label.name === "feature: agenda");
    
    // Check if it's a prework issue
    const isPreWork = issue.labels.some(label => label.name === "Complexity: Prework");
    
    // Check if it's exists in Emergent Request Column
    const inEmergentRequestColumn = emergentRequestCards.includes(issue.url);

    // Check if it's exists in New Issue Approval Column
    const inNewIssueApprovalColumn = newIssueApprovalCards.includes(issue.url);

    if(isAgendaIssue || isPreWork || inEmergentRequestColumn || inNewIssueApprovalColumn)
      diffs.push(issue);

    // If any of the above conditions applied, exclude the issue
    return !(isAgendaIssue || isPreWork || inEmergentRequestColumn || inNewIssueApprovalColumn);
  });

  issues.map(issue => {console.log(issue.html_url)});
  console.log(issues.length);

  console.log("----------------------------------------------");

  diffs.map(issue => {console.log(issue.html_url)});
  console.log(diffs.length);

  return issues.length !== 1;
}
  
module.exports = main
