/**
 * Function to get all repo issues that either are not assigned to a currentTeam member, or are assigned to 
 * inactive members so that leadership can be made aware that the issue does not have an active team member assigned.
 * @param {Object} currentTeam                 - currentTeam members
 * @param {Object} inactiveMemberOpenIssue     - inactive team members assigned to an open issue 
 * @return {Object} nonTeamMemberOpenIssue     - non-team members assigned to open issues
 * @return {Object} inactiveMemberOpenIssue    - inactive team members, all assignments to open issues
 */
async function getOpenAssignedIssues(currentTeam = {}, inactiveMemberOpenIssue = {}) {
  let nonTeamMemberOpenIssue = {};
  let pageNum = 1;
  let result = [];

  // Since Github only allows to fetch max 100 items per request, we need to 'flip' pages
  while (true) {
    // Fetch 100 items per each page (`pageNum`)
    const openIssues = await github.request('GET /repos/{owner}/{repo}/issues', {
      // owner: context.repo.owner,
      owner: 'hackforla',
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

  // For the list of all open issues, check whether there is an assignee who is not a current team member
  for (const contributorInfo of result) {
    let assignee = contributorInfo.assignee.login;
    let issueNum = contributorInfo.number;
    // Check if the assignee is not on the currentTeam, then 
    if (!(assignee in currentTeam)) {
      if (assignee in inactiveMemberOpenIssue && !inactiveMemberOpenIssue[assignee].includes(issueNum)) {
        inactiveMemberOpenIssue[assignee].push(issueNum);
      } else {
        nonTeamMemberOpenIssue[assignee] = issueNum;
      }
    }
  }

  return [nonTeamMemberOpenIssue, inactiveMemberOpenIssue]; 
}
