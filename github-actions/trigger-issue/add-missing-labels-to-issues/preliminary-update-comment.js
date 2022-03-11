var fs = require("fs")

// Global variables
var github
var context

/**
 * Format the label instructions into a template, then post it to the issue
 * @param {Object} g - github object  
 * @param {Object} c - context object 
 * @param {Boolean} actionResult - the previous gh-action's result
 * @param {Number} issueNum - the number of the issue where the post will be made 
 */
async function main({ g, c }, { actionResult, issueNum }) {
    github = g
    context = c
    console.log(actionResult)
    // If the previous action returns a false, stop here
    if (actionResult === false){
      console.log('No need to post comment.')
      return
    }
    
    //We make the comment with the issuecreator's github handle instead of the placeholder
    else{
    const instructions = makeComment()
    if (instructions === null) {
      return
    }

    // the actual creation of the comment in github
    await postComment(issueNum, instructions)
  }
}

/**
 * @returns {string} //Comment to be posted with the issue creator's name in it!!!
 */

function makeComment(){
    // Setting all the variables which formatcomment is to be called with
    const issueCreator = context.payload.issue.user.login

    const commentObject = {
        replacementString: issueCreator,
        placeholderString: '${issueCreator}',
        filePathToFormat: './github-actions/trigger-issue/add-missing-labels-to-issues/preliminary-update.md',
        textToFormat: null
    }

    // creating the comment with issue creator's name and returning it!
    const commentWithIssueCreator = formatComment(commentObject)

    return commentWithIssueCreator
}


/**
 * Formats the comment to be posted based on an object input
 * @param {String} replacementString - the string to replace the placeholder in the md file
 * @param {String} placeholderString - the placeholder to be replaced in the md file
 * @param {String} filePathToFormat - the path of the md file to be formatted
 * @param {String} textToFormat - the text to be formatted. If null, use the md file provided in the path. If provided, format that text
 * @returns {String} - returns a formatted comment to be posted on github
 */
function formatComment({ replacementString, placeholderString, filePathToFormat, textToFormat }) {
    const text = textToFormat === null ? fs.readFileSync(filePathToFormat).toString('utf-8') : textToFormat
    const commentToPost = text.replace(placeholderString, replacementString)
    return commentToPost
  }


/**
 * Posts a comment on github
 * @param {Number} issueNum - the issue number where the comment should be posted
 * @param {String} comment - the comment to be posted
 */

//this function is called my main with the result of makeComment() as the comment argument.
 async function postComment(issueNum, comment) {
    try {
      await github.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNum,
        body: comment,
      })
    } catch (err) {
      throw new Error(err);
    }
  }
  
  module.exports = main