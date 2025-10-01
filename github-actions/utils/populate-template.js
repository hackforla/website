const fs = require("fs");

/**
 * Reads a Markdown template file and replaces placeholders with provided values.
 * Designed for generating GitHub issue bodies, comments, or any text-based templates.
 *
 * @param {string} templatePath        - Path to the Markdown template file
 * @param {Object} templateVars        - Key-value pairs where keys correspond to placeholders
 *                                       in the template (e.g., '${placeholder}') and values
 *                                       are the text to substitute.
 * @returns {string}                   - Template content with all placeholders replaced
 *
 * @example
 * const body = populateTemplate({
 *     templatePath: 'issue-template.md',
 *     templateVars: { '${assignee}': 'username', '${description}': 'Bug details' }
 * });
 */
function populateTemplate({ templatePath, templateVars }) {
  let text = fs.readFileSync(templatePath, "utf8");

  for (const [key, val] of Object.entries(templateVars)) {
    // Escape all regex special characters in the key by prepending a '\'
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Create the new regex with the updated key
    const regex = new RegExp(escapedKey, "g");

    // Use the regex replacement to update the text
    text = text.replace(regex, val);
  }
  return text;
}

module.exports = populateTemplate;
