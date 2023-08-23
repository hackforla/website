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
const project = findProjectById(projectId);

function findProjectById(identification){
    // Starts at 1 now since the first element is a time stamp
    for (let i = 1; i < projects.length; i++){
        let itemId = projects[i].id.toString();
        if(itemId == identification){
            return projects[i]
        }
    }
} 

// Merge the language sections if there's a second repo
if (scriptTag.getAttribute("secRepoId")){
    const secRepoId = scriptTag.getAttribute("secRepoId");    
    const firstLangs = project.languages;
    const secLangs = findProjectById(secRepoId).languages;

    let languagesArr = [...firstLangs, ...secLangs];
    let set = new Set(languagesArr);
    project.languages = Array.from(set);
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

// Grab the meeting time data from the vrms_data.json file
{% assign vrmsData = site.data.external.vrms_data %}
// Escapes JSON for injections. See: #2134. If this is no longer the case, perform necessary edits, and remove this comment.
const vrmsData = JSON.parse(decodeURIComponent("{{ vrmsData | jsonify | uri_escape }}"));

// Helper function to sort VRMS data by day of the week from "date" key and meeting time from "startTime" key
function sortByDate(scheduleData) {
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
}

// Loops through the VRMS data and inserts each meeting time into the HTML of the correct project page
function appendMeetingTimes(scheduleData) {
    
    sortByDate(scheduleData);

    for (const event of scheduleData) {
        try {
            const startTime = timeFormat(new Date(event.startTime));
            const endTime = timeFormat(new Date(event.endTime));
            const projectName = event.project.name;
            const name = event.name;
            const day = new Date(event.date).toString().substring(0,3);
            // only append the meeting times to the correct project page
            if (projectTitle.toLowerCase() === projectName.toLowerCase()) {
                meetingsList.insertAdjacentHTML("beforeend", `<li class="meetingTime">${day} ${startTime} - ${endTime} <br>${name}</li>`);
                meetingsFound.push(day);
            }

        } catch (e) {
            console.error(e);
        }
    } 
}

appendMeetingTimes(vrmsData);


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