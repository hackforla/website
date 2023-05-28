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

document.addEventListener("DOMContentLoaded", () => {
    const currentFilters = {projectStatus: [], practiceAreas: [], projectTools: [], projectSource: [], projectContributors: []}

    // Generate dropdown menu
    initializeFilters()

    // Apply current URL to filters
    let currentHash = window.location.href.split('?')
    if (currentHash.length > 1 && currentHash[1].length > 0) {
        currentHash = currentHash[1].split('&')
        for (let i = 0; i < currentHash.length; i++) {
            let category = currentHash[i].split('=')[0]
            let filters = currentHash[i].split('=')[1].split(',')
            currentFilters[category] = filters
        }
        updateCheckBoxState(currentFilters)
        applyFilters(currentFilters)
    }

    // Event listener for filter checkboxes
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
            applyFilters(currentFilters)
        });
    });

    // Event listener for arrows to collapse categories
    const labelArrows = document.querySelectorAll(".labelArrow")
    labelArrows.forEach(label => {
        label.addEventListener('click', function() {
            label.parentElement.classList.toggle("show-none")
        })
    })
})

// Retrieve filter categories from guide pages
function retrieveFilterCategories() {
    {% assign projects = site.guide-pages | where: "display", "true" %}
    let projects = JSON.parse(decodeURIComponent("{{ projects | jsonify | uri_escape }}"));

    const practiceAreas = []
    const projectStatus = []
    const projectTools = []
    const projectSource = []
    const projectContributors = []

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

// Generate HTML for dropdown
function dropDownFilterComponent(categoryName,filterArray,filterTitle) {
    return `
    <li class='filter-item'>
        <a class='category-title filter-categories' name='${categoryName}' style='text-transform: capitalize; color: white'>
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

// Insert dropdown menu into the DOM
function initializeFilters() {
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

        document.querySelector('.filter-list').insertAdjacentHTML( 'beforeend', dropDownFilterComponent(categoryName, filterArray, filterTitle) )

        // Add View All button if category has more than 8 filters
        if (document.getElementById(categoryName.toLowerCase()).getElementsByTagName("li").length > 8) {
            document.getElementById(categoryName.toLowerCase()).insertAdjacentHTML( 'beforeend', `<li class="view-all" tabindex="0" role="button" aria-label="View All ${filterTitle} Filters">View all</li>` );
        }

        // Add event listener on View All button
        document.querySelectorAll("li.view-all").forEach(viewAll => {
            viewAll.addEventListener("click", function(event) {
                event.target.parentNode.classList.add("show-all")
            })
        })
    }
}

// Update page based on current filters
function applyFilters(filters) {
    document.querySelectorAll(".section-container").forEach(card => {
        card.style.display = 'block'
        for (let key in filters) {
            if (key === 'projectStatus') {
                if (filters.projectStatus.includes('Active') && filters.projectStatus.length === 1) {
                    if (card.dataset.projectStatus !== 'completed') {
                        card.style.display = 'none'
                    }
                }
                if (filters.projectStatus.includes('Draft') && filters.projectStatus.length === 1) {
                    if (card.dataset.projectStatus !== 'work-in-progress') {
                        card.style.display = 'none'
                    }
                }
            } else {
                if (filters[key].length > 0) {
                    filters[key].map(data => {
                        let param = data
                        if (data.includes('+')) {
                            param = data.split('+').join(' ')
                        }
                        if (card.dataset[key]) {
                            if (!(card.dataset[key].includes(param))) {
                                card.style.display = 'none'
                            }
                        } else {
                            card.style.display = 'none'
                        }
                    })
                }
            }
        }
    })

    applyFiltersToURL(filters)

    updateFilterTag(filters)

    attachEventListenerToFilterTags(filters)
}

/**
 * Takes a name of a checkbox filter and the value of the check boxed filter
 * and creates a html string representing a button
*/

function filterTagComponent(filterName,filterValue){
    return `<div
                data-filter='${filterName},${filterValue}'
                class='filter-tag'
            >
                <span tabindex="0" role="button" aria-label="Remove ${filterValue} Filter">
                ${filterName}: ${filterValue}
                </span>
            </div>`
}

function updateFilterTag(filterParams) {
    // Clear all filter tags
    document.querySelectorAll('.filter-tag').forEach(filterTag => filterTag.parentNode.removeChild(filterTag))
    document.querySelectorAll('.applied-filters').forEach(appliedFilters => appliedFilters.parentNode.removeChild(appliedFilters) )

    for (const [key, value] of Object.entries(filterParams)) {
        let category
        switch(key) {
            case 'projectStatus':
                category = 'Status'
                break
            case 'practiceAreas':
                category = 'Practice'
                break
            case 'projectTools':
                category = 'Tools'
                break
            case 'projectSource':
                category = 'Source'
                break
            case 'projectContributors':
                category = 'Contributor'
                break
        }
        value.forEach(item => {
            document.querySelector('.filter-tag-container').insertAdjacentHTML('afterbegin', filterTagComponent(category, item.split('+').join(' ')))
        })
    }

    if (document.querySelectorAll('.filter-tag').length > 0) {
        document.querySelector('.filter-tag-container').insertAdjacentHTML('afterbegin', `<h4 class="applied-filters">Applied Filters</h4>`)
    } else {
        document.querySelector('.clear-filter-tags') && document.querySelector('.clear-filter-tags').remove()
    }
}

// Apply event listener to applied filters buttons
function attachEventListenerToFilterTags(filterParams) {
    if(document.querySelectorAll('.filter-tag').length > 0){
        document.querySelectorAll('.filter-tag').forEach(button => {
            button.addEventListener('click', function(event) {
                let category = event.target.innerText.split(':')[0]
                let filter = event.target.innerText.split(':')[1].trim().split(' ').join('+')
                switch(category) {
                    case 'Status':
                        category = 'projectStatus'
                        break
                    case 'Practice':
                        category = 'practiceAreas'
                        break
                    case 'Tools':
                        category = 'projectTools'
                        break
                    case 'Source':
                        category = 'projectSource'
                        break
                    case 'Contributor':
                        category = 'projectContributors'
                        break
                }
                filterParams[category] = [...filterParams[category].filter(item => item.toLowerCase() !== filter.toLowerCase())]
                applyFilters(filterParams)

                // Update checkboxes
                updateCheckBoxState(filterParams)
            })
        })

        // If there exist a filter-tag button on the page add a clear all button after the last filter tag button
        if(!document.querySelector('.clear-filter-tags')){
            document.querySelector('.filter-tag:last-of-type').insertAdjacentHTML('afterend',`<a class="clear-filter-tags" tabindex="0" aria-label="Clear All Filters" style="white-space: nowrap;">Clear All</a>`);

            //Attach an event handler to the clear all button
            document.querySelector('.clear-filter-tags').addEventListener('click',function () {
                window.history.replaceState(null, '', '/toolkit')
                for (let key in filterParams) {
                    filterParams[key] = []
                }
                applyFilters(filterParams)
                updateCheckBoxState(filterParams)
                document.querySelector('.clear-filter-tags') && document.querySelector('.clear-filter-tags').remove()
            });
        }
    }
}

// Converts current filters to URL string
function applyFiltersToURL(filterParams) {
    let filters = ''
    for (let key in filterParams) {
        if (filterParams[key].length) {
            filters = filters + `${key}=${filterParams[key].join(',')}&`
        }
    }
    // Remove extra &
    if (filters) {
        filters = filters.slice(0, filters.length - 1)
    }
    window.history.replaceState(null, '', `?${filters}`)
}

// Update checkboxes based on current filters
function updateCheckBoxState(filterParams) {
    for (key in filterParams) {
        const activeFilters = filterParams[key]
        document.querySelectorAll(".filter-checkbox").forEach(filter => {
            if (filter.name === key) {
                let filterCheck = filter.id
                if (filter.id.split(' ').length > 0) {
                    filterCheck = filter.id.split(' ').join('+')
                }
                if (activeFilters.includes(filterCheck)) {
                    filter.checked = !filter.checked
                } else {
                    filter.checked = false
                }
            }
        })
    }
}