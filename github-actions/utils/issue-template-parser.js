 // import modules
const fs = require('fs');

/**
 * Parses a GitHub markdwon/ schema issue template
 *
 * @param {string} filepath - filepath to issue template
 * @return {array} issueObject - parameters to create issue
 */

function issueTemplateParser(filepath) {
 
  // Read contents of issue template
  const templateData = fs.readFileSync(filepath, 'utf8');
  const data = templateData.split('---');

  // Parse front matter i.e. between '---' delimiters, create object
  const frontMatter = data[1].trim().split('\n');
  const issueObject = frontMatter.reduce((acc, item) => {
    const colonIndex = item.indexOf(':');
    const key = item.slice(0, colonIndex).trim();
    const value = item.slice(colonIndex + 1).trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      acc[key] = value.slice(1, -1).replaceAll(/["']/g,'').split(',').map(str => str.trim());
    } else {
      acc[key] = value.replaceAll(/["']/g,'');
    }
    return acc;
  }, {});

  // Add body entry to issueObject
  issueObject['body'] = data[2].trim();

  return issueObject
}

module.exports = issueTemplateParser;
