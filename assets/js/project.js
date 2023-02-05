---
---

/* 
  Fetch the correct project
*/
{% assign projects = site.data.external.github-data %}
// Escapes JSON for injections. See: #2134. If this is no longer the case, perform necessary edits, and remove this comment.
let projects = JSON.parse(decodeURIComponent("{{ projects | jsonify | uri_escape }}"));

/*
  Passing script attributes from html script tag to JS file
  https://www.gun.io/blog/pass-arguments-to-embedded-javascript-tutorial-example
*/
const scriptTag = document.getElementById("projectScript");
const projectId = scriptTag.getAttribute("projectId");
// Search for correct project
let project = null;
// Starts at 1 now since the first element is a time stamp
for (let i = 1; i < projects.length; i++){
    let itemId = projects[i].id.toString();
    if(itemId == projectId){
        project = projects[i];
        break;
    }
}

/*
  Assign hero background image
*/
const imageHero = scriptTag.getAttribute("imageHero");
let heroSection = document.getElementsByClassName('project-hero')[0];
if (imageHero){
    heroSection.style.background = `url(${imageHero}) center center no-repeat`;
}
else {
    heroSection.style.background = `url(/assets/images/hero/hacknight-women.jpg) center center no-repeat`;
}

/*
  Add language to language section
*/
let languagesSection = document.getElementById('languages');
if(project != null && project.languages.length > 0){
    let languages = project.languages.join(', ');
    let languagesParagraph = document.createElement('p');
    languagesParagraph.style.display = 'inline';
    let languagesText = document.createTextNode(languages);
    languagesParagraph.appendChild(languagesText);
    languagesSection.appendChild(languagesParagraph);
} else {
    languagesSection.remove();
}

/*
  Construct team card
*/
let contributors = document.getElementById('contributors-list');
// Empty array for valid contributors
let contributorsArray = [];

if(project != null){
    for (let contributor of project.contributorsComplete.data) {
        // Checking for valid data
        if (contributor.github_url && contributor.github_url != "https://github.com/apps/dependabot") {
            // Pushing valid data to contributorsArray
            contributorsArray.push(contributor);
        }
    }

    let projectTeam = document.querySelectorAll('.leader-card')

    if (contributorsArray.length < projectTeam.length) {
        // Hides all-time contributors if number of contributors is less than size of current project team
        let contributorSection = document.getElementById('contributor-header');
        contributorSection.style.display = 'none';
    } else {
        // Creates DOM elements for contributors
        for(let contributor of contributorsArray){
            if (contributorsArray.length >= 1) {
                let contributorDiv = document.createElement('div');
                contributorDiv.classList.add('contributor-div');

                let contributorProfile = document.createElement('a');
                contributorProfile.classList.add('contributor-link');
                contributorProfile.setAttribute('href', contributor.github_url);
                contributorProfile.setAttribute('target', '_blank');
                let contributorUrl = contributor.github_url.split('/');
                let contributorName = contributorUrl.pop();
                contributorProfile.setAttribute('title', contributorName);

                let contributorImg = document.createElement('img');
                contributorImg.style['border-radius'] = '12px';
                contributorImg.setAttribute('src', contributor.avatar_url);

                contributorProfile.appendChild(contributorImg);
                contributorDiv.appendChild(contributorProfile);
                contributors.appendChild(contributorDiv);
            }
        }
    }
} else {
    let messageDiv = document.createElement('div');
    messageDiv.classList.add('empty-content-message');
    let messageText = document.createElement('p');
    messageText.appendChild(document.createTextNode('Looks like this project has not connected a GitHub repository yet!'));
    messageDiv.appendChild(messageText);
    contributors.parentNode.appendChild(messageDiv);
    contributors.parentNode.removeChild(contributors);
}

/*
  Add meeting times to "meetings" section
*/
// const imageHero = 
let meetingsList = document.querySelector('.meeting-times-list');
let meetingsHeader = document.querySelector('.meetingsHeader');
let projectTitle = scriptTag.getAttribute("projectTitle");
let meetingsFound = [];

// Assigns local JSON Data to localData variable
{% assign localData = site.data.external.vrms_data %}
// Escapes JSON for injections. See: #2134. If this is no longer the case, perform necessary edits, and remove this comment.
let localData = JSON.parse(decodeURIComponent("{{ localData | jsonify | uri_escape }}"));

// Function schedules data that is passed in
function schedule(scheduleData) {

    // Loops through data and assigns information to variables in a readable format
    for (const event of scheduleData) {
        try {
            const startTime = timeFormat(new Date(event.startTime));
            const endTime = timeFormat(new Date(event.endTime));
            const webURL = event.project.hflaWebsiteUrl;
            const projectName = event.project.name;
            const description = event.description;
            const day = new Date(event.date).toString().substring(0,3);
            let scheduleClass;
    
            // Function that adds data to proper header
            function scheduleDay() {
                // Assigns different class to data depending if it utilized local JSON file or the VRMS fetch data
                if (scheduleData == localData) {
                    scheduleClass = "localData";
                } else {
                    scheduleClass = "updated";
                }
                if (projectTitle === projectName) {
                    meetingsList.insertAdjacentHTML("beforeend", `<li class="${scheduleClass} meetingTime">${day} ${startTime} - ${endTime} <br>${description}</li>`);
                    meetingsFound.push(day);
                }
            }
            scheduleDay(day);
        } catch (e) {
            console.error(e);
        }
    } 
}


// Executes schedule with localData
schedule(localData);


if (meetingsFound.length >= 1) {
    meetingsHeader.insertAdjacentHTML("beforeend", '<strong class="meetings">Meetings</strong>');
    document.querySelector('#userTimeZone').insertAdjacentHTML('afterbegin', timeZoneText());

}

// Formats time to be readable
function timeFormat(time) {
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