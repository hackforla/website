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
  
  let title = "Review Inactive Team Members";
  let body = "# Review of Inactive Website Team Members\n" 
  + "## Inactive Members\n"
  + "Developers: If your name is on the following list, our team bot has determined that you have not been active with the Website team in the last 30 days. If we don't hear back from you in the upcoming weeks, we will unassign you from any issues you may be working on and remove you from the 'website-write' team.\n\n"
  + notifiedList + "\n\n"
  + "### Did we make a mistake?\n"
  + "The bot is checking for the following activity:\n"
  + "- If you are assigned to an issue, that you have provided an update on the issue in the past 30 days. The updates are due weekly.\n"
  + "- If your issue is a \`Draft\` in the \"New Issue Approval\" column, that you have added to it within the last 30 days.\n"
  + "- If you are reviewing PRs, that you have posted a review comment within the past 30 days.\n\n"
  + "If you have been inactive in the last 30 days (using the above measurements), you can become active again by doing at least one of the above actions.\n\n"
  + "If you were active during the last 30 days (using the above measurements) and the bot made a mistake, let us know by responding in a comment (reopening this issue) with this message:\n"
  + "```\n"
  + "I am responding to Issue #" + thisIssueNumber + ".\n"
  + "The Hack for LA website bot made a mistake, I have been active!\n" 
  + "See my Issue # or my review in PR #  \n"
  + "```\n"
  + "After you leave the comment, please send us a Slack message on the \"hfla-site\" channel with a link to your comment.\n\n"
  + "### Temporary leave\n"
  + "If you have taken a temporary leave, and you have been authorized to keep your assignment to an issue: \n"
  + "- Your issue should be in the \"Questions/ In Review\" column, with the \`ready for dev lead\` label and a note letting us know when you will be back.\n"
  + "- We generally try to encourage you to unassign yourself from the issue and allow us to return it to the \"Prioritized backlog\" column. However, exceptions are sometimes made.\n"
  + "## Removed Members\n"
  + "Our team bot has determined that the following member(s) have not been active with the Website team for over 60 days, and therefore the member(s) have been removed from the 'website-write' team.\n\n"
  + removedList + "\n\n"
  + "If this is a mistake or if you would like to return to the Hack for LA Website team, please respond in a comment with this message:\n"
  + "```\n"
  + "I am responding to Issue #" + thisIssueNumber + ".\n"
  + "I want to come back to the team!\n"
  + "Please add me back to the 'website-write' team, I am ready to work on an issue now.\n"
  + "```\n"
  + "After you leave the comment, please send us a Slack message on the \"hfla-site\" channel with a link to your comment.\n\n"
  + "## Dev Leads\n"
  + "This issue is closed automatically after creation. If the issue is open, check whether: \n"
  + "- A \"Removed Member\" is requesting reactivation to the 'website-write' team. If so, reactivate the member and inform them via a comment on this issue as well as via Slack. After informing the member, close this issue.\n"
  + "- An \"Inactive Member\" believes that the bot has made a mistake. If so, determine whether the member has or has not been active based on the issue or PR number provided in the member's comment. If multiple members are being inappropriately flagged as \"inactive\" by the bot, then submit an ER/Issue in order to deactivate the `schedule-monthly.yml` workflow so that the cause of the bug can be investigated and resolved.\n\n" 
  let labels = [
    "Feature: Administrative",
    "Feature: Onboarding/Contributing.md",
    "role: dev leads",
    "Complexity: Small",
    "Size: 0.5pt",
  ];
  // Note that 8 represents ".08 Team workflow" i.e. the 8th workflow on HfLAs Project Board 
  let milestone = 8;
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
