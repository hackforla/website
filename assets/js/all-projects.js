

var projects = document.getElementById("project-list").getElementsByTagName("li");
var locationSelector = document.getElementById("location-selection");
var statusSelector = document.getElementById("status-selection");
var searchFilters = {
  location: "project-card",
  status: "project-card"
};

// Goes through all projects and
// shows them if they have a class in the filter or
// hides them if they don't have a class in the filter
function showHideProjects(){
  Array.from(projects).forEach(function(project){
    projectClassIncludesFilter = Object.values(searchFilters)
      .every((filter) => project.className.includes(filter) );

    if (projectClassIncludesFilter) {project.style.display = "block"}
    else {project.style.display = "none"}
  });
};

locationSelector.addEventListener('change', (event) => {
  searchFilters["location"] = event.target.value;
  showHideProjects();
});

statusSelector.addEventListener('change', (event) => {
  searchFilters["status"] = event.target.value;
  showHideProjects();
});
