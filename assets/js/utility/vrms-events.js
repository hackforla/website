---
---

{% assign vrmsData = site.data.external.vrms_data %}
const vrmsData = JSON.parse(decodeURIComponent("{{ vrmsData | jsonify | uri_escape }}"));

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


// Formats time to be readable for projects.html page
export function timeFormat(time) {
    let hours = time.getHours();
    let minutes = time.getMinutes();

    if (minutes == 0) {
        minutes = minutes + "0";
    }

    if (hours < 12) {
        return `${hours}:${minutes} am`;
    }
    else if (hours > 12){
        hours = hours - 12;
        return `${hours}:${minutes} pm`;
    }
    else if (hours = 12){
        return `${hours}:${minutes} pm`;
    } else {
        return `${hours}:${minutes} am`;
    }

}

