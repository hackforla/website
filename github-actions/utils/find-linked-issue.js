function findLinkedIssue(text) {
    // Create RegEx for capturing KEYWORD #ISSUE-NUMBER syntax (i.e. resolves #1234)
    const KEYWORDS = ['close', 'closes', 'closed', 'fix', 'fixes', 'fixed', 'resolve', 'resolves', 'resolved'];
    let reArr = [];
    for (const word of KEYWORDS) {
        reArr.push(`[\\n|\\s|^]${word} #\\d+\\s|^${word} #\\d+\\s|\\s${word} #\\d+$|^${word} #\\d+$`);
    }

    // Receive and unpack matches into an Array of Array objs
    let re = new RegExp(reArr.join('|'), 'gi');
    let matches = text.matchAll(re);
    matches = [...matches];

    // If only one match is found, return the issue number. Else return false. Also console.log results.
    if (matches.length == 1) {
        const issueNumber = matches[0][0].match(/\d+/);
        return issueNumber[0];
    } else {
        return false;
    }
}

module.exports = findLinkedIssue;
