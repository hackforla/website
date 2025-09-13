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

// Function to handle Slack channel button clicks
    function setupSlackChannelButtons() {
        const slackButtons = document.querySelectorAll('.slack-link');
        
        slackButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                // Prevent the default link behavior temporarily
                event.preventDefault();
                
                // Get the Slack URL from the button's id attribute
                const slackUrl = this.id;
                
                // Get the community name from the title attribute or nearby heading
                const communityCard = this.closest('.page-card');
                const communityName = communityCard ? communityCard.querySelector('.Title4').textContent.trim() : 'Community';
                
                // Save to localStorage
                localStorage.setItem('selectedSlackChannel', slackUrl);
                localStorage.setItem('selectedCommunityName', communityName);
                
                // Now proceed with the original link behavior
                window.location.href = this.href;
            });
        });
    }
    
    // Set up the Slack channel button event listeners
    setupSlackChannelButtons();  

    // Function to get the saved Slack channel URL from localStorage and update the button
    function loadSlackChannelButton() {
        const savedSlackUrl = localStorage.getItem('selectedSlackChannel');
        const savedCommunityName = localStorage.getItem('selectedCommunityName');
        
        const slackButton = document.querySelector('.slack-channel-link');
        
        if (savedSlackUrl && slackButton) {
            // Update the button with the saved Slack URL
            slackButton.href = savedSlackUrl;
            
            // Update the title attribute if we have the community name
            if (savedCommunityName) {
                slackButton.title = `${savedCommunityName} Slack channel`;
            }
            
            // Add click event to clear localStorage after successful redirect
            slackButton.addEventListener('click', function() {
                // Clear the stored values after user clicks to join
                localStorage.removeItem('selectedSlackChannel');
                localStorage.removeItem('selectedCommunityName');
            });
        } else {
            // If no URL was saved, redirect back to communities page or show error
            console.error('No Slack channel URL found in localStorage');
            
            // Option 1: Redirect back to communities page
            // window.location.href = '/communities-of-practice';
            
            // Option 2: Update button to show error state
            if (slackButton) {
                slackButton.href = '/communities-of-practice';
                slackButton.innerHTML = `
                    <svg version="1.1" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                        <path d="..." fill="currentColor"/>
                    </svg>
                    Return to Communities
                `;
                slackButton.title = 'Return to Communities of Practice page';
            }
        }
    }
    
    // Load the Slack channel button when page loads
    loadSlackChannelButton();
});