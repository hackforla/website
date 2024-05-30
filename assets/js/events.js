  const locationsDropDown = document.querySelector(".getting-started-mobile-page");
  const showingLocations = document.querySelector(".mobile-locations-dropdown");
  const showContent = document.querySelectorAll(".event-title");
  const showLocations = document.querySelector(".event-title-1");

  showLocations.addEventListener("click", function () {
    this.classList.toggle("active");
    if (showingLocations.style.display == "block") {
      showingLocations.style.display = "none";
    } else {
      showingLocations.style.display = "block";
    }
  });

  for (let i = 0; i < showContent.length; i++) {
    showContent[i].addEventListener("click", showingDropDown);
  }

  function showingDropDown() {
    if(document.body.clientWidth<767){
    this.classList.toggle("active");
      let dropDown = this.nextElementSibling;
      if (dropDown.style.display === "block") {
        dropDown.style.display = "none";
      } else {
        dropDown.style.display = "block";
      }
    }
  }
  window.addEventListener('resize', handleScreenResize); 

  /**
   * Handles the screen resize event for event cards
   * When the screen width is greater than 767 pixels (tablet/desktop), disables mobile dropdown, removes the arrow and display card content
   * When the screen width is less than or equal to 767 pixels (mobile), enables cards mobile dropdown and fold the cards, unless already unfolded ('active').
   */
  function handleScreenResize() {
    const columns = document.querySelectorAll('.mobile-dropdown');

    if (document.body.clientWidth > 767) {
      for(let column of columns) {
        column.style.display='block';
        column.previousElementSibling.classList.remove('active');
      }
    } else {
      for (let column of columns) {
        if (column.previousElementSibling.classList.contains('active')) {
          // when collapsing cards, skip the ones unfolded manually
          continue;
        }
        column.style.display='none';
    }
  }
}