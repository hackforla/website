const fs = require('fs');

// Global variables
var filepath = 'github-actions/utils/_data/label-directory.json';
var breakLine = `-`.repeat(60);
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
  let labelKey = '';
  let actionAddOn = '';
  let message = '';

  // If label 'edited' but changes do not include 'name', label directory is not updated and workflow exits
  if (labelAction === 'edited' && !context.payload.changes.name) {
    console.log(`${breakLine}\n`);
    console.log(`${labelName} label changed:`);
    console.log(context.payload.changes);
    console.log(`\n${breakLine}\n`);
    labelAction = "no update";
    labelKey = "n/a";
    message = `Edit to description and/or color only, no updates to JSON or SoT`;
    console.log(message);
    return {labelAction, labelKey, labelName, labelId, message};
  } 

  // Otherwise, retrieve label directory 
  var rawData = fs.readFileSync(filepath, 'utf8');
  var data = JSON.parse(rawData);

  // Initial information to log
  console.log(`${breakLine}\n`);
  console.log(`Label reference info:`);
  console.log(context.payload.label);
  console.log(`\n${breakLine}\n`);

  // If label 'deleted', check for 'labelId' in label directory and if found return 'labelKey' 
  if (labelAction === 'deleted') {
    labelKey = cycleThroughDirectory(data, Number(labelId));
    if (labelKey) {
      // If the 'labelKey' is found with 'labelId', replace 'labelId' with '9999999999' in JSON and flag for review
      let prevId = labelId;
      labelId = 9999999999;
      message = `Found labelKey:  ${labelKey}  for labelName:  ${labelName}  using labelId:  ${prevId}  --->  ${labelId}.  Id no longer valid. This needs review!`;
      actionAddOn = ' / id found';
      console.log(message);
      writeToJsonFile(data, labelKey, labelId, labelName);
    } else {
      // If the 'labelKey' not found with 'labelId', rerun with 'labelName'
      labelKey = cycleThroughDirectory(data, labelName);
      if (labelKey) {
        message = `Found a labelKey:  ${labelKey}  for labelName:  ${labelName}.  However, this DOES NOT MATCH labelId:  ${labelId}.  No updates to JSON. This needs review!`;
        console.log(message);
        actionAddOn = ' / check name';
      } else {
        message = `Found neither labelName:  ${labelName}  nor labelId:  ${labelId}.  No updates to JSON. This needs review!`;
        console.log(message);
        actionAddOn = ' / not found';
      }
    }
  }

  // If 'edited' check for 'labelId' in label directory and if found return 'labelKey' 
  if (labelAction === 'edited' ) {
    let prevName = context.payload.changes.name.from;
    labelKey = cycleThroughDirectory(data, Number(labelId));
    // If the 'labelKey' is returned, it is assumed that the change is known. Label directory will be updated w/ new 'name'
    if (labelKey) {
      message = `Found labelKey:  ${labelKey}  for labelName:   ${prevName} ---> ${labelName}   and labelId:  ${labelId}.`;
      actionAddOn = ' / found';
    } else {
      // If the 'labelId' is not found, create a new 'labelKey' and flag this label edit for review
      labelKey = createInitiallabelKey(data, labelName);
      message = `Did not find labelKey:   for labelName:  ${labelName}  using labelId:  ${labelId}.  Adding Label Object with new labelKey:  ${labelKey}.`;
      actionAddOn = ' / added';
    }
    console.log(message);
    writeToJsonFile(data, labelKey, labelId, labelName);
  }

  // If 'created' then 'labelKey' won't exist, create new camelCased 'labelKey' so label entry can be added to directory
  if (labelAction === 'created') {
    labelKey = createInitiallabelKey(data, labelName);
    message = `Created initial labelKey:  ${labelKey}  for new labelName:  ${labelName}  and new labelId:  ${labelId}.  Adding Label Object to JSON.`;
    console.log(message);
    writeToJsonFile(data, labelKey, labelId, labelName);
  }

  // Final step is to return label data packet to workflow
  console.log(`\nSending  Label Object  to Google Apps Script / Sheets file`);
  labelAction += actionAddOn;
  return { labelAction, labelKey, labelName, labelId, message };
}



/*
 *  HELPER FUNCTIONS for main()
 *
 */
function cycleThroughDirectory(data, searchValue) {
  let labelKey = '';
  for (let [key, value] of Object.entries(data)) {
    if (value.includes(searchValue)) {
      labelKey = key;
      return labelKey;
    } 
  }
  return undefined;
}



// If the label has not been created, prepend 'NEW-' to labelKey to flag it
function createInitiallabelKey(data, labelName) {
  let labelKey = 'NEW-';
  const isAlphanumeric = str => /^[a-z0-9]+$/gi.test(str);
  let labelInterim = labelName.split(/[^a-zA-Z0-9]+/);
  for (let i = 0; i < labelInterim.length ; i++) {
      if (i === 0) {
          labelKey += labelInterim[0].toLowerCase();
      } else if (isAlphanumeric(labelInterim[i])) {
          labelKey += labelInterim[i].split(' ').map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(' ');
      }
  }
  return labelKey;
}



function writeToJsonFile(data, labelKey, labelId, labelName) {
  try {
    data[labelKey] = [labelName, Number(labelId)];
    console.log(`\nStaging  Label Object  to JSON:\n   { "${labelKey}": [ "${labelName}", "${labelId}" ] }`);
  } catch (error) {
    console.log(error);
  }
  
  // Write data file in prep for committing changes to label directory
  fs.writeFile(filepath, JSON.stringify(data, null, 2), (err) => {
    if (err) throw err;
    console.log(`${breakLine}\n`);
    console.log(`Changes to Label Directory JSON file have been staged. Next step will commit changes.`);
  });  
}



module.exports = main;
