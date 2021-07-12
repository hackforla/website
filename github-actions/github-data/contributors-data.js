const core = require("@actions/core");
const { Octokit } = require("@octokit/rest");
const trueContributorsMixin = require("true-github-contributors");
const _ = require('lodash');


Object.assign(Octokit.prototype, trueContributorsMixin);
const octokit = new Octokit({ auth: process.env.token });


(async function main(){
  console.log('hello');
})()