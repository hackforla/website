// Import modules

// Global variables
var github;
var context;

async function main({ g, c }, artifactContent) {
  github = g;
  context = c;

  // Retrieve lists data from json file written in previous step
  let inactiveLists = JSON.parse(artifactContent);
  
  const owner = "hackforla";
  const repo = "website";

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
  // Return issue number used to reference the issue when commenting on the `Dev/PM Agenda and Notes`
  return issueNumber;
}

const createIssue = async (owner, repo, inactiveLists) => {
  // Splits inactivesList into lists of removed contributors and of those to be notified
  let removeList = inactiveLists['removedContributors'];
  let notifyList = inactiveLists['notifiedContributors'];

  let removedList = removeList.map(x => "@" + x).join("\n");  
  let notifiedList = notifyList.map(x => "@" + x).join("\n"); 
  
  let title = "Review Inactive Team Members";
  let body = "# Review of Inactive Website Team Members\n" 
  + "## Inactive Members\n"
  + "Developers: If your name is on the following list, our team bot has determined that you have not been active with the Website team in the last 30 days. If we don't hear back from you in the upcoming weeks, we will unassign you from any issues you may be working on and remove you from the 'website-write' team.\n\n"
  + notifiedList + "\n\n"
  + "## Removed Members\n"
  + "Our team bot has determined that the following member(s) have not been active with the Website team for over 60 days, and therefore the member(s) have been removed from the 'website-write' team.\n\n"
  + removedList + "\n\n\n\n"
  + "### If this is a mistake or if you would like to return to the Hack for LA Website team, please respond in a comment with one of the two following messages:\n"
  + "#### Our bot made a mistake, let us know!\n"
  + "```\n"
  + "I have been active!  See Issue # or PR # \n"
  + "```\n"
  + "#### I want to come back to the team!\n"
  + "```\n"
  + "Please add me back to the write team, I am ready to work on an issue now.\n"
  + "```\n"
  + "### If it has been less than 20 days:\n"
  + "- Make sure that you are assigned to an issue, and\n"
  + "- That issue is in the column \"In progress (actively working)\", and\n"
  + "- You are providing weekly progress updates.\n"
  + "### If it has been more than 20 days:\n"
  + "- Please send us a Slack message with a link to your comment\n\n"
  let labels = [
    "Feature: Administrative",
    "role: dev leads",
    "Ready for dev lead",
    "Ready for product",
    "Complexity: Small",
    "Size: 0.5pt",
  ];
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
