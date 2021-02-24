const axios = require("axios");
const fs = require("fs");
const core = require("@actions/core");

const PATH_TO_WRITE_FILE = "_data/_wins-data.json";

const BASE_API_URL = "https://sheets.googleapis.com/v4/spreadsheets";
const SPREAD_SHEET_ID = "1zkr_dEyiT-WTksUkVyL4jYQuYC5_YvJCLrUIfBf1CeE";
const SHEETS_A1_RANGE = "'Sheet1'!A1:O";
const WINS_API_KEY =
  process.env.WINS_API_KEY || "AIzaSyDsY0jyeGRnVYmQco1Pt0fW3iDyfHiyYZE"; //Do not remove hard coded key on pull request
const QUERY_PARAMETERS = `key=${WINS_API_KEY}`;

const REQUEST_URL = `${BASE_API_URL}/${SPREAD_SHEET_ID}/values/${SHEETS_A1_RANGE}?${QUERY_PARAMETERS}`;

/**
 * Retrieves data from the wins excel sheet provided a valid excel url
 * @param  {URL} url
 * @return {Object} Returns and array of arrays object, where the array at index 0 contains the data from the header row in the excel sheet and all subsequent arrays contain personal informations.
 */
async function sendGetRequest(url) {
  try {
    const resp = await axios.get(url);
    return resp.data.values;
  } catch (error) {
    core.setFailed(error.message);
  }
}

/**
 * @param {Array} keys Where keys are the keys that are going to be assigned to each item in the values array
 * @param {Object} persons Where values is an array of array
 * @param {Array} unwanted_keys An array of keys that you do not want your object to contain
 * @return {Object} Returns and array of objects
 */
function create_container_object(keys, persons, unwanted_keys) {
  try {
    const container = [];
    const persons_container = [];

    //get rid of item if display column does not exist
    persons.forEach(function(person){
        let display_column_number = 14
        if (person.length > display_column_number -1) {
            persons_container.push(person)
        }
    })

    persons_container.map((person) => {
      //If the last element in the person array is not false
      if (person[person.length - 1] != "FALSE") {
        const person_obj = {};
        for (const [index, key] of keys.entries()) {
          person_obj[key] = person[index].replace('""', "");
        }
        unwanted_keys.length > 0 &&
          unwanted_keys.forEach((key) => {
            delete person_obj[key];
          });
        container.push(person_obj);
      }
    });

    return container;
  } catch (error) {
    core.setFailed(error.message);
  }
}

/**
 *
 * @param {Object} container Writes the container to a file specified by path
 * @param {String} path Path to the file destination
 */
function writeData(container, path) {
  try {
    fs.writeFileSync(path, JSON.stringify(container, null, 2));
  } catch (error) {
    core.setFailed(error.message);
  }
}

(async function main() {
  const time = new Date().toTimeString();
  core.setOutput("Running at: ", time);

  //data array from excel sheet
  const excel_data_array = await sendGetRequest(REQUEST_URL);

  //An array of all the headers that are going to be used to create keys for each person object
  const keys = excel_data_array[0];

  //An array of person data
  const persons = excel_data_array.slice(1);

  const unwanted_keys = ["display", "email"];

  //an array of key,value persons object
  const write_ready_container = create_container_object(
    keys,
    persons,
    unwanted_keys
  );

  //write data to file
  writeData(write_ready_container, PATH_TO_WRITE_FILE);
})();
