// Import modules
const fs = require("fs");
const postComment = require('../../utils/post-issue-comment');
const formatComment = require('../../utils/format-comment');
const getTimeline = require('../../utils/get-timeline');

// Global variables
var github
var context
var assignee

var Emergent_Requests = "Emergent Requests";
var New_Issue_Approval = "New Issue Approval";
var Prioritized_Backlog = "Prioritized backlog";
var In_Progress = "In progress (actively working)";

var columnsId = new Map([
  [Emergent_Requests, 19403960],
  [New_Issue_Approval, 15235217],
  [Prioritized_Backlog, 7198257],
  [In_Progress, 7198228],
]);

const READY_FOR_DEV_LABEL = "ready for dev lead";


/**
 * @description - This function is the entry point into the javascript file, it formats the md file based on the result of the previous step and then posts it to the issue
 * @param {Object} g - GitHub object
 * @param {Object} c - context object
 * @param {Boolean} actionResult - the previous gh-action's result
 * @param {Number} issueNum - the number of the issue where the post will be made
 */
async function main({ g, c }, { shouldPost, issueNum }){
  try {
    github = g
    context = c
    // Get the lates assignee in case there are multiple assignees
    assignee = await getLatestAssignee();

    // If the previous action returns a false, stop here
    if(shouldPost === false){
      console.log('No need to post comment.');
      return;
    }

    const isAdminOrMerge = await memberOfAdminOrMergeTeam();
    const isAssignedToAnotherIssues = await assignedToAnotherIssue();

    // If assignee is not in Admin or Merge Teams
    // and assigned to other issues, do the following:
    if(!isAdminOrMerge && isAssignedToAnotherIssues) {
      // Create and post a comment using the template in this file
      const fileName = "multiple-issue-reminder.md";
      const filePath = './github-actions/trigger-issue/add-preliminary-comment/' + fileName;
      const unAssigningComment = createComment(filePath);
      await postComment(issueNum, unAssigningComment, github, context);
      
      await unassignIssue(); // Unassign the issue
      await addLabel(READY_FOR_DEV_LABEL); // Add 'ready for dev lead' label
      await moveToNewIssueApproval(); // Move the card to 'New Issue Approval' Column
    }
    // Otherwise, post the normal comment
    else {
      const instructions = await makeComment();
      if(instructions !== null){
        // the actual creation of the comment in github
        await postComment(issueNum, instructions, github, context);
        console.log(instructions);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

/**
 * @description - This function makes the comment with the issue assignee's GitHub handle using the raw preliminary.md file
 * @returns {string} - Comment to be posted with the issue assignee's name in it!!!
 */
async function makeComment(){
  try {
    // Get column name
    const columnName = await getColumnName();

    const isPrework = context.payload.issue.labels.find((label) => label.name == 'Complexity: Prework') ? true : false;
    const isDraft = context.payload.issue.labels.find((label) => label.name == 'Draft') ? true : false;

    let filename = 'preliminary-update.md';

    if (columnName == 'New Issue Approval' && !isDraft && !isPrework) {
      // If author = assignee, remind them to add draft label, otherwise unnasign and comment
      if (context.payload.issue.user.login == issueAsasignee) {
        filename = 'draft-label-reminder.md';
      } else {
        filename = 'unassign-from-NIA.md';

        // Unassign the issue
        await unassignIssue();
      }
    }

    const filePath = './github-actions/trigger-issue/add-preliminary-comment/' + filename;

    const comment = createComment(filePath);  
    return comment;
  } catch (error) {
    console.log(error);
  }
}

/**
 * @description - This function Check if assignee is in the Admin or Merge Team
 * @returns {Boolean} - return true if assignee is member of Admin/Merge team, false otherwise
 */
async function memberOfAdminOrMergeTeam() {
  try {
    // Get all members in Admin Team
    const websiteAdminsMembers = (await github.rest.teams.listMembersInOrg({
      team_slug: "website-admins",
      org: context.repo.owner
    })).data.map(member => member.login);
  
    // Get all members in Merge Team
    const websiteMergeMembers = (await github.rest.teams.listMembersInOrg({
      team_slug: "website-merge",
      org: context.repo.owner
    })).data.map(member => member.login);
  
    // Return true if assignee is a member of the Admin or Merge Teams
    return (websiteAdminsMembers.includes(assignee) || websiteMergeMembers.includes(assignee));
  } catch (error) {
    console.log(error);
  }
}

/**
 * @description - Check whether developer is assigned to another issue
 * @returns {Boolean} - return true if assignee is assinged to another issue/s
 */
async function assignedToAnotherIssue() {
  try {
    let issues = (await github.rest.issues.listForRepo({
      owner: context.repo.owner,
      repo: context.repo.repo,
      assignee: assignee,
      state: "open", // Only fetch opened issues
    })).data;
  
    // Get all cards in 'Emergent Request' Column
    const emergentRequestCards = await getAllCardsInColumn(columnsId.get(Emergent_Requests));
  
    // Get all cards in 'New Issue Approval' Column
    const newIssueApprovalCards = await getAllCardsInColumn(columnsId.get(New_Issue_Approval));
  
    // Exclude any issue that apply the conditions below
    issues = issues.filter(issue => {
      // Check is it's an agendas issue
      const isAgendaIssue = issue.labels.some(label => label.name === "feature: agenda");
      
      // Check if it's a prework issue
      const isPreWork = issue.labels.some(label => label.name === "Complexity: Prework");
      
      // Check if it's exists in Emergent Request Column
      const inEmergentRequestColumn = emergentRequestCards.some(card => card.content_url === issue.url);
  
      // Check if it's exists in New Issue Approval Column
      const inNewIssueApprovalColumn = newIssueApprovalCards.some(card => card.content_url === issue.url);
  
      // If any of these conditions applied, exclude the issue
      return !(isAgendaIssue || isPreWork || inEmergentRequestColumn || inNewIssueApprovalColumn);
    });
  
    // After excluding above issues and assignee still assigned to another issue/s, return true 
    return issues.length > 1;
  } catch (error) {
    console.log(error);
  }
}

/**
 * @description - Unassign assignee from the issue
 */
async function unassignIssue() {
  try {
    await github.rest.issues.removeAssignees({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.payload.issue.number,
      assignees: [assignee],
    });
  } catch (error) {
    console.log(error);
  }
}

/**
 * @description - Create a comment using the template of the file in 'filePath'
 * @param {String} filePath - file path for the used template
 * @returns {String} - return fromatted comment
 */
function createComment(filePath) {
  try {
    const commentObject = {
      replacementString: assignee,
      placeholderString: '${assignee}',
      filePathToFormat: filePath,
      textToFormat: null
    }

    // Fromat the comment and return it back
    const fromattedComment = formatComment(commentObject, fs);
    return fromattedComment;
  } catch (error) {
    
  }
}

/**
 * @description - Add 'ready for dev lead' label to the issue
 * @param {String} labelName - Name of the label to add
 */
async function addLabel(labelName) {
  try {  
    await github.rest.issues.addLabels({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.payload.issue.number,
      labels: [labelName],
    });
  } catch (error) {
    console.log(error);
  }
}

/**
 * @description - Get latest assignee, in case there were multimple assignee to the issue
 * @returns {String} - return the username of the latest assignee
 */
async function getLatestAssignee() {
  try {
    let issueAssignee = context.payload.issue.assignee.login;

    const eventdescriptions = await getTimeline(context.payload.issue.number, github, context);
    
    // Adding the code to find out the latest person assigned the issue
    for(var i = eventdescriptions.length - 1 ; i>=0; i-=1){
      if(eventdescriptions[i].event == 'assigned'){
        issueAssignee = eventdescriptions[i].assignee.login
        break
      }
    }

    return issueAssignee;
  } catch (error) {
    console.log(error);
  }
}

/**
 * @description - Move the card to 'New Approval Issues' Column
 */
async function moveToNewIssueApproval() {
  try {
    const issueNum = context.payload.issue.number;

    // Get column name assiged with the issue
    const columnName = await getColumnName();

    // Get all cards in this column using column id
    const cards = await getAllCardsInColumn(columnsId.get(columnName));

    // Get the issue's card
    const card = cards.find(card => card.content_url && card.content_url.includes(`/issues/${issueNum}`));

    // Move the card to 'New Issue Approval' Column
    await github.rest.projects.moveCard({
      card_id: card.id,
      position: "top",
      column_id: columnsId.get(New_Issue_Approval),
    });
  } catch (error) {
    console.log(error);
  }
}

/**
 * @description - Getting the issue's Project Board column name using graphql
 * @returns {String} - Column Name
 */
async function getColumnName() {
  try {
    // GraphQL query to fetch issue's column name
    const queryColumn = `query($owner:String!, $name:String!, $number:Int!) {
      repository(owner:$owner, name:$name) {
        issue(number:$number) {
          projectCards { nodes { column { name } } }
        }
      }
    }`;
    
    // Variables to be passed to the GraphQL query
    const variables = {
      owner: context.repo.owner,
      name: context.repo.repo,
      number: context.payload.issue.number
    };
    
    // Making the GraphQL request to get column name
    const response = await github.graphql(queryColumn, variables);
    const columnName = response.repository.issue.projectCards.nodes[0].column.name;
    
    // Return column name
    return columnName;
  } catch (error) {
    console.log(error);
  }
}

/**
 * @description - Fetch all cards inside issue's column
 * @param {Number} columnId - The id for the issue's column
 * @returns {Object[]} - Array of card objects
 */
async function getAllCardsInColumn(columnId) {
  let allCards = [];
  let page = 1;
  const perPage = 100; // Maximum number of cards per page

  try {
    // Using pagination since max number of cards to fetch per request is only 100
    while (true) {
      const cards = (await github.rest.projects.listCards({
        column_id: columnId,
        page: page,
        per_page: perPage,
      })).data;

      allCards = allCards.concat(cards);

      // Berak if there are no more cards
      if (cards.length < perPage) {
        break;
      }

      // Go to next page
      page++;
    }

    return allCards;
  } catch (error) {
    console.log(error);
  }
}
 
module.exports = main
