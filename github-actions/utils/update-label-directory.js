const fs = require('fs');

// Global variables
var github;
var context;

/*
 * Function triggered by the `update-label-directory.yml` that  
 * updates the "Label Object" in `label-directory.json` 
 *
 * @param {Object} g     - github object from actions/github-script
 * @param {Object} c     - context object from actions/github-script
 * @returns {Object}
 */
async function main({ g, c }) {
  
  github = g;
  context = c;

  var labelId = context.payload.label.id;
  var labelName = context.payload.label.name;
  var labelAction = context.payload.action;

  var breakLine = `-`.repeat(60);

  
  // If label 'edited' but changes do not include 'name', label directory is not updated and workflow exits
  if (context.payload.action === 'edited' && !context.payload.changes.name) {
    console.log(`${breakLine}\n`);
    console.log(`What was changed: \n${context.payload.changes}\n`);
    console.log(`${breakLine}\n`);
    console.log(`The label edits do not affect the JSON file; file will not be updated!`);
    return {};
  } 
  

  // Otherwise, retrieve label directory 
  const filepath = 'github-actions/utils/_data/label-directory.json';
  const rawData = fs.readFileSync(filepath, 'utf8');
  const data = JSON.parse(rawData);
  let keyName = '';
  let actionAddOn = '';

  // Initial information to log
  console.log(`${breakLine}\n`);
  console.log(`Label reference info: \n${context.payload.label}\n`);
  console.log(`${breakLine}\n`);
  
  // If label 'deleted', check for 'labelId' in label directory and if found return 'keyName' 
  if (labelAction === 'deleted') {
    keyName = cycleThroughDirectory(data, labelId);
    if (keyName) {
      // If the 'keyName' is found with 'labelId', replace 'labelId' with '9999999999' in JSON and flag for review
      message = `Found keyName:  ${keyName}  for labelId:  ${labelId}  and labelName:  ${labelName},  but Id no longer valid. This needs review!`;
      labelId = 9999999999;
      actionAddOn = ' / id found';
      writeToJsonFile(filepath, data, keyName, labelId, labelName);
    } else {
      // If the 'keyName' not found with 'labelId', rerun with 'labelName'
      keyName = cycleThroughDirectory(data, labelName);
      if (keyName) {
        message = `Did not find labelId:  ${labelId},  but found labelName:  ${labelName}  -No updates to JSON. This needs review!`;
        actionAddOn = ' / check name';
      } else {
        message = `Found neither labelId:  ${labelId}  nor labelName:  ${labelName}  -No updates to JSON. This needs review!`;
        actionAddOn = ' / not found';
      }
    }
  }
 
  // If 'edited' check for 'labelId' in label directory and if found return 'keyName' 
  if (labelAction === 'edited' ) {
    keyName = cycleThroughDirectory(data, labelId);
    // If the 'keyName' is returned, it is assumed that the change is known. Label directory will be updated w/ new 'name'
    if (keyName) {
      message = `Found keyName:  ${keyName}  for labelId:  ${labelId}  and labelName:  ${labelName}  - label will be edited.`;
      actionAddOn = ' / found';
    } else {
      // If the 'labelId' is not found, create a new 'keyName' and flag this label edit for review
      keyName = createKeyName(data, labelName);
      message = `Did not find keyName for labelId:  ${labelId}  or labelName:  ${labelName}  -Adding label with new keyName:  ${keyName}.`;
      actionAddOn = ' / added';
    }
    writeToJsonFile(filepath, data, keyName, labelId, labelName);
  }

  // If 'created' then 'keyName' won't exist, create new camelCased 'keyName' so label entry can be added to directory
  if (labelAction === 'created') {
    keyName = createKeyName(data, labelName);
    message = `Created keyName:  ${keyName}  for new labelId:  ${labelId}  and labelName:  ${labelName}, adding to JSON.`;
    writeToJsonFile(filepath, data, keyName, labelId, labelName);
  }

  // Final step is to return label data packet to workflow
  console.log(message);
  console.log(`\nCreating labelPacket to send to Google Apps Script file`);
  labelAction += actionAddOn;
  return { labelAction, keyName, labelName, labelId, message };
}


/*
 *  HELPER FUNCTIONS for main()
 *
 *
 */
function cycleThroughDirectory(data, searchValue) {
  for (let [key, value] of Object.entries(data)) {
    if (value.includes(searchValue)) {
      keyName = key;
      return keyName;
    } 
  }
  return undefined;
}

function createKeyName(data, labelName) {
  let keyName = '';
  const isAlphanumeric = str => /^[a-z0-9]+$/gi.test(str);
  let labelInterim = labelName.split(/[^a-zA-Z0-9]+/);
  for (let i = 0; i < labelInterim.length ; i++) {
      if (i === 0) {
          keyName += labelInterim[0].toLowerCase();
      } else if (isAlphanumeric(labelInterim[i])) {
          keyName += labelInterim[i].split(' ').map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(' ');
      }
  }
  // If the 'keyName' already exists for some reason, add the word 'COPY' so it is flagged and does not overwrite existing
  if (data[keyName]) {
    keyName += 'COPY';
  }
  console.log(`A new keyName: "${keyName}" has been created.`);
  return keyName;
}

function writeToJsonFile(filepath, data, keyName, labelId, labelName) {
  data[keyName] = [labelName, Number(labelId)];                                                                 // Needs Try-catch
  console.log(`\nWriting label data to directory:\n { "${keyName}": [ "${labelId}", "${labelName}" ] }\n`);
  
  // Write data file in prep for committing changes to label directory
  fs.writeFile(filepath, JSON.stringify(data, null, 2), (err) => {
    if (err) throw err;
    console.log(`${breakLine}\n`);
    console.log(`Changes to Label Directory JSON file have been staged. Next step will commit changes.`);
  });  
}

module.exports = main;
