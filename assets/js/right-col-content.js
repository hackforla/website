import { sendGetRequest, formatEventData } from "./utility/api-events.js";

const API_ENDPOINT = "https://www.vrms.io/api/recurringevents";

/**
 * This type of function is called an IIFE function. The main function is the primarily controller that loads the recurring events on this page.
 * Refer: https://developer.mozilla.org/en-US/docs/Glossary/IIFE
 */
(async function main() {
  const response_data = await sendGetRequest(API_ENDPOINT);
  let formattedData = formatEventData(response_data)

  //Displays/Inserts event schedule to DOM
  document.addEventListener(
    "DOMContentLoaded",
    insertEventSchedule(formattedData)
  );
  //Displays/Inserts the user's time zone in the DOM
  document
    .querySelector("#userTimeZone")
    .insertAdjacentHTML("afterbegin", timeZoneText());
})();

/**
 * Inserts the recurring events into the html
 * @param {Object} formattedData - An array objects of the type returned by displayObject() in api-events.js
 */
function insertEventSchedule(formattedData) {
  for (const [key, value] of Object.entries(formattedData)) {
    let placeToInsert = document.querySelector(`#${key}-List`);
    placeToInsert.innerHTML = "";
    value.forEach((event) => {
      placeToInsert.insertAdjacentHTML(
        "beforeend",
        `<li>${event.start} - ${event.end} </li><li><a href="${event.hflaWebsiteUrl}">${event.name}</a> ${event.dsc}</li>`
      );
    });
  }
}
