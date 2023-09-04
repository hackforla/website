// Import modules
var fs = require("fs");

// Global variables
var github;
var context;

/**
 * Use decodeURI() to decode the instruction prior to posting to PR
 * (URI Encoding was applied in create-instruction.js to handle the backtick character)
 * @param {Object} g - github object  
 * @param {Object} c - context object 
 * @param {Number} issueNum - the number of the issue where the post will be made 
 * @param {String} instruction - commandline instructions
 */
async function main({ g, c }, { issueNum, instruction }) {
    github = g;
    context = c;
    postComment(issueNum, decodeURI(instruction));
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
