  /**************************************/
 /**** Script 1: Sticky Navigation *****/    
/**************************************/

//Initialize and set defaults

let stickyNav = document.querySelector("#sticky-nav");
let stickyNavTop = 343;

// When the menu reaches the position we want it to stick at, this adds a class and some padding.
function stickItHere() { 
    if (window.scrollY >= stickyNavTop) {
        //stickyNav.style.paddingTop = nav.offsetHeight + 'px';
        stickyNav.classList.add('stick-it');
    } else {
        //stickyNav.style.paddingTop = 0;
        stickyNav.classList.remove('stick-it');
    }   
}

// Listen to the scrolling to find when it reaches the sticky spot
window.addEventListener('scroll', stickItHere);

  /*************************************************/
 /**** Script 2: Highlight Links when clicked *****/
/*************************************************/

//locate all the navigation links and arrows
let navLinks = document.querySelectorAll(".sticky-nav a");

for (let i=0; i < navLinks.length; i++){

    navLinks[i].addEventListener('click', function(event){

        // Disable scroll handler when click on navigation link if using smooth scroll
        document.removeEventListener('scroll', scrollHandler, true);

        //check if a link is currently selected, remove is-active class if yes
        isActive = document.getElementsByClassName('is-active')[0];

        if (isActive != undefined){
            isActive.classList.remove('is-active');
        }
        
        //then add is-active class to the most recent selected link
        this.classList.add('is-active');    

        //re-enable scroll event 1 second after is-active class is added
        setTimeout(function(){
            document.addEventListener("scroll", scrollHandler, true); 
        }, 1000); 

    });
}

  /***************************************************/
 /**** Script 3: Highlight links when scrolling *****/
/***************************************************/

// Initialize
//locate all the navigation links
let quickLinks = document.querySelectorAll(".sticky-nav a");
let qlArray = [];
let positionArray = [];

for (let i=0; i < quickLinks.length; i++) {

    // Create an array of ids
    qlArray.push(quickLinks[i].href.substring(quickLinks[i].href.indexOf('#')+1));
}

// create an array of the position of each id
for (var i=0; i < qlArray.length; i++){
    positionArray.push(document.getElementById(qlArray[i]).getBoundingClientRect().top);
}

document.addEventListener("scroll", scrollHandler, true);

function scrollHandler() {

    // Initialize
    let currentScrollPosition = document.documentElement.scrollTop;	
    let currentActive;
    
    for (let i=1; i <= positionArray.length; i++) {

        // Set value
        currentScrollPosition = document.documentElement.scrollTop;	

        if (currentScrollPosition >= positionArray[i-1] && currentScrollPosition < positionArray[i]) {
            currentActive = document.getElementsByClassName('is-active')[0];

            if (currentActive != undefined){
                currentActive.classList.remove('is-active');
            }
            
            quickLinks[i-1].classList.add('is-active');
            break;
        }

        if (currentScrollPosition > positionArray[positionArray.length-1]){
            currentActive = document.getElementsByClassName('is-active');
            currentActive = document.getElementsByClassName('is-active')[0];

            if (currentActive != undefined){
                currentActive.classList.remove('is-active');
            }
            
            quickLinks[quickLinks.length-1].classList.add('is-active');
            break;
        }
    } // End for
};

  /***********************************************************/
 /* ************** Script 4: Mobile accordian ************* */
/***********************************************************/

// This function creates the event listener
function createAccordionEventListener (accordionElements) {
    for (let el of accordionElements) {
        el.addEventListener("click", toggleAccordion, false)
    }
} // end function

// This removes the event listeners.  This is used when the display was loaded in mobile view
// and then switched to full display.  
function removeEventListener (accordionElements) {
    for (let el of accordionElements) {
        el.removeEventListener("click", toggleAccordion, false);
    }
} // end function


// This is the meat of the event listener
function toggleAccordion () {
    // Toggles adding and removing the class from the class list
    this.classList.toggle('au_active');

    // Which panel to open/close
    let accordionContainer = this.nextElementSibling;

    // Open and close panel
    if (accordionContainer.style.display === "block") {
        accordionContainer.style.display = "none"
    } else {
        accordionContainer.style.display = "block"
    }
}



// On page load add event listeners if 
 
    // Get the list of elements for the accordion
    let accordionList = document.querySelectorAll(".about-us-section-header");

    if (windowWidth < 960) {
        // Create event listeners
        createAccordionEventListener (accordionList);
    }

  /*********************************************************************************/
 /* ************** Script 5: Mobile accordian - Read more/Read less ************* */
/*********************************************************************************/


function createReadMoreReadLessEventListener (classToAdd, accordionElements) {

    for (let el of accordionElements) {

        el.addEventListener("click", function () {

            // Declare variables!
            let accordionContainer = this.previousElementSibling;
            let readMore = document.querySelector(".read-more");
            let readLess = document.querySelector(".read-less");

            // This toggles "Read more" and "Read less" so one comes on and the other goes off
                readMore.classList.toggle(classToAdd);
                readLess.classList.toggle(classToAdd);

            // if it is read-more and not read-less, do this
            if (this.className.includes("read-more")) {
                accordionContainer = this.nextElementSibling;
            }

            // Open and close panel
            if (accordionContainer.style.display === "block") {
                accordionContainer.style.display = "none"
            } else {
                accordionContainer.style.display = "block"
            }
              event.stopPropagation()
        })
    }
} // end function

// Add event listeners
if (windowWidth < 960) { 
    // Get the list of elements for the accordion
    let letterFromExecDir = document.querySelectorAll(".read-more, .read-less");

    // Create event listeners
    createReadMoreReadLessEventListener ("more-less", letterFromExecDir);
}


  /*******************************************************/
 /***** Script 6: Add a break tag to certain headers ****/
/*******************************************************/

// There certain headers need to be split into two lines on mobile
// This adds a br tag at the designated spot in the string. 

// Get the header text
let letterHeadText = document.getElementById("letterBR").innerText;

// Function to add something within a string
let insertSomething = (str,ins_str,pos) => { return str.slice(0, pos) + ins_str + str.slice(pos) };

// If it's mobile, add a break tag and put it back
if (windowWidth < 960) {
    document.getElementById("letterBR").innerHTML = insertSomething(letterHeadText, '<br />', 15);
}