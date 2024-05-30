// Global variables
var github;
var context;
const fs = require('fs');

/**
 * Uses information from the pull request to create commandline instructions.
 * @param {Object} g - github object
 * @param {Object} c - context object
 * @returns {string} string containing commandline instructions, URI encoded since the backtick character causes a problem in *  the artifact
 */
async function main({ g, c }) {
    github = g;
    context = c;
    return encodeURI(await compositeInstruction());   
}

function formatHeaderInstruction() {
    const path = './github-actions/pr-instructions/pr-instructions-header.md'
    const headerInstruction = fs.readFileSync(path).toString('utf-8')
    return headerInstruction
}

function formatPullComment(instruction) {
    const path = './github-actions/pr-instructions/pr-instructions-template.md'
    const text = fs.readFileSync(path).toString('utf-8');
    const completedInstructions = text.replace('${commandlineInstructions}', instruction);
    return completedInstructions;
}

function formatContribComment(instruction){
    const path = './github-actions/pr-instructions/pr-instructions-contrib-template.md'
    const text = fs.readFileSync(path).toString('utf-8');
    const completedInstructions = text.replace('${previewContribInstructions}', instruction);
    return completedInstructions;
}

function createPullInstruction(){
    const nameOfCollaborator = context.payload.pull_request.head.repo.owner.login;
    const nameOfFromBranch = context.payload.pull_request.head.ref;
    const nameOfIntoBranch = context.payload.pull_request.base.ref;
    const cloneURL = context.payload.pull_request.head.repo.clone_url;
    const pullInstructionString =
`git checkout -b ${nameOfCollaborator}-${nameOfFromBranch} ${nameOfIntoBranch}
git pull ${cloneURL} ${nameOfFromBranch}`
    return pullInstructionString;
}

function createContribInstruction(){
    const nameOfCollaborator = context.payload.pull_request.head.repo.owner.login;
    const nameOfFromBranch = context.payload.pull_request.head.ref;
    const previewContribURL = `https://github.com/${nameOfCollaborator}/website/blob/${nameOfFromBranch}/CONTRIBUTING.md`
    return previewContribURL;
}

async function getModifiedFiles() {
    const prNumber = context.payload.pull_request.number;
    const repoName = context.payload.pull_request.base.repo.name;
    const ownerName = context.payload.pull_request.base.repo.owner.login;

    // Gets the list of files modified in the pull request and destructures the data object into a files variable
    const { data: files } = await github.rest.pulls.listFiles({
        owner: ownerName,
        repo: repoName,
        pull_number: prNumber
    });
    // Maps the files array to only include the filename of each file
    const modifiedFiles = files.map(file => file.filename);

    return modifiedFiles;
}

async function compositeInstruction() {
    const modifiedFiles = await getModifiedFiles();
    const isContributingModified = modifiedFiles.includes('CONTRIBUTING.md');
    const isOnlyContributingModified = isContributingModified && modifiedFiles.length === 1;

    const pullRequestHeader = formatHeaderInstruction();
    let completedPullInstruction = '';
    let completedContribInstruction = '';

    // Only includes the pull request instructions if multiple files, including CONTRIBUTING.md, are modified
    if (!isOnlyContributingModified) {
        completedPullInstruction = formatPullComment(createPullInstruction());
    }
    // Only include the contributing instructions if the CONTRIBUTING.md file is modified
    if (isContributingModified) {
        completedContribInstruction = formatContribComment(createContribInstruction());
    }

    return pullRequestHeader + completedPullInstruction + completedContribInstruction;
}

module.exports = main