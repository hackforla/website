const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const request = require('request-promise');

var github = {
  token: null,
  apiData: [],
  getAllTaggedRepos: function() {
    return request({
      "method": "GET",
      "uri": "https://api.github.com/search/repositories?q=topic:hack-for-la&sort=updated&order=desc",
      "json": true,
      "headers": {
        "Authorization": "token " + github.token,
        "User-Agent": "Hack For LA"
      }
    }).then(function(body) {
      body.items.forEach(function(project) {
        github.apiData.push({
          id: project.id,
          name: project.name,
          languages: { url: project.languages_url, data: [] },
          contributors: { url: [project.contributors_url], data: [] },
          repoEndpoint: project.url,
          issueComments: {url: [project.issue_comment_url.substring(0, project.issue_comment_url.length-9)], data: []}
        });
      });
    }).catch(function(err) {
      throw err;
    });
  },
  getUntaggedRepos: function(ids) {
    // Check for repos not under hackforla but that we have the id for
    let extraRepos = [];
    for(id of ids){
      // Check if id is in github-data-json
      let found = false;
      for(project of github.apiData){
        if (project.id == id) found = true;
      }
      if (found) continue;
      extraRepos.push(
        request({
          "method": "GET",
          "uri": `https://api.github.com/repositories/${id}`,
          "json": true,
          "headers": {
            "Authorization": "token " + github.token,
            "User-Agent": "Hack For LA"
          }
        }).then(function(body){
          github.apiData.push({
            id: body.id,
            name: body.name,
            languages: { url: body.languages_url, data: [] },
            contributors: { url: [body.contributors_url], data: [] },
            repoEndpoint: body.url,
            issueComments: {url: [body.issue_comment_url.substring(0, body.issue_comment_url.length-9)], data: []}
          });
        }).catch(function(err){
          throw err;
        })
      );
      return Promise.all(extraRepos);
    }
  },
  getLanguageInfo: function(url) {
    return request({
      "method": "GET",
      "uri": url,
      "json": true,
      "headers": {
        "Authorization": "token " + github.token,
        "User-Agent": "Hack For LA"
      }
    }).then(function(body) {
      // The body contains an ordered list of languge + lines of code.
      // We care about the order of the names but not the number of lines of code.
      return Promise.resolve(Object.keys(body));
    }).catch(function(err) {
        throw err;
    });
  },
  getContributorsInfo: function(url) {
    return request({
      "method": "GET",
      "uri": url,
      "json": true,
      "headers": {
        "Authorization": "token " + github.token,
        "User-Agent": "Hack For LA"
      }
    }).then(function(body) {
      // return a list of contributors sorted by number of commits
      let contributors = [];
      // body will be undefined if repo is an empty repo (no contributors)
      if(body){
        body.forEach(function(user) {
          contributors.push({
            "id": user.id,
            "github_url": user.html_url,
            "avatar_url": user.avatar_url,
            "gravatar_id": user.gravatar_id,
            "contributions": user.contributions
          });
        });
      }
      return Promise.resolve(contributors);
    }).catch(function(err) {
        throw err;
    });
  },
  compareValues: function(key, order = 'asc') {
    return function innerSort(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0;
      }

      const varA = (typeof a[key] === 'string')
            ? a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string')
            ? b[key].toUpperCase() : b[key];

      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return (
        (order === 'desc') ? (comparison * -1) : comparison
      );
    };
  },
  getOrgLinks: function(url) {
    // Check if repo belongs to a different org than hfla. If it does, return the contributor links of all repos in that org
    return request({
      "method": "GET",
      "uri": url,
      "json": true,
      "headers": {
        "Authorization": "token " + github.token,
        "User-Agent": "Hack For LA"
      }
    }).then(function(body) {
      if(!body.organization || body.organization.login == 'hackforla') return {"repos": [], "issueCommentsUrls": []};
      return github.getOrgLinksHelper(body.organization.repos_url);
    }).catch(function(err) {
      throw err;
    });
  },
  getOrgLinksHelper: function(url) {
    // Helper method for getMoreContributorLinks that returns the contributor links of repos from a organization url
    return request({
      "method": "GET",
      "uri": url,
      "json": true,
      "headers": {
        "Authorization": "token " + github.token,
        "User-Agent": "Hack For LA"
      }
    }).then(function(body) {
      let repos = [];
      let issueCommentUrls = [];
      for(repo of body) {
        issueCommentUrls.push(repo.issue_comment_url.substring(0, repo.issue_comment_url.length-9));
        repos.push(repo.contributors_url);
      }
      return {
        "repos": repos,
        "issueCommentsUrls": issueCommentUrls
      }
    }).catch(function(err) {
      throw err;
    });
  },
  getRecentIssueComments: function(url, dateLastRan) {
    return request({
      "method": "GET",
      "uri": `${url}?per_page=100&since=${dateLastRan.toISOString()}`,
      "json": true,
      "headers": {
        "Authorization": "token " + github.token,
        "User-Agent": "Hack For LA"
      }
    }).then(function(body) {
      // return a list of commenters
      let commenters = [];
      body.forEach(function(comment) {
        // if(comment.created_at != comment.updated_at) return;
        commenters.push({
          "id": comment.user.id,
          "github_url": comment.user.html_url,
          "avatar_url": comment.user.avatar_url,
          "gravatar_id": comment.user.gravatar_id,
          "contributions": 1,
          "html_url": comment.html_url,
          "created_at": comment.created_at,
          "updated_at": comment.updated_at
        });
      });
      return Promise.resolve(commenters);
    }).catch(function(err) {
        throw err;
    });
  }
}

