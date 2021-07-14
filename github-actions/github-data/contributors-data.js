const core = require("@actions/core");
const { Octokit } = require("@octokit/rest");
const trueContributorsMixin = require("true-github-contributors");
const _ = require('lodash');


Object.assign(Octokit.prototype, trueContributorsMixin);
const octokit = new Octokit({ auth: process.env.token });


(async function main(){

  // const userRepos = await octokit.rest.repos.listForUser({
  //   username,
  // });
  // const userRepos = await octokit.request(`GET /users/${username}/repos`, {
  //   username: username,
  // });
  
  const today = new Date();
  let monthAgo = new Date(today.setMonth(today.getMonth() - 1));
  // monthAgo = monthAgo.slice(0,10);

  const contributorsList = await octokit.request('GET /repos/{owner}/{repo}/commits?since={monthAgo}', {
    owner: 'alexeysergeev-cm',
    repo: 'website',
    since: monthAgo,
  })
  console.log(contributorsList)
})()