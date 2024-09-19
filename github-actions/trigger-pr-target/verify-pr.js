const isMemberOfTeam = require('../utils/check-team-membership');
const commentContent = 'You must be a member of the HFLA website team in order to create pull requests. \
Please see our page on how to join us as a member at HFLA: https://www.hackforla.org/getting-started.  \
If you have been though onboarding, and feel this message was sent in error, please message us in the \
#hfla-site team Slack channel with the link to this PR.';

async function main({github,context}) {
    const prAuthor = context.payload.sender.login;  
    const prNumber = context.payload.number;
    const repo = context.payload.pull_request.base.repo.name;
    const owner = context.payload.pull_request.base.repo.owner.login;
    const isMember = await isMemberOfTeam(github, prAuthor, 'website-write');
    if (isMember || prAuthor =='dependabot[bot]') {    
        console.log('Successfully verified!');
    }
    else {
        try {
            await github.rest.issues.update({
                owner : owner,
                repo : repo,
                issue_number : prNumber,
                state : 'closed'
            });
            await github.rest.issues.createComment({
                owner : owner,
                repo : repo,
                issue_number : prNumber,
                body : commentContent
            }); 
        } catch (closeCommentError) {
            console.log(`Failed to close PR #${prNumber} created by ${prAuthor}. See logs for details.`);
            throw closeCommentError;
        } 
    }    
}

module.exports = main;
