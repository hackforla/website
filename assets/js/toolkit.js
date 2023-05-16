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

function retrieveFilterCategories(){
    {% assign projects = site.guide-pages | where: "display", "true" %}
    let projects = JSON.parse(decodeURIComponent("{{ projects | jsonify | uri_escape }}"));

    const practiceAreas = []
    const projectStatus = []
    const projectTools = []
    const projectSource = []
    const projectContributors = []

    // Extract categories from guides
    for (let i = 0; i < projects.length; i++) {
        const project = projects[i]
        if (project["practice-area"] && !practiceAreas.includes(project["practice-area"])) {
            practiceAreas.push(project["practice-area"])
        }
        if (project["status"]) {
            if (project["status"] === "completed" && !projectStatus.includes("Active")) {
                projectStatus.push("Active")
            }
            if (project["status"] === "work-in-progress" && !projectStatus.includes("Draft")) {
                projectStatus.push("Draft")
            }
        }
        if (project["tools"]) {
            const tools = project["tools"]
            for (let j = 0; j < tools.length; j++) {
                if (!projectTools.includes(tools[j]) && tools[j]) {
                    projectTools.push(tools[j])
                }
            }
        }
        if (project["source"] && !projectSource.includes(project["source"])) {
            projectSource.push(project["source"])
        }
        if (project["contributors"]) {
            const contributors = project["contributors"]
            for (let j = 0; j < contributors.length; j++) {
                if (!projectContributors.includes(contributors[j]) && contributors[j]) {
                    projectContributors.push(contributors[j])
                }
            }
        }
    }
    return {projectStatus, practiceAreas, projectTools, projectSource, projectContributors}
}

function dropDownFilterComponent(categoryName,filterArray,filterTitle){
    return `
    <li class='filter-item'>
    <a class='category-title filter-categories' style='text-transform: capitalize; color: white'>
        ${filterTitle}
        <span id='counter_${categoryName}' class='number-of-checked-boxes'></span>
        <span class='labelArrow' tabindex="0" role="button" aria-label="Toggle Show ${filterTitle} Filters"> ∟ </span>
    </a>
    <ul class='dropdown' id='${categoryName.toLowerCase()}'>
        ${filterArray.map(item =>
            `
            <li>
                <input id='${item}' name='${categoryName}'  type='checkbox' class='filter-checkbox'>
                <label for='${item}'>${item} <span></span></label>
            </li>
            `
        ).join("")}
    </ul>
    </li>
    `
}

let filterCategories = retrieveFilterCategories()

for (let key in filterCategories) {
    let categoryName = key
    let filterArray = filterCategories[key]
    let filterTitle
    switch(key) {
        case 'projectStatus':
            filterTitle = 'Status'
            break
        case 'practiceAreas':
            filterTitle = 'Practice Area'
            break
        case 'projectTools':
            filterTitle = 'Tools'
            break
        case 'projectSource':
            filterTitle = 'Source'
            break
        case 'projectContributors':
            filterTitle = 'Contributors'
            break
    }
    document.querySelector('.filter-list').insertAdjacentHTML( 'beforeend', dropDownFilterComponent(categoryName, filterArray, filterTitle) );
}

const currentFilters = {projectStatus: [], practiceAreas: [], projectTools: [], projectSource: [], projectContributors: []}

document.querySelectorAll(".filter-checkbox").forEach(filter => {
    filter.addEventListener('click', function (event) {
        let name
        if (event.target.id.split(' ').length > 0) {
            name = event.target.id.split(' ').join('+')
        } else {
            name = event.target.id
        }
        let category = event.target.name
        if (event.target.checked) {
            currentFilters[category].push(name)
        }
        if (!event.target.checked) {
            let index = currentFilters[category].indexOf(name)
            currentFilters[category].splice(index, 1)
        }
        let filters = ''
        for (let key in currentFilters) {
            if (currentFilters[key].length) {
                filters = filters + `${key}=${currentFilters[key].join(',')}&`
            }
        }
        // Remove extra &
        if (filters) {
            filters = filters.slice(0, filters.length - 1)
        }

        window.history.replaceState(null, '', `?${filters}`);

    });
});