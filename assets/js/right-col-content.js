import { getEventData, insertEventSchedule } from "./utility/api-events.js";

/**
 * This type of function is called an IIFE function. The main function is the primarily controller that loads the recurring events on this page.
 * Refer: https://developer.mozilla.org/en-US/docs/Glossary/IIFE
 */
(async function main() {
  const eventData = await getEventData();

  //Displays/Inserts event schedule to DOM
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => { insertEventSchedule(eventData, "events"); }
    );
  }
  else {
    insertEventSchedule(eventData, "events");
  }

  //Displays/Inserts the user's time zone in the DOM
  document
    .querySelector("#userTimeZone")
    .insertAdjacentHTML("afterbegin", timeZoneText());
})();