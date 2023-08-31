// Global variables
var github;
var context;
const fs = require('fs');

/**
 * Uses information from the pull request to create commandline instructions.
 * @param {Object} g - github object
 * @param {Object} c - context object
 * @returns {string} string containing commandline instructions
 */
function main({ g, c }) {
    github = g;
    context = c;
    return compositeInstruction();
}

function formatPullComment(instruction) {
    const path = './github-actions/pr-instructions/pr-instructions-pull-template.md'
    const text = fs.readFileSync(path).toString('utf-8');
    const completedInstuctions = text.replace('${commandlineInstructions}', instruction);
    return completedInstuctions;
}

function formatContribComment(instruction){
	const path = './github-actions/pr-instructions/pr-instructions-contrib-template.md'
    const text = fs.readFileSync(path).toString('utf-8');
    const completedInstuctions = text.replace('${previewContribInstructions}', instruction);
    return completedInstuctions;
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

function compositeInstruction() {
	const completedPullInstruction = formatPullComment(createPullInstruction());
	const completedContribInstruction = formatContribComment(createContribInstruction());
	return completedPullInstruction + completedContribInstruction;
}

module.exports = main