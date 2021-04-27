

const ANCHOR_LOCATIONS = [...document.querySelectorAll('.anchor')].map(anchor=>anchor.id)
const BREAK_POINT = 960;
let lowerThanBreakPoint=true;

document.addEventListener("DOMContentLoaded", function(){

    
    // Ui components are updated on page load
    updateUI()
    //Ui components are updated on location change
    window.addEventListener('locationchange',updateUI)

    setupAccordionEventLitseners();
    
    window.addEventListener('resize', resizeHandler);

    document.addEventListener('wheel', scrollHandler);

    document.querySelectorAll('#sticky-nav li a').forEach(navlink => { navlink.addEventListener('click', toggleNavClass)   });


})

function resizeHandler(){
    setupAccordionEventLitseners()
    setScrollPosition()
    changeDisplayMode()
    
}

let timer;
function scrollHandler(){
        stickItHere();
        robert();

}


function updateUI(){
    changeDisplayMode()

    if(window.location.hash){
        //Remove current highlighted nav link
        document.querySelector('.sticky-nav a.is-active').classList.toggle('is-active')
        //Apply new highlted nav link based on location hash
        document.querySelector(`[href*="${window.location.hash.split('#')[1]}"]`).classList.toggle('is-active');
    }

    stickItHere();

}

let displayChanged = true;
function changeDisplayMode(){
    if (window.innerWidth < 960 && displayChanged) {
        document.querySelectorAll('.page-card--about:nth-child(n+3)').forEach(pageCard=>{
            pageCard.lastElementChild.style.display = 'none'

        })
        displayChanged = false;
      document.querySelector(`div[data-hash="${window.location.hash.split('#')[1]}"]`).parentElement.lastElementChild.style.display = 'block';

    }
    else if(window.innerWidth > 960 && !displayChanged) {
        document.querySelectorAll('.page-card--about:nth-child(n+3)').forEach(pageCard => {
            pageCard.lastElementChild.style.display = 'block';

        })
        document.querySelector('.au_active') && document.querySelector('.au_active').classList.toggle('au_active')
        displayChanged = true;
    }
}

function setScrollPosition(){
    if(window.location.hash){
        window.scrollTo(0,document.querySelector(window.location.hash).offsetTop);
    }
}

 function toggleNavClass(event){


    document.querySelectorAll(".sticky-nav a").forEach(link =>{
        link.classList.remove(...link.classList)
    })
    event.target.classList.toggle('is-active')
 }

let listenerNotAttached = true;
function setupAccordionEventLitseners() { 
    if (window.innerWidth < 960 && listenerNotAttached) {
        console.log('Accordion Click Listeners Attached')
        document.querySelectorAll('.page-card--about:nth-child(n+3)').forEach(pageCard=>{
            pageCard.firstElementChild.addEventListener('click',accordionclicked)
        })
        listenerNotAttached = false;
    } 
    else if(window.innerWidth > 960 && !listenerNotAttached){
        console.log('Accordion Click Listeners Removed')
        document.querySelectorAll('.page-card--about:nth-child(n+3)').forEach(pageCard => {
            pageCard.firstElementChild.removeEventListener('click',accordionclicked);
        })
        listenerNotAttached = true;
    } 

}

function accordionclicked(event){
    if(window.getComputedStyle(this.parentElement.lastElementChild, null).display == 'block'){
        event.target.classList.toggle('au_active');
        this.parentElement.lastElementChild.style.display = 'none'
        window.location.hash = event.target.dataset.hash;
        console.log('Accordion On Click Dispplay Block')
    }
    else{
        document.querySelectorAll('.page-card--about:nth-child(n+3)').forEach(pageCard=>{
            pageCard.firstElementChild.classList.remove('au_active')

            pageCard.lastElementChild.style.display='none';

        })
        event.target.classList.toggle('au_active');
        this.parentElement.lastElementChild.style.display = 'block';
        window.location.hash = event.target.dataset.hash;
        console.log('Accordion On Click Dispplay None')


    }

    
}

//When the menu reaches the position we want it to stick at, this adds a class and some padding.
function stickItHere() {
    const STICKYNAVTOP = 343;
    

    if (window.scrollY >= STICKYNAVTOP) {
        //stickyNav.style.paddingTop = nav.offsetHeight + 'px';
        console.log('stickattop')

        document.querySelector("#sticky-nav").classList.add('stick-it');
        return 1;
    } else {
        //stickyNav.style.paddingTop = 0;
        console.log('sticknotatop')
        document.querySelector("#sticky-nav").classList.remove('stick-it');
        return;
    }
}




/***************************************************/
/**** Script 3: Highlight links when scrolling *****/
/***************************************************/

// Initialize
//locate all the navigation links
let quickLinks = document.querySelectorAll(".sticky-nav a");
let qlArray = [];
// let positionArray = [];

for (let i = 0; i < quickLinks.length; i++) {

    // Create an array of ids
    qlArray.push(quickLinks[i].href.substring(quickLinks[i].href.indexOf('#') + 1));
}

// alignment of page card with its corresponding link on the sticky navigation 
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

function robert() {
    // let x = [...document.querySelectorAll('.anchor')].map((item) => {
    //     item.id
    // }) 

        let currentActive = document.querySelector('.is-active');
        for (let i = 0; i < qlArray.length - 1; i++) {
            const top = document.getElementById(qlArray[i]).getBoundingClientRect().top
            const bottom = document.getElementById(qlArray[i + 1]).getBoundingClientRect().top
            if (top > 0 && top < vh * 0.8 || bottom >= vh * 0.8) {
                if (currentActive != undefined) {
                    currentActive.classList.remove('is-active');
                }
                quickLinks[i].classList.add('is-active');
                window.location.hash = quickLinks[i].href.split('#')[1]

                return;
            }
        }
        if (currentActive != undefined) {
            currentActive.classList.remove('is-active');
        }
        quickLinks[qlArray.length - 1].classList.add('is-active');
        //window.location.hash = quickLinks[qlArray.length - 1].href.split('#')[1]



};



