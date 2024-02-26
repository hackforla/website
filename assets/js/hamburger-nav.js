---
title: hamburger nav file
---

// Retrieve the SVG element
const svgElement = document.querySelector('#burgerImage svg');

// Get the id of the button
const buttonId = 'burgerImage';

// Set the aria-labelledby attribute on the SVG element
svgElement.setAttribute('aria-labelledby', buttonId); 

//Retrieve svg string from _includes
const burgerImage = `{% include svg/icon-hamburger-nav.svg %}`;
const burgerImageX = `{% include svg/icon-hamburger-nav-x.svg %}`;

const burgerButton = document.querySelector('#burgerImage');
 

document.querySelector('#burgerImage').addEventListener('click',toggleNavDisplay);
window.addEventListener('resize', resetNavBarPropsToDefaultState);

function toggleNavDisplay(){
  const headerNav = document.querySelector('#headerNav');
  swapIcons(this.firstElementChild.id);
  headerNav.style.display == 'flex'
  ? (headerNav.style.display = 'none', burgerButton.setAttribute('aria-expanded', 'false'))
  : (headerNav.style.display = 'flex', burgerButton.setAttribute('aria-expanded', 'true'));
 
}


function swapIcons(icon_id){
 //Create dictionary for swap
 const hamburger = {
   'hamburger-nav': {"el":burgerImage,'opposite':burgerImageX},
   'hamburger-nav-x':{'el':burgerImageX,'opposite':burgerImage}
 }

 //remove existing icon
 document.querySelector(`#${icon_id}`).remove();

 //insert opposite icon
 document.querySelector(`#burgerImage`).insertAdjacentHTML('afterbegin',hamburger[icon_id].opposite);
 

}


function resetNavBarPropsToDefaultState(){
 if(document.body.clientWidth>767){
   document.querySelector('#headerNav').removeAttribute("style");
   document.querySelector(`#burgerImage`).firstElementChild.remove();
   document.querySelector(`#burgerImage`).insertAdjacentHTML('afterbegin',burgerImage);

 }


}
