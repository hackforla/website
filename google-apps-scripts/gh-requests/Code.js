/**
 * Library for API requests to the GitHub
 */

/************************************************** GLOBAL CONSTANTS ********************************************************************/

const documentProperties = PropertiesService.getDocumentProperties();
const ACCEPT_HEADER = {
  "Repository": "application/vnd.github.v3+json",
  "ProjectBoard": "application/vnd.github.inertia-preview+json"
}

/************************************************** FUNCTIONS USING THE FETCH REQUESTS ********************************************************************/

// Retrieves a GitHub file's SHA
function getSHA(fileName) {
  const branch = "update-wins-data";
  const url = `https://api.github.com/repos/elizabethhonest/website/contents/_data/external/${fileName}?ref=${branch}`;
  const response = getRequest_(url, ACCEPT_HEADER.Repository);

  if (response === false ) {
    console.log('SHA retrieval failed.')
    return false;
  }

  console.log('SHA retrieved.')
  return response.body.sha;
}

// Updates Github File given a payload
function updateWinsFile(fileName, content, sha) {
  const payload = {
    "message": "Updating wins data",
    "content": content,
    "sha": sha,
    "branch": "update-wins-data"
  }
  const url = `https://api.github.com/repos/elizabethhonest/website/contents/_data/external/${fileName}`;
  const response = putRequest_(url, ACCEPT_HEADER.Repository, payload);

  if (response === false ) {
    console.log(`Updating ${fileName} failed.`)
    return false;
  }

  console.log(`Updating ${fileName} succeeded.`);
  return response;
}

// Creates a Pull Request
function createPR() {
  const payload = {
    "title": "Update wins-data.json via Google Apps Script",
    "head": "elizabethhonest:update-wins-data",
    "base": "gh-pages",
    "body": "PR to update the wins data. To be reviewed by the merge team.",
  };
  const url = `https://api.github.com/repos/hackforla/website/pulls`;
  const response = postRequest_(url, ACCEPT_HEADER.Repository, payload);

  if (response === false ) {
    console.log(`PR Creation failed.`)
    return false;
  }

  console.log(`PR creation succeeded. PR# ${response.body.number}`);
  return response;
}

// Creates a new issue
function createIssue() {
  const payload = {
    "title": "Review Needed - New Wins Form Submission",
    "body": "A new wins form submission has just been created. Please navigate to the link below to review it.<br><br>- [Wins Submission Google Sheet](https://docs.google.com/spreadsheets/d/1fXmYrmNtrgdzkM_odGIRbSwdaea3yS0cTLCJUzZ6Sc0/edit#gid=1706218917)",
    "labels": ["new-win-submission","P-Feature: Wins Page", "role: product", "good first issue"]
  };
  const url = `https://api.github.com/repos/hackforla/website/issues`;
  const response = postRequest_(url, ACCEPT_HEADER.Repository, payload);

  if (response === false ) {
    console.log(`Issue creation failed.`)
    return false;
  }

  console.log(`Issue creation succeeded. Issue# ${response.body.number}`);
  return response;
}

// Adds an issue to a project board column
function addIssueToProjectBoardColumn(issueID, columnID) {
  const payload = {
    "note": null,
    "content_id": parseInt(issueID),
    "content_type": "Issue", // new-win-submission
  };
  const url = `https://api.github.com/projects/columns/${columnID}/cards`;
  const response = postRequest_(url, ACCEPT_HEADER.ProjectBoard, payload);

    if (response === false ) {
    console.log(`Adding issue to project board column failed.`)
    return false;
  }

  console.log(`Adding issue to project board column succeeded. Project card ${response.body.id}`);
  return response;
}

/************************************************** TOKEN RETRIEVAL ********************************************************************/

// Retrieves token from a Google Doc
function setToken_() {
  let id;
  const files = DriveApp.getFilesByName('gh-key')
  while (files.hasNext()) {
    const file = files.next();
    if (file.getName() === 'gh-key'){
      id = file.getId();
    }
  }
  
  const doc = DocumentApp.openById(id);
  documentProperties.setProperty('TOKEN', doc.getBody().getText())
}

// Uses base64 to decode an input
function decode(value) {
  return Utilities.newBlob(Utilities.base64Decode(value)).getDataAsString()
}

/************************************************** FETCH REQUESTS ********************************************************************/

// GitHub GET request
function getRequest_(url, acceptHeader) {
  setToken_();
  const options = {
    'method': 'GET',
    'headers': {
      'Accept': acceptHeader,
      'Authorization': decode(documentProperties.getProperty('TOKEN'))
    },
    'muteHttpExceptions': true
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseObject = {
    'status': response.getResponseCode(),
    'body': JSON.parse(response.getContentText())
  }

  if (responseObject.status === 200) {
    console.log('Get Request Succeeded. \n');
    return responseObject;
  }
  else {
    console.log(`Error Status Code ${responseObject.status}: \n${JSON.stringify(responseObject.body)}`);
    return false;
  }
}

// GitHub PUT request
function putRequest_(url, acceptHeader, payload) {
  setToken_();
  const options = {
    'method': 'PUT',
    'headers': {
      'Accept': acceptHeader,
      'ContentType': 'application/json',
      'Authorization': `token ${decode(documentProperties.getProperty('TOKEN'))}`
    },
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseObject = {
    'status': response.getResponseCode(),
    'body': JSON.parse(response.getContentText())
  }

  if (responseObject.status === 200 || responseObject.status === 201) {
    console.log('Put Request Succeeded. \n');
    return responseObject;
  }
  else {
    console.log(`Error Status Code ${responseObject.status}: \n${JSON.stringify(responseObject.body)}`);
    return false;
  }
  
}

// GitHub POST request
function postRequest_(url, acceptHeader, payload) {
  setToken_();
  const options = {
  'method': 'POST',
    'headers' : {
      'Accept' : acceptHeader,
      'ContentType' : 'application/json',
      'Authorization' : `token ${decode(documentProperties.getProperty('TOKEN'))}`
    },
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseObject = {
    'status': response.getResponseCode(),
    'body': JSON.parse(response.getContentText())
  }

  if (responseObject.status === 200 || responseObject.status === 201) {
    console.log('Post Request Succeeded. \n');
    return responseObject;
  }
  else {
    console.log(`Error Status Code ${responseObject.status}: \n${JSON.stringify(responseObject.body)}`);
    return false;
  }
}
