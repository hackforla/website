---

---
const time = "Timestamp";
const email = "Email Address";
const name = "Full name";
const linkedin_url = "Linkedin URL (optional)";
const linkedin_permission = "Could we use your Linkedin profile picture next to your story?";
const github_url = "Github URL (optional)";
const github_permission = "Could we use your Github profile picture next to your story?";
const team = "Select the team(s) you're on";
const role = "Select your role(s) on the team";
const specific_role = "What is/was your specific role? (optional)";
const join_date = "When did you join Hack for LA? (optional)";
const win = "What do you want to celebrate (select all that apply)?";
const overview = "Give us a brief overview";
const display = "Display?";
const homepage = "Homepage?";

const otherIcon = `star.svg`;

const badgeIcons = {
    "I got a new job": `briefcase.svg`,
    "I produced something for my portfolio": `file.svg`,
    "I improved my LinkedIn": `linkedin.svg`,
    "I learned how to work better on a team": `team.svg`,
    "I increased the number of commits on my Github profile": `github.svg`,
    "I learned a new language": `code.svg`,
    "I set up 2FA": `twofa.svg`,
    "I became part of a a caring community": `$community.svg`,
    "I worked on an enterprise project": `enterprise.svg`,
    "I worked on a project that will help the people of Los Angeles": `giving.svg`,
    "I worked on two or more projects": `hammers.svg`,
    "I taught or mentored a person on my team": `mentor.svg`,
    "I taught or mentored a person on another team": `mentor-external.svg`,
    "My team delivered software to a stakeholder": `deliverable.svg`,
    "My team launched our MVP": `launch.svg`,
};

let randomWin;

function initWinCard() {
    {% assign winsData = site.data.external._wins-data %}
    
    let winsData = JSON.parse(decodeURIComponent("{{ winsData | jsonify | uri_escape }}"));

    let homePageWins = [];

    winsData.forEach(win => {
        win[homepage] ? homePageWins.push(win) : null;
    });

    randomWin = homePageWins[Math.floor(Math.random()*homePageWins.length)];

    makeWinCard(randomWin);
}

function makeWinCard(data) {
    {% assign githubData = site.data.external.github-data %}
    // Escapes JSON for injections. See: #2134. If this is no longer the case, perform necessary edits, and remove this comment.
    let githubData = JSON.parse(decodeURIComponent("{{ githubData | jsonify | uri_escape }}"));

    const AVATAR_DEFAULT_PATH = "/assets/images/wins-page/avatar-default.svg";
    const GITHUB_ICON = "/assets/images/wins-page/icon-github-small.svg";
    const LINKEDIN_ICON = "/assets/images/wins-page/icon-linkedin-small.svg";
    const homepageWinsCard = document.querySelector(".wins-card--homepage");

    let githubId;

    // If github link is provided, and permission is given: search through projects contributors to find users github id
    if (data[github_url] && data[github_permission] === "Yes") {
        githubData.slice(1).map(item => {
            item.contributorsComplete.data.map(contributors => {
                if (contributors.github_url == data[github_url]) {
                    githubId = contributors.id;
                }		
            })
        })
    }

    let profileImgSrc = githubId ? `https://avatars1.githubusercontent.com/u/${githubId}?v=4` : AVATAR_DEFAULT_PATH;

    homepageWinsCard.querySelector(".wins-card-profile-img").src = profileImgSrc;

    homepageWinsCard.querySelector(".wins-card-name").textContent = data[name];

    if (data[linkedin_url].length) {
        homepageWinsCard.querySelector(".wins-card-linkedin-icon").href = data[linkedin_url];
        homepageWinsCard.querySelector(".linkedin-icon").src = LINKEDIN_ICON;
    } else {
        homepageWinsCard.querySelector(".wins-card-linkedin-icon").setAttribute("hidden", "true");
    }

    if (data[github_url].length) {
        homepageWinsCard.querySelector(".wins-card-github-icon").href = data[github_url];
        homepageWinsCard.querySelector(".github-icon").src = GITHUB_ICON;
    } else {
        homepageWinsCard.querySelector(".wins-card-github-icon").setAttribute("hidden", "true");
    }

    homepageWinsCard.querySelector(".project-inner.wins-card-team").innerHTML = `<span class="wins-team-role-color">Teams(s): </span> ${data[team]}`;
    homepageWinsCard.querySelector(".project-inner.wins-card-role").innerHTML = `<span class="wins-role-role-color">Roles(s): </span> ${data[role]}`;

    homepageWinsCard.querySelector(".wins-card-overview").textContent = data[overview];

    // Load icons and their badges
    insertIcons('.wins-icon-container', data[win], 'wins', homepageWinsCard);

    const winTextContainer = homepageWinsCard.querySelector(".wins-card-text");

    function addSeeMore() {
        const winText = homepageWinsCard.querySelector(".wins-card-overview");
        const seeMoreDiv = homepageWinsCard.querySelector(".wins-see-more-div");

        // Shows or hides "see more" span based of height of overview text
        if (!winTextContainer.classList.contains("expanded") && winText.offsetHeight <= winTextContainer.offsetHeight) {
            seeMoreDiv.setAttribute("hidden", "true");
        } else {
            seeMoreDiv.removeAttribute("hidden");
        };

        if (!winTextContainer.classList.contains("expanded")) winTextContainer.classList.add("relative");
        if (window.innerWidth > 960) {
            if (seeMoreDiv.parentElement.classList.contains("expanded")) mobileSeeMore(seeMoreDiv.children[0])
        }
    }

    addSeeMore();

    new ResizeObserver(addSeeMore).observe(winTextContainer);
}


