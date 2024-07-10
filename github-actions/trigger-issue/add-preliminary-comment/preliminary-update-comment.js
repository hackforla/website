// Import modules
const fs = require("fs");
const postComment = require('../../utils/post-issue-comment');
const formatComment = require('../../utils/format-comment');
const getTimeline = require('../../utils/get-timeline');
const getTeamMembers = require('../../utils/get-team-members');

// Global variables
let github;
let context;
let assignee;

const PROJECT_ID = "PVT_kwHOAfZet84AkAVr";

// The field containing all statuses
const STATUS_FIELD_ID = "PVTSSF_lAHOAfZet84AkAVrzgcR5Tc";

const Emergent_Requests = "Emergent Requests";
const New_Issue_Approval = "New Issue Approval";
const Prioritized_Backlog = "Prioritized backlog";
const In_Progress = "In progress (actively working)";

const statusesValues = new Map([
  [Emergent_Requests, "d468e876"],
  [New_Issue_Approval, "83187325"],
  [Prioritized_Backlog, "434304a8"],
  [In_Progress, "9a878e9c"],
]);

const READY_FOR_DEV_LABEL = "ready for dev lead";

/**
 * @description This function is the entry point into the JavaScript file. It formats the
 * markdown file based on the result of the previous step, checks if the developer is allowed
 * to be assigned to this issue, and performs the following actions:
 * - If the developer is not allowed, posts an "unassigned" comment, unassigns the developer,
 *   and updates the item status.
 * - Posts the formatted markdown to the issue.
 * @param {Object} g - GitHub object
 * @param {Object} c - Context object
 * @param {Boolean} shouldPost - The previous GitHub action's result
 * @param {Number} issueNum - The number of the issue where the post will be made
 */
async function main({ g, c }, { shouldPost, issueNum }) {
  try {
    github = g;
    context = c;
    // Get the lates developer in case there are multiple assignees
    assignee = await getLatestAssignee();
    
    // If the previous action returns false, stop here
    // if(shouldPost === false)
    //   return;

    // Check if developer is allowed to work on this issue
    const isAdminOrMerge = await memberOfAdminOrMergeTeam();
    const isAssignedToAnotherIssues = await assignedToAnotherIssue();

    // If developer is not in Admin or Merge Teams
    // and assigned to another issue/s, do the following:
    if(!isAdminOrMerge && isAssignedToAnotherIssues) {

      // Create and post a comment using the template in this file
      const fileName = "multiple-issue-reminder.md";
      const filePath = './github-actions/trigger-issue/add-preliminary-comment/' + fileName;
      const unAssigningComment = createComment(filePath);
      await postComment(issueNum, unAssigningComment, github, context);
      
      await unAssignDev(); // Unassign the developer
      await addLabel(READY_FOR_DEV_LABEL); // Add 'ready for dev lead' label
      
      // Update item status to "New Issue Approval"
      const item = await getItemInfo();
      await updateItemStatus(item.id, statusesValues.get(New_Issue_Approval));
    }
    // Otherwise, post the normal comment
    else {
      const instructions = await makeComment();
      if(instructions !== null){
        // the actual creation of the comment in github
        await postComment(issueNum, instructions, github, context);

        // Update item status to "In progress (actively working)"
        const item = await getItemInfo();
        await updateItemStatus(item.id, statusesValues.get(In_Progress));
      }
    }
  } catch (error) {
    console.log(error);
  }
}

/**
 * @description - This function makes the comment with the issue developer's GitHub handle using the raw preliminary.md file
 * @returns {string} - Comment to be posted with the issue developer's name in it!!!
 */
async function makeComment(){
  try {
    // Get status name
    const statusName = (await getItemInfo()).statusName;

    const isPrework = context.payload.issue.labels.find((label) => label.name == 'Complexity: Prework') ? true : false;
    const isDraft = context.payload.issue.labels.find((label) => label.name == 'Draft') ? true : false;

    let filename = 'preliminary-update.md';

    if (statusName == New_Issue_Approval && !isDraft && !isPrework) {
      // If author = developer, remind them to add draft label, otherwise unnasign and comment
      if (context.payload.issue.user.login == assignee) {
        filename = 'draft-label-reminder.md';
      } else {
        filename = 'unassign-from-NIA.md';

        // Unassign the developer
        await unAssignDev();
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
 * @description - This function Check if developer is in the Admin or Merge Team
 * @returns {Boolean} - return true if developer is member of Admin/Merge team, false otherwise
 */
async function memberOfAdminOrMergeTeam() {
  try {
    // Get all members in Admin Team
    const websiteAdminsMembers = await getTeamMembers(github, context, "website-admins");
  
    // Get all members in Merge Team
    const websiteMergeMembers = await getTeamMembers(github, context, "website-merge");
  
    // Return true if developer is a member of the Admin or Merge Teams
    return (assignee in websiteAdminsMembers || assignee in websiteMergeMembers);
  } catch (error) {
    console.log("Error getting membership status: ", error);
  }
}

/**
 * @description - Check whether developer is assigned to another issue
 * @returns {Boolean} - return true if developer is assinged to another issue/s
 */
async function assignedToAnotherIssue() {
  try {
    const issues = (await github.rest.issues.listForRepo({
      owner: "moazDev1",
      repo: "website",
      assignee: assignee,
      state: "open", // Only fetch opened issues
    })).data;

    const otherIssues = [];

    for(const issue of issues) {
      // Check is it's an "Agenda" issue
      const isAgendaIssue = issue.labels.some(label => label.name === "feature: agenda");

      // Check if it's a "Prework" issue
      const isPreWork = issue.labels.some(label => label.name === "Complexity: Prework");

      // Check if it exists in "Emergent Request" Status
      const inEmergentRequestStatus = (await getItemInfo()).statusName === Emergent_Requests;
    
      // Check if it exists in "New Issue Approval" Status
      const inNewIssueApprovalStatus = (await getItemInfo()).statusName === New_Issue_Approval;
    
      // Include the issue only if none of the conditions are met
      if(!(isAgendaIssue || isPreWork || inEmergentRequestStatus || inNewIssueApprovalStatus))
        otherIssues.push(issue);
    }
    
    // If developer is assigned to another issue/s, return true 
    return otherIssues.length > 1;
  } catch (error) {
    console.log("Error getting other issues: ", error);
  }
}

/**
 * @description - Unassign developer from the issue
 */
async function unAssignDev() {
  try {
    await github.rest.issues.removeAssignees({
      owner: "moazDev1",
      repo: "website",
      issue_number: context.payload.issue.number,
      assignees: [assignee],
    });
  } catch (error) {
    console.log("Error unassigning developer: ", error);
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
      placeholderString: '${issueAssignee}',
      filePathToFormat: filePath,
      textToFormat: null
    }

    // Return teh formatted comment
    const fromattedComment = formatComment(commentObject, fs);
    return fromattedComment;
  } catch (error) {
    console.log("Error creating comment: ", error);
  }
}

/**
 * @description - Add 'ready for dev lead' label to the issue
 * @param {String} labelName - Name of the label to add
 */
async function addLabel(labelName) {
  try {
    await github.rest.issues.addLabels({
      owner: "moazDev1",
      repo: "website",
      issue_number: context.payload.issue.number,
      labels: [labelName],
    });
  } catch (error) {
    console.log("Error Adding label: ", error);
  }
}

/**
 * @description - Get latest assignee, in case there are multimple assignees to the issue
 * @returns {String} - return the username of the latest assignee
 */
async function getLatestAssignee() {
  try {
    let issueAssignee = context.payload.issue.assignee.login;

    const eventdescriptions = await getTimeline(context.payload.issue.number, github, context);
    
    // Find out the latest developer assigned to the issue
    for(let i = eventdescriptions.length - 1 ; i>=0; i-=1){
      if(eventdescriptions[i].event == 'assigned'){
        issueAssignee = eventdescriptions[i].assignee.login
        break
      }
    }

    return issueAssignee;
  } catch (error) {
    console.log("Error getting last assignee: ", error);
  }
}

/**
 * @description - Get item info using its issue number
 * @param {Number} issueNum - Issue number linked to the item
 * @returns {Object} - An object containing the item ID and its status name
 */
async function getItemInfo() {
  try {
    const query = `query($owner: String!, $repo: String!, $issueNum: Int!) {
      repository(owner: $owner, name: $repo) {
        issue(number: $issueNum) {
          id
          projectItems(first: 100) {
            nodes {
              id
              fieldValues(first: 100) {
                nodes {
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }`;
  
  const variables = {
    owner: "moazDev1",
    repo: "website",
    issueNum: context.payload.issue.number
  };

  const response = await github.graphql(query, variables);

  // Extract the list of project items associated with the issue
  const projectItems = response.repository.issue.projectItems.nodes;
  
  // Since there is always one item associated with the issue,
  // directly get the item's ID from the first index
  const id = projectItems[0].id;

  // Iterate through the field values of the first project item
  // and find the node that contains the 'name' property, then get its 'name' value
  const statusName = projectItems[0].fieldValues.nodes.find(item => item.hasOwnProperty('name')).name;

  return {id, statusName};

  } catch (error) {
    console.log("Error getting item info: ", error);
  }
}

/**
 * @description - Update item to a new status
 * @param {String} itemId - The ID of the item to be updated
 * @param {String} newStatusValue - The new status value to be assigned to the item
 */
async function updateItemStatus(itemId, newStatusValue) {
  try {
    const mutation = `mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: String!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId,
        itemId: $itemId,
        fieldId: $fieldId,
        value: {
          singleSelectOptionId: $value
        }
      }) {
        projectV2Item {
          id
        }
      }
    }`

    const variables = {
      projectId: PROJECT_ID,
      itemId: itemId,
      fieldId: STATUS_FIELD_ID,
      value: newStatusValue
    };

    await github.graphql(mutation, variables);

  } catch (error) {
    console.log("Error moving item: ", error);
  }
}

module.exports = main;