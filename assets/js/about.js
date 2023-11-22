---

---

// Constant setups for reuse throughout document
const ANCHOR_LINKS_ID = [...document.querySelectorAll(".anchor")].map((anchor) => anchor.id);
const NAVIGATION_LINK_ELEMENTS = document.querySelectorAll(".sticky-nav a");
const VIEWPORT_HEIGHT = Math.max(document.documentElement.clientHeight || 0,  window.innerHeight || 0);
const STICKYNAVTOP = 343;
const BREAK_POINT = 960;
const FLAGS = {
    'displayChanged': true,
    'listenerNotAttached': true
}

document.addEventListener("DOMContentLoaded", function () {
  
  const accomplishments=retrieveAccomplishmentsData();
  const accByProgramArea=sortAccomplishmentsByProgramArea(accomplishments);
  displayAccomplishments(accByProgramArea);

  // UI components are updated on page load
  updateUI();

  loadAccomplishmentYears();
  
  // UI components are updated on location change
  window.addEventListener("locationchange", updateUI);

  window.addEventListener("resize", resizeHandler);

  document.addEventListener("wheel", scrollHandler);

  document.querySelectorAll("#sticky-nav li a").forEach((navlink) => { navlink.addEventListener("click", toggleNavClass); });
  
  document.querySelector("#accomplishments-year-dropdown").addEventListener("change", function(event) {yearEventHandler(accByProgramArea,event)});
  document.querySelectorAll("#accomplishments-year-list li").forEach((item)=>{item.addEventListener("click", function(event) {yearEventHandler(accByProgramArea,event)})});
});

/**
 * Functions that are called on every page resize event
 */
function resizeHandler() {
  setupAccordionEventLitseners();
  setScrollPosition();
  changeDisplayMode();
}

/**
 * Functions that are called on every wheel scroll event
 */
function scrollHandler() {
  stickItHere();
  highlightNavOnScroll();
}

function updateUI() {
  if (window.location.hash) {
    //Remove current highlighted nav link
    document.querySelector(".sticky-nav a.is-active").classList.toggle("is-active");
    //Apply new highlted nav link based on location hash
    document.querySelector(`[href*="${window.location.hash.split("#")[1]}"]`).classList.toggle("is-active");
  }
  setupAccordionEventLitseners();
  changeDisplayMode();
  stickItHere();  
}

function changeDisplayMode() {
  if (window.innerWidth < BREAK_POINT && FLAGS.displayChanged) {
    document.querySelectorAll(".page-card--about:nth-child(n+3)").forEach((pageCard) => {pageCard.lastElementChild.style.display = "none"; });   
    document.querySelector(`div[data-hash="${window.location.hash.split("#")[1]}"]`).parentElement.lastElementChild.style.display = "block";
    document.querySelector(`div[data-hash="${window.location.hash.split("#")[1]}"]`).parentElement.children[0].classList.toggle("au_active")
    FLAGS.displayChanged = false;
  } 
  else if (window.innerWidth > BREAK_POINT && !FLAGS.displayChanged) {
    document.querySelectorAll(".page-card--about:nth-child(n+3)").forEach((pageCard) => { pageCard.lastElementChild.style.display = "block"; });   
    document.querySelectorAll(".au_active").forEach((pageCard) => { pageCard.classList.remove("au_active"); });
    FLAGS.displayChanged = true;
  }
}

function setScrollPosition() {
  if (window.location.hash) {
    window.scrollTo(0, document.querySelector(window.location.hash).offsetTop);
  }
}

function toggleNavClass(event) {
  document.querySelectorAll(".sticky-nav a").forEach((link) => { link.classList.remove(...link.classList); });
  event.target.classList.toggle("is-active");
}


function setupAccordionEventLitseners() {
  if (window.innerWidth < BREAK_POINT && FLAGS.listenerNotAttached) {
    document.querySelectorAll(".page-card--about:nth-child(n+3)").forEach((pageCard) => {pageCard.firstElementChild.addEventListener("click", accordionclicked);});
    FLAGS.listenerNotAttached = false;
  } 
  else if (window.innerWidth > BREAK_POINT && !FLAGS.listenerNotAttached) {
    document.querySelectorAll(".page-card--about:nth-child(n+3)").forEach((pageCard) => { pageCard.firstElementChild.removeEventListener("click",accordionclicked); });
    FLAGS.listenerNotAttached = true;
  }
}

