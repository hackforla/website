const core = require("@actions/core");
const { Octokit } = require("@octokit/rest");
const trueContributorsMixin = require("true-github-contributors");
const _ = require('lodash');


Object.assign(Octokit.prototype, trueContributorsMixin);
const octokit = new Octokit({ auth: process.env.token });


(async function main(){
  console.log('hello');

  let username = 'alexeysergeev-cm'
  // const userRepos = await octokit.rest.repos.listForUser({
  //   username,
  // });
  // const userRepos = await octokit.request(`GET /users/${username}/repos`, {
  //   username: username,
  // });
  

  const contributorsList = await octokit.request('GET /repos/{owner}/{repo}/teams', {
    owner: 'alexeysergeev-cm',
    repo: 'website'
  })
  console.log(contributorsList)
})()