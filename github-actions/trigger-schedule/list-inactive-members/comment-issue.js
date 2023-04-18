// Import modules

// Global variables
var github;
var context;

async function main({ g, c }, newIssueNumber) {
  github = g;
  context = c;

  let agendaAndNotesIssueNumber = 2607
  await commentOnIssue(agendaAndNotesIssueNumber, newIssueNumber);
}

const commentOnIssue = async (agendaAndNotesIssueNumber, newIssueNumber) => {
  const owner = "hackforla";
  const repo = "website";
  await github.rest.issues.createComment({
    owner,
    repo,
    issue_number: agendaAndNotesIssueNumber,
    body: `**Review Inactive Members:** #${newIssueNumber}`,
  });
};

module.exports = main;
