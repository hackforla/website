

var lis = document.getElementById("project-list").getElementsByTagName("li");
var locationSelector = document.getElementById("location-selection");

locationSelector.addEventListener('change', (event) => {
  var location = event.target.value;
  console.log(location)
  Array.from(lis).forEach(function(li){
    if (location == "LOCATION"){
      li.style.display = 'block';
    } else if (li.className.includes(location)) {
      li.style.display = 'block';
    } else {
      li.style.display = 'none';
    }
  });
});