let ldone = false;
let cdone = false;
let dateRan = new Date();

async function main(params) {
  console.log('In the async function main');

  github.token = params.token;

  untaggedRepos = [79977929];
  await github.getAllTaggedRepos();
  await github.getUntaggedRepos(untaggedRepos);
  await getSiblingUrls(github);

  getLanguageData(github);
  getContributorData(github);

}

const token = core.getInput('token');
main({ 'token': token });

async function getSiblingUrls(github){
  for(i = 0; i < github.apiData.length; i++){
    let {repos, issueCommentsUrls} = await github.getOrgLinks(github.apiData[i].repoEndpoint);
    
    github.apiData[i].contributors.url = github.apiData[i].contributors.url.concat(repos);
    github.apiData[i].contributors.url = github.apiData[i].contributors.url.filter(function(link, index, array){
      return array.indexOf(link) == index;
    });
    
    github.apiData[i].issueComments.url = github.apiData[i].issueComments.url.concat(issueCommentsUrls);
    github.apiData[i].issueComments.url = github.apiData[i].issueComments.url.filter(function(link, index, array){
      return array.indexOf(link) == index;
    });
  }
}

function getLanguageData(github){
  let lps = [];
  for (i = 0; i < github.apiData.length; i++) {
    lps.push(github.getLanguageInfo(github.apiData[i].languages.url));
  }
  Promise.all(lps)
    .then(function(ls) {
      for (i = 0; i < ls.length; i++) {
        github.apiData[i].languages.data = ls[i]
      }
      console.log('Language data fetched.');
      ldone = true;
      if (cdone) {
        console.log('Calling finish in languages work');
        finish();
      }
    })
    .catch(function(err) {
      throw err;
    }
  );  
}

async function getContributorData(github){
  // Added awaits even though there is a promise because I was running into rate limits
  // (too many concurent request). I added the awaits to remedey that 
  let commitContributorsWork = await getCommitContributorsData(github);
  let commentersContributorsWork = await getCommenterContributorsData(github);
  Promise.all([commitContributorsWork, commentersContributorsWork])
    .then(function(){
      threadCommitsComments();
      console.log('Commit and commenter data combined.');
      cdone = true;
      if(ldone){
        console.log('Calling finish in contributors work');
        finish();
      }
    })
    .catch(function(err){
      throw err;
    });
}

function getCommitContributorsData(github){
  let cps = [];
  for(i = 0; i < github.apiData.length; i++) {
    let contributorData = [] // Array to hold contributors data for each repo in project [i]
    for(link of github.apiData[i].contributors.url) {
      contributorData.push(github.getContributorsInfo(link));
    }
    cps.push(contributorData);
  }
  
  let contributorsDataPromises = [];
  for(i = 0; i < cps.length; i++) {
    (function(i) {
      let contributorsDataPromise = Promise.all(cps[i])
        .then(function(cs) {
          let contributors = cs.flat();
          contributors = condenseContributorsList(contributors);
          github.apiData[i].contributors.data = contributors;
        }).catch(function(err) {
          throw err;
        });
      contributorsDataPromises.push(contributorsDataPromise);
    })(i);
  }
  return Promise.all(contributorsDataPromises)
    .then(function(contributorsData){
      console.log('Commit data fetched.');
    })
    .catch(function(err){
      throw err;
    }
  );
}

function getCommenterContributorsData(github){
  let { oldGitHubData, dateLastRan } = getLocalData();
  console.log(`Fetching comments since ${dateLastRan.toString()}`);
  let cmps = [];
  for (i = 0; i < github.apiData.length; i++) {
    let contributorData = [];
    for(link of github.apiData[i].issueComments.url){
      contributorData.push(github.getRecentIssueComments(link, dateLastRan));
    }
    cmps.push(contributorData);
  }

  let commenterDataPromises = [];
  for(i = 0; i < cmps.length; i++){
    (function(i, oldGitHubData){
      let commenterDataPromise = Promise.all(cmps[i])
        .then(function(cm){
          let commenters = cm.flat();
          console.log(`Comments from ${github.apiData[i].name}:`);
          console.log(commenters);
          // Get old comments data. Not using index i because what if the new data has a
          // different amount of projects than the old data
          let oldDataIndex = -1;
          for(let z = 0; z < oldGitHubData.length; z++){
            if(github.apiData[i].id == oldGitHubData[z].id) {
              oldDataIndex = z;
            }
          }
          if(oldDataIndex > 0){
            // Old data is found, thread old and new data
            let oldCommentData = oldGitHubData[oldDataIndex].issueComments.data;
            commenters = commenters.concat(oldCommentData);
          }
          commenters = condenseContributorsList(commenters);
          github.apiData[i].issueComments.data = commenters;
        })
        .catch(function(err){
          throw err;
        });
      commenterDataPromises.push(commenterDataPromise);
    })(i, oldGitHubData);
  }
  return Promise.all(commenterDataPromises)
    .then(function(commenterData){
      console.log('Commenter data fetched.');
    })
    .catch(function(err){
      throw err;
    }
  );
}

function getLocalData(){
  let data = fs.readFileSync('_data/github-data.json', 'utf8');
  data = JSON.parse(data);
  if(Date.parse(data[0]) > 0){
    return { oldGitHubData: data.slice(1), dateLastRan: new Date(data[0]) }
  }
  throw "No valid date value found for when script last ran.";
}

function condenseContributorsList(contributors){
  let contributorsDictionary = {};
  for(i = 0; i < contributors.length; i++){
    let contributor = contributors[i];
    if(contributorsDictionary.hasOwnProperty(contributor.id)){
      contributorsDictionary[contributor.id].contributions += contributor.contributions;
    }
    else {
      contributorsDictionary[contributor.id] = {
        "id": contributor.id,
        "github_url": contributor.github_url,
        "avatar_url": contributor.avatar_url,
        "gravatar_id": contributor.gravatar_id,
        "contributions": contributor.contributions
      };
    }
  }
  let contributorData = [];
  for(contributor in contributorsDictionary){
    contributorData.push(contributorsDictionary[contributor]);
  }
  contributorData.sort(github.compareValues('contributions', order = 'desc'));
  return contributorData;
}

function threadCommitsComments(){
  for(let i = 0; i < github.apiData.length; i++){
    let contributorsDictionary = {};
    let commitContributions = deepCopyFunction(github.apiData[i].contributors.data);
    let commentContributions = deepCopyFunction(github.apiData[i].issueComments.data);

    for(j = 0; j < commitContributions.length; j++){
      let contributor = commitContributions[j];
      contributorsDictionary[contributor.id] = contributor;
    }
    for(j = 0; j < commentContributions.length; j++){
      let commenter = commentContributions[j];
      if(contributorsDictionary.hasOwnProperty(commenter.id)){
        contributorsDictionary[commenter.id].contributions += commenter.contributions; // This number is changing the contributors data
      }
      else {
        contributorsDictionary[commenter.id] = {
          "id": commenter.id,
          "github_url": commenter.github_url,
          "avatar_url": commenter.avatar_url,
          "gravatar_id": commenter.gravatar_id,
          "contributions": commenter.contributions
        };
      }
    }
    let contributorsData = [];
    for(contributor in contributorsDictionary){
      contributorsData.push(contributorsDictionary[contributor]);
    }
    contributorsData.sort(github.compareValues('contributions', order = 'desc'));
    github.apiData[i].contributorsComplete = {
      data: contributorsData
    };
  }
}

// Deep copy function I got from a medium article
const deepCopyFunction = (inObject) => {
  let outObject, value, key

  if (typeof inObject !== "object" || inObject === null) {
    return inObject // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {}

  for (key in inObject) {
    value = inObject[key]

    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = deepCopyFunction(value)
  }

  return outObject
}

function finish(){
  let output = github.apiData.sort(github.compareValues('id'));
  output.unshift(dateRan.toString());
  // console.log(JSON.stringify(output, null, 2));
  fs.writeFileSync('_data/github-data.json', JSON.stringify(output, null, 2));
}