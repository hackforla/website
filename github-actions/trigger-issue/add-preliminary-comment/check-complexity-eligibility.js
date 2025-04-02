// Import modules
const fs = require('fs');
const retrieveLabelDirectory = require('../../utils/retrieve-label-directory');
const mutateIssueStatus = require('../../utils/mutate-issue-status');
const postComment = require('../../utils/post-issue-comment');
const queryIssueInfo = require('../../utils/query-issue-info');
const statusFieldIds = require('../../utils/_data/status-field-ids');
const { setTimeout } = require('timers/promises');

// Use labelKeys to retrieve current labelNames from directory
const [
  ER,
  epic,
  roleFrontEnd,
  roleBackEndDevOps,
  complexity0,
  complexity1,
  complexity2,
  complexity3,
  statusUnassignedByBot,
] = [
  'er',
  'epic', 
  'roleFrontEnd',
  'roleBackEndDevOps',
  'complexity0',
  'complexity1',
  'complexity2',
  'complexity3',
  'statusUnassignedByBot',
].map(retrieveLabelDirectory);

// Exception and required label constants
const EXCEPTION_LABELS = [ER, epic];
const REQUIRED_ROLE_LABELS = [roleFrontEnd, roleBackEndDevOps];
const REQUIRED_COMPLEXITY_LABELS = [complexity1, complexity2, complexity3];
// Hard-coded statuses
const NEW_ISSUE_APPROVAL = 'New Issue Approval';
const IN_PROGRESS = 'In progress (actively working)';


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
  if (statusName === NEW_ISSUE_APPROVAL) {
    return true;
  }

  // If issue created by assignee or not self-assigned, skip complexity check
  if (currentIssue.assigneeId === currentIssue.creatorId ||
      currentIssue.assigneeId !== currentIssue.assignerId) {
    return true;
  }
  
  const hasAnyLabel = (labels, referenceLabels) =>
    labels.some(label => referenceLabels.includes(label));

  // If issue has any exception labels, skip complexity check
  if (hasAnyLabel(currentIssue.labels, EXCEPTION_LABELS)) {
    return true;
  }

  // If issue doesn't have required labels, skip complexity check
  if (!hasAnyLabel(currentIssue.labels, REQUIRED_ROLE_LABELS) ||
      !hasAnyLabel(currentIssue.labels, REQUIRED_COMPLEXITY_LABELS)) {
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
   
  // Check complexity1 (good first issue) eligibility
  if (currentIssueComplexityAndRoles[0].complexity === complexity1) {
    const complexity1Count = previousIssuesComplexityAndRoles.filter(
      issue => issue.complexity === complexity1
    ).length;

    if (complexity1Count >= 2) {
      return false;
    } else {
      return true;
    }
  }

  /* 
   Check if the assignee has only one role (front end or back end/devOps).
   If so, check their eligibility for complexity2/complexity3 (Small/Medium) complexity issues
   based on the number of previous issues of the same complexity.
  */ 
  if (assigneeRole.includes(roleFrontEnd) !==
      assigneeRole.includes(roleBackEndDevOps)) {
    const complexityCount = previousIssuesComplexityAndRoles.filter(
      issue => issue.complexity === currentIssueComplexityAndRoles[0].complexity
    ).length;
    
    if (complexityCount >= 1) {
      return false;
    }
  }

  // Check for complexity2/complexity3 (Small/Medium) complexity eligibility for assignee with both roles
  let matchingComplexityIssues = [];

  if (assigneeRole.includes(roleFrontEnd) &&
      assigneeRole.includes(roleBackEndDevOps)) {
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
      currentIssueComplexityAndRoles[0].role.includes(roleFrontEnd);
    const currentIssueHasBackEnd =
      currentIssueComplexityAndRoles[0].role.includes(roleBackEndDevOps);
    
    const previousMatchingIssueHasFrontEnd =
      previousMatchingIssue.role.includes(roleFrontEnd);
    const previousMatchingIssueHasBackEnd =
      previousMatchingIssue.role.includes(roleBackEndDevOps);

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
        label === complexity1 ||
        label === complexity2 ||
        label === complexity3
    ),
    role: issue.labels.filter(
      label =>
        label === roleFrontEnd || label === roleBackEndDevOps
    ),
  })).filter(issue => issue.complexity);
}

// Extracts the Skills Issue (Pre-work Checklist) from assigned issues.
function extractPreWorkIssueFromIssues(assignedIssues) {
  const preWorkIssue = assignedIssues.find(
    issue => issue.labels.includes(complexity0)
  );

  if (!preWorkIssue) {
    throw new Error(
      `Assignee's Skills Issue (Pre-work Checklist) not found in assigned issues.`
    );
  }

  return preWorkIssue;
}

// Extracts roles from the Skills Issue (Pre-work Checklist).
function extractRoleFromPreWorkIssue(preWorkIssue) {
  return preWorkIssue.labels.filter(
    label =>
      label === roleFrontEnd || label === roleBackEndDevOps
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
* @param {Object} preWorkIssue - The Skills Issue (Pre-work Checklist) object.
* @param {string} preWorkIssueProjectItemId - The project item ID of the
* Skills Issue (Pre-work Checklist).
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
      labels: [statusUnassignedByBot],
    });
  
    // Change issue's status to NEW_ISSUE_APPROVAL
    await mutateIssueStatus(
      github,
      context,
      projectItemId,
      statusFieldIds(NEW_ISSUE_APPROVAL)
    );
  
    // If the assignee's Skills Issue (Pre-work Checklist) is closed, open it
    if (preWorkIssue.state === 'closed') {
      await github.rest.issues.update({
        owner,
        repo,
        issue_number: preWorkIssue.issueNum,
        state: 'open',
      });

      // Brief delay allows Project automation to move Skills Issue to NEW_ISSUE_APPROVAL
      // before script moves it to IN_PROGRESS, ensuring correct final status 
      await setTimeout(5000);

      // Change Skills Issue (Pre-work Checklist) status to IN_PROGRESS
      await mutateIssueStatus(
        github,
        context,
        preWorkIssueProjectItemId,
        statusFieldIds(IN_PROGRESS)
      );
    }

    const commentBody = formatComplexityReminderComment(
      currentIssueNum,
      assigneeUsername
    );  

    // Post comment on the issue
    await postComment(currentIssueNum, commentBody, github, context);  

    // Post comment on the assignee's Skills Issue (Pre-work Checklist)
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
