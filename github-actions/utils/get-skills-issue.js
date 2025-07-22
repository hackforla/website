/**
 * Helper function to retrieve eventActor's Skills Issue
 * @param {String} eventActor        - Key reference to look up user's Skill Issue
 * @return {Object}                  - eventActor's skillsIssueNum and skillsIssueNodeId
 */
async function retrieveSkillsIssue(eventActor) {
    // Note that this returns the first 10 issues assigned to the eventActor- which is presumed
    // to include that person's Skills Issue- this might need to be changed if Skill's Issues not found 
    // https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#list-repository-issues
    const issueData = await github.request('GET /repos/{owner}/{repo}/issues', {
        owner: context.repo.owner,
        repo: context.repo.repo,
        assignee: eventActor,
        state: 'all',
        direction: 'asc',
        per_page: 10,
    });

    // Find issue with the `Complexity: Prework` label, then extract skillsIssueNum and skillsIssueNodeId
    const skillsIssue = issueData.data.find(issue => issue.labels.some(label => label.name === "Complexity: Prework"));
    const skillsIssueNum = skillsIssue ? skillsIssue.number : null;
    const skillsIssueNodeId = skillsIssue ? skillsIssue.node_id : null;

    console.log(`Found skills issue ${skillsIssueNum}: ${skillsIssueNodeId}`);

    return {skillsIssueNum, skillsIssueNodeId};
}

module.exports = retrieveSkillsIssue;
