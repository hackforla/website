const fs = require('fs');

// Global variables
var filepath = 'github-actions/utils/_data/label-directory.json';

/*
 * Matches label reference name(s) to the label display name(s) from JSON
 * @param {string } filepath     - Path to `label_directory.json`
 * @param {Array} keyNames       - List of reference names to look up display names
 * @return {Array} displayNames  - List of display names
 */
function labelRetrieveNames(...keyNames) {

  // Retrieve label directory
  const rawData = fs.readFileSync(filepath, 'utf8');
  const data = JSON.parse(rawData);

  const displayNames = [ ];
  for(let keyName of keyNames) {
    try {
      displayNames.push(data[keyName][0]);
      console.log(`Success! From label key: '${keyName}' found label display: '${data[keyName][0]}'`);
    } catch (err) {
      console.error(`Failed to find label display for label key: '${keyName}'`)
    }
  }

  return displayNames;
}

module.exports = labelRetrieveNames;
