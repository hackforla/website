import {vrmsDataFetch, localeTimeIn12Format} from "../../../assets/js/utility/vrms-events.mjs";
import { jest } from '@jest/globals';


describe('vrmsDataFetch', () => {
    it('should return sorted non-test event array and not call appendMeetingTimes for "events" view', async() => {
        // Create a mock function to see if it is called
        const mockAppend = jest.fn();

        // Call vrmsDataFetch with events view and mock function
        const vrmsData = vrmsDataFetch('events', mockAppend);

        // Return data is an array
        expect(Array.isArray(vrmsData)).toBe(true);

        // Mock append should not be called
        expect(mockAppend).not.toHaveBeenCalled();

        // There should be no entries with "Test" or "Testing", case insensitive
        expect(vrmsData.every(e => /test/i.test(e.name) === false)).toBe(true);

        // The entries should be sorted by date
        for (let i = 1; i < vrmsData.length; i++) {
            expect(new Date(vrmsData[i].date) >= new Date(vrmsData[i-1].date)).toBe(true);
            expect(new Date(vrmsData[i].startTime) >= new Date(vrmsData[i-1].startTime)).toBe(true);
        } 
    });

    it('should call appendMeetingTimes with sorted non-test events for "project" view', async() => {
        // Create a mock function to see if its called and what it was called with
        const mockAppend = jest.fn();
        
        // Call vrmsModule.vrmsDataFetch with events view and mock function
        const vrmsData = vrmsDataFetch('project', mockAppend);

        // Mock event should be called
        expect(mockAppend).toHaveBeenCalled();

        // Check the calling args -- should have been called with our filtered and sorted events list
        const appendArgs = mockAppend.mock.calls[0][0];
        expect(Array.isArray(appendArgs)).toBe(true);
        expect(appendArgs.every(e => /test/i.test(e.name) === false)).toBe(true);

        // The actual return value from vrmsDataFetch when called with 'project' is undefined
        expect(vrmsData).toBeUndefined();
    });

    it('will do nothing if called with a view other than "events" or "project"', async() => {

        // Create a mock function to see if its called and what it was called with
        const mockAppend = jest.fn();
        
        // Call vrmsModule.vrmsDataFetch with events view and mock function
        const vrmsData = vrmsDataFetch('test', mockAppend);

        // Mock event should not be called
        expect(mockAppend).not.toHaveBeenCalled();

        // The return value should be undefined
        expect(vrmsData).toBeUndefined();
    });
});

describe('localeTimeIn12Format', () => {
    it('should return a 12-hour formatted string', () => {
        // Pass in a dummy timestamp checking single digit AM hour format
        let timeStr = localeTimeIn12Format("2020-05-13T02:00:00.000Z");
        expect (typeof timeStr).toBe('string');
        // regex to match "1:00 am"/"10:00 pm" format.
        // Maybe overkill and not as specific as later tests...
        expect(timeStr).toMatch(/\b([1-9]|1[1-2])\b:\b([0-5][0-9])\b (am|pm)/); 
    })

    it ('should handle single digit AM times correctly', () => {
        const timeStr = localeTimeIn12Format("2025-10-20T01:00:00.000Z");
        expect(timeStr).toBe('1:00 am');
    })

    it ('should handle multi-digit AM times correctly', () => {
        const timeStr = localeTimeIn12Format("2025-10-20T10:15:00.000Z");
        expect(timeStr).toBe('10:15 am');
    })

    it ('should handle single-digit PM times correctly', () => {
        const timeStr = localeTimeIn12Format("2025-10-20T14:31:00.000Z");
        expect(timeStr).toBe('2:31 pm');
    })

    it ('should handle multi-digit PM times correctly', () => {
        const timeStr = localeTimeIn12Format("2025-10-20T23:59:00.000Z");
        expect(timeStr).toBe('11:59 pm');
    })
});
