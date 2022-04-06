const API_ENDPOINT = "https://www.vrms.io/api/recurringevents";

/**
 * Fetches event data from VRMS API, then sorts and filters the data
 * @param  {URL} url
 * @return {Object} response data
 */
async function getEventData() {
  try {
    const resp = await fetch(API_ENDPOINT);
    const responseData = await resp.json();
    return formatEventData(responseData);
  } catch (err) {
    console.error(err);
  }
}

/**
 * Inserts the recurring events into the html
 * @param {Object} eventData - An array objects of the type returned by displayObject()
 * @param {String} page - page that is using eventData ("events" or "project-meetings")
 */
function insertEventSchedule(eventData, page) {
  for (const [key, value] of Object.entries(eventData)) {
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
        let eventHtml;
        // insert the correct html for the current page
        if ( page === "events" ) {
          eventHtml = `<li>${event.start} - ${event.end} </li><li><a href="${event.hflaWebsiteUrl}">${event.name}</a> ${event.dsc}</li>`;
        } else {
          eventHtml = `<li>${event.start} - ${event.end} <a href="${event.hflaWebsiteUrl}">${event.name}</a> ${event.dsc}</li>`;
        }
        placeToInsert.insertAdjacentHTML(
          "beforeend", eventHtml
        );
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
  const filteredData = filterDataFromApi(data);
  const sortedData = sortData(filteredData);
  return sortedData;
}

/**
 * Filters out the needed data from the api endpoint
 */
function filterDataFromApi(responseData) {
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
 * Sorts Filtered Date from the api end point by their start time
 */
function sortData(filteredData) {
  for (const [key, value] of Object.entries(filteredData)) {
    value.sort(function (a, b) {
      return convertTime12to24(a.start) - convertTime12to24(b.start) || a.name.localeCompare(b.name);
    });
  }
  return filteredData;
}

/**
 * @param {Date} time - A valid javscript time string. Example:  "2020-05-13T02:00:00.000Z"
 * @return {String} - A time string formatted in the 12 hour format and converted to your timezone. Example: "10:00 pm"
 */
function localeTimeIn12Format(time) {
  return new Date(time)
    .toLocaleTimeString(
      {},
      {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour12: true,
        hour: "numeric",
        minute: "numeric",
      }
    )
    .toLowerCase();
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
 * Given a time string of 12 hour format like '06:00 pm' returns the integer of that string in 24 hour format -> 0600
 * @param {String} time12h - A 12 hour format time string
 * @return {Integer} An integer representing the input time string in 24 hour format
 */
function convertTime12to24(time12h) {
  const [time, modifier] = time12h.split(" ");

  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier.toLowerCase() === "pm") {
    hours = parseInt(hours, 10) + 12;
  }
  return parseInt(`${hours}${minutes}`);
}

/**
 * Function that represent the individual object extracted from the api
 */
function display_object(item) {
  const rv_object = {
    name: item.project.name,
    dsc: item.description,
    start: localeTimeIn12Format(item.startTime),
    end: localeTimeIn12Format(item.endTime),
    hflaWebsiteUrl: item.project.hflaWebsiteUrl,
  };
  return rv_object;
}

export { getEventData, insertEventSchedule };
