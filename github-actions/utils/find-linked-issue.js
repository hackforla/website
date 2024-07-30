/**
 * Function that returns the number of a linked issue (if exists)
 * @param {String} text       - the text to search for keywords
 * @returns                   - issueNumber, or false
 */
function findLinkedIssue(text) {
    // Create RegEx for capturing KEYWORD #ISSUE-NUMBER syntax (i.e. resolves #1234)
    const KEYWORDS = ['close', 'closes', 'closed', 'fix', 'fixes', 'fixed', 'resolve', 'resolves', 'resolved'];
    let reArr = [];
    for (const word of KEYWORDS) {
        reArr.push(`[\\n|\\s|^]${word} #\\d+\\s|^${word} #\\d+\\s|\\s${word} #\\d+$|^${word} #\\d+$`);
    }

    // Receive and unpack matches into an Array of Array objs
    let re = new RegExp(reArr.join('|'), 'gi');
    let matches = [];
    
    // Find matches or throw error
    try {
        matches = text.matchAll(re);
        matches = [...matches]; 
    } catch (err) {
        console.error(err);
    }
    
    // If only one match is found, return the issue number
    if (matches.length == 1) {
        const issueNumber = matches[0][0].match(/\d+/);
        return issueNumber[0];
    } else {
        return false;
    }
}

module.exports = findLinkedIssue;
