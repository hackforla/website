// Import modules
const issueTemplateParser = require('../../utils/issue-template-parser');
const postComment = require('../../utils/post-issue-comment');

// Global variables
var github;
var context;

async function main({ g, c }, artifactContent) {
  github = g;
  context = c;

  // Retrieve lists data from json file written in previous step
  let inactiveLists = JSON.parse(artifactContent);
  
  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const agendaIssueNum = 2607;            // Issue number of the Dev/PM meeting agenda on Mondays

  // Create a new issue in repo, return the issue id for later: creating the project card linked to this issue
  const issue = await createIssue(owner, repo, inactiveLists);
  const issueId = issue.id;
  const issueNumber = issue.number;
  // Get project id, in order to get the column id of `New Issue Approval` in `Project Board`
  const projectId = await getProjectId(owner, repo);
  // Get column id, in order to create a project card in `Project Board` and place in `New Issue Approval`
  const columnId = await getColumnId(projectId);
  // Create the project card, which links to the issue created in createIssue() above
  await createProjectCard(issueId, columnId);
  // Add issue number used to reference the issue and comment on the `Dev/PM Agenda and Notes`
  const commentBody = `**Review Inactive Team Members:** #` + issueNumber;
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
  let thisIssueNumber = thisIssuePredict['data'][0]['number'] + 1
  
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
  return issue.data;
};

const getProjectId = async (owner, repo) => {
  // Get all projects for the repo
  let projects = await github.rest.projects.listForRepo({
    owner,
    repo,
  });
  // Select project with name `Project Board` then access the project `id`
  let projectId = projects.data.filter((project) => {
    return (project.name = "Project Board");
  })[0].id;
  return projectId;
};

const getColumnId = async (projectId) => {
  // Get all columns in the project board
  let columns = await github.rest.projects.listColumns({
    project_id: projectId,
  });
  // Select column with name `New Issue Approval` then access the column `id`
  let columnId = columns.data.filter((column) => {
    return column.name === "New Issue Approval";
  })[0].id;
  return columnId;
};

const createProjectCard = async (issueId, columnId) => {
  const card = await github.rest.projects.createCard({
    column_id: columnId,
    content_id: issueId,
    content_type: "Issue",
  });
  return card.data;
};

module.exports = main;
