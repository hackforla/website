// Import modules
const fs = require('fs');

// Global variables
var filepath = 'github-actions/utils/_data/label-directory.json';
var labelData;

/*
 * Matches label reference name to the label display name from JSON
 * @param {Array} labelKey        - Key reference to look up display name
 * @return {Array} labelName      - Display name for each label
 */
function retrieveLabelName(labelKey) {

  // Retrieve label directory if not read already
  if (labelData === undefined) {
    console.log(`Reading label directory...`);
    const rawData = fs.readFileSync(filepath, 'utf8');
    labelData = JSON.parse(rawData);
  }

  let labelName = '';

  try {
    labelName = labelData[labelKey][0];
    console.log(`Success! Found labelKey: '${labelKey}', returning labelName: '${labelName}'`);
  } catch (err) {
    console.error(`Failed to find labelKey: '${labelKey}'`);
  }

  return labelName;
}

module.exports = retrieveLabelName;
