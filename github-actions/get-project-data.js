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
          repoEndpoint: project.url
        });
      });
    }).catch(function(err) {
      return err.message;
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
            repoEndpoint: body.url
          });
        }).catch(function(err){
          return err.message;
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
      return err.message;
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
      body.forEach(function(user) {
        contributors.push({
          "id": user.id,
          "github_url": user.html_url,
          "avatar_url": user.avatar_url,
          "gravatar_id": user.gravatar_id,
          "contributions": user.contributions
        });
      });
      return Promise.resolve(contributors);
    }).catch(function(err) {
      return err.message;
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
  getMoreContributorLinks: function(url) {
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
      if(!body.organization || body.organization.login == 'hackforla') return [];
      return github.getReposFromOrg(body.organization.repos_url);
    }).catch(function(err) {
      return err.message;
    });
  },
  getReposFromOrg: function(url) {
    // Helper method for getMoreContributorLinks that returns the contributor links of repos from a organization url
    return request({
      "method": "GET",
      "uri": url,
      "json": true,
      "headers": {
        "Authorization": "token" + github.token,
        "User-Agent": "Hack For LA"
      }
    }).then(function(body) {
      let repos = [];
      for(repo of body) {
        repos.push(repo.contributors_url);
      }
      return repos;
    }).catch(function(err) {
      return err.message;
    });
  }
}

async function main(params) {
  console.log('In the async function main');
  github.token = params.token;


  untaggedRepos = [79977929];
  await github.getAllTaggedRepos();
  await github.getUntaggedRepos(untaggedRepos);
  let lps = [], ldone = false
  let cps = []
  let clps = [], cdone = false // Clps represents Contributor Links Promises, which is the array of promises that will result in arrays of contributor links for projects under a different org. cdone represents the whole process of getting contributors being done
  for (i = 0; i < github.apiData.length; i++) {
    lps.push(github.getLanguageInfo(github.apiData[i].languages.url));
    clps.push(github.getMoreContributorLinks(github.apiData[i].repoEndpoint)); // Fetch all possible contributor links first before fetching contributor data
  }
  // Get language data
  Promise.all(lps)
    .then(function(ls) {
      for (i = 0; i < ls.length; i++) {
        github.apiData[i].languages.data = ls[i]
      }
      ldone = true
      if (cdone) {
        console.log('Calling finish in languages work');
        finish();
      }
    })
    .catch(function(e) {
      console.log(e)
    });
  // Get all contributors data
  Promise.all(clps)
    .then(function(cls) {
      // Add contribtuor links and remove duplicates
      for (i = 0; i < clps.length; i++) {
        github.apiData[i].contributors.url = github.apiData[i].contributors.url.concat(cls[i]);
        github.apiData[i].contributors.url = github.apiData[i].contributors.url.filter(function(link, index, array){
          return array.indexOf(link) == index;
        });
      }
      // Get contributors data from each link
      for(i = 0; i < github.apiData.length; i++) {
        let data = [] // Array to hold contributors data for each repo in project [i]
        for(link of github.apiData[i].contributors.url) {
          data.push(github.getContributorsInfo(link));
        }
        cps.push(data);
      }
      // cps now holds and array of arrays that hold promises. We need to resolve each array of promises
      let contribuorsPromises = []; // Will result an array of promises representing the end of reolving the nested array of promises listed above. When this array of promises are resolved, then all the data is fetched and usable.
      for(i = 0; i < cps.length; i++) {
        // The reason to use a self-executing function with parameter i is that the contained promise won't have knowledge about i without it. We need i in order to know what project in github.apiData we are working with.
        (function(i) {
          let contributorsPromise = Promise.all(cps[i])
            .then(function(cs) {
              // We start off with an array of contributor arrays, so we flatten them into one
              let contributors = cs.flat();
              // Combine contributions from contributors that come up multiple times and keep track of their contributions
              for(z = 0; z < contributors.length - 1; z++) {
                let j = z + 1;
                while(j < contributors.length) {
                  if(contributors[z].id == contributors[j].id) {
                    contributors[z].contributions += contributors[j].contributions;
                    contributors.splice(j, 1);
                  } else {
                    j++;
                  }
                }
              }
              contributors.sort(github.compareValues('contributions', order = 'desc'));
              github.apiData[i].contributors.data = contributors;
            }).catch(function(err) {
              return err.message;
            });
          // Push the current Promise.all() that is working on the current contributors to the overall promise array
          contribuorsPromises.push(contributorsPromise);
        })(i);
      }
      // When we return this promise, the next then() statement will wait for the array of promises to be resolved
      return Promise.all(contribuorsPromises);
    })
    .then(function(promises) {
      cdone = true;
      if (ldone) {
        console.log('Calling finish in Contributors work');
        finish();
      }
    })
    .catch(function(e) {
      return e.message;
    });
  function finish(){
    let output = github.apiData.sort(github.compareValues('id'));
    console.log(JSON.stringify(output, null, 2));
    fs.writeFileSync('_data/github-data.json', JSON.stringify(output, null, 2));
  }
}

const token = core.getInput('token');
main({ "token": token });