function insertIcons(containerClass, winString, viewType, homepageWinsCard = document) {
    // Splits win list into array of wins
    let initialWinList = winString.split(',').map(win => win.trim());

    let winList = [];
    const view = viewType;

    // Iterate through user chosen wins an user written wins
    // Add custom wins (no icon association) to the end of the array, premade wins (icon association) to the beginning
    initialWinList.reverse().forEach(win => {
        if (win.length && Object.keys(badgeIcons).indexOf(win) > -1) {
            winList.unshift(win);
        } else if (win.length > 0 && Object.keys(badgeIcons).indexOf(win) === -1) {
            winList.push(win);
        }
    });

    const SVG_FILE_PATH = `/assets/images/wins-page/wins-badges/`;

    const iconContainer = homepageWinsCard.querySelector(containerClass);

    winList.forEach(win => {
        if (badgeIcons.hasOwnProperty(win)) {
            // Inserts html inside the element, after its last child
            iconContainer.insertAdjacentHTML('beforeend',
                `<div class="${view}-item-container">
                    <img class="${view}-badge-icon" alt="${badgeIcons[win]}" src="${SVG_FILE_PATH}${badgeIcons[win]}">
                    <div class="${view}-text-bubble" data-wins="font-styling">${win}</div>
                </div>`
            );
        } else {
            iconContainer.insertAdjacentHTML('beforeend',
                `<div class="${view}-item-container">
                    <img class="${view}-badge-icon" alt="${badgeIcons[otherIcon]}" src="${SVG_FILE_PATH}${otherIcon}">
                    <div class="${view}-text-bubble" data-wins="font-styling">${win}</div>
                </div>`
            );
        };
    });
}

function seeMore(id) {
    if (window.innerWidth > 960) {
        updateOverlay(randomWin);
    } else {
        mobileSeeMore(id);
    }
}

function mobileSeeMore(id) {
    let span = document.getElementById(id);
    let parent = span.parentElement.parentElement;
    parent.classList.toggle("expanded");
    let winsIconContainer = document.getElementById(`icons-${id}`);
    if (parent.classList.contains("expanded")) {        
        span.innerHTML = '<img src="/assets/images/wins-page/caret.svg" alt="caret">&nbsp; see less';
        parent.setAttribute("class","project-inner wins-card-text expanded");
        winsIconContainer.setAttribute("class", "wins-tablet wins-icon-container");
        span.parentElement.removeAttribute("hidden");
    } else {
        span.innerHTML = "...see more";
        parent.setAttribute("class", "project-inner wins-card-text relative");
        winsIconContainer.setAttribute("class", "wins-icon-container");
    };
}

function updateOverlay(data) {
    window.addEventListener("keydown", event => {
        if (event.key == "Escape") {
            hideOverlay(event.key)
        };
    });

    document.addEventListener("click", event => {
        if (event.target.matches(".overlay") || event.target.closest(".overlay-close-icon") || event.target.closest(".top-buffer") || event.target.closest(".bottom-buffer")) {
            hideOverlay();
        };
    });

    document.querySelector(".main-header").inert = true;
    document.querySelector(".main-footer").inert = true;
    document.querySelector(".sr-only-focusable").inert = true;

    window.addEventListener("resize", event => {
    let widthOutput = window.innerWidth;
        if (widthOutput < 960) {
            hideOverlay(event)
        };
    });

    const overlayProfileImg = document.querySelector("#overlay-profile-img");
    overlayProfileImg.src = document.querySelector(".wins-card-profile-img").src;

    const overlayIcons = document.querySelector("#overlay-icons");
    overlayIcons.innerHTML = "";

    if (data[linkedin_url].length > 0) {
        makeIcon(data[linkedin_url], overlayIcons, "linkedin-icon", "/assets/images/wins-page/icon-linkedin-small.svg");
    } if (data[github_url].length > 0) {
        makeIcon(data[github_url], overlayIcons, "github-icon", "/assets/images/wins-page/icon-github-small.svg");
    }

    const overlayName = document.querySelector("#overlay-name");
    overlayName.innerHTML = data[name];

    const overlayTeams = document.querySelector("#overlay-teams");
    overlayTeams.innerHTML = `Team(s): ${data[team]}`;

    const overlayRoles = document.querySelector("#overlay-roles");
    overlayRoles.innerHTML = `Role(s): ${data[role]}`;

    const overlayOverview = document.querySelector("#overlay-overview");
    overlayOverview.innerHTML = data[overview];

    insertIcons("#overlay-info", data[win], "overlay")

    const overlayProjectCard = document.querySelector("#overlay-project-card");
    overlayProjectCard.parentNode.classList.add("display-initial");
}

function makeElement(elementType, parent, className) {
    let child = document.createElement(elementType);
    child.classList.add(className);
    parent.appendChild(child);
    return child;
}

function makeIcon(href, parent, className, src) {
    let icon = makeElement("a", parent, "wins-card-icon");
    icon.setAttribute("href", href);
    let iconImg = makeElement("img", icon, className);
    iconImg.setAttribute("src", src);
}

function hideOverlay(e) {
    e = e || window.event || e.key == "Escape";

    const overlayProjectCard = document.querySelector("#overlay-project-card");
    overlayProjectCard.parentNode.classList.remove("display-initial");

    document.querySelector(".main-header").inert = false;
    document.querySelector(".main-footer").inert = false;
    document.querySelector(".sr-only-focusable").inert = false;

    const overlayInfo = document.querySelector("#overlay-info");

    overlayInfo.innerHTML = "";
}

initWinCard();