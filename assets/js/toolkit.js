---

---

// run hashFilter() as soon as page loads to show filtered results based on URL alone, without clicking on navbar
// document.addEventListener("DOMContentLoaded", hashFilter)

// //add listener for click in banner, and toggle classes for filters.
// document.querySelectorAll(".toolkit-header__banner-item").forEach(filter => {
//     filter.addEventListener('click', function (event) {
//         let thisCategory = event.currentTarget;
//         let otherCategories = event.currentTarget.parentElement.children;

//         if (thisCategory.classList.contains('selected-category')) {
//             return;
//         } else {
//             Array.from(otherCategories).forEach((category) => {
//                 if (category.classList.contains('selected-category')) {
//                     category.classList.remove('selected-category');
//                     return;
//                 }
//             });

//             thisCategory.classList.toggle('selected-category');
//         }
//     });
// });

// //add handler for dropdown navigation selection
// document.getElementById("dropdown-select").onchange = function() {
//     window.location.href = this.value;
// }

// //add listener for url change and toggle visible cards.
// window.addEventListener("hashchange", hashFilter);

// function hashFilter(e) {
//     let currentHash = location.hash.split('#')[1].replace("+", "").toLowerCase();

//     let cardContainers = document.querySelectorAll("[data-article-type]");
//     let guidesCategories = ["all", "development", "design", "projectmanagement", "professionaldevelopment"]
//     if(guidesCategories.includes(currentHash)){
//         cardContainers.forEach((card) => {
//             if (currentHash == 'all') {
//                 card.style.display = 'block';
//                 return;
//             }
//             card.dataset.articleType == currentHash ? card.style.display = "block" : card.style.display = "none";
//         });
//     }
// }

{% assign guides = site.data.external.github-data %}
{% assign projects = site.guide-pages | where: "display", "true" %}
let projects = JSON.parse(decodeURIComponent("{{ projects | jsonify | uri_escape }}"));

console.log(projects)
console.log('test')