// 
const isMemberOf = require('../utils/check-team-membership');
const commentContent = 'You must be a member of the HFLA website team in order to create pull requests. Please see our page on how to join us as a member at HFLA: https://www.hackforla.org/getting-started.  If you have been though onboarding, and feel this message in error, please message us in the #hfla-site team slack channel with the link to this PR.';

async function main(prAuthor,prNumber) {
    if (isMemberOf(prAuthor,prNumber)) {    
        console.log('Successfully verified!');
    }
    else {
        try {
            await github.rest.issues.update({
                owner : 'ajb176',
                repo : 'website',
                issue_number : prNumber,
                state : 'closed'
            });
            await github.rest.issues.createComment({
                owner : 'ajb176',
                repo : 'website',
                issue_number : prNumber,
                body : commentContent
            }); 
        } catch (closeCommentError) {
            throw new Error (closeCommentError);
        } 
    }    
}