/**
 * @description - This function formats the comment to be posted based on an object input.
 * @param {String} replacementString - the string to replace the placeholder in the md file
 * @param {String} placeholderString - the placeholder to be replaced in the md file
 * @param {String} filePathToFormat - the path of the md file to be formatted
 * @param {String} textToFormat - the text to be formatted. If null, use the md file provided in the path. If provided, format that text
 * @returns {String} - returns a formatted comment to be posted on github
 */
function formatComment({ replacementString, placeholderString, filePathToFormat, textToFormat }, fs) {
    const text = textToFormat === null ? fs.readFileSync(filePathToFormat).toString('utf-8') : textToFormat
    const commentToPost = text.replace(placeholderString, replacementString)
    return commentToPost
}

module.exports = formatComment;