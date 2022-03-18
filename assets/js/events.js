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
  document.querySelector('.flex-page-card').addEventListener('resize',handleScreenResize)
  function handleScreenResize(){
    if(document.body.clientWidth>767){
      const columns = document.querySelectorAll('.mobile-dropdown');
      for(let column of columns){
        column.style.display='block';
        column.previousElementSibling.classList.remove('active');
      }
    }
    else{
      const columns = document.querySelectorAll('.mobile-dropdown');
      for(let column of columns){
        column.style.display='none';
    }
  }
}