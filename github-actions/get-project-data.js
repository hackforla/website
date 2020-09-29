const core = require("@actions/core");
const fs = require("fs");
const { Octokit } = require("@octokit/rest");
const trueContributorsMixin = require("true-github-contributors");

// Record the time this script started running so it can be stored later
const dateRan = new Date();

// Extend Octokit with new contributor endpoints and construct instance of class with API token 
Object.assign(Octokit.prototype, trueContributorsMixin);
const octokit = new Octokit({ auth: core.getInput("token") });

(async function main() {
  let { oldGitHubData, dateLastRan } = getLocalData();
  // Convert project array to map (JSON object) with repo id's as keys for more efficient lookup
  oldGitHubData = projectListToMap(oldGitHubData);
  let newGitHubData = [];
  // Fetch all tagged and untagged hfla repositories
  let allRepos = await getAllRepos();

  // Fetch GitHub Data for each repository and add it to overall data
  console.log(`Fetching data since: ${dateLastRan.toString()}`);
  for(let repo of allRepos) {
    let repoLanguages = await octokit.repos.listLanguages({ owner: repo.owner.login, repo: repo.name });
    let projectContributors = await getProjectContributors(repo, (oldGitHubData[repo.id]) ? dateLastRan : undefined);
    if(!(oldGitHubData.hasOwnProperty(repo.id))) console.log("New project added to data!");
    console.log(`Contributions for ${repo.name}`);
    console.log(projectContributors);

    // If previous data exists, aggregate new contribution data with previous contribution data
    if(oldGitHubData.hasOwnProperty(repo.id)){
      // "_aggregateContributors" is a helper method in the trueContributorsMixin that aggregates contributions from contributor objects based on a property "id"
      projectContributors = octokit._aggregateContributors( projectContributors.concat(oldGitHubData[repo.id].contributorsComplete.data) );
    }

    // Add data to new GitHub data array
    newGitHubData.push({
      id: repo.id,
      name: repo.name,
      repoEndpoint: repo.url,
      languages: Object.keys(repoLanguages.data),
      contributorsComplete: {
        data: projectContributors
      }
    });
  }

  // Write updated data to github-data.json
  writeData(newGitHubData);

})();

/**
 * Retrieves data from github-data.json file
 * @return {Object}     [Contains old project data as "oldGitHubData" and the date this script last ran as "dateLastRan"]
 */
function getLocalData(){
  let data = fs.readFileSync('_data/github-data.json', 'utf8');
  data = JSON.parse(data);
  if(Date.parse(data[0]) > 0){
    let date = new Date(data[0]);
    return { oldGitHubData: data.slice(1), dateLastRan: date.toISOString() }
  }
  throw new Error("No valid date value found for when script last ran.");
}

/**
 * Creates map corresponding repo id's to project data given a list of projects 
 * @param {Array} projectList     [List of project data objects]
 * @return {Object}     [Contains project id's from "projectList" as keys and corresponding "projectList" elements as values ]
 */
function projectListToMap(projectList) {
  let projectMap = {};
  for(project of projectList){
    projectMap[project.id] = project;
  }
  return projectMap;
}

/**
 * Retrieves desired hfla repositories
 * @return {Array}     [Array of GitHub repository objects]
 */
async function getAllRepos() {
  let taggedRepos = await octokit.paginate(octokit.search.repos, {q: "topic:hack-for-la"});
  // Hard coded list of untagged repos we would like to fetch data on
  let untaggedRepos = [79977929];
  for(let i = 0; i < untaggedRepos.length; i++){
    response = await octokit.request("GET /repositories/:id", { id: untaggedRepos[i] });
    untaggedRepos[i] = response.data;
  }
  return taggedRepos.concat(untaggedRepos);
}

/**
 * Fetches project contributors for a given repo
 * @param {Object} repo     [Repository object from GitHub]
 * @param {String} since      [Date to fetch contributors from] 
 * @return {Object}     [Contains project id's from "projectList" as keys and corresponding "projectList" elements as values ]
 */
async function getProjectContributors(repo, dateLastRan) {
  // Construct parameters for request
  let requestParams = {};
  let isOrg = (repo.owner.type == "Organization" && repo.owner.login != "hackforla" && repo.owner.login != "cfa");
  if(isOrg) {
    requestParams.org = repo.owner.login;
  } else {
    requestParams.owner = repo.owner.login;
    requestParams.repo = repo.name;
  }
  // If dateLastRan is given, only fetch data from when this script last ran
  if(dateLastRan) requestParams.since = dateLastRan;

  let projectContributors = (isOrg) ?
      await octokit.listCommitCommentContributorsForOrg(requestParams) :
      await octokit.listCommitCommentContributors(requestParams);

  // Format contributors data to minimum properties needed
  for(let i = 0; i < projectContributors.length; i++){
    currentContributor = projectContributors[i];
    projectContributors[i] = {
      id: currentContributor.id,
      github_url: currentContributor.html_url,
      avatar_url: currentContributor.avatar_url,
      gravatar_id: currentContributor.gravatar_id,
      contributions: currentContributor.contributions
    };
  }
  return projectContributors;
}

/**
 * Writes project data to local 
 * @param {Array} projectData     [List of project data to write]
 */
function writeData(projectData){
  projectData.sort(sortById);
  // Store the date this script finished running. dateRan is a global variable defined at the beginning of this script
  projectData.unshift(dateRan.toString());
  fs.writeFileSync('_data/github-data.json', JSON.stringify(projectData, null, 2));
}

/**
 * Function to pass to JavaScript's sort method to sort project data by the id of the project repository
 * @param {Object} a     [Project data object]
 * @param {Object} b     [Project data object]
 * @return {Integer}     [0 if project id's are equal, positive if a.id > b.id, and negative if a.id < b.id]
 */
function sortById(a, b) {
  if(a.id < b.id) {
    return -1;
  } else if(a.id > b.id) {
    return 1;
  }
  return 0;
}