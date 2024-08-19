const fs = require('fs');
const formatComment = require('../../utils/format-comment');
const postComment = require('../../utils/post-issue-comment');

/**
* Checks if an assignee is eligible to be assigned an issue based on their
* previous assignments and the complexity of the current issue.
* @param {Object} github - The GitHub API client.
* @param {Object} context - The GitHub webhook event context.
* @param {boolean} isAdminOrMerge - Whether the assignee is an admin or merge team member.
* @param {string} PROJECT_ID - The ID of the GitHub Project.
* @param {string} STATUS_FIELD_ID - The ID of the status field in the GitHub Project.
* @param {Map<string, string>} statusValues - A map of status names to their corresponding IDs.
* @returns {Promise<boolean>} A promise that resolves to true if the assignee
* is eligible, false otherwise.
*/

async function checkComplexityEligibility(
  github,
  context,
  isAdminOrMerge,
  PROJECT_ID,
  STATUS_FIELD_ID,
  statusValues
) {
  const currentIssue = formatCurrentIssue(
    context.payload.issue,
    context.payload.sender
  );

  // If assignee is an admin or merge team member, skip complexity check
  if (isAdminOrMerge) {
    return true;
  }

  // Fetch the current issue's project item ID and status name
  const { projectItemId, statusName } = await fetchProjectItemInfo(
    currentIssue.issueNum,
    github,
    context
  );

  // If issue's status is New Issue Approval, skip complexity check
  if (statusName === 'New Issue Approval') {
    return true;
  }

  // If issue created by assignee or not self-assigned, skip complexity check
  if (currentIssue.assigneeId === currentIssue.creatorId ||
      currentIssue.assigneeId !== currentIssue.assignerId) {
    return true;
  }
  
  const hasAnyLabel = (labels, referenceLabels) =>
    labels.some(label => referenceLabels.includes(label));
  
  const exceptionLabels = [
    'ER',
    'epic'
  ];
  const requiredRoleLabels = [
    'role: front end',
    'role: back end/devOps'
  ];
  const requiredComplexityLabels = [
    'good first issue',
    'Complexity: Small',
    'Complexity: Medium'
  ];

  // If issue has any exception labels, skip complexity check
  if (hasAnyLabel(currentIssue.labels, exceptionLabels)) {
    return true;
  }
  
  // If issue doesn't have required labels, skip complexity check
  if (!hasAnyLabel(currentIssue.labels, requiredRoleLabels) ||
      !hasAnyLabel(currentIssue.labels, requiredComplexityLabels)) {
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

  const preWorkIssue = extractPreWorkIssueFromIssues(assignedIssues);
  const assigneeRole = extractRoleFromPreWorkIssue(preWorkIssue);

  const issueComplexityPermitted = isEligibleForIssue(
    currentIssue,
    previousIssues,
    assigneeRole
  );

  if (!issueComplexityPermitted) {
    const { projectItemId: preWorkIssueProjectItemId } =
      await fetchProjectItemInfo(
        preWorkIssue.issueNum,
        github,
        context
      );
    await handleIssueComplexityNotPermitted(
      currentIssue.issueNum,
      currentIssue.assigneeUsername,
      projectItemId,
      preWorkIssue,
      preWorkIssueProjectItemId,
      github,
      context,
      PROJECT_ID,
      STATUS_FIELD_ID,
      statusValues
    );
  }

  return issueComplexityPermitted;
}

/**
* Fetches the project item ID and status name for a given issue number.
* @param {number} issueNum - The issue number.
* @param {Object} github - The GitHub API client.
* @param {Object} context - The GitHub webhook event context.
* @returns {Promise<Object>} A promise that resolves to an object containing
* the project item ID and status name.
*/

async function fetchProjectItemInfo(issueNum, github, context) {
  try {
    const query = `
      query ($owner: String!, $repo:String!, $issueNum: Int!) {
        repository(owner: $owner, name: $repo) {
          issue(number: $issueNum) {
            projectItems(first: 1) {
              nodes {
                id
                fieldValues(first: 1) {
                  nodes {
                    field { name }
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      name
                    }
                  }
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
    const projectItem = repository.issue.projectItems.nodes[0];

    const projectItemId = projectItem.id;
    const statusField = projectItems.fieldValues.nodes
      .find(item => item.field.name === 'Status');
    const statusName = statusField?.name;

    return { projectItemId, statusName };

  } catch (error) {
    throw new Error(
      `Error fetching project item info for issue #${issueNum}: ${error.message}`
    );
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

// Extracts the Pre-Work issue from assigned issues.
function extractPreWorkIssueFromIssues(assignedIssues) {
  const preWorkIssue = assignedIssues.find(
    issue => issue.labels.includes('Complexity: Prework')
  );

  if (!preWorkIssue) {
    throw new Error(
      `Assignee's Pre-Work issue not found in assigned issues.`
    );
  } 

  return preWorkIssue;    
}

// Extracts roles from the Pre-Work issue.
function extractRoleFromPreWorkIssue(preWorkIssue) {
  return preWorkIssue.labels.filter(
    label =>
      label === 'role: front end' || label === 'role: back end/devOps'
  );
}

/**
* Handles actions to take when an issue is not within the complexity 
* eligibility for an assignee.
* @param {number} currentIssueNum - The current issue number.
* @param {string} assigneeUsername - The GitHub username of the assignee.
* @param {string} currentIssueprojectItemId - The project item ID of the current
* issue.
* @param {Object} preWorkIssue - The Pre-Work issue object.
* @param {string} preWorkIssueProjectItemId - The project item ID of the
* Pre-Work issue.
* @param {Object} github - The GitHub API client.
* @param {Object} context - The GitHub webhook event context.
* @param {string} PROJECT_ID - The ID of the GitHub Project.
* @param {string} STATUS_FIELD_ID - The ID of the status field in the GitHub Project.
* @param {Map<string, string>} statusValues - A map of status names to their corresponding IDs.
*/

async function handleIssueComplexityNotPermitted(
  currentIssueNum,
  assigneeUsername,
  projectItemId,
  preWorkIssue,
  preWorkIssueProjectItemId,
  github,
  context,
  PROJECT_ID,
  STATUS_FIELD_ID,
  statusValues
) {
  try {
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
  
    // Change issue's status to New Issue Approval 
    await updateItemStatus(
      github,
      projectItemId,
      statusValues.get(New_Issue_Approval),
      PROJECT_ID,
      STATUS_FIELD_ID
    );
  
    // If the assignee's Pre-work issue is closed, open it
    if (preWorkIssue.state === 'closed') {
      await github.rest.issues.update({
        owner,
        repo,
        issue_number: preWorkIssue.issueNum,
        state: 'open',
      });
    }

    // Change Pre-work status to In Progress
    await updateItemStatus(
      github,
      preWorkIssueProjectItemId,
      statusValues.get(In_Progress),
      PROJECT_ID,
      STATUS_FIELD_ID
    );

    const commentBody = formatComplexityReminderComment(
      currentIssueNum,
      assigneeUsername
    );  
    await postComment(currentIssueNum, commentBody, github, context);  
    await postComment(preWorkIssue.issueNum, commentBody, github, context);

  } catch (error) {
    throw new Error(
      `Failed to handle issue complexity not permitted for issue #${currentIssueNum}: ${error.message}`
    );
  }
}

// Updates the issue's status
async function updateItemStatus(
  github,
  itemId,
  statusValueId,
  PROJECT_ID,
  STATUS_FIELD_ID
) {
  try {
    const mutation = `
      mutation ($projectId: ID!, $itemId: ID!, $fieldId: ID!, $valueId: String!) {
        updateProjectV2ItemFieldValue(
          input: {
            projectId: $projectId
            itemId: $itemId
            fieldId: $fieldId
            value: { singleSelectOptionId: $valueId }
          }
        ) {
          projectV2Item {
            id
          }
        }
      }
    `;

    await github.graphql(mutation, {
      projectId: PROJECT_ID,
      itemId: itemId,
      fieldId: STATUS_FIELD_ID,
      valueId: statusValueId
    });
  } catch (error) {
    throw new Error(`Error updating issue status: ${error.message}`)
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
