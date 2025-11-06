import {sortEventsByDate, filterTestEvents} from "../../../assets/js/utility/vrms-events-utils.mjs";

const testEvents = [
    { name: 'Regular Meeting', date: '2025-10-21', startTime: '2025-10-21T18:00:00Z', endTime: '2025-10-21T19:00:00Z', project: { name: 'Project A' } },
    { name: 'Another Meeting', date: '2025-10-20', startTime: '2025-10-20T17:00:00Z', endTime: '2025-10-20T18:00:00Z', project: { name: 'Project B' } },
    { name: 'Test Event', date: '2025-10-22', startTime: '2025-10-22T12:00:00Z', endTime: '2025-10-22T13:00:00Z', project: { name: 'Project C' } },
    { name: 'testing event', date: '2025-10-23', startTime: '2025-10-23T13:00:00Z', endTime: '2025-10-23T14:00:00Z', project: { name: 'Project D' } },
    { name: 'Early Meeting', date: '2025-10-20', startTime: '2025-10-20T08:00:00Z', endTime: '2025-10-20T09:00:00Z', project: { name: 'Project B' } },
    { name: 'Late Meeting', date: '2025-10-20', startTime: '2025-10-20T23:00:00Z', endTime: '2025-10-20T23:59:00Z', project: { name: 'Project B' } }
];

it('sortEventsByDate should return sorted events', async() => {

    // Call sortEventsByDate with testEvents
    const sortedEvents = sortEventsByDate(testEvents);

    for (let i = 1; i < sortedEvents.length; i++) {
        expect(new Date(sortedEvents[i].date) >= new Date(sortedEvents[i-1].date)).toBe(true);
        expect(new Date(sortedEvents[i].startTime) >= new Date(sortedEvents[i-1].startTime)).toBe(true);
    } 
});


it('filterTestEvents should filter out test events', async() => {

    // Call sortEventsByDate with testEvents
    const filteredEvents = filterTestEvents(testEvents);

    // Make sure that no event names match the /test/i regex (test doesn't appear, case insensitive)
    expect(filteredEvents.every(event => /test/i.test(event.name) === false)).toBe(true);
});

