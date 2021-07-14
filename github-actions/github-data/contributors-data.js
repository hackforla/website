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
  // const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
  const dayAgo = new Date(today.setDate(today.getDate() - 1));
  // monthAgo = monthAgo.slice(0,10);

  const contributorsList = await octokit.request('GET /repos/{owner}/{repo}/commits?since={dayAgo}', {
    owner: 'alexeysergeev-cm',
    repo: 'website',
    since: dayAgo
  })
  console.log(contributorsList.url)
  console.log(dayAgo)
  for(const contributorInfo of contributorsList.data){
    console.log(contributorInfo.author.login)
    console.log(contributorInfo.commit.author)
  }
})()