/**
 *  Function that gets called when an accordion gets clicked on mobile view
 */

/* New code */

function accordionclicked(event) {
    console.log(event.target.dataset.hash);
  if (
    window.getComputedStyle(this.parentElement.lastElementChild, null)
      .display == "block"
    
  ) {
    event.target.classList.toggle("au_active");
    this.parentElement.lastElementChild.style.display = "none";
    window.location.hash = event.target.dataset.hash;
  } else {
        event.target.classList.toggle("au_active");
    this.parentElement.lastElementChild.style.display = "block";
    window.location.hash = event.target.dataset.hash;

  }
}

//When the menu reaches the position we want it to stick at, this adds a class and some padding.
function stickItHere() {

  if (window.scrollY >= STICKYNAVTOP) {
    //stickyNav.style.paddingTop = nav.offsetHeight + 'px';
    document.querySelector("#sticky-nav").classList.add("stick-it");
  } else {
    //stickyNav.style.paddingTop = 0;
    document.querySelector("#sticky-nav").classList.remove("stick-it");
  }
}

//This function lists the years in the Accomplishments 
function loadAccomplishmentYears() {
  let d = new Date();
  let year = d.getFullYear();
  for (i=year; i>=2020; i--){
    let optionsHtml='<option value="' + i + '">' + i + '</option>';
    document.querySelector("#accomplishments-year-dropdown").insertAdjacentHTML ('beforeend',optionsHtml);
  }
  for (i=year; i>=2020; i--){
    let listItemHtml='<li id="' + i + '">' + i + '</li>';
    document.querySelector("#accomplishments-year-list").insertAdjacentHTML ('beforeend',listItemHtml);
  }
  console.log ("Accomplishment years have loaded");
}


/**
 * Alignment of page card with its corresponding link on the sticky navigation
 */
function highlightNavOnScroll() {
  let currentActive = document.querySelector(".is-active");
  for (let i = 0; i < ANCHOR_LINKS_ID.length - 1; i++) {
    const top = document.getElementById(ANCHOR_LINKS_ID[i]).getBoundingClientRect().top;
    const bottom = document.getElementById(ANCHOR_LINKS_ID[i + 1]).getBoundingClientRect().top;
    if ((top > 0 && top < VIEWPORT_HEIGHT * 0.8) || bottom >= VIEWPORT_HEIGHT * 0.8) {
      if (currentActive != undefined) {
        currentActive.classList.remove("is-active");
      }
      NAVIGATION_LINK_ELEMENTS[i].classList.add("is-active");
      //window.location.hash = NAVIGATION_LINK_ELEMENTS[i].href.split("#")[1];
      //window.history.replaceState(null, '',  NAVIGATION_LINK_ELEMENTS[i].href);
      return;
    }
  }
  if (currentActive != undefined) {
    currentActive.classList.remove("is-active");
  }
  NAVIGATION_LINK_ELEMENTS[ANCHOR_LINKS_ID.length - 1].classList.add("is-active");
  //window.history.replaceState(null, '',  NAVIGATION_LINK_ELEMENTS[ANCHOR_LINKS_ID.length - 1].href);
  //window.location.hash = NAVIGATION_LINK_ELEMENTS[ANCHOR_LINKS_ID.length - 1].href.split('#')[1]
}


(() => {
  var onScrollStop = (evt) => {
    // you have scroll event as evt (for any additional info)
    var scrollStopEvt = new CustomEvent('scrolling-stopped', {detail: 'foobar stopped :)'});
    window.dispatchEvent(scrollStopEvt);
  }
  var scrollStopLag = 300 // the duration to wait before onScrollStop is triggerred.
  var timerID = 0;
  const handleScroll = (evt) => {
    clearInterval(timerID);
    timerID = setTimeout(
      () => onScrollStop(evt),
      scrollStopLag
    )
  }
  window.addEventListener('wheel', handleScroll);
})()

