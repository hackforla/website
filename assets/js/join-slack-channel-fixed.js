// This file handles the join-slack-channel.html page functionality

document.addEventListener("DOMContentLoaded", function() {
    function loadSlackChannelButton() {
        const savedSlackUrl = localStorage.getItem('selectedSlackChannel');
        const savedCommunityName = localStorage.getItem('selectedCommunityName');
        const slackButton = document.querySelector('.slack-link');

        console.log("Loaded Slack URL:", savedSlackUrl);
        console.log("Loaded Community Name:", savedCommunityName);

        if (savedSlackUrl && slackButton) {
            slackButton.href = savedSlackUrl;

            if (savedCommunityName) {
                slackButton.title = `${savedCommunityName} Slack channel`;
            }

            slackButton.addEventListener('click', function() {
                localStorage.removeItem('selectedSlackChannel');
                localStorage.removeItem('selectedCommunityName');
            });
        } else {
            console.error('No Slack channel URL found in localStorage');

            if (slackButton) {
                slackButton.href = '/communities-of-practice';
                slackButton.innerHTML = `
                    <svg version="1.1" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                        <circle cx="45" cy="45" r="40" fill="currentColor"/>
                    </svg>
                    Return to Communities
                `;
                slackButton.title = 'Return to Communities of Practice page';
            }
        }
    }

    loadSlackChannelButton();
});
