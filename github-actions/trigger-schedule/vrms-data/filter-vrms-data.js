 // import modules
 const fs = require('fs');
 const path = require('path');

/**
 * Filters JSON data from VRMS to extract only relevant fields,
 * this includes nested project details.
 *
 * @param {Array<Object>} data - Raw JSON array of entries
 * @returns {Array<Object>} Filtered entries
 */
// debug-pwd.js

console.log('Current working dir:', process.cwd());
console.log('__dirname:', __dirname);

// Get the path to the JSON file
const dataPath = path.join(__dirname, '../../../../_data/external/vrms_data.json');

// Read the original data
const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Filter it
function filterJson(data) {
  const project = data.project || {};
  return {
    name: data.name || null,
    date: data.date || null,
    startTime: data.startTime || null,
    endTime: data.endTime || null,
    projectStatus: project.projectStatus || null,
    'project.name': project.name || null,
    'project.githubIdentifier': project.githubIdentifier || null,
    'project.location': project.location || null,
    'project.githubUrl': project.githubUrl || null,
    'project.slackUrl': project.slackUrl || null,
    'project.googleDriveUrl': project.googleDriveUrl || null,
    createdDate: data.createdDate || null,
    hflaWebsiteUrl: data.hflaWebsiteUrl || project.hflaWebsiteUrl || null,
    description: data.description || null,
    'project.partners': project.partners || null,
    'project.hflaWebsiteUrl': project.hflaWebsiteUrl || null,
    'project.googleDriveId': project.googleDriveId || null,
    'project.projectStatus': project.projectStatus || null
  };
}

// Apply filter to each record
const filteredData = rawData.map(filterJson);

// Write the filtered data back to the same file
fs.writeFileSync(dataPath, JSON.stringify(filteredData, null, 2));

console.log(`Filtered data written to ${dataPath}`);

