---

---
  //assigning the google form questions to variables for readability
  //these variables correspond with a question on the google form
  //these variables can be used as a key to access the data
  const time = "Timestamp"
  const email = "Email Address"
  const name = "Full name"
  const linkedin_url = "Linkedin URL (optional)"
  const linkedin_permission = "Could we use your Linkedin profile picture next to your story?"
  const github_url = "Github URL (optional)"
  const github_permission = "Could we use your Github profile picture next to your story?"
  const team = "Select the team(s) you're on"
  const role = "Select your role(s) on the team"
  const specific_role = "What is/was your specific role? (optional)"
  const join_date = "When did you join Hack for LA? (optional)"
  const win = "What do you want to celebrate (select all that apply)?"
  const overview = "Give us a brief overview"
  const display = "Display?"

  const otherIcon = `star.svg`
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
	}

  function main() {
    {% assign localData = site.data.external._wins-data %}
    // Escapes JSON for injections. See: #2134. If this is no longer the case, perform necessary edits, and remove this comment
    const cardData = JSON.parse(decodeURIComponent("{{ localData | jsonify | uri_escape }}"));
    window.localStorage.setItem('data', JSON.stringify(cardData));
    makeCards(cardData);
    ifPageEmpty();
  }


  //Create The "Role" and "Team" Filters From The Displayed Cards On Page Load
  document.addEventListener("DOMContentLoaded", createFilter);

  document.addEventListener('click', event => {
	// if the .see-more-div element is clicked
	if (event.target.closest('.see-more-div')) {
	  // open the seeMore with the id of the selected target 
	  seeMore(event.target.id)
	}
	if (event.target.matches('.overlay') || event.target.closest('.overlay-close-icon') || event.target.closest('.top-buffer') || event.target.closest('.bottom-buffer')) {
	  hideOverlay();
	}
	// else, do nothing
	return false;
  }, false);
  
  document.addEventListener('keydown', function(event) {
	// if its the enter key and the .see-more-div element is currently tabbed on
	if (event.key === "Enter" && document.activeElement.classList.contains('see-more-div')) {
	  // run seeMore with the active tab element id
	  seeMore(document.activeElement.id);
	}
	// else, do nothing
	return false;
  }, false);
  
  function createFilter(){

  	const roleArr = [];
  	const teamArr = [];
  	const responses = document.querySelector("#responses");
  	responses.querySelectorAll('.wins-card-team:not([style*="display:none"]):not([style*="display: none"]').forEach(item =>{
  		let value = item.textContent.replace("Team(s):","").trim();
  		let team = value.split(",").map(x=>x.trim());

  		Array.isArray(team) ? teamArr.push(...team)  :  teamArr.push(team);

  	})
	//Assign Role for each Wins-Card  
  	responses.querySelectorAll('.wins-card-role:not([style*="display:none"]):not([style*="display: none"]').forEach(item =>{
  		let value = item.textContent.replace("Role(s):","").trim();
  		let role = value.split(",").map(x=>x.trim());
  		Array.isArray(role) ? roleArr.push(...role)  :  roleArr.push(role);
  	})


  	//Create dropdown key,values where the keys are name of the drops downs and the values are the number of occurences of each key
  	const roleHash =  Object.fromEntries([ ...roleArr.reduce((map, key) => map.set(key, (map.get(key) || 0) + 1), new Map()) ]);
  	const teamHash =  Object.fromEntries([ ...teamArr.reduce((map, key) => map.set(key, (map.get(key) || 0) + 1), new Map()) ]);


	const filterTemplate = document.getElementById("wins-filter-template-repeat");
  	const roleDropwDown =  document.getElementById("role-dropdown");
  	const teamDropDown = document.getElementById("team-dropdown");


  	for(const [key,value] of Object.entries(roleHash) ){
  		let cloneFilterTemplate = filterTemplate.content.firstElementChild.cloneNode(true);
  		cloneFilterTemplate.querySelector("input").value = `role_${key}`;
			cloneFilterTemplate.querySelector("input").id = `role_${key.replace(/\s+/g, '')}`;
			cloneFilterTemplate.querySelector("input").name = `role_${key.replace(/\s+/g, '')}`;
  		cloneFilterTemplate.querySelector("input").addEventListener("click",checkboxClickHandler);
			cloneFilterTemplate.querySelector("label").textContent = `${key}`;
  		cloneFilterTemplate.querySelector("label").htmlFor =`role_${key.replace(/\s+/g, '')}`;
  		roleDropwDown.append(cloneFilterTemplate);

  	}
  	for(const [key,value] of Object.entries(teamHash) ){
  		let cloneFilterTemplate = filterTemplate.content.firstElementChild.cloneNode(true);
  		cloneFilterTemplate.querySelector("input").value = `team_${key}`;
			cloneFilterTemplate.querySelector("input").id = `team_${key.replace(/\s+/g, '')}`;
			cloneFilterTemplate.querySelector("input").name = `team_${key.replace(/\s+/g, '')}`;
  		cloneFilterTemplate.querySelector("input").addEventListener("click",checkboxClickHandler);
			cloneFilterTemplate.querySelector("label").textContent = `${key}`;
  		cloneFilterTemplate.querySelector("label").htmlFor =`team_${key.replace(/\s+/g, '')}`;
  		teamDropDown.append(cloneFilterTemplate);

  	}

  }

  //Update History State / URL on checkbox click
  function checkboxClickHandler(event){

  	let incomingFilterData = document.querySelectorAll("input");
  	let queryObj = { };

  	//Calculate and Create Updated Query String
  	incomingFilterData.forEach(e => {
  		//Find boxes that are checked
  		if(e.checked){
  			let data = e.value.split("_");

  			if(data[0] == 'role'){

  				if(data[0] in queryObj){
  					queryObj[data[0]].push(data[1].trim());
  				}
  				else{
  					queryObj[data[0]] = [];
  					queryObj[data[0]].push(data[1].trim());
  				}

  			}
  			if(data[0]=='team'){
  				if(data[0] in queryObj){
  					queryObj[data[0]].push(data[1].trim());
  				}
  				else{
  					queryObj[data[0]] = [];
  					queryObj[data[0]].push(data[1].trim());
  				}

  			}
  		}
  	})
  	let questionSymbol = '?';
  	let queryString = Object.keys(queryObj).map(key => key + '=' + queryObj[key]).join('&').replaceAll(" ","+");
  	let urlParameter = `${questionSymbol}${queryString}`;

  	//Update URL parameters
  	window.history.replaceState(null, '', urlParameter.replaceAll(" ","+"));
  }

  //Update UI on URL history change and on DomContent loaded
  window.addEventListener('DOMContentLoaded',updateUI)
  window.addEventListener('locationchange',updateUI)
  function updateUI(){
  	const filterParams = Object.fromEntries(new URLSearchParams(window.location.search));
  	const winsCards = document.querySelectorAll("#responses > .wins-card");
  	const checkboxes = document.querySelectorAll("input");

  	//If there are no entries in URL display all Cards
  	if(Object.keys(filterParams).length === 0){
  		winsCards.forEach(card=>{card.style.display='flex';})
  		return;
  	}

  	//Ensure that checkboxes are marked according to the url query
  	checkboxes.forEach(checkbox =>{
  		let checkboxData = checkbox.value;
  		let checkboxType  = checkboxData.split("_")[0];
  		let checkboxValue = checkboxData.split('_')[1];
  		if(checkboxType in filterParams){
  			let args = filterParams[checkboxType].split(',');
  			args.includes(checkboxValue) ? checkbox.checked = true : checkbox.checked = false;
  	}
  	})


  	//Card Display/Hide Logic
  	winsCards.forEach(card=>{
  		let teamsInCard = (card.querySelector('.wins-card-team').textContent.replace("Team(s):","")).trim();
  			teamsInCard = teamsInCard.split(",").map(x=>x.trim());
  		let rolesInCard = (card.querySelector('.wins-card-role').textContent.replace("Role(s):","")).trim();
  			rolesInCard = rolesInCard.split(",").map(x=>x.trim());
  		let cardUnion = [...rolesInCard,...teamsInCard];


  		if(('role' in filterParams) && ('team' in filterParams)){
  			let roleInURL = filterParams.role.split(',');
  			let teamInURL = filterParams.team.split(',');
  			let roleIntersection = rolesInCard.filter(x => roleInURL.includes(x));
  			let teamIntersection = teamsInCard.filter(x => teamInURL.includes(x));
  			((roleIntersection.length == 0)  || (teamIntersection.length == 0)) ? card.style.display='none' : card.style.display='flex'
  		}
  		else if('role' in filterParams){
  			let roleInURL = filterParams.role.split(',');
  			let roleIntersection = rolesInCard.filter(x => roleInURL.includes(x));
  			roleIntersection.length == 0 ? card.style.display='none' : card.style.display='flex';
  		}
  		else if('team' in filterParams){
  			let teamInURL = filterParams.team.split(',');
  			let teamIntersection = teamsInCard.filter(x => teamInURL.includes(x));
  			teamIntersection.length == 0 ? card.style.display='none' : card.style.display='flex';

  		}

  	})

  }

  function ifPageEmpty() {
  	if (document.querySelectorAll('.wins-card').length == 0) {
  		const page = document.querySelector('.wins-page-contain');
  		const p = document.createElement('p');
  		page.appendChild(p);
  		p.innerHTML = "No one has shared a win yet...be the first!";
  	}
  }

 
	function insertIcons(cardSelector, cardString, viewType, cloneCardTemplate = document) {
		let initialCardList = cardString.split(',').map(item => item.trim())
		let otherWinsText = [];
		let cardList = [];
		const view = viewType;

		initialCardList.forEach(win => {
			if (win.length > 0 && Object.keys(badgeIcons).indexOf(win) > -1){
				cardList.push(win);
			} else if (win.length > 0 && Object.keys(badgeIcons).indexOf(win) === -1) {
				otherWinsText.push(win);
			}
		});
		cardList.push(otherWinsText.join(", "));

		const SVG_FILE_PATH = `/assets/images/wins-page/wins-badges/`

		const iconContainer = cloneCardTemplate.querySelector(cardSelector);

		cardList.forEach(item => {
			if (badgeIcons.hasOwnProperty(item)) {
				iconContainer.insertAdjacentHTML('beforeend',
					`<div class='${view}-item-container'>
						<img class="${view}-badge-icon" alt="${badgeIcons[item]}" src="${SVG_FILE_PATH}${badgeIcons[item]}">
						<div class="${view}-text-bubble" data-wins="font-styling">${item}</div>
					</div>`
				)
			} else if (item !== '') {
				iconContainer.insertAdjacentHTML('beforeend',
					`<div class='${view}-item-container'>
						<img class="${view}-badge-icon" alt="${badgeIcons[otherIcon]}" src="${SVG_FILE_PATH}${otherIcon}">
						<div class="${view}-text-bubble" data-wins="font-styling">${item}</div>
					</div>`
				)
			}
		})
		return iconContainer
	}

  function makeCards(data) {
	{% assign githubData = site.data.external.github-data %}
	// Escapes JSON for injections. See: #2134. If this is no longer the case, perform necessary edits, and remove this comment.
  	let githubData = JSON.parse(decodeURIComponent("{{ githubData | jsonify | uri_escape }}"));

	const cards = data.reverse();
	const cardTemplate = document.getElementById("wins-card-template");
	const QUOTE_ICON_PATH = '/assets/images/wins-page/quote-icon.svg'
	const AVATAR_DEFAULT_PATH = "/assets/images/wins-page/avatar-default.svg"
	const GITHUB_ICON = '/assets/images/wins-page/icon-github-small.svg';
	const LINKEDIN_ICON = '/assets/images/wins-page/icon-linkedin-small.svg'
	const winsCardContainer  = document.querySelector('#responses');

	cards.forEach((card, index) => {
		// if (card[display] != true) return;
		let cloneCardTemplate = cardTemplate.content.firstElementChild.cloneNode(true);
		let ghId;
		if(card[github_url] && card[github_permission] === "Yes"){
			githubData.slice(1).map(item=>{
				item.contributorsComplete.data.map(contributors=>{
					if(contributors.github_url == card[github_url]){
						ghId = contributors.id;
					}
				})

			})
		} 
		let profileImgSrc = ghId ?
			`https://avatars1.githubusercontent.com/u/${ghId}?v=4` :
			AVATAR_DEFAULT_PATH;
		
		cloneCardTemplate.querySelector('.wins-card-profile-img').src = profileImgSrc;
		cloneCardTemplate.querySelector('.wins-card-profile-img').id = `ghImg-${index}`;

		cloneCardTemplate.querySelector('.wins-card-big-quote').src = QUOTE_ICON_PATH;
		cloneCardTemplate.querySelector('.wins-card-name').textContent = card[name];
	
		if (card[linkedin_url].length > 0) {
			cloneCardTemplate.querySelector('.wins-card-linkedin-icon').href = card[linkedin_url];
			cloneCardTemplate.querySelector('.linkedin-icon').src = LINKEDIN_ICON ;
		} else {
			cloneCardTemplate.querySelector('.wins-card-linkedin-icon').setAttribute('hidden', 'true')
		};

		if (card[github_url].length > 0){
			cloneCardTemplate.querySelector('.wins-card-github-icon').href = card[github_url];
			cloneCardTemplate.querySelector('.github-icon').src = GITHUB_ICON ;
		} else {
			cloneCardTemplate.querySelector('.wins-card-github-icon').setAttribute('hidden', 'true')
		}

		cloneCardTemplate.querySelector('.project-inner.wins-card-team').innerHTML = `<span class="wins-team-role-color">Team(s): </span> ${card[team]}`;
		cloneCardTemplate.querySelector('.project-inner.wins-card-role').innerHTML = `<span class="wins-team-role-color">Role(s): </span> ${card[role]}`;

		cloneCardTemplate.querySelector('.wins-card-overview').textContent = card[overview];
		cloneCardTemplate.querySelector('.wins-icon-container').setAttribute('data-index', index)
		const iconContainer = insertIcons('.wins-icon-container', card[win], 'wins', cloneCardTemplate)
		iconContainer.id = `icons-${index}`
		cloneCardTemplate.querySelector('span.see-more-div').id = index;

		winsCardContainer.append(cloneCardTemplate);

		const winTextContainer = cloneCardTemplate.querySelector('.wins-card-text')
		function addSeeMore() {
			const winText = winTextContainer.querySelector('.wins-card-overview')
			const seeMoreDiv = winTextContainer.querySelector('.wins-see-more-div')
			if (window.innerWidth > 960){
				const winsCardTextContainer = seeMoreDiv.parentElement
				if (winsCardTextContainer.classList.contains("expanded")){
					toggleSeeMoreLess(seeMoreDiv.children[0].id)
				}
			}
		}
		addSeeMore()

		new ResizeObserver(addSeeMore).observe(winTextContainer)
	})
}

