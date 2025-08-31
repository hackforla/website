 // import modules
 const fs = require('fs');

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
const dataPath = '_data/external/vrms_data.json';

// Read the original data
const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Filter it
function filterJson(e) {
  const p = e.project || {};
  return {
    // minimal top-level fields the site uses
    name: e.name ?? null,            // meeting title
    description: e.description ?? "", 
    date: e.date ?? null,
    startTime: e.startTime ?? null,
    endTime: e.endTime ?? null,

    // keep ONLY the project fields the UI references
    project: {
      name: p.name ?? null,
      githubUrl: p.githubUrl ?? "",
      hflaWebsiteUrl: p.hflaWebsiteUrl ?? "",
      githubIdentifier: p.githubIdentifier ?? null,
      projectStatus: p.projectStatus ?? null,
      location: p.location ?? null,
      slackUrl: p.slackUrl ?? "",          // harmless, public workspace link
      googleDriveUrl: p.googleDriveUrl ?? ""
    },

    // DO NOT include: videoConferenceLink, meeting passcodes, owner IDs, emails, etc.
  };
}

// Apply filter to each record
const filteredData = rawData.map(filterJson);

// Write the filtered data back to the same file
fs.writeFileSync(dataPath, JSON.stringify(filteredData, null, 2));

console.log(`Filtered data written to ${dataPath}`);
