// Import modules

// Global variables
var github;
var context;

async function main({ g, c }) {
  github = g;
  context = c;

  const org = "hackforla";
  const teamSlug = "website-write";
  const owner = "hackforla";
  const repo = "website";

  // get number of team members for the website-write team (need this number to determine amount of page numbers to fetch from Github API)
  // Github API limits 100 max results per request
  let pageNumbers = await getNumberOfPages(org, teamSlug, github);
  let allTeamMembers = await getAllMembers(org, teamSlug, pageNumbers);

  return await selectMembersWithNoIssues(allTeamMembers, owner, repo)
}

const getNumberOfPages= async (org, teamSlug) => {
  // get number of pages, needed for `getMembersWithoutIssues` function. GithubAPI has a return limit of 100 results => over 300 team members in website-write
  let websiteWriteTeam = await github.rest.teams.getByName({
    org,
    team_slug: teamSlug,
  });

  let membersCount = websiteWriteTeam.data.members_count;
  let pageNumbers = Math.ceil(membersCount / 100);
  return pageNumbers;
};

const getAllMembers = async (org, teamSlug, pageNumbers) => {
  // get all team members
  let allTeamMembers = [];
  for (let currPage = 1; currPage <= pageNumbers; currPage += 1) {
    let teamMembers = await github.rest.teams.listMembersInOrg({
      org,
      team_slug: teamSlug,
      per_page: 100,
      page: currPage,
    });
    allTeamMembers = allTeamMembers.concat(teamMembers.data);
  }
  return allTeamMembers
};

const selectMembersWithNoIssues = async (allTeamMembers, owner, repo) => {
    // select team members without open issues
    let inactiveMembers = [];
    for (let member of allTeamMembers) {
        let assignee = member.login;
        let memberIssues = await github.rest.issues.listForRepo({
            owner,
            repo,
            state: "open",
            assignee,
        });
        if (memberIssues.data.length === 0) {
            inactiveMembers.push(assignee);
        }
    }
    return inactiveMembers
}

module.exports = main;
