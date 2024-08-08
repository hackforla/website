---
---

{% assign vrmsData = site.data.external.vrms_data %}
const vrmsData = JSON.parse(decodeURIComponent("{{ vrmsData | jsonify | uri_escape }}"));

document.addEventListener("DOMContentLoaded", function() {
    // Function to retrieve and format meeting times
    function getMeetingTimes(projectName) {
        const project = vrmsData.find(event => 
            event.project && event.project.name.startsWith("Community of Practice") && event.project.name.includes(projectName)
        );

        if (project) {
            // Convert to Pacific Time
            const options = { timeZone: "America/Los_Angeles", hour: 'numeric', minute: 'numeric', hour12: true };
            const startTime = new Date(project.startTime);
            const endTime = new Date(project.endTime);
            
            // Format in Pacific Time
            const formatter = new Intl.DateTimeFormat('en-US', options);
            const formattedStartTime = formatter.format(startTime);
            const formattedEndTime = formatter.format(endTime);
            
            // Get the day of the week
            const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'America/Los_Angeles' });
            const dayOfWeek = dayFormatter.format(startTime);

            // Make it plural form for the day
            const dayOfWeekPlural = dayOfWeek + 's';

            return `${dayOfWeekPlural} ${formattedStartTime} - ${formattedEndTime} PT`;
        } else {
            return "TBD";
        }
    }

    // sets the meeting times for each community
    function setMeetingTimes() {
        const communities = document.querySelectorAll('[id^="meeting-times-"]');

        communities.forEach(element => {
            const communityName = element.id.replace('meeting-times-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            // Map community names to their corresponding projectnames
            let projectName = "";
            if (communityName === "Project/Product Management") {
                projectName = "Product Management";
            } else if (communityName === "Ui/Ux") {
                projectName = "UI/UX";
            } else {
                projectName = communityName;
            }

            element.innerHTML = getMeetingTimes(projectName);
        });
    }

    setMeetingTimes();
});