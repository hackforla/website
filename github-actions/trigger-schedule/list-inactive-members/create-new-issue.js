// Import modules
const fs = require('fs');
const issueTemplateParser = require('../../utils/issue-template-parser');
const postComment = require('../../utils/post-issue-comment');

// Global variables
var github;
var context;

async function main({ g, c }) {
  github = g;
  context = c;

  // Retrieve lists data from json file written in previous step
  const filepath = 'github-actions/utils/_data/inactive-members.json';
  const rawData = fs.readFileSync(filepath, 'utf8');
  let inactiveLists = JSON.parse(rawData);
  const inactiveWithOpen = parseInactiveOpen(inactiveLists['cannotRemoveYet']);
  
  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const agendaIssueNum = 2607;            // Issue number of the Dev/PM meeting agenda on Mondays

  // Create a new issue in repo, return the issue id for later: creating the project card linked to this issue
  const issue = await createIssue(owner, repo, inactiveLists);
  const issueNumber = issue.number;

  // Add issue number used to reference the issue and comment on the `Dev/PM Agenda and Notes`
  const commentBody = `**Review Inactive Team Members:** #` + issueNumber + inactiveWithOpen;
  await postComment(agendaIssueNum, commentBody, github, context);
}

const createIssue = async (owner, repo, inactiveLists) => {
  // Splits inactiveLists into lists of removed contributors and of those to be notified
  let removeList = inactiveLists['removedContributors'];
  let notifyList = inactiveLists['notifiedContributors'];

  let removedList = removeList.map(x => "@" + x).join("\n");  
  let notifiedList = notifyList.map(x => "@" + x).join("\n"); 

  // This finds all issues in the repo and returns the only the number for the last issue created. 
  // Add 1 to this issue number to get the number for the next issue- i.e. the one being created.
  let thisIssuePredict = await github.rest.issues.listForRepo({
    owner,
    repo,
    state:"all",
    per_page: 1,
    page: 1,
  });
  let thisIssueNumber = thisIssuePredict['data'][0]['number'] + 1;

  // Uses issueTemplateParser to pull the relevant data from the issue template
  const pathway = 'github-actions/trigger-schedule/list-inactive-members/inactive-members.md';
  const issueObject = issueTemplateParser(pathway);

  let title = issueObject['title'];
  let labels = issueObject['labels'];
  let milestone = parseInt(issueObject['milestone']);
  let body = issueObject['body'];

  // Replace variables in issue template body
  body = body.replace('${notifiedList}', notifiedList);
  body = body.replace('${removedList}', removedList);
  body = body.replaceAll('${thisIssueNumber}', thisIssueNumber);

  // Create issue
  const issue = await github.rest.issues.create({
    owner,
    repo,
    title,
    body,
    labels,
    milestone,
  });
  console.log('Created issue ' + thisIssueNumber);
  return issue.data;
};

const parseInactiveOpen = (inactiveOpens) => {
  if(Object.keys(inactiveOpens).length === 0){
    return '';
  } else {
    let inactiveOpen = '\r\n\nInactive members with open issues:\r\n';
    for(const [key, value] of Object.entries(inactiveOpens)){
      inactiveOpen += ' - ' + key + ': #' + value + '\r\n';
    }
    return inactiveOpen;
  }
};

module.exports = main;
