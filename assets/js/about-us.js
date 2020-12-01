  /**************************************/
 /**** Script 1: Sticky Navigation *****/    
/**************************************/

//Initialize and set defaults
let stickyNav = document.getElementById("sticky-nav");
let stickyNavTop = stickyNav.offsetTop - 80;

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

// classToAdd is the name of the class that gets added to the list
// accordionElements are the elements that we're working on
function createAccordionEventListener (classToAdd, accordionElements) {

    for (let el of accordionElements) {

        el.addEventListener("click", function () {

            // Toggles adding and removing the class from the class list
            this.classList.toggle(classToAdd);

            // Which panel to open/close
            let accordionContainer = this.nextElementSibling;


            // Open and close panel
            if (accordionContainer.style.display === "block") {
                accordionContainer.style.display = "none"
            } else {
                accordionContainer.style.display = "block"
            }
        })
    }
} // end function

// Add event listeners
if (windowWidth < 768) { 
    // Get the list of elements for the accordion
    let accordionList = document.querySelectorAll(".about-us-section-header");

    // Create event listeners
    createAccordionEventListener ("au_active", accordionList);
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

            // This needs to toggle "Read more" and "Read less" so one comes on and the other goes off
                readMore.classList.toggle(classToAdd);
                readLess.classList.toggle(classToAdd);

            // if it is read-more and not read-less, do this
            if (this.className.includes("read-more")) {
                accordionContainer = this.nextElementSibling;
                console.log("Here -> more");
            }

            console.log('accordionContainer -> ' + this.className);

            // Open and close panel
            if (accordionContainer.style.display === "block") {
                console.log("Here -> none");
                accordionContainer.style.display = "none"
            } else {
                accordionContainer.style.display = "block"
                console.log("Here -> block");
            }
              event.stopPropagation()
        })
    }
} // end function

// Add event listeners
if (windowWidth < 768) { 
    // Get the list of elements for the accordion
    let letterFromExecDir = document.querySelectorAll(".read-more, .read-less");

    // Create event listeners
    createReadMoreReadLessEventListener ("more-less", letterFromExecDir);
}


  /*******************************************************/
 /***** Script 6: Add a break tag to certain headers ****/
/*******************************************************/

// There certain headers need to be split into two lines on mobile
// This adds a br tag as the designated spot in the string. 

// Get the header text
let letterHeadText = document.getElementById("letterBR").innerText;

// Function to add something within a string
let insertSomething = (str,ins_str,pos) => { return str.slice(0, pos) + ins_str + str.slice(pos) };

// If it's mobile, add a break tag and put it back
if (windowWidth < 768) {
    document.getElementById("letterBR").innerHTML = insertSomething(letterHeadText, '<br />', 15);
}