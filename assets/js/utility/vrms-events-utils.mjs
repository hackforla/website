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