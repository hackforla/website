

var lis = document.getElementById("project-list").getElementsByTagName("li");
var locationSelector = document.getElementById("location-selection");
var statusSelector = document.getElementById("status-selection");

locationSelector.addEventListener('change', (event) => {
  var location = event.target.value;
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


statusSelector.addEventListener('change', (event) => {
  var status = event.target.value;
  console.log(status)
  Array.from(lis).forEach(function(li){
    if (status == "STATUS"){
      li.style.display = 'block';
    } else if (li.className.includes(status)) {
      li.style.display = 'block';
    } else {
      li.style.display = 'none';
    }
  });
});
