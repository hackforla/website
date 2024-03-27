const fs = require('fs');

// Global variables
var github;
var context;

/*
 * Function triggered by the `update-label-directory.yml`
 * @param {Object} g     - github object from actions/github-script
 * @param {Object} c     - context object from actions/github-script
 */
async function main({ g, c }) {
  
  github = g;
  context = c;

  // Proceed only if the label name changed, if the label is new, or if the label has been deleted
  if((context.payload.action === 'edited' && context.payload.changes.name) || context.payload.action === 'created' || context.payload.action === 'deleted') {

    const labelId = context.payload.label.id + '';
    const labelName = context.payload.label.name;

    
    // Retrieve label directory
    const filepath = 'github-actions/utils/_data/label-directory.json';
    const rawData = fs.readFileSync(filepath, 'utf8');
    const data = JSON.parse(rawData);
    let keyName = '';

        
    // If label is to be edited or deleted, check for labelId in label directory and return keyName
    if(context.payload.action === 'edited' || context.payload.action === 'deleted') {
      for(let [key, value] of Object.entries(data)) {
        if (value.includes(labelId)) {
          keyName = key;
          break;
        }
      }
    };

    
    // If labelId does not exist, create new (camelCased) keyName so label entry can be added to directory
    if(context.payload.action === 'created') {
      const isAlphanumeric = str => /^[a-z0-9]+$/gi.test(str);
      let labelInterim = labelName.split(/[^a-zA-Z0-9]+/);
      for(let i = 0; i < labelInterim.length ; i++) {
          if(i === 0) {
              keyName += labelInterim[0].toLowerCase();
          } else if(isAlphanumeric(labelInterim[i])) {
              keyName += labelInterim[i].split(' ').map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(' ');
          }
      }
    };

    
    // Log the label information
    console.log('-------------------------------------------------------');
    console.log('Label reference info:');
    console.log(context.payload.label);
    console.log('-------------------------------------------------------');
    if(context.payload.action === 'edited') {
      console.log('What was changed:');
      console.log(context.payload.changes);
      console.log('-------------------------------------------------------');
    }

    
    // Update directory (delete, edit, or create) and log
    if(context.payload.action === 'deleted') {
      delete data[keyName];
      console.log('\nDeleted label:\n {"' + keyName + '": ["' + labelId + '", "' + labelName + '"]}\n');
    } else {
      data[keyName] = [labelId, labelName];
      console.log('\nWriting data:\n {"' + keyName + '": ["' + labelId + '", "' + labelName + '"]}\n');
    }

    
    // Write data file in prep for committing changes to label directory
    fs.writeFile(filepath, JSON.stringify(data, null, 2), (err) => {
      if (err) throw err;
      console.log('-------------------------------------------------------');
      console.log("File 'label-directory.json' saved successfully!");
    });
    
  } else {
    console.log('Label name was not changed');
  } 
}


module.exports = main;
