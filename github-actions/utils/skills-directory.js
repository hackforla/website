const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '_data', 'skills-directory.json');

function loadDirectory() {
    if (!fs.existsSync(directoryPath)) return {};
    return JSON.parse(fs.readFileSync(directoryPath, 'utf8'));
}

function saveDirectory(data) {
    fs.writeFileSync(directoryPath, JSON.stringify(data, null, 2));
}

function lookupSkillsDirectory(eventActor) {
    const directory = loadDirectory();
    const result = directory.find(entry => entry.eventActor === eventActor);
  
    return result || null;
}

function updateSkillsDirectory(eventActor, skillsInfo) {
    const directory = loadDirectory();
    const result = directory.find(entry => entry.eventActor === eventActor);
    directory[eventActor] = skillsInfo;
    saveDirectory(directory);
}

module.exports = { lookupSkillsDirectory, updateSkillsDirectory };