function seeMore(id){
  	let screenWidth = window.innerWidth;
  	if (screenWidth > 960){
  		updateOverlay(id);
  	}else{
		toggleSeeMoreLess(id);
  	}
}

  //Adds event listener to badge icons when viewers interface is below desktop size
  //Click to toggle "see more" and "see less" to expand and collapse wins text
  document.addEventListener("DOMContentLoaded", winsBelowDesktop);

  function winsBelowDesktop() {
		document.querySelectorAll('.wins-badge-icon').forEach(img => img.addEventListener('click', function (event) {
			const container = event.target.parentElement.parentElement;
			const id = container.dataset.index;
			let span = document.getElementById(id);
			let parent = span.parentElement.parentElement;
			if (!parent.classList.contains('expanded'))
				toggleSeeMoreLess(id);
		}))
	}

  // Toggles between see more and see less in tablet and mobile view
  function toggleSeeMoreLess(id) {
	let span = document.getElementById(id);
	let screenWidth = window.innerWidth;
	let parent = span.parentElement.parentElement;
	let winsIconContainer = document.getElementById(`icons-${id}`)
	if (parent.classList.contains('expanded') && screenWidth > 960) {
		parent.setAttribute('class', 'project-inner wins-card-text');
		winsIconContainer.setAttribute('class', 'wins-icon-container');
	} else if(parent.classList.contains('expanded') && screenWidth < 960) {
		parent.setAttribute('class', 'project-inner wins-card-text');
		span.setAttribute('class', 'see-more-div');
		winsIconContainer.setAttribute('class', 'wins-icon-container');
	} else {
		parent.setAttribute('class','project-inner wins-card-text expanded');
		span.setAttribute('class', 'see-more-div show-less-btn');
		winsIconContainer.setAttribute('class', 'wins-tablet wins-icon-container');
  		span.parentElement.removeAttribute('hidden');
	}
}

