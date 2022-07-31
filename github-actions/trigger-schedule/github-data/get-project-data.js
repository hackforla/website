const core = require("@actions/core");
const fs = require("fs");
const { Octokit } = require("@octokit/rest");
const trueContributorsMixin = require("true-github-contributors");
const _ = require('lodash');

// Record the time this script started running so it can be stored later
const dateRan = new Date();
// Hard coded list of untagged repos we would like to fetch data on
// 79977929 -> https://github.com/hunterowens/workfor.la
// 277577906 -> https://github.com/codeforamerica/brigade-playbook
const untaggedRepoIds = [79977929, 277577906];


// Extend Octokit with new contributor endpoints and construct instance of class with API token 
Object.assign(Octokit.prototype, trueContributorsMixin);
const octokit = new Octokit({ auth: process.env.token });


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
    let commitContributors = await getCommitContributors(repo);
    if(commitContributors){
      let issueCommentContributors = await getCommentContributors(repo, (oldGitHubData.hasOwnProperty(repo.id)) ? dateLastRan.toISOString() : undefined);
      console.log(`Comment contributors from ${repo.name}:`);
      console.log(issueCommentContributors);
      // If previous issue comment contributions data exists, aggregate old issue comment contributions data with previous issue comment contributions data
      if(oldGitHubData.hasOwnProperty(repo.id)){
        // "_aggregateContributors" is a helper method in the trueContributorsMixin that aggregates contributions from contributor objects based on a property "id"
        issueCommentContributors = octokit._aggregateContributors( issueCommentContributors.concat(oldGitHubData[repo.id].issueComments.data) );
      }
  
      // Create a copy of commitContributors to use to aggregate with issueCommentContributors
      let commitContributorsCopy = _.cloneDeep(commitContributors);
      let projectContributors = octokit._aggregateContributors(commitContributorsCopy.concat(issueCommentContributors));
  
      // Add data to new GitHub data array
      newGitHubData.push({
        id: repo.id,
        name: repo.name,
        languages: Object.keys(repoLanguages.data),
        repoEndpoint: repo.url,
        commitContributors: {
          data: commitContributors
        },
        issueComments: {
          data: issueCommentContributors
        },
        contributorsComplete: {
          data: projectContributors
        },
      });

    }

  }

  // Write updated data to github-data.json
  writeData(newGitHubData);

})();

/**
 * Retrieves data from github-data.json file
 * @return {Object}     [Contains old project data as "oldGitHubData" and the date this script last ran as "dateLastRan"]
 */
function getLocalData(){
  let data = fs.readFileSync('_data/external/github-data.json', 'utf8');
  data = JSON.parse(data);
  if(Date.parse(data[0]) > 0){
    let date = new Date(data[0]);
    return { oldGitHubData: data.slice(1), dateLastRan: date }
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
  let allRepos = [];
  let taggedRepos = await octokit.paginate(octokit.search.repos, {q: "topic:hack-for-la"});
  allRepos = taggedRepos;
  for(let i = 0; i < untaggedRepoIds.length; i++){
    let untaggedRepo = await octokit.request("GET /repositories/:id", { id: untaggedRepoIds[i] });
    allRepos.push(untaggedRepo.data);
  }
  return allRepos;
}

/**
 * Fetches commit contributors for a given repo
 * @param {Object} repo     [Repository object from GitHub]
 * @return {Array}     [An array of contributors based on how many commits they have made]
 */
async function getCommitContributors(repo) {
  // Construct parameters for request
  let requestParams = constructContributorParams(repo);

  try{
  // Get commit contributors. listContributorsForOrg is a method from trueContributorsMixin that calls repos.listContributors across orgs in a repo
  let commitContributors = (requestParams.hasOwnProperty("org")) ? 
    await octokit.listContributorsForOrg(requestParams) :
    await octokit.paginate(octokit.repos.listContributors, requestParams);
    formatContributorsList(commitContributors);

    return commitContributors;
  }catch(err){
    console.error(err);
  }

}

/**
 * Fetches comment contributors for a given repo
 * @param {Object} repo     [Repository object from GitHub]
 * @param {String} dateLastRan      [ISO 8601 Date to fetch contributors from]
 * @return {Array}     [An array of contributors based on how many commits they have made]
 */
async function getCommentContributors(repo, dateLastRan) {
  // Construct parameters for request
  let requestParams = constructContributorParams(repo);
  if(dateLastRan) requestParams.since = dateLastRan;

  let issueCommentContributors = (requestParams.hasOwnProperty("org")) ?
    await octokit.listCommentContributorsForOrg(requestParams) :
    await octokit.listCommentContributors(requestParams);

  formatContributorsList(issueCommentContributors);

  return issueCommentContributors;
}

/**
 * Requests owner login for a given repo.
 * @param {Object} repo     [Repository object from GitHub]
 * @return {Object}     [An object containing parameters for making a contributors data request]
 */
function constructContributorParams(repo) {
  let requestParams = {};
  let isOrg = (repo.owner.type == "Organization" && repo.owner.login != "hackforla" && repo.owner.login != "codeforamerica");
  if(isOrg) {
    requestParams.org = repo.owner.login;
  } else {
    requestParams.owner = repo.owner.login;
    requestParams.repo = repo.name;
  }
  return requestParams;
}


/**
 * Removes unwanted properties for each contributors in a contributors lists in place
 * @param {Array} contirbutorsList     [List of contributor objects]
 */
function formatContributorsList(contributorsList){
  for(let i = 0; i < contributorsList.length; i++){
    currentContributor = contributorsList[i];
    contributorsList[i] = {
      id: currentContributor.id,
      github_url: currentContributor.html_url,
      avatar_url: currentContributor.avatar_url,
      gravatar_id: currentContributor.gravatar_id,
      contributions: currentContributor.contributions
    };
  }
} 

/**
 * Writes project data to local 
 * @param {Array} projectData     [List of project data to write]
 */
function writeData(projectData){
  projectData.sort(sortById);
  // Store the date this script finished running. dateRan is a global variable defined at the beginning of this script
  projectData.unshift(dateRan.toString());
  fs.writeFileSync('_data/external/github-data.json', JSON.stringify(projectData, null, 2));
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
