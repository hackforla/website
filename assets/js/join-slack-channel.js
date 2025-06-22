// This file handles the join-slack-channel.html page functionality

document.addEventListener("DOMContentLoaded", function() {
    
    // Function to get the saved Slack channel URL from localStorage and update the button
    function loadSlackChannelButton() {
        const savedSlackUrl = localStorage.getItem('selectedSlackChannel');
        const savedCommunityName = localStorage.getItem('selectedCommunityName');
        
        const slackButton = document.querySelector('.slack-link');
        
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