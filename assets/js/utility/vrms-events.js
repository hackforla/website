---
---

{% assign vrmsData = site.data.external.vrms_data %}
const vrmsData = JSON.parse(decodeURIComponent("{{ vrmsData | jsonify | uri_escape }}"));

/* vrmsDataFetch calls sortByDate function and passes vrmsData variable, current page which can either be "events" for the right-col-content.html page or 
"project" from the project.html page, and passes the appendMeetingTimes function from projects.js that appends the sorted vrmsData 
returned by sortByDate to project.html. AppendMeetingTimes is only called if vrmsDataFetch is being called from project.js for the project.html page 
*/
export const vrmsDataFetch = (currentPage, appendMeetingTimes) => {
    return sortByDate(vrmsData, currentPage, appendMeetingTimes)
}

 // Helper function used for project.html and right-col-content.html to sort VRMS data by day of the week from "date" key and meeting time from "startTime" key
 function sortByDate(scheduleData, currentPage, appendMeetingTimes) {
    const map = {
        'Mon': 1,
        'Tue': 2,
        'Wed': 3,
        'Thu': 4,
        'Fri': 5,
        'Sat': 6,
        'Sun': 7
     };

     scheduleData.sort(function(a, b) {
        const day1 = new Date(a.date).toString().substring(0, 3);
        const day2 = new Date(b.date).toString().substring(0, 3);

        return map[day1] - map[day2];
     });

     scheduleData.sort(function(a, b) {
        const day1 = new Date(a.date).toString().substring(0, 3);
        const day2 = new Date(b.date).toString().substring(0, 3);
        const time1 = new Date(a.startTime).toString().substring(16, 21);
        const time2 = new Date(b.startTime).toString().substring(16, 21);

        if (day1 === day2) {
            if (time1 > time2) {
                return 1;
            } else {
                return -1;
            }
        } else {
            return 1;
        }
     });

    if (currentPage === "events") return scheduleData
    else if (currentPage === "project") appendMeetingTimes(scheduleData)
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

