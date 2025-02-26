const fs = require('fs');
const mutateIssueStatus = require('../../utils/mutate-issue-status');
const postComment = require('../../utils/post-issue-comment');
const queryIssueInfo = require('../../utils/query-issue-info');
const statusFieldIds = require('../../utils/_data/status-field-ids');
const { setTimeout } = require('timers/promises');

/**
* Checks if an assignee is eligible to be assigned an issue based on their
* previous assignments and the complexity of the current issue.
* @param {Object} github - The GitHub API client.
* @param {Object} context - The GitHub webhook event context.
* @param {boolean} isAdminOrMerge - Whether the assignee is an admin or merge team member.
* @returns {Promise<boolean>} A promise that resolves to true if the assignee
* is eligible, false otherwise.
*/

async function checkComplexityEligibility(
  github,
  context,
  isAdminOrMerge
) {
  // If assignee is an admin or merge team member, skip complexity check
  if (isAdminOrMerge) {
    return true;
  }

  const currentIssue = formatCurrentIssue(
    context.payload.issue,
    context.payload.sender
  );

  // Fetch the current issue's project item ID and status name
  const { id: projectItemId, statusName } = await queryIssueInfo(
    github,
    context,
    currentIssue.issueNum
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
    github,
    context,
    currentIssue.assigneeUsername
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
    const { id: preWorkIssueProjectItemId } =
      await queryIssueInfo(
        github,
        context,
        preWorkIssue.issueNum
      );
    await handleIssueComplexityNotPermitted(
      github,
      context,
      currentIssue.issueNum,
      currentIssue.assigneeUsername,
      projectItemId,
      preWorkIssue,
      preWorkIssueProjectItemId
    );
  }

  return issueComplexityPermitted;
}

/**
* Fetches all issues assigned to a given user.
* @param {Object} github - The GitHub API client.
* @param {Object} context - The GitHub webhook event context.
* @param {string} username - The GitHub username of the assignee.
* @returns {Promise<Array>} A promise that resolves to an array of assigned
* issues.
*/

async function fetchIssuesByAssignee(github, context, username) {
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

// Extracts the Pre-Work Checklist (Skills Issue) from assigned issues.
function extractPreWorkIssueFromIssues(assignedIssues) {
  const preWorkIssue = assignedIssues.find(
    issue => issue.labels.includes('Complexity: Prework')
  );

  if (!preWorkIssue) {
    throw new Error(
      `Assignee's Pre-Work Checklist (Skills Issue) not found in assigned issues.`
    );
  } 

  return preWorkIssue;    
}

// Extracts roles from the Pre-Work Checklist (Skills Issue).
function extractRoleFromPreWorkIssue(preWorkIssue) {
  return preWorkIssue.labels.filter(
    label =>
      label === 'role: front end' || label === 'role: back end/devOps'
  );
}

/**
* Handles actions to take when an issue is not within the complexity 
* eligibility for an assignee.
* @param {Object} github - The GitHub API client.
* @param {Object} context - The GitHub webhook event context.
* @param {number} currentIssueNum - The current issue number.
* @param {string} assigneeUsername - The GitHub username of the assignee.
* @param {string} currentIssueprojectItemId - The project item ID of the current
* issue.
* @param {Object} preWorkIssue - The Pre-Work Checklist (Skills Issue) object.
* @param {string} preWorkIssueProjectItemId - The project item ID of the
* Pre-Work Checklist (Skills Issue).
*/

async function handleIssueComplexityNotPermitted(
  github,
  context,
  currentIssueNum,
  assigneeUsername,
  projectItemId,
  preWorkIssue,
  preWorkIssueProjectItemId
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
    
    // Add 'Status: Unassigned by Bot' label 
    await github.rest.issues.addLabels({
      owner,
      repo,
      issue_number: currentIssueNum,
      labels: ['Status: Unassigned by Bot'],
    });
  
    // Change issue's status to New Issue Approval 
    await mutateIssueStatus(
      github,
      context,
      projectItemId,
      statusFieldIds('New_Issue_Approval')
    );
  
    // If the assignee's Pre-work Checklist (Skills Issue) is closed, open it
    if (preWorkIssue.state === 'closed') {
      await github.rest.issues.update({
        owner,
        repo,
        issue_number: preWorkIssue.issueNum,
        state: 'open',
      });

      // Brief delay allows Project automation to move Prework to New Issue Approval
      // before script moves it to In Progress, ensuring correct final status 
      await setTimeout(5000);

      // Change Pre-work Checklist (Skills Issue) status to In Progress
      await mutateIssueStatus(
        github,
        context,
        preWorkIssueProjectItemId,
        statusFieldIds('In_Progress')
      );
    }

    const commentBody = formatComplexityReminderComment(
      currentIssueNum,
      assigneeUsername
    );  

    // Post comment on the issue
    await postComment(currentIssueNum, commentBody, github, context);  

    // Post comment on the assignee's Pre-work Checklist (Skills Issue)
    await postComment(preWorkIssue.issueNum, commentBody, github, context);

  } catch (error) {
    throw new Error(
      `Failed to handle issue complexity not permitted for issue #${currentIssueNum}: ${error.message}`
    );
  }
}

// Formats the complexity reminder comment
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

/**
 * @description - This function formats the comment to be posted based on an array of multiple replacement objects.
 * @param {Array} replacements - an array of replacement objects, each containing:
 *  - {String} replacementString - the string to replace the placeholder in the md file
 *  - {String} placeholderString - the placeholder to be replaced in the md file
 * @param {String} filePathToFormat - the path of the md file to be formatted
 * @param {String} textToFormat - the text to be formatted. If null, use the md file provided in the path. If provided, format that text
 * @returns {String} - returns a formatted comment to be posted on github
 */
function formatComment({ replacements, filePathToFormat, textToFormat }, fs) {
    let commentToPost = textToFormat === null ? fs.readFileSync(filePathToFormat).toString('utf-8') : textToFormat;
    
    for (const { replacementString, placeholderString } of replacements) {
        commentToPost = commentToPost.replace(placeholderString, replacementString)
    }

    return commentToPost;
}

module.exports = checkComplexityEligibility;
