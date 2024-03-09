const fs = require('fs');

// Global variables
var github;
var context;

async function main({ g, c }) {
  
  github = g;
  context = c;

  // Proceed only if the label name changed or if the label is completely new
  if((context.payload.action === 'edited' && context.payload.changes.name) || (context.payload.action === 'created')) {

    const labelId = context.payload.label.id + '';
    const labelName = context.payload.label.name;

    // Retrieve label directory
    const filepath = 'github-actions/utils/_data/label-directory.json';
    const rawData = fs.readFileSync(filepath, 'utf8');
    const data = JSON.parse(rawData);
    let keyName = '';

        
    // Check if labelId exists in label directory, if so, set keyName
    if(context.payload.action === 'edited') {
      for(let [key, value] of Object.entries(data)) {
        if (value.includes(labelId)) {
          keyName = key;
          break;
        }
      };
    }

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

    // Log the entry, then save to data file
    console.log('-------------------------------------------------------');
    console.log('Current info for edited label:');
    console.log(context.payload.label);
    console.log('-------------------------------------------------------');
    if(context.payload.action === 'edited') {
      console.log('What was changed:');
      console.log(context.payload.changes);
      console.log('-------------------------------------------------------');
    }
    console.log('Writing data:\n {"' + keyName + '": ["' + labelId + '", "' + labelName + '"]}\n');
    
    // Save entry to data file
    data[keyName] = [labelId, labelName];
    
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
