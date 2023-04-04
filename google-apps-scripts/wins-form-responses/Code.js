/**
 * The following file has three primary functions that runs on three separate triggers.
 *  
 * Trigger 1:
 *    - This is a time based trigger that runs every month and it calls the function main()
 * 
 * Trigger 2 and 3:
 *    - These are "On Form Submit" triggers which calls createIssue and insertLatestFormSubmitIntoReviewSheet
 * 
 * Resources:
 *    1. Ice Box                   = https://github.com/hackforla/website/projects/7#column-7198227
 *    2. Prioritized Backlog       = https://github.com/hackforla/website/projects/7#column-7198257
 *    3. In Progress               = https://github.com/hackforla/website/projects/7#column-7198228
 *    4. Links/Questions/In Review = https://github.com/hackforla/website/projects/7#column-8178690
 *    6. Link to "Review" sheet    = https://docs.google.com/spreadsheets/d/1tj6eQlVLFgmskoXouVt87POxYVwR1yWT2vOSQEPyDtg/edit#gid=1706218917
 *    7. Link to "Responses" sheet = https://docs.google.com/spreadsheets/d/1tj6eQlVLFgmskoXouVt87POxYVwR1yWT2vOSQEPyDtg/edit?resourcekey#gid=1106372497
 */


/************************************************** GLOBAL CONSTANTS ********************************************************************/

const ISSUE_TEMPLATE = {
  "title":"",
  "body":"",
  "labels": []
}

const COLUMN_KEYS = {
  "IceBox": 7198227,
  "NewIssueApproval": 15235217,
  "PrioritizedBacklog": 7198257,
  "InProgress": 7198228,
  "InReview": 8178690
}

/************************************************** TRIGGER(Time Based) 1 SECTION ********************************************************************/
/*
  Go through the "Responses" sheet and creates a formatted data to be sent to GitHub via API requests.
  The data is then written to the fork of a HFLA Website "bot" account. The bot (also called Beth) then opens a PR to merge the changes.
*/
function main() {

  // Get all the data from the Responses sheet
  const responseAnswers = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Responses");
  const allRows = responseAnswers.getDataRange().getValues();
  const columnHeaders = Array.from(allRows[0]);

  // Filter out only the rows where display-column(colum 13) is set to true
  const filteredRows = Array.from(allRows).filter(win => win[13] == true);

  // Create an array of objects (key-value pair) based on the column headers and rows of values so the data does not need to be formatted later in GitHub
  const keyValueData = filteredRows.map(row => {
    const valueObject = new Object();
    row.forEach((value, i) => {
      valueObject[columnHeaders[i]] = value;
    })
    return valueObject;
  })

  const sortedKeyValueData = keyValueData.sort((a,b) =>  a.Timestamp - b.Timestamp);

  /*
  ** This section deals with the key-value pair data for _wins-data.json
  ** The payload is formatted and prepared for an API request to GitHub
  */

  // Create an array of objects (key-value pair) for _wins-data.json
  const cleanedAndFormattedKeyValueData = JSON.stringify(sortedKeyValueData);
  const encodedKeyValueData = Utilities.base64Encode(`${cleanedAndFormattedKeyValueData}`, Utilities.Charset.UTF_8);

    // Retrieves latest sha of the _wins data file, which is needed for edits later
  const keyValueFile = "_wins-data.json"
  const keyValueSha = ghrequests.getSHA(keyValueFile);
  if (keyValueSha === false) {
    console.log('Ending script...')
    return 1;
  }

  const writeResponse = ghrequests.updateWinsFile(keyValueFile, encodedKeyValueData, keyValueSha);
  if (writeResponse === false) {
    console.log('Ending script...')
    return 1;
  }

  /*
  ** This section deals with the array of data for wins-data.json
  ** Eventually, lines 91-107 below should be deleted (EXCLUDING createPrResponse) when the team fully migrates from using wins-data.json to _wins-data.json
  ** The payload is formatted and prepared for an API request to GitHub
  */

  // Create an array of data for wins-data.json
  const cleanedAndFormattedArrayData = JSON.stringify(filteredRows);
  // const encodedArrayData = Utilities.base64Encode(`${cleanedAndFormattedArrayData}`);
  const encodedArrayData = Utilities.base64Encode(cleanedAndFormattedArrayData, Utilities.Charset.UTF_8); 

  // Retrieves latest sha of the wins data file
  const arrayFile = "wins-data.json"
  const arrayDataSha = ghrequests.getSHA(arrayFile);
  if (arrayDataSha === false) {
    console.log('Ending script...')
    return 1;
  }

  const writeResponse2 = ghrequests.updateWinsFile(arrayFile, encodedArrayData, arrayDataSha);
  if (writeResponse2 === false) {
    console.log('Ending script...')
    return 1;
  }

  const createPrResponse = ghrequests.createPR();
}

