import { vrmsDataFetch, localeTimeIn12Format } from "./utility/vrms-events.js"
/**
 * This type of function is called an IIFE function. The main function is the primarily controller that loads the recurring events on this page.
 * Refer: https://developer.mozilla.org/en-US/docs/Glossary/IIFE
 */
(function main() {
  const eventData = vrmsDataFetch("events")

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

/**
 * Inserts the recurring events into the html
 * @param {Object} eventData - An array objects of the type returned by displayObject()
 * @param {String} page - page that is using eventData ("events" or "project-meetings")
 */
function insertEventSchedule(eventData, page) {

    const formatedEvents = formatEventData(eventData)
  
    for (const [key, value] of Object.entries(formatedEvents)) {
      let placeToInsert = document.querySelector(`#${key}-List`);
      placeToInsert.innerHTML = "";
      // check if the day has any events
      if (!value.length) {
        placeToInsert.insertAdjacentHTML(
          "beforeend",
          `<li>There are no meetings scheduled.</li>`
        );
      } else {
        value.forEach((event) => {
          if (event) {
            // If a project doesn't have an hflaWebsiteUrl, redirect to the project's Github page
            if (event.hflaWebsiteUrl == "") {
                event.hflaWebsiteUrl = event.githubUrl
            }
            let eventHtml;
            // insert the correct html for the current page
            if (page === "events") {
                eventHtml = `<li>${event.start} - ${event.end} </li><li><a href="${event.hflaWebsiteUrl}">${event.name}</a> ${event.meetingName}</li>`;
            } else {
              if(event.dsc != "") event.meetingName += ", ";
                eventHtml = `<li>${event.start} - ${event.end} <a href="${event.hflaWebsiteUrl}">${event.name}</a> ${event.meetingName} ${event.dsc}</li>`;
            }
            placeToInsert.insertAdjacentHTML("beforeend", eventHtml);
          }
        });
      }
    }
  }
  
  /**
   * Formats event data
   * @param  {Object} data - array of event objects
   * @return {Object} filtered and sorted data
   */
  function formatEventData(data) {
    const filteredData = filterVrmsData(data);
    return filteredData
  
  }
  
  /**
   * Filters out the needed data from the vrmsData returned from vrmsDataFetch
   */
  function filterVrmsData(responseData) {
    const return_obj = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };
    responseData.forEach((item) => {
      let day_of_week = getDayString(item.date);
      return_obj[day_of_week].push(display_object(item));
    });
    return return_obj;
  }
  
  /**
   * @param {Date} date - A valid javscript time string. Example:  "2020-05-13T02:00:00.000Z"
   * @return {String} - The name of the day represented by the time string. Example 2020-05-13 was a wednesday. I.e rv = 'Wednesday'
   */
  function getDayString(date) {
    let new_date = new Date(date); 
    let weekday = new_date.getDay();
    let options = { weekday: "long" };
    return new Intl.DateTimeFormat("en-US", options).format(new_date);
  }
  
  /**
   * Function that represent the individual object extracted from the api
   */
  function display_object(item) {
    if (item?.project?.name !== "Hack4LA" && !/^Test\b/i.test(item?.project?.name)) { 
      const rv_object = {
        meetingName: item.name,
        name: item.project.name,
        dsc: item.description,
        start: localeTimeIn12Format(item.startTime),
        end: localeTimeIn12Format(item.endTime),
        hflaWebsiteUrl: item.project.hflaWebsiteUrl,
          githubUrl: item.project.githubUrl,
        };
        return rv_object;
    }
  }
  