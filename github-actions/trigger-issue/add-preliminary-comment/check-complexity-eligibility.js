const fs = require('fs');
const formatComment = require('../../utils/format-comment');
const postComment = require('../../utils/post-issue-comment');

/**
* Checks if an assignee is eligible to be assigned an issue based on their
* previous assignments and the complexity of the current issue.
* @param {Object} github - The GitHub API client.
* @param {Object} context - The GitHub webhook event context.
* @returns {Promise<boolean>} A promise that resolves to true if the assignee
* is eligible, false otherwise.
*/

async function checkComplexityEligibility(github, context) {
  const currentIssue = formatCurrentIssue(
    context.payload.issue,
    context.payload.sender
  );

  // Fetch the current issue's project card ID and column name
  const { projectCardId, columnName } = await fetchProjectCardInfo(
    currentIssue.issueNum,
    github,
    context
  );

  // If issue not from Prioritized backlog, skip complexity checks
  if (columnName !== 'Prioritized backlog') {
    return true;
  }

  // If issue created by assignee or not self-assigned, skip complexity checks
  if (currentIssue.assigneeId === currentIssue.creatorId ||
      currentIssue.assigneeId !== currentIssue.assignerId) {
    return true;
  }

  // If issue doesn't have required labels, skip complexity checks  
  if (!(currentIssue.labels.includes('role: front end') ||
        currentIssue.labels.includes('role: back end/devOps')) ||
      !(currentIssue.labels.includes('good first issue') ||
        currentIssue.labels.includes('Complexity: Small') ||
        currentIssue.labels.includes('Complexity: Medium'))) {
    return true;
  }

  const assignedIssues = await fetchIssuesByAssignee(
    currentIssue.assigneeUsername,
    github,
    context
  );

  const previousIssues = assignedIssues.filter(
    issue => issue.issueNum !== currentIssue.issueNum
  );

  const preWorkChecklist = extractPreWorkChecklistFromIssues(assignedIssues);
  const assigneeRole = extractRoleFromPreWorkChecklist(preWorkChecklist);

  const issueComplexityPermitted = isEligibleForIssue(
    currentIssue,
    previousIssues,
    assigneeRole
  );

  if (!issueComplexityPermitted) {
    const { projectCardId: preWorkCheckListProjectCardId } =
      await fetchProjectCardInfo(
        preWorkChecklist.issueNum,
        github,
        context
      );
    await handleIssueComplexityNotPermitted(
      currentIssue.issueNum,
      currentIssue.assigneeUsername,
      projectCardId,
      preWorkChecklist,
      preWorkCheckListProjectCardId,
      github,
      context
    );
  }

  return issueComplexityPermitted;
}

/**
* Fetches the project card ID and column name for a given issue number.
* @param {number} issueNum - The issue number.
* @param {Object} github - The GitHub API client.
* @param {Object} context - The GitHub webhook event context.
* @returns {Promise<Object>} A promise that resolves to an object containing
* the project card ID and column name.
*/

async function fetchProjectCardInfo(issueNum, github, context) {
  try {
    const query = `
      query ($owner: String!, $repo:String!, $issueNum: Int!) {
        repository(owner: $owner, name: $repo) {
          issue(number: $issueNum) {
            projectCards(first: 1) {
              nodes {
                databaseId
                column {
                  name
                }
              }
            }
          }
        }
      }
    `;

    const { owner, repo } = context.repo;
    const variables = { owner, repo, issueNum };

    const { repository } = await github.graphql(query, variables);
    const projectCard = repository.issue.projectCards.nodes[0];
    const { databaseId: projectCardId, column: { name: columnName } } =
      projectCard;

    return { projectCardId, columnName };

  } catch (error) {
    console.error(`Error fetching project card info for issue #${issueNum}`, error);
    return { projectCardId: null, columnName: null }; 
  }
}

/**
* Fetches all issues assigned to a given user.
* @param {string} username - The GitHub username of the assignee.
* @param {Object} github - The GitHub API client.
* @param {Object} context - The GitHub webhook event context.
* @returns {Promise<Array>} A promise that resolves to an array of assigned
* issues.
*/

