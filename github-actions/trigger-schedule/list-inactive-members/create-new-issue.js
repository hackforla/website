// Import modules

// Global variables
var github;
var context;

async function main({ g, c }, list) {
  github = g;
  context = c;

  const owner = "hackforla";
  const repo = "website";

  // create a new issue in repo, return the issue id for later: creating the project card linked to this issue
  const issue = await createIssue(owner, repo, list);
  const issueId = issue.id;
  const issueNumber = issue.number;
  // get project id, in order to get the column id of `New Issue Approval` in `Project Board`
  const projectId = await getProjectId(owner, repo);
  // get column id, in order to create a project card in `Project Board` and place in `New Issue Approval`
  const columnId = await getColumnId(projectId);
  // create the project card, which links to the issue created on line 16
  await createProjectCard(issueId, columnId);
  // return issue number: going to be using this number to link the issue when commenting on the `Dev/PM Agenda and Notes`
  return issueNumber;
}

const createIssue = async (owner, repo, list) => {
  let listWithNewLine = list.join("\n");
  let body = "**Inactive Members:**\n\n" + listWithNewLine;
  let labels = [
    "Ready for dev lead",
    "Ready for product",
    "Complexity: Small",
    "Size: 0.5pt",
  ];
  const title = "Review Inactive Members";
  const issue = await github.rest.issues.create({
    owner,
    repo,
    title,
    body,
    labels,
  });
  return issue.data;
};

const getProjectId = async (owner, repo) => {
  // get all projects for the repo
  let projects = await github.rest.projects.listForRepo({
    owner,
    repo,
  });
  // select project with name `Project Board`, access the `id`
  let projectId = projects.data.filter((project) => {
    return (project.name = "Project Board");
  })[0].id;
  return projectId;
};

const getColumnId = async (projectId) => {
  // get all columns in the project board
  let columns = await github.rest.projects.listColumns({
    project_id: projectId,
  });
  // select column with name `New Issue Approval`, access the `id
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
