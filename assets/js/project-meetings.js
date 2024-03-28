import { getEventData, insertEventSchedule } from "./utility/api-events.js";
/**
 * This type of function is called an IIFE function. The main function is the primarily controller that loads the recurring events on this page.
 * Refer: https://developer.mozilla.org/en-US/docs/Glossary/IIFE
 */
(async function main() {
  const eventData = await getEventData();

  // If the document is still loading, add an EventListener. There is no race conditiion because JavaScript has run-to-completion semantics
  if (document.readyState === "loading")
  {
    document.addEventListener(
    "DOMContentLoaded",
    function(){insertEventSchedule(eventData, "project-meetings")}
    );
  }

  // If the document is not in the loading state, the DOM content has loaded and the event schedule can be populated
  else {insertEventSchedule(eventData, "project-meetings")}
  
  //Displays/Inserts the user's time zone in the DOM
  document
    .querySelector("#userTimeZone")
    .insertAdjacentHTML("afterbegin", timeZoneText());
})();
