// Import modules
var fs = require("fs");

// Global variables
var github;
var context;

/**
 * Formats the commandline instructions into a template, then posts it to the pull request.
 * @param {Object} g - github object  
 * @param {Object} c - context object 
 * @param {Number} issueNum - the number of the issue where the post will be made 
 * @param {String} instruction - commandline instructions
 */
async function main({ g, c }, { issueNum, instruction }) {
    github = g;
    context = c;

    const instructions = formatComment(instruction)
    postComment(issueNum, instructions);
}

function formatComment(instruction) {
    const path = './github-actions/pr-instructions/pr-instructions-template.md'
    const text = fs.readFileSync(path).toString('utf-8');
    const completedInstuctions = text.replace('${commandlineInstructions}', instruction)
    return completedInstuctions
}

async function postComment(issueNum, instructions) {
    try {
        await github.rest.issues.createComment({
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
