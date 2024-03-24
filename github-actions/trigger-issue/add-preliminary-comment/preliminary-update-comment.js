const fs = require("fs");
const postComment = require('../../utils/post-issue-comment');
const formatComment = require('../../utils/format-comment');
const getTimeline = require('../../utils/get-timeline');

// Global variables
var github;
var context;

/**
 * @description - This function is the entry point into the javascript file, it formats the md file based on the result of the previous step and then posts it to the issue
 * @param {Object} g - github object  
 * @param {Object} c - context object 
 * @param {Boolean} actionResult - the previous gh-action's result
 * @param {Number} issueNum - the number of the issue where the post will be made 
 */

async function main({ g, c }, { shouldPost, issueNum }){
  github = g;
  context = c;
  // If the previous action returns a false, stop here
  if(shouldPost === false){
    console.log('No need to post comment.');
    return;
  }
  //Else we make the comment with the issuecreator's github handle instead of the placeholder.
  else{
    const instructions = await makeComment();
    if(instructions !== null){
      // the actual creation of the comment in github
      await postComment(issueNum, instructions, github, context);
    }
  }
}

/**
 * @description - This function makes the comment with the issue assignee's github handle using the raw preliminary.md file
 * @returns {string} - Comment to be posted with the issue assignee's name in it!!!
 */

async function makeComment(){
  // Setting all the variables which formatComment is to be called with
  let issueAssignee = context.payload.issue.assignee.login;
  const eventDescriptions = await getTimeline(context.payload.issue.number, github, context);
  //adding the code to find out the latest person assigned the issue
  for(let i = eventDescriptions.length - 1; i >= 0; i -= 1){
    if(eventDescriptions[i].event == 'assigned'){
      issueAssignee = eventDescriptions[i].assignee.login;
      break;
    }
  }

  const isDraft = context.payload.issue.labels.find((label) => label.name == 'Draft') ? true : false;

  const queryColumn = `query($owner:String!, $name:String!, $number:Int!) {
    repository(owner:$owner, name:$name) {
      issue(number:$number) {
        projectCards {
          nodes {
            column {
              name
            }
          }
        }
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

  let filename = 'preliminary-update.md';

  // Unassign if issue is in New Issue Approval column of Project Board and is not labeled 'Draft'
  if (!isDraft && columnName == 'New Issue Approval') {
    filename = 'unassign-from-NIA.md';

    await github.rest.issues.removeAssignees({
      owner: variables.owner,
      repo: variables.name,
      issue_number: variables.number,
      assignees: [issueAssignee],
    });
  }

  const filePathToFormat = './github-actions/trigger-issue/add-preliminary-comment/' + filename;

  const commentObject = {
    replacementString: issueAssignee,
    placeholderString: '${issueAssignee}',
    filePathToFormat: filePathToFormat,
    textToFormat: null
  };

  // creating the comment with issue assignee's name and returning it!
  const commentWithIssueAssignee = formatComment(commentObject, fs);
  return commentWithIssueAssignee;
}
  
module.exports = main;
