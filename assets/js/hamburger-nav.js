---
title: my js file
---

 //Retrieve svg string from _includes
 const burgerImage = `{% include svg/icon-hamburger-nav.svg %}` ;
 const burgerImageX = `{% include svg/icon-hamburger-nav-x.svg %}` ;


document.querySelector('#burgerImage').addEventListener('click',toggleNavDisplay);
window.addEventListener('resize', resetNavBarPropsToDefaultState);

function toggleNavDisplay(){
 swapIcons(this.firstElementChild.id);
 document.querySelector('#headerNav').style.display == 'flex' ? document.querySelector('#headerNav').style.display = 'none': document.querySelector('#headerNav').style.display = 'flex';

 
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
