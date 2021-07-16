// Importing modules
var fs = require("fs");

// Global variables
var github;
var context;

async function main({ g, c }) {
    github = g;
    context = c;
    postComment();
    return true;
}

async function postComment() {
    const body = createMessage()
    let results;
    try {
        results = await github.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.payload.number,
            body: body,
        });
    } catch (err) {
        throw new Error(err);
    }

    console.log(JSON.stringify(results));
}

function createMessage() {
    const nameOfCollaborator = context.payload.pull_request.head.repo.owner.login;
    const nameOfFromBranch = context.payload.pull_request.head.ref;
    const nameOfIntoBranch = context.payload.pull_request.base.ref;
    const cloneURL = context.payload.pull_request.head.repo.clone_url;

    const instructionString =
        `git checkout -b ${nameOfCollaborator}-${nameOfFromBranch} ${nameOfIntoBranch}
git pull ${cloneURL} ${nameOfFromBranch}`


    const path = './github-actions/pr-instructions'
    fs.readdir(path, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        //listing all files using forEach
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            console.log(file);
        });
    });

    const text = fs.readFileSync("./github-actions/pr-instructions/pr-instructions-template.md.md").toString('utf-8');
    const completedInstuctions = text.replace('${commandlineInstructions}', instructionString)

    return completedInstuctions
}

module.exports = main