async function fetchIssuesByAssignee(username, github, context) {
  try {
    const { owner, repo } = context.repo;
    const response = await github.rest.issues.listForRepo({
      owner,
      repo,
      assignee: username,
      state: 'all',
      per_page: 100,
    });

    const issues = response.data;

    if (issues.length === 0) {
      return [];
    }

    return issues.map(issue => ({
      issueNum: issue.number,
      issueTitle: issue.title,
      labels: issue.labels.map(label => label.name),
      state: issue.state,
      assigneeId: issue.assignee.id,
      creatorId: issue.user.id,
    }));

  } catch (error) {
    console.error(`Error fetching issues for assignee ${username}`, error);
    return [];
  }
}

// Formats the current issue data.
function formatCurrentIssue(issue, sender) {
  return {
    issueNum: issue.number,
    issueTitle: issue.title,
    labels: issue.labels.map(label => label.name),
    assigneeId: issue.assignee.id,
    assigneeUsername: issue.assignee.login,
    assignerId: sender.id,
    creatorId: issue.user.id,
  };
}

/**
* Checks if an assignee is eligible to be assigned an issue based on their
* previous assignments and the complexity of the current issue.
* @param {Object} currentIssue - The current issue data.
* @param {Array} previousIssues - An array of previously assigned issues.
* @param {Array} assigneeRole - An array of the assignee's roles.
* @returns {boolean} True if the assignee is eligible, false otherwise.
*/

function isEligibleForIssue(currentIssue, previousIssues, assigneeRole) {  
  const currentIssueComplexityAndRoles = extractComplexityAndRolesFromLabels(
    [currentIssue]
  );
  const previousIssuesComplexityAndRoles = extractComplexityAndRolesFromLabels(
    previousIssues
  );
   
  // Check good first issue eligibility
  if (currentIssueComplexityAndRoles[0].complexity === 'good first issue') {
    const goodFirstIssueCount = previousIssuesComplexityAndRoles.filter(
      issue => issue.complexity === 'good first issue'
    ).length;

    if (goodFirstIssueCount >= 2) {
      return false;
    } else {
      return true;
    }
  }

  /* 
   Check if the assignee has only one role (front end or back end/devOps).
   If so, check their eligibility for Small/Medium complexity issues
   based on the number of previous issues of the same complexity.
  */ 
  if (assigneeRole.includes('role: front end') !==
      assigneeRole.includes('role: back end/devOps')) {
    const complexityCount = previousIssuesComplexityAndRoles.filter(
      issue => issue.complexity === currentIssueComplexityAndRoles[0].complexity
    ).length;
    
    if (complexityCount >= 1) {
      return false;
    }
  }

  // Check for Small/Medium complexity eligibility for assignee with both roles
  let matchingComplexityIssues = [];

  if (assigneeRole.includes('role: front end') &&
      assigneeRole.includes('role: back end/devOps')) {
    matchingComplexityIssues = previousIssuesComplexityAndRoles.filter(
      issue => issue.complexity.includes(
        currentIssueComplexityAndRoles[0].complexity
      )
    );

    if (matchingComplexityIssues.length >= 2) {
      return false;
    }
  }

  /* 
   If there is one previous issue of the same complexity,
   check the eligibility based on the role labels of the 
   previous and current issues.
  */
  if (matchingComplexityIssues.length === 1) {
    const previousMatchingIssue = matchingComplexityIssues[0];

    const currentIssueHasFrontEnd =
      currentIssueComplexityAndRoles[0].role.includes('role: front end');
    const currentIssueHasBackEnd =
      currentIssueComplexityAndRoles[0].role.includes('role: back end/devOps');
    
    const previousMatchingIssueHasFrontEnd =
      previousMatchingIssue.role.includes('role: front end');
    const previousMatchingIssueHasBackEnd =
      previousMatchingIssue.role.includes('role: back end/devOps');

    // If the previous issue had both roles, 
    // the current issue must have one of the roles, but not both
    if (previousMatchingIssueHasFrontEnd && previousMatchingIssueHasBackEnd) {
      return (currentIssueHasFrontEnd || currentIssueHasBackEnd) &&
             !(currentIssueHasFrontEnd && currentIssueHasBackEnd);
             
      // If the previous issue had only front end role, 
      // the new issue must have back end role
    } else if (previousMatchingIssueHasFrontEnd) {
      return currentIssueHasBackEnd;

      // If the previous issue had only back end role, 
      // the new issue must have front end role
    } else if (previousMatchingIssueHasBackEnd) {
      return currentIssueHasFrontEnd;
    }
  }

  return true;
}