/************************************************** TRIGGER("On Form Submit") 2 SECTION ********************************************************************/
/* 
  Create a GitHub issue about the new wins form submission, and move it to a project board column
*/
function createIssue(e) {
  const issueResponse = ghrequests.createIssue();
  if (issueResponse === false) {
    console.log('Ending script...')
    return 1;
  }

  ghrequests.addIssueToProjectBoardColumn(issueResponse.body.id, COLUMN_KEYS["InReview"]);
}

/************************************************** TRIGGER("On Form Submit") 3 SECTION ********************************************************************/
/*
  For each new wins submission, create a "readable" version under the "Review" Sheet.
  The reviewer will then look at this and decide if the wins submission should be displayed in the wins page.
*/
function insertLatestFormSubmitIntoReviewSheet(formSubmitEvent){

  const rawFormDataObject = formSubmitEvent.namedValues;

  const formDataInsertedAt = formSubmitEvent.range;      //range: { columnEnd: 13, columnStart: 1, rowEnd: 34, rowStart: 34 }

  const reviewSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Review");
  const responsesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Responses");


  let processedFormDataObject = new Map();
  processedFormDataObject.set("Email", rawFormDataObject["Email Address"])
  processedFormDataObject.set("Name", rawFormDataObject["Full name"])
  processedFormDataObject.set("LinkedIn", rawFormDataObject["Linkedin URL (optional)"])
  processedFormDataObject.set("LinkedIn Picture Allowed ?", rawFormDataObject["Could we use your Linkedin profile picture next to your story?"])
  processedFormDataObject.set("GitHub", rawFormDataObject["Github URL (optional)"])
  processedFormDataObject.set("GitHub Picture Allowed ?", rawFormDataObject["Could we use your Github profile picture next to your story?"])
  processedFormDataObject.set("Teams", rawFormDataObject["Select the team(s) you're on"])
  processedFormDataObject.set("Roles", rawFormDataObject["Select your role(s) on the team"])
  processedFormDataObject.set("Specific Roles", rawFormDataObject["What is/was your specific role? (optional)"])
  processedFormDataObject.set("Celebrations", rawFormDataObject["What do you want to celebrate (select all that apply)?"])
  processedFormDataObject.set("Overview", rawFormDataObject["Give us a brief overview"])

  const memberSince = rawFormDataObject["When did you join Hack for LA? (optional)"]
  
  // Prepare display string from proccssed form data object
  let displayString = "";
  for(const [key,value] of processedFormDataObject ){
    displayString += `${key} : ${value} \n\n`;
  }

  // Create and insert a new empty row before row 2
  reviewSheet.insertRowBefore(2);

  // Insert member since value on column 3
  reviewSheet.getRange(2,3).setValue(memberSince);

  // Insert display overview value on column 4
  reviewSheet.getRange(2,4).setValue( displayString );

  // Set the column 'N'  for new row created in the 'Responses' sheet by form submission to be mapped to the new row created in the 'review' sheet
  responsesSheet.getRange(formDataInsertedAt.rowStart, formDataInsertedAt.columnEnd + 1).setFormula("=Review!A2");
  
  // Set the column 'O'  for new row created in the 'Responses' sheet by form submission to be mapped to the new row created in the 'review' sheet
  responsesSheet.getRange(formDataInsertedAt.rowStart, formDataInsertedAt.columnEnd + 2).setFormula("=Review!B2");
  }

/***************************************************************** DEBUGGING (run manually) *************************************************/
/**
 * This function should be used if the display and homepage formulas in the responses sheet get out of snyc. 
 * The formulas shouldn't often be out of sync but if this happens, run this method and it will set all the formulas to the correct values.
 */