function changeSeeMoreBtn(x) {
	const span = document.querySelectorAll(".see-more-div");
	if (x.matches) { 
		for(let i = 0; i < span.length; i++) {
			span[i].innerHTML = ''
		}
	} else {
		for(let i = 0; i < span.length; i++) {
			// removes show-less-btn class
			span[i].setAttribute('class', 'see-more-div');	
			span[i].innerHTML = "See More";
		}
	}
  }
  
  const x = window.matchMedia("(max-width: 960px)");
  x.addListener(changeSeeMoreBtn);

  // need to delete makeElement and makeIcon
  function makeElement(elementType, parent, className) {
		let child = document.createElement(elementType);
		child.classList.add(className);
		parent.appendChild(child);
		return child;
	}
  function makeIcon(href, parent, className, src) {
		let icon = makeElement('a', parent, 'wins-card-icon');
		icon.setAttribute("href", href);
		icon.setAttribute("target", "_blank");
		let iconImg = makeElement('img', icon, className);
		iconImg.setAttribute("src", src);
	}

  function updateOverlay(i) {

	window.addEventListener('keydown', (e) => {
		  if (e.key == 'Escape') {
			  hideOverlay(e.key)
		  }
	  });

	  document.querySelector(".main-header").inert = true;
	  document.querySelector(".content-section.projects").inert = true;
	  document.querySelector(".main-footer").inert = true;
	  document.querySelector(".home-getting-started-container.content-section.section-hack-nights.wins-hero").inert = true;
	  document.querySelector(".sr-only-focusable").inert = true;

	  window.addEventListener('resize', (e) => {
		 let widthOutput = window.innerWidth;
		  if (widthOutput < 960) {
			  hideOverlay(e)
		  }
	  });

  		let stringData = window.localStorage.getItem("data");
		  let data = JSON.parse(stringData).reverse();

		const overlayProfileImg = document.querySelector('#overlay-profile-img');
		overlayProfileImg.src = document.querySelector(`#ghImg-${i}`).src;

  		const overlayIcons = document.querySelector('#overlay-icons');
  		overlayIcons.innerHTML = "";

  		if (data[i][linkedin_url].length > 0) {
  			makeIcon(data[i][linkedin_url], overlayIcons, 'linkedin-icon', '/assets/images/wins-page/icon-linkedin-small.svg');
  		} if (data[i][github_url].length > 0) {
  			makeIcon(data[i][github_url], overlayIcons, 'github-icon', '/assets/images/wins-page/icon-github-small.svg');
  		}

  		const overlayName = document.querySelector('#overlay-name');
		overlayName.innerHTML = data[i][name];

  		const overlayTeams = document.querySelector('#overlay-teams');
  		overlayTeams.innerHTML = `Team(s): ${data[i][team]}`;

  		const overlayRoles = document.querySelector('#overlay-roles');
  		overlayRoles.innerHTML = `Role(s): ${data[i][role]}`;

  		const overlayOverview = document.querySelector('#overlay-overview');
  		overlayOverview.innerHTML = data[i][overview];

		insertIcons('#overlay-info', data[i][win], 'overlay')

  		const overlayProjectCard = document.querySelector('#overlay-project-card');
  		overlayProjectCard.parentNode.classList.add("display-initial");
  	}


	function hideOverlay(e) {
		e = e || window.event || e.key == 'Escape';

		const overlayProjectCard = document.querySelector('#overlay-project-card');
		overlayProjectCard.parentNode.classList.remove("display-initial");

		document.querySelector(".main-header").inert = false;
		document.querySelector(".content-section.projects").inert = false;
		document.querySelector(".main-footer").inert = false;
		document.querySelector(".home-getting-started-container.content-section.section-hack-nights.wins-hero").inert = false;
		document.querySelector(".sr-only-focusable").inert = false;

	  const overlayInfo = document.querySelector('#overlay-info');

	  overlayInfo.innerHTML = '';
  }


  main();
  changeSeeMoreBtn(x);

