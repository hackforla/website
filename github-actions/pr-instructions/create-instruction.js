// Importing modules
var fs = require("fs");

// Global variables
var github;
var context;

function main({ g, c }) {
    github = g;
    context = c;
    return createInstruction();
}

function createInstruction() {
    const nameOfCollaborator = context.payload.pull_request.head.repo.owner.login;
    const nameOfFromBranch = context.payload.pull_request.head.ref;
    const nameOfIntoBranch = context.payload.pull_request.base.ref;
    const cloneURL = context.payload.pull_request.head.repo.clone_url;

    const instructionString =
`git checkout -b ${nameOfCollaborator}-${nameOfFromBranch} ${nameOfIntoBranch}
git pull ${cloneURL} ${nameOfFromBranch}`

    return instructionString
}

module.exports = main