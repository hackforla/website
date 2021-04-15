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

for (let i = 0; i < navLinks.length; i++) {

    navLinks[i].addEventListener('click', function (event) {

        // Disable scroll handler when click on navigation link if using smooth scroll
        document.removeEventListener('scroll', scrollHandler, true);

        //check if a link is currently selected, remove is-active class if yes
        isActive = document.getElementsByClassName('is-active')[0];

        if (isActive != undefined) {
            isActive.classList.remove('is-active');
        }

        //then add is-active class to the most recent selected link
        this.classList.add('is-active');

        //re-enable scroll event 1 second after is-active class is added
        setTimeout(function () {
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

for (let i = 0; i < quickLinks.length; i++) {

    // Create an array of ids
    qlArray.push(quickLinks[i].href.substring(quickLinks[i].href.indexOf('#') + 1));
}

// create an array of the position of each id
for (var i = 0; i < qlArray.length; i++) {
    positionArray.push(document.getElementById(qlArray[i]).getBoundingClientRect().top);
}

document.addEventListener("scroll", scrollHandler, true);

// alignment of page card with its corresponding link on the sticky navigation 
function scrollHandler() {
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

    currentActive = document.getElementsByClassName('is-active')[0];
    for (let i = 0; i < qlArray.length - 1; i++) {
        const top = document.getElementById(qlArray[i]).getBoundingClientRect().top
        const bottom = document.getElementById(qlArray[i + 1]).getBoundingClientRect().top
        if (top > 0 && top < vh * 0.8 || bottom >= vh * 0.8) {
            if (currentActive != undefined) {
                currentActive.classList.remove('is-active');
            }
            quickLinks[i].classList.add('is-active');
            return;
        }
    }
    if (currentActive != undefined) {
        currentActive.classList.remove('is-active');
    }
    quickLinks[qlArray.length - 1].classList.add('is-active');

};

/***********************************************************/
/* ************** Script 4: Mobile accordian ************* */
/***********************************************************/

// This function creates the event listeners
function createAccordionEventListener(accordionElements) {
    for (let el of accordionElements) {
        el.addEventListener("click", toggleAccordion, false)
    }
} // end function

// This removes the event listeners.  
// This is used when the display was loaded in mobile view and then switched to full display.  
function removeAccordionEventListener(accordionElements) {
    for (let el of accordionElements) {
        el.removeEventListener("click", toggleAccordion, false);
    }
} // end function

// This opens and closes the sections to make it accordion-like
function toggleAccordion() {
    // Toggles adding and removing the class from the class list
    this.classList.toggle('au_active');

    // Which panel to open/close
    let accordionContainer = this.nextElementSibling;
    let accordionID = this.parentElement.previousElementSibling.id;

    // Open and close panel
    if (accordionContainer.style.display === "block") {
        accordionContainer.style.display = "none"
    } else {
        accordionContainer.style.display = "block"
        location.href = "#"+ accordionID;
    }
} // end function

// This expands all sections when it goes from mobile to desktop
function expandAccordion(accordionElements) {
    for (let el of accordionElements) {
        el.nextElementSibling.style.display = "block";
    }
} // end function

// This closes all sections when it goes from desktop to mobile
// if the element was active (open) it leaves it open
function closeAccordion(accordionElements) {

    // Create event listeners to current highlighted content
    // find the element that correlates to reading content
    const currentHighlight = document.getElementsByClassName('is-active')[0].getAttribute('href');
    const currentAnchor = currentHighlight.split("#")[1];
    openOneAccordion(currentAnchor);
    
    for (let el of accordionElements) {
        if (el.classList.contains("au_active")) {
            // Do nothing
        } else {
            el.nextElementSibling.style.display = "none";
        }
    }

} // end function

// Open current highlighted content
function openOneAccordion(currentAnchor){
    document.getElementById(currentAnchor).nextElementSibling.children[0].classList.add("au_active");
    document.getElementById(currentAnchor).nextElementSibling.children[1].style.display = "block";
};
//end function

// This adjusts the letter when it goes back to mobile
// It should leave it open if it was open, and closed if it was closed
function letterBackToMobile(readMoreElement, readLessElement) {
    if (readLessElement.classList.contains("more-less")) {
        readMoreElement.nextElementSibling.style.display = "none";
    } else {
        readMoreElement.nextElementSibling.style.display = "block";
    }
} // end function

// Initialize Current Mobile Viewing Content
let currentMobileContent;

// This remembers the element for mobile to desktop
// Find where the element is on screen
function locateMobileContent(){
    const currentViewingContent = document.getElementsByClassName("au_active");
    let elementClosestToViewport = {top: Number.MAX_SAFE_INTEGER};

    for (let element of currentViewingContent) {
        const rectangleRelativeToViewport = element.getBoundingClientRect();
        if(rectangleRelativeToViewport.top < 0 && rectangleRelativeToViewport.bottom >0){
            return element;
        } else if (rectangleRelativeToViewport.top >= 0) {
            if(rectangleRelativeToViewport.top < elementClosestToViewport.top) {
                elementClosestToViewport = element;
            }
        } 
    }
    
    if (elementClosestToViewport.top !== Number.MAX_SAFE_INTEGER) {
        return elementClosestToViewport;
    }
    return null;
}
 //end function

// accordionFlag tracks the state of the window | mobile = 0; desktop = 1
let accordionFlag;

//Initialize
if (window.innerWidth < 960) {
    accordionFlag = 0;
} else {
    accordionFlag = 1;
}

// This function checks for when the window crosses the threshold between mobile and desktop
// When it does, it either adds or removes the event handlers and resets the flag
function resizeHandler() {

    if (accordionFlag === 0 && window.innerWidth >= 960) {
        removeAccordionEventListener(accordionList);
        expandAccordion(accordionExpandList);
        accordionFlag = 1;
 
        // find current mobile viewing content before resizing
    if(currentMobileContent !== null){
        currentMobileContentParent = currentMobileContent.parentElement;
        currentMobileContentAnchor = currentMobileContentParent.previousElementSibling;
        location.href = "#"+currentMobileContentAnchor.id; 
        }
    }

    if (accordionFlag === 1 && window.innerWidth < 960) {
        createAccordionEventListener(accordionList);
        closeAccordion(accordionList);
        letterBackToMobile (readMoreToMobile, readLessToMobile);
        accordionFlag = 0;
    } 

    if (accordionFlag === 0 && window.innerWidth < 960){
        currentMobileContent = locateMobileContent();
    }
} // end function 

// Get the list of elements for the accordion
let accordionList = document.querySelectorAll(".about-us-section-header");

// Get the elements to expand when going from mobile to desktop
let accordionExpandList = document.querySelectorAll(".about-us-section-header, .read-more");

// This is to close the letter to the editor on going to mobile
let readMoreToMobile = document.querySelector(".read-more");
let readLessToMobile = document.querySelector(".read-less");

// Create event listeners on page load if in mobile
if (window.innerWidth < 960) {
    // Create event listeners
    createAccordionEventListener(accordionList);
}

// Add or remove event listeners on resize or orientation change
window.addEventListener('resize', resizeHandler);


/*********************************************************************************/
/* ************** Script 5: Mobile accordian - Read more/Read less ************* */
/*********************************************************************************/


function createReadMoreReadLessEventListener(classToAdd, accordionElements) {

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

// Get the list of elements for the accordion
let letterFromExecDir = document.querySelectorAll(".read-more, .read-less");

// Create event listeners
createReadMoreReadLessEventListener("more-less", letterFromExecDir);

/*******************************************************/
/***** Script 6: Add a break tag to certain headers ****/
/*******************************************************/

// There certain headers need to be split into two lines on mobile
// This adds a br tag at the designated spot in the string. 

// Get the header text
let letterHeadText = document.getElementById("letterBR").innerText;

// Function to add something within a string
let insertSomething = (str, ins_str, pos) => { return str.slice(0, pos) + ins_str + str.slice(pos) };

// If it's mobile, add a break tag and put it back
if (window.innerWidth < 960) {
    document.getElementById("letterBR").innerHTML = insertSomething(letterHeadText, '<br />', 15);
}

// If it's mobile, if href has #, open content
if(window.innerWidth <960) {
    if (location.href.includes("#letter")) {
        readMore = readMoreToMobile.nextElementSibling;
        readMore.style.display = "block";
        if (readMore.style.display === "block") {
            readMoreToMobile.classList.add("more-less")
            readLessToMobile.classList.remove("more-less")
        }

    } else if(location.href.includes("#")) {
        const currentURLHashId = location.href.substring(location.href.indexOf("#")+1);
        openOneAccordion(currentURLHashId);
    }
}

function hashLetter() {
    if (readMoreToMobile.nextElementSibling.style.display = "block"){
        location.href = "#letter";
    }
}

readMoreToMobile.addEventListener("click", hashLetter);