window.addEventListener(
  'scrolling-stopped', 
  (evt) => {

    let navIsActive = document.querySelector('.is-active').href;
    let hashInNavIsActive  = navIsActive.substring(navIsActive.lastIndexOf('/') + 1)
    if(window.location.hash != hashInNavIsActive){
      window.history.replaceState(null, '', hashInNavIsActive);
    }

  
  }
);

function retrieveAccomplishmentsData() {
  const scriptTag = document.getElementById("aboutScript");
  let receivedData = scriptTag.getAttribute("accomplishments");
  let accData=receivedData.replaceAll("}{", "},{").replaceAll("=>",":");
  let jsonFormat="[" + accData + "]";
  const accomplishmentsData=JSON.parse(jsonFormat);
  return accomplishmentsData;
}

function sortAccomplishmentsByProgramArea(accomplishments){
  let accData=[...accomplishments];
  {% assign projects = site.projects %}
  let projectData=[{%- for project in projects -%}
                      {"project-path":"{{project.path | split: '/' | last}}","program-area": "{{project.program-area}}"}
                      {%- unless forloop.last -%}, {% endunless %}
                  {%- endfor -%}];
  accData.forEach(acc => {
    if (acc["project-file"]){
      projectData.forEach(project => {
        if (project["project-path"] == acc["project-file"]){
          acc["program-area"] = project["program-area"];
        }
      })
    }
  });
  accData.sort( (a,b) => (a["program-area"] > b["program-area"]) ? 1 : -1);
  return (accData);  
}

function yearEventHandler(accByProgramArea,e){
  let items=document.querySelectorAll("#accomplishments-year-list li");
  items.forEach(year=>year.style.color="black");
  let element=e.target.nodeName;
  let accYear="";
  let accToDisplay=[];
  if(element=="LI"){ 
    e.target.style.color = "rgb(250,17,80,255)";
    accYear=e.target.id;
  }
  else {
    accYear=e.target.value;
  }
  if (accYear == "All"){
    accToDisplay=accByProgramArea;
  }
  else {
    let year=parseInt(accYear,10);
    accByProgramArea.forEach(acc => {
      if(acc.year== year) {
        accToDisplay.push(acc);
      }
    })
  }
  displayAccomplishments(accToDisplay);
}

function displayAccomplishments(accToDisplay) {  
  document.querySelector(".top-left-column--acc").innerHTML="";
  document.querySelector(".bottom-right-column--acc").innerHTML="";
  if(accToDisplay.length ==0){
    document.querySelector(".top-left-column--acc").innerHTML="<p>Work In Progress...</p>";
  }
  let progAreaList=[];
  let accCount = accToDisplay.length;
  let colItems = Math.ceil(accCount/2);
  let counter = 1;
  accToDisplay.forEach(acc => {
    if(!progAreaList.includes(acc["program-area"])) {
      progAreaList.push(acc["program-area"]);
    }      
  })
  for( let i=0; i<=progAreaList.length-1;i++){
    let progAreaHtml='<div class="accomplishment-program-area">' + progAreaList[i] + '</div>';
    if (counter <= colItems){
      document.querySelector(".top-left-column--acc").insertAdjacentHTML("beforeend",progAreaHtml);
    }
    else {
      document.querySelector(".bottom-right-column--acc").insertAdjacentHTML("beforeend",progAreaHtml);
    }
    accToDisplay.forEach(acc => { 
      if(acc["program-area"]== progAreaList[i] && counter<=colItems){
        counter++;
        let accHtml= ` <div class="accomplishment-title"><a href="${acc.link}" target="_blank" rel="noopener noreferrer"> ${acc.title} </a></div>
                      <div> ${acc.description} </div>`;
        document.querySelector(".top-left-column--acc").insertAdjacentHTML("beforeend",accHtml);
      }
      else if (acc["program-area"]== progAreaList[i] && counter>colItems) {
        let accHtml= ` <div class="accomplishment-title"><a href="${acc.link}" target="_blank" rel="noopener noreferrer"> ${acc.title} </a></div>
                      <div> ${acc.description} </div>`;
        document.querySelector(".bottom-right-column--acc").insertAdjacentHTML("beforeend",accHtml);
      }
    }) 
  }
}