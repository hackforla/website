

var projects = document.getElementById("project-list").getElementsByTagName("li");
var locationSelector = document.getElementById("location-selection");
var statusSelector = document.getElementById("status-selection");
/* all-projects-card is the default class name that all of the
project cards start with */
var searchFilters = {
  location: "all-projects-card",
  status: "all-projects-card"
};

/* Goes through all projects and
shows them if they have a class in the filter or
hides them if they don't have a class in the filter */
function showHideProjects(){
  Array.from(projects).forEach(function(project){
    projectClassIncludesFilter = Object.values(searchFilters)
      .every((filter) => project.className.includes(filter) );

    if (projectClassIncludesFilter) {project.style.display = "block"}
    else {project.style.display = "none"}
  });
};

// current implementation replaces select boxes with styled divs, but this code is still here in case you want to use out-of-the-box selectors in the future
locationSelector.addEventListener('change', (event) => {
  searchFilters["location"] = event.target.value;
  showHideProjects();
});

statusSelector.addEventListener('change', (event) => {
  searchFilters["status"] = event.target.value;
  showHideProjects();
});

// replace selectors with tyled divs
var parentDivs, index, selectIdx, selElmnt, newParent, optionsContainer, selectOption;
/* Look for any elements with the class "filter-form__select": */
parentDivs = document.getElementsByClassName("filter-form__select");
for (index = 0; index < parentDivs.length; index++) {
  selElmnt = parentDivs[index].getElementsByTagName("select")[0];
  /* For each element, create a new DIV that will act as the selected item: */
  newParent = document.createElement("DIV");
  newParent.setAttribute("class", "select-selected");
  newParent.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  parentDivs[index].appendChild(newParent);
  /* For each element, create a new DIV that will contain the option list: */
  optionsContainer = document.createElement("DIV");
  optionsContainer.setAttribute("class", "select-items select-hide");

  for (selectIdx = 1; selectIdx < selElmnt.length; selectIdx++) {
    /* For each option in the original select element,
    create a new DIV that will act as an option item: */
    newSelectDiv = document.createElement("DIV");
    newSelectDiv.innerHTML = selElmnt.options[selectIdx].innerHTML;
    newSelectDiv.setAttribute("data-value" ,selElmnt.options[selectIdx].value);
    newSelectDiv.addEventListener("click", function(e) {
        /* When an item is clicked, update the original select box,
        and the selected item: */
        var prevSelection, index, idx2, select, defaultSelect;
        select = this.parentNode.parentNode.getElementsByTagName("select")[0];
        defaultSelect = this.parentNode.previousSibling;
        for (index = 0; index < select.length; index++) {
          if (select.options[index].innerHTML == this.innerHTML) {
            select.selectedIndex = index;
            // update search filter values
            searchFilter = select.options[0].label.toLowerCase();
            selectionValue = this.dataset.value;
            searchFilters[searchFilter] = selectionValue;
            showHideProjects();
            defaultSelect.innerHTML = this.innerHTML;
            prevSelection = this.parentNode.getElementsByClassName("same-as-selected");
            for (idx2 = 0; idx2 < prevSelection.length; idx2++) {
              prevSelection[idx2].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        defaultSelect.click();
    });
    optionsContainer.appendChild(newSelectDiv);
  }
  parentDivs[index].appendChild(optionsContainer);
  newParent.addEventListener("click", function(e) {
    /* When the select box is clicked, close any other select boxes,
    and open/close the current select box: */
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}

function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  var x, y, i, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  for (i = 0; i < y.length; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < x.length; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);
