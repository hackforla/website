/**
 * Function to get all repo issues that either are not assigned to a currentTeam member, or are assigned to 
 * inactive members so that leadership can be made aware that the issue does not have an active team member assigned.
 * @param {Object} currentTeam                 - currentTeam members (optional)
 * @param {Object} inactiveMemberOpenIssue     - inactive team members assigned to an open issue (optional)
 * @return {Object} nonTeamMemberOpenIssue     - non-team members assigned to open issues
 * @return {Object} inactiveMemberOpenIssue    - inactive team members, all assignments to open issues
 */
async function getOpenAssignedIssues(github, context, currentTeam = {}, inactiveMemberOpenIssue = {}) {
  let nonTeamMemberOpenIssue = {};
  let pageNum = 1;
  let result = [];

  // Since Github only allows to fetch max 100 items per request, we need to 'flip' pages
  while (true) {
    // Fetch 100 items per each page (`pageNum`)
    // https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#list-repository-issues
    const openIssues = await github.request('GET /repos/{owner}/{repo}/issues', {
      owner: context.repo.owner,
      repo: context.repo.repo,
      assignee: '*',
      per_page: 100,
      page: pageNum
    });

    // If the API call returns an empty array, break out of loop- there is no additional data.
    // Else if data is returned, push it to `result` and increase the page number (`pageNum`)
    if (!openIssues.data.length) {
      break;      
    } else {
      result = result.concat(openIssues.data);
      pageNum++;
    }
  }

  // Loop through each result individually
  for (const contributorInfo of result) {
    let assignee = contributorInfo.assignee.login;
    let issueNum = contributorInfo.number;
    // Check if assignee is not a currentTeam member, then find their other open issues
    // Else if assignee is on the inactiveMember list, find all of their open issues
    if (!(assignee in currentTeam)) {
      (nonTeamMemberOpenIssue[assignee] ??= []).push(issueNum);
    } else if (assignee in inactiveMemberOpenIssue && !inactiveMemberOpenIssue[assignee].includes(issueNum)) {
      inactiveMemberOpenIssue[assignee].push(issueNum);
    }
  }

  return [nonTeamMemberOpenIssue, inactiveMemberOpenIssue]; 
}

module.exports = getOpenAssignedIssues;