// Extracts complexity and roles from issue labels.
function extractComplexityAndRolesFromLabels(issues) {
  // Filter to only include issues not created by assignee
  const filteredIssues = issues.filter(
    issue => issue.assigneeId !== issue.creatorId
  );
  
  return filteredIssues.map(issue => ({
    complexity: issue.labels.find(
      label =>
        label === 'good first issue' ||
        label === 'Complexity: Small' ||
        label === 'Complexity: Medium'
    ),
    role: issue.labels.filter(
      label =>
        label === 'role: front end' || label === 'role: back end/devOps'
    ),
  })).filter(issue => issue.complexity);
}

// Extracts the Pre-Work Checklist issue from assigned issues.
function extractPreWorkChecklistFromIssues(assignedIssues) {
  const preWorkChecklist = assignedIssues.find(
    issue => issue.labels.includes('Complexity: Prework')
  );

  if (!preWorkChecklist) {
    console.error(`Assignee's Pre-Work Checklist not found in assigned issues.`);
  } 

  return preWorkChecklist;    
}

// Extracts roles from the Pre-Work Checklist issue.
function extractRoleFromPreWorkChecklist(preWorkCheckList) {
  return preWorkCheckList.labels.filter(
    label =>
      label === 'role: front end' || label === 'role: back end/devOps'
  );
}

/**
* Handles actions to take when an issue is not within the complexity 
* eligibility for an assignee.
* @param {number} currentIssueNum - The current issue number.
* @param {string} assigneeUsername - The GitHub username of the assignee.
* @param {string} currentIssueProjectCardId - The project card ID of the current
* issue.
* @param {Object} preWorkCheckList - The Pre-Work Checklist issue object.
* @param {string} preWorkCheckListProjectCardId - The project card ID of the
* Pre-Work Checklist issue.
* @param {Object} github - The GitHub API client.
* @param {Object} context - The GitHub webhook event context.
*/

async function handleIssueComplexityNotPermitted(
  currentIssueNum,
  assigneeUsername,
  projectCardId,
  preWorkCheckList,
  preWorkCheckListProjectCardId,
  github,
  context
) {
  try {
    const NEW_ISSUE_APPROVAL_COLUMN_ID = 19784554; // TODO: REPLACE WITH 15235217
    const IN_PROGRESS_COLUMN_ID = 19784557; // TODO: REPLACE WITH 7198228
    const { owner, repo } = context.repo;

    // Unassign assignee from the issue
    await github.rest.issues.removeAssignees({
      owner,
      repo,
      issue_number: currentIssueNum,
      assignees: [assigneeUsername],
    });
    
    // Add 'Ready for Prioritization' label 
    await github.rest.issues.addLabels({
      owner,
      repo,
      issue_number: currentIssueNum,
      labels: ['Ready for Prioritization'],
    });
  
    // Move issue to the New Issue Approval column 
    await github.rest.projects.moveCard({
      card_id: projectCardId,
      position: 'top',
      column_id: NEW_ISSUE_APPROVAL_COLUMN_ID, 
    });
  
    // If the assignee's Pre-work checklist is closed, open it
    if (preWorkCheckList.state === 'closed') {
      await github.rest.issues.update({
        owner,
        repo,
        issue_number: preWorkCheckList.issueNum,
        state: 'open',
      });
    }

    // Move Pre-work Checklist to the In Progress column
    await github.rest.projects.moveCard({
      card_id: preWorkCheckListProjectCardId, 
      position: 'top',
      column_id: IN_PROGRESS_COLUMN_ID, 
    });

    const commentBody = formatComplexityReminderComment(
      currentIssueNum,
      assigneeUsername
    );  
    await postComment(currentIssueNum, commentBody, github, context);  
    await postComment(preWorkCheckList.issueNum, commentBody, github, context);

  } catch (error) {
    console.error('Error handling issue complexity not permitted.', error);
  }
}

// Formats the complexity reminder comment.
function formatComplexityReminderComment(issueNum, assigneeUsername) {
  const replacements = [
    {
      replacementString: assigneeUsername,
      placeholderString: '${issueAssignee}'
    },
    {
      replacementString: issueNum,
      placeholderString: '${issueNum}'
    },
  ];

  return formatComment(
    {
      replacements,
      filePathToFormat: './github-actions/trigger-issue/add-preliminary-comment/developer-complexity-reminder.md',
      textToFormat: null,
    },
    fs
  );
}

module.exports = checkComplexityEligibility;
