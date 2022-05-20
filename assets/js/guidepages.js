/*************************************************/
/**** Script 1: Highlight Links when clicked *****/
/*************************************************/

//locate all the navigation links and arrows
let navLinks = document.querySelectorAll('.sticky-nav--guides a');
navLinks [0].classList.add('is-active');
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

/*************************************************/
/**** Script 2: Makes the side stick and scrollable *****/
/*************************************************/

const stickyDiv = document.querySelector(".sticky-nav-container--guides");
window.addEventListener("scroll", function() {
  stickyDiv.style.top = window.pageYOffset + "px";
});


/***************************************************/
/**** Script 2: Highlight links when scrolling *****/
/***************************************************/

// Initialize
//locate all the navigation links
let quickLinks = document.querySelectorAll('.sticky-nav--guides a');
let qlArray = [];
for (let i = 0; i < quickLinks.length; i++) {
    // Create an array of ids
    qlArray.push(quickLinks[i].href.substring(quickLinks[i].href.indexOf('#') + 1));
}
document.addEventListener('scroll', scrollHandler, true);

// alignment of page card with its corresponding link on the sticky navigation 
function scrollHandler() {
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    currentActive = document.getElementsByClassName('is-active')[0];
    for (let i = 0; i < qlArray.length - 1; i++) {
        const top = document.getElementById(qlArray[i]).getBoundingClientRect().top
        const bottom = document.getElementById(qlArray[i + 1]).getBoundingClientRect().top
        if (top > 0 && top < vh * 0.8 || bottom >= vh * 0.7) {
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


/***************************************************/
/**** Script 3: Scroll to the Top (Mobile) *****/
/***************************************************/

//Get the button:
topbutton = document.getElementById("return-to-top");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    topbutton.style.display = "block";
  } else {
    topbutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}