function setDisplayHomepageFormulas() {

  const responsesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Responses");
  const responsesValues = responsesSheet.getRange(2, 2, responsesSheet.getLastRow() - 1, 14).getValues();

  let reviewSheetRow = 2;
  for(let i = responsesValues.length + 1; i > 1; i--) {
    responsesSheet.getRange(i, 14).setFormula("=Review!A" + reviewSheetRow);
    responsesSheet.getRange(i, 15).setFormula("=Review!B" + reviewSheetRow);

    reviewSheetRow++;
  }

}

/**************************************************************** DEBUGGING (run manually) *************************************************/
/**
 * This function compares all the values in the review and responses sheets. 
 * If the two sheets don't have the same amount of rows then the function will exit early as the comparison would not work.
 * 
 * In order to run the comparison just select this function in the dropdown, press run, and then look at what is logged out.
 */
function compareResponsesAndReview() {

  const reviewSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Review");
  const responsesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Responses");

  //The number of columns in the responses sheet, kept at a constant value as this shouldn't change
  const numColumns = 14;

  //All the cells with data from the responses sheet
  const responsesValues = responsesSheet.getRange(2, 2, responsesSheet.getLastRow() - 1, numColumns).getValues();

  //All cells from the DisplayReview column of the review sheet
  const reviewInfo = reviewSheet.getRange(2,4, reviewSheet.getLastRow() - 1).getValues();
  
  //All cells from the Display and Homepage columns of the review sheet
  const reviewDisplayHomepageValues = reviewSheet.getRange(2,1,reviewSheet.getLastRow() - 1, 2).getValues();

  //Exit the function if the two sheets have different numbers of elements as the comparison code will not work correctly
  if(reviewSheet.getLastRow() !== responsesSheet.getLastRow()){
    console.log("The Review and Response sheets have different lengths! \nThe review sheet has " + reviewSheet.getLastRow() 
    + " rows \nThe responses sheet has " + responsesSheet.getLastRow() + " rows");
    return;
  }

  //variable used to iterate through the review sheet rows 
  let reviewIndex = 0;

  //variables to keep track of the number of matched and unmatched rows
  let matched = 0;
  let unamatched = 0;

  //loop through the responses rows backwards 
  //the last response row with data corresponds to the first review row with data so that is why we loop backwards
  for(let i = responsesValues.length-1; i >= 0; i--) {
    let reviewValues = [];

    let reviewInfoSplit = reviewInfo[reviewIndex][0].split("\n\n");

    //The last field "Overview" is a text box which allows users to insert their own line breaks. This can be a problem because we are splitting on double line breaks.
    //The for loop below loops addresses this issue by going through any extra text that was wrongly split into its own values and puts it back with the rest of the Overview text.
    if (reviewInfoSplit.length > 10) {
      let text = reviewInfoSplit[10];

      for (let i = 11; i < reviewInfoSplit.length; i++) {
        text += "\n\n" + reviewInfoSplit[i];
      }
      reviewInfoSplit[10] = text;
    }

    //Gets the values 
    for(let i = 0; i <= 10; i++){
      values = reviewInfoSplit[i].split(" : ");
      let value = values[1];
      if (value !== undefined) { 
        value = value.trim();
      }
      reviewValues.push(value);
    }

    //Add display and homepage values to reviewValues as they aren't in the DisplayReview column
    reviewValues.push(reviewDisplayHomepageValues[reviewIndex][0]);
    reviewValues.push(reviewDisplayHomepageValues[reviewIndex][1]);

    reviewIndex++;
    let offset = 0;

    //Loop through each column and compare the review and response sheets 
    for(let j = 0; j < numColumns-1; j++) {

      //this is done to skip over the when did you join Hack4La as it doesn't exist in the review sheet 
      if (j === 9) {
        offset++;
      }

      let responseValue = responsesValues[i][j+offset];

      if (typeof responseValue === "string") {
        responseValue = responseValue.trim();
      }

      if (responseValue !== reviewValues[j]) {
        console.log("Mismatch found!\nResponse value: " + responseValue + "\nReview   value: " + reviewValues[j])
        unamatched++;
      } else {
        matched++;
      }
    }
  }

  if (unamatched === 0) {
    console.log("SUCCESS! All elements from the review sheet match those from the response sheet");
  } else {
    console.log("Mismatches were detected\nMatched: " + matched + " Unmatched: " + unamatched);
  }

}

  


