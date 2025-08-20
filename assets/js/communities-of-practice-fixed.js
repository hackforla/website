---
---

{% assign vrmsData = site.data.external.vrms_data %}
const vrmsData = JSON.parse(decodeURIComponent("{{ vrmsData | jsonify | uri_escape }}"));

document.addEventListener("DOMContentLoaded", function() {
    function getMeetingTimes(projectName) {
        const project = vrmsData.find(event => 
            event.project && event.project.name.startsWith("Community of Practice") && event.project.name.includes(projectName)
        );

        if (project) {
            const options = { timeZone: "America/Los_Angeles", hour: 'numeric', minute: 'numeric', hour12: true };
            const startTime = new Date(project.startTime);
            const endTime = new Date(project.endTime);
            const formatter = new Intl.DateTimeFormat('en-US', options);
            const formattedStartTime = formatter.format(startTime);
            const formattedEndTime = formatter.format(endTime);
            const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'America/Los_Angeles' });
            const dayOfWeek = dayFormatter.format(startTime);
            const dayOfWeekPlural = dayOfWeek + 's';
            return `${dayOfWeekPlural} ${formattedStartTime} - ${formattedEndTime} PT`;
        } else {
            return "TBD";
        }
    }

    function setMeetingTimes() {
        const communities = document.querySelectorAll('[id^="meeting-times-"]');
        communities.forEach(element => {
            const communityName = element.id.replace('meeting-times-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            let projectName = communityName;
            if (communityName === "Project/Product Management") projectName = "Product Management";
            else if (communityName === "Ui/Ux") projectName = "UI/UX";
            element.innerHTML = getMeetingTimes(projectName);
        });
    }

    setMeetingTimes();

    function setupSlackChannelButtons() {
        const slackButtons = document.querySelectorAll('.slack-link');

        slackButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();

                const slackUrl = this.id;
                const communityName = this.dataset.community || 'Community';

                console.log("Saving Slack URL:", slackUrl);
                console.log("Saving Community Name:", communityName);

                localStorage.setItem('selectedSlackChannel', slackUrl);
                localStorage.setItem('selectedCommunityName', communityName);

                window.location.href = this.href;
            });
        });
    }

    setupSlackChannelButtons();
});
