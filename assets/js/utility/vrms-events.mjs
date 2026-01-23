---
---

{% assign vrmsData = site.data.external.vrms_data %}
const vrmsData = JSON.parse(decodeURIComponent("{{ vrmsData | jsonify | uri_escape }}"));

/* vrmsDataFetch calls sortByDate function and passes filteredVrmsData variable, current page which can either be "events" for the right-col-content.html page or 
"project" from the project.html page, and passes the appendMeetingTimes function from projects.js that appends the sorted vrmsData 
returned by sortByDate to project.html. AppendMeetingTimes is only called if vrmsDataFetch is being called from project.js for the project.html page 
*/
export const vrmsDataFetch = (currentPage, appendMeetingTimes) => {
  const filteredEvents = filterTestEvents(vrmsData);
  const sortedEvents = sortEventsByDate(filteredEvents);

  if (currentPage == "events") return sortedEvents;
  else if (currentPage == "project") {
    appendMeetingTimes(sortedEvents);
  }
}

/**
 * Sorts an array of events by their "startTime" variable, from oldest to newest
 */
export function sortEventsByDate(events) {
     return events.sort((event1, event2) => {
        // startTime includes date information
        const date1 = new Date(event1.startTime);
        const date2 = new Date(event2.startTime);
        return date1 - date2;
     });
}

/**
 * Filters an array of events to remove instances of events with names containing
 * "test" or "testing, case insensitive
 */
export function filterTestEvents(events) {
    return events.filter(event => {
        return !(/\btest(ing)?\b/i.test(event.name))
    });
}

/**
  * @param {Date} time - A valid javscript time string. Example:  "2020-05-13T02:00:00.000Z"
  * @return {String} - A time string formatted in the 12 hour format and converted to your timezone. Example: "10:00 pm"
*/
// Formats time to be readable for projects.html and right-col-content.html page
export function localeTimeIn12Format(time) {
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

