/**
 * Formats event data 
 * @param  {Object} data - array of event objects
 * @return {Object} filtered and sorted data
 */
function formatEventData(data) {
  let filteredData = filterDataFromApi(data);
  let sortedData = sortData(filteredData);
  return sortedData
}

/**
 * Fetches data from VRMS API
 * @param  {URL} url
 * @return {Object} response data
 */
async function sendGetRequest(url) {
  try {
    const resp = await fetch(url);
    return resp.json();
  } catch (err) {
    // Handle Error Here
    console.error(err);
  }
}

/**
 * Filters out the needed data from the api endpoint
 */
function filterDataFromApi(response_data) {
  const return_obj = {};
  response_data.forEach((item) => {
    let day_of_week = getDayString(item.date);
    if (!(day_of_week in return_obj)) {
      return_obj[day_of_week] = [];
      return_obj[day_of_week].push(display_object(item));
    } else {
      return_obj[day_of_week].push(display_object(item));
    }
  });
  return return_obj;
}

/**
 * Sorts Filtered Date from the api end point by their start time
 */
function sortData(filteredData) {
  for (const [key, value] of Object.entries(filteredData)) {
    value.sort(function (a, b) {
      return convertTime12to24(a.start) - convertTime12to24(b.start);
    });
  }
  return filteredData;
}

/**
 * @param {Date} time - A valid javscript time string. Example:  "2020-05-13T02:00:00.000Z"
 * @return {String} - A time string formatted in the 12 hour format and converted to your timezone. Example: "10:00 PM"
 */
function localeTimeIn12Format(time) {
  return new Date(time).toLocaleTimeString(
    {},
    {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hour12: true,
      hour: "2-digit",
      minute: "numeric",
    }
  );
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

export { formatEventData, sendGetRequest };
