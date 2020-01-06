const core = require('@actions/core');
const github = require('@actions/github');
const https = require("https");
const fs = require('fs');


try {
  // `who-to-greet` input defined in action metadata file
  // const nameToGreet = core.getInput('who-to-greet');
  // console.log(`Hello ${nameToGreet}!`);
  // const time = (new Date()).toTimeString();
  // core.setOutput("time", time);
  // // Get the JSON webhook payload for the event that triggered the workflow
  // const payload = JSON.stringify(github.context.payload, undefined, 2)
  // console.log(`The event payload: ${payload}`);
  // const apiData = fetch(
  //   'https://api.github.com/search/repositories?q=topic:hack-for-la&sort=updated&order=desc', {
  //     method: 'GET',
  //     headers: {
  //       'Accept': "application/vnd.github.mercy-preview+json",
  //       'User-Agent': 'HackForLA'
  //     }
  //   }
  // )
  // console.log(apiData);
  const options = {
    hostname: 'api.github.com',
    method : 'GET',
    path: '/search/repositories?q=topic:hack-for-la&sort=updated&order=desc',
    headers: {
      'Accept': 'application/vnd.github.mercy-preview+json',
      'User-Agent': 'HackForLA'
    }
  }
  https.get(options, res => {
    res.setEncoding("utf8");
    let body = "";
    res.on("data", data => {
      body += data;
    });
    res.on("end", () => {
      body = JSON.parse(body)
      let newBody = JSON.stringify(body, null, 2);
      console.log("it worked!");
      fs.writeFileSync('db/db.json', newBody)
    });
  });
} catch (error) {
  core.setFailed("error.message");
}
