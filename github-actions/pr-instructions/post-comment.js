// Importing modules
var fs = require("fs");

// Global variables
var github;
var context;

async function main({ g, c }, { issueNum, instruction }) {
    github = g;
    context = c;

    const instructions = formatComment(instruction)
    postComment(issueNum, instructions);
    return true;
}

function formatComment(instruction) {
    const path = './github-actions/pr-instructions/pr-instructions-template.md'
    const text = fs.readFileSync(path).toString('utf-8');
    const completedInstuctions = text.replace('${commandlineInstructions}', instruction)
    return completedInstuctions
}

async function postComment(issueNum, instructions) {
    try {
        await github.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: issueNum,
            body: instructions,
        });
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = main