const core = require("@actions/core");
const { Octokit } = require("@octokit/rest");
const trueContributorsMixin = require("true-github-contributors");
const _ = require('lodash');


Object.assign(Octokit.prototype, trueContributorsMixin);
const octokit = new Octokit({ auth: process.env.token });


(async function main(){


  const today = new Date();
  // const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
  const dayAgo = new Date(today.setDate(today.getDate() - 1));

  const commentCommitWikiContributors = {};

  //fetch commit contirbutors;
  const commitContributorsList = await octokit.request('GET /repos/{owner}/{repo}/commits', {
    owner: 'alexeysergeev-cm',
    repo: 'website',
    since: dayAgo.toISOString()
  })

  for(const contributorInfo of commitContributorsList.data){
    commentCommitWikiContributors[contributorInfo.author.login] = true;
  }

  //fetch comments contributors
  const commentsContributorsList = await octokit.request('GET /repos/{owner}/{repo}/issues/comments', {
    owner: 'alexeysergeev-cm',
    repo: 'website',
    since: dayAgo.toISOString()
  })

  for(const contributorInfo of commentsContributorsList.data){
    commentCommitWikiContributors[contributorInfo.user.login] = true;
  }
  

  console.log(commentCommitWikiContributors);

  const teamMembers = await octokit.request('GET /orgs/{org}/teams/{team_slug}/members', {
    org: 'org', //change to hackforla
    team_slug: 'team_slug' ///?
  })

  const removedContributors = []

  for(const member of teamMembers.data){
    if (!commentCommitWikiContributors[member.login]){
      await octokit.request('DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}', {
        org: 'org', //change to hackforla
        team_slug: 'team_slug', //?
        username: member.login
      })

      removedContributors.push(member.login)
    }
  }

  console.log(removedContributors);


  // const teamsHFLA = await octokit.request('GET /orgs/{org}/teams', {
  //   org: 'hackforla'
  // })
  // console.log(teamsHFLA)
})()