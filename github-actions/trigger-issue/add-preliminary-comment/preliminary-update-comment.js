var fs = require("fs")

// Global variables
var github
var context

/**
 * @description - This function is the entry point into the javascript file, it formats the md file based on the result of the previous step and then posts it to the issue
 * @param {Object} g - github object  
 * @param {Object} c - context object 
 * @param {Boolean} actionResult - the previous gh-action's result
 * @param {Number} issueNum - the number of the issue where the post will be made 
 */

async function main({ g, c }, { shouldPost, issueNum }){
  github = g
  context = c
  // If the previous action returns a false, stop here
  if(shouldPost === false){
    console.log('No need to post comment.')
    return
  }
  //Else we make the comment with the issuecreator's github handle instead of the placeholder.
  else{
    const instructions = await makeComment()
    if(instructions !== null){
      // the actual creation of the comment in github
      await postComment(issueNum, instructions)
    }
  }
}

/**
 * Function that returns the timeline of an issue.
 * @param {Number} issueNum the issue's number 
 * @returns an Array of Objects containing the issue's timeline of events
 */

 async function getTimeline(issueNum){
	let history = []
	let page = 1
  while (true) {
    try {
      const results = await github.issues.listEventsForTimeline({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNum,
        per_page: 100,
        page: page,
      });
      if (results.data.length){
	      history = history.concat(results.data);
      } else {
        break
      }
    } catch (err){
      console.log(error);
			continue
    }
    finally{
      page++
    }
  }
	return history
}

/**
 * @description - This function makes the comment with the issue assignee's github handle using the raw preliminary.md file
 * @returns {string} - Comment to be posted with the issue assignee's name in it!!!
 */

async function makeComment(){
  // Setting all the variables which formatComment is to be called with
  var issueAssignee = context.payload.issue.assignee.login
  const eventdescriptions = await getTimeline(context.payload.issue.number)
  console.log(eventdescriptions.length)
  //adding the code to find out the latest person assigned the issue
  for(var i = eventdescriptions.length - 1 ; i>=0; i-=1){
    if(eventdescriptions[i].event == 'assigned'){
      issueAssignee = eventdescriptions[i].assignee.login
      break
    }
  }


  const commentObject = {
    replacementString: issueAssignee,
    placeholderString: '${issueAssignee}',
    filePathToFormat: './github-actions/trigger-issue/add-preliminary-comment/preliminary-update.md',
    textToFormat: null
  }

  // creating the comment with issue assignee's name and returning it!
  const commentWithIssueAssignee = formatComment(commentObject)
  return commentWithIssueAssignee
}


/**
 * @description - This function is called by makeComment() and it formats the comment to be posted based on an object input.
 * @param {String} replacementString - the string to replace the placeholder in the md file
 * @param {String} placeholderString - the placeholder to be replaced in the md file
 * @param {String} filePathToFormat - the path of the md file to be formatted
 * @param {String} textToFormat - the text to be formatted. If null, use the md file provided in the path. If provided, format that text
 * @returns {String} - returns a formatted comment to be posted on github
 */

function formatComment({ replacementString, placeholderString, filePathToFormat, textToFormat }){
  const text = textToFormat === null ? fs.readFileSync(filePathToFormat).toString('utf-8') : textToFormat
  const commentToPost = text.replace(placeholderString, replacementString)
  return commentToPost
}


/**
 * @description - this function is called by main() with the result of makeComment() as the comment argument and it does the actual posting of the comment.
 * @param {Number} issueNum - the issue number where the comment should be posted
 * @param {String} comment - the comment to be posted
 */

async function postComment(issueNum, comment){
  try{
    await github.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNum,
      body: comment,
    })
  } 
  catch(err){
    throw new Error(err);
  }
}
  
module.